/**
 * 붙여넣기 텍스트 → 문제 객체 (브라우저·Node 공용)
 */

const CIRCLE = ["①", "②", "③", "④"];
const QUESTION_START = /^(\d+)(?:번)?\.\s*(.+)/;

function isQuestionStart(line) {
  return QUESTION_START.test(line.trim());
}

function parseQuestionStart(line) {
  const m = line.trim().match(QUESTION_START);
  return m ? m[2] : null;
}

function isAnswerOnly(line) {
  const a = line.trim();
  return /^[①②③④]$/.test(a) || /^[1-4]$/.test(a);
}

function isChoiceLine(line) {
  const t = line.trim();
  if (!t || isAnswerOnly(t)) return false;
  return /^[①②③④]/.test(t) || CIRCLE.filter((c) => t.includes(c)).length >= 2;
}

export function detectPasteFormat(text) {
  const t = text.trim();
  if (!t) return "empty";
  if (/^\s*-?.+\?\(.+\)\s*$/m.test(t) && !isQuestionStart(t.split("\n")[0])) {
    if (t.split("\n").filter((l) => l.trim()).every((l) => /^\s*-?.+\?\(.+\)\s*$/.test(l.trim())))
      return "happycampus";
  }
  if (isQuestionStart(t.split("\n").find((l) => l.trim()) || "") || /[①②③④]/.test(t)) {
    return "multiple";
  }
  return "flashcard";
}

export function parseHappycampusLines(text) {
  const out = [];
  for (const line of text.split("\n")) {
    const raw = line.trim();
    if (!raw || raw.startsWith("#")) continue;
    const m = raw.match(/^-?\s*(.+?)\?\((.+)\)\s*$/);
    if (m) out.push({ question: m[1].trim(), answer: m[2].trim() });
  }
  return out;
}

export function parseFlashcardLines(lines) {
  const questions = [];
  let i = 0;
  while (i < lines.length) {
    let line = lines[i].trim();
    if (!line || line.startsWith("#")) {
      i++;
      continue;
    }
    if (isQuestionStart(line)) {
      i++;
      continue;
    }
    const question = line.replace(/^-\s*/, "");
    i++;
    let answer = "";
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) {
        i++;
        continue;
      }
      if (t.startsWith("#")) {
        i++;
        continue;
      }
      if (isQuestionStart(t) || isChoiceLine(t)) break;
      answer = t.replace(/^-\s*/, "");
      i++;
      break;
    }
    if (answer) questions.push({ question, answer });
  }
  return questions;
}

export function parseMultipleChoiceLines(lines) {
  const questions = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) {
      i++;
      continue;
    }
    const firstPart = parseQuestionStart(lines[i]);
    if (firstPart === null) {
      i++;
      continue;
    }
    const questionParts = [firstPart];
    i++;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || t.startsWith("#")) {
        i++;
        continue;
      }
      if (isQuestionStart(t)) break;
      if (isChoiceLine(t)) break;
      questionParts.push(t);
      i++;
    }
    const choices = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || t.startsWith("#")) {
        i++;
        continue;
      }
      if (isQuestionStart(t)) break;
      if (!isChoiceLine(t)) break;
      const parts = t.split(/\s*(?=[①②③④])/).filter(Boolean);
      for (const p of parts) {
        const m = p.match(/^[①②③④]\s*(.+)/s);
        if (m) choices.push(m[1].trim());
      }
      i++;
    }
    let answerRaw = "";
    while (i < lines.length) {
      const a = lines[i].trim();
      if (!a || a.startsWith("#")) break;
      if (isQuestionStart(a)) break;
      if (isAnswerOnly(a)) {
        answerRaw = a;
        i++;
        break;
      }
      if (isChoiceLine(a)) break;
      i++;
    }
    const answerIndex = answerRaw
      ? CIRCLE.indexOf(answerRaw) !== -1
        ? CIRCLE.indexOf(answerRaw)
        : parseInt(answerRaw, 10) - 1
      : 0;
    questions.push({
      question: questionParts.join("\n"),
      choices,
      answer: answerIndex,
      type: "multiple",
    });
  }
  return questions;
}

export function toQuestionRecords(parsed, meta, idPrefix = "paste") {
  const ts = Date.now();
  return parsed.map((p, idx) => {
    const id = `${idPrefix}-${meta.seminary}-${meta.subjectKey}-${ts}-${String(idx + 1).padStart(3, "0")}`;
    if (p.type === "multiple" || (p.choices && p.choices.length >= 2)) {
      return {
        id,
        seminary: meta.seminary,
        year: meta.year ?? null,
        subject: meta.subject,
        type: "multiple",
        question: p.question,
        choices: p.choices,
        answer: p.answer,
        explanation: "",
        tags: [...(meta.tags || []), "붙여넣기"],
        source: meta.source || "paste",
      };
    }
    return {
      id,
      seminary: meta.seminary,
      year: meta.year ?? null,
      subject: meta.subject,
      type: "short",
      question: p.question,
      answer: p.answer,
      explanation: "",
      tags: [...(meta.tags || []), "붙여넣기"],
      source: meta.source || "paste",
    };
  });
}

export function parsePasteText(text, meta = {}) {
  const format = meta.type && meta.type !== "auto" ? meta.type : detectPasteFormat(text);
  const lines = text.split("\n");
  let parsed = [];
  if (format === "happycampus") {
    parsed = parseHappycampusLines(text);
  } else if (format === "multiple") {
    parsed = parseMultipleChoiceLines(lines);
  } else {
    parsed = parseFlashcardLines(lines);
  }
  const defaultMeta = {
    seminary: "chongshin",
    subject: "성경",
    subjectKey: meta.subject === "영어" ? "english" : "bible",
    tags: meta.subject === "영어" ? ["어휘", "붙여넣기"] : ["구약", "붙여넣기"],
    source: "paste",
    ...meta,
  };
  return { format, questions: toQuestionRecords(parsed, defaultMeta) };
}

export function formatFlashcardFile(questions) {
  return questions
    .filter((q) => q.type === "short")
    .map((q) => `${q.question}\n${q.answer}\n`)
    .join("\n");
}
