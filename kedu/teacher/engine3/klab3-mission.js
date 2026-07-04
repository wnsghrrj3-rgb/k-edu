/* klab3-mission.js — 미션 러너 (과학실 검증본 일반화, 순수 로직·렌더러 무관)
   미션 = 데이터: { required:[ids], needs:{id:{pre:[ids],msg}}, wrong:{id:msg} } */
export function createMissionRun(M) {
  const placed = {};
  let wrongCount = 0, ready = false;

  function pick(id, freeMode) {
    if (placed[id]) return { act: 'already' };
    if (!freeMode && M.wrong && M.wrong[id]) {
      wrongCount++;
      return { act: 'wrong', msg: M.wrong[id] };
    }
    const rule = M.needs && M.needs[id];
    if (rule) {
      for (const pre of rule.pre)
        if (!placed[pre]) return { act: 'blocked', msg: rule.msg };
    }
    placed[id] = true;
    ready = M.required.every(r => placed[r]);
    return { act: 'placed', ready };
  }
  function remove(id) {
    if (!placed[id]) return false;
    if (M.needs) Object.keys(M.needs).forEach(k => {
      if (placed[k] && M.needs[k].pre.indexOf(id) >= 0) remove(k);
    });
    delete placed[id];
    ready = false;
    return true;
  }
  return {
    placed, pick, remove,
    count: () => M.required.filter(r => placed[r]).length,
    isReady: () => ready,
    wrongCount: () => wrongCount
  };
}
