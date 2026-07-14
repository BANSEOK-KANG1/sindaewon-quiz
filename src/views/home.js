import { SEMINARIES, UI } from "../config.js";
import { loadQuestions, countBySeminaryAndSubject } from "../data/questions.js";
import { navigate } from "../router.js";
import { getTodayProgress, getWrongNotes, getStudyStats } from "../storage/progress.js";

export async function renderHome(root) {
  const questions = await loadQuestions();
  const counts = countBySeminaryAndSubject(questions);
  const total = questions.length;
  const grad = questions.filter((q) => q.tags?.includes("기출")).length;
  const memory = questions.filter((q) => q.tags?.includes("암송")).length;
  const today = getTodayProgress(20);
  const wrong = getWrongNotes().length;
  const stats = getStudyStats();

  root.innerHTML = `
    <header class="page-header home-hero">
      <p class="brand-mark">${UI.appTitle}</p>
      <h1>오늘도 한 세트</h1>
      <p class="muted">맞추고 → 해설 보고 → 연속 기록. 공부 리듬을 만드세요.</p>
    </header>

    <div class="daily-goal card home-goal">
      <div class="daily-goal-top">
        <span>오늘 ${today.answered}/${today.goal}</span>
        <span>🔥 ${today.streak}일</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${today.pct}%"></div></div>
      <p class="muted small">누적 ${stats.totalAnswered || 0}문항 · 정답 ${stats.totalCorrect || 0}</p>
    </div>

    <section class="mode-grid home-modes">
      <a class="mode-card mode-study" href="#/quiz?mode=study&tag=기출&count=10&auto=1">
        <span class="mode-kicker">바로 시작</span>
        <strong>기출 학습 10</strong>
        <span>해설 보면서 복습</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=flash&tag=암송&count=10&auto=1">
        <span class="mode-kicker">암송</span>
        <strong>플래시 ${memory}</strong>
        <span>탭해서 외우기</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=study&subject=영어&count=15&auto=1">
        <span class="mode-kicker">영어</span>
        <strong>어휘 15</strong>
        <span>TEPS형 복습</span>
      </a>
      <a class="mode-card" href="${wrong ? "#/wrong-note" : "#/quiz?mode=exam&tag=기출&count=20&auto=1"}">
        <span class="mode-kicker">${wrong ? "오답" : "도전"}</span>
        <strong>${wrong ? `틀린 ${wrong}건` : "시험 20"}</strong>
        <span>${wrong ? "다시 풀기" : "점수 도전"}</span>
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
          return `
          <article class="card seminary-card">
            <h2>${s.name}</h2>
            <p class="card-meta">${lines || "아직 등록된 문제 없음"}</p>
            <p class="stat">총 <strong>${semTotal}</strong> / 전체 ${total.toLocaleString("ko-KR")}</p>
            <div class="card-actions">
              <a class="btn btn-primary" href="#/quiz?seminary=${s.id}&restart=1">학습 시작</a>
              <a class="btn btn-secondary" href="#/browse?seminary=${s.id}">탐색</a>
            </div>
          </article>`;
        })
        .join("")}
    </section>

    <p class="muted small home-footnote">기출 ${grad.toLocaleString("ko-KR")} · 암송 ${memory}. 하단 <strong>학습</strong>에서 모드를 고를 수 있어요.</p>
  `;

  root.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(a.getAttribute("href").slice(1));
    });
  });
}
