/**
 * 스킨 계약 v1 — 13 문서 3-1절. 시스템은 이 함수들만 부른다. 반환값을 쓰지 않는다(ui.bind 콜백 제외).
 * 스킨 오류는 잡혀서 기록되고, 3번 연속이면 proto 로 자동 전환된다(게임 시간은 계속 흐름).
 */
import type { Snapshot, MenuSnapshot } from './snapshot';
import type { SkinUI } from './ui';
export interface SkinContext {
  root: HTMLElement;                 // 스킨이 캔버스·DOM 을 붙일 곳
  quality: 'low' | 'medium' | 'high';
  text: (key: string, args?: Record<string, unknown>) => string;   // data/text/ko.json
  assetBase: string;                 // skins/<id>/assets/
  dev: boolean;
  camera: Record<string, unknown>;   // contract/camera.json (기준 자세 — 연출 오프셋만 더함)
  layout: Record<string, unknown>;   // data/layout/targets.json (읽기 전용)
  anim: Record<string, { duration?: number; in?: number; out?: number; marks?: Record<string, number> }>;   // data/anim-timing.json — 클립 재매핑용(4절, 읽기 전용) · v1 추가
}
export interface Skin {
  load(progress: (p: number) => void): Promise<void>;   // 실패해도 throw 대신 proto 대체물로
  mount(): void;
  render(snap: Snapshot | MenuSnapshot, alpha: number): void;
  onEvent(ev: { type: string; [k: string]: unknown }): void;
  resize(w: number, h: number, dpr: number): void;
  setQuality(q: 'low' | 'medium' | 'high'): void;
  ui: SkinUI;
  stats(): { drawCalls: number; triangles: number; textures: number; gpuMs?: number };
  dispose(): void;
}
export declare function createSkin(ctx: SkinContext): Skin;
export const CONTRACT = '1';
