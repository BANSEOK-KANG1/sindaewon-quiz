/** 날짜별 학습 계획 — 총신 필답(11/28) → 장신 성경·논술(12/10) */
import { BIBLE_BOOK_TRACKS, VOCAB_DAY_TRACKS, EXAM_TYPE_TRACKS } from "./study-curriculum.js";

const typeLabel = (tag) => EXAM_TYPE_TRACKS.find((t) => t.tag === tag)?.label || tag;

export const EXAMS = {
  chongshin: { date: "2026-11-28", label: "총신 필답·면접", short: "총신" },
  jangsin: { date: "2026-12-10", label: "장신 성경·논술", short: "장신" },
};

export const MILESTONES = [
  { date: "2026-11-02", label: "총신 원서접수 시작", detail: "~11/13 17:00 · 서류 도착 마감 동일" },
  { date: "2026-11-10", label: "장신 원서접수 시작", detail: "~11/12 17:00" },
  { date: "2026-11-12", label: "장신 원서접수 마감", detail: "17:00까지" },
  { date: "2026-11-13", label: "총신 원서·서류 도착 마감", detail: "17:00까지" },
  { date: "2026-11-20", label: "장신 추천소견서·자기소개서 마감", detail: "17:00까지" },
  { date: "2026-11-28", label: "총신 필답·면접", detail: "시험일" },
  { date: "2026-12-10", label: "장신 성경·논술", detail: "시험일" },
  { date: "2027-01-06", label: "장신 면접", detail: "1/6–1/7" },
];

export const PHASES = {
  base: { id: "base", label: "1단계 · 기초 다지기", goal: "신(약) 유형 + 다빈도 권 + 단어 1회독(영→한)" },
  expand: { id: "expand", label: "2단계 · 유형 확장", goal: "성종·신유형·목유형 + 단어 2·3회독 + 문법·독해" },
  final: { id: "final", label: "3단계 · 총신 실전", goal: "매일 모의 50문항 + 약점 권 + 단어 회상" },
  jangsin: { id: "jangsin", label: "4단계 · 장신 집중", goal: "암송 25구절 + 장신 문제집 + 논술 개요" },
};

const BASE_TYPES = ["신_유형"];
const EXPAND_TYPES = ["성종유형", "신유형", "목유형", "신_유형", "성(여)유형", "성(겨)유형"];

const VOCAB_PASSES = [
  { tag: "영한", mode: "study", label: "영→한", pass: "1회독" },
  { tag: "동의어", mode: "study", label: "동의어", pass: "2회독" },
  { tag: "반의어", mode: "study", label: "반의어", pass: "3회독" },
  { tag: "한영", mode: "flash", label: "한→영 회상", pass: "4회독" },
];

const MOCK_SETS = [
  { tags: ["필수"], label: "필수 가중 모의 25", count: 25, subject: "성경" },
  { tags: ["문제은행"], label: "문제은행 모의 30", count: 30, subject: "성경" },
  { tags: ["기출"], label: "총신 기출 통합 모의 25", count: 25, subject: "성경" },
  { tags: ["2022학년도"], label: "2022학년도 성경 25", count: 25, subject: "성경" },
];

const ESSAY_TOPICS = [
  "소명: 왜 목회자의 길을 가려 하는가",
  "교회의 공공성과 사회적 책임",
  "성경 해석의 원리와 설교",
  "고난과 신앙 — 욥기·시편을 중심으로",
  "다음 세대 신앙 교육",
  "예배의 본질과 회복",
  "선교적 교회와 지역 사회",
  "한국 교회의 위기와 갱신",
];

const S_BOOKS = BIBLE_BOOK_TRACKS.filter((b) => b.tier === "S");
const A_BOOKS = BIBLE_BOOK_TRACKS.filter((b) => b.tier === "A");
const B_BOOKS = BIBLE_BOOK_TRACKS.filter((b) => b.tier === "B");

/** S권은 이틀씩, A·B권은 하루씩 — 기초·확장 기간에 순환 */
const BOOK_ROTATION = [
  ...S_BOOKS.flatMap((b) => [b, b]),
  ...A_BOOKS,
  ...B_BOOKS,
];

const DAY_MS = 86400000;

export function toDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, n) {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

export function daysBetween(fromKey, toKey) {
  return Math.round((parseDateKey(toKey) - parseDateKey(fromKey)) / DAY_MS);
}

export function formatDateLabel(key) {
  const d = parseDateKey(key);
  const w = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()} (${w})`;
}

function quiz(id, label, detail, { mode = "study", tags, subject, seminary = "chongshin", count, minutes }) {
  return { id, kind: "quiz", label, detail, mode, tags, subject, seminary, count, minutes };
}

function wrongReview(id, count = 15) {
  return {
    id,
    kind: "wrong",
    label: `오답 복습 ${count}`,
    detail: "이번 주 틀린 문항만 다시 — 맞히면 오답노트에서 빠짐",
    mode: "study",
    count,
    minutes: 15,
  };
}

function manual(id, label, detail, minutes) {
  return { id, kind: "manual", label, detail, minutes };
}

function memoryStep(id) {
  return quiz(id, "장신 암송 5구절", "2027 입시 25구절에서 무작위 5개 · 장절 보고 본문 소리 내어", {
    mode: "flash",
    tags: ["구약암송", "한암송"],
    subject: "성경",
    seminary: "jangsin",
    count: 5,
    minutes: 10,
  });
}

function vocabStep(id, vocabIndex, review = false) {
  const pass = VOCAB_PASSES[Math.floor(vocabIndex / VOCAB_DAY_TRACKS.length) % VOCAB_PASSES.length];
  const day = VOCAB_DAY_TRACKS[vocabIndex % VOCAB_DAY_TRACKS.length];
  return quiz(
    id,
    `단어 ${day.label} · ${pass.label}${review ? " 복습" : ""}`,
    `${review ? "어제 단어 다시 · " : ""}${pass.pass} · ${day.theme} (${day.range}) 20개`,
    { mode: pass.mode, tags: ["단어장300", day.tag, pass.tag], subject: "영어", count: 20, minutes: 15 }
  );
}

function englishSkillStep(id, dayIndex) {
  return dayIndex % 2 === 0
    ? quiz(id, "영어 문법 10", "어법 판단 · 틀린 보기 이유까지 해설 확인", {
        tags: ["문법"],
        subject: "영어",
        count: 10,
        minutes: 15,
      })
    : quiz(id, "영어 독해 10", "주제·빈칸·내용일치 · 지문 끝까지 읽고 풀기", {
        tags: ["독해"],
        subject: "영어",
        count: 10,
        minutes: 20,
      });
}

function bookStep(id, book, count) {
  return quiz(id, `${book.label} 기출 ${count}`, `빈도 ${book.tier}권 · ${book.hint}`, {
    tags: ["기출", book.tag],
    subject: "성경",
    count,
    minutes: Math.round(count * 1.2),
  });
}

function buildChongshinDay(phaseId, ctx) {
  const steps = [];
  const isMockDay = phaseId !== "final" && ctx.phaseDay % 7 === 6;

  if (isMockDay) {
    steps.push(
      quiz("mock-bible", "주간 모의 · 필수 성경 25", "시험 모드 · 시간 재고 한 번에", {
        mode: "exam",
        tags: ["필수"],
        subject: "성경",
        count: 25,
        minutes: 30,
      }),
      quiz("mock-eng", "주간 모의 · 원문기출 영어 25", "2020–22 원문 · 시험 모드", {
        mode: "exam",
        tags: ["원문기출"],
        subject: "영어",
        count: 25,
        minutes: 35,
      }),
      wrongReview("wrong", 20),
      vocabStep("vocab", Math.max(0, ctx.vocabIndex - 1), true),
      memoryStep("memory")
    );
    return { steps, title: "주간 모의고사 + 한 주 복습" };
  }

  if (phaseId === "final") {
    const mock = MOCK_SETS[ctx.phaseDay % MOCK_SETS.length];
    const book = [...S_BOOKS, ...A_BOOKS.slice(0, 4)][ctx.phaseDay % (S_BOOKS.length + 4)];
    steps.push(
      quiz("mock", `실전 · ${mock.label}`, "시험 모드 · 시간 재고 끝까지", {
        mode: "exam",
        tags: mock.tags,
        subject: mock.subject,
        count: mock.count,
        minutes: Math.round(mock.count * 1.2),
      }),
      ctx.phaseDay % 2 === 0
        ? quiz("eng", "실전 · 원문기출 영어 15", "시험 모드", {
            mode: "exam",
            tags: ["원문기출"],
            subject: "영어",
            count: 15,
            minutes: 20,
          })
        : englishSkillStep("eng", 1),
      bookStep("book", book, 10),
      quiz("vocab", "단어 한→영 회상 20", "단어장 전체 무작위 · 뜻 보고 영어 떠올리기", {
        mode: "flash",
        tags: ["단어장300", "한영"],
        subject: "영어",
        count: 20,
        minutes: 15,
      }),
      wrongReview("wrong", 10),
      memoryStep("memory")
    );
    return { steps, title: `실전 모의 · ${book.label} 점검` };
  }

  const book = BOOK_ROTATION[ctx.bookIndex % BOOK_ROTATION.length];
  ctx.bookIndex += 1;
  const types = phaseId === "base" ? BASE_TYPES : EXPAND_TYPES;
  const typeTag = types[ctx.phaseDay % types.length];
  const typeCount = phaseId === "base" ? 20 : 15;
  steps.push(
    quiz("type", `${typeLabel(typeTag)} ${typeCount}`, phaseId === "base" ? "필답 최다 유형 · 해설 읽으며 개념 정리" : "유형 순환 · 틀린 보기 메모", {
      tags: [typeTag],
      subject: "성경",
      count: typeCount,
      minutes: Math.round(typeCount * 1.2),
    }),
    bookStep("book", book, book.tier === "S" ? 15 : 12),
    vocabStep("vocab", ctx.vocabIndex),
    ...(phaseId === "expand" || ctx.phaseDay >= 3 ? [englishSkillStep("eng", ctx.phaseDay)] : []),
    memoryStep("memory")
  );
  ctx.vocabIndex += 1;
  return { steps, title: `${book.label} · ${typeLabel(typeTag)}` };
}

function buildJangsinDay(j) {
  const levels = ["난이도A", "난이도B", "난이도C"];
  const books = ["시편", "이사야", "창세기"];
  const level = levels[j % levels.length];
  const book = books[j % books.length];
  const recall = j % 2 === 0
    ? { tags: ["구약암송", "장절맞히기"], label: "장절 맞히기 15", detail: "본문 보고 장절 고르기" }
    : { tags: ["구약암송", "본문맞히기"], label: "본문 맞히기 15", detail: "장절 보고 본문 고르기" };
  return {
    title: `장신 · ${level.replace("난이도", "난이도 ")} · ${book}`,
    steps: [
      quiz("memory-all", "암송 25구절 전체 플래시", "2027 입시 구절 · 장절→본문 소리 내어", {
        mode: "flash",
        tags: ["구약암송", "한암송"],
        subject: "성경",
        seminary: "jangsin",
        count: 25,
        minutes: 25,
      }),
      quiz("recall", recall.label, recall.detail, {
        tags: recall.tags,
        subject: "성경",
        seminary: "jangsin",
        count: 15,
        minutes: 15,
      }),
      quiz("bank", `장신 문제집 ${level.replace("난이도", "")} 15`, "정답 미수록 · 풀고 해설·본문으로 자기 채점", {
        tags: ["장신", level],
        subject: "성경",
        seminary: "jangsin",
        count: 15,
        minutes: 20,
      }),
      quiz("book", `장신 · ${book} 10`, "장신 다빈도 권", {
        tags: ["장신", book],
        subject: "성경",
        seminary: "jangsin",
        count: 10,
        minutes: 12,
      }),
      manual("essay", "논술 개요 1편", `주제: ${ESSAY_TOPICS[j % ESSAY_TOPICS.length]} — 서론·본론 3단·결론 개요를 손으로`, 40),
    ],
  };
}

/**
 * startKey부터 장신 시험일까지 하루 단위 계획.
 * 총신 이전 기간을 기초(55%)·확장(45%)·실전(마지막 최소 7일)으로 나눈다.
 */
export function buildPlan(startKey) {
  const chongshin = EXAMS.chongshin.date;
  const jangsin = EXAMS.jangsin.date;
  const days = [];
  const ctx = { bookIndex: 0, vocabIndex: 0, phaseDay: 0 };

  const studyDays = Math.max(0, daysBetween(startKey, chongshin) - 1);
  const finalLen = Math.min(studyDays, Math.max(7, Math.round(studyDays * 0.25)));
  const preFinal = studyDays - finalLen;
  const baseLen = Math.ceil(preFinal * 0.55);

  let lastPhase = null;
  let jangsinIndex = 0;

  for (let i = 0, key = startKey; daysBetween(key, jangsin) >= 0; i += 1, key = addDays(key, 1)) {
    const milestones = MILESTONES.filter((m) => m.date === key);
    let day;

    if (key === chongshin || key === jangsin) {
      const exam = key === chongshin ? EXAMS.chongshin : EXAMS.jangsin;
      day = {
        phase: key === chongshin ? "final" : "jangsin",
        title: `시험일 · ${exam.label}`,
        examDay: true,
        steps: [manual("exam", exam.label, "수험표·신분증·필기구 확인 후 출발", 0)],
      };
    } else if (key === addDays(chongshin, -1) || key === addDays(jangsin, -1)) {
      const isChongshin = key === addDays(chongshin, -1);
      day = {
        phase: isChongshin ? "final" : "jangsin",
        title: "시험 전날 · 가볍게 정리",
        steps: isChongshin
          ? [
              quiz("light", "필수 성경 15", "새로 외우지 말고 아는 것 확인", {
                tags: ["필수"],
                subject: "성경",
                count: 15,
                minutes: 15,
              }),
              quiz("vocab", "단어 동의어 15", "헷갈렸던 단어만 훑기", {
                tags: ["단어장300", "동의어"],
                subject: "영어",
                count: 15,
                minutes: 10,
              }),
              wrongReview("wrong", 10),
              manual("ready", "준비물·동선 확인", "수험표 출력, 신분증, 필기구, 고사장 이동 시간", 10),
            ]
          : [
              quiz("memory-all", "암송 25구절 최종 점검", "장절→본문 전체", {
                mode: "flash",
                tags: ["구약암송", "한암송"],
                subject: "성경",
                seminary: "jangsin",
                count: 25,
                minutes: 25,
              }),
              manual("essay", "논술 개요 다시 보기", "써 둔 개요 중 3편만 소리 내어 읽기", 20),
              manual("ready", "준비물·동선 확인", "수험표, 신분증, 필기구, 고사장 이동 시간", 10),
            ],
      };
    } else if (daysBetween(key, chongshin) > 0) {
      const phaseId = i < baseLen ? "base" : i < preFinal ? "expand" : "final";
      if (phaseId !== lastPhase) {
        ctx.phaseDay = 0;
        lastPhase = phaseId;
      }
      const built = buildChongshinDay(phaseId, ctx);
      ctx.phaseDay += 1;
      day = { phase: phaseId, ...built };
    } else {
      day = { phase: "jangsin", ...buildJangsinDay(jangsinIndex) };
      jangsinIndex += 1;
    }

    for (const m of milestones) {
      if (day.examDay) continue;
      day.steps.push(manual(`ms-${m.date}`, m.label, m.detail, 10));
    }

    days.push({
      date: key,
      dayNo: i + 1,
      week: Math.floor(i / 7) + 1,
      milestones,
      minutes: day.steps.reduce((sum, s) => sum + (s.minutes || 0), 0),
      ...day,
    });
  }
  return days;
}

/** 오늘 계획 퀴즈 단계의 문항 수 합 — 오늘 목표로 쓴다 */
export function planQuestionGoal(day, fallback = 30) {
  const n = (day?.steps || []).reduce((sum, s) => sum + (s.kind === "manual" ? 0 : s.count || 0), 0);
  return n || fallback;
}

export function stepKey(date, stepId) {
  return `${date}:${stepId}`;
}

/** 오늘 계획 중 아직 안 한 첫 퀴즈 단계 (수동 체크 단계는 건너뜀) */
export function nextPlanStep(plan, done, todayKey) {
  const day = plan.find((d) => d.date === todayKey);
  if (!day) return null;
  const step = day.steps.find((s) => s.kind !== "manual" && !done[stepKey(day.date, s.id)]);
  return step ? { day, step } : null;
}

export function findPlanStep(plan, key) {
  const [date, id] = key.split(":");
  const day = plan.find((d) => d.date === date);
  const step = day?.steps.find((s) => s.id === id);
  return step ? { day, step } : null;
}

export function dDay(todayKey, examKey) {
  const n = daysBetween(todayKey, examKey);
  if (n > 0) return `D-${n}`;
  if (n === 0) return "D-day";
  return `D+${-n}`;
}
