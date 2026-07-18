#!/usr/bin/env python3
"""
장신 2027 신대원 입시 구약 암송구절 → 문제 생성.

PDF: /Users/kangbanseok/Downloads/2027_sj_구약성경암송구절.pdf
본문: 바이블 앱 개역개정 SQLite (01개역개정.bdb)

문항 유형:
  - short/flash: 장절 → 본문 암송
  - multiple: 본문 보고 장절 고르기
  - multiple: 장절 보고 본문 고르기

Run:
  .venv-tools/bin/python scripts/build-jangsin-memory.py
"""
from __future__ import annotations

import json
import random
import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KOR_DB = Path("/Users/kangbanseok/bible/bible-app/app/src/main/assets/bibles/01개역개정.bdb")
OUT_JSON = ROOT / "scripts" / "jangsin-memory-questions.json"
QUESTIONS_JSON = ROOT / "public" / "data" / "questions.json"
SOURCE = "jangsin-memory-2027"

BOOK_NUM = {
    "창세기": 1,
    "출애굽기": 2,
    "레위기": 3,
    "민수기": 4,
    "신명기": 5,
    "여호수아": 6,
    "사사기": 7,
    "룻기": 8,
    "사무엘상": 9,
    "사무엘하": 10,
    "열왕기상": 11,
    "열왕기하": 12,
    "역대상": 13,
    "역대하": 14,
    "에스라": 15,
    "느헤미야": 16,
    "에스더": 17,
    "욥기": 18,
    "시편": 19,
    "잠언": 20,
    "전도서": 21,
    "아가": 22,
    "이사야": 23,
    "예레미야": 24,
    "예레미야애가": 25,
    "에스겔": 26,
    "다니엘": 27,
    "호세아": 28,
    "요엘": 29,
    "아모스": 30,
    "오바댜": 31,
    "요나": 32,
    "미가": 33,
    "나훔": 34,
    "하박국": 35,
    "스바냐": 36,
    "학개": 37,
    "스가랴": 38,
    "말라기": 39,
}

# 2027학년도 장신 신대원 입시 구약 암송구절 (PDF 표 기준, 총 25절묶음)
# (book, chapter, v_start, v_end, note)
PASSAGES = [
    ("창세기", 1, 1, 1, ""),
    ("출애굽기", 19, 5, 6, ""),
    ("레위기", 19, 2, 2, ""),
    ("레위기", 19, 18, 18, ""),
    ("민수기", 6, 24, 26, ""),
    ("신명기", 6, 4, 9, ""),
    ("여호수아", 1, 8, 8, ""),
    ("사사기", 8, 23, 23, ""),
    ("사무엘하", 7, 16, 16, ""),
    ("열왕기상", 18, 21, 21, ""),
    ("열왕기하", 22, 13, 13, ""),
    ("역대하", 31, 20, 20, ""),
    ("욥기", 1, 21, 21, ""),
    ("시편", 1, 1, 2, ""),
    ("시편", 119, 105, 105, ""),
    ("잠언", 1, 7, 7, ""),
    ("전도서", 12, 13, 13, ""),
    ("아가", 8, 6, 6, ""),
    ("이사야", 2, 3, 3, ""),
    ("예레미야", 31, 33, 33, ""),
    ("요엘", 2, 28, 29, ""),
    ("요나", 4, 2, 2, "하절:「주께서는」부터"),
    ("미가", 3, 12, 12, ""),
    ("하박국", 2, 4, 4, ""),
    ("말라기", 4, 4, 6, ""),
]

random.seed(2027)


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip())


def ref_label(book: str, ch: int, v1: int, v2: int) -> str:
    if v1 == v2:
        return f"{book} {ch}:{v1}"
    return f"{book} {ch}:{v1}-{v2}"


def short_ref(book: str, ch: int, v1: int, v2: int) -> str:
    # compact for flash question prompt (memory style)
    abbr = {
        "창세기": "창",
        "출애굽기": "출",
        "레위기": "레",
        "민수기": "민",
        "신명기": "신",
        "여호수아": "수",
        "사사기": "삿",
        "사무엘하": "삼하",
        "열왕기상": "왕상",
        "열왕기하": "왕하",
        "역대하": "대하",
        "욥기": "욥",
        "시편": "시",
        "잠언": "잠",
        "전도서": "전",
        "아가": "아",
        "이사야": "사",
        "예레미야": "렘",
        "요엘": "욜",
        "요나": "욘",
        "미가": "미",
        "하박국": "합",
        "말라기": "말",
    }.get(book, book)
    if v1 == v2:
        return f"{abbr}{ch}:{v1}"
    return f"{abbr}{ch}:{v1}-{v2}"


def fetch_passage(conn: sqlite3.Connection, book: str, ch: int, v1: int, v2: int, note: str) -> str:
    b = BOOK_NUM[book]
    rows = conn.execute(
        "SELECT verse, btext FROM Bible WHERE book=? AND chapter=? AND verse BETWEEN ? AND ? ORDER BY verse",
        (b, ch, v1, v2),
    ).fetchall()
    if not rows:
        raise ValueError(f"missing {book} {ch}:{v1}-{v2}")
    parts = [clean(t) for _, t in rows]
    text = " ".join(parts)
    if "하절" in note or "주께서는" in note:
        idx = text.find("주께서는")
        if idx >= 0:
            text = text[idx:]
    return text


def distractor_refs(correct: str, pool: list[str], n: int = 3) -> list[str]:
    others = [r for r in pool if r != correct]
    random.shuffle(others)
    return others[:n]


def distractor_texts(correct: str, pool: list[str], n: int = 3) -> list[str]:
    others = [t for t in pool if t != correct]
    random.shuffle(others)
    # shorten long distractors for readability
    out = []
    for t in others[:n]:
        out.append(t if len(t) <= 120 else t[:117] + "…")
    return out


def build_questions(passages: list[dict]) -> list[dict]:
    refs = [p["ref"] for p in passages]
    texts = [p["text"] for p in passages]
    questions: list[dict] = []
    seq = 0

    for p in passages:
        seq += 1
        book, ch, v1, v2 = p["book"], p["ch"], p["v1"], p["v2"]
        ref = p["ref"]
        sref = p["short_ref"]
        text = p["text"]
        note = p["note"]
        tags_base = {
            "장신",
            "암송",
            "구약암송",
            "2027입시",
            "구약",
            book,
            "필수",
            "가중치5",
        }

        # 1) 장절 → 본문 (short / flash)
        questions.append(
            {
                "id": f"jangsin-mem-{seq:03d}-recall",
                "seminary": "jangsin",
                "year": 2027,
                "subject": "성경",
                "type": "short",
                "question": sref,
                "answer": text,
                "explanation": f"장신 2027 신대원 입시 구약 암송 · {ref}"
                + (f" · {note}" if note else "")
                + " · 개역개정",
                "tags": sorted(tags_base | {"한암송"}),
                "weight": 5,
                "source": SOURCE,
            }
        )

        # 2) 본문 보고 장절 고르기
        choices_ref = [ref] + distractor_refs(ref, refs)
        random.shuffle(choices_ref)
        answer_ref = choices_ref.index(ref)
        preview = text if len(text) <= 90 else text[:87] + "…"
        questions.append(
            {
                "id": f"jangsin-mem-{seq:03d}-ref",
                "seminary": "jangsin",
                "year": 2027,
                "subject": "성경",
                "type": "multiple",
                "question": f"다음 암송 본문의 장절은?\n「{preview}」",
                "choices": choices_ref,
                "answer": answer_ref,
                "explanation": f"{ref} · 장신 2027 구약 암송",
                "tags": sorted(tags_base | {"장절맞히기"}),
                "weight": 5,
                "source": SOURCE,
            }
        )

        # 3) 장절 보고 본문 고르기
        correct_choice = text if len(text) <= 140 else text[:137] + "…"
        choices_txt = [correct_choice] + distractor_texts(text, texts)
        # ensure unique
        seen = set()
        uniq = []
        for c in choices_txt:
            if c in seen:
                continue
            seen.add(c)
            uniq.append(c)
        while len(uniq) < 4:
            uniq.append(f"(보기 {len(uniq) + 1})")
        uniq = uniq[:4]
        random.shuffle(uniq)
        answer_txt = uniq.index(correct_choice) if correct_choice in uniq else 0
        if correct_choice not in uniq:
            uniq[0] = correct_choice
            answer_txt = 0
        questions.append(
            {
                "id": f"jangsin-mem-{seq:03d}-text",
                "seminary": "jangsin",
                "year": 2027,
                "subject": "성경",
                "type": "multiple",
                "question": f"다음 장절의 암송 본문은?\n{ref}",
                "choices": uniq,
                "answer": answer_txt,
                "explanation": f"{ref} · 장신 2027 구약 암송 · 개역개정",
                "tags": sorted(tags_base | {"본문맞히기"}),
                "weight": 5,
                "source": SOURCE,
            }
        )

    return questions


def merge(questions: list[dict]) -> None:
    data = json.loads(QUESTIONS_JSON.read_text(encoding="utf-8"))
    data["questions"] = [q for q in data["questions"] if q.get("source") != SOURCE]
    data["questions"].extend(questions)
    QUESTIONS_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    conn = sqlite3.connect(str(KOR_DB))
    passages = []
    for book, ch, v1, v2, note in PASSAGES:
        text = fetch_passage(conn, book, ch, v1, v2, note)
        passages.append(
            {
                "book": book,
                "ch": ch,
                "v1": v1,
                "v2": v2,
                "note": note,
                "ref": ref_label(book, ch, v1, v2),
                "short_ref": short_ref(book, ch, v1, v2),
                "text": text,
            }
        )
    conn.close()

    questions = build_questions(passages)
    OUT_JSON.write_text(json.dumps(questions, ensure_ascii=False, indent=2), encoding="utf-8")
    merge(questions)

    catalog = [{"ref": p["ref"], "chars": len(p["text"]), "preview": p["text"][:50]} for p in passages]
    (ROOT / "scripts" / "jangsin-memory-catalog.json").write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"passages: {len(passages)}")
    print(f"questions: {len(questions)}")
    print(f"wrote: {OUT_JSON}")
    for p in passages[:5]:
        print(f"  {p['ref']}: {p['text'][:40]}…")


if __name__ == "__main__":
    main()
