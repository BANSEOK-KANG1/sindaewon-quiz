import { SEMINARIES, UI } from "../config.js";
import {
  loadQuestions,
  filterQuestions,
  shuffle,
  getYears,
} from "../data/questions.js";
import { getQuery, navigate } from "../router.js";
import {
  addWrongNote,
  removeWrongNote,
  getQuizSession,
  saveQuizSession,
  clearQuizSession,
  getWrongNotes,
  getExposureCounts,
  recordExposures,
  recordStudySession,
  getTodayProgress,
  getStudyStats,
} from "../storage/progress.js";

const CIRCLE = ["①", "②", "③", "④"];
const WRONG_QUIZ_KEY = "wrong-note-quiz-ids";
const DAILY_GOAL = 20;

function pickQuizPool(filtered, count) {
  const wrongIds = new Set(getWrongNotes().map((n) => n.questionId));
  const exposure = getExposureCounts();
  const sorted = [...filtered].sort((a, b) => {
    const aw = wrongIds.has(a.id) ? 0 : 1;
    const bw = wrongIds.has(b.id) ? 0 : 1;
    if (aw !== bw) return aw - bw;
    return (exposure[a.id] || 0) - (exposure[b.id] || 0);
  });

  const preferWrong = Math.min(Math.ceil(count * 0.5), count);
  const wrongPool = shuffle(sorted.filter((q) => wrongIds.has(q.id)));
  const restPool = shuffle(sorted.filter((q) => !wrongIds.has(q.id)));
  const picked = [];
  const used = new Set();

  for (const q of wrongPool) {
    if (picked.length >= preferWrong) break;
    picked.push(q);
    used.add(q.id);
  }
  for (const q of [...restPool, ...wrongPool]) {
    if (picked.length >= count) break;
    if (used.has(q.id)) continue;
    picked.push(q);
    used.add(q.id);
  }
  return shuffle(picked).slice(0, count);
}

function formatAnswer(q) {
  if (q.type === "multiple" && Array.isArray(q.choices)) {
    const i = q.answer;
    return `${CIRCLE[i] || ""} ${q.choices[i] ?? q.answer}`.trim();
  }
  return String(q.answer ?? "");
}

function gradeMessage(pct) {
  if (pct >= 90) return { title: "탁월해요!", sub: "이 페이스면 붙습니다." };
  if (pct >= 70) return { title: "잘하고 있어요", sub: "오답만 한 번 더 훑으면 좋아요." };
  if (pct >= 50) return { title: "점점 늘어요", sub: "학습 모드로 해설을 보며 복습해 보세요." };
  return { title: "괜찮아요, 시작이에요", sub: "오답노트부터 천천히 가면 됩니다." };
}

export async function renderQuiz(root) {
  const questions = await loadQuestions();
  const q = getQuery();
  let session = getQuizSession();

  if (q.get("restart")) {
    clearQuizSession();
    session = null;
  }

  function startSession(pool, mode = "study") {
    session = {
      mode,
      seminary: pool[0]?.seminary || "",
      subject: pool[0]?.subject || "",
      ids: pool.map((x) => x.id),
      index: 0,
      score: 0,
      answers: [],
      finished: false,
      total: pool.length,
      combo: 0,
      bestCombo: 0,
      phase: "answer", // answer | feedback
      lastResult: null,
    };
    saveQuizSession(session);
    renderActive(root, session, questions, showResult);
  }

  function showResult(s) {
    recordExposures(s.ids || []);
    const correct = s.answers.filter((a) => a.correct).length;
    recordStudySession({
      answered: s.answers.length,
      correct,
      bestCombo: s.bestCombo || 0,
    });
    root.innerHTML = renderResult(s);
    root.querySelector("#retry-wrong")?.addEventListener("click", () => {
      const wrongIds = s.answers.filter((a) => !a.correct).map((a) => a.questionId);
      if (!wrongIds.length) return;
      const pool = questions.filter((x) => wrongIds.includes(x.id));
      startSession(pool, "study");
    });
    root.querySelector("#new-quiz")?.addEventListener("click", () => {
      clearQuizSession();
      navigate("/quiz?restart=1");
    });
    root.querySelector("#keep-study")?.addEventListener("click", () => {
      clearQuizSession();
      navigate("/quiz?mode=study&tag=기출&count=10&auto=1");
    });
    root.querySelector("a[href='#/wrong-note']")?.addEventListener("click", (e) => {
      e.preventDefault();
      navigate("/wrong-note");
    });
  }

  function bindSetup(rootEl, all) {
    rootEl.querySelectorAll("[data-quick]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode || "study";
        const tag = btn.dataset.tag || "";
        const count = parseInt(btn.dataset.count || "10", 10);
        const fromWrong = btn.dataset.fromWrong === "1";

        if (fromWrong) {
          const ids = getWrongNotes().map((n) => n.questionId);
          const pool = shuffle(all.filter((x) => ids.includes(x.id))).slice(0, count);
          if (!pool.length) {
            alert("오답이 없습니다.");
            return;
          }
          startSession(pool, mode);
          return;
        }

        let pool;
        if (tag === "영어") {
          pool = filterQuestions(all, { seminary: "chongshin", subject: "영어" });
        } else {
          pool = filterQuestions(all, {
            seminary: "chongshin",
            subject: "성경",
            tag: tag || undefined,
          });
        }
        if (!pool.length) {
          pool = filterQuestions(all, { seminary: "chongshin" });
        }
        if (!pool.length) {
          alert("문제가 없습니다.");
          return;
        }
        startSession(pickQuizPool(pool, Math.min(count, pool.length)), mode);
      });
    });

    rootEl.querySelector("#quiz-setup")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const seminary = fd.get("seminary");
      const subject = fd.get("subject");
      const year = fd.get("year") || "";
      const tag = fd.get("tag") || "";
      const mode = fd.get("mode") || "study";
      const count = parseInt(fd.get("count"), 10);
      let pool = filterQuestions(all, { seminary, subject, year, tag });
      if (!pool.length) {
        alert("선택한 조건에 맞는 문제가 없습니다.");
        return;
      }
      pool = pickQuizPool(pool, Math.min(count, pool.length));
      startSession(pool, mode);
    });

    const semSelect = rootEl.querySelector('select[name="seminary"]');
    const subSelect = rootEl.querySelector("#quiz-subject");
    semSelect?.addEventListener("change", () => {
      const sem = SEMINARIES[semSelect.value];
      if (sem && subSelect) {
        subSelect.innerHTML = sem.subjects.map((sub) => `<option value="${sub}">${sub}</option>`).join("");
      }
    });
  }

  // 오답노트 → 학습
  if (q.get("mode") === "wrong") {
    clearQuizSession();
    let ids = [];
    try {
      ids = JSON.parse(sessionStorage.getItem(WRONG_QUIZ_KEY) || "[]");
    } catch {
      ids = [];
    }
    sessionStorage.removeItem(WRONG_QUIZ_KEY);
    const pool = questions.filter((x) => ids.includes(x.id));
    if (!pool.length) {
      root.innerHTML = `<p class="empty">오답 퀴즈를 시작할 문제가 없습니다.</p>
        <a class="btn btn-primary" href="#/wrong-note">오답노트로</a>`;
      root.querySelector("a")?.addEventListener("click", (e) => {
        e.preventDefault();
        navigate("/wrong-note");
      });
      return;
    }
    startSession(shuffle(pool), "study");
    return;
  }

  // 원탭 자동 시작
  if (q.get("auto") === "1") {
    clearQuizSession();
    const mode = q.get("mode") || "study";
    const tag = q.get("tag") || "";
    const subject = q.get("subject") || (tag === "영어" ? "영어" : "성경");
    const count = parseInt(q.get("count") || "10", 10);
    let pool = filterQuestions(questions, {
      seminary: q.get("seminary") || "chongshin",
      subject,
      tag: tag && tag !== "영어" ? tag : undefined,
      year: q.get("year") || "",
    });
    if (!pool.length) pool = filterQuestions(questions, { seminary: "chongshin" });
    startSession(pickQuizPool(pool, Math.min(count, pool.length)), mode);
    return;
  }

  if (session?.finished) {
    showResult(session);
    return;
  }

  if (session?.ids?.length) {
    renderActive(root, session, questions, showResult);
    return;
  }

  root.innerHTML = renderSetup(questions, q);
  bindSetup(root, questions);
}

function renderSetup(questions, q) {
  const seminary = q.get("seminary") || "chongshin";
  const sem = SEMINARIES[seminary] || SEMINARIES.chongshin;
  const years = getYears(questions);
  const today = getTodayProgress(DAILY_GOAL);
  const stats = getStudyStats();
  const wrongCount = getWrongNotes().length;

  return `
    <header class="page-header">
      <h1>학습</h1>
      <p class="muted">오늘은 ${today.answered}/${today.goal}문제 · 연속 ${today.streak}일</p>
    </header>

    <div class="daily-goal card">
      <div class="daily-goal-top">
        <span>오늘의 목표</span>
        <strong>${today.answered} / ${today.goal}</strong>
      </div>
      <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${today.pct}%"></div></div>
      <p class="muted small">누적 정답 ${stats.totalCorrect || 0} · 최고 연속 ${stats.bestCombo || 0}</p>
    </div>

    <section class="mode-grid">
      <button type="button" class="mode-card mode-study" data-quick data-mode="study" data-tag="기출" data-count="10">
        <span class="mode-kicker">추천</span>
        <strong>기출 학습</strong>
        <span>10문항 · 해설 보면서</span>
      </button>
      <button type="button" class="mode-card" data-quick data-mode="flash" data-tag="암송" data-count="10">
        <span class="mode-kicker">암송</span>
        <strong>플래시카드</strong>
        <span>장절 보고 맞히기</span>
      </button>
      <button type="button" class="mode-card" data-quick data-mode="study" data-tag="영어" data-count="15">
        <span class="mode-kicker">영어</span>
        <strong>어휘·문법</strong>
        <span>15문항 복습</span>
      </button>
      <button type="button" class="mode-card" data-quick data-mode="exam" data-tag="기출" data-count="20">
        <span class="mode-kicker">도전</span>
        <strong>시험 모드</strong>
        <span>20문항 · 점수 집중</span>
      </button>
    </section>

    ${
      wrongCount
        ? `<button type="button" class="btn btn-secondary btn-block" data-quick data-mode="study" data-from-wrong="1" data-count="${Math.min(
            wrongCount,
            15
          )}">오답 ${wrongCount}건 우선 복습</button>`
        : ""
    }

    <details class="advanced-setup">
      <summary>직접 설정하고 시작</summary>
      <form class="card quiz-setup" id="quiz-setup">
        <fieldset>
          <legend>모드</legend>
          <label class="chip"><input type="radio" name="mode" value="study" checked /> 학습 (해설)</label>
          <label class="chip"><input type="radio" name="mode" value="flash" /> 플래시</label>
          <label class="chip"><input type="radio" name="mode" value="exam" /> 시험</label>
        </fieldset>
        <label>신학대
          <select name="seminary">
            ${Object.values(SEMINARIES)
              .map(
                (s) =>
                  `<option value="${s.id}" ${s.id === seminary ? "selected" : ""}>${s.name}</option>`
              )
              .join("")}
          </select>
        </label>
        <label>과목
          <select name="subject" id="quiz-subject">
            ${sem.subjects.map((sub) => `<option value="${sub}">${sub}</option>`).join("")}
          </select>
        </label>
        <label>연도
          <select name="year">
            <option value="">전체</option>
            ${years.map((y) => `<option value="${y}">${y}</option>`).join("")}
          </select>
        </label>
        <label>태그
          <select name="tag">
            <option value="">전체</option>
            <option value="기출">기출</option>
            <option value="암송">암송</option>
            <option value="창세기">창세기</option>
          </select>
        </label>
        <fieldset>
          <legend>문항 수</legend>
          ${UI.quizCounts
            .map(
              (n, i) =>
                `<label class="chip"><input type="radio" name="count" value="${n}" ${i === 0 ? "checked" : ""} /> ${n}문항</label>`
            )
            .join("")}
        </fieldset>
        <button type="submit" class="btn btn-primary btn-block">시작</button>
        <p class="muted small">전체 ${questions.length.toLocaleString("ko-KR")}문항 · 오답·미출제 우선</p>
      </form>
    </details>
  `;
}

function renderActive(root, session, allQuestions, onFinish) {
  const q = allQuestions.find((x) => x.id === session.ids[session.index]);
  if (!q) {
    clearQuizSession();
    navigate("/quiz?restart=1");
    return;
  }

  const mode = session.mode || "study";
  const pct = Math.round((session.index / session.total) * 100);
  const modeLabel = mode === "exam" ? "시험" : mode === "flash" ? "플래시" : "학습";

  if (session.phase === "feedback" && session.lastResult) {
    root.innerHTML = renderFeedback(session, q, modeLabel, pct);
    root.querySelector("#next-q")?.addEventListener("click", () => {
      session.phase = "answer";
      session.lastResult = null;
      session.index += 1;
      if (session.index >= session.total) session.finished = true;
      saveQuizSession(session);
      if (session.finished) onFinish(session);
      else renderActive(root, session, allQuestions, onFinish);
    });
    return;
  }

  if (mode === "flash") {
    root.innerHTML = renderFlashFront(session, q, modeLabel, pct);
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      root.querySelector(".flash-back")?.classList.remove("hidden");
      root.querySelector(".flash-reveal-hint")?.classList.add("hidden");
      root.querySelector(".flash-actions")?.classList.remove("hidden");
    };
    root.querySelector("#flash-card")?.addEventListener("click", reveal);
    root.querySelector("#flash-know")?.addEventListener("click", () => {
      commitAnswer(session, q, "know", true, root, allQuestions, onFinish);
    });
    root.querySelector("#flash-miss")?.addEventListener("click", () => {
      commitAnswer(session, q, "miss", false, root, allQuestions, onFinish);
    });
    return;
  }

  const choices =
    q.type === "multiple" && q.choices
      ? q.choices
          .map(
            (c, i) =>
              `<button type="button" class="choice-btn" data-index="${i}"><span class="choice-mark">${CIRCLE[i]}</span> ${escapeHtml(c)}</button>`
          )
          .join("")
      : q.type === "ox"
        ? `<button type="button" class="choice-btn ox-btn" data-ox="O">O · 맞다</button>
           <button type="button" class="choice-btn ox-btn" data-ox="X">X · 틀리다</button>`
        : `<div class="short-study">
            <button type="button" class="btn btn-secondary btn-block" id="reveal-short">정답 먼저 보기</button>
            <input type="text" class="text-answer hidden" id="text-answer" placeholder="${q.tags?.includes("암송") ? "본문 입력 (선택)" : "정답 입력 (선택)"}" />
            <div class="btn-row hidden" id="short-actions">
              <button type="button" class="btn btn-primary" data-self="1">맞혔어요</button>
              <button type="button" class="btn btn-ghost" data-self="0">틀렸어요</button>
            </div>
          </div>`;

  root.innerHTML = `
    <div class="quiz-hud">
      <div class="quiz-hud-row">
        <span class="badge">${modeLabel}</span>
        <span class="combo ${session.combo >= 3 ? "combo-hot" : ""}">${session.combo > 0 ? `${session.combo}연속` : "시작"}</span>
        <span class="muted small">${session.index + 1}/${session.total}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
    <article class="card quiz-card quiz-card-live">
      <p class="question-title">${escapeHtml(q.question)}</p>
      <div class="choices-stack">${choices}</div>
    </article>
  `;

  const lock = () => {
    root.querySelectorAll(".choice-btn").forEach((b) => {
      b.disabled = true;
    });
  };

  root.querySelectorAll(".choice-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      lock();
      if (btn.dataset.ox) {
        const ok = btn.dataset.ox === String(q.answer).toUpperCase();
        commitAnswer(session, q, btn.dataset.ox, ok, root, allQuestions, onFinish);
        return;
      }
      const idx = parseInt(btn.dataset.index, 10);
      commitAnswer(session, q, idx, idx === q.answer, root, allQuestions, onFinish);
    });
  });

  root.querySelector("#reveal-short")?.addEventListener("click", () => {
    root.querySelector("#reveal-short")?.classList.add("hidden");
    root.querySelector("#text-answer")?.classList.remove("hidden");
    root.querySelector("#short-actions")?.classList.remove("hidden");
    const box = document.createElement("div");
    box.className = "answer-reveal";
    box.innerHTML = `<p class="muted small">정답</p><p>${escapeHtml(formatAnswer(q))}</p>`;
    root.querySelector(".short-study")?.prepend(box);
  });

  root.querySelectorAll("[data-self]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ok = btn.dataset.self === "1";
      const typed = root.querySelector("#text-answer")?.value?.trim() || (ok ? "self-ok" : "self-miss");
      commitAnswer(session, q, typed, ok, root, allQuestions, onFinish);
    });
  });
}

function commitAnswer(session, q, selected, correct, root, allQuestions, onFinish) {
  session.answers.push({ questionId: q.id, selected, correct });
  if (correct) {
    session.score += 1;
    session.combo = (session.combo || 0) + 1;
    session.bestCombo = Math.max(session.bestCombo || 0, session.combo);
    removeWrongNote(q.id);
  } else {
    session.combo = 0;
    addWrongNote({
      questionId: q.id,
      question: q.question,
      selected,
      correctAnswer: q.answer,
      seminary: q.seminary,
      subject: q.subject,
    });
  }

  const mode = session.mode || "study";
  // 시험 모드도 짧게 피드백 (학습보단 짧게 보이지만 동일 플로우)
  session.phase = "feedback";
  session.lastResult = { correct, selected };
  saveQuizSession(session);
  renderActive(root, session, allQuestions, onFinish);
}

function renderFlashFront(session, q, modeLabel, pct) {
  return `
    <div class="quiz-hud">
      <div class="quiz-hud-row">
        <span class="badge">${modeLabel}</span>
        <span class="combo ${session.combo >= 3 ? "combo-hot" : ""}">${session.combo > 0 ? `${session.combo}연속` : "시작"}</span>
        <span class="muted small">${session.index + 1}/${session.total}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
    <button type="button" class="flash-card" id="flash-card">
      <p class="flash-front">${escapeHtml(q.question)}</p>
      <p class="flash-reveal-hint muted">탭해서 정답 보기</p>
      <div class="flash-back hidden">
        <p>${escapeHtml(formatAnswer(q))}</p>
        ${q.explanation ? `<p class="muted small">${escapeHtml(q.explanation)}</p>` : ""}
      </div>
    </button>
    <div class="flash-actions btn-row hidden">
      <button type="button" class="btn btn-ghost" id="flash-miss">모름</button>
      <button type="button" class="btn btn-primary" id="flash-know">외웠음</button>
    </div>
  `;
}

function renderFeedback(session, q, modeLabel, pctDone) {
  const { correct, selected } = session.lastResult;
  const showExplain = (session.mode || "study") !== "exam" || !correct;
  const combo = session.combo || 0;
  return `
    <div class="quiz-hud">
      <div class="quiz-hud-row">
        <span class="badge">${modeLabel}</span>
        <span class="combo ${combo >= 3 ? "combo-hot" : ""}">${combo > 0 ? `${combo}연속!` : "이어서"}</span>
        <span class="muted small">${session.index + 1}/${session.total}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.round(((session.index + 1) / session.total) * 100)}%"></div></div>
    </div>
    <article class="card feedback-card ${correct ? "is-correct" : "is-wrong"} feedback-pop">
      <p class="feedback-emoji">${correct ? "맞아요" : "아쉬워요"}</p>
      <p class="question-title small-q">${escapeHtml(q.question)}</p>
      <p><span class="muted">정답</span> · <strong>${escapeHtml(formatAnswer(q))}</strong></p>
      ${
        !correct && selected != null && selected !== "miss" && selected !== "self-miss"
          ? `<p class="muted small">내 답: ${escapeHtml(String(selected))}</p>`
          : ""
      }
      ${
        showExplain && q.explanation
          ? `<div class="feedback-expl"><p class="muted small">해설</p><p>${escapeHtml(q.explanation).replace(/\n/g, "<br>")}</p></div>`
          : ""
      }
      <button type="button" class="btn btn-primary btn-block" id="next-q">${
        session.index + 1 >= session.total ? "결과 보기" : "다음 문제"
      }</button>
    </article>
  `;
}

function renderResult(session) {
  const pct = Math.round((session.score / session.total) * 100) || 0;
  const wrong = session.answers.filter((a) => !a.correct).length;
  const msg = gradeMessage(pct);
  const today = getTodayProgress(DAILY_GOAL);
  return `
    <header class="page-header"><h1>오늘의 결과</h1></header>
    <article class="card result-card result-pop">
      <p class="result-title">${msg.title}</p>
      <p class="result-score">${session.score} / ${session.total}</p>
      <p class="muted">${msg.sub}</p>
      <p class="muted small">정답률 ${pct}% · 오답 ${wrong} · 최고연속 ${session.bestCombo || 0}</p>
      <div class="daily-goal inline">
        <div class="daily-goal-top"><span>오늘</span><strong>${today.answered}/${today.goal}</strong></div>
        <div class="progress-track"><div class="progress-fill" style="width:${today.pct}%"></div></div>
        <p class="muted small">연속 학습 ${today.streak}일</p>
      </div>
      <button type="button" class="btn btn-primary btn-block" id="keep-study">이어서 10문항 더</button>
      <button type="button" class="btn btn-secondary btn-block" id="retry-wrong" ${wrong ? "" : "disabled"}>오답만 다시</button>
      <button type="button" class="btn btn-ghost btn-block" id="new-quiz">모드 선택으로</button>
      <a class="btn btn-ghost btn-block" href="#/wrong-note">오답노트</a>
    </article>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
