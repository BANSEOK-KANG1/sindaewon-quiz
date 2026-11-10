# 신대원 기출문제 은행 (sindaewon-quiz)

총신·장신 신대원 필답 기출을 탐색하고 퀴즈·오답노트로 복습하는 모바일 친화 SPA입니다.

## 출퇴근 읽기

첫 화면은 3·5·10분 분량을 고르는 읽기 화면입니다. 성경 66권의 기존 핵심 내용을 사건 흐름, 인물과 역할, 핵심 연결, 구절과 출처로 나누어 보여 줍니다. 14개 주제의 읽기 길잡이, 성경 이름 검색, 구약·신약 필터, 큰 글씨, 책갈피, 이어 읽기를 지원합니다. 읽기 화면의 카드 목차에서 원하는 내용으로 바로 이동할 수 있고, 성경 목록에는 읽은 카드 진도가 표시됩니다.

- `#/`: 읽기 홈. `#/notes`: 66권 목록. `#/read/창세기`: 시각화된 읽기 카드. `#/saved`: 보관함.
- 기존 퀴즈·오답·계획 경로는 유지합니다. 이전 홈은 `#/dashboard`, 이전 핵심 카드 목록은 `#/notes-old`에서 열 수 있습니다.
- 읽기 기록은 `sindaewon-quiz:commute-reading:v1`에 따로 저장됩니다. 기존 학습 기록을 변경하지 않으며, ‘읽었어요’를 누른 카드만 읽음으로 기록합니다. 읽기 수를 시험 점수나 책 전체 학습 완료로 환산하지 않습니다.
- 예상 시간은 카드당 약 1분 기준입니다. 14개 주제는 읽는 순서의 안내이며 실제 학습일을 자동으로 완료 처리하지 않습니다.
- 내용·경계 조건·기록 보존 검증: `node scripts/test-commute.mjs`.

## 내 컴퓨터에서 바로 실행

1. KIOXIA 외장 하드를 연결합니다.
2. Finder에서 `/Volumes/KIOXIA/sindaewon-quiz` 폴더를 엽니다.
3. **`신대원공부.command`를 더블클릭**합니다. 브라우저가 열리면 바로 읽거나 작업할 수 있습니다.

주소는 `http://127.0.0.1:5173/`입니다. 소스를 저장하면 화면이 자동으로 갱신됩니다. 종료는 실행 창에서 `Control+C`를 누릅니다. 이미 실행 중이면 새로 실행하지 않고 같은 주소를 사용하세요.

이전에 만든 `출퇴근읽기_미리보기.html`은 초기 화면을 담은 파일입니다. 최신 목차 개선과 이후 수정은 위 실행 파일로 확인합니다.

Node.js 22.12 이상이 필요합니다(20.19 이상인 20.x도 지원). 실행 파일은 설치된 Node.js를 사용하며, 실행 구성요소가 없거나 다른 운영체제용이면 잠금 파일을 기준으로 준비합니다. 이 경우 첫 실행에 인터넷이 필요합니다. 구성요소와 설치 캐시는 외장 하드 안에 저장됩니다.

프로젝트를 노트북으로 복사하지 않습니다. `/Users/kangbanseok`의 기존 링크도 그대로 사용합니다. 이 작업 환경에서는 같은 외장 하드가 `/media/teleop/KIOXIA`로 보입니다.

읽은 기록은 **브라우저와 주소별로** 저장됩니다. 항상 같은 브라우저의 `127.0.0.1:5173` 주소를 쓰세요. GitHub 웹앱·단일 HTML 미리보기의 기록은 이 주소에 자동으로 합쳐지지 않습니다. 이 실행 방식은 컴퓨터용이며 휴대폰 접속은 포함하지 않습니다.

### 이어서 작업할 위치

| 작업 | 파일 |
| --- | --- |
| 읽기 홈·목차·카드·보관함 | `src/views/commute.js` |
| 색상·글씨·휴대폰 배치 | `src/styles/commute.css` |
| 시각화 카드·14개 읽기 주제 | `src/data/commute.js` |
| 성경 66권의 기존 핵심 내용 | `src/data/book-notes/` |
| 읽은 위치·책갈피 저장 | `src/storage/commute.js` |

2026-11-10 현재 로컬 작업을 계속합니다. GitHub 업로드는 계정 권한 문제로 반영되지 않았으며 재시도하지 않습니다. 2주 70점 목표는 유지하되 당장 문제 풀이를 요구하지 않습니다. 읽은 카드 수를 점수나 실제 학습 시간으로 간주하지 않습니다.

다음 내용 작업은 기출 중요도에 맞춰 핵심 사건·인물·장소 연결을 보강하는 것입니다. 기존 카드 ID와 읽기 기록을 보존하고, 내용의 출처를 확인하면서 진행합니다.

### 터미널에서 실행

```bash
bash scripts/start-local.sh
```

실행 환경만 확인하려면 `bash scripts/start-local.sh --check`를 사용합니다. macOS Finder의 더블클릭 동작은 실제 맥에서 최종 확인이 필요합니다.

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

가져온 자료는 `npm run curate`에서 한 번 더 검수합니다. 원문 추출 중 지문·밑줄 위치가 유실된 항목은 제외하고, OCR 잡문자를 정리하며, 비어 있는 해설에는 정답·자료 기준 안내를 보강합니다. `npm run build`와 `npm run import`에는 이 검수 과정이 자동으로 포함됩니다.

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
