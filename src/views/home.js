import { SEMINARIES, UI } from "../config.js";
import { loadQuestions, countBySeminaryAndSubject } from "../data/questions.js";
import { suggestVocabDay, suggestBibleFocus, currentPhase } from "../data/study-curriculum.js";
import { navigate } from "../router.js";
import { getTodayProgress, getWrongNotes, getStudyStats, getExposureCounts } from "../storage/progress.js";

export async function renderHome(root) {
  const questions = await loadQuestions();
  const counts = countBySeminaryAndSubject(questions);
  const total = questions.length;
  const grad = questions.filter((q) => q.tags?.includes("기출")).length;
  const bibleBank = questions.filter((q) => q.tags?.includes("문제은행")).length;
  const originalExam = questions.filter((q) => q.tags?.includes("원문기출")).length;
  const vocab = questions.filter((q) => q.tags?.includes("단어장300")).length;
  const memory = questions.filter((q) => q.tags?.includes("암송")).length;
  const today = getTodayProgress(30);
  const wrong = getWrongNotes().length;
  const stats = getStudyStats();
  const exposure = getExposureCounts();
  const vocabDay = suggestVocabDay(questions, exposure);
  const bibleFocus = suggestBibleFocus(questions, exposure);
  const phase = currentPhase(vocabDay);

  root.innerHTML = `
    <header class="page-header home-hero">
      <p class="brand-mark">${UI.appTitle}</p>
      <h1>오늘도 한 세트</h1>
      <p class="muted">${phase.label} · ${bibleFocus.label} + ${vocabDay.label}</p>
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
      <p class="mode-kicker">오늘 전략</p>
      <h2 class="strategy-title">${bibleFocus.label} 10 + ${vocabDay.label} 영단어</h2>
      <p class="muted small">${vocabDay.theme} (${vocabDay.range}) · ${phase.goal}</p>
      <div class="strategy-actions" style="margin-top:0.75rem">
        <a class="btn btn-primary" href="#/quiz?mode=study&tags=기출,${encodeURIComponent(bibleFocus.tag)}&subject=성경&count=10&auto=1">성경 10</a>
        <a class="btn btn-secondary" href="#/quiz?mode=study&tags=${vocabDay.tag},영한&subject=영어&count=20&auto=1">영→한 20</a>
        <a class="btn btn-ghost" href="#/quiz?mode=flash&tags=${vocabDay.tag},한영&subject=영어&count=20&auto=1">한→영</a>
      </div>
    </section>

    <section class="mode-grid home-modes">
      <a class="mode-card mode-study" href="#/quiz?mode=study&tag=기출&count=10&auto=1">
        <span class="mode-kicker">기출</span>
        <strong>기출 학습 10</strong>
        <span>해설 보면서 복습</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=exam&tags=원문기출&count=25&auto=1">
        <span class="mode-kicker">원문기출</span>
        <strong>20–22 기출 25</strong>
        <span>영어·성경 HWP</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=exam&tags=2026문제은행&subject=성경&count=30&auto=1">
        <span class="mode-kicker">문제은행</span>
        <strong>성경고사 30</strong>
        <span>2026 문제은행</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=study&tags=동의어&subject=영어&count=15&auto=1">
        <span class="mode-kicker">영어</span>
        <strong>동의어 드릴</strong>
        <span>단어장 3회독</span>
      </a>
      <a class="mode-card" href="#/quiz?mode=flash&tags=성경영어,암송&subject=영어&count=15&auto=1">
        <span class="mode-kicker">성경영어</span>
        <strong>구절 암송</strong>
        <span>ESV 회상</span>
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

    <p class="muted small home-footnote">기출 ${grad.toLocaleString("ko-KR")} · 원문기출 ${originalExam.toLocaleString("ko-KR")} · 문제은행 ${bibleBank.toLocaleString("ko-KR")} · 단어장 ${vocab.toLocaleString("ko-KR")} · 암송 ${memory}. 하단 <strong>학습</strong>에서 15일 영어 코스와 권별 전략을 고르세요.</p>
  `;

  root.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(a.getAttribute("href").slice(1));
    });
  });
}
