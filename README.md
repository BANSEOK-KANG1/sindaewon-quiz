# 신대원 기출문제 은행 (sindaewon-quiz)

총신·장신 신대원 필답 기출을 탐색하고 퀴즈·오답노트로 복습하는 모바일 친화 SPA입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 표시된 주소로 접속합니다 (기본 Vite 개발 서버).

## Android 앱 (Capacitor)

패키지 ID: `kr.sindaewon.quiz` · 앱 이름: **신대원퀴즈**

```bash
# 웹 빌드 + Android 동기화 + debug APK
npm run android:apk
```

산출물:

- `releases/sindaewon-quiz-debug.apk` (설치용으로 복사해 둔 경로)
- 원본: `android/app/build/outputs/apk/debug/app-debug.apk`

폰에 설치 (USB 디버깅 또는 APK 파일 전송):

```bash
adb install -r releases/sindaewon-quiz-debug.apk
# 또는 Android Studio
npm run android:open
```

웹 수정 후 다시 넣으려면: `npm run cap:sync` 후 APK 재빌드.

## 웹 배포 (GitHub Pages)

- 웹앱: https://banseok-kang1.github.io/sindaewon-quiz/
- 저장소: https://github.com/BANSEOK-KANG1/sindaewon-quiz
- Android APK: https://github.com/BANSEOK-KANG1/sindaewon-quiz/releases/download/v1.0.0/sindaewon-quiz-debug.apk

`main`에 푸시하면 Actions가 자동으로 Pages에 배포합니다.

## 문제 데이터 가져오기

### Quizlet 텍스트 → JSON

Quizlet에서 복사하거나 덤프한 플래시카드를 텍스트로 정리한 뒤 JSON으로 변환합니다.

```bash
npm run import
# 또는
node scripts/import-questions.js        # 성경 + 영어 전체
node scripts/import-questions.js bible    # 성경만
node scripts/import-questions.js english  # 영어만
```

**입력 파일 (성경)**

| 파일 | 설명 |
|------|------|
| `scripts/quizlet-bible*.txt` | `quizlet-bible.txt`, `quizlet-bible-full.txt`, `scripts/quizlet-bible-ot-short.txt` 등 **모든 `quizlet-bible` 텍스트**를 읽어 병합 후 문항 텍스트 기준 **중복 제거** |
| `quizlet-bible-ot-short.txt` 등 | 번호·선택지 없이 **문제 줄 + 다음 줄 정답** (구약 단답·Quizlet 44561581 유형). `import-questions.js`의 `parseFlashcardBlock` 사용 |

참고 Quizlet 세트 (자동 수집 시 `scripts/dumps/`에 curl 저장 후 파싱 가능 — 현재는 봇 차단 시 수동 텍스트 사용):

- [44561581 기출문제_구약_신대원입시](https://quizlet.com/44561581) — 단답형
- [44632793 성경기출_권별_01_창세기](https://quizlet.com/44632793)
- [893342880 총신 성경고사 신약 바울~계](https://quizlet.com/893342880)

**입력 파일 (영어)**

총신 신대원용 **영어 객관식 전용 Quizlet 세트는 없습니다.** 아래 파일을 병합·중복 제거합니다.

| 파일 | 설명 |
|------|------|
| `scripts/quizlet-english.txt` | 기존 샘플 (어휘·문법·독해) |
| `scripts/quizlet-english-full.txt` | 입학가이드 빈출 어휘·문법·ESV 구절 독해 **추가 문항** |
| `scripts/quizlet-english-vocab.txt` | TEPS 스타일 어휘 4지선다 (`X means:`) |
| `scripts/quizlet-english-expand.txt` | TEPS형 동의어·신학영어·문법·ESV 독해 확장 (~300+) |

`npm run import` 시 `quizlet-english*.txt` 전부 병합·중복 제거합니다.

```bash
npm run import
```

**텍스트 형식** (항목마다 3블록, 빈 줄로 구분 가능)

```
1. 문제 본문 (여러 줄 가능 — ① 선택지가 나올 때까지 이어짐)
①선택1 ②선택2 ③선택3 ④선택4
②
```

- 문항 번호: `1.` 또는 `43번.` 형식
- 정답: `①`~`④` 또는 `1`~`4`
- `#` 로 시작하는 줄은 주석

**출력:** `public/data/questions.json`  
ID는 `chongshin-bible-001`처럼 과목별로 **파일 구간마다 리셋하지 않고** 연속 부여됩니다(성경 full + bible 병합 시 한 번에 번호 매김).

### 장신 필답 CSV → JSON 병합

서술형·단답형은 CSV 템플릿을 사용합니다.

```bash
npm run import:csv
# 다른 파일 지정
node scripts/import-csv.js scripts/templates/jangsin-short-answer.csv
```

**템플릿:** `scripts/templates/jangsin-short-answer.csv`

```csv
id,seminary,year,subject,question,answer,tags,source
jangsin-bible-001,jangsin,2023,성경,"문제",정답,"구약|창세기",장신 필답
```

- `tags`는 `|` 로 구분
- 기존 `public/data/questions.json`이 있으면 **같은 `id`는 교체**, 새 `id`는 추가

### Quizlet 전체 덤프에서 full 텍스트 만들기

캐시된 Quizlet HTML/텍스트 덤프에서 `Terms in this set` ~ `See more` 구간을 파싱해 `scripts/quizlet-bible-full.txt`를 생성할 수 있습니다. (저장된 덤프에 포함된 항목 수만큼만 추출됩니다. 세트가 817문항이어도 덤프가 일부만 있으면 그만큼만 나옵니다.)

## 빌드

```bash
npm run build
npm run preview
```

## 문서

- [docs/sources.md](docs/sources.md) — 자료 수집 가이드
- [docs/sources-chongshin.md](docs/sources-chongshin.md) — 총신 연도별 체크리스트
