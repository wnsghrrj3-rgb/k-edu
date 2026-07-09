/* ============================================================
   케이랩 사회실 2.0 · R1 우리 동네 탐사대 — 미션 데이터
   neigh_missions.js
   ------------------------------------------------------------
   정답이 좌표가 아니라 '규칙(rule)'이므로 전국 어느 학교에서든
   같은 미션 JSON이 성립한다(양산 사상의 2.0 버전).
   채점·debrief 치환은 window.Neigh.evalRule / fillDebrief.
   설계: klab/사회실2_설계.md (R1-미션 문법).
   ============================================================ */
(function () {
  'use strict';
  var W = (typeof window !== 'undefined') ? window : this;
  var M = W.NEIGH_MISSIONS || {};

  // grade: low(저)·mid(중)·high(고) — 저학년엔 count형만 개방
  M.nm1 = {
    id: 'nm1', grade: 'low', cat: 'library', order: 1,
    q: '우리 동네(2km) 안에 도서관은 몇 곳일까?',
    predict: { options: ['없다', '1~2곳', '3곳 이상'] },
    rule: { type: 'count_in_radius', cat: 'library', radius_m: 2000, mode: 'walk' },
    debrief: '세어 보니 {n}곳! 가장 가까운 곳은 {nearest_name}(걸어서 약 {min}분).'
  };
  M.nm2 = {
    id: 'nm2', grade: 'low', cat: 'school', order: 2,
    q: '우리 학교 둘레(2km)에 다른 학교는 몇 곳일까?',
    predict: { options: ['없다', '1~3곳', '4곳 이상'] },
    rule: { type: 'count_in_radius', cat: 'school', radius_m: 2000, mode: 'walk' },
    debrief: '학교가 {n}곳이나 있었네! 제일 가까운 곳은 {nearest_name}.'
  };
  M.nm3 = {
    id: 'nm3', grade: 'mid', cat: 'hospital', order: 3,
    q: '가장 가까운 병원까지 응급차로 몇 분쯤 걸릴까?',
    predict: { options: ['5분 안', '5~10분', '10분보다 멀다'] },
    rule: { type: 'nearest_time', cat: 'hospital', mode: 'emerg' },
    debrief: '가장 가까운 {nearest_name}까지 {bearing}쪽으로 응급차 약 {min}분.'
  };
  M.nm4 = {
    id: 'nm4', grade: 'mid', cat: 'fire', order: 4,
    q: '걸어서 우체국까지 몇 분? 방향은 어느 쪽?',
    predict: { options: ['북쪽 계열', '동/서쪽', '남쪽 계열'] },
    rule: { type: 'nearest_time', cat: 'post', mode: 'walk' },
    debrief: '{nearest_name}은 {bearing}쪽! 걸어서 약 {min}분이야.'
  };
  M.nm5 = {
    id: 'nm5', grade: 'high', cat: 'fire', order: 5,
    q: '소방차 5분이 닿지 않는 동네를 찾아 지도를 눌러 봐.',
    hint: '골든타임 렌즈를 켜고, 물들지 않은 곳을 눌러요.',
    rule: { type: 'coverage_gap', cat: 'fire', limit: 5, mode: 'emerg' },
    debrief: '여기는 소방차가 약 {min}분! 5분 골든타임 밖이야 — 위험을 찾았어.'
  };
  M.nm6 = {
    id: 'nm6', grade: 'high', cat: 'fire', order: 6,
    q: '새 소방서를 놓아 5분 밖 동네를 모두 없애 봐.',
    hint: '가상 배치 모드로 소방서를 놓으면 골든타임이 다시 계산돼요.',
    rule: { type: 'place_virtual', cat: 'fire', limit: 5, mode: 'emerg', goal: { metric: 'all_reached' } },
    debrief: '남은 미달 동네 {gaps}곳 · 닿은 곳 {reached}/{total}. 배치 한 번으로 동네가 물들었어!'
  };

  W.NEIGH_MISSIONS = M;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
