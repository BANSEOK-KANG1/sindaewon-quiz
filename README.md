# 신대원 기출문제 은행 (sindaewon-quiz)

총신·장신 신대원 필답 기출을 탐색하고 퀴즈·오답노트로 복습하는 모바일 친화 SPA입니다.

## 출퇴근 읽기

첫 화면의 **‘한방에 끝내기’**를 누르면 핵심 연결 12개를 순서대로 읽고, 마지막에 한 장 요약을 봅니다. ‘시작과 언약 → 약속과 지혜 → 복음과 교회’ 세 구간으로 현재 위치를 보여 줍니다. 중간에 나갔다가 다시 열거나 새로고침해도 이어집니다. 완주 후에는 요약을 다시 보거나 새 회차를 시작할 수 있습니다. 새 회차에서도 예전에 읽은 카드를 건너뛰지 않습니다.

첫 묶음은 창세기 2개와 2020학년도 보유 기출 개념 10개입니다. 약 12분은 카드당 약 1분 기준의 예상 시간입니다. 사건·장소·장절을 나란히 비교하거나 순서로 연결하며, ‘읽었어요 · 다음’을 누를 때 읽음을 기록합니다. 새 10개 카드의 ‘학습 내용과 본문 근거’에서 문항 번호와 성경 본문 링크(NIV)를 확인할 수 있습니다. 12개는 첫 학습 묶음이며 전체 시험 범위나 70점 달성을 뜻하지 않습니다.

책별 3·5·10분 자유 읽기, 성경 66권 목록, 14개 주제 길잡이, 검색, 큰 글씨, 책갈피도 그대로 이용할 수 있습니다. ‘무엇을 읽나요?’에서는 핵심 연결을 개별 선택할 수 있습니다.

- `#/`: 읽기 홈. `#/sprint`: 한방에 끝내기·완주 요약. `#/notes`: 66권 목록. `#/read/창세기`: 시각화된 읽기 카드. `#/saved`: 보관함.
- 기존 퀴즈·오답·계획 경로는 유지합니다. 이전 홈은 `#/dashboard`, 이전 핵심 카드 목록은 `#/notes-old`에서 열 수 있습니다.
- 읽기 기록은 `sindaewon-quiz:commute-reading:v1`에 따로 저장됩니다. 기존 학습 기록을 변경하지 않으며, ‘읽었어요’를 누른 카드만 읽음으로 기록합니다. 읽기 수를 시험 점수나 책 전체 학습 완료로 환산하지 않습니다.
- 한 바퀴 진도는 `sindaewon-quiz:core-sprint:v1`에 별도로 저장합니다. ‘다시 한 바퀴 읽기’는 이번 회차만 새로 시작하고 누적 읽기·책갈피·퀴즈 기록을 유지합니다. 자유 읽기를 해도 코스의 이어 읽기 위치가 바뀌지 않습니다.
- 예상 시간은 카드당 약 1분 기준입니다. 14개 주제는 읽는 순서의 안내이며 실제 학습일을 자동으로 완료 처리하지 않습니다.
- 읽는 동안 전체 메뉴를 숨기고, 핵심 한 줄 → 비교·순서·인물 설명 → 본문 근거 순서로 보여 줍니다. 큰 글씨와 책갈피는 위에, 다음 카드와 이동 버튼은 화면 아래에 유지합니다. 개별 핵심 읽기에는 12개 연결 목차를, 책별 읽기에는 그 책의 카드 목차를 제공합니다.
- 홈의 전체 14개 주제는 펼쳐 보는 방식으로 정리했습니다. 책갈피에 담은 핵심 카드도 집중 읽기로 다시 열립니다.
- 내용·경계 조건·기록 보존 검증: `node --test scripts/test-commute.mjs scripts/test-sprint.mjs`.

## 성경 그림 자료

**성경 그림 자료실**은 구약 39권·신약 27권을 다룹니다. 책 이름이나 내용으로 검색하고, 책을 열면 한국어 그림 개요와 이야기 순서·인물·핵심 사실·구절을 함께 볼 수 있습니다. 포스터는 ‘전체 → 확대 → 더 크게’로 보고 손가락이나 방향키로 이동합니다.

- 공식 BibleProject 한국어 포스터 **62개**: 책별 60개가 66권을 포괄하며, 구약·신약 전체 개요 2개가 추가됩니다. 사무엘·열왕기·역대기·에스라/느헤미야·요한서신은 합본 포스터를 사용합니다.
- Gustave Doré 사건 삽화 **24개**: 그림 관찰 → 기억할 사실 → 본문 장·절. 같은 책 안에서 실제 카드 내용과 맞는 사건을 연결합니다. 한 카드에 여럿이 맞으면 가장 많이 연결된 그림을 먼저 보여 줍니다.
- 기존 핵심 AI 일러스트 **12개**와 34개 관찰 가이드를 유지합니다.
- 607개 읽기 카드 모두 책별 그림 개요를 열 수 있습니다. 24개 사건 그림은 선정한 사건 중심이며, 모든 세부 사실에 전용 그림이 있는 것은 아닙니다.
- `#/visuals`: 검색·구약/신약·사건 그림·핵심 장면. `#/visuals/창세기`: 책별 그림과 사실. `#/visuals/창세기?scene=dore-babel`: 선택한 사건을 먼저 표시합니다.
- 원본은 `public/visuals/bibleproject/`, `public/visuals/dore/`에 보관합니다. 각 폴더의 `ATTRIBUTION.txt`와 `src/data/book-visuals.js`, `src/data/bible-scenes.js`에 출처·이용 조건·파일 해시가 있습니다.
- BibleProject 포스터의 제작자·저작권자는 BibleProject입니다. [공식 한국어 자료실](https://bibleproject.com/ko/)에서 받은 원본을 수정 없이 비상업 학습용으로 표시하며, 모든 표시 옆에 BibleProject 링크를 둡니다. [이용 조건](https://bibleproject.com/terms/). 도레 작품은 개별 Commons 페이지에서 퍼블릭 도메인 표시를 확인했습니다. 출처 확인일: 2026-11-11.
- 옵시디언 `성경 66권 그림 지도`에 책별 노트 66개, `성경 사건 그림 24장`에 사건별 노트 24개를 연결했습니다. 같은 그림 원본 86개를 `Projects/신대원/그림 자료/외부 자료/`에 보관합니다.
- 그림 보기·확대·검색·책 이동은 학습 완료나 점수로 기록하지 않습니다. 기존 카드 ID·내용·진도 저장 방식은 유지합니다.
- `node scripts/test-book-visuals.mjs`: 66권 연결, 원본 무결성, 607카드 표시, 사건 매칭, 출처·본문 구분, 확대·키보드, 학습 기록 분리 검사. 브라우저 실화면 확인은 기존 도구 보안 확인 실패로 미완료입니다.

### 기존 핵심 12장면

읽기 홈의 **성경 그림 자료실**에서 핵심 연결 12개의 일러스트를 고릅니다. 한방에 끝내기와 개별 읽기에서는 첫 장면이 크게 열립니다. 그림 아래 이전·다음 버튼으로 설명을 따라가거나, 그림 위 버튼으로 장면을 선택하고, ‘전체 보기’로 모든 장면을 함께 봅니다. 다윗과 디모데의 단일 그림은 본문 연결을 고르면 설명이 바뀝니다. ‘크게 보기’는 추가 확대입니다. 설명은 **그림에서 볼 곳 → 기억할 연결** 순서로 읽습니다. 기존 12장에 34개 설명을 연결했으며, 마지막 설명에서 다음 학습 카드로 자동 이동하지 않습니다.

기호형 SVG 도식을 1536×1024 PNG 일러스트 12장으로 교체했습니다. 인물·사물·장소를 구체적으로 표현하고, 정확해야 하는 장·절·이름·역할은 이미지 밖의 텍스트로 제공합니다. 기존 학습 카드 ID와 읽기 기록은 유지하고, 그림을 보는 동작은 학습 완료로 저장하지 않습니다.

- `public/visuals/paintings/`: 내장 이미지 생성 도구로 제작한 최종 그림 12장. 외부 이미지 요청 없이 로컬 파일을 사용합니다.
- `docs/bible-illustration-prompts.json`: 사용한 전체 프롬프트와 생성 방식.
- `src/data/bible-visuals.js`: 본문 근거·설명과 각 장면의 범위. 그림은 학습용 상상 장면이며 실제 외모나 유물 복원이 아닙니다. 지혜의 갈림길·나무와 히브리서의 여섯 돌은 기억용 비유입니다.
- `src/lib/bible-visual.js`: 장면 선택·전체 복귀·확대, 제목과 대체 설명, 별도 본문 캡션. 새 장면을 선택하면 확대와 가로 이동을 초기화합니다.
- 옵시디언 `Projects/신대원/그림 자료/성경일러스트-*.png`는 앱과 같은 원본의 복사본입니다. 자동 동기화되지 않습니다.
- `node scripts/test-bible-visuals.mjs`: 카드 연결, PNG 원본·해상도, 장면 범위와 순서, 설명의 구분, 접근 가능한 읽기 화면과 학습 기록 분리 검사. 실제 브라우저 화면 확인은 도구의 보안 정책 확인 실패로 미완료입니다.

## 깜빡이 영어

읽기 홈의 **깜빡이 영어 → 깜빡이 10개 시작**으로 들어갑니다. 기존 300단어를 10개씩 30묶음으로 나눠, 큰 영어 단어 → 뜻·유의어·반의어 → 다음 단어 순서로 자동 표시합니다. 기본 속도는 단어 3초, 뜻 4초로 한 묶음 약 1분 10초입니다. 2·3·5초 중 선택하면 뜻은 항상 1초 더 보여 줍니다.

- 일시정지하거나 ‘뜻 보기·다음 단어’로 직접 넘길 수 있습니다. 예문을 펼치거나 묶음을 고르면 자동 재생이 잠시 멈춥니다.
- 헷갈리는 단어에 책갈피를 누르면 멈추고 표시합니다. 영어 홈에서 표시한 단어만 다시 볼 수 있습니다.
- 한 묶음이 끝나면 단어와 뜻을 한 장에 모아 보여 줍니다. 같은 묶음 반복, 다음 10개, 표시한 단어 복습 중 선택합니다.
- 화면을 나가거나 탭이 숨겨지면 재생을 멈춥니다. 재접속·새로고침은 저장된 단어와 뜻 단계에서 **일시정지 상태**로 열립니다. 영어 홈의 재생 버튼을 누르면 이어서 재생합니다.
- 위치·속도·책갈피·뜻 노출은 `sindaewon-quiz:vocab-flash:v1`에 저장합니다. 자동으로 본 단어를 ‘외움’으로 평가하지 않으며 기존 직접 확인 복습 기록은 유지합니다.
- 진입 경로는 `#/english`, 카드 경로는 `#/english/flash`입니다. 데이터는 `src/data/vocab-300-words.json`, 화면은 `src/views/vocab-flash.js`, 배치는 `src/styles/vocab-flash.css`에 있습니다.
- 검증: `node scripts/test-vocab-flash.mjs`의 7개 검사 통과. 300단어 보존, 단계와 완주, 저장·재개, 복습 목록, 저장 실패, 속도, 중단된 타이머를 검사합니다. 브라우저 미리보기는 도구의 보안 정책 확인 실패로 확인하지 못했습니다.

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
| 한방에 끝내기·완주 요약 | `src/views/sprint.js` |
| 한 바퀴 진도·세 구간 구성 | `src/storage/sprint.js`, `src/data/sprint.js` |
| 한방에 끝내기 화면 배치 | `src/styles/sprint.css` |
| 읽기 홈·목차·카드·보관함 | `src/views/commute.js` |
| 색상·글씨·휴대폰 배치 | `src/styles/commute.css` |
| 시각화 카드·14개 읽기 주제 | `src/data/commute.js` |
| 기출 개념별 핵심 읽기와 본문 출처 | `src/data/core-reading.js` |
| 성경 66권의 기존 핵심 내용 | `src/data/book-notes/` |
| 읽은 위치·책갈피 저장 | `src/storage/commute.js` |

2026-11-10 현재 로컬 작업을 계속합니다. GitHub 업로드는 계정 권한 문제로 반영되지 않았으며 재시도하지 않습니다. 2주 70점 목표는 유지하되 당장 문제 풀이를 요구하지 않습니다. 읽은 카드 수를 점수나 실제 학습 시간으로 간주하지 않습니다.

기존 597개 카드의 ID·내용·위치는 유지하고 출처를 확인한 핵심 카드 10개를 해당 책의 끝에 추가했습니다. 읽기 자료로 공개한 2020년 10문항은 미풀이 진단용으로 다시 사용하지 않습니다. 이후 학습 평가를 할 때에는 별도의 문항과 노출 여부를 확인합니다.

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
