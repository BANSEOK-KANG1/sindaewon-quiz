/**
 * 날짜별 학습 계획 — 총신 필답·면접(11/28) 20일 계획 (11/9 ~ 11/27)
 * 2026-11-08 작성. 장신은 지원하지 않으므로 계획에서 뺐다.
 * 기준 시간: 평일 성경 약 2시간 + 영어 40분, 주말 성경 약 4~5시간 + 영어 1시간.
 * 성경 순서: 최근 원문기출 → 2026 문제은행 → 옛 기출(00–14) 권별 → 오답·실전.
 */
import { VOCAB_DAY_TRACKS } from "./study-curriculum.js";
import { BOOK_BY_NAME, bookMinutes } from "./book-notes/index.js";

export const PLAN_START = "2026-11-09";

export const EXAMS = {
  chongshin: { date: "2026-11-28", label: "총신 필답·면접", short: "총신" },
};

export const MILESTONES = [
  { date: "2026-11-09", label: "교무입학팀 전화 (지원 자격)", detail: "031-679-1710 · 교적·노회·추천서 요건 확인" },
  { date: "2026-11-10", label: "원서 입력·전형료·등기 발송", detail: "통화 결과 확인 후 · 봉투에 '일반전형/이름'" },
  { date: "2026-11-13", label: "총신 원서·서류 도착 마감", detail: "17:00까지 · 등기 배송 조회" },
  { date: "2026-11-28", label: "총신 필답·면접", detail: "08:00 필답 · 10:50~ 면접" },
];

export const PHASES = {
  recent: { id: "recent", label: "1단계 · 최근 기출·문제은행", goal: "2020–22 원문기출 150 + 2026 문제은행 구약 199·신약 60 + 신약 암송 + 신약 핵심 카드" },
  books: { id: "books", label: "2단계 · 권별 기출 회독", goal: "00–14 기출을 창세기부터 신약까지 · 가중치 높은 문항 먼저" },
  final: { id: "final", label: "3단계 · 오답·실전", goal: "새 문제 없이 오답노트 회독 + 원문기출 시험 모드" },
};

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

/**
 * 퀴즈 단계.
 * tags: 모두 포함해야 하는 태그 · anyTags: 하나 이상 포함 · fresh: 아직 안 푼 문항 우선
 */
function quiz(id, label, detail, { mode = "study", tags, anyTags, subject, seminary = "chongshin", count, minutes, fresh = false }) {
  return { id, kind: "quiz", label, detail, mode, tags, anyTags, subject, seminary, count, fresh, minutes: minutes ?? Math.round(count * 1.1) };
}

function wrongReview(id, count, detail = "틀린 문항만 다시 · 맞히면 오답노트에서 빠짐") {
  return { id, kind: "wrong", label: `오답 복습 ${count}`, detail, mode: "study", count, minutes: Math.round(count * 1.1) };
}

function manual(id, label, detail, minutes) {
  return { id, kind: "manual", label, detail, minutes };
}

/** 권별 핵심 카드 읽기 — 그날 책을 모두 읽으면 자동으로 완료된다 */
function read(books) {
  const label = books.length > 2 ? `${books[0]} ~ ${books[books.length - 1]}` : books.join("·");
  return {
    id: "read",
    kind: "read",
    label: `핵심 읽기 · ${label}`,
    detail: `${books.length}권 · 1분 카드로 먼저 훑고 문제로`,
    books,
    minutes: books.reduce((n, b) => n + bookMinutes(BOOK_BY_NAME[b]), 0),
  };
}

/**
 * 날짜별 핵심 읽기. 신약은 앱 기출이 적어 1단계(11/9–13)에 먼저 읽고,
 * 구약은 2단계에서 그날 풀 기출 범위와 맞춘다. 소선지서와 일반서신은 11/23–24.
 * 하루 순공 2~4시간 기준: 평일 3시간, 주말 4시간 안팎이 되게 맞췄다 (11/8 조정).
 */
const READ_DAYS = {
  "2026-11-09": ["마태복음", "마가복음"],
  "2026-11-10": ["누가복음", "요한복음"],
  "2026-11-11": ["사도행전", "로마서"],
  "2026-11-12": ["고린도전서", "고린도후서", "갈라디아서"],
  "2026-11-13": ["에베소서", "빌립보서", "골로새서", "데살로니가전서", "데살로니가후서"],
  "2026-11-14": ["창세기"],
  "2026-11-15": ["출애굽기", "레위기", "민수기", "신명기"],
  "2026-11-16": ["여호수아", "사사기", "룻기", "사무엘상", "사무엘하"],
  "2026-11-17": ["열왕기상", "열왕기하"],
  "2026-11-18": ["역대상", "역대하", "에스라", "느헤미야", "에스더"],
  "2026-11-19": ["욥기", "시편"],
  "2026-11-20": ["잠언", "전도서", "아가", "이사야"],
  "2026-11-21": ["예레미야", "예레미야애가", "에스겔", "다니엘"],
  "2026-11-22": ["디모데전서", "디모데후서", "디도서", "빌레몬서", "히브리서"],
  // 3단계에도 새 책 읽기는 이어 간다 (문제 대신 카드로)
  "2026-11-23": ["호세아", "요엘", "아모스", "오바댜", "요나", "미가", "나훔", "하박국", "스바냐", "학개", "스가랴", "말라기"],
  "2026-11-24": ["야고보서", "베드로전서", "베드로후서", "요한일서", "요한이서", "요한삼서", "유다서", "요한계시록"],
};

/** 성경 블록을 30문항 안팎의 세트로 나눈다. 같은 범위라도 fresh라서 세트마다 새 문항이 나온다. */
function bibleBlock(prefix, label, total, opts, chunk = 30) {
  const n = Math.max(1, Math.ceil(total / chunk));
  const size = Math.ceil(total / n);
  return Array.from({ length: n }, (_, i) =>
    quiz(`${prefix}-${i + 1}`, n > 1 ? `${label} ${i + 1}/${n}` : label, opts.detail || "", {
      subject: "성경",
      fresh: true,
      ...opts,
      count: i === n - 1 ? total - size * (n - 1) : size,
    })
  );
}

const OLD = ["기출", "00-14"];
const books = (...b) => ({ tags: OLD, anyTags: b });

/** 날짜별 성경 범위 (총 문항은 그날 할 분량 — 범위가 더 크면 가중치 높은 것부터) */
const BIBLE_DAYS = {
  "2026-11-09": { title: "최근 기출 2020–22 (1)", phase: "recent", blocks: [["recent", "원문기출 성경", 75, { tags: ["원문기출"], detail: "2020–22 실제 시험 · 해설까지" }]] },
  "2026-11-10": { title: "최근 기출 2020–22 (2)", phase: "recent", blocks: [["recent", "원문기출 성경", 75, { tags: ["원문기출"], detail: "어제 안 푼 문항 위주" }]] },
  "2026-11-11": { title: "2026 문제은행 · 구약 (1)", phase: "recent", blocks: [["bank-ot", "문제은행 구약", 100, { tags: ["2026문제은행", "구약"], detail: "2026 성경고사 문제은행" }, 34]] },
  "2026-11-12": { title: "2026 문제은행 · 구약 (2)", phase: "recent", blocks: [["bank-ot", "문제은행 구약", 99, { tags: ["2026문제은행", "구약"], detail: "어제 안 푼 문항 위주" }, 33]] },
  "2026-11-13": {
    title: "2026 문제은행 · 신약 (1) + 암송",
    phase: "recent",
    blocks: [
      ["bank-nt", "문제은행 신약", 60, { tags: ["2026문제은행", "신약"], detail: "2026 성경고사 문제은행 · 나머지는 11/22" }, 30],
      ["memory", "신약 암송", 25, { tags: ["암송", "신약"], mode: "flash", detail: "장절 보고 본문 떠올리기" }, 25],
    ],
  },
  "2026-11-14": { title: "창세기", phase: "books", blocks: [["gen", "창세기 기출", 100, { ...books("창세기"), detail: "가장 많이 나온 권 · 가중치 높은 문항 먼저" }]] },
  "2026-11-15": { title: "출애굽기 ~ 룻기", phase: "books", blocks: [["pent", "출애굽기~룻기 기출", 100, { ...books("출애굽기", "레위기", "민수기", "신명기", "여호수아", "사사기", "룻기"), detail: "오경 나머지 + 정복·사사 시대" }]] },
  "2026-11-16": { title: "사무엘상·하", phase: "books", blocks: [["sam", "사무엘 기출", 112, { ...books("사무엘상", "사무엘하"), detail: "사무엘·사울·다윗" }, 28]] },
  "2026-11-17": { title: "열왕기상·하", phase: "books", blocks: [["kings", "열왕기 기출", 120, { ...books("열왕기상", "열왕기하"), detail: "솔로몬·분열 왕국·엘리야·엘리사" }]] },
  "2026-11-18": {
    title: "역대 ~ 에스더 + 암송",
    phase: "books",
    blocks: [
      ["chron", "역대~에스더 기출", 100, { ...books("역대상", "역대하", "에스라", "느헤미야", "에스더"), detail: "포로 귀환·성전·성벽 재건" }, 25],
      ["memory2", "신약 암송", 25, { tags: ["암송", "신약"], mode: "flash", detail: "안 외운 구절 위주" }, 25],
    ],
  },
  "2026-11-19": { title: "욥기·시편", phase: "books", blocks: [["poetry", "욥기·시편 기출", 120, { ...books("욥기", "시편"), detail: "시편은 '필수' 문항이 먼저 나옵니다" }]] },
  "2026-11-20": { title: "잠언 ~ 이사야", phase: "books", blocks: [["isa", "잠언~이사야 기출", 120, { ...books("잠언", "전도서", "아가", "이사야"), detail: "지혜서 + 이사야 메시아 예언" }]] },
  "2026-11-21": {
    title: "예레미야 ~ 말라기",
    phase: "books",
    blocks: [["proph", "예레미야~말라기 기출", 110, { ...books("예레미야", "예레미야애가", "에스겔", "다니엘", "호세아", "요엘", "아모스", "오바댜", "요나", "미가", "나훔", "하박국", "스바냐", "학개", "스가랴", "말라기"), detail: "대선지서 + 소선지서 12권" }]],
  },
  "2026-11-22": {
    title: "문제은행 신약 (2) + 남은 기출",
    phase: "books",
    blocks: [
      ["bank-nt2", "문제은행 신약", 40, { tags: ["2026문제은행", "신약"], detail: "11/13에 안 푼 문항" }, 40],
      ["rest", "안 푼 기출", 60, { tags: OLD, detail: "신약 포함 · 아직 안 푼 문항부터" }, 30],
    ],
  },
};

/** 영어: 11/9~11/23 15일 = 단어장 Day 1~15 */
function englishSteps(key, isWeekend) {
  const i = daysBetween(PLAN_START, key);
  const steps = [];
  if (i >= 0 && i < VOCAB_DAY_TRACKS.length) {
    const day = VOCAB_DAY_TRACKS[i];
    steps.push(
      quiz("vocab", `단어 ${day.label} · 영→한 20`, `${day.theme} (${day.range})`, {
        tags: ["단어장300", day.tag, "영한"],
        subject: "영어",
        count: 20,
        minutes: 12,
      })
    );
    if (i > 0) {
      const prev = VOCAB_DAY_TRACKS[i - 1];
      steps.push(
        quiz("vocab-review", `단어 ${prev.label} · 한→영 복습 20`, "어제 단어 · 뜻 보고 영어 떠올리기", {
          mode: "flash",
          tags: ["단어장300", prev.tag, "한영"],
          subject: "영어",
          count: 20,
          minutes: 8,
        })
      );
    }
    steps.push(
      quiz("eng-past", "원문기출 영어 5", "2020–22 실제 시험 · 질문 먼저 읽고 근거 문장 찾기", {
        tags: ["원문기출"],
        subject: "영어",
        count: 5,
        fresh: true,
        minutes: 10,
      }),
      quiz("grammar", "문법 3", "틀린 보기 이유까지 해설 확인", { tags: ["문법", "신대원영어"], subject: "영어", count: 3, fresh: true, minutes: 5 })
    );
    if (isWeekend) {
      steps.push(
        quiz("eng-mock", "영어 실전 25", "원문기출 시험 모드 · 시간 재고 한 번에", { mode: "exam", tags: ["원문기출"], subject: "영어", count: 25, minutes: 35 })
      );
    }
  } else {
    steps.push(
      quiz("vocab-recall", "단어 한→영 회상 20", "단어장 전체 · 헷갈린 단어 위주", {
        mode: "flash",
        tags: ["단어장300", "한영"],
        subject: "영어",
        count: 20,
        minutes: 10,
      })
    );
  }
  return steps;
}

function buildDay(key) {
  const d = parseDateKey(key);
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const exam = EXAMS.chongshin.date;

  if (key === exam) {
    return {
      phase: "final",
      title: "시험일 · 총신 필답·면접",
      examDay: true,
      steps: [manual("exam", "총신 필답·면접", "08:00 필답 시작 전 도착 · 수험표·신분증·필기구 · 결시 과목 있으면 불합격", 0)],
    };
  }

  const bible = BIBLE_DAYS[key];
  if (bible) {
    const steps = bible.blocks.flatMap(([prefix, label, total, opts, chunk]) => bibleBlock(prefix, label, total, opts, chunk));
    if (READ_DAYS[key]) steps.unshift(read(READ_DAYS[key]));
    steps.push(...englishSteps(key, isWeekend));
    if (isWeekend) steps.push(manual("interview", "면접 답변 30분", "면접준비.md · 소명, 왜 총신, 통합 교회 교적 설명, 개혁주의 기초", 30));
    return { phase: bible.phase, title: bible.title, steps };
  }

  // 3단계: 오답·실전 (11/23 ~ 11/27)
  const finalDays = {
    "2026-11-23": {
      title: "오답노트 1회독 (1) + 소선지서 카드",
      steps: [wrongReview("wrong-1", 40), wrongReview("wrong-2", 40)],
    },
    "2026-11-24": {
      title: "오답노트 1회독 (2) + 일반서신 카드 + 리허설",
      steps: [
        wrongReview("wrong-1", 40),
        wrongReview("wrong-2", 40),
        quiz("must", "필수 가중 15", "가중치 5 문항 무작위 · 인물·지명·숫자 확인", { tags: ["필수"], subject: "성경", count: 15 }),
        manual("rehearsal", "면접 리허설 1", "소리 내어 · 가족이나 목사님 앞에서", 30),
      ],
    },
    "2026-11-25": {
      title: "원문기출 실전 (시간 재기)",
      steps: [
        quiz("mock-1", "원문기출 성경 실전 1/3", "시험 모드 · 시간 재고 한 번에", { mode: "exam", tags: ["원문기출"], subject: "성경", count: 50, minutes: 55 }),
        quiz("mock-2", "원문기출 성경 실전 2/3", "시험 모드", { mode: "exam", tags: ["원문기출"], subject: "성경", count: 50, minutes: 55, fresh: true }),
        quiz("mock-3", "원문기출 성경 실전 3/3", "시험 모드", { mode: "exam", tags: ["원문기출"], subject: "성경", count: 50, minutes: 55, fresh: true }),
        quiz("mock-eng", "원문기출 영어 실전 30", "시험 모드", { mode: "exam", tags: ["원문기출"], subject: "영어", count: 30, minutes: 40 }),
      ],
    },
    "2026-11-26": {
      title: "오답노트 2회독 + 면접 리허설",
      steps: [
        wrongReview("wrong-1", 40, "계속 틀리는 문항만 남았는지 확인"),
        wrongReview("wrong-2", 40, "계속 틀리는 문항만 남았는지 확인"),
        manual("rehearsal", "면접 리허설 2", "예상 질문 전부 소리 내어 한 번씩", 30),
      ],
    },
    "2026-11-27": {
      title: "시험 전날 · 가볍게",
      steps: [
        wrongReview("wrong-1", 20, "새로 외우지 말고 아는 것 확인"),
        manual("ready", "준비물·동선 확인", "수험표 출력, 신분증, 필기구, 양지캠퍼스 이동 시간 · 일찍 자기", 10),
      ],
    },
  };
  const fd = finalDays[key];
  if (!fd) return null;
  const finalSteps = [...fd.steps, ...englishSteps(key, false)];
  if (READ_DAYS[key]) finalSteps.unshift(read(READ_DAYS[key]));
  return { phase: "final", title: fd.title, steps: finalSteps };
}

/** 11/9 ~ 11/28 고정 일정. startKey는 하위 호환용으로 받기만 한다. */
export function buildPlan(_startKey) {
  const days = [];
  for (let i = 0, key = PLAN_START; daysBetween(key, EXAMS.chongshin.date) >= 0; i += 1, key = addDays(key, 1)) {
    const day = buildDay(key);
    if (!day) continue;
    const milestones = MILESTONES.filter((m) => m.date === key);
    if (!day.examDay) {
      for (const m of milestones) day.steps.unshift(manual(`ms-${m.date}`, m.label, m.detail, 10));
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

/** 오늘 계획. 시작일 전이면 1일차를 미리 보여 준다 (미리 풀면 1일차 기록으로 남음). */
export function focusDay(plan, todayKey) {
  const day = plan.find((d) => d.date === todayKey);
  if (day) return day;
  if (plan.length && todayKey < plan[0].date) return { ...plan[0], preview: true };
  return null;
}

/** 오늘 계획 중 아직 안 한 첫 퀴즈 단계 (수동 체크 단계는 건너뜀) */
export function nextPlanStep(plan, done, todayKey) {
  const day = focusDay(plan, todayKey);
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
