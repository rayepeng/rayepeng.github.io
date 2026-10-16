#!/usr/bin/env bash
#
# 在云服务器上部署「微信读书数据同步」后端：
#   /etc/weread.env                   API Key（600，只有 root 可读）
#   weread-sync.service / .timer      每天拉一次数据，有变化才提交
#   提交后由 git post-commit 钩子推送 → GitHub Actions 重建 → /reading 页面刷新
#
# 前置：已经跑过 deploy/setup-server.sh（仓库、Node、git 推送钩子都就绪）。
#
# 用法（在服务器上，root 执行）：
#   sudo WEREAD_API_KEY=wrk-xxxxxxxx bash deploy/setup-weread.sh
# 不传环境变量时会交互式提示输入。

set -euo pipefail

REPO_DIR="${REPO_DIR:-/var/www/blog}"
SERVICE_USER="${SERVICE_USER:-${SUDO_USER:-$(id -un)}}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

info() { printf '\n\033[36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m[!] %s\033[0m\n' "$*"; }
die() { printf '\033[31m[x] %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "请用 root 运行：sudo bash deploy/setup-weread.sh"

# ── 1. 前置检查 ─────────────────────────────────────────────────────────
info "1/5 检查环境"
[ -d "$REPO_DIR/.git" ] || die "找不到仓库 $REPO_DIR，先跑 deploy/setup-server.sh"
id "$SERVICE_USER" >/dev/null 2>&1 || die "用户 $SERVICE_USER 不存在，用 SERVICE_USER=xxx 指定"
command -v node >/dev/null 2>&1 || die "找不到 node，先跑 deploy/setup-server.sh 安装"
[ -f "$REPO_DIR/scripts/fetch-weread.mjs" ] || die "找不到 scripts/fetch-weread.mjs"
node -v

# ── 2. API Key ──────────────────────────────────────────────────────────
info "2/5 写入 /etc/weread.env"
if [ -f /etc/weread.env ] && [ -z "${WEREAD_API_KEY:-}" ]; then
  warn "/etc/weread.env 已存在且未传 WEREAD_API_KEY，保留原文件不覆盖"
else
  if [ -z "${WEREAD_API_KEY:-}" ]; then
    printf '请输入微信读书 API Key（wrk-xxxxxxxx，输入不回显）：'
    read -rs WEREAD_API_KEY
    printf '\n'
  fi
  [ -n "$WEREAD_API_KEY" ] || die "API Key 不能为空"
  case "$WEREAD_API_KEY" in
    wrk-*) ;;
    *) die "API Key 格式不对，应以 wrk- 开头" ;;
  esac
  sed "s|__FILLED_BY_SETUP_SCRIPT__|$WEREAD_API_KEY|g" \
    "$SCRIPT_DIR/weread.env.template" >/etc/weread.env
  chmod 600 /etc/weread.env
  chown root:root /etc/weread.env
fi

# ── 3. 先手动跑一次，确认能拿到数据 ──────────────────────────────────────
info "3/5 试跑一次数据同步（以 $SERVICE_USER 身份）"
set -a
# shellcheck disable=SC1091
. /etc/weread.env
set +a
if sudo -u "$SERVICE_USER" env WEREAD_API_KEY="$WEREAD_API_KEY" \
  node "$REPO_DIR/scripts/fetch-weread.mjs"; then
  info "数据拉取正常"
else
  die "数据拉取失败，检查 API Key 是否有效、服务器能否访问 i.weread.qq.com"
fi

# ── 4. 安装 systemd 服务与定时器 ────────────────────────────────────────
info "4/5 安装 weread-sync.service / .timer"
sed "s|__SERVICE_USER__|$SERVICE_USER|g; s|__REPO_DIR__|$REPO_DIR|g" \
  "$SCRIPT_DIR/weread-sync.service" >/etc/systemd/system/weread-sync.service
cp "$SCRIPT_DIR/weread-sync.timer" /etc/systemd/system/weread-sync.timer
systemctl daemon-reload
systemctl enable --now weread-sync.timer >/dev/null
systemctl list-timers weread-sync.timer --no-pager || true

# ── 5. 收尾 ─────────────────────────────────────────────────────────────
info "5/5 完成"
cat <<TIPS

────────────────────────────────────────────────────────────────
定时同步已启用。接下来：

[1] 确认 git 自动推送钩子已开（setup-server.sh 会做，没做的话执行）：
      sudo -u $SERVICE_USER git -C $REPO_DIR config core.hooksPath scripts/git-hooks

[2] 手动触发一次完整流程（拉数据 → 提交 → 推送）：
      sudo systemctl start weread-sync
      journalctl -u weread-sync -n 50 --no-pager

[3] 查看下次运行时间：
      systemctl list-timers weread-sync.timer

之后每次数据变化都会自动产生一次 commit 并推送，GitHub Actions 重建后
https://rayepeng.net/reading 即刷新。

更新 API Key（泄露或换账号时）：
      sudo vim /etc/weread.env
TIPS
