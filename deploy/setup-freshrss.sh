#!/usr/bin/env bash
#
# 在云服务器上用 Docker 部署 FreshRSS（自托管 RSS 阅读器）：
#   Docker          docker compose 跑官方镜像 freshrss/freshrss
#   /opt/freshrss   compose 文件 + 数据目录（data / extensions）
#   容器只监听 127.0.0.1:8082，对外经现有 Cloudflare Tunnel
#   rss.rayepeng.net -> http://127.0.0.1:8082
#
# 用法（在服务器上，root 执行）：
#   sudo bash deploy/setup-freshrss.sh
#
# 可覆盖变量：
#   DOMAIN=rss.rayepeng.net PORT=8082 VERSION=1.30.1 sudo -E bash deploy/setup-freshrss.sh

set -euo pipefail

DOMAIN="${DOMAIN:-rss.rayepeng.net}"
PORT="${PORT:-8082}"
VERSION="${VERSION:-1.30.1}"
TZ_NAME="${TZ_NAME:-Asia/Shanghai}"
CRON_MIN="${CRON_MIN:-13,43}"
FRESH_DIR=/opt/freshrss
REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
COMPOSE_SRC="$REPO_DIR/deploy/freshrss/docker-compose.yml"

info() { printf '\n\033[36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m[!] %s\033[0m\n' "$*"; }
die() { printf '\033[31m[x] %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "请用 root 运行：sudo bash deploy/setup-freshrss.sh"
[ -f "$COMPOSE_SRC" ] || die "找不到 $COMPOSE_SRC（请在仓库里执行本脚本）"

# ── 1. 安装 Docker ──────────────────────────────────────────────────────
info "1/6 检查 Docker"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  info "Docker 已就绪：$(docker --version)"
else
  info "安装 Docker（官方 apt 源）"
  if command -v apt-get >/dev/null 2>&1; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
      >/etc/apt/sources.list.d/docker.list
    apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
      docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  else
    # 非 apt 系统走官方一键脚本（dnf/yum 等）
    curl -fsSL https://get.docker.com | sh
  fi
  systemctl enable --now docker >/dev/null
fi
docker compose version

# ── 2. 数据目录 ─────────────────────────────────────────────────────────
info "2/6 准备数据目录 $FRESH_DIR"
mkdir -p "$FRESH_DIR/data" "$FRESH_DIR/extensions"
# 官方镜像是 Debian 基础镜像，容器内跑 www-data（uid=33）。
# 用 bind mount 时必须把宿主机目录的属主改成 33，否则安装向导写不进 config.php。
chown -R 33:33 "$FRESH_DIR/data" "$FRESH_DIR/extensions"
chmod 750 "$FRESH_DIR/data"

# ── 3. 生成 compose 与 .env ─────────────────────────────────────────────
info "3/6 写入 compose 配置"
cp "$COMPOSE_SRC" "$FRESH_DIR/docker-compose.yml"
if [ -f "$FRESH_DIR/.env" ]; then
  warn "$FRESH_DIR/.env 已存在，保留不覆盖（改端口/版本直接编辑该文件）"
else
  cat >"$FRESH_DIR/.env" <<EOF
# FreshRSS 部署参数（改完执行：docker compose up -d）
FRESHRSS_VERSION=$VERSION
FRESHRSS_PORT=$PORT
FRESHRSS_DATA=$FRESH_DIR/data
FRESHRSS_EXT=$FRESH_DIR/extensions
TZ=$TZ_NAME
CRON_MIN=$CRON_MIN
EOF
  chmod 600 "$FRESH_DIR/.env"
fi

# ── 4. 启动容器 ─────────────────────────────────────────────────────────
info "4/6 拉取镜像并启动"
(cd "$FRESH_DIR" && docker compose pull -q && docker compose up -d)

# ── 5. 等待就绪 ─────────────────────────────────────────────────────────
info "5/6 等待服务就绪"
ok=0
for i in $(seq 1 30); do
  code="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || true)"
  case "$code" in
    200|301|302) ok=1; break ;;
  esac
  sleep 2
done
if [ "$ok" -eq 1 ]; then
  info "FreshRSS 已就绪（http://127.0.0.1:$PORT，HTTP $code）"
else
  warn "还没起来，看日志：cd $FRESH_DIR && docker compose logs --tail=50 freshrss"
fi

# ── 6. 收尾提示 ─────────────────────────────────────────────────────────
cat <<TIPS

────────────────────────────────────────────────────────────────
Docker 部分完成。剩下在 Cloudflare 控制台操作（一次即可）：

[1] Zero Trust → Networks → Tunnels → 你现有的隧道
    → Public Hostname → Add a public hostname：
        Subdomain:  rss
        Domain:     rayepeng.net
        Service:    HTTP
        URL:        127.0.0.1:$PORT
    （保存后 Cloudflare 会自动建好 rss.rayepeng.net 的 DNS 记录，不用手动加）

[2] FreshRSS 自带登录，不需要再加 Cloudflare Access。
    如果想再套一层（比如只允许自己邮箱访问），可以照 comments 的做法加 Access 策略。

验证：
    curl -fsSI https://$DOMAIN/ | head -1

首次使用：
    a. 浏览器打开 https://$DOMAIN/ ，按向导建管理员账号（默认 SQLite，无需额外数据库）
    b. 登录后在「订阅管理 → 添加订阅源」填博客自己的 RSS：https://rayepeng.net/feed.xml

日常维护（在 $FRESH_DIR 下）：
    docker compose ps / logs -f freshrss      # 状态 / 日志
    docker compose pull && docker compose up -d   # 升级（改 .env 里的 FRESHRSS_VERSION 后）
    备份：tar czf freshrss-\$(date +%F).tgz -C $FRESH_DIR data
TIPS
