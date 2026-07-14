#!/usr/bin/env node
/**
 * Quizlet/텍스트 형식 → questions.json 변환
 * 사용: node scripts/import-questions.js [bible|english|grad|memory|all]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/data/questions.json");

const CIRCLE = ["①", "②", "③", "④"];
const CIRCLE_ALT = ["➀", "➁", "➂", "➃"];
const GIEOK = ["ㄱ", "ㄴ", "ㄷ", "ㄹ"];
const QUESTION_START = /^(\d+)(?:번)?\.\s*(.+)/;
const Q_START_QUOTED = /^"?(\d+)(?:번)?\.\s*(.+)/;
const REF_START =
  /^(롬|고전|고후|갈|엡|빌|골|살전|살후|딤전|딤후|딛|히|약|벧전|벧후|요일|계)\d+:\d+(?:~\d+)?$/;

const BOOK_TAGS = {
  창: "창세기",
  출: "출애굽기",
  레: "레위기",
  민: "민수기",
  신: "신명기",
  수: "여호수아",
  삿: "사사기",
  룻: "룻기",
  삼상: "사무엘상",
  삼하: "사무엘하",
  왕상: "열왕기상",
  왕하: "열왕기하",
  대상: "역대상",
  대하: "역대하",
  스: "에스라",
  느: "느헤미야",
  에: "에스더",
  욥: "욥기",
  시: "시편",
  잠: "잠언",
  전: "전도서",
  아: "아가",
  사: "이사야",
  렘: "예레미야",
  애: "예레미야애가",
  겔: "에스겔",
  단: "다니엘",
  호: "호세아",
  욜: "요엘",
  암: "아모스",
  옵: "오바댜",
  욘: "요나",
  미: "미가",
  나: "나훔",
  합: "하박국",
  습: "스바냐",
  학: "학개",
  슥: "스가랴",
  말: "말라기",
  마: "마태복음",
  막: "마가복음",
  눅: "누가복음",
  요: "요한복음",
  행: "사도행전",
  롬: "로마서",
  고전: "고린도전서",
  고후: "고린도후서",
  갈: "갈라디아서",
  엡: "에베소서",
  빌: "빌립보서",
  골: "골로새서",
  살전: "데살로니가전서",
  살후: "데살로니가후서",
  딤전: "디모데전서",
  딤후: "디모데후서",
  딛: "디도서",
  몬: "빌레몬서",
  히: "히브리서",
  약: "야고보서",
  벧전: "베드로전서",
  벧후: "베드로후서",
  요일: "요한일서",
  요이: "요한이서",
  요삼: "요한삼서",
  유: "유다서",
  계: "요한계시록",
};

const BOOK_ABBR_LABEL = {
  롬: "로마서",
  고전: "고린도전서",
  고후: "고린도후서",
  갈: "갈라디아서",
  엡: "에베소서",
  빌: "빌립보서",
  골: "골로새서",
  살전: "데살로니가전서",
  살후: "데살로니가후서",
  딤전: "디모데전서",
  딤후: "디모데후서",
  딛: "디도서",
  히: "히브리서",
  약: "야고보서",
  벧전: "베드로전서",
  벧후: "베드로후서",
  요일: "요한일서",
  계: "요한계시록",
};

const warnings = [];

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

function isAnswerLine(line) {
  return isAnswerOnly(line);
}

function nextQuestionLine(line) {
  return isQuestionStart(line);
}

function parseBlock(lines, meta, idState) {
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
      if (nextQuestionLine(t)) break;
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
      if (nextQuestionLine(t)) break;
      if (!isChoiceLine(t)) break;
      const choiceLine = t;
      const parts = choiceLine.split(/\s*(?=[①②③④])/).filter(Boolean);
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
      if (nextQuestionLine(a)) break;
      if (isAnswerLine(a)) {
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

    const seq = idState.next++;
    const id = `${meta.seminary}-${meta.subjectKey}-${String(seq).padStart(3, "0")}`;
    const question = questionParts.join("\n");

    questions.push({
      id,
      seminary: meta.seminary,
      year: meta.year,
      subject: meta.subject,
      type: choices.length >= 2 ? "multiple" : "short",
      question,
      ...(choices.length >= 2
        ? { choices, answer: answerIndex }
        : { answer: answerRaw || "" }),
      explanation: "",
      tags: meta.tags || [],
      source: meta.source || "quizlet",
    });
  }
  return questions;
}

/** 단답 플래시카드: 문제 줄 → 다음 줄 정답 (①②③④ 없음) */
function parseFlashcardBlock(lines, meta, idState) {
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

    if (!answer) continue;

    const seq = idState.next++;
    const id = `${meta.seminary}-${meta.subjectKey}-${String(seq).padStart(3, "0")}`;
    questions.push({
      id,
      seminary: meta.seminary,
      year: meta.year,
      subject: meta.subject,
      type: "short",
      question,
      answer,
      explanation: "",
      tags: meta.tags || [],
      source: meta.source || "quizlet",
    });
  }
  return questions;
}

function usesFlashcardParser(filename) {
  return /-short\.txt$/i.test(filename) || filename === "quizlet-bible-ot.txt";
}

function loadTxt(filename, meta, idState) {
  const path = join(__dirname, filename);
  const text = readFileSync(path, "utf8");
  const lines = text.split("\n");
  if (usesFlashcardParser(filename)) {
    return parseFlashcardBlock(lines, meta, idState);
  }
  return parseBlock(lines, meta, idState);
}

function normalizeQuestion(q) {
  return q.replace(/\s+/g, " ").trim();
}

function renumberIds(questions, meta) {
  return questions.map((q, idx) => ({
    ...q,
    id: `${meta.seminary}-${meta.subjectKey}-${String(idx + 1).padStart(3, "0")}`,
  }));
}

function mergeDedup(batches) {
  const seen = new Set();
  const merged = [];
  for (const batch of batches) {
    for (const item of batch) {
      const key = normalizeQuestion(item.question);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }
  return merged;
}

function bibleTxtFiles() {
  return readdirSync(__dirname)
    .filter((f) => /^quizlet-bible(\.txt|-.+\.txt)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, "ko"));
}

function loadBibleSources(idState) {
  const meta = {
    seminary: "chongshin",
    year: null,
    subject: "성경",
    subjectKey: "bible",
    tags: ["구약", "신약", "quizlet"],
    source: "quizlet",
  };

  const files = bibleTxtFiles();
  const batches = files.map((file) => loadTxt(file, meta, idState));
  return renumberIds(mergeDedup(batches), meta);
}

function englishTxtFiles() {
  return readdirSync(__dirname)
    .filter((f) => /^quizlet-english(\.txt|-.+\.txt)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, "ko"));
}

function loadEnglishSources(idState) {
  const meta = {
    seminary: "chongshin",
    year: null,
    subject: "영어",
    subjectKey: "english",
    tags: ["어휘", "문법", "독해"],
    source: "quizlet",
  };
  const batches = englishTxtFiles().map((file) => loadTxt(file, meta, idState));
  return renumberIds(mergeDedup(batches), meta);
}

/* ---------- 00-14 graduate past exams ---------- */

const META_SLASH =
  /^답_(.+?)\/(\d{1,2}(?:\.\d)?|\d{4})년도_([^/]+)\/범위_([^/]+)\/해설_(.*)$/;
const META_DOUBLE =
  /^(\d{4})년도_([^/]+?)\/\/범위_([^/]+)\/\/답_(.+?)(?:\/\/해설_(.*))?$/;
const QUIZLET_JUNK =
  /학습 현황|프로필 사진|만든 이|낱말카드|미리보기|Terms in this set|See more|활동으로 복습|Quizlet|학생들은 다음|선생님|단어 또는 뜻|학습 가이드|✨|NCS |앰코|평화 통일|NODE \|/;

function isJunkExtraLine(t) {
  if (!t) return true;
  if (QUIZLET_JUNK.test(t)) return true;
  if (/^\d+\s*\/\s*\d+$/.test(t)) return true;
  if (/^\d+\s*단어$/.test(t)) return true;
  if (/^[A-Za-z0-9_]{3,}$/.test(t) && !/[가-힣]/.test(t)) return true; // usernames
  if (/^성경기출_/.test(t)) return true;
  return false;
}

function cleanExplanation(text) {
  return String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !isJunkExtraLine(l))
    .join("\n")
    .trim();
}

function parseYearToken(tok) {
  const clean = String(tok).replace(/\.1$/, "");
  if (/^\d{4}$/.test(clean)) return parseInt(clean, 10);
  if (/^\d{1,2}$/.test(clean)) {
    const n = parseInt(clean, 10);
    if (n >= 87 && n <= 99) return 1900 + n;
    return 2000 + n;
  }
  return null;
}

function bookTagsFromRange(range) {
  const tags = [];
  for (const part of String(range).split(/[/·,]/)) {
    const code = part.trim();
    if (!code) continue;
    tags.push(BOOK_TAGS[code] || code);
  }
  return tags;
}

function parseMetaLine(line) {
  const t = line.trim().replace(/^"+|"+$/g, "");
  let m = t.match(META_SLASH);
  if (m) {
    return {
      answerRaw: m[1].trim(),
      year: parseYearToken(m[2]),
      examType: m[3].trim(),
      range: m[4].trim(),
      explanation: (m[5] || "").trim(),
    };
  }
  m = t.match(META_DOUBLE);
  if (m) {
    return {
      year: parseYearToken(m[1]),
      examType: m[2].trim(),
      range: m[3].trim(),
      answerRaw: m[4].trim(),
      explanation: (m[5] || "").trim(),
    };
  }
  return null;
}

function answerIndexFromRaw(raw) {
  const s = String(raw).trim();
  if (/[①②③④]/.test(s)) {
    for (let i = 0; i < CIRCLE.length; i++) if (s.includes(CIRCLE[i])) return i;
  }
  if (/[➀➁➂➃]/.test(s)) {
    for (let i = 0; i < CIRCLE_ALT.length; i++) if (s.includes(CIRCLE_ALT[i])) return i;
  }
  if (/^[ㄱㄴㄷㄹ]$/.test(s)) return GIEOK.indexOf(s);
  if (/^[1-4]$/.test(s)) return parseInt(s, 10) - 1;
  const digit = s.match(/^[1-4]/);
  if (digit && /^[1-4]\b/.test(s) && !/또는/.test(s)) return parseInt(digit[0], 10) - 1;
  return null;
}

function isOxAnswer(raw) {
  const s = String(raw).trim().replace(/[()]/g, "").toUpperCase();
  return s === "O" || s === "X" || s === "○" || s === "✕" || s === "×";
}

function normalizeOx(raw) {
  const s = String(raw).trim().replace(/[()]/g, "").toUpperCase();
  if (s === "O" || s === "○") return "O";
  return "X";
}

function splitChoicesFromText(text) {
  const markers = [...CIRCLE, ...CIRCLE_ALT];
  const hasCircle = markers.some((c) => text.includes(c));
  const hasGieok = /ㄱ\.\s/.test(text) || /^ㄱ\./m.test(text);

  if (hasCircle) {
    const re = /[①②③④➀➁➂➃]\s*/g;
    const parts = [];
    let match;
    const indices = [];
    while ((match = re.exec(text)) !== null) {
      indices.push({ index: match.index, len: match[0].length, mark: match[0][0] });
    }
    if (indices.length >= 2) {
      for (let i = 0; i < indices.length; i++) {
        const start = indices[i].index + indices[i].len;
        const end = i + 1 < indices.length ? indices[i + 1].index : text.length;
        parts.push(text.slice(start, end).trim());
      }
      const qEnd = indices[0].index;
      return { stem: text.slice(0, qEnd).trim(), choices: parts.filter(Boolean) };
    }
  }

  if (hasGieok) {
    const re = /[ㄱㄴㄷㄹ]\.\s*/g;
    const indices = [];
    let match;
    while ((match = re.exec(text)) !== null) {
      indices.push({ index: match.index, len: match[0].length });
    }
    if (indices.length >= 2) {
      const parts = [];
      for (let i = 0; i < indices.length; i++) {
        const start = indices[i].index + indices[i].len;
        const end = i + 1 < indices.length ? indices[i + 1].index : text.length;
        parts.push(text.slice(start, end).trim());
      }
      return {
        stem: text.slice(0, indices[0].index).trim(),
        choices: parts.filter(Boolean),
      };
    }
  }

  return { stem: text.trim(), choices: [] };
}

function isGradQuestionStart(line) {
  const t = line.trim().replace(/^"+/, "");
  return Q_START_QUOTED.test(t) || /^"?\d+\.\s/.test(t);
}

function extractGradQuestionText(line) {
  const t = line.trim().replace(/^"+/, "").replace(/"+$/, "");
  const m = t.match(Q_START_QUOTED);
  if (m) return m[2];
  return null;
}

function isLikelyMetaLine(line) {
  const t = line.trim();
  return /^답_/.test(t) || /^\d{4}년도_/.test(t) || /^\d{1,2}(?:\.\d)?년도_/.test(t);
}

/**
 * 00-14 기출: 문항 본문 + 메타(답_/연도/범위/해설)
 */
function parseChongshinGradFile(text, metaBase) {
  const lines = text.split("\n");
  const questions = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line || line.startsWith("#") || QUIZLET_JUNK.test(line)) {
      i++;
      continue;
    }

    if (!isGradQuestionStart(line)) {
      i++;
      continue;
    }

    const first = extractGradQuestionText(line);
    if (first === null) {
      i++;
      continue;
    }

    const bodyParts = [first];
    i++;

    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || t === '"' || t === '""' || t === '" "') {
        i++;
        continue;
      }
      if (t.startsWith("#") || QUIZLET_JUNK.test(t)) {
        i++;
        continue;
      }
      if (isLikelyMetaLine(t) || parseMetaLine(t)) break;
      if (isGradQuestionStart(t) && extractGradQuestionText(t) !== null) {
        // next question without meta — abort current? keep going only if no meta found later
        // Prefer: if looks like new Q and we already have substantial body, wait for meta
        // Actually new Q means previous had no meta — skip orphan
        break;
      }
      bodyParts.push(t.replace(/^"+|"+$/g, ""));
      i++;
    }

    // skip blank / junk until meta
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || t === '"' || t === '" "' || QUIZLET_JUNK.test(t)) {
        i++;
        continue;
      }
      break;
    }

    let meta = null;
    if (i < lines.length && isLikelyMetaLine(lines[i].trim())) {
      meta = parseMetaLine(lines[i]);
      i++;
    }

    if (!meta) {
      // rewind was hard — orphan question, skip
      continue;
    }

    // trailing explanation lines until next question or meta
    const extra = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || t === '"' || t === '" "') {
        i++;
        continue;
      }
      if (t.startsWith("#") || isJunkExtraLine(t)) {
        i++;
        // once junk starts (Quizlet sidebar), skip until next question
        while (i < lines.length) {
          const u = lines[i].trim();
          if (isGradQuestionStart(u) && extractGradQuestionText(u) !== null) break;
          i++;
        }
        break;
      }
      if (isGradQuestionStart(t) && extractGradQuestionText(t) !== null) break;
      if (isLikelyMetaLine(t)) break;
      extra.push(t.replace(/^"+|"+$/g, ""));
      i++;
    }

    const bodyText = bodyParts.join("\n").replace(/\s+"$/g, "").trim();
    const { stem, choices } = splitChoicesFromText(bodyText);
    const question = stem || bodyText;
    const explanation = cleanExplanation([meta.explanation, ...extra].filter(Boolean).join("\n"));
    const tags = [
      "기출",
      "총신",
      "00-14",
      meta.examType,
      ...bookTagsFromRange(meta.range),
    ].filter(Boolean);

    let type = "short";
    let answer = meta.answerRaw;
    const multiHint = /또는|둘.?다/.test(meta.answerRaw);

    if (isOxAnswer(meta.answerRaw) && choices.length < 2) {
      type = "ox";
      answer = normalizeOx(meta.answerRaw);
    } else if (choices.length >= 2) {
      type = "multiple";
      const idx = answerIndexFromRaw(meta.answerRaw);
      if (idx === null || idx < 0 || idx >= choices.length) {
        if (multiHint) {
          tags.push("multi-answer");
          warnings.push(`multi-answer: ${question.slice(0, 40)}… → ${meta.answerRaw}`);
          answer = 0;
        } else {
          warnings.push(`bad answer idx: ${meta.answerRaw} for "${question.slice(0, 40)}"`);
          answer = 0;
        }
      } else {
        answer = idx;
        if (multiHint) tags.push("multi-answer");
      }
    } else {
      type = "short";
      answer = meta.answerRaw.replace(/^\(+|\)+$/g, "").trim();
    }

    questions.push({
      id: "",
      seminary: metaBase.seminary,
      year: meta.year,
      subject: metaBase.subject,
      type,
      question,
      ...(type === "multiple" ? { choices, answer } : { answer }),
      explanation,
      tags,
      source: metaBase.source,
    });
  }

  return questions;
}

function loadChongshinGradSources() {
  const meta = {
    seminary: "chongshin",
    subject: "성경",
    subjectKey: "bible-g",
    source: "quizlet-00-14",
  };
  const files = readdirSync(__dirname)
    .filter((f) => /^quizlet-chongshin-00-14.*\.txt$/i.test(f))
    .sort((a, b) => a.localeCompare(b, "ko"));

  const batches = files.map((file) => {
    const text = readFileSync(join(__dirname, file), "utf8");
    const qs = parseChongshinGradFile(text, meta);
    console.log(`  grad ${file}: ${qs.length}`);
    return qs;
  });

  const merged = mergeDedup(batches);
  return merged.map((q, idx) => ({
    ...q,
    id: `chongshin-bible-g-${String(idx + 1).padStart(4, "0")}`,
  }));
}

/* ---------- memory verses ---------- */

function parseMemoryVersesFile(text, metaBase) {
  const lines = text.split("\n");
  const questions = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) {
      i++;
      continue;
    }
    if (!REF_START.test(line)) {
      i++;
      continue;
    }
    const ref = line;
    i++;
    const body = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) {
        i++;
        if (body.length) break;
        continue;
      }
      if (t.startsWith("#")) {
        i++;
        continue;
      }
      if (REF_START.test(t)) break;
      body.push(t);
      i++;
    }
    if (!body.length) continue;
    const bookMatch = ref.match(
      /^(롬|고전|고후|갈|엡|빌|골|살전|살후|딤전|딤후|딛|히|약|벧전|벧후|요일|계)/
    );
    const bookTag = bookMatch ? BOOK_ABBR_LABEL[bookMatch[1]] || bookMatch[1] : "신약";
    questions.push({
      id: "",
      seminary: metaBase.seminary,
      year: null,
      subject: metaBase.subject,
      type: "short",
      question: ref,
      answer: body.join(" "),
      explanation: "",
      tags: ["암송", "신약", bookTag],
      source: metaBase.source,
    });
  }
  return questions;
}

function loadMemorySources() {
  const meta = {
    seminary: "chongshin",
    subject: "성경",
    subjectKey: "memory",
    source: "memory",
  };
  const files = readdirSync(__dirname)
    .filter((f) => /^memory-.*\.txt$/i.test(f))
    .sort((a, b) => a.localeCompare(b, "ko"));

  const batches = files.map((file) => {
    const text = readFileSync(join(__dirname, file), "utf8");
    const qs = parseMemoryVersesFile(text, meta);
    console.log(`  memory ${file}: ${qs.length}`);
    return qs;
  });

  const merged = mergeDedup(batches);
  return merged.map((q, idx) => ({
    ...q,
    id: `chongshin-memory-${String(idx + 1).padStart(4, "0")}`,
  }));
}

function main() {
  const mode = process.argv[2] || "all";
  const idState = { next: 1 };
  let bible = [];
  let english = [];
  let grad = [];
  let memory = [];

  if (mode === "bible" || mode === "all") {
    bible = loadBibleSources(idState);
  }
  if (mode === "english" || mode === "all") {
    english = loadEnglishSources(idState);
  }
  if (mode === "grad" || mode === "all") {
    grad = loadChongshinGradSources();
  }
  if (mode === "memory" || mode === "all") {
    memory = loadMemorySources();
  }

  // Merge: existing seed + grad + memory (dedupe by question text across all)
  const all = mergeDedup([bible, english, grad, memory]);

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ questions: all }, null, 2), "utf8");
  console.log(`Wrote ${all.length} questions → ${OUT}`);
  console.log(`  성경(bible seed): ${bible.length}`);
  console.log(`  영어(english): ${english.length}`);
  console.log(`  기출(00-14): ${grad.length}`);
  console.log(`  암송(memory): ${memory.length}`);
  console.log(`  total (deduped): ${all.length}`);
  if (warnings.length) {
    console.log(`  warnings: ${warnings.length}`);
    for (const w of warnings.slice(0, 15)) console.log(`    - ${w}`);
    if (warnings.length > 15) console.log(`    … +${warnings.length - 15} more`);
  }
}

main();
