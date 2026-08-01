import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_QUESTIONS = path.join(ROOT, "public/data/questions.json");
const HWP_READY = path.join(ROOT, "scripts/hwp-2020-2022-questions.json");
const REPORT = path.join(ROOT, "scripts/content-curation-report.json");
const CIRCLES = ["①", "②", "③", "④"];

function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

function questionIds(year, numbers) {
  return numbers.map((number) => `hwp-${year}-영어-${String(number).padStart(3, "0")}`);
}

// 원문 HWP에서 지문·밑줄 위치가 유실되어 단독 출제가 불가능한 항목입니다.
// 원본 대조 전까지 학습/시험/탐색에서 제외합니다.
const EXCLUDED_IDS = new Set([
  ...questionIds(2020, [...range(21, 30), ...range(41, 45), ...range(47, 50)]),
  ...questionIds(2021, [25, ...range(27, 31), 34, 37, 39, 41, 42, 44, 47, 49, 50]),
  ...questionIds(2022, [...range(21, 26), ...range(28, 34), 36, 37, ...range(39, 50)]),
  "chongshin-bible-g-0350",
  "chongshin-bible-g-0351",
]);

const QUESTION_OVERRIDES = {
  "hwp-2020-영어-016": "I like visiting small towns and rural villages from time to time, but the big city is my ___ home.",
  "hwp-2020-영어-017": "The radio, the television set, and other forms of mass ___ with which we are all familiar today were entirely unknown at the ___ of the twentieth century.",
  "hwp-2020-영어-018": "He was a changed young man after his ___ from the Naval Academy for ‘conduct unbecoming an officer.’",
  "hwp-2020-영어-019": "He is so ___ that he won’t even consider the ideas or suggestions offered by other people.",
  "hwp-2020-영어-020": "Though I am prepared to wink at an occasional petty offense against my moral code, I absolutely refuse to ___ behavior that is consistently wicked or ___.",
  "hwp-2021-영어-016": "Sarah not only respected her grandfather; she ___ him.",
  "hwp-2021-영어-017": "The recent forest fire, which ___ the mountains of Australia, was the most severe ___ disaster the region has ever experienced.",
  "hwp-2021-영어-018": "After the military government banned the opposing political party, its members continued to meet in ___ groups.",
  "hwp-2021-영어-019": "The low gray clouds made the sky look ___.",
  "hwp-2021-영어-020": "The ___ solution to a problem takes both sides into account.",
  "hwp-2021-영어-021": "If anyone thirsts, let him come to me and drink. ___ believes in me, as the Scripture has said, out of his heart will flow rivers of living water.",
  "hwp-2021-영어-022": "Whoever pampers his servant from childhood will in the end find him his ___.",
  "hwp-2021-영어-023": "Do your best to present yourself to God as one ___, a worker who has no need to be ashamed, rightly handling the word of truth.",
  "hwp-2021-영어-024": "You shall not ___ your neighbor’s wife. And you shall not desire your neighbor’s house, field, servants, ox, donkey, or anything that is your neighbor’s.",
  "hwp-2022-영어-011": "Developing interpersonal skills is ___.",
  "hwp-2022-영어-012": "Actually, per unit of matter, the brain uses ___ energy than our other organs.",
  "hwp-2022-영어-013": "That is partly why babies sleep all the time—their growing brains ___ them—and have a lot of body fat to use as an energy reserve when needed.",
  "hwp-2022-영어-014": "Set your mind ___.",
  "hwp-2022-영어-015": "We are hard pressed on every side, but not in despair; ___, ___.",
  "hwp-2022-영어-016": "People who display intellectual humility are more likely to ___ learning from others who think differently.",
  "hwp-2022-영어-017": "The world that children share with their peers is ___ shapes their behavior and modifies the characteristics they were born ___.",
  "hwp-2022-영어-018": "___ some people are natural humorists, ___ funny is a set of skills that can be learned.",
  "hwp-2022-영어-019": "Hope ___ makes the heart sick, but a longing ___ is a tree of life.",
  "hwp-2022-영어-020": "This was the confidence that kept him going through incredible ___ for 40 years.",
};

function sectionLabel(question) {
  const number = Number(question.id.slice(-3));
  if (question.year === 2020 && number <= 5) return "동의어";
  if (question.year === 2020 && number <= 10) return "반의어";
  if ((question.year === 2021 || question.year === 2022) && number <= 10) return "동의어";
  if (question.year === 2021 && number <= 15) return "단어 관계";
  return "";
}

function cleanExtractedText(value) {
  return String(value || "")
    .replace(/꼭\s*기재하여야\s*함\s*수험\s*번호\s*성명/gi, "")
    .replace(/[^\x20-\x7E가-힣ㄱ-ㅎㅏ-ㅣ\u2000-\u206F\u2460-\u2473\u3000-\u303F]/g, "")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function answerText(question) {
  if (question.answer == null || question.answer === "") return "";
  if (question.type === "multiple" && Array.isArray(question.choices)) {
    const answers = Array.isArray(question.answer) ? question.answer : [question.answer];
    return answers
      .map((index) => `${CIRCLES[index] || ""} ${question.choices[index] || ""}`.trim())
      .join(" / ");
  }
  return String(question.answer);
}

function sourceLabel(question) {
  if (question.source === "quizlet-00-14") return "00–14 통합 기출 자료";
  if (question.source === "quizlet") return "기존 학습 자료";
  if (question.source === "memory") return "암송 자료";
  return "수록 자료";
}

function fallbackExplanation(question) {
  const answer = answerText(question);
  if (!answer) return "정답이 공개되지 않은 열람용 문항입니다. 관련 원문이나 성경 본문과 함께 확인하세요.";
  if (question.type === "multiple") {
    return `정답은 ${answer}입니다. ${sourceLabel(question)}의 정답 기준으로 수록했으며, 관련 원문이나 성경 본문을 함께 확인하세요.`;
  }
  return `정답은 ‘${answer}’입니다. ${sourceLabel(question)}를 바탕으로 회상한 뒤 정답과 대조하세요.`;
}

function curateQuestion(raw) {
  const question = { ...raw };
  if (question.source === "hwp-exam-2020-2022") {
    question.question = cleanExtractedText(QUESTION_OVERRIDES[question.id] || question.question);
    question.choices = (question.choices || []).map((choice) => cleanExtractedText(String(choice).split("*")[0]));
    const label = question.subject === "영어" ? sectionLabel(question) : "";
    if (label && !question.question.startsWith("[")) question.question = `[${label}] ${question.question}`;
    if (question.subject === "영어") {
      question.tags = [...new Set([...(question.tags || []), "문항검수완료"])];
    } else {
      question.tags = (question.tags || []).filter((tag) => tag !== "문항검수완료");
    }
    delete question.choiceNotes;
    const answer = answerText(question);
    question.explanation = `${question.year}학년도 ${question.subject} 원문기출 ${Number(question.id.slice(-3))}번 · 정답 ${answer || "미수록"}.${label ? ` ${label} 유형입니다.` : ""}`;
  } else if (!String(question.explanation || "").trim()) {
    question.explanation = fallbackExplanation(question);
  }
  return question;
}

function curateList(questions) {
  return questions.filter((question) => !EXCLUDED_IDS.has(question.id)).map(curateQuestion);
}

function writeJson(target, data) {
  fs.writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

const publicData = JSON.parse(fs.readFileSync(PUBLIC_QUESTIONS, "utf8"));
const before = publicData.questions.length;
publicData.questions = curateList(publicData.questions);
writeJson(PUBLIC_QUESTIONS, publicData);

if (fs.existsSync(HWP_READY)) {
  const hwpQuestions = JSON.parse(fs.readFileSync(HWP_READY, "utf8"));
  writeJson(HWP_READY, curateList(hwpQuestions));
}

const remainingMissingExplanations = publicData.questions.filter(
  (question) => !String(question.explanation || "").trim()
).length;
const verifiedEnglishOriginals = publicData.questions.filter(
  (question) => question.subject === "영어" && question.tags?.includes("원문기출")
).length;
const report = {
  totalBefore: before,
  totalAfter: publicData.questions.length,
  configuredExclusions: EXCLUDED_IDS.size,
  excludedThisRun: before - publicData.questions.length,
  verifiedEnglishOriginals,
  remainingMissingExplanations,
};
writeJson(REPORT, report);

console.log(JSON.stringify(report, null, 2));
