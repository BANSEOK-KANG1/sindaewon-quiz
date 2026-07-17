#!/usr/bin/env python3
"""
Import additional seminary exam sources.

Current supported sources:
- 성경고사 문제은행 PDF + 정답지 PDF (2026.05.12 수정)
- 2020~2022 HWP 기출 + scripts/hwp-2020-2022-answers.json 정답 매칭

Run with the local tool venv:
  .venv-tools/bin/python scripts/import-exam-sources.py
"""
from __future__ import annotations

import json
import re
import struct
import zlib
from pathlib import Path

import olefile
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = Path("/Users/kangbanseok/Downloads")

QUESTION_PDF = DOWNLOADS / "성경고사 문제은행_(2026.05.12. 수정).pdf"
ANSWER_PDF = DOWNLOADS / "성경고사 문제은행 정답지_(2026.05.12. 수정).pdf"

OUT_QUESTION_BANK = ROOT / "scripts" / "bible-exam-bank-2026-questions.json"
OUT_HWP_DRAFTS = ROOT / "scripts" / "hwp-2020-2022-drafts.json"
OUT_HWP_READY = ROOT / "scripts" / "hwp-2020-2022-questions.json"
OUT_HWP_ANSWERS = ROOT / "scripts" / "hwp-2020-2022-answers.json"
OUT_HWP_TEXT_DIR = ROOT / "scripts" / "extracted-hwp"
QUESTIONS_JSON = ROOT / "public" / "data" / "questions.json"

CHOICE_MARKS = "①②③④⓵⓶⓷⓸"
CHOICE_TO_INDEX = {
    "①": 0,
    "②": 1,
    "③": 2,
    "④": 3,
    "⓵": 0,
    "⓶": 1,
    "⓷": 2,
    "⓸": 3,
}
CIRCLE = ["①", "②", "③", "④"]
HWP_SOURCE = "hwp-exam-2020-2022"
EMPTY_STEM_HINT = "다음 중 문법적으로 올바른 문장을 고르시오."
Q21_2020_ENG = {
    "id": "hwp-2020-영어-021",
    "seminary": "chongshin",
    "year": 2020,
    "subject": "영어",
    "type": "multiple",
    "question": (
        "다음 밑줄 친 부분 중 어법상 틀린 것을 고르시오.\n"
        "In order to conserve valuable gasoline, motorists had ought to check "
        "their speedometers while driving along the highways since it is very "
        "easy to exceed speed limit while driving on open roads."
    ),
    "choices": ["①", "②", "③", "④"],
    "answer": None,
    "explanation": "HWP 원문 21번(밑줄형). 보기 문구는 원문 밑줄 위치 기준.",
    "tags": ["원문기출", "2020학년도", "영어", "기출"],
    "source": HWP_SOURCE,
}


def pdf_text(path: Path) -> str:
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def clean_text(text: str) -> str:
    text = text.replace("\x00", "")
    text = re.sub(r"--\s*\d+\s+of\s+\d+\s*--", " ", text)
    text = re.sub(r"-\s*\d+\s*-", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def split_numbered_questions(section_text: str, expected_count: int) -> list[tuple[int, str]]:
    selected: list[tuple[int, int, int]] = []
    cursor = 0
    for expected in range(1, expected_count + 1):
        # PDF extraction sometimes glues Bible references and question numbers:
        # "창 4:15" + "5." can become "창 4:155.". Search for the expected
        # sequence number from the current cursor rather than relying on a
        # generic "not preceded by digit" marker.
        match = re.search(rf"{expected}\.\s*", section_text[cursor:])
        if match is None:
            raise ValueError(f"Missing question {expected}")
        hit = (expected, cursor + match.start(), cursor + match.end())
        selected.append(hit)
        cursor = hit[2]

    results: list[tuple[int, str]] = []
    for idx, (num, _start, end) in enumerate(selected):
        next_start = selected[idx + 1][1] if idx + 1 < len(selected) else len(section_text)
        results.append((num, section_text[end:next_start].strip()))
    return results


def split_numbered_questions_lenient(section_text: str, max_count: int = 50) -> list[tuple[int, str]]:
    """Best-effort splitter for source drafts with numbering typos."""
    markers: list[tuple[int, int, int]] = []
    for match in re.finditer(r"(?<![\d:])(\d{1,3})\.\s*", section_text):
        num = int(match.group(1))
        if 1 <= num <= max_count:
            markers.append((num, match.start(), match.end()))
    markers = markers[:max_count]
    results: list[tuple[int, str]] = []
    for idx, (num, _start, end) in enumerate(markers):
        next_start = markers[idx + 1][1] if idx + 1 < len(markers) else len(section_text)
        results.append((num, section_text[end:next_start].strip()))
    return results


def parse_question_body(body: str) -> tuple[str, list[str]]:
    choice_matches = list(re.finditer(f"[{CHOICE_MARKS}]", body))
    if len(choice_matches) < 4:
        raise ValueError(f"Expected 4 choices, got {len(choice_matches)}: {body[:120]}")
    first_choice = choice_matches[0].start()
    question = body[:first_choice].strip()
    choices: list[str] = []
    for idx, match in enumerate(choice_matches[:4]):
        start = match.end()
        end = choice_matches[idx + 1].start() if idx + 1 < 4 else len(body)
        choices.append(body[start:end].strip())
    return question, choices


def parse_answer_map(answer_text: str) -> dict[str, dict[int, int]]:
    text = clean_text(answer_text)
    nt_match = re.search(r"신약\s*정답지", text)
    if not nt_match:
        raise ValueError("Could not locate NT answer section")
    sections = {
        "구약": text[: nt_match.start()],
        "신약": text[nt_match.start() :],
    }
    maps: dict[str, dict[int, int]] = {}
    for section, section_text in sections.items():
        pairs: dict[int, int] = {}
        for num, mark in re.findall(f"(?<!\\d)(\\d{{1,3}})\\s*([{CHOICE_MARKS}])", section_text):
            n = int(num)
            if 1 <= n <= 200:
                pairs[n] = CHOICE_TO_INDEX[mark]
        if len(pairs) != 200:
            raise ValueError(f"{section} answer count expected 200, got {len(pairs)}")
        maps[section] = pairs
    return maps


def section_tag(question: str, section: str) -> str:
    if section == "신약":
        return "신약"
    # Light-weight OT book hint for browsing. Keep conservative.
    for tag in [
        "창세기",
        "출애굽기",
        "레위기",
        "민수기",
        "신명기",
        "여호수아",
        "사사기",
        "시편",
        "잠언",
        "이사야",
        "예레미야",
        "에스겔",
        "다니엘",
    ]:
        if tag in question:
            return tag
    return "구약"


def build_bible_bank_questions() -> list[dict]:
    q_text = clean_text(pdf_text(QUESTION_PDF))
    answer_maps = parse_answer_map(pdf_text(ANSWER_PDF))

    nt_start = re.search(r"신약\s*1\.", q_text)
    if not nt_start:
        raise ValueError("Could not locate NT question section")
    ot_text = q_text[q_text.find("구약") : nt_start.start()]
    nt_text = q_text[nt_start.start() :]

    questions: list[dict] = []
    for section, section_text in [("구약", ot_text), ("신약", nt_text)]:
        parsed = split_numbered_questions(section_text, 200)
        for num, body in parsed:
            question, choices = parse_question_body(body)
            answer = answer_maps[section][num]
            tag = section_tag(question, section)
            questions.append(
                {
                    "id": f"bible-bank-2026-{section}-{num:03d}",
                    "seminary": "chongshin",
                    "year": 2026,
                    "subject": "성경",
                    "type": "multiple",
                    "question": question,
                    "choices": choices,
                    "answer": answer,
                    "explanation": f"성경고사 문제은행(2026.05.12 수정) {section} {num}번 · 정답 {answer + 1}번",
                    "tags": ["문제은행", "성경고사", "2026문제은행", section, tag],
                    "source": "bible-bank-2026",
                }
            )
    return questions


def extract_hwp_text(path: Path) -> str:
    ole = olefile.OleFileIO(str(path))
    header = ole.openstream("FileHeader").read()
    compressed = bool(header[36] & 1)
    paragraphs: list[str] = []
    for stream_path in ole.listdir():
        if len(stream_path) == 2 and stream_path[0] == "BodyText" and stream_path[1].startswith("Section"):
            data = ole.openstream(stream_path).read()
            if compressed:
                data = zlib.decompress(data, -15)
            pos = 0
            while pos + 4 <= len(data):
                header_val = struct.unpack_from("<I", data, pos)[0]
                pos += 4
                tag = header_val & 0x3FF
                size = (header_val >> 20) & 0xFFF
                if size == 0xFFF:
                    size = struct.unpack_from("<I", data, pos)[0]
                    pos += 4
                payload = data[pos : pos + size]
                pos += size
                if tag == 67:  # HWPTAG_PARA_TEXT
                    text = payload.decode("utf-16le", errors="ignore")
                    text = "".join(ch if ch in "\n\t" or ord(ch) >= 32 else " " for ch in text)
                    text = re.sub(r"[捤獥汤捯湰灧桤灧氠瑢漠杳ஔĀࠐޤ۬]+", " ", text)
                    text = re.sub(r"\s+", " ", text).strip()
                    if text:
                        paragraphs.append(text)
    return "\n".join(paragraphs)


def build_hwp_drafts() -> list[dict]:
    OUT_HWP_TEXT_DIR.mkdir(exist_ok=True)
    drafts: list[dict] = []
    for path in sorted(DOWNLOADS.glob("202*학년도 * 기출문제.hwp")):
        text = extract_hwp_text(path)
        out_txt = OUT_HWP_TEXT_DIR / f"{path.stem}.txt"
        out_txt.write_text(text, encoding="utf-8")

        year_match = re.search(r"(202\d)학년도", path.name)
        subject = "영어" if "영어" in path.name else "성경"
        year = int(year_match.group(1)) if year_match else None
        try:
            parsed = split_numbered_questions(clean_text(text), 50)
        except Exception:
            parsed = split_numbered_questions_lenient(clean_text(text), 50)
        for num, body in parsed:
            try:
                question, choices = parse_question_body(body)
            except Exception:
                continue
            drafts.append(
                {
                    "id": f"hwp-{year}-{subject}-{num:03d}",
                    "seminary": "chongshin",
                    "year": year,
                    "subject": subject,
                    "type": "multiple",
                    "question": question,
                    "choices": choices,
                    "answer": None,
                    "explanation": f"HWP 원문에서 추출됨. 원문 번호 {num}번.",
                    "tags": ["원문기출", f"{year}학년도", subject, "기출"],
                    "source": HWP_SOURCE,
                }
            )
    return drafts


def parse_answer_token(token: str) -> int | list[int]:
    parts = [p.strip() for p in token.split("/") if p.strip()]
    indexes = [CHOICE_TO_INDEX[p] for p in parts]
    if len(indexes) == 1:
        return indexes[0]
    return indexes


def load_hwp_answer_maps() -> dict[tuple[int, str], dict[int, int | list[int]]]:
    raw = json.loads(OUT_HWP_ANSWERS.read_text(encoding="utf-8"))
    maps: dict[tuple[int, str], dict[int, int | list[int]]] = {}
    for year_str, subjects in raw.items():
        year = int(year_str)
        for subject, compact in subjects.items():
            tokens = re.findall(rf"[{CHOICE_MARKS}](?:/[{CHOICE_MARKS}])?", compact)
            if len(tokens) != 50:
                raise ValueError(f"{year} {subject} expected 50 answers, got {len(tokens)}")
            maps[(year, subject)] = {i + 1: parse_answer_token(tok) for i, tok in enumerate(tokens)}
    return maps


def polish_hwp_question(q: dict) -> dict:
    q = dict(q)
    choices = list(q.get("choices") or [])
    # Drop reading-passage glue sometimes attached to last choice.
    cleaned: list[str] = []
    for choice in choices:
        choice = re.split(r"\*\s*Read the following", choice, maxsplit=1)[0].strip()
        cleaned.append(choice)
    while len(cleaned) < 4:
        cleaned.append(CIRCLE[len(cleaned)])
    for i, choice in enumerate(cleaned[:4]):
        if not choice.strip():
            cleaned[i] = CIRCLE[i]
    q["choices"] = cleaned[:4]

    question = (q.get("question") or "").strip()
    if not question:
        q["question"] = EMPTY_STEM_HINT
    q["tags"] = sorted(set((q.get("tags") or []) + ["원문기출", "기출", f"{q['year']}학년도", q["subject"]]))
    q["source"] = HWP_SOURCE
    return q


def normalize_hwp_draft_ids(drafts: list[dict]) -> list[dict]:
    """Fix known source typos (e.g. 2020 성경 has two '23.' markers, no '24.')."""
    fixed: list[dict] = []
    seen: set[str] = set()
    for raw in drafts:
        q = polish_hwp_question(raw)
        qid = q["id"]
        if qid in seen and q["year"] == 2020 and q["subject"] == "성경" and qid.endswith("-023"):
            q = dict(q)
            q["id"] = "hwp-2020-성경-024"
            q["explanation"] = "HWP 원문 번호 오타(23 중복) → 24번으로 보정."
            qid = q["id"]
        if qid in seen:
            raise ValueError(f"Duplicate HWP draft id after normalize: {qid}")
        seen.add(qid)
        fixed.append(q)
    return fixed


def apply_hwp_answers(drafts: list[dict]) -> list[dict]:
    answer_maps = load_hwp_answer_maps()
    by_id = {d["id"]: d for d in normalize_hwp_draft_ids(drafts)}

    # Recover 2020 English #21 (underline grammar item) if extraction skipped it.
    if Q21_2020_ENG["id"] not in by_id:
        by_id[Q21_2020_ENG["id"]] = polish_hwp_question(Q21_2020_ENG)

    ready: list[dict] = []
    missing: list[str] = []
    for (year, subject), amap in sorted(answer_maps.items()):
        for num, answer in amap.items():
            qid = f"hwp-{year}-{subject}-{num:03d}"
            q = by_id.get(qid)
            if not q:
                missing.append(qid)
                continue
            q = dict(q)
            q["answer"] = answer
            mark = (
                "/".join(CIRCLE[i] for i in answer)
                if isinstance(answer, list)
                else CIRCLE[answer]
            )
            note = "복수 정답 인정." if isinstance(answer, list) else ""
            q["explanation"] = f"{year}학년도 {subject} 기출 {num}번 · 정답 {mark}. {note}".strip()
            ready.append(q)

    if missing:
        raise ValueError(f"Missing HWP questions for answers: {', '.join(missing)}")
    ready.sort(key=lambda q: (q["year"], q["subject"], q["id"]))
    return ready


def merge_questions(*groups: list[dict], replace_sources: set[str]) -> None:
    data = json.loads(QUESTIONS_JSON.read_text(encoding="utf-8"))
    data["questions"] = [q for q in data["questions"] if q.get("source") not in replace_sources]
    for group in groups:
        data["questions"].extend(group)
    QUESTIONS_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    bible_bank = build_bible_bank_questions()
    OUT_QUESTION_BANK.write_text(json.dumps(bible_bank, ensure_ascii=False, indent=2), encoding="utf-8")

    # Prefer existing drafts if HWP rebuild is unavailable; otherwise rebuild.
    if any(DOWNLOADS.glob("202*학년도 * 기출문제.hwp")):
        drafts = build_hwp_drafts()
        OUT_HWP_DRAFTS.write_text(json.dumps(drafts, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        drafts = json.loads(OUT_HWP_DRAFTS.read_text(encoding="utf-8"))

    hwp_ready = apply_hwp_answers(drafts)
    OUT_HWP_READY.write_text(json.dumps(hwp_ready, ensure_ascii=False, indent=2), encoding="utf-8")

    merge_questions(
        bible_bank,
        hwp_ready,
        replace_sources={"bible-bank-2026", HWP_SOURCE, "hwp-exam-draft"},
    )

    total = len(json.loads(QUESTIONS_JSON.read_text(encoding="utf-8"))["questions"])
    print(f"bible-bank questions: {len(bible_bank)}")
    print(f"hwp ready questions: {len(hwp_ready)}")
    print(f"questions.json total: {total}")
    print(f"wrote: {OUT_QUESTION_BANK}")
    print(f"wrote: {OUT_HWP_READY}")


if __name__ == "__main__":
    main()

