#!/usr/bin/env python3
"""
Import 장로회신학대학교 대학 성경종합고사 성경문제집 [구약] PDF.

Source: /Users/kangbanseok/Downloads/장신.pdf
Answers are NOT in this PDF — questions are imported with answer=null
until an answer key is provided.

Run:
  .venv-tools/bin/python scripts/import-jangsin-pdf.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = Path("/Users/kangbanseok/Downloads/장신.pdf")
OUT_JSON = ROOT / "scripts" / "jangsin-ot-questions.json"
OUT_TXT = ROOT / "scripts" / "extracted-jangsin" / "장신-구약.txt"
QUESTIONS_JSON = ROOT / "public" / "data" / "questions.json"

SOURCE = "jangsin-ot-book"
CHOICE_MARKS = "①②③④"
CHOICE_TO_INDEX = {"①": 0, "②": 1, "③": 2, "④": 3}
DIFF_WEIGHT = {"A": 5, "B": 4, "C": 3}
DIFF_TIER = {"A": "필수", "B": "중요", "C": "중요"}


def pdf_text(path: Path) -> str:
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def clean(text: str) -> str:
    text = text.replace("\x00", "")
    text = re.sub(r"장로회신학대학교\s*대학-\s*\d+\s*-", "\n", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def parse_choices(body: str) -> tuple[str, list[str]]:
    matches = list(re.finditer(f"[{CHOICE_MARKS}]", body))
    if len(matches) < 4:
        raise ValueError(f"need 4 choices, got {len(matches)}: {body[:100]}")
    # use first 4 choice marks as the answer options
    first = matches[0].start()
    question = body[:first].strip()
    choices: list[str] = []
    for i, m in enumerate(matches[:4]):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < 4 else len(body)
        # if more than 4 marks exist after, stop at 5th overall start for last choice
        if i == 3 and len(matches) > 4:
            end = matches[4].start()
        choices.append(body[start:end].strip(" .\t"))
    return question, choices


def assign_books(text: str) -> list[tuple[str, int, int]]:
    """Return list of (book, start, end) spans."""
    headers = list(re.finditer(r"■\s*([가-힣]+)\s*■", text))
    spans: list[tuple[str, int, int]] = []
    for i, h in enumerate(headers):
        start = h.end()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(text)
        spans.append((h.group(1), start, end))
    return spans


def parse_questions(text: str) -> list[dict]:
    book_spans = assign_books(text)
    questions: list[dict] = []
    markers = list(re.finditer(r"(\d+)\.\s*\[([ABC])\]\s*", text))
    expected = 1
    for idx, m in enumerate(markers):
        raw_num = int(m.group(1))
        diff = m.group(2)
        # PDF glue: "④ 19:23" + "2. [B]" => "19:232. [B]"
        if raw_num == expected:
            num = raw_num
        elif expected <= 300 and str(raw_num).endswith(str(expected)):
            num = expected
        else:
            num = raw_num
        expected = num + 1

        start = m.end()
        end = markers[idx + 1].start() if idx + 1 < len(markers) else len(text)
        body = text[start:end].strip()
        body = re.split(r"■\s*[가-힣]+\s*■", body)[0].strip()
        try:
            question, choices = parse_choices(body)
        except ValueError:
            continue

        book = "구약"
        for bname, b0, b1 in book_spans:
            if b0 <= m.start() < b1:
                book = bname
                break

        weight = DIFF_WEIGHT[diff]
        tier = DIFF_TIER[diff]
        questions.append(
            {
                "id": f"jangsin-ot-{num:03d}",
                "seminary": "jangsin",
                "year": None,
                "subject": "성경",
                "type": "multiple",
                "question": question,
                "choices": choices,
                "answer": None,
                "explanation": f"장신 대학 성경종합고사 문제집 [구약] {book} {num}번 · 난이도 {diff} · 정답 미수록",
                "tags": sorted(
                    {
                        "장신",
                        "기출",
                        "문제집",
                        "구약",
                        book,
                        f"난이도{diff}",
                        tier,
                        f"가중치{weight}",
                        "정답미수록",
                    }
                ),
                "weight": weight,
                "source": SOURCE,
                "difficulty": diff,
            }
        )
    return questions


def merge(questions: list[dict]) -> None:
    data = json.loads(QUESTIONS_JSON.read_text(encoding="utf-8"))
    data["questions"] = [q for q in data["questions"] if q.get("source") != SOURCE]
    data["questions"].extend(questions)
    QUESTIONS_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    raw = pdf_text(PDF_PATH)
    OUT_TXT.parent.mkdir(parents=True, exist_ok=True)
    OUT_TXT.write_text(raw, encoding="utf-8")
    text = clean(raw)
    questions = parse_questions(text)
    OUT_JSON.write_text(json.dumps(questions, ensure_ascii=False, indent=2), encoding="utf-8")
    merge(questions)

    answered = sum(1 for q in questions if q.get("answer") is not None)
    books = {}
    for q in questions:
        b = next((t for t in q["tags"] if t not in {"장신", "기출", "문제집", "구약", "필수", "중요", "권장", "정답미수록"} and not t.startswith("난이도") and not t.startswith("가중치")), "?")
        books[b] = books.get(b, 0) + 1
    print(f"parsed: {len(questions)} (answered: {answered})")
    print(f"wrote: {OUT_JSON}")
    print("by book:", dict(sorted(books.items(), key=lambda x: -x[1])[:12]))
    bad = [q for q in questions if len(q["choices"]) != 4 or not q["question"]]
    print("bad:", len(bad))
    if questions:
        print("sample:", questions[0]["id"], questions[0]["question"][:60], questions[0]["choices"])


if __name__ == "__main__":
    main()
