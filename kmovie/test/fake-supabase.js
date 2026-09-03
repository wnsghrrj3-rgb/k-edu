/* 테스트용 가짜 supabase-js — kmovie_projects 표 하나를 메모리에 두고 store.js 가 쓰는 호출만 흉내낸다.
   window.__fakeDb.rows 를 테스트가 직접 만져 "다른 기기가 저장했다"를 흉내낼 수 있다. 로그인은 항상 있음(uid 'u1'). */
(function () {
  const rows = new Map();                      // id → row {id,user_id,name,doc,dur_sec,clips,updated_at(iso)}
  for (const r of (window.__seedRows || [])) rows.set(r.id, r);   // 테스트가 새로고침 전에 심어 둔 "계정" 내용
  const log = [];
  const session = { user: { id: 'u1' }, access_token: 'tok' };
  const cmp = (a, op, b) => { const x = typeof a === 'string' && /^\d{4}-/.test(a) ? Date.parse(a) : a, y = typeof b === 'string' && /^\d{4}-/.test(b) ? Date.parse(b) : b; return op === 'eq' ? x === y : op === 'lte' ? x <= y : op === 'gte' ? x >= y : false; };
  function table() {
    const q = { op: 'select', filters: [], order: null, single: false, payload: null, cols: '*' };
    const b = {
      select(c) { if (q.op === 'select') q.cols = c || '*'; q.ret = true; return b; },
      insert(row) { q.op = 'insert'; q.payload = row; return b; },
      update(row) { q.op = 'update'; q.payload = row; return b; },
      upsert(row) { q.op = 'upsert'; q.payload = row; return b; },
      delete() { q.op = 'delete'; return b; },
      eq(k, v) { q.filters.push([k, 'eq', v]); return b; },
      lte(k, v) { q.filters.push([k, 'lte', v]); return b; },
      order(k, o) { q.order = [k, o && o.ascending]; return b; },
      maybeSingle() { q.single = true; return b; },
      then(res, rej) { return Promise.resolve(run()).then(res, rej); },
    };
    function match(r) { return q.filters.every(([k, op, v]) => cmp(r[k], op, v)); }
    function run() {
      log.push(q.op + ' ' + JSON.stringify(q.filters));
      if (q.op === 'select') {
        let data = [...rows.values()].filter(match).map(r => Object.assign({}, r));
        if (q.order) data.sort((a, b2) => (q.order[1] ? 1 : -1) * (Date.parse(a[q.order[0]]) - Date.parse(b2[q.order[0]])));
        return { data: q.single ? (data[0] || null) : data, error: null };
      }
      if (q.op === 'insert') { const r = Object.assign({ created_at: new Date().toISOString() }, q.payload); if (rows.has(r.id)) return { data: null, error: { message: 'duplicate key' } }; rows.set(r.id, r); return { data: [r], error: null }; }
      if (q.op === 'upsert') { const r = Object.assign({}, rows.get(q.payload.id) || {}, q.payload); rows.set(r.id, r); return { data: [r], error: null }; }
      if (q.op === 'update') { const hit = [...rows.values()].filter(match); hit.forEach(r => Object.assign(r, q.payload)); return { data: q.ret ? hit.map(r => Object.assign({}, r)) : null, error: null }; }
      if (q.op === 'delete') { const hit = [...rows.values()].filter(match); hit.forEach(r => rows.delete(r.id)); return { data: null, error: null }; }
      return { data: null, error: { message: 'unknown' } };
    }
    return b;
  }
  window.__fakeDb = { rows, log, session };
  window.supabase = {
    createClient(url, key) {
      return { supabaseUrl: url, supabaseKey: key, from: () => table(), auth: { getSession: async () => ({ data: { session: window.__fakeDb.session } }), onAuthStateChange() {} } };
    },
  };
})();
