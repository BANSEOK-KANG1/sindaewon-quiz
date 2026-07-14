#!/usr/bin/env node
/**
 * CSV(장신 필답 등) → public/data/questions.json 병합
 * 사용: node scripts/import-csv.js [path/to/file.csv]
 * 동일 id가 있으면 교체, 없으면 추가
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/data/questions.json");
const DEFAULT_CSV = join(__dirname, "templates/jangsin-short-answer.csv");

function parseCsv(text) {
  const rows = [];
  let i = 0;
  const len = text.length;

  function readField() {
    if (i >= len) return null;
    if (text[i] === '"') {
      i++;
      let field = "";
      while (i < len) {
        if (text[i] === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          i++;
          break;
        }
        field += text[i++];
      }
      return field;
    }
    let field = "";
    while (i < len && text[i] !== "," && text[i] !== "\n" && text[i] !== "\r") {
      field += text[i++];
    }
    return field;
  }

  const headers = [];
  while (i < len) {
    const f = readField();
    if (f === null) break;
    headers.push(f);
    if (text[i] === ",") i++;
    else break;
  }
  if (text[i] === "\r") i++;
  if (text[i] === "\n") i++;

  while (i < len) {
    if (text[i] === "\r" || text[i] === "\n") {
      i++;
      continue;
    }
    const row = {};
    for (let h = 0; h < headers.length; h++) {
      const f = readField();
      row[headers[h]] = f ?? "";
      if (text[i] === ",") i++;
    }
    if (text[i] === "\r") i++;
    if (text[i] === "\n") i++;
    if (Object.values(row).some((v) => v !== "")) rows.push(row);
  }
  return rows;
}

function rowToQuestion(row) {
  const tags = (row.tags || "")
    .split("|")
    .map((t) => t.trim())
    .filter(Boolean);
  const year = row.year ? Number(row.year) : null;
  return {
    id: row.id,
    seminary: row.seminary,
    year: Number.isFinite(year) ? year : null,
    subject: row.subject,
    type: "short",
    question: row.question,
    answer: row.answer,
    explanation: "",
    tags,
    source: row.source || "csv",
  };
}

function main() {
  const csvPath = process.argv[2] ? join(process.cwd(), process.argv[2]) : DEFAULT_CSV;
  if (!existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const incoming = parseCsv(readFileSync(csvPath, "utf8")).map(rowToQuestion);
  let existing = { questions: [] };
  if (existsSync(OUT)) {
    existing = JSON.parse(readFileSync(OUT, "utf8"));
  }

  const byId = new Map(existing.questions.map((q) => [q.id, q]));
  for (const q of incoming) {
    byId.set(q.id, q);
  }
  const merged = [...byId.values()];

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ questions: merged }, null, 2), "utf8");
  console.log(
    `Merged ${incoming.length} row(s) from ${csvPath}; total ${merged.length} questions → ${OUT}`
  );
}

main();
