#!/usr/bin/env bash
#
# 微信读书数据同步（后端定时任务的实际执行体）：
#   1. 调微信读书 gateway 拉取阅读统计，写入 src/data/weread.json
#   2. 数据有变化才提交；提交后由 post-commit 钩子自动推送
#   3. 推送触发 GitHub Actions 重新构建，read 页面随之更新
#
# 由 systemd 定时器 weread-sync.timer 调用，也可手动执行：
#   sudo systemctl start weread-sync
#   sudo -u <repo用户> bash deploy/weread-sync.sh

set -euo pipefail

REPO_DIR="${REPO_DIR:-/var/www/blog}"
DATA_FILE="src/data/weread.json"

info() { printf '\n\033[36m==> %s\033[0m\n' "$*"; }
die() { printf '\033[31m[x] %s\033[0m\n' "$*" >&2; exit 1; }

[ -d "$REPO_DIR/.git" ] || die "找不到仓库 $REPO_DIR（用 REPO_DIR=... 指定）"
[ -n "${WEREAD_API_KEY:-}" ] || die "缺少 WEREAD_API_KEY（应来自 /etc/weread.env）"

cd "$REPO_DIR"

# ── 1. 拉数据 ───────────────────────────────────────────────────────────
info "拉取微信读书数据"
node scripts/fetch-weread.mjs

# ── 2. 无变化则结束 ─────────────────────────────────────────────────────
if git diff --quiet -- "$DATA_FILE"; then
  info "数据无变化，跳过提交"
  exit 0
fi

# ── 3. 提交（post-commit 钩子负责 push）─────────────────────────────────
info "提交数据变更"
git add "$DATA_FILE"

if ! git diff --cached --quiet; then
  git commit -m "chore(weread): sync reading data $(date +%F)"
  info "已提交，post-commit 钩子会推送并触发部署"
else
  info "暂存区无变化，跳过提交"
fi
