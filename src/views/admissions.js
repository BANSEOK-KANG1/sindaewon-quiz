import { LINKS, SEMINARIES } from "../config.js";
import { loadQuestions, countBySeminaryAndSubject, getTopicStats } from "../data/questions.js";
import { icon } from "../lib/icons.js";
import { navigate } from "../router.js";
import { getExposureCounts, getWrongNotes } from "../storage/progress.js";

const ENGLISH_TRACKS = [
  {
    icon: "library-big",
    tag: "단어장300",
    title: "핵심 300단어",
    desc: "300단어를 영→한·한→영·유의어·반의어 1,200문항으로 반복합니다.",
    action: "영→한 20",
    href: "/quiz?mode=study&tags=단어장300,영한&subject=영어&seminary=chongshin&count=20&auto=1",
  },
  {
    icon: "brain-circuit",
    tag: "동의어",
    title: "동의어·반의어",
    desc: "뜻이 비슷한 보기 사이의 미세한 차이를 익힙니다.",
    action: "동의어 15",
    href: "/quiz?mode=study&tags=동의어&subject=영어&seminary=chongshin&count=15&auto=1",
  },
  {
    icon: "book-check",
    tag: "문법",
    title: "빈출 문법",
    desc: "관계대명사·가정법·분사·수일치부터 점검합니다.",
    action: "문법 20",
    href: "/quiz?mode=study&tags=문법&subject=영어&seminary=chongshin&count=20&auto=1",
  },
  {
    icon: "book-open",
    tag: "독해",
    title: "문장·성경 독해",
    desc: "구조를 먼저 찾고 신학 핵심어로 의미를 좁힙니다.",
    action: "독해 15",
    href: "/quiz?mode=study&tags=독해&subject=영어&seminary=chongshin&count=15&auto=1",
  },
  {
    icon: "timer",
    tag: "원문기출",
    title: "원문기출 실전",
    desc: "2020–22 원문 중 단독 출제가 가능한 검수 완료 문항만 연속으로 풉니다.",
    action: "실전 25",
    href: "/quiz?mode=exam&tags=원문기출&subject=영어&seminary=chongshin&count=25&auto=1",
  },
];

const WEEK_PLAN = [
  {
    week: "1주차",
    title: "어휘 기반 만들기",
    goal: "Day 1–7 · 140단어",
    tasks: ["영→한 20문항", "틀린 단어 한→영 회상", "문법 진단 10문항"],
  },
  {
    week: "2주차",
    title: "어휘를 구별하는 힘",
    goal: "Day 8–15 · 160단어",
    tasks: ["동의어·반의어 교차", "신학 영어 집중", "오답 24시간 내 재풀이"],
  },
  {
    week: "3주차",
    title: "문장 구조와 독해",
    goal: "문법·독해 연결",
    tasks: ["관계사·가정법·분사", "성경영어 15문항", "한 문장 한 근거 찾기"],
  },
  {
    week: "4주차",
    title: "실전 점수 고정",
    goal: "기출 3세트 이상",
    tasks: ["시간을 재고 연속 풀이", "오답 원인 3분류", "약점 유형만 10문항 보충"],
  },
];

const ADMISSION_STEPS = [
  { icon: "file-check-2", title: "모집요강 확인", desc: "지원 자격·전형 구분·시험 범위·날짜를 한 장에 정리" },
  { icon: "files", title: "서류 준비", desc: "학교가 요구하는 증명서·추천서·자기소개 자료를 마감 역산" },
  { icon: "book-check", title: "필답 대비", desc: "성경은 유형·권별, 영어는 어휘·문법·독해 순서로 학습" },
  { icon: "target", title: "면접 준비", desc: "소명·신앙 여정·지원 동기·공동체 경험을 짧고 구체적으로 정리" },
  { icon: "award", title: "고사·등록", desc: "고사장 동선과 준비물을 확인하고 발표·등록 기한까지 관리" },
];

function number(value) {
  return Number(value || 0).toLocaleString("ko-KR");
}

export async function renderAdmissions(root) {
  const questions = await loadQuestions();
  const counts = countBySeminaryAndSubject(questions);
  const exposure = getExposureCounts();
  const wrongIds = new Set(getWrongNotes().map((item) => item.questionId));
  const englishTotal = counts.chongshin?.영어 || 0;
  const originalEnglish = questions.filter(
    (item) => item.subject === "영어" && item.tags?.includes("원문기출")
  ).length;
  const englishBreakdown = {
    vocab: questions.filter((item) => item.subject === "영어" && item.tags?.includes("단어장300")).length,
    grammar: questions.filter((item) => item.subject === "영어" && item.tags?.includes("문법")).length,
    reading: questions.filter((item) => item.subject === "영어" && item.tags?.includes("독해")).length,
  };

  root.innerHTML = `
    <header class="guide-hero">
      <div class="guide-hero-copy">
        <p class="eyebrow">${icon("graduation-cap")} 신대원 입시 가이드</p>
        <h1>준비할 시험과<br />오늘 할 공부를 한눈에</h1>
        <p>학교 공지는 놓치지 않고, 성경·영어는 실제 문제로 반복할 수 있도록 준비 과정을 정리했습니다.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/quiz?mode=exam&tags=원문기출&subject=영어&seminary=chongshin&count=25&auto=1">
            ${icon("circle-play")} 영어 실전 시작
          </a>
          <button class="btn btn-soft" type="button" data-scroll-to="english-plan">${icon("calendar-days")} 4주 계획 보기</button>
        </div>
      </div>
      <div class="guide-score-card" aria-label="앱 수록 현황">
        <span>${icon("languages")}</span>
        <strong>${number(englishTotal)}</strong>
        <p>영어 학습 문항</p>
        <div><span>검수 완료 원문</span><b>${number(originalEnglish)}</b></div>
      </div>
    </header>

    <section class="guide-section" aria-labelledby="school-guide-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">학교별 준비</p>
          <h2 id="school-guide-title">지원 학교의 전형부터 확인하세요</h2>
        </div>
        <span class="section-caption">앱 수록 자료 기준</span>
      </div>
      <div class="school-guide-grid">
        <article class="school-guide-card school-guide-primary">
          <div class="school-card-head">
            <span class="icon-box">${icon("graduation-cap")}</span>
            <div><span class="school-label">CHONGSHIN</span><h3>${SEMINARIES.chongshin.name}</h3></div>
          </div>
          <div class="school-stats">
            <div><strong>${number(counts.chongshin?.성경)}</strong><span>성경 문항</span></div>
            <div><strong>${number(englishTotal)}</strong><span>영어 문항</span></div>
          </div>
          <ul class="clean-check-list">
            <li>${icon("check-circle-2")} 성경 기출 유형·권별 빈도 학습</li>
            <li>${icon("check-circle-2")} 어휘·문법·독해·원문기출 영어 대비</li>
            <li>${icon("check-circle-2")} 학습 모드와 실전 모드 분리</li>
          </ul>
          <div class="card-actions">
            <a class="btn btn-primary" href="#/quiz?seminary=chongshin&restart=1">${icon("circle-play")} 총신 학습</a>
            <a class="text-link" href="${LINKS.cstsent}" target="_blank" rel="noopener">입시 공지 확인 ${icon("external-link")}</a>
          </div>
        </article>

        <article class="school-guide-card">
          <div class="school-card-head">
            <span class="icon-box icon-box-warm">${icon("book-open")}</span>
            <div><span class="school-label">PRESBYTERIAN</span><h3>${SEMINARIES.jangsin.name}</h3></div>
          </div>
          <div class="school-stats">
            <div><strong>${number(counts.jangsin?.성경)}</strong><span>성경 문항</span></div>
            <div><strong>25</strong><span>2027 암송구절</span></div>
          </div>
          <ul class="clean-check-list">
            <li>${icon("check-circle-2")} 구약 문제집 난이도별 학습</li>
            <li>${icon("check-circle-2")} 장절·본문 양방향 암송</li>
            <li>${icon("check-circle-2")} 정답 미수록 문항은 열람으로 구분</li>
          </ul>
          <div class="card-actions">
            <a class="btn btn-secondary" href="#/quiz?seminary=jangsin&restart=1">${icon("circle-play")} 장신 학습</a>
            <a class="text-link" href="${LINKS.puts}" target="_blank" rel="noopener">학교 안내 확인 ${icon("external-link")}</a>
          </div>
        </article>
      </div>
      <aside class="notice-strip">
        ${icon("file-check-2")}
        <p><strong>지원 전 최종 확인</strong><span>지원 자격 · 전형 구분 · 시험 과목/범위 · 고사 시간/배점 · 제출 서류 · 면접 및 등록 일정을 해당 연도 모집요강에서 확인하세요.</span></p>
      </aside>
    </section>

    <section class="guide-section" aria-labelledby="verified-guide-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">공식 요강 기준</p>
          <h2 id="verified-guide-title">총신 M.Div. 일반전형 핵심 구조</h2>
        </div>
        <span class="section-caption">최근 확인 자료 · 2026학년도</span>
      </div>
      <div class="admission-fact-grid">
        <article class="score-blueprint">
          <p>총점</p>
          <strong>200<span>점</span></strong>
          <div class="score-stack" aria-label="총신 일반전형 배점">
            <span style="--score:50"><b>성경</b><em>100점</em></span>
            <span style="--score:25"><b>영어</b><em>50점</em></span>
            <span style="--score:25"><b>심층면접</b><em>50점</em></span>
          </div>
        </article>
        <article class="admission-fact-card">
          <span class="icon-box">${icon("book-check")}</span>
          <div><p class="fact-label">필답고사 150점</p><h3>성경 100 + 영어 50</h3></div>
          <ul>
            <li><strong>성경</strong><span>한글 개역개정판 기준</span></li>
            <li><strong>영어</strong><span>본교 자체 출제 · 어휘·문법·독해</span></li>
            <li><strong>결시</strong><span>필답 과목 결시 시 불합격 처리</span></li>
          </ul>
        </article>
        <article class="admission-fact-card">
          <span class="icon-box icon-box-warm">${icon("files")}</span>
          <div><p class="fact-label">지원·서류 확인</p><h3>자격과 추천서를 먼저</h3></div>
          <ul>
            <li><strong>학력</strong><span>학사학위 취득(예정) 또는 동등 학력</span></li>
            <li><strong>신앙</strong><span>세례·입교 경과기간과 교단 요건 확인</span></li>
            <li><strong>서류</strong><span>추천서·세례증명·졸업/성적증명 등</span></li>
          </ul>
        </article>
      </div>
      <div class="verified-source-row">
        <p>${icon("file-check-2")} <span><strong>자료 기준</strong> 위 내용은 2026학년도 총신대학교 신학대학원 M.Div. 일반전형 공식 모집요강을 요약했습니다. 2027학년도 일정·기준일·서류양식은 새 요강 발표 후 다시 확인해야 합니다.</span></p>
        <a class="btn btn-secondary" href="${LINKS.chongshinGuide2026}" target="_blank" rel="noopener">2026 공식 요강 ${icon("external-link")}</a>
      </div>
    </section>

    <section class="guide-section" aria-labelledby="roadmap-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">지원 로드맵</p>
          <h2 id="roadmap-title">공고 확인부터 등록까지</h2>
        </div>
        <span class="section-caption">학교별 세부 요건은 모집요강 기준</span>
      </div>
      <ol class="admission-roadmap">
        ${ADMISSION_STEPS.map(
          (step, index) => `
          <li>
            <span class="roadmap-index">${String(index + 1).padStart(2, "0")}</span>
            <span class="icon-box">${icon(step.icon)}</span>
            <div><h3>${step.title}</h3><p>${step.desc}</p></div>
          </li>`
        ).join("")}
      </ol>
    </section>

    <section class="guide-section" aria-labelledby="english-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">영어 집중 공략</p>
          <h2 id="english-title">외우기 → 구별하기 → 읽기 → 실전</h2>
        </div>
        <span class="section-caption">5단계</span>
      </div>
      <div class="english-exam-brief">
        <div>
          <p class="eyebrow">영어 50점 대비</p>
          <h3>공식 출제영역을 앱 학습으로 연결했습니다</h3>
          <p>어휘에서 점수를 확보하고, 문법 근거를 빠르게 찾은 뒤, 독해와 원문 세트로 시간 안배를 고정하세요.</p>
        </div>
        <dl>
          <div><dt>어휘</dt><dd>핵심 300단어 · ${number(englishBreakdown.vocab)} 연습문항</dd></div>
          <div><dt>문법</dt><dd>관계사·가정법·분사 등 ${number(englishBreakdown.grammar)}문항</dd></div>
          <div><dt>독해</dt><dd>문장·성경 영어 ${number(englishBreakdown.reading)}문항</dd></div>
          <div><dt>원문</dt><dd>2020–22 검수 완료 ${number(originalEnglish)}문항</dd></div>
        </dl>
      </div>
      <div class="english-track-list">
        ${ENGLISH_TRACKS.map((track, index) => {
          const stats = getTopicStats(
            questions,
            { seminary: "chongshin", subject: "영어", tag: track.tag },
            { exposure, wrongIds }
          );
          return `
            <article class="english-track-card">
              <span class="track-number">0${index + 1}</span>
              <span class="icon-box">${icon(track.icon)}</span>
              <div class="track-copy">
                <div class="track-title-row"><h3>${track.title}</h3><span>${number(stats.total)}문항</span></div>
                <p>${track.desc}</p>
                <div class="mini-progress" aria-label="${track.title} 학습률 ${stats.pct}%"><span style="width:${stats.pct}%"></span></div>
                <small>${stats.seen}문항 학습 · 오답 ${stats.wrong}</small>
              </div>
              <a class="track-action" href="#${track.href}">${track.action} ${icon("chevron-right")}</a>
            </article>`;
        }).join("")}
      </div>
    </section>

    <section class="guide-section" id="english-plan" aria-labelledby="plan-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">4주 완성 루틴</p>
          <h2 id="plan-title">하루 40–60분 영어 계획</h2>
        </div>
        <span class="section-caption">주 6일 학습 + 1일 복습</span>
      </div>
      <div class="week-plan-grid">
        ${WEEK_PLAN.map(
          (week) => `
          <article class="week-card">
            <div class="week-card-top"><span>${week.week}</span>${icon("calendar-days")}</div>
            <h3>${week.title}</h3>
            <p class="week-goal">${week.goal}</p>
            <ul>${week.tasks.map((task) => `<li>${icon("check")} ${task}</li>`).join("")}</ul>
          </article>`
        ).join("")}
      </div>
    </section>

    <section class="exam-lab" aria-labelledby="exam-title">
      <div class="exam-lab-copy">
        <p class="eyebrow eyebrow-invert">실전 시험</p>
        <h2 id="exam-title">공부한 만큼, 시험처럼 확인하세요</h2>
        <p>실전 모드는 문제마다 정답을 보여주지 않고 연속 진행합니다. 종료 후 점수·소요 시간·오답을 확인할 수 있습니다.</p>
        <ul>
          <li>${icon("timer")} 시작 전 알림을 끄고 시간을 재기</li>
          <li>${icon("target")} 모르는 문제는 오래 붙들지 않기</li>
          <li>${icon("notebook-pen")} 오답을 어휘·문법·독해로 분류하기</li>
        </ul>
      </div>
      <div class="exam-presets">
        <a href="#/quiz?mode=exam&tags=원문기출&subject=영어&seminary=chongshin&count=25&auto=1">
          <span>${icon("file-check-2")}<b>원문기출</b></span><strong>25문항</strong>${icon("arrow-right")}
        </a>
        <a href="#/quiz?mode=exam&tags=문법&subject=영어&seminary=chongshin&count=20&auto=1">
          <span>${icon("book-check")}<b>문법 점검</b></span><strong>20문항</strong>${icon("arrow-right")}
        </a>
        <a href="#/quiz?mode=exam&tags=기출어휘&subject=영어&seminary=chongshin&count=30&auto=1">
          <span>${icon("languages")}<b>기출어휘</b></span><strong>30문항</strong>${icon("arrow-right")}
        </a>
      </div>
    </section>

    <p class="source-disclaimer">문항 수와 학습 범위는 앱 수록 자료 기준입니다. HWP 추출 과정에서 지문이나 밑줄 위치가 유실된 영어 문항은 원본 대조 전까지 출제 대상에서 제외했습니다. 실제 지원 자격과 전형 방식은 해마다 바뀔 수 있으므로 반드시 학교가 발표한 해당 연도 모집요강을 최종 기준으로 삼으세요.</p>
  `;

  root.querySelectorAll("a[href^='#/']").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(link.getAttribute("href").slice(1));
    });
  });

  root.querySelector("[data-scroll-to='english-plan']")?.addEventListener("click", () => {
    root.querySelector("#english-plan")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
