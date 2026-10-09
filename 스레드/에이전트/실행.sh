#!/usr/bin/env bash
set -euo pipefail
agent_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd -- "$agent_dir/../.." && pwd)"
if [[ "${1:-}" == "--help" ]]; then
  echo '사용법: bash 스레드/에이전트/실행.sh [작성 요청]'
  echo 'GPT-6-Astra / high로 돈쌤 스레드 작가·게시 에이전트를 시작합니다.'
  exit 0
fi
request="${*:-스레드 글 만들어줘. 이전 글과 겹치지 않는 새 주제를 알아서 골라 마지막 신청 댓글까지 작성해줘.}"
exec codex --cd "$project_root" --model gpt-6-astra -c 'model_reasoning_effort="high"' "\$mykkachi-threads $request"
