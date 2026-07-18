#!/usr/bin/env node
/**
 * 총신 문제은행 재정리:
 * - 진짜 중복 문항 제거 (같은 지문+같은 보기, 또는 교차출처 동일 지문)
 * - 깨진 문항 수정/제외
 * - 기출 유형·권별 빈도에 따른 중요도(weight) 부여
 *
 * Run: node scripts/reorganize-bank.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const QUESTIONS_PATH = path.join(ROOT, "public/data/questions.json");

/** 기출 유형 가중치 (출제 빈도·필답 중요도) */
const EXAM_TYPE_WEIGHT = {
  신_유형: 5,
  성종유형: 4,
  신유형: 4,
  목유형: 3,
  "성(여)유형": 2,
  "성(겨)유형": 2,
  성유형: 2,
};

/** 출처 가중치 (최근·원문 우선) */
const SOURCE_WEIGHT = {
  "hwp-exam-2020-2022": 5,
  "bible-bank-2026": 4,
  "quizlet-00-14": 3,
  quizlet: 2,
  "vocab-300": 2,
  "bible-english": 2,
  grammar: 2,
  memory: 1,
};

/** 권별 기출 빈도 기반 티어 (재집계 후 덮어씀) */
const BOOK_HINTS = {
  창세기: "이스라엘 조상·언약·제단",
  시편: "다윗·찬양·시편 저자",
  이사야: "메시아 예언·심판",
  출애굽기: "모세·십계명·광야",
  열왕기하: "엘리야·엘리사·북왕",
  예레미야: "심판·새 언약",
  민수기: "광야·인구조사·레위",
  열왕기상: "솔로몬·성전·엘리야",
  신명기: "율법·가나안 입성",
  에스겔: "환상·성전·회복",
  레위기: "제사·정결·절기",
  욥기: "고난·의인의 길",
  잠언: "지혜·솔로몬",
  여호수아: "가나안 정복",
  사사기: "사사·순환",
  사무엘상: "사무엘·사울·다윗",
  사무엘하: "다윗 왕국",
  다니엘: "환상·바벨론",
  느헤미야: "성벽 재건",
  역대하: "유다 왕 통치",
  전도서: "허무·지혜",
  에스더: "부림절·구원",
  에스라: "귀환·성전",
  호세아: "언약·배도",
  로마서: "칭의·복음",
  마태복음: "산상수훈·왕국",
  요한복음: "성자·표적",
  사도행전: "초대교회·선교",
  요한계시록: "종말·일곱 교회",
};

const KNOWN_BOOKS = Object.keys(BOOK_HINTS).concat([
  "룻기",
  "역대상",
  "아가",
  "예레미야애가",
  "요엘",
  "아모스",
  "오바댜",
  "요나",
  "미가",
  "나훔",
  "하박국",
  "스바냐",
  "학개",
  "스가랴",
  "말라기",
  "마가복음",
  "누가복음",
  "고린도전서",
  "고린도후서",
  "갈라디아서",
  "에베소서",
  "빌립보서",
  "골로새서",
  "데살로니가전서",
  "데살로니가후서",
  "디모데전서",
  "디모데후서",
  "디도서",
  "빌레몬서",
  "히브리서",
  "야고보서",
  "베드로전서",
  "베드로후서",
  "요한일서",
  "요한이서",
  "요한삼서",
  "유다서",
]);

const SOURCE_RANK = {
  "hwp-exam-2020-2022": 100,
  "bible-bank-2026": 90,
  "quizlet-00-14": 70,
  quizlet: 50,
  "vocab-300": 40,
  "bible-english": 40,
  grammar: 40,
  memory: 30,
};

function normStem(s) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .trim();
}

function choiceKey(q) {
  if (!Array.isArray(q.choices)) return "";
  return q.choices.map((c) => normStem(c).toLowerCase()).join("|");
}

function contentKey(q) {
  return `${normStem(q.question).toLowerCase()}::${choiceKey(q)}`;
}

function softStemKey(q) {
  return normStem(q.question)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

function scoreKeep(q) {
  let s = SOURCE_RANK[q.source] || 10;
  if (q.answer != null && q.answer !== "") s += 20;
  if (Array.isArray(q.choices) && q.choices.length === 4) s += 10;
  if ((q.question || "").trim().length > 8) s += 5;
  if ((q.explanation || "").trim()) s += 2;
  return s;
}

function isGenericStem(stem) {
  const s = normStem(stem);
  return (
    s.length < 40 &&
    /^(Choose one|다음 중 문법적으로|다음 중 선지자|다음 중 욥)/i.test(s)
  );
}

function fixBroken(q) {
  // 00-14 parse failure: question="(", choices hold fragments
  if (q.id === "chongshin-bible-g-0350") {
    const parts = (q.choices || []).map((c) => String(c).replace(/^\)\s*/, "").trim());
    return {
      ...q,
      question: "다음 괄호에 알맞은 내용은? (창세기 관련 기출)",
      choices: parts.length === 4 ? parts : q.choices,
      tags: [...new Set([...(q.tags || []), "기출", "신_유형", "창세기"])],
    };
  }
  if (q.id?.startsWith("chongshin-vocab-") && Array.isArray(q.choices)) {
    const seen = new Set();
    const choices = q.choices.map((c, i) => {
      const t = String(c);
      if (seen.has(t)) return `${t} (${i + 1})`;
      seen.add(t);
      return t;
    });
    // better: dedupe retain in antonym — keep first unique by rewriting duplicates lightly
    const uniq = [];
    for (const c of q.choices) {
      if (!uniq.includes(c)) uniq.push(c);
    }
    while (uniq.length < 4) uniq.push(`보기${uniq.length + 1}`);
    return { ...q, choices: uniq.slice(0, 4) };
  }
  return q;
}

function cleanOtNtTags(q) {
  const tags = [...(q.tags || [])];
  const hasOt = tags.includes("구약");
  const hasNt = tags.includes("신약");
  if (!(hasOt && hasNt)) return q;

  // quizlet seed often tagged both — keep one based on book tag or content
  const booksOt = new Set(
    KNOWN_BOOKS.filter((b) =>
      /^(창세기|출애굽|레위|민수|신명|여호수|사사|룻|사무엘|열왕|역대|에스라|느헤미|에스더|욥|시편|잠언|전도|아가|이사야|예레미야|에스겔|다니엘|호세아|요엘|아모스|오바댜|요나|미가|나훔|하박국|스바냐|학개|스가랴|말라기)/.test(
        b
      )
    )
  );
  const book = tags.find((t) => KNOWN_BOOKS.includes(t));
  let next = tags.filter((t) => t !== "구약" && t !== "신약");
  if (book && booksOt.has(book)) next.push("구약");
  else if (book) next.push("신약");
  else if (/마태|마가|누가|요한|사도|로마|고린도|갈라디|에베소|빌립|골로새|데살로니|디모데|디도|빌레몬|히브리|야고보|베드로|요한일|요한이|요한삼|유다|계시록|신약/.test(q.question))
    next.push("신약");
  else next.push("구약");
  return { ...q, tags: [...new Set(next)] };
}

function computeWeight(q, bookCounts) {
  const tags = q.tags || [];
  let typeW = 0;
  for (const [tag, w] of Object.entries(EXAM_TYPE_WEIGHT)) {
    if (tags.includes(tag)) typeW = Math.max(typeW, w);
  }
  const srcW = SOURCE_WEIGHT[q.source] || 1;

  let bookW = 0;
  let book = null;
  for (const b of KNOWN_BOOKS) {
    if (tags.includes(b)) {
      book = b;
      const c = bookCounts[b] || 0;
      if (c >= 100) bookW = 5;
      else if (c >= 60) bookW = 4;
      else if (c >= 40) bookW = 3;
      else if (c >= 20) bookW = 2;
      else bookW = 1;
      break;
    }
  }

  // 영어 자료: 단어장·문법·원문기출 가중
  if (q.subject === "영어") {
    if (tags.includes("기출어휘") || tags.includes("원문기출")) typeW = Math.max(typeW, 4);
    if (tags.includes("신학영어") || tags.includes("성경영어")) typeW = Math.max(typeW, 3);
    if (tags.includes("단어장300")) typeW = Math.max(typeW, 2);
    if (tags.includes("문법")) typeW = Math.max(typeW, 3);
  }

  // 최종: 유형이 있으면 유형 중심, 없으면 출처+권
  const weight = Math.max(typeW, Math.round((srcW + bookW) / 2), srcW >= 4 ? srcW : 1);
  const clamped = Math.min(5, Math.max(1, weight));

  let tier = "권장";
  if (clamped >= 5) tier = "필수";
  else if (clamped >= 3) tier = "중요";

  return { weight: clamped, tier, book };
}

function applyWeightTags(q, meta) {
  const strip = new Set(["필수", "중요", "권장", "가중치1", "가중치2", "가중치3", "가중치4", "가중치5"]);
  const tags = (q.tags || []).filter((t) => !strip.has(t));
  tags.push(meta.tier, `가중치${meta.weight}`);
  return {
    ...q,
    weight: meta.weight,
    tags: [...new Set(tags)],
  };
}

function dedupe(questions) {
  const removed = [];

  // 1) exact content (stem + choices)
  const byContent = new Map();
  for (const q of questions) {
    const key = contentKey(q);
    if (key.startsWith("::") || key.length <= 4) continue;
    const prev = byContent.get(key);
    if (!prev) {
      byContent.set(key, q);
      continue;
    }
    if (scoreKeep(q) > scoreKeep(prev)) {
      removed.push({ keep: q.id, drop: prev.id, reason: "exact-content" });
      byContent.set(key, q);
    } else {
      removed.push({ keep: prev.id, drop: q.id, reason: "exact-content" });
    }
  }
  const dropExact = new Set(removed.map((r) => r.drop));
  let kept = questions.filter((q) => !dropExact.has(q.id));

  // 2) cross-source identical soft stem (skip generic short templates)
  const bySoft = new Map();
  for (const q of kept) {
    const stem = softStemKey(q);
    if (!stem || stem.length < 24 || isGenericStem(q.question)) continue;
    const prev = bySoft.get(stem);
    if (!prev) {
      bySoft.set(stem, q);
      continue;
    }
    if (prev.source === q.source) continue;
    if (scoreKeep(q) > scoreKeep(prev)) {
      removed.push({ keep: q.id, drop: prev.id, reason: "cross-source-stem" });
      bySoft.set(stem, q);
    } else {
      removed.push({ keep: prev.id, drop: q.id, reason: "cross-source-stem" });
    }
  }
  const dropAll = new Set(removed.map((r) => r.drop));
  kept = questions.filter((q) => !dropAll.has(q.id));
  return { kept, removed };
}

function main() {
  const raw = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
  let questions = (raw.questions || []).map(fixBroken).map(cleanOtNtTags);

  // only chongshin in bank (jangsin was empty)
  questions = questions.filter((q) => (q.seminary || "chongshin") === "chongshin");

  const before = questions.length;
  const { kept, removed } = dedupe(questions);
  questions = kept;

  // book frequency among 기출 성경
  const bookCounts = Object.fromEntries(KNOWN_BOOKS.map((b) => [b, 0]));
  for (const q of questions) {
    if (q.subject !== "성경") continue;
    if (!(q.tags || []).includes("기출") && !(q.tags || []).includes("문제은행") && !(q.tags || []).includes("원문기출"))
      continue;
    for (const b of KNOWN_BOOKS) {
      if ((q.tags || []).includes(b)) bookCounts[b] += 1;
    }
  }

  questions = questions.map((q) => applyWeightTags(q, computeWeight(q, bookCounts)));

  // sort: weight desc, then subject, then id
  questions.sort((a, b) => {
    const dw = (b.weight || 0) - (a.weight || 0);
    if (dw) return dw;
    if (a.subject !== b.subject) return a.subject.localeCompare(b.subject, "ko");
    return String(a.id).localeCompare(String(b.id));
  });

  const tierCount = { 필수: 0, 중요: 0, 권장: 0 };
  for (const q of questions) {
    if (tierCount[q.tags?.find((t) => t in tierCount)] != null) {
      /* noop */
    }
    for (const t of ["필수", "중요", "권장"]) {
      if ((q.tags || []).includes(t)) tierCount[t] += 1;
    }
  }

  const bookOrder = Object.entries(bookCounts)
    .filter(([, c]) => c > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => {
      let tier = "B";
      if (count >= 100) tier = "S";
      else if (count >= 50) tier = "A";
      return {
        tag,
        label: tag,
        tier,
        count,
        hint: BOOK_HINTS[tag] || "기출 출제권",
      };
    });

  const report = {
    before,
    after: questions.length,
    removed: removed.length,
    removedSample: removed.slice(0, 30),
    tierCount,
    weightHist: [1, 2, 3, 4, 5].map((w) => ({
      w,
      n: questions.filter((q) => q.weight === w).length,
    })),
    bookOrder,
  };

  fs.writeFileSync(QUESTIONS_PATH, JSON.stringify({ questions }, null, 2), "utf8");
  fs.writeFileSync(
    path.join(__dirname, "reorganize-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    path.join(__dirname, "book-tracks.generated.json"),
    JSON.stringify(bookOrder, null, 2),
    "utf8"
  );

  console.log(JSON.stringify({ before, after: questions.length, removed: removed.length, tierCount }, null, 2));
  console.log("top books:", bookOrder.slice(0, 12).map((b) => `${b.tag}:${b.count}`).join(", "));
}

main();
