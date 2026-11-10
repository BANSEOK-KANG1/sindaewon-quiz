const KEY = 'sindaewon-quiz:commute-reading:v1';
const plain = x => x && typeof x === 'object' && !Array.isArray(x);
let memory = null;
let saveFailed = false;
const blank = () => ({ minutes: 3, large: false, last: null, positions: {}, read: [], saved: [], sessions: 0 });

export function getReading() {
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY)); } catch { data = memory; }
  if (saveFailed) data = memory;
  if (!plain(data)) return blank();
  return {
    minutes: [3, 5, 10].includes(data.minutes) ? data.minutes : 3,
    large: data.large === true,
    last: typeof data.last === 'string' ? data.last : null,
    positions: plain(data.positions) ? Object.fromEntries(Object.entries(data.positions).filter(([,v]) => Number.isInteger(v) && v >= 0)) : {},
    read: Array.isArray(data.read) ? [...new Set(data.read.filter(x => typeof x === 'string'))] : [],
    saved: Array.isArray(data.saved) ? [...new Set(data.saved.filter(x => typeof x === 'string'))] : [],
    sessions: Number.isInteger(data.sessions) && data.sessions >= 0 ? data.sessions : 0,
  };
}
function put(data) {
  memory = data;
  try { localStorage.setItem(KEY, JSON.stringify(data)); saveFailed = false; }
  catch { saveFailed = true; }
  return data;
}
export const readingSaveFailed = () => saveFailed;
export function readingPreference(key, value) {
  if (!['minutes', 'large'].includes(key)) return;
  put({ ...getReading(), [key]: value });
}
export function rememberPosition(book, index) {
  const data = getReading();
  data.last = book;
  data.positions[book] = index;
  put(data);
}
export function finishReadingCard(card, total) {
  const data = getReading();
  if (!data.read.includes(card.id)) data.read.push(card.id);
  data.last = card.book;
  data.positions[card.book] = card.index + 1 < total ? card.index + 1 : 0;
  put(data);
}
export function finishSession() { const data = getReading(); data.sessions++; put(data); }
export function toggleSaved(id) {
  const data = getReading();
  data.saved = data.saved.includes(id) ? data.saved.filter(x => x !== id) : [...data.saved, id];
  return put(data).saved.includes(id);
}
