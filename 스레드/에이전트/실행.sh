#!/usr/bin/env bash
set -euo pipefail
agent_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd -- "$agent_dir/../.." && pwd)"
if [[ "${1:-}" == "--help" ]]; then
  echo '사용법: bash 스레드/에이전트/실행.sh [작성 요청]'
  echo 'GPT-6-Astra / high로 전용 스레드 작가를 시작합니다.'
  exit 0
fi
request="${*:-오늘 만들 사주 스레드의 유형과 새 소재 선택지를 먼저 보여줘.}"
exec codex --cd "$project_root" --model gpt-6-astra -c 'model_reasoning_effort="high"' "\$mykkachi-threads $request"
