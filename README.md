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

읽기 홈의 **성경 그림 자료실**에서 핵심 연결 12개의 그림을 고릅니다. 한방에 끝내기와 개별 핵심 읽기에도 같은 그림이 먼저 나옵니다. ‘전체 보기’와 각 장면 버튼으로 해당 부분을 강조하고, ‘크게 보기’로 확대해 옆으로 움직이며 볼 수 있습니다. 글 설명은 ‘글로 자세히 읽기’를 펼칩니다.

아브라함의 네 장면, 야곱의 사닥다리와 씨름, 모세의 표징과 재앙, 에발산과 세겜, 다윗 언약 전달 관계, 지혜 개념 그림, 선지자의 환상, 복음서 사건, 바울의 도시 지도, 디모데와 여섯 편지, 로마서 16장의 역할, 히브리서 11장의 이름을 담았습니다. 기존 학습 문구·카드 ID·읽기 기록은 보존하며 그림 조작을 읽음으로 기록하지 않습니다.

- `#/visuals`: 그림 12장 자료실과 종류별 필터.
- `src/data/bible-visuals.js`: 직접 그린 SVG와 본문·설명. 사물과 인물은 학습용 상징이며 유물이나 실제 외모의 복원도가 아닙니다.
- 바울 지도는 OpenBible.info의 고린도·드로아·루스드라 위치를 참고한 단순화 지도입니다. 각 여행의 대표 장면 세 개를 고른 것이며 한 번의 여행 경로·전체 경로·거리 비례를 나타내지 않습니다. 지도 설명에 위치 출처를 연결했습니다.
- `src/lib/bible-visual.js`: 확대와 장면 강조. SVG 본문에는 접근 가능한 제목·설명을, 버튼에는 선택 상태를 제공합니다. 확대 영역에서 방향키로 이동해도 다음 학습 카드로 넘어가지 않습니다.
- `node scripts/export-bible-visuals.mjs`: 앱과 같은 원본을 `public/visuals/`의 12개 SVG로 내보냅니다. 수정 후 다시 내보내세요. 옵시디언의 `Projects/신대원/그림 자료`는 복사본으로 자동 동기화되지 않습니다.
- `node scripts/test-bible-visuals.mjs`: 원본 카드 연결, 장면별 대응, 파일 일치, 오해 방지 설명, 학습 기록 분리 5개 검사. 그림 12장은 별도 이미지 렌더링으로 검수했습니다. 브라우저 미리보기는 도구의 보안 정책 확인 실패로 확인하지 못했습니다.

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
