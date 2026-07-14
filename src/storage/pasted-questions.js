import { parsePasteText } from "../lib/parse-paste.js";

const KEY = "sindaewon-quiz:pasted-questions";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getPastedQuestions() {
  return read();
}

export function addPastedQuestions(newItems) {
  const existing = read();
  const seen = new Set(existing.map((q) => q.question.replace(/\s+/g, " ").trim()));
  const added = [];
  for (const q of newItems) {
    const key = q.question.replace(/\s+/g, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    added.push(q);
  }
  write([...existing, ...added]);
  return added;
}

export function clearPastedQuestions() {
  localStorage.removeItem(KEY);
}

export function previewPaste(text, options) {
  return parsePasteText(text, options);
}
