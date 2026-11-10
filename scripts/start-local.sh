#!/bin/bash
set -eu

fail() {
  printf '\n%s\n' "$1" >&2
  if [ -t 0 ]; then read -r -p '엔터를 누르면 종료합니다. ' answer; fi
  exit 1
}

project_dir="$(cd -- "$(dirname -- "$0")/.." && pwd -P)"
case "$project_dir" in
  /Volumes/KIOXIA/*)
    mounted_volumes="$(/sbin/mount)"
    [[ "$mounted_volumes" == *" on /Volumes/KIOXIA ("* ]] || fail 'KIOXIA 외장 하드를 연결한 뒤 다시 실행해 주세요.'
    ;;
  /media/teleop/KIOXIA/*)
    mountpoint -q /media/teleop/KIOXIA || fail 'KIOXIA 외장 하드를 연결한 뒤 다시 실행해 주세요.'
    ;;
  *) fail '이 프로젝트는 KIOXIA 외장 하드의 sindaewon-quiz 폴더에서 실행해 주세요.' ;;
esac
cd "$project_dir"

export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"
if ! command -v node >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; then
  set +u
  . "$HOME/.nvm/nvm.sh"
  set -u
fi
command -v node >/dev/null 2>&1 || fail 'Node.js가 필요합니다. Node.js 22.12 이상을 준비한 뒤 다시 실행해 주세요. 원본 파일은 외장 하드에 그대로 있습니다.'
node -e 'const [major,minor]=process.versions.node.split(".").map(Number); process.exit((major===20&&minor>=19)||(major===22&&minor>=12)||major>22?0:1)' || fail '현재 Node.js 버전으로는 실행할 수 없습니다. Node.js 22.12 이상을 사용해 주세요.'

if ! node --input-type=module -e 'await import("vite"); await import("lightningcss"); await import("rolldown")' >/dev/null 2>&1; then
  if [ "${1:-}" = '--check' ]; then fail '이 컴퓨터용 실행 구성요소를 준비해야 합니다. 신대원공부.command를 실행해 주세요.'; fi
  command -v npm >/dev/null 2>&1 || fail '실행 구성요소를 준비할 npm을 찾지 못했습니다. Node.js 설치를 확인해 주세요.'
  printf '\n이 컴퓨터에 맞는 실행 구성요소를 외장 하드에 준비합니다. 첫 실행에는 인터넷이 필요할 수 있어요.\n'
  npm ci --cache "$project_dir/.cache/npm" --no-audit --no-fund || fail '구성요소 준비에 실패했습니다. 인터넷 연결을 확인한 뒤 다시 실행해 주세요.'
fi

if [ "${1:-}" = '--check' ]; then
  printf '실행 준비 확인 완료: %s\n' "$project_dir"
  exit 0
fi

printf '\n신대원 공부를 시작합니다.\n주소: http://127.0.0.1:5173/\n소스를 수정하면 화면에 바로 반영됩니다. 종료할 때는 이 창에서 Control+C를 누르세요.\n\n'
vite_args=(--host 127.0.0.1 --port 5173 --strictPort)
if [ "$(uname -s)" = Darwin ] && [ "${SINDAEWON_NO_OPEN:-0}" != 1 ]; then vite_args+=(--open); fi
node node_modules/vite/bin/vite.js "${vite_args[@]}" || fail '앱 실행이 끝났거나 시작하지 못했습니다. 5173번 주소가 이미 열려 있다면 기존 창을 이용하거나 기존 실행 창을 종료한 뒤 다시 시작해 주세요.'
