#!/usr/bin/env node
/**
 * 붙여넣기 텍스트 → quizlet-bible-ot-paste.txt 추가 및/또는 questions.json 병합
 * 사용:
 *   node scripts/import-paste.js < pasted.txt
 *   node scripts/import-paste.js scripts/paste-input.txt
 *   node scripts/import-paste.js --merge-json scripts/paste-input.txt
 */
import { readFileSync, appendFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parsePasteText, formatFlashcardFile } from "../src/lib/parse-paste.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PASTE_FILE = join(__dirname, "quizlet-bible-ot-paste.txt");
const OUT = join(__dirname, "../public/data/questions.json");

function readStdin() {
  return readFileSync(0, "utf8");
}

function loadInput(argv) {
  const files = argv.filter((a) => !a.startsWith("--"));
  if (files.length) return readFileSync(files[0], "utf8");
  return readStdin();
}

function normalizeQuestion(q) {
  return q.question.replace(/\s+/g, " ").trim();
}

function mergeQuestions(existing, incoming) {
  const seen = new Set(existing.map(normalizeQuestion));
  const merged = [...existing];
  for (const q of incoming) {
    const key = normalizeQuestion(q);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(q);
  }
  return merged;
}

function main() {
  const args = process.argv.slice(2);
  const mergeJson = args.includes("--merge-json");
  const seminary = args.includes("--seminary")
    ? args[args.indexOf("--seminary") + 1]
    : "chongshin";
  const subject = args.includes("--subject") ? args[args.indexOf("--subject") + 1] : "성경";
  const type = args.includes("--type") ? args[args.indexOf("--type") + 1] : "auto";

  const text = loadInput(args);
  if (!text.trim()) {
    console.error("입력 텍스트가 비어 있습니다.");
    process.exit(1);
  }

  const { format, questions } = parsePasteText(text, {
    seminary,
    subject,
    subjectKey: subject === "영어" ? "english" : "bible",
    type,
  });

  if (!questions.length) {
    console.error("파싱된 문항이 없습니다. 형식을 확인하세요.");
    process.exit(1);
  }

  const flashAppend = formatFlashcardFile(questions);
  if (!existsSync(PASTE_FILE)) {
    writeFileSync(PASTE_FILE, "# 붙여넣기로 수집한 구약 단답\n\n", "utf8");
  }
  appendFileSync(PASTE_FILE, `\n# import ${new Date().toISOString()} (${format}, ${questions.length}문항)\n${flashAppend}`, "utf8");
  console.log(`Appended ${questions.length} (${format}) → ${PASTE_FILE}`);

  if (mergeJson) {
    let existing = [];
    if (existsSync(OUT)) {
      existing = JSON.parse(readFileSync(OUT, "utf8")).questions || [];
    }
    const merged = mergeQuestions(existing, questions);
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify({ questions: merged }, null, 2), "utf8");
    console.log(`Merged JSON: ${existing.length} + ${questions.length} → ${merged.length} total → ${OUT}`);
  } else {
    const r = spawnSync(process.execPath, [join(__dirname, "import-questions.js")], {
      stdio: "inherit",
      cwd: join(__dirname, ".."),
    });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }
}

main();
