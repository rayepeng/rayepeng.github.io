#!/usr/bin/env bash
#
# 在云服务器上一次性部署「写作后台」：
#   decap-server  写文件 + git commit + push
#   nginx         提供后台页面，并把 /api/v1 反代到 decap-server
#   cloudflared   把后台挂到 write.rayepeng.net（前面加 Cloudflare Access 登录）
#
# 用法（在服务器上，root 执行）：
#   sudo bash deploy/setup-server.sh
#
# 可覆盖变量：
#   DOMAIN=write.rayepeng.net REPO_DIR=/var/www/blog sudo -E bash deploy/setup-server.sh

set -euo pipefail

DOMAIN="${DOMAIN:-write.rayepeng.net}"
REPO_DIR="${REPO_DIR:-/var/www/blog}"
REPO_URL="${REPO_URL:-git@github.com:rayepeng/rayepeng.github.io.git}"
SERVICE_USER="${SERVICE_USER:-${SUDO_USER:-$(id -un)}}"
DECAP_DIR=/opt/decap
DECAP_PORT=8081

info() { printf '\n\033[36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m[!] %s\033[0m\n' "$*"; }
die() { printf '\033[31m[x] %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "请用 root 运行：sudo bash deploy/setup-server.sh"
id "$SERVICE_USER" >/dev/null 2>&1 || die "用户 $SERVICE_USER 不存在，用 SERVICE_USER=xxx 指定"

# ── 1. 系统依赖 ──────────────────────────────────────────────────────────
info "1/9 安装系统依赖"
if command -v apt-get >/dev/null 2>&1; then
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq git nginx curl ca-certificates gnupg lsb-release
elif command -v dnf >/dev/null 2>&1; then
  dnf install -y -q git nginx curl ca-certificates
elif command -v yum >/dev/null 2>&1; then
  yum install -y -q git nginx curl ca-certificates
else
  die "不认识的包管理器，请手动安装 git / nginx / curl"
fi

# ── 2. Node.js ──────────────────────────────────────────────────────────
info "2/9 检查 Node.js"
need_node=1
if command -v node >/dev/null 2>&1; then
  [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 18 ] && need_node=0
fi
if [ "$need_node" -eq 1 ]; then
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nodejs
  else
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y -q nodejs
  fi
fi
node -v

# ── 3. 代码仓库 ─────────────────────────────────────────────────────────
info "3/9 准备仓库 $REPO_DIR"
if [ -d "$REPO_DIR/.git" ]; then
  warn "仓库已存在，跳过 clone"
else
  git clone "$REPO_URL" "$REPO_DIR" || die "clone 失败。先在服务器上配好 Deploy Key：
  ssh-keygen -t ed25519 -C blog-admin -f /root/.ssh/id_ed25519 -N ''
  cat /root/.ssh/id_ed25519.pub
  → 贴到 GitHub 仓库 Settings → Deploy keys，务必勾选 Allow write access
  然后重跑本脚本。"
fi
chown -R "$SERVICE_USER:$SERVICE_USER" "$REPO_DIR"
chmod 755 "$(dirname "$REPO_DIR")" "$REPO_DIR"

info "验证 git 推送权限"
if sudo -u "$SERVICE_USER" git -C "$REPO_DIR" push --dry-run >/dev/null 2>&1; then
  info "推送权限正常"
else
  warn "push --dry-run 失败，发布时会推不上去，先确认 Deploy Key 有写权限"
fi

sudo -u "$SERVICE_USER" git -C "$REPO_DIR" config user.email "blog-admin@$DOMAIN"
sudo -u "$SERVICE_USER" git -C "$REPO_DIR" config user.name "Blog Admin"

# ── 4. 自动推送钩子 ─────────────────────────────────────────────────────
info "4/9 启用 post-commit 自动推送"
chmod +x "$REPO_DIR/scripts/git-hooks/post-commit"
sudo -u "$SERVICE_USER" git -C "$REPO_DIR" config core.hooksPath scripts/git-hooks

# ── 5. decap-server ─────────────────────────────────────────────────────
info "5/9 安装 decap-server 到 $DECAP_DIR"
mkdir -p "$DECAP_DIR"
if [ ! -f "$DECAP_DIR/package.json" ]; then
  (cd "$DECAP_DIR" && npm init -y >/dev/null)
fi
(cd "$DECAP_DIR" && npm install --no-audit --no-fund --silent decap-server@3)
[ -x "$DECAP_DIR/node_modules/.bin/decap-server" ] || die "decap-server 安装失败"
chmod -R a+rX "$DECAP_DIR"

# ── 6. 环境变量 ─────────────────────────────────────────────────────────
info "6/9 写入 /etc/decap-server.env"
cat >/etc/decap-server.env <<EOF
# decap-server 运行参数（改完记得 systemctl restart decap-server）
MODE=git
PORT=$DECAP_PORT
# 只监听本机，外部只能通过 nginx / Cloudflare Tunnel 进来
BIND_HOST=127.0.0.1
GIT_REPO_DIRECTORY=$REPO_DIR
ORIGIN=https://$DOMAIN
LOG_LEVEL=info
EOF
chmod 644 /etc/decap-server.env

# ── 7. systemd 服务 ─────────────────────────────────────────────────────
info "7/9 安装 systemd 服务"
sed "s|__SERVICE_USER__|$SERVICE_USER|g; s|__REPO_DIR__|$REPO_DIR|g" \
  "$REPO_DIR/deploy/decap-server.service" >/etc/systemd/system/decap-server.service
systemctl daemon-reload
systemctl enable --now decap-server >/dev/null
sleep 2

if curl -fsS -o /dev/null -X POST "http://127.0.0.1:$DECAP_PORT/api/v1" \
  -H 'Content-Type: application/json' -d '{"action":"info","params":{}}'; then
  info "decap-server 已就绪（127.0.0.1:$DECAP_PORT）"
else
  die "decap-server 没起来，看：journalctl -u decap-server -n 50 --no-pager"
fi

# ── 8. nginx ────────────────────────────────────────────────────────────
info "8/9 配置 nginx"
sed "s|__DOMAIN__|$DOMAIN|g; s|__REPO_DIR__|$REPO_DIR|g" \
  "$REPO_DIR/deploy/nginx-blog-admin.conf" >/etc/nginx/conf.d/blog-admin.conf
nginx -t
systemctl enable --now nginx >/dev/null
systemctl reload nginx
info "nginx 已加载 blog-admin.conf"

# ── 9. cloudflared ──────────────────────────────────────────────────────
info "9/9 安装 cloudflared"
if ! command -v cloudflared >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1; then
    mkdir -p /usr/share/keyrings
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg -o /usr/share/keyrings/cloudflare-main.gpg
    echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" \
      >/etc/apt/sources.list.d/cloudflared.list
    apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get install -y -qq cloudflared
  else
    curl -fsSL -o /usr/local/bin/cloudflared \
      https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
    chmod +x /usr/local/bin/cloudflared
  fi
fi
cloudflared --version

cat <<TIPS

────────────────────────────────────────────────────────────────
自动部分完成。剩下 4 步需要你在浏览器里操作：

[1] 授权 Cloudflare 账号，建隧道（会打印一个 URL，浏览器打开点 Authorize）
      cloudflared tunnel login
      cloudflared tunnel create blog-admin
      cloudflared tunnel route dns blog-admin $DOMAIN

[2] 写隧道配置（把 UUID 换成上一步输出的那个）
      mkdir -p ~/.cloudflared
      cp $REPO_DIR/deploy/cloudflared-config.yml ~/.cloudflared/config.yml
      sed -i "s|REPLACE-WITH-TUNNEL-UUID|实际的UUID|" ~/.cloudflared/config.yml

[3] 装成系统服务并启动
      cloudflared service install
      systemctl enable --now cloudflared
      systemctl status cloudflared --no-pager

    备选（比上面省事，推荐）：完全用控制台管理隧道，服务器上不需要浏览器授权
      a. 控制台 Zero Trust → Networks → Tunnels → Create a tunnel → 选 Cloudflared
      b. 复制它给出的 token，在服务器执行：
           cloudflared service install <TOKEN>
           systemctl enable --now cloudflared
      c. 回到控制台该隧道 → Public Hostname → 添加
           Domain: $DOMAIN    Service: HTTP://127.0.0.1:80
      这样就不需要 [1] [2] 两步，也不用管 config.yml。

[4] 到 Cloudflare Zero Trust 加登录策略（这是鉴权，别跳过）
      one.dash.cloudflare.com → Access → Applications → Add an application
      → Self-hosted
      Application domain: $DOMAIN
      Policy: Action=Allow, Include=Emails, 填你自己的邮箱
      Identity provider: One-time PIN 就够用

完成后访问 https://$DOMAIN
TIPS
