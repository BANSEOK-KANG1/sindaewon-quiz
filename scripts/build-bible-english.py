#!/usr/bin/env python3
"""
신대원 전용 성경 영어 학습 데이터 생성기.

바이블 SQLite DB(ESV + 개역개정)에서 큐레이션한 핵심 구절을 뽑아
  - 독해(영→한 MC)
  - 암송(한→영 플래시/단답)
  - 빈칸(핵심 신학어 cloze MC)
문항을 만들어 scripts/bible-english-questions.json 으로 저장한다.

Usage: python3 scripts/build-bible-english.py
"""
import json
import re
import random
import sqlite3
from pathlib import Path

BIBLES = Path("/Users/kangbanseok/bible/bible-app/app/src/main/assets/bibles")
ESV = BIBLES / "12ESV.bdb"
KOR = BIBLES / "01개역개정.bdb"
OUT = Path(__file__).parent / "bible-english-questions.json"

random.seed(7)

# 책 번호 → 한글 책이름 (개신교 66권)
BOOK_KR = {
    1: "창세기", 2: "출애굽기", 3: "레위기", 4: "민수기", 5: "신명기",
    6: "여호수아", 19: "시편", 20: "잠언", 21: "전도서", 23: "이사야",
    24: "예레미야", 40: "마태복음", 41: "마가복음", 42: "누가복음",
    43: "요한복음", 44: "사도행전", 45: "로마서", 46: "고린도전서",
    47: "고린도후서", 48: "갈라디아서", 49: "에베소서", 50: "빌립보서",
    51: "골로새서", 53: "데살로니가후서", 54: "디모데전서", 55: "디모데후서",
    58: "히브리서", 59: "야고보서", 60: "베드로전서", 62: "요한일서",
    66: "요한계시록",
}

# (book, chap, verse, cloze_word, theme_tags)
# theme: 구원/은혜/믿음/사랑/창조/율법/기도/소망/거룩/교회
VERSES = [
    (1, 1, 1, "created", ["창조"]),
    (1, 1, 27, "image", ["창조"]),
    (2, 20, 3, "gods", ["율법"]),
    (5, 6, 5, "love", ["율법", "사랑"]),
    (6, 1, 9, "courageous", ["소망"]),
    (19, 1, 1, "blessed", ["소망"]),
    (19, 23, 1, "shepherd", ["소망"]),
    (19, 119, 105, "lamp", ["율법"]),
    (20, 3, 5, "trust", ["소망"]),
    (23, 40, 31, "renew", ["소망"]),
    (23, 53, 5, "pierced", ["구원"]),
    (40, 5, 3, "poor", ["거룩"]),
    (40, 6, 33, "kingdom", ["소망"]),
    (40, 11, 28, "rest", ["소망"]),
    (40, 22, 37, "love", ["사랑", "율법"]),
    (40, 28, 19, "nations", ["교회"]),
    (43, 1, 1, "Word", ["창조"]),
    (43, 3, 16, "loved", ["구원", "사랑"]),
    (43, 14, 6, "way", ["구원"]),
    (43, 15, 5, "vine", ["거룩"]),
    (44, 1, 8, "witnesses", ["교회"]),
    (45, 3, 23, "sinned", ["구원"]),
    (45, 5, 8, "sinners", ["은혜", "사랑"]),
    (45, 6, 23, "wages", ["구원"]),
    (45, 8, 28, "good", ["소망"]),
    (45, 10, 9, "confess", ["구원", "믿음"]),
    (45, 12, 2, "transformed", ["거룩"]),
    (46, 13, 13, "love", ["사랑"]),
    (47, 5, 17, "creation", ["구원"]),
    (48, 2, 20, "crucified", ["믿음"]),
    (48, 5, 22, "fruit", ["거룩"]),
    (49, 2, 8, "grace", ["은혜", "구원"]),
    (50, 4, 6, "anxious", ["기도"]),
    (50, 4, 13, "strengthens", ["소망"]),
    (54, 3, 16, "breathed", ["율법"]),  # 디모데후서=55? adjust below
    (58, 11, 1, "assurance", ["믿음"]),
    (59, 1, 2, "trials", ["소망"]),
    (60, 2, 9, "priesthood", ["교회", "거룩"]),
    (62, 1, 9, "confess", ["구원"]),
    (66, 3, 20, "door", ["소망"]),
]

# 디모데후서 3:16 는 book 55
FIX = {(54, 3, 16): (55, 3, 16, "breathed", ["율법"])}


def clean(text: str) -> str:
    if text is None:
        return ""
    t = text.strip().strip('"').strip()
    t = re.sub(r"\s+", " ", t)
    return t


def ref_kr(book, ch, v):
    return f"{BOOK_KR.get(book, str(book))} {ch}:{v}"


def main():
    esv = sqlite3.connect(ESV)
    kor = sqlite3.connect(KOR)

    def q_esv(b, c, v):
        r = esv.execute(
            "SELECT btext FROM Bible WHERE book=? AND chapter=? AND verse=?", (b, c, v)
        ).fetchone()
        return clean(r[0]) if r else None

    def q_kor(b, c, v):
        r = kor.execute(
            "SELECT btext FROM Bible WHERE book=? AND chapter=? AND verse=?", (b, c, v)
        ).fetchone()
        return clean(r[0]) if r else None

    verses = []
    for row in VERSES:
        b, c, v, word, themes = row
        if (b, c, v) in FIX:
            b, c, v, word, themes = FIX[(b, c, v)]
        en = q_esv(b, c, v)
        ko = q_kor(b, c, v)
        if not en or not ko:
            print(f"skip missing {ref_kr(b,c,v)}")
            continue
        verses.append({"b": b, "c": c, "v": v, "word": word, "themes": themes, "en": en, "ko": ko})

    print(f"loaded {len(verses)} verses")

    ko_pool = [x["ko"] for x in verses]
    questions = []

    for x in verses:
        ref = ref_kr(x["b"], x["c"], x["v"])
        base_tags = ["성경영어", "신대원영어"] + x["themes"]

        # 1) 독해: 영어 구절 → 한글 뜻 MC
        wrongs = random.sample([k for k in ko_pool if k != x["ko"]], 3)
        choices = wrongs + [x["ko"]]
        random.shuffle(choices)
        questions.append({
            "id": f"bible-en-{x['b']}-{x['c']}-{x['v']}-read",
            "seminary": "chongshin", "year": None, "subject": "영어", "type": "multiple",
            "question": f"다음 성경 구절({ref})의 알맞은 번역은?\n“{x['en']}”",
            "choices": choices, "answer": choices.index(x["ko"]),
            "explanation": f"{ref} (ESV)\n{x['en']}\n{x['ko']}",
            "tags": base_tags + ["독해", "영한"], "source": "bible-english",
        })

        # 2) 암송: 한글 구절 → 영어 회상 (플래시/단답 self-grade)
        questions.append({
            "id": f"bible-en-{x['b']}-{x['c']}-{x['v']}-recite",
            "seminary": "chongshin", "year": None, "subject": "영어", "type": "short",
            "question": f"다음 구절을 영어(ESV)로 암송해 보세요.\n[{ref}] {x['ko']}",
            "answer": x["en"],
            "explanation": f"{ref} (ESV)\n{x['en']}",
            "tags": base_tags + ["암송", "한영"], "source": "bible-english",
        })

        # 3) 빈칸: 핵심 신학어 cloze MC
        word = x["word"]
        pat = re.compile(rf"\b{re.escape(word)}\b", re.IGNORECASE)
        if pat.search(x["en"]):
            blanked = pat.sub("______", x["en"], count=1)
            # distractor words from other verses' cloze words
            others = list({w["word"] for w in verses if w["word"].lower() != word.lower()})
            dwords = random.sample(others, min(3, len(others)))
            cw = [word] + dwords
            random.shuffle(cw)
            questions.append({
                "id": f"bible-en-{x['b']}-{x['c']}-{x['v']}-cloze",
                "seminary": "chongshin", "year": None, "subject": "영어", "type": "multiple",
                "question": f"빈칸에 알맞은 단어는? ({ref})\n“{blanked}”",
                "choices": cw, "answer": cw.index(word),
                "explanation": f"{ref} (ESV)\n{x['en']}\n{x['ko']}",
                "tags": base_tags + ["빈칸", "어휘"], "source": "bible-english",
            })
        else:
            print(f"cloze word '{word}' not in {ref}")

    OUT.write_text(json.dumps(questions, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {len(questions)} questions -> {OUT}")


if __name__ == "__main__":
    main()
