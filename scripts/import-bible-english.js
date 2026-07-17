#!/usr/bin/env node
/**
 * 신대원 전용 영어 콘텐츠 병합
 *  - scripts/bible-english-questions.json (성경 영어: 독해·암송·빈칸)
 *  - scripts/grammar-questions.json       (문법)
 * → public/data/questions.json
 *
 * 성경 영어 원천 데이터는 build-bible-english.py 로 재생성.
 * Usage: node scripts/import-bible-english.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(root, "public/data/questions.json");

function load(name) {
  const p = path.join(__dirname, name);
  if (!fs.existsSync(p)) {
    console.warn(`skip missing ${name}`);
    return [];
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const bible = load("bible-english-questions.json");
const grammar = load("grammar-questions.json");

const data = JSON.parse(fs.readFileSync(outPath, "utf8"));
data.questions = data.questions.filter(
  (q) => q.source !== "bible-english" && q.source !== "grammar"
);
data.questions.push(...bible, ...grammar);
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log(
  `Merged bible-english ${bible.length} + grammar ${grammar.length} → total ${data.questions.length}`
);
