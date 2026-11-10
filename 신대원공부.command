#!/bin/bash -l
# Finder에서 더블클릭하면 외장 하드의 원본으로 실행합니다.
set -eu
project_dir="$(cd -- "$(dirname -- "$0")" && pwd -P)"
exec /bin/bash "$project_dir/scripts/start-local.sh" "$@"
