import { FLASH_BY_NO, FLASH_UNITS } from '../data/vocab-flash.js';

const KEY = 'sindaewon-quiz:vocab-flash:v1';
const blank = () => ({ unit: 0, speed: 3, marked: [], seen: [], run: null });
const validIds = value => Array.isArray(value) ? [...new Set(value.filter(no => Number.isInteger(no) && FLASH_BY_NO[no]))] : [];
const validUnit = value => Number.isInteger(value) && FLASH_UNITS[value] ? value : 0;
let memory = null;
let saveFailed = false;

export function getFlash() {
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY)); } catch { data = memory; }
  if (saveFailed) data = memory;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return blank();
  const state = { unit: validUnit(data.unit), speed: [2,3,5].includes(data.speed) ? data.speed : 3, marked: validIds(data.marked), seen: validIds(data.seen), run: null };
  const run = data.run;
  if (run && typeof run === 'object' && !Array.isArray(run)) {
    const review = run.kind === 'review';
    const unit = validUnit(run.unit);
    const ids = review ? validIds(run.ids) : FLASH_UNITS[unit].words.map(word => word.no);
    if (ids.length) {
      const viewed = validIds(run.viewed).filter(no => ids.includes(no));
      const requestedIndex = Number.isInteger(run.index) && run.index >= 0 ? Math.min(run.index,ids.length-1) : 0;
      const firstUnseen = ids.findIndex(no => !viewed.includes(no));
      const index = firstUnseen < 0 ? requestedIndex : Math.min(requestedIndex,firstUnseen);
      state.run = { kind: review ? 'review' : 'unit', unit, ids, index, phase: run.phase === 'meaning' && viewed.includes(ids[index]) ? 'meaning' : 'word', viewed, done: run.done === true && index === ids.length-1 && viewed.length === ids.length };
    }
  }
  return state;
}
function put(state) {
  memory = state;
  try { localStorage.setItem(KEY,JSON.stringify(state)); saveFailed = false; }
  catch { saveFailed = true; }
  return state;
}
export const flashSaveFailed = () => saveFailed;
export function startFlash(unit = getFlash().unit, review = false) {
  const state = getFlash();
  unit = validUnit(unit);
  const ids = review ? [...state.marked] : FLASH_UNITS[unit].words.map(word => word.no);
  if (review && !ids.length) return state;
  // Review membership is fixed for this round; unmarking a word cannot shift the current card.
  state.run = ids.length ? { kind: review ? 'review' : 'unit', unit, ids, index: 0, phase: 'word', viewed: [], done: false } : null;
  if (!review) state.unit = unit;
  return put(state);
}
export function repeatFlash() {
  const state = getFlash();
  if (!state.run) return startFlash();
  state.run = { ...state.run, index: 0, phase: 'word', viewed: [], done: false };
  return put(state);
}
export function revealFlash(expectedNo) {
  const state = getFlash(); const run = state.run;
  if (!run || run.done || run.ids[run.index] !== expectedNo || run.phase !== 'word') return false;
  run.phase = 'meaning';
  if (!run.viewed.includes(expectedNo)) run.viewed.push(expectedNo);
  if (!state.seen.includes(expectedNo)) state.seen.push(expectedNo);
  put(state); return true;
}
export function advanceFlash(expectedNo) {
  const state = getFlash(); const run = state.run;
  if (!run || run.done || run.ids[run.index] !== expectedNo || run.phase !== 'meaning') return false;
  if (run.index === run.ids.length-1) run.done = true;
  else { run.index++; run.phase = 'word'; }
  put(state); return true;
}
export function previousFlash() {
  const state = getFlash();
  if (!state.run || state.run.done || state.run.index === 0) return false;
  state.run.index--; state.run.phase = 'word'; put(state); return true;
}
export function flashSpeed(speed) { if ([2,3,5].includes(speed)) put({ ...getFlash(), speed }); }
export function markFlash(no) {
  if (!FLASH_BY_NO[no]) return false;
  const state = getFlash();
  const on = !state.marked.includes(no);
  state.marked = on ? [...state.marked,no] : state.marked.filter(id => id !== no);
  put(state); return on;
}
