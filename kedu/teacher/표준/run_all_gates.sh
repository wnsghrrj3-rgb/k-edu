#!/bin/bash
# 케이티처 전 게이트 회귀 — k-edu 클론의 kedu/teacher/표준 에서 실행.
# 준비: mkdir -p /home/claude/.jsdom && (cd /home/claude/.jsdom && npm install jsdom)
# 회귀에는 grade3/semester1/{science,korean,math} 세 과목 본차시가 클론에 다 있어야 한다.
cd "$(dirname "$0")"
export NODE_PATH="/home/claude/.jsdom/node_modules${NODE_PATH:+:$NODE_PATH}"
P=0; F=0; BAD=""
for g in ${GATES:-gate_*.js}; do
  out=$(timeout 300 node "$g" 2>&1)
  line=$(echo "$out" | grep -E "통과 /" | tail -1)
  p=$(echo "$line" | grep -oE "[0-9]+ 통과" | grep -oE "[0-9]+"); f=$(echo "$line" | grep -oE "[0-9]+ 실패" | grep -oE "[0-9]+")
  [ -z "$p" ] && { p=0; f=1; line="(실행 실패) $(echo "$out" | grep -m1 -E "Error|error" )"; }
  P=$((P+p)); F=$((F+f)); [ "$f" != "0" ] && BAD="$BAD $g"
  printf "%-28s %s\n" "$g" "$line"
done
echo "──── 합계: $P 통과 / $F 실패 (게이트 $(ls gate_*.js | wc -l)개)"
[ -n "$BAD" ] && echo "실패 게이트:$BAD" && exit 1
exit 0
