#!/usr/bin/env bash
#
# 在云服务器上部署 Remark42 评论后端（不装 Docker，二进制 + systemd）：
#   /usr/local/bin/remark42   官方二进制
#   /etc/remark42.env         配置（首次安装自动生成 SECRET）
#   /opt/remark42/var         评论数据（bolt db）+ 自动备份
#   systemd 服务 remark42，只监听 127.0.0.1:8080
#   对外经 Cloudflare Tunnel: comments.rayepeng.net -> 127.0.0.1:8080
#
# 用法（在服务器上，root 执行）：
#   sudo bash deploy/setup-remark42.sh
#
# 可覆盖变量：
#   REMARK_URL=https://comments.rayepeng.net SITE=blog sudo -E bash deploy/setup-remark42.sh

set -euo pipefail

REMARK_URL="${REMARK_URL:-https://comments.rayepeng.net}"
SITE="${SITE:-blog}"
LISTEN="${LISTEN:-127.0.0.1:8080}"
REMARK_DIR=/opt/remark42
SERVICE_USER="${SERVICE_USER:-remark42}"
DOWNLOAD_URL="${DOWNLOAD_URL:-https://github.com/umputun/remark42/releases/latest/download/remark42.linux-amd64.tar.gz}"

info() { printf '\n\033[36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m[!] %s\033[0m\n' "$*"; }
die() { printf '\033[31m[x] %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "请用 root 运行：sudo bash deploy/setup-remark42.sh"

ARCH="$(uname -m)"
case "$ARCH" in
  x86_64) BIN_NAME=remark42.linux-amd64 ;;
  aarch64) BIN_NAME=remark42.linux-arm64 ;;
  *) die "不支持的架构: $ARCH" ;;
esac

# ── 1. 运行用户 ─────────────────────────────────────────────────────────
info "1/5 准备运行用户 $SERVICE_USER"
if ! id "$SERVICE_USER" >/dev/null 2>&1; then
  useradd --system --home-dir "$REMARK_DIR" --shell /usr/sbin/nologin "$SERVICE_USER"
fi

# ── 2. 二进制 ───────────────────────────────────────────────────────────
info "2/5 下载并安装 Remark42 二进制"
TMP=$(mktemp -d)
curl -fsSL --retry 3 -o "$TMP/remark42.tar.gz" "$DOWNLOAD_URL" \
  || die "下载失败：$DOWNLOAD_URL"
tar -xzf "$TMP/remark42.tar.gz" -C "$TMP"
[ -f "$TMP/$BIN_NAME" ] || die "压缩包里没找到 $BIN_NAME"
install -m 0755 "$TMP/$BIN_NAME" /usr/local/bin/remark42
rm -rf "$TMP"
remark42 --help 2>&1 | head -1 || true

# ── 3. 数据目录 ─────────────────────────────────────────────────────────
info "3/5 准备数据目录 $REMARK_DIR/var"
mkdir -p "$REMARK_DIR/var/db" "$REMARK_DIR/var/backup"
chown -R "$SERVICE_USER:$SERVICE_USER" "$REMARK_DIR"
chmod 750 "$REMARK_DIR"

# ── 4. 配置 ─────────────────────────────────────────────────────────────
info "4/5 写入 /etc/remark42.env"
if [ -f /etc/remark42.env ]; then
  warn "/etc/remark42.env 已存在，保留不覆盖（改配置直接编辑该文件）"
else
  SECRET="$(openssl rand -hex 24)"
  sed "s|__GENERATED_BY_SETUP_SCRIPT__|$SECRET|g" \
    "$(dirname "$0")/remark42.env.template" >/etc/remark42.env
  chmod 640 /etc/remark42.env
  chown root:"$SERVICE_USER" /etc/remark42.env
fi

# ── 5. systemd 服务 ─────────────────────────────────────────────────────
info "5/5 安装并启动 systemd 服务"
sed "s|__SERVICE_USER__|$SERVICE_USER|g" \
  "$(dirname "$0")/remark42.service" >/etc/systemd/system/remark42.service
systemctl daemon-reload
systemctl enable --now remark42 >/dev/null
sleep 3

if curl -fsS -o /dev/null "http://$LISTEN/web"; then
  info "Remark42 已就绪（http://$LISTEN）"
else
  die "服务没起来，看：journalctl -u remark42 -n 50 --no-pager"
fi

cat <<TIPS

────────────────────────────────────────────────────────────────
部署完成。剩下 2 步在 Cloudflare 控制台操作（一次即可）：

[1] DNS：给 comments.rayepeng.net 加一条记录，指向现有隧道
    （开启橙色云代理）。
[2] Zero Trust → Networks → Tunnels → 你现有的隧道
    → Public Hostname → 添加：
        Domain:  comments.rayepeng.net
        Service: HTTP://$LISTEN

完成后验证：
    curl -fsS https://comments.rayepeng.net/web -o /dev/null && echo OK

后续启用 GitHub / Telegram / Email 登录或设置管理员：
    sudo vim /etc/remark42.env   # 按文件内注释填凭据
    sudo systemctl restart remark42
TIPS
