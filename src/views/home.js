import { SEMINARIES, UI } from "../config.js";
import { loadQuestions, countBySeminaryAndSubject } from "../data/questions.js";
import { suggestVocabDay } from "../data/study-curriculum.js";
import {
  buildPlan,
  nextPlanStep,
  stepKey,
  toDateKey,
  dDay,
  planQuestionGoal,
  focusDay,
  EXAMS,
  PHASES,
} from "../data/daily-plan.js";
import { navigate } from "../router.js";
import {
  getTodayProgress,
  getWrongNotes,
  getStudyStats,
  getExposureCounts,
  getPlanProgress,
} from "../storage/progress.js";
import { icon } from "../lib/icons.js";
import { syncReadSteps } from "../storage/notes-progress.js";

export async function renderHome(root) {
  const questions = await loadQuestions();
  const counts = countBySeminaryAndSubject(questions);
  const total = questions.length;
  const must = questions.filter((q) => q.tags?.includes("필수") && q.seminary === "chongshin").length;
  const grad = questions.filter((q) => q.tags?.includes("기출") && q.seminary === "chongshin").length;
  const jangsin = questions.filter((q) => q.seminary === "jangsin").length;
  const vocab = questions.filter((q) => q.tags?.includes("단어장300")).length;
  const wrong = getWrongNotes().length;
  const stats = getStudyStats();
  const exposure = getExposureCounts();
  const vocabDay = suggestVocabDay(questions, exposure);

  syncReadSteps(buildPlan(getPlanProgress().startDate));
  const planProgress = getPlanProgress();
  const plan = buildPlan(planProgress.startDate);
  const todayKey = toDateKey();
  const todayPlan = focusDay(plan, todayKey);
  const today = getTodayProgress(planQuestionGoal(todayPlan));
  const vocabStep = todayPlan?.steps.find((s) => s.tags?.includes("단어장300"));
  const next = nextPlanStep(plan, planProgress.done, todayKey);
  const isDone = (s) => Boolean(planProgress.done[stepKey(todayPlan.date, s.id)]);
  const planDone = todayPlan ? todayPlan.steps.filter(isDone).length : 0;
  const exam = EXAMS.chongshin;
  const phaseLabel = todayPlan ? PHASES[todayPlan.phase]?.label : "계획 기간 밖";

  root.innerHTML = `
    <header class="home-hero-v2">
      <div class="home-hero-copy">
        <p class="eyebrow">${icon("sparkles")} ${exam.short} ${dDay(todayKey, exam.date)} · ${phaseLabel}</p>
        <h1>${todayPlan ? todayPlan.title : "오늘 할 공부만 선명하게"}</h1>
        <p>${todayPlan ? `${todayPlan.preview ? "11/9(월) 시작 · 미리 풀어도 1일차로 기록 · " : ""}${todayPlan.dayNo}일차 · 단계 ${planDone}/${todayPlan.steps.length} · 문항 ${today.answered}/${today.goal} · 약 ${todayPlan.minutes}분` : "전체 계획에서 날짜를 골라 학습하세요."}</p>
        <div class="progress-track hero-progress" aria-hidden="true"><div class="progress-fill" style="width:${today.pct}%"></div></div>
        ${
          todayPlan
            ? `<ol class="plan-steps">
                ${todayPlan.steps
                  .map(
                    (s) => `<li class="${isDone(s) ? "done" : ""}${next?.step.id === s.id ? " current" : ""}">
                      <span class="plan-check">${isDone(s) ? "✓" : ""}</span>
                      <span><strong>${s.label}</strong><span class="muted small"> · ${s.detail}</span></span>
                    </li>`
                  )
                  .join("")}
              </ol>`
            : ""
        }
        <div class="hero-actions">
          ${
            next
              ? `<a class="btn btn-primary hero-next" href="#/quiz?plan=next">${icon("circle-play")} ${planDone ? "이어서" : "시작"} · ${next.step.label}</a>`
              : `<p class="plan-complete">오늘 퀴즈 계획을 모두 끝냈어요</p>`
          }
          <a class="btn btn-soft" href="#/plan">${icon("calendar-days")} 전체 계획</a>
        </div>
      </div>
      <div class="today-ring" style="--progress:${today.pct}" aria-label="오늘 목표 ${today.pct}% 달성">
        <div><strong>${today.answered}</strong><span>/ ${today.goal}문항</span></div>
        <p>${today.pct >= 100 ? "목표 달성" : "오늘 진도"}</p>
      </div>
    </header>

    <section class="home-stat-strip" aria-label="학습 현황">
      <div><span class="stat-icon">${icon("flame")}</span><p><strong>${today.streak}일</strong><span>연속 학습</span></p></div>
      <div><span class="stat-icon">${icon("check-circle-2")}</span><p><strong>${(stats.totalCorrect || 0).toLocaleString("ko-KR")}</strong><span>누적 정답</span></p></div>
      <div><span class="stat-icon">${icon("notebook-pen")}</span><p><strong>${wrong}</strong><span>복습할 오답</span></p></div>
    </section>

    <section class="english-spotlight">
      <div class="english-spotlight-icon">${icon("languages")}</div>
      <div class="english-spotlight-copy">
        <p class="eyebrow">영어 집중</p>
        <h2>어휘부터 원문기출까지 한 흐름으로</h2>
        <p>총 ${questions.filter((q) => q.subject === "영어").length.toLocaleString("ko-KR")}문항 · 핵심 300단어 · 1,200 연습문항 · 문법 · 독해 · 검수 원문</p>
      </div>
      <div class="english-spotlight-actions">
        ${
          vocabStep
            ? `<a class="btn btn-light" href="#/quiz?plan=${encodeURIComponent(stepKey(todayPlan.date, vocabStep.id))}">${icon("book-open")} ${vocabStep.label}</a>`
            : `<a class="btn btn-light" href="#/quiz?mode=study&tags=${vocabDay.tag},영한&subject=영어&seminary=chongshin&count=20&auto=1">${icon("book-open")} 단어 ${vocabDay.label} 20</a>`
        }
        <a class="text-link text-link-light" href="#/admissions">입시·영어 가이드 ${icon("arrow-right")}</a>
      </div>
    </section>

    <div class="section-heading section-heading-home">
      <div><p class="eyebrow">바로 시작</p><h2>원하는 방식으로 공부하세요</h2></div>
      <a class="text-link" href="#/quiz">전체 학습 ${icon("chevron-right")}</a>
    </div>
    <section class="mode-grid home-modes">
      <a class="mode-card mode-study" href="#/notes">
        <span class="mode-icon">${icon("library-big")}</span><span class="mode-kicker">핵심 카드</span>
        <strong>성경 66권 핵심</strong>
        <span>1분 카드 · 짬짬이 읽기</span>
      </a>
      <a class="mode-card" href="#/review">
        <span class="mode-icon">${icon("brain-circuit")}</span><span class="mode-kicker">복습</span>
        <strong>짬짬이 복습 10장</strong>
        <span>구절 출처 · 셀프체크</span>
      </a>
      <a class="mode-card mode-study" href="#/quiz?mode=study&tags=필수&subject=성경&seminary=chongshin&count=15&auto=1">
        <span class="mode-icon">${icon("target")}</span><span class="mode-kicker">필수</span>
        <strong>필수 가중 15</strong>
        <span>총신 · 가중치 5</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=study&tags=2026문제은행&subject=성경&seminary=chongshin&count=20&auto=1">
        <span class="mode-icon">${icon("book-open")}</span><span class="mode-kicker">문제은행</span>
        <strong>2026 문제은행 20</strong>
        <span>총신 성경고사 · 구약·신약</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=flash&tags=암송,신약&subject=성경&seminary=chongshin&count=20&auto=1">
        <span class="mode-icon">${icon("bookmark")}</span><span class="mode-kicker">암송</span>
        <strong>신약 암송 20</strong>
        <span>총신 · 장절 보고 본문</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=exam&tags=원문기출&seminary=chongshin&count=25&auto=1">
        <span class="mode-icon">${icon("timer")}</span><span class="mode-kicker">실전</span>
        <strong>검수 원문 25</strong>
        <span>총신 · 2020–22 수록 자료</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=study&tags=동의어&subject=영어&seminary=chongshin&count=15&auto=1">
        <span class="mode-icon">${icon("languages")}</span><span class="mode-kicker">영어</span>
        <strong>동의어 드릴</strong>
        <span>총신 · 단어장 3회독</span>
      </a>
      <a class="mode-card" href="${wrong ? "#/wrong-note" : "#/quiz?mode=exam&tags=기출&subject=성경&seminary=chongshin&count=20&auto=1"}">
        <span class="mode-icon">${icon(wrong ? "notebook-pen" : "file-check-2")}</span><span class="mode-kicker">${wrong ? "오답" : "기출"}</span>
        <strong>${wrong ? `틀린 ${wrong}건` : "기출 시험 20"}</strong>
        <span>${wrong ? "다시 풀기" : "총신 통합"}</span>
      </a>
    </section>

    <section class="card-grid">
      ${Object.values(SEMINARIES)
        .filter((s) => s.id === "chongshin")
        .map((s) => {
          const subCounts = counts[s.id] || {};
          const semTotal = Object.values(subCounts).reduce((a, b) => a + b, 0);
          const lines = s.subjects
            .map((sub) => `${sub} ${subCounts[sub] || 0}문항`)
            .join(" · ");
          const note =
            s.id === "jangsin"
              ? `<p class="muted small">문제집 ${questions.filter((q) => q.source === "jangsin-ot-book").length} · 암송 ${questions.filter((q) => q.source === "jangsin-memory-2027").length}</p>`
              : `<p class="muted small">필수 ${must.toLocaleString("ko-KR")} · 가중치 학습</p>`;
          return `
          <article class="card seminary-card">
            <span class="seminary-icon">${icon(s.id === "chongshin" ? "graduation-cap" : "book-open")}</span>
            <h2>${s.name}</h2>
            <p class="card-meta">${lines || "아직 등록된 문제 없음"}</p>
            <p class="stat">총 <strong>${semTotal.toLocaleString("ko-KR")}</strong> / 전체 ${total.toLocaleString("ko-KR")}</p>
            ${note}
            <div class="card-actions">
              <a class="btn btn-primary" href="#/quiz?seminary=${s.id}&restart=1">${s.shortName} 학습</a>
              <a class="btn btn-secondary" href="#/browse?seminary=${s.id}">${s.shortName} 탐색</a>
            </div>
          </article>`;
        })
        .join("")}
    </section>

    <p class="muted small home-footnote">기출 ${grad.toLocaleString("ko-KR")} · 장신 ${jangsin} · 필수 ${must.toLocaleString("ko-KR")} · 단어장 ${vocab.toLocaleString("ko-KR")}.</p>
  `;

  root.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(a.getAttribute("href").slice(1));
    });
  });
}
