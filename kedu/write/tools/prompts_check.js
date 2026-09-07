/* 지문 라이브러리 검사기 — node kedu/write/tools/prompts_check.js
   ① 필수 칸 ② 밴드·유형이 templates 와 맞나 ③ public 은 license 필수 ④ 신문·방송 이름이 source 에 들어오면 실패 ⑤ 밴드별 글자 수 안내 ⑥ 평가 낱말 0 ⑦ id 중복 0 */
const fs=require('fs'),path=require('path');
const D=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'../data',p),'utf8'));
const P=D('prompts.json'),T=D('templates.json');
let fail=0;const bad=m=>{fail++;console.log('  ✗',m);};
const ids=new Set();const press=/신문|일보|뉴스|방송|KBS|MBC|SBS|YTN|연합|헤럴드|경향|한겨레|조선|중앙|동아|출판/;
const len={low:[80,260],mid:[150,420],high:[250,600]};
for(const p of P.prompts){
  for(const k of['id','type','bands','status','updatedAt','title','topic','keywords','passage','source'])if(p[k]==null)bad(p.id+' 빈 칸 '+k);
  if(ids.has(p.id))bad('id 중복 '+p.id);ids.add(p.id);
  if(!T.types[p.type])bad(p.id+' 유형 '+p.type);
  for(const b of p.bands)if(!['low','mid','high'].includes(b))bad(p.id+' 밴드 '+b);
  if(!['draft','live'].includes(p.status))bad(p.id+' status');
  if(!['original','public'].includes(p.source.kind))bad(p.id+' source.kind');
  if(p.source.kind==='public'&&!p.source.license)bad(p.id+' public 인데 license 없음');
  if(press.test(p.source.name||''))bad(p.id+' 신문·방송 출처 — 본문 옮기기 금지');
  if(!p.keywords.length)bad(p.id+' 핵심 낱말 0');
  const n=p.passage.replace(/\s+/g,'').length;const r=len[p.bands[0]];
  if(n<r[0]||n>r[1]*1.4)bad(p.id+' 글자 '+n+' (밴드 '+p.bands[0]+' 안내 '+r+')');
  if(/틀렸|부족|미흡|점수|등급/.test(p.passage+p.topic))bad(p.id+' 평가 낱말');
  if(!p.keywords.some(k=>p.passage.includes(k)||p.topic.includes(k)))bad(p.id+' 핵심 낱말이 지문·논제에 없음');
}
const live=P.prompts.filter(p=>p.status==='live').length;
console.log(`prompts_check: ${P.prompts.length}편 (live ${live}) · ${fail} fail`);
process.exit(fail?1:0);
