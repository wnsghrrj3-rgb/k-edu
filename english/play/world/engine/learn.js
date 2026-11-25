/* 공통 엔진 · 배움의 흔적 — 놀이에서 아이가 만난 낱말을 적어 둔다.
 * 저장은 옛 영어 놀이터와 같은 자리(PlayEvidence → 기기의 저장소)이고, 계정별로 나뉘며 동의 전에는 이 화면 동안만 남는다(/kedu_scope.js).
 * 서버로는 보내지 않는다. 자유 놀이에서 「들었다 · 해 봤다」는 이해의 증거가 아니므로 결과를 'attempted'(겪어 봄)로만 적는다.
 * 같은 낱말 · 같은 구실은 하루에 한 번만 적는다(옛 기록을 밀어내지 않게). */
import { AUTO } from './stage.js';

const today = () => { const d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
/** zone = 구역 이름('world-lab'), cell = 활동 번호('L1-3-1'). note(낱말, { skill:'listen'|'move', input:'touch'|'drag'|'cam', outcome, game }) */
export function createLearn({ zone, cell }) {
  const done = new Set(), log = [];
  function note(word, o = {}) {
    const id = String(word).toLowerCase(), skill = o.skill || 'listen', outcome = o.outcome || 'attempted', key = id + '|' + skill + '|' + outcome;
    log.push(key); if (done.has(key)) return; done.add(key);
    const PE = window.PlayEvidence; if (!PE || AUTO) return;
    try {
      const day = today(); if (PE.all().some(e => e.targetId === id && e.cell === cell && e.day === day && e.skill === skill && e.outcome === outcome)) return;
      PE.record({ zone, cell, game: o.game || '' }, [{ targetId: id, skill, outcome, inputMode: o.input || 'touch', speechStatus: 'not_used', attempts: 1, unit: 'word' }]);
    } catch (_) {}
  }
  /** 그 낱말을 이 화면에서 겪은 횟수(+ 기기에 남은 지난 기록). 부탁은 두 번 넘게 겪은 낱말로만 한다. */
  function count(word) { const id = String(word).toLowerCase(); let n = log.filter(k => k.startsWith(id + '|')).length; try { const PE = window.PlayEvidence; if (PE && !AUTO) n += PE.all().filter(e => e.targetId === id && e.cell === cell).length; } catch (_) {} return n; }
  return { note, log, count };
}
