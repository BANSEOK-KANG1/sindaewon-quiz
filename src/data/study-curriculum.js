/** 총신 신대원 필답 — 기출 유형·권별 빈도 가중치 기반 커리큘럼 */

/**
 * 기출 유형 중요도 (출제량·필답 비중)
 * weight 5=필수 … 2=보조
 */
export const EXAM_TYPE_TRACKS = [
  {
    tag: "신_유형",
    label: "신(약) 유형",
    hint: "필답 최다 · 가중치 최고",
    weight: 5,
    tier: "S",
    recommend: 25,
  },
  {
    tag: "성종유형",
    label: "성종유형",
    hint: "성경 종합 · 고빈도",
    weight: 4,
    tier: "A",
    recommend: 20,
  },
  {
    tag: "신유형",
    label: "신유형",
    hint: "신약 변형·단답",
    weight: 4,
    tier: "A",
    recommend: 15,
  },
  {
    tag: "목유형",
    label: "목유형",
    hint: "목회·실천",
    weight: 3,
    tier: "A",
    recommend: 15,
  },
  {
    tag: "성(여)유형",
    label: "성(여) 유형",
    hint: "여름학기 패턴",
    weight: 2,
    tier: "B",
    recommend: 10,
  },
  {
    tag: "성(겨)유형",
    label: "성(겨) 유형",
    hint: "겨울학기 패턴",
    weight: 2,
    tier: "B",
    recommend: 10,
  },
];

/** 중요도 티어 트랙 (문항 weight 태그) */
export const IMPORTANCE_TRACKS = [
  { tag: "필수", label: "필수 (가중치 5)", hint: "신_유형·원문기출·다빈도권", recommend: 20, mode: "study", weight: 5 },
  { tag: "중요", label: "중요 (가중치 3–4)", hint: "성종·신유형·문제은행", recommend: 20, mode: "study", weight: 4 },
  { tag: "권장", label: "권장 (가중치 1–2)", hint: "보조·암송·저빈도", recommend: 15, mode: "study", weight: 2 },
];

/**
 * 성경 권별 — 기출+문제은행+원문 합산 빈도순
 * (scripts/reorganize-bank.js 재집계)
 */
export const BIBLE_BOOK_TRACKS = [
  { tag: "창세기", label: "창세기", tier: "S", hint: "이스라엘 조상·언약·제단", count: 571 },
  { tag: "시편", label: "시편", tier: "S", hint: "다윗·찬양·시편 저자", count: 177 },
  { tag: "이사야", label: "이사야", tier: "S", hint: "메시아 예언·심판", count: 121 },
  { tag: "출애굽기", label: "출애굽기", tier: "S", hint: "모세·십계명·광야", count: 101 },
  { tag: "열왕기하", label: "열왕기하", tier: "A", hint: "엘리야·엘리사·북왕", count: 95 },
  { tag: "예레미야", label: "예레미야", tier: "A", hint: "심판·새 언약", count: 92 },
  { tag: "민수기", label: "민수기", tier: "A", hint: "광야·인구조사·레위", count: 84 },
  { tag: "열왕기상", label: "열왕기상", tier: "A", hint: "솔로몬·성전·엘리야", count: 76 },
  { tag: "에스겔", label: "에스겔", tier: "A", hint: "환상·성전·회복", count: 76 },
  { tag: "레위기", label: "레위기", tier: "A", hint: "제사·정결·절기", count: 71 },
  { tag: "신명기", label: "신명기", tier: "A", hint: "율법·가나안 입성", count: 70 },
  { tag: "잠언", label: "잠언", tier: "A", hint: "지혜·솔로몬", count: 69 },
  { tag: "욥기", label: "욥기", tier: "B", hint: "고난·의인의 길", count: 66 },
  { tag: "사사기", label: "사사기", tier: "B", hint: "사사·순환", count: 64 },
  { tag: "여호수아", label: "여호수아", tier: "B", hint: "가나안 정복", count: 63 },
  { tag: "사무엘상", label: "사무엘상", tier: "B", hint: "사무엘·사울·다윗", count: 61 },
  { tag: "사무엘하", label: "사무엘하", tier: "B", hint: "다윗 왕국", count: 53 },
  { tag: "전도서", label: "전도서", tier: "B", hint: "허무·지혜", count: 45 },
  { tag: "다니엘", label: "다니엘", tier: "B", hint: "환상·바벨론", count: 44 },
  { tag: "느헤미야", label: "느헤미야", tier: "B", hint: "성벽 재건", count: 42 },
];

/** 실전 세트 — 원문기출·문제은행·통합 기출을 한 섹션으로 */
export const PRACTICE_TRACKS = [
  {
    label: "필수 가중 모의",
    tags: ["필수"],
    hint: "가중치 5 · 객관식 중심",
    recommend: 25,
    mode: "exam",
    subject: "성경",
  },
  {
    label: "총신 기출 통합",
    tags: ["기출"],
    hint: "00–14 Quizlet + 태그 기출",
    recommend: 20,
    mode: "study",
    subject: "성경",
    seminary: "chongshin",
  },
  {
    label: "2020–22 원문기출",
    tags: ["원문기출"],
    hint: "HWP 영어·성경 300문항",
    recommend: 25,
    mode: "exam",
  },
  {
    label: "2026 성경고사 문제은행",
    tags: ["문제은행"],
    hint: "구약·신약 400문항",
    recommend: 30,
    mode: "exam",
    subject: "성경",
  },
  {
    label: "2022 성경",
    tags: ["2022학년도"],
    subject: "성경",
    hint: "최근 학년도",
    recommend: 25,
    mode: "exam",
  },
  {
    label: "2022 영어",
    tags: ["2022학년도"],
    subject: "영어",
    hint: "최근 학년도",
    recommend: 25,
    mode: "exam",
  },
];

/** 장신 대학 성경종합고사 문제집 [구약] — 정답 미수록(탐색·표시용) */
export const JANGSIN_TRACKS = [
  { label: "장신 구약 전체", tags: ["장신", "장신기출"], hint: "문제집 300문항 · 정답 추후 반영", recommend: 20, subject: "성경", seminary: "jangsin", mode: "study" },
  { label: "난이도 A (기초)", tags: ["장신", "난이도A"], hint: "필수 기초", recommend: 15, subject: "성경", seminary: "jangsin" },
  { label: "난이도 B", tags: ["장신", "난이도B"], hint: "중요", recommend: 15, subject: "성경", seminary: "jangsin" },
  { label: "난이도 C", tags: ["장신", "난이도C"], hint: "심화", recommend: 15, subject: "성경", seminary: "jangsin" },
  { label: "장신 · 시편", tags: ["장신", "시편"], hint: "다빈도", recommend: 15, subject: "성경", seminary: "jangsin" },
  { label: "장신 · 이사야", tags: ["장신", "이사야"], hint: "예언서", recommend: 10, subject: "성경", seminary: "jangsin" },
  { label: "장신 · 창세기", tags: ["장신", "창세기"], hint: "모세오경", recommend: 10, subject: "성경", seminary: "jangsin" },
];

/** 장신 2027 입시 구약 암송 (개역개정 본문) */
export const JANGSIN_MEMORY_TRACKS = [
  {
    label: "암송 전체 (플래시)",
    tags: ["구약암송", "한암송"],
    hint: "2027 입시 25구절 · 장절→본문",
    recommend: 25,
    subject: "성경",
    seminary: "jangsin",
    mode: "flash",
  },
  {
    label: "장절 맞히기",
    tags: ["구약암송", "장절맞히기"],
    hint: "본문 보고 장절 고르기",
    recommend: 15,
    subject: "성경",
    seminary: "jangsin",
    mode: "study",
  },
  {
    label: "본문 맞히기",
    tags: ["구약암송", "본문맞히기"],
    hint: "장절 보고 본문 고르기",
    recommend: 15,
    subject: "성경",
    seminary: "jangsin",
    mode: "study",
  },
  {
    label: "한→암송 (단답)",
    tags: ["구약암송", "한암송"],
    hint: "장절 보고 본문 입력",
    recommend: 15,
    subject: "성경",
    seminary: "jangsin",
    mode: "flash",
  },
];

/** @deprecated 하위 호환 — PRACTICE_TRACKS로 통합 */
export const BIBLE_BANK_TRACKS = [
  { label: "문제은행 전체", tags: ["문제은행"], hint: "구약+신약 400문항", recommend: 20 },
  { label: "문제은행 구약", tags: ["문제은행", "구약"], hint: "구약 200문항", recommend: 20 },
  { label: "문제은행 신약", tags: ["문제은행", "신약"], hint: "신약 200문항", recommend: 20 },
];

/** @deprecated */
export const ORIGINAL_EXAM_TRACKS = [
  { label: "원문기출 전체", tags: ["원문기출"], hint: "20–22 영어+성경", recommend: 20 },
];

/** 영단어장 300 — 15일 코스 */
export const VOCAB_DAY_TRACKS = [
  { day: 1, tag: "Day1", label: "Day 1", theme: "판단·칭찬·비난", range: "001–020" },
  { day: 2, tag: "Day2", label: "Day 2", theme: "명료성·말하기·전달", range: "021–040" },
  { day: 3, tag: "Day3", label: "Day 3", theme: "감정·성향·태도", range: "041–060" },
  { day: 4, tag: "Day4", label: "Day 4", theme: "갈등·위험·방해", range: "061–080" },
  { day: 5, tag: "Day5", label: "Day 5", theme: "변화·포기·통제", range: "081–100" },
  { day: 6, tag: "Day6", label: "Day 6", theme: "양·정도·가치 판단", range: "101–120" },
  { day: 7, tag: "Day7", label: "Day 7", theme: "제도·관계·소유", range: "121–140" },
  { day: 8, tag: "Day8", label: "Day 8", theme: "사고·학문·판단", range: "141–160" },
  { day: 9, tag: "Day9", label: "Day 9", theme: "고난·도덕·인내", range: "161–180" },
  { day: 10, tag: "Day10", label: "Day 10", theme: "성경 서사 핵심어", range: "181–200", focus: "신학" },
  { day: 11, tag: "Day11", label: "Day 11", theme: "구원·교리 핵심어", range: "201–220", focus: "신학" },
  { day: 12, tag: "Day12", label: "Day 12", theme: "교회·선교·사역", range: "221–240", focus: "신학" },
  { day: 13, tag: "Day13", label: "Day 13", theme: "성경해석·신학 독해", range: "241–260", focus: "신학" },
  { day: 14, tag: "Day14", label: "Day 14", theme: "유사 난이도 예상어", range: "261–280" },
  { day: 15, tag: "Day15", label: "Day 15", theme: "빈출 구문·결합 표현", range: "281–300", focus: "구문" },
];

export const ENGLISH_DRILL_TRACKS = [
  { tag: "영한", label: "영→한 (1회독)", hint: "영어 보고 뜻 고르기", recommend: 20, mode: "study" },
  { tag: "한영", label: "한→영 (2회독)", hint: "뜻 보고 단어 회상", recommend: 20, mode: "flash" },
  { tag: "동의어", label: "동의어 (3회독)", hint: "보기 소거·유의어", recommend: 15, mode: "study" },
  { tag: "반의어", label: "반의어", hint: "반대 의미 판별", recommend: 15, mode: "study" },
  { tag: "신학영어", label: "성경·신학 영어", hint: "Day 10–13 핵심어", recommend: 20, mode: "study" },
  { tag: "구문", label: "빈출 구문", hint: "전치사·결합 표현", recommend: 15, mode: "study" },
  { tag: "기출어휘", label: "기출 등장어", hint: "20·21·22학년도 출현", recommend: 20, mode: "study" },
];

export const BIBLE_ENGLISH_TRACKS = [
  { label: "성경 독해", tags: ["성경영어", "독해"], hint: "영어 구절 → 한글 뜻", mode: "study", recommend: 15 },
  { label: "구절 암송", tags: ["성경영어", "암송"], hint: "한글 보고 ESV 회상", mode: "flash", recommend: 15 },
  { label: "핵심어 빈칸", tags: ["성경영어", "빈칸"], hint: "신학 단어 채우기", mode: "study", recommend: 10 },
];

export const BIBLE_ENGLISH_THEMES = [
  { tag: "구원", label: "구원", hint: "redemption·salvation" },
  { tag: "은혜", label: "은혜", hint: "grace·mercy" },
  { tag: "믿음", label: "믿음", hint: "faith·belief" },
  { tag: "사랑", label: "사랑", hint: "love·charity" },
  { tag: "거룩", label: "거룩", hint: "holiness·sanctify" },
  { tag: "창조", label: "창조", hint: "creation·image" },
  { tag: "율법", label: "율법", hint: "law·commandment" },
  { tag: "소망", label: "소망", hint: "hope·strength" },
  { tag: "기도", label: "기도", hint: "prayer" },
  { tag: "교회", label: "교회", hint: "church·mission" },
];

export const GRAMMAR_TRACKS = [
  { tag: "관계대명사", label: "관계대명사", hint: "who·whom·whose·which·what" },
  { tag: "가정법", label: "가정법", hint: "if were·would have p.p." },
  { tag: "분사", label: "분사구문", hint: "-ing·p.p. 분사" },
  { tag: "수동태", label: "수동태", hint: "be + p.p." },
  { tag: "접속사", label: "접속사", hint: "so that·lest·unless" },
  { tag: "전치사", label: "전치사", hint: "by·through·despite" },
  { tag: "수일치", label: "주어·동사 일치", hint: "each·neither nor" },
  { tag: "비교급", label: "비교급", hint: "the 비교급, the 비교급" },
  { tag: "도치", label: "도치", hint: "not only·seldom 문두" },
  { tag: "가정법현재", label: "가정법 현재", hint: "command/important that + 원형" },
];

/** 전략 루틴 — 유형 가중치 + 다빈도권 */
export const STRATEGY_PHASES = [
  {
    id: "phase1",
    label: "1단계 · 필수 유형",
    days: "1–10일",
    bible: ["창세기", "시편", "이사야", "출애굽기"],
    bibleHint: "빈도 S권 + 신_유형",
    examTypes: ["신_유형"],
    vocabDays: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    vocabHint: "일반 어휘 Day 1–9",
    goal: "신_유형·창세기 집중 + 단어 180개",
  },
  {
    id: "phase2",
    label: "2단계 · 중요 확장",
    days: "11–20일",
    bible: ["열왕기하", "예레미야", "민수기", "열왕기상", "에스겔"],
    bibleHint: "빈도 A권",
    examTypes: ["성종유형", "신유형", "목유형"],
    vocabDays: [10, 11, 12, 13],
    vocabHint: "성경·신학 영어",
    goal: "성종·신유형 + 신학 어휘",
  },
  {
    id: "phase3",
    label: "3단계 · 실전 마무리",
    days: "21–30일",
    bible: ["레위기", "신명기", "잠언", "욥기"],
    bibleHint: "B권 + 원문·문제은행 모의",
    examTypes: ["성(여)유형", "성(겨)유형"],
    vocabDays: [14, 15],
    vocabHint: "예상어·구문 + 동의/반의",
    goal: "필수 가중 모의 + 단어장 회상",
  },
];

export const QUICK_SETS = [
  {
    id: "must",
    mode: "study",
    tags: ["필수"],
    count: 15,
    kicker: "가중",
    title: "필수 15",
    desc: "가중치 5 · 해설",
    featured: true,
  },
  {
    id: "today",
    mode: "study",
    tags: ["기출", "창세기"],
    count: 10,
    kicker: "전략",
    title: "오늘 성경 10",
    desc: "다빈도 권 · 해설",
  },
  {
    id: "vocab-day",
    mode: "study",
    tags: ["단어장300", "영한"],
    count: 20,
    kicker: "영어",
    title: "단어장 영→한",
    desc: "하루 20개 뜻 연결",
  },
  {
    id: "exam",
    mode: "exam",
    tags: ["필수"],
    count: 20,
    kicker: "도전",
    title: "필수 시험 20",
    desc: "점수 집중",
  },
];

export const HOT_KEYWORDS = [
  { search: "이스라엘", label: "이스라엘" },
  { search: "다윗", label: "다윗" },
  { search: "아브라함", label: "아브라함" },
  { search: "성전", label: "성전" },
  { search: "모세", label: "모세" },
  { search: "제단", label: "제단" },
];

export const TIER_LABELS = { S: "필수", A: "중요", B: "권장" };

export function recommendCount(poolSize, defaultCount = 15) {
  if (poolSize <= 10) return poolSize;
  if (poolSize <= 30) return 10;
  if (poolSize <= 80) return 15;
  return Math.min(defaultCount, 20);
}

export function suggestVocabDay(questions, exposure = {}) {
  for (const track of VOCAB_DAY_TRACKS) {
    const pool = questions.filter(
      (q) => q.subject === "영어" && (q.tags || []).includes(track.tag) && (q.tags || []).includes("영한")
    );
    if (!pool.length) continue;
    const seen = pool.filter((q) => exposure[q.id]).length;
    const pct = Math.round((seen / pool.length) * 100);
    if (pct < 70) {
      return { ...track, pct, total: pool.length, seen };
    }
  }
  const last = VOCAB_DAY_TRACKS[VOCAB_DAY_TRACKS.length - 1];
  return { ...last, pct: 100, total: 20, seen: 20, done: true };
}

/** 노출이 낮은 다빈도 권 우선 (총신 기출만) */
export function suggestBibleFocus(questions, exposure = {}, seminary = "chongshin") {
  for (const book of BIBLE_BOOK_TRACKS) {
    const pool = questions.filter(
      (q) =>
        q.seminary === seminary &&
        (q.tags || []).includes("기출") &&
        (q.tags || []).includes(book.tag)
    );
    if (!pool.length) continue;
    const seen = pool.filter((q) => exposure[q.id]).length;
    const pct = Math.round((seen / pool.length) * 100);
    if (pct < 40) {
      return { ...book, pct, total: pool.length, seen };
    }
  }
  return { ...BIBLE_BOOK_TRACKS[0], pct: 100, total: 0, seen: 0, done: true };
}

/** 노출이 낮은 고가중 유형 우선 (총신만) */
export function suggestExamTypeFocus(questions, exposure = {}, seminary = "chongshin") {
  for (const track of EXAM_TYPE_TRACKS) {
    const pool = questions.filter(
      (q) => q.seminary === seminary && (q.tags || []).includes(track.tag)
    );
    if (!pool.length) continue;
    const seen = pool.filter((q) => exposure[q.id]).length;
    const pct = Math.round((seen / pool.length) * 100);
    if (pct < 35) {
      return { ...track, pct, total: pool.length, seen };
    }
  }
  return { ...EXAM_TYPE_TRACKS[0], pct: 100, total: 0, seen: 0, done: true };
}

export function currentPhase(vocabDay) {
  const d = vocabDay?.day || 1;
  if (d <= 9) return STRATEGY_PHASES[0];
  if (d <= 13) return STRATEGY_PHASES[1];
  return STRATEGY_PHASES[2];
}
