/**
 * UI 계약 v1 — 13 문서 3-4절. 버튼을 어디에 두든·몇 개로 나누든 자유. action id 와 model 필드 이름만 지킨다.
 * 마우스·터치 클릭 → bind 의 action. 손(카메라) 선택은 snapshot.targets 로만 온다(3-5절).
 */
export interface SkinUI {
  show(screenId: string, model: unknown): void;
  update(screenId: string, model: unknown): void;
  hide(screenId: string): void;
  toast(key: string, args?: Record<string, unknown>): void;
  bind(handlers: { action(id: string, payload?: Record<string, unknown>): void }): void;
}
/** 화면별 model 과 action
 * S01 시작      model { chars:['luna','tori','haru'], char, hasCal }
 *               action 'start' {mode:'camera'|'mouse'|'keyboard', char, calib:boolean}   (v1.9: 바로 판이 아니라 S04 지도로 — ?stage= 강제만 바로)
 * S04 월드 지도 snapshot.map + targets(kind 'map')                 action 'pick' {stage}(노드 클릭 — 잠긴 것도 보내면 시스템이 토스트) · 'enter'(들어가기) · 'home'  (손은 targets 로, 키보드 ←→·1~4·Enter·Esc 는 시스템이 받음, v1.9)
 * S17 보정      model snapshot.calib { step, idx, of, msg, p }      action 'calib-skip' · 'home'
 * S08 전투      (HUD 는 매 프레임 snapshot 으로)                     action 'pause' · 'attack' {zone:0|1|2}(터치로 적 누르기)
 * S08Q 문제     snapshot.question + targets                           action 'select' {slot}(마우스·터치 클릭) · 'hint'(🦉 힌트 구슬 클릭, v1.2 — 손은 targets 의 'hint' 로)
 * S08P 퍼즐     snapshot.puzzle + targets(kind 'puzzle')                action 'select' {slot}(돌 클릭, v1.5) · 크기 문은 몸 위치(키보드 ←→)라 action 없음
 * (멈춤)        snapshot.paused (+ 카메라 모드: targets kind 'menu' 자리에 구슬 — 손 유지 선택, v1.3)                                       action 'resume' · 'recalib' · 'home' · 'spell' {id}(마법 바퀴 — player.spells 중 하나, v1.1)
 * S13 클리어    snapshot.result                                       action 'again' · 'map'(지도로, v1.9) · 'home'
 * S14 다시 일어서기 snapshot.result                                   action 'again' · 'map' · 'home'
 */
export {};
