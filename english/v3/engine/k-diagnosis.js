/* ============================================================
 * K-edu 영어 v3 — 약점 진단 (적응형 보충의 토대)
 * 2026-04-29 합의: 약점 진단은 AI 아님 = 통계. 개념 태그별 정·오답 누적 → 약한 개념 판정.
 * 핵심 원칙(베프 경고): 양산 전에 태그 표준을 박는다. 차시마다 record()만 부르면 자동 누적.
 *
 * 개념 태그 사전(네임스페이스 — 8레벨 공통):
 *   phonics.onset   첫소리(자음) 식별·변별        phonics.medial  가운데 모음
 *   phonics.coda    끝소리                          phonics.blend   통단어 합치기
 *   vocab.meaning   단어 ↔ 의미/그림 연결           vocab.sight     사이트워드
 *   grammar.<rule>  문법 규칙(lv2+)                 reading.<skill> 독해(lv3+)
 *
 * 진단 신뢰 규칙: 개념별 누적 표본 < MIN(기본 6) 이면 "약점" 판정 보류(오진 방지).
 * 저장: localStorage 단일 키. 항목 = { seen, wrong }(개념별 누적).
 * ============================================================ */
window.KDiagnosis = (function () {
  var KEY = 'kedu_en_diag';
  var MIN = 6;   // 약점 판정 최소 표본

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  return {
    /* 한 문제 결과 적립. concept = data-concept 값, ok = 정답 여부(boolean) */
    record: function (concept, ok) {
      if (!concept) return;
      var o = load();
      if (!o[concept]) o[concept] = { seen: 0, wrong: 0 };
      o[concept].seen++; if (!ok) o[concept].wrong++;
      save(o);
    },
    /* 개념별 정답률(%) 맵 — 대시보드·리포트용 */
    rates: function () {
      var o = load(), out = {};
      Object.keys(o).forEach(function (k) {
        var s = o[k]; out[k] = { seen: s.seen, wrong: s.wrong, rate: s.seen ? Math.round((s.seen - s.wrong) / s.seen * 100) : null };
      });
      return out;
    },
    /* 가장 약한 개념(표본 충분 + 정답률 최저). 없으면 null — 충분히 잘하거나 표본 부족 */
    weakest: function (threshold) {
      threshold = threshold || 70;   // 정답률 이 미만이면 보충 대상
      var o = load(), worst = null;
      Object.keys(o).forEach(function (k) {
        var s = o[k]; if (s.seen < MIN) return;
        var rate = (s.seen - s.wrong) / s.seen * 100;
        if (rate < threshold && (!worst || rate < worst.rate)) worst = { concept: k, rate: Math.round(rate), seen: s.seen };
      });
      return worst;
    },
    _reset: function () { save({}); }
  };
})();

/* 개념 태그 → 학생용 한국어 라벨(보충 안내 문구에 사용) */
window.KDiagnosis.LABEL = {
  'phonics.onset':  '첫소리 구분',
  'phonics.medial': '가운데 모음 소리',
  'phonics.coda':   '끝소리',
  'phonics.blend':  '소리 합치기',
  'vocab.meaning':  '단어 뜻',
  'vocab.sight':    '기본 단어'
};
