import { SEMINARIES, UI } from "../config.js";
import { loadQuestions, countBySeminaryAndSubject } from "../data/questions.js";
import {
  suggestVocabDay,
  suggestBibleFocus,
  suggestExamTypeFocus,
  currentPhase,
} from "../data/study-curriculum.js";
import { navigate } from "../router.js";
import { getTodayProgress, getWrongNotes, getStudyStats, getExposureCounts } from "../storage/progress.js";

export async function renderHome(root) {
  const questions = await loadQuestions();
  const counts = countBySeminaryAndSubject(questions);
  const total = questions.length;
  const must = questions.filter((q) => q.tags?.includes("필수") && q.seminary === "chongshin").length;
  const grad = questions.filter((q) => q.tags?.includes("기출")).length;
  const jangsin = questions.filter((q) => q.seminary === "jangsin").length;
  const vocab = questions.filter((q) => q.tags?.includes("단어장300")).length;
  const today = getTodayProgress(30);
  const wrong = getWrongNotes().length;
  const stats = getStudyStats();
  const exposure = getExposureCounts();
  const vocabDay = suggestVocabDay(questions, exposure);
  const bibleFocus = suggestBibleFocus(questions, exposure);
  const typeFocus = suggestExamTypeFocus(questions, exposure);
  const phase = currentPhase(vocabDay);

  root.innerHTML = `
    <header class="page-header home-hero">
      <p class="brand-mark">${UI.appTitle}</p>
      <h1>오늘도 한 세트</h1>
      <p class="muted">${phase.label} · ${typeFocus.label} · ${bibleFocus.label}</p>
    </header>

    <div class="daily-goal card home-goal">
      <div class="daily-goal-top">
        <span>오늘 ${today.answered}/${today.goal}</span>
        <span>🔥 ${today.streak}일</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${today.pct}%"></div></div>
      <p class="muted small">누적 ${stats.totalAnswered || 0}문항 · 정답 ${stats.totalCorrect || 0}</p>
    </div>

    <section class="strategy-card card">
      <p class="mode-kicker">오늘 전략 (총신 가중치)</p>
      <h2 class="strategy-title">${typeFocus.label} + ${bibleFocus.label} + ${vocabDay.label}</h2>
      <p class="muted small">${typeFocus.hint || ""} · ${vocabDay.theme} · ${phase.goal}</p>
      <div class="strategy-actions" style="margin-top:0.75rem">
        <a class="btn btn-primary" href="#/quiz?mode=study&tags=${encodeURIComponent(typeFocus.tag)}&subject=성경&seminary=chongshin&count=15&auto=1">유형 15</a>
        <a class="btn btn-secondary" href="#/quiz?mode=study&tags=기출,${encodeURIComponent(bibleFocus.tag)}&subject=성경&seminary=chongshin&count=10&auto=1">권별 10</a>
        <a class="btn btn-ghost" href="#/quiz?mode=study&tags=${vocabDay.tag},영한&subject=영어&count=20&auto=1">영→한 20</a>
      </div>
    </section>

    <section class="mode-grid home-modes">
      <a class="mode-card mode-study" href="#/quiz?mode=study&tags=필수&subject=성경&seminary=chongshin&count=15&auto=1">
        <span class="mode-kicker">필수</span>
        <strong>필수 가중 15</strong>
        <span>총신 · 가중치 5</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=study&tags=장신&subject=성경&seminary=jangsin&count=15&auto=1">
        <span class="mode-kicker">장신</span>
        <strong>구약 문제집 15</strong>
        <span>정답 미수록 · 열람</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=flash&tags=구약암송,한암송&subject=성경&seminary=jangsin&count=25&auto=1">
        <span class="mode-kicker">암송</span>
        <strong>장신 구약 암송</strong>
        <span>2027 입시 25구절</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=exam&tags=원문기출&count=25&auto=1">
        <span class="mode-kicker">실전</span>
        <strong>20–22 원문 25</strong>
        <span>최근 학년도</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=study&tags=동의어&subject=영어&count=15&auto=1">
        <span class="mode-kicker">영어</span>
        <strong>동의어 드릴</strong>
        <span>단어장 3회독</span>
      </a>
      <a class="mode-card" href="${wrong ? "#/wrong-note" : "#/quiz?mode=exam&tags=기출&subject=성경&seminary=chongshin&count=20&auto=1"}">
        <span class="mode-kicker">${wrong ? "오답" : "기출"}</span>
        <strong>${wrong ? `틀린 ${wrong}건` : "기출 시험 20"}</strong>
        <span>${wrong ? "다시 풀기" : "총신 통합"}</span>
      </a>
    </section>

    <section class="card-grid">
      ${Object.values(SEMINARIES)
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
            <h2>${s.name}</h2>
            <p class="card-meta">${lines || "아직 등록된 문제 없음"}</p>
            <p class="stat">총 <strong>${semTotal.toLocaleString("ko-KR")}</strong> / 전체 ${total.toLocaleString("ko-KR")}</p>
            ${note}
            <div class="card-actions">
              <a class="btn btn-primary" href="#/quiz?seminary=${s.id}&restart=1">학습 시작</a>
              <a class="btn btn-secondary" href="#/browse?seminary=${s.id}">탐색</a>
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
