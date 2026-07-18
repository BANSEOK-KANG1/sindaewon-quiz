#!/usr/bin/env python3
"""영어 객관식 선택지별 뜻·틀린 이유(choiceNotes)를 붙입니다.

- vocab-300: scripts/vocab-300-words.json 기반
- quizlet / hwp / 기타: 본문 사전 → API 캐시 → 파생(동의어/반의어) 순
- explanation에 '선택지 정리'를 넣지 않음(셔플 시 번호 불일치 방지). UI가 choiceNotes로 렌더.
"""

from __future__ import annotations

import argparse
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUESTIONS = ROOT / "public" / "data" / "questions.json"
VOCAB = ROOT / "scripts" / "vocab-300-words.json"
CACHE = ROOT / "scripts" / "en-gloss-cache.json"
VOCAB_Q = ROOT / "scripts" / "vocab-300-questions.json"

STEM_RE = re.compile(r"\[([^\]]+)\]")
CHOICE_BLOCK_RE = re.compile(r"\n*\s*선택지 정리\n(?:[①②③④].*\n?)+", re.MULTILINE)


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_lexicon(words: list[dict]) -> tuple[dict[str, dict], dict[str, dict]]:
    primary: dict[str, dict] = {}
    derived: dict[str, dict] = {}
    for w in words:
        key = w["word"].lower().strip()
        primary[key] = {
            "word": w["word"],
            "meaning": w["meaning"],
            "pos": w.get("pos") or "",
        }
    for w in words:
        for field, label in (("synonym", "동의어"), ("antonym", "반의어")):
            s = (w.get(field) or "").strip()
            if not s:
                continue
            key = s.lower()
            if key in primary or key in derived:
                continue
            if field == "synonym":
                meaning = f"{w['word']}의 동의어 (~{w['meaning']})"
            else:
                meaning = f"{w['word']}의 반의어 (≠ {w['meaning']})"
            derived[key] = {"word": s, "meaning": meaning, "pos": w.get("pos") or ""}
    return primary, derived


def meaning_index(words: list[dict]) -> dict[str, dict]:
    return {w["meaning"]: w for w in words}


def gloss_en(
    word: str,
    primary: dict,
    derived: dict,
    cache: dict,
    fetch: bool,
) -> str | None:
    key = word.lower().strip()
    if not key:
        return None
    if key in primary:
        return primary[key]["meaning"]
    cached = cache.get(key)
    if cached:
        return cached
    if fetch and re.fullmatch(r"[a-zA-Z][a-zA-Z\-']{0,40}", word.strip()):
        url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{urllib.parse.quote(word.strip())}"
        try:
            with urllib.request.urlopen(url, timeout=8) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            defs = []
            for entry in data[:1]:
                for m in entry.get("meanings") or []:
                    pos = m.get("partOfSpeech") or ""
                    for d in (m.get("definitions") or [])[:1]:
                        text = (d.get("definition") or "").strip()
                        if text:
                            # keep short for mobile UI
                            if len(text) > 80:
                                text = text[:77] + "…"
                            defs.append(f"{pos} {text}".strip() if pos else text)
            gloss = "; ".join(defs[:2]) if defs else ""
            cache[key] = gloss
            time.sleep(0.1)
            if gloss:
                return gloss
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, json.JSONDecodeError, KeyError):
            cache[key] = ""
    if key in derived:
        return derived[key]["meaning"]
    if key in cache:
        return cache[key] or None
    return None


def kind_of(q: dict) -> str:
    tags = q.get("tags") or []
    if "동의어" in tags:
        return "synonym"
    if "반의어" in tags:
        return "antonym"
    if "영한" in tags:
        return "meaning"
    stem = (q.get("question") or "").lower()
    if "closest in meaning" in stem or "의미가 가장 가까운" in stem:
        return "synonym"
    if "opposite" in stem or "의미가 반대" in stem:
        return "antonym"
    if "핵심 뜻" in stem or "뜻은" in (q.get("question") or ""):
        return "meaning"
    return "other"


def note_for_choice(
    *,
    choice: str,
    is_correct: bool,
    kind: str,
    primary: dict,
    derived: dict,
    by_meaning: dict,
    cache: dict,
    fetch: bool,
) -> str:
    c = choice.strip()

    if kind == "meaning":
        hit = by_meaning.get(c)
        if is_correct:
            if hit:
                pos = hit.get("pos") or ""
                return f"정답 · [{hit['word']}]{(' ' + pos) if pos else ''} {c}".strip()
            return f"정답 · {c}"
        if hit:
            return f"[{hit['word']}]의 뜻 · 정답과 무관"
        return "다른 단어의 뜻 · 정답과 무관"

    meaning = gloss_en(c, primary, derived, cache, fetch)
    if is_correct:
        if kind == "synonym":
            return f"정답(동의어)" + (f" · {meaning}" if meaning else "")
        if kind == "antonym":
            return f"정답(반의어)" + (f" · {meaning}" if meaning else "")
        return f"정답" + (f" · {meaning}" if meaning else "")

    if kind == "synonym":
        return (f"{meaning} · 동의어 아님" if meaning else "다른 뜻 · 동의어 아님")
    if kind == "antonym":
        return (f"{meaning} · 반의어 아님" if meaning else "다른 뜻 · 반의어 아님")
    return (f"{meaning} · 오답" if meaning else "오답")


def strip_choice_block(expl: str | None) -> str:
    if not expl:
        return ""
    return CHOICE_BLOCK_RE.sub("", expl).rstrip()


def enrich_question(q: dict, primary, derived, by_meaning, cache, fetch: bool) -> bool:
    if q.get("type") != "multiple" or q.get("subject") != "영어":
        return False
    # 문법 문제는 선택지 뜻보다 해설이 핵심 — 스킵
    if q.get("source") == "grammar" or "문법" in (q.get("tags") or []) and "어휘" not in (q.get("tags") or []):
        if "choiceNotes" in q:
            del q["choiceNotes"]
        return False
    # quizlet 문법·독해 혼합 태그라도 동의어형 문항만
    kind = kind_of(q)
    if q.get("source") == "quizlet" and kind == "other":
        if "choiceNotes" in q:
            del q["choiceNotes"]
        return False
    choices = q.get("choices")
    if not isinstance(choices, list) or len(choices) < 2:
        return False
    ans = q.get("answer")
    if not isinstance(ans, int) or ans < 0 or ans >= len(choices):
        return False

    notes: dict[str, str] = {}
    for i, c in enumerate(choices):
        notes[c] = note_for_choice(
            choice=c,
            is_correct=(i == ans),
            kind=kind,
            primary=primary,
            derived=derived,
            by_meaning=by_meaning,
            cache=cache,
            fetch=fetch,
        )

    q["choiceNotes"] = notes
    cleaned = strip_choice_block(q.get("explanation"))
    if cleaned != (q.get("explanation") or ""):
        q["explanation"] = cleaned
    elif q.get("explanation") is None:
        q["explanation"] = ""
    return True


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--fetch", action="store_true", help="미등록 영단어 뜻을 Free Dictionary API로 보강")
    ap.add_argument("--no-vocab-intermediate", action="store_true")
    args = ap.parse_args()

    words = load_json(VOCAB)
    primary, derived = build_lexicon(words)
    by_meaning = meaning_index(words)
    cache = load_json(CACHE) if CACHE.exists() else {}

    raw = load_json(QUESTIONS)
    qs = raw["questions"] if isinstance(raw, dict) else raw
    n = 0
    for q in qs:
        if enrich_question(q, primary, derived, by_meaning, cache, fetch=args.fetch):
            n += 1

    if isinstance(raw, dict):
        raw["questions"] = qs
        save_json(QUESTIONS, raw)
    else:
        save_json(QUESTIONS, qs)

    if not args.no_vocab_intermediate and VOCAB_Q.exists():
        vq = load_json(VOCAB_Q)
        items = vq["questions"] if isinstance(vq, dict) and "questions" in vq else vq
        for q in items:
            enrich_question(q, primary, derived, by_meaning, cache, fetch=False)
        if isinstance(vq, dict) and "questions" in vq:
            vq["questions"] = items
            save_json(VOCAB_Q, vq)
        else:
            save_json(VOCAB_Q, items)

    save_json(CACHE, dict(sorted(cache.items())))
    print(f"enriched {n} English MCQs · gloss cache {len(cache)} · fetch={args.fetch}")


if __name__ == "__main__":
    main()
