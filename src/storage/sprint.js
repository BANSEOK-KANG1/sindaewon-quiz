import { CORE_CARDS } from '../data/commute.js';

const KEY = 'sindaewon-quiz:core-sprint:v1';
const ids = CORE_CARDS.map(card => card.id);
const blank = () => ({ active: false, index: 0, read: [] });
let memory = null;
let saveFailed = false;

export function getSprint() {
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY)); } catch { data = memory; }
  if (saveFailed) data = memory;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return blank();
  // A run is sequential: malformed data cannot skip ahead to a completed round.
  const supplied = new Set(Array.isArray(data.read) ? data.read : []);
  const firstUnread = ids.findIndex(id => !supplied.has(id));
  const read = ids.slice(0, firstUnread < 0 ? ids.length : firstUnread);
  const index = Number.isInteger(data.index) && data.index >= 0 ? Math.min(data.index, read.length, ids.length - 1) : 0;
  return { active: data.active === true || read.length > 0, index, read };
}
function put(data) {
  memory = data;
  try { localStorage.setItem(KEY, JSON.stringify(data)); saveFailed = false; }
  catch { saveFailed = true; }
  return data;
}
export const sprintSaveFailed = () => saveFailed;
export const sprintComplete = (state = getSprint()) => state.read.length === ids.length;
export function openSprint() { return put({ ...getSprint(), active: true }); }
export function previousSprintCard() {
  const state = getSprint();
  if (sprintComplete(state)) return state;
  return put({ ...state, index: Math.max(0, state.index - 1) });
}
export function advanceSprint(expectedId) {
  const state = getSprint();
  if (!state.active || sprintComplete(state) || ids[state.index] !== expectedId) return { accepted: false, completed: false };
  if (!state.read.includes(expectedId)) state.read.push(expectedId);
  state.index = Math.min(state.index + 1, ids.length - 1);
  put(state);
  return { accepted: true, completed: sprintComplete(state) };
}
// Starting another round never clears lifetime reading, bookmarks, or quiz data.
export function restartSprint() { return put({ ...blank(), active: true }); }
