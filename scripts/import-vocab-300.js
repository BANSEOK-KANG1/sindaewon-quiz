#!/usr/bin/env node
/**
 * 총신 신대원 영어 기출맞춤 영단어장 300 → questions.json 병합
 *
 * 사전 준비: scripts/vocab-300-questions.json
 * (docx 파싱은 Python으로 생성 — 재생성 시 Downloads의 docx에서 추출)
 *
 * Usage: node scripts/import-vocab-300.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const vocabPath = path.join(__dirname, "vocab-300-questions.json");
const outPath = path.join(root, "public/data/questions.json");

if (!fs.existsSync(vocabPath)) {
  console.error("Missing scripts/vocab-300-questions.json — parse the docx first.");
  process.exit(1);
}

const vocab = JSON.parse(fs.readFileSync(vocabPath, "utf8")).map((q) => {
  const { meta, ...rest } = q;
  if (rest.choices == null) delete rest.choices;
  return rest;
});

const data = JSON.parse(fs.readFileSync(outPath, "utf8"));
data.questions = data.questions.filter((q) => q.source !== "vocab-300");
data.questions.push(...vocab);
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log(`Merged ${vocab.length} vocab questions → total ${data.questions.length}`);
