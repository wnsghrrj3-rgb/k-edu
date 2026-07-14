/* ============================================================
   케이메이커 디자인 언어 정본 (L1)  — 템플릿시스템_설계_v1.md
   ------------------------------------------------------------
   언어 = 토큰의 완결 정의. 템플릿은 여기서 파생만 된다.
   scheme: bg 바탕 · ink 본문 · sub 보조 · accent 포인트 · soft 옅은면
   fonts: display 제목 · body 본문 (에디터 기탑재 22종 안에서만)
   margin: A4 기준 바깥 여백(px) — 판형별로 비례 환산
   card: 카드 스타일 · deco: 장식 문법 · photo: 사진 결 · motion: 모션 문법
   ============================================================ */
const KM_LANG = {
  modern: { name: '모던', fonts: { display: 'IBM Plex Sans KR', dw: '700', body: 'Noto Sans KR' },
    schemes: [
      { id: 'light', bg: '#FFFFFF', ink: '#191F28', sub: '#6B7684', accent: '#3182F6', soft: '#EAF2FE' },
      { id: 'deep',  bg: '#0F1420', ink: '#F2F5F9', sub: '#93A0B4', accent: '#5B8EF8', soft: '#1C2536' }],
    margin: 76, card: { rx: 18 }, deco: 'rule', photo: 'clean', motion: { in: 'fadeIn', stagger: 0.15 } },

  editorial: { name: '에디토리얼', fonts: { display: 'Nanum Myeongjo', dw: '800', body: 'Gowun Batang' },
    schemes: [
      { id: 'ivory', bg: '#FBF8F1', ink: '#2B2722', sub: '#7A7264', accent: '#8C2F1B', soft: '#F1E7D8' },
      { id: 'mono',  bg: '#FFFFFF', ink: '#1C1C1C', sub: '#6E6E6E', accent: '#1C1C1C', soft: '#EFEFEF' }],
    margin: 84, card: { rx: 0 }, deco: 'ruleline', photo: 'documentary', motion: { in: 'fadeIn', stagger: 0.2 } },

  luxury: { name: '럭셔리', fonts: { display: 'Song Myung', dw: '400', body: 'Gowun Batang' },
    schemes: [
      { id: 'plum', bg: '#221A26', ink: '#F3EDE2', sub: '#B9AC9A', accent: '#CBA35C', soft: '#33283A' },
      { id: 'noir', bg: '#15161A', ink: '#EDEAE2', sub: '#9A968C', accent: '#C9B27C', soft: '#232630' }],
    margin: 96, card: { rx: 4 }, deco: 'hairline', photo: 'lowkey', motion: { in: 'slideUp', stagger: 0.25 } },

  corporate: { name: '코퍼레이트', fonts: { display: 'Noto Sans KR', dw: '900', body: 'Noto Sans KR' },
    schemes: [
      { id: 'trust', bg: '#FFFFFF', ink: '#1B2430', sub: '#5C6B7E', accent: '#1E5AA8', soft: '#E8F0FA' },
      { id: 'slate', bg: '#F5F7FA', ink: '#212B36', sub: '#637083', accent: '#0E7C66', soft: '#E3F2EE' }],
    margin: 72, card: { rx: 10 }, deco: 'block', photo: 'clean', motion: { in: 'fadeIn', stagger: 0.12 } },

  playful: { name: '플레이풀', fonts: { display: 'Jua', dw: '400', body: 'Gowun Dodum' },
    schemes: [
      { id: 'pop',   bg: '#FFF6E8', ink: '#4A4E69', sub: '#8A8FA8', accent: '#F26D8D', soft: '#FDE4EC' },
      { id: 'candy', bg: '#F0F7FF', ink: '#3A4266', sub: '#7C86A8', accent: '#5B8EF8', soft: '#FFE9C7' }],
    margin: 64, card: { rx: 26 }, deco: 'confetti', photo: 'bright', motion: { in: 'pop', stagger: 0.12 } },

  organic: { name: '오가닉', fonts: { display: 'Gowun Batang', dw: '700', body: 'Gowun Dodum' },
    schemes: [
      { id: 'leaf', bg: '#F4F1E8', ink: '#3D4A39', sub: '#6B7A66', accent: '#7C8F5A', soft: '#E4EDE2' },
      { id: 'clay', bg: '#F6EFE7', ink: '#4A3A2E', sub: '#8A776A', accent: '#B0703C', soft: '#EFE1D2' }],
    margin: 88, card: { rx: 14 }, deco: 'organic', photo: 'natural', motion: { in: 'fadeIn', stagger: 0.22 } },

  tech: { name: '테크', fonts: { display: 'Black Han Sans', dw: '400', body: 'IBM Plex Sans KR' },
    schemes: [
      { id: 'neonB', bg: '#0B0F14', ink: '#E8F6F2', sub: '#7C8FA0', accent: '#28E0B0', soft: '#12202A' },
      { id: 'neonV', bg: '#0E0B16', ink: '#EFE9FA', sub: '#8D82AC', accent: '#9D6BFF', soft: '#1B1430' }],
    margin: 68, card: { rx: 8 }, deco: 'grid', photo: 'contrast', motion: { in: 'drop', stagger: 0.1 } },

  glass: { name: '글래스', fonts: { display: 'Noto Sans KR', dw: '700', body: 'Noto Sans KR' },
    schemes: [
      { id: 'sky',  bg: '#DCE9F7', ink: '#22344A', sub: '#5F7590', accent: '#3D7BD9', soft: 'rgba(255,255,255,.55)' },
      { id: 'rose', bg: '#F3E4EC', ink: '#45283A', sub: '#8A6B7E', accent: '#B05684', soft: 'rgba(255,255,255,.55)' }],
    margin: 72, card: { rx: 24, glass: true }, deco: 'blob', photo: 'soft', motion: { in: 'fadeIn', stagger: 0.18 } },

  paper: { name: '페이퍼', fonts: { display: 'Gowun Batang', dw: '700', body: 'Gowun Dodum' },
    schemes: [
      { id: 'kraft', bg: '#E7D9C3', ink: '#4A2F1B', sub: '#7A5A3C', accent: '#B33A2B', soft: '#F2E9DA' },
      { id: 'snow',  bg: '#FAF7F0', ink: '#33302A', sub: '#787264', accent: '#3E5C41', soft: '#EDE7D8' }],
    margin: 80, card: { rx: 6, tape: true }, deco: 'tape', photo: 'scan', motion: { in: 'stampless', stagger: 0.2 } },

  soft: { name: '소프트', fonts: { display: 'Gowun Dodum', dw: '400', body: 'Gowun Dodum' },
    schemes: [
      { id: 'peach', bg: '#FCF3EE', ink: '#5A4A48', sub: '#9A8886', accent: '#E8927C', soft: '#F9E4DC' },
      { id: 'mint',  bg: '#EFF7F4', ink: '#3E5450', sub: '#7E9690', accent: '#63B0A0', soft: '#DDF0EA' }],
    margin: 84, card: { rx: 30 }, deco: 'round', photo: 'soft', motion: { in: 'fadeIn', stagger: 0.2 } },

  bold: { name: '볼드', fonts: { display: 'Black Han Sans', dw: '400', body: 'Noto Sans KR' },
    schemes: [
      { id: 'paperR', bg: '#F5F2EA', ink: '#141414', sub: '#4A4A4A', accent: '#E4472E', soft: '#F1D9D2' },
      { id: 'inkY',   bg: '#141414', ink: '#F5F2EA', sub: '#B9B4A6', accent: '#F2C230', soft: '#2A2A22' }],
    margin: 60, card: { rx: 0 }, deco: 'block', photo: 'contrast', motion: { in: 'drop', stagger: 0.1 } },

  retro: { name: '레트로', fonts: { display: 'Do Hyeon', dw: '400', body: 'Gowun Dodum' },
    schemes: [
      { id: 'dabang', bg: '#F2E3C9', ink: '#3B3129', sub: '#7A6A55', accent: '#C2452D', soft: '#E8D3AE' },
      { id: 'cinema', bg: '#243040', ink: '#F2E3C9', sub: '#9AA6B8', accent: '#E0A32E', soft: '#33445C' }],
    margin: 70, card: { rx: 2, outline: true }, deco: 'badge', photo: 'faded', motion: { in: 'pop', stagger: 0.15 } },

  kids: { name: '키즈', fonts: { display: 'Cute Font', dw: '400', body: 'Gaegu' },
    schemes: [
      { id: 'crayon', bg: '#FFFDF5', ink: '#4A4266', sub: '#8A82A6', accent: '#FF8A3D', soft: '#FFEFD6' },
      { id: 'sky',    bg: '#F0FAFF', ink: '#33526B', sub: '#7C9AB0', accent: '#39A0E0', soft: '#DDF2FF' }],
    margin: 60, card: { rx: 28, outline: true }, deco: 'doodle', photo: 'bright', motion: { in: 'pop', stagger: 0.1 } },

  education: { name: '에듀', fonts: { display: 'Noto Sans KR', dw: '900', body: 'Noto Sans KR' },
    schemes: [
      { id: 'forest', bg: '#FFFFFF', ink: '#26303B', sub: '#5E6B7A', accent: '#2E7D5B', soft: '#E9F4EF' },
      { id: 'brick',  bg: '#F7F5EF', ink: '#2B2B26', sub: '#6E6A5E', accent: '#C7541E', soft: '#F8E8DD' }],
    margin: 72, card: { rx: 12 }, deco: 'tab', photo: 'clean', motion: { in: 'fadeIn', stagger: 0.14 } },

  minimal: { name: '미니멀', fonts: { display: 'Gowun Dodum', dw: '400', body: 'Noto Sans KR' },
    schemes: [
      { id: 'white', bg: '#FFFFFF', ink: '#222222', sub: '#8A8A8A', accent: '#222222', soft: '#F2F2F2' },
      { id: 'stone', bg: '#F4F3F1', ink: '#2E2C29', sub: '#8C8880', accent: '#6B675F', soft: '#E9E7E2' }],
    margin: 110, card: { rx: 0 }, deco: 'dot', photo: 'gallery', motion: { in: 'fadeIn', stagger: 0.3 } },
};
if (typeof window !== 'undefined') window.KM_LANG = KM_LANG;
if (typeof module !== 'undefined') module.exports = KM_LANG;
