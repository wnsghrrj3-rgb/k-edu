/* 논제 후보 수집기 — 주 1회(워크플로) 공공누리 기관 RSS 에서 **제목·링크만** 받아 _candidates.json 에 쌓는다.
   본문은 받지 않는다(옮기지 않으니 받을 이유도 없다). 후보 → 「케이글쓰기 이어서」 채팅에서 베프가 초등 눈높이 지문으로 새로 쓴다 → 준호 눈검수 → prompts.json live.
   실행: node kedu/write/tools/prompts_candidates.mjs   (네트워크 실패는 조용히 건너뜀 — 후보는 덤이지 정본이 아니다) */
import fs from 'node:fs';
const OUT='kedu/write/data/_candidates.json';
const FEEDS=[
  {name:'정책브리핑 정책뉴스',url:'https://www.korea.kr/rss/policy.xml',topics:['교육','환경','안전']},
  {name:'환경부 보도자료',url:'https://www.me.go.kr/home/web/board/rss.do?boardId=10525&menuId=10525',topics:['일회용품','분리배출','기후']}
];
const KID=/어린이|초등|학생|학교|급식|놀이터|통학|보호구역|일회용|분리배출|재활용|물|숲|동물|안전|스마트폰|독서|도서관/;
const prev=fs.existsSync(OUT)?JSON.parse(fs.readFileSync(OUT,'utf8')):{items:[]};
const seen=new Set(prev.items.map(i=>i.link));
const items=[...prev.items];
for(const f of FEEDS){
  try{
    const xml=await (await fetch(f.url,{signal:AbortSignal.timeout(15000)})).text();
    for(const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)){
      const g=k=>(m[1].match(new RegExp(`<${k}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${k}>`))||[])[1]?.trim();
      const title=g('title'),link=g('link'),date=g('pubDate');
      if(!title||!link||seen.has(link)||!KID.test(title))continue;
      seen.add(link);items.push({title,link,date,feed:f.name,added:new Date().toISOString().slice(0,10),used:false});
    }
  }catch(e){console.log('skip',f.name,e.message);}
}
fs.writeFileSync(OUT,JSON.stringify({_doc:'논제 후보 — 제목·링크만. 지문은 여기서 새로 쓴다(본문 옮기기 0). used:true 로 표시하면 다음 수집에서 안 지운다.',updated:new Date().toISOString().slice(0,10),items:items.slice(-200)},null,1));
console.log('candidates',items.length);
