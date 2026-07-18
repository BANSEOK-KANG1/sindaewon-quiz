import { SEMINARIES, UI } from "../config.js";
import {
  loadQuestions,
  filterQuestions,
  shuffle,
  getYears,
  getTopicStats,
} from "../data/questions.js";
import {
  BIBLE_BOOK_TRACKS,
  PRACTICE_TRACKS,
  JANGSIN_TRACKS,
  JANGSIN_MEMORY_TRACKS,
  IMPORTANCE_TRACKS,
  EXAM_TYPE_TRACKS,
  VOCAB_DAY_TRACKS,
  ENGLISH_DRILL_TRACKS,
  BIBLE_ENGLISH_TRACKS,
  BIBLE_ENGLISH_THEMES,
  GRAMMAR_TRACKS,
  HOT_KEYWORDS,
  TIER_LABELS,
  recommendCount,
  suggestVocabDay,
  suggestBibleFocus,
  suggestExamTypeFocus,
  currentPhase,
} from "../data/study-curriculum.js";
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
const DAILY_GOAL = 30;

function isObjective(q) {
  return q.type === "multiple" || q.type === "ox";
}

function hasAnswer(q) {
  if (q.answer == null || q.answer === "") return false;
  if (Array.isArray(q.answer) && !q.answer.length) return false;
  return true;
}

function pickQuizPool(filtered, count, { mode = "study" } = {}) {
  // 플래시(암송)만 주관식 허용, 학습·시험은 객관식 위주
  // 장신 등 정답 미수록 문항은 학습 모드에서만 허용(열람·자기점검)
  let pool = filtered;
  if (mode === "exam") {
    pool = filtered.filter((q) => isObjective(q) && hasAnswer(q));
  } else if (mode !== "flash") {
    const objective = filtered.filter((q) => isObjective(q) && (hasAnswer(q) || (q.tags || []).includes("정답미수록")));
    if (objective.length >= Math.min(count, 4)) pool = objective;
    else if (objective.length) pool = objective;
    else pool = filtered.filter((q) => hasAnswer(q) || (q.tags || []).includes("정답미수록"));
  }

  const wrongIds = new Set(getWrongNotes().map((n) => n.questionId));
  const exposure = getExposureCounts();

  // 매번 다르게: 중요도(weight) + 오답·미출제 가중
  const scored = pool.map((q) => {
    let key = Math.random();
    const w = typeof q.weight === "number" ? q.weight : (q.tags || []).includes("필수") ? 5 : (q.tags || []).includes("중요") ? 3 : 1;
    key += w * 0.12;
    if (wrongIds.has(q.id)) key += 0.4;
    if (!exposure[q.id]) key += 0.2;
    return { q, key };
  });
  scored.sort((a, b) => b.key - a.key);
  const picked = scored.slice(0, count).map((s) => s.q);
  // 출제 순서도 매번 랜덤
  return shuffle(picked);
}

/** 세션 내에서 보기 순서를 섞어 매번 다른 배치로 보여준다 (정답 인덱스 재매핑) */
function displayQuestion(session, q) {
  if (q.type !== "multiple" || !Array.isArray(q.choices)) return q;
  session.choiceOrders = session.choiceOrders || {};
  let order = session.choiceOrders[q.id];
  if (!order || order.length !== q.choices.length) {
    order = shuffle(q.choices.map((_, i) => i));
    session.choiceOrders[q.id] = order;
    saveQuizSession(session);
  }
  const remap = (ans) =>
    Array.isArray(ans) ? ans.map((i) => order.indexOf(i)).filter((i) => i >= 0) : order.indexOf(ans);
  return {
    ...q,
    choices: order.map((i) => q.choices[i]),
    answer: remap(q.answer),
  };
}

function isChoiceCorrect(answer, idx) {
  return Array.isArray(answer) ? answer.includes(idx) : idx === answer;
}

function formatAnswer(q) {
  if (q.type === "multiple" && Array.isArray(q.choices)) {
    const idxs = Array.isArray(q.answer) ? q.answer : [q.answer];
    return idxs
      .map((i) => `${CIRCLE[i] || ""} ${q.choices[i] ?? ""}`.trim())
      .filter(Boolean)
      .join(" / ");
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

        const tagsRaw = btn.dataset.tags || btn.dataset.tag || "";
        const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
        const tagsMode = btn.dataset.tagsMode || "all";
        const subject = btn.hasAttribute("data-subject")
          ? btn.dataset.subject
          : tags.includes("영어")
            ? "영어"
            : tags.length
              ? "성경"
              : "";

        let pool = filterQuestions(all, {
          seminary: btn.dataset.seminary || (tags.includes("장신") ? "jangsin" : "chongshin"),
          subject: subject || undefined,
          tags: tags.length ? tags : undefined,
          tagsMode,
        });
        if (!pool.length) {
          alert("선택한 학교·조건에 맞는 문제가 없습니다.");
          return;
        }
        const n = Math.min(count, pool.length);
        startSession(pickQuizPool(pool, n, { mode }), mode);
      });
    });

    rootEl.querySelectorAll("#goto-jangsin-study").forEach((btn) => {
      btn.addEventListener("click", () => {
        clearQuizSession();
        navigate("/quiz?seminary=jangsin&restart=1");
      });
    });
    rootEl.querySelectorAll("#goto-chongshin-study, #goto-chongshin-study-2").forEach((btn) => {
      btn.addEventListener("click", () => {
        clearQuizSession();
        navigate("/quiz?seminary=chongshin&restart=1");
      });
    });

    rootEl.querySelectorAll("[data-browse]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const params = new URLSearchParams();
        params.set("seminary", btn.dataset.seminary || "chongshin");
        if (btn.dataset.subject) params.set("subject", btn.dataset.subject);
        if (btn.dataset.tag) params.set("tag", btn.dataset.tag);
        if (btn.dataset.search) params.set("q", btn.dataset.search);
        navigate(`/browse?${params.toString()}`);
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
      pool = pickQuizPool(pool, Math.min(count, pool.length), { mode });
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
    const tagsRaw = q.get("tags") || q.get("tag") || "";
    const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const subject = q.get("subject") || (tags.includes("영어") ? "영어" : tags.length ? "성경" : "");
    const count = parseInt(q.get("count") || "10", 10);
    let pool = filterQuestions(questions, {
      seminary: q.get("seminary") || "chongshin",
      subject: subject || undefined,
      tags: tags.length ? tags : undefined,
      tagsMode: q.get("tagsMode") || "all",
      year: q.get("year") || "",
    });
    if (!pool.length) {
      alert("선택한 조건에 맞는 문제가 없습니다.");
      return;
    }
    startSession(pickQuizPool(pool, Math.min(count, pool.length), { mode }), mode);
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
  const wrongIds = new Set(getWrongNotes().map((n) => n.questionId));
  const exposure = getExposureCounts();
  const statCtx = { exposure, wrongIds };

  const gichulTotal = filterQuestions(questions, { seminary: "chongshin", tags: ["기출"] }).length;
  const vocabDay = suggestVocabDay(questions, exposure);
  const bibleFocus = suggestBibleFocus(questions, exposure, "chongshin");
  const typeFocus = suggestExamTypeFocus(questions, exposure, "chongshin");
  const phase = currentPhase(vocabDay);
  const mustTotal = filterQuestions(questions, { seminary: "chongshin", tags: ["필수"] }).length;
  const jangsinBook = filterQuestions(questions, { seminary: "jangsin", tags: ["장신기출"] }).length;
  const jangsinMem = filterQuestions(questions, { seminary: "jangsin", tags: ["구약암송"] }).length;

  function renderTopicRow(track, index, opts = {}) {
    const tags = opts.tags || (track.tag ? ["기출", track.tag] : [track.tag]);
    const subject = "subject" in opts ? opts.subject : track.subject || "성경";
    const mode = opts.mode || track.mode || "study";
    const rowSem = opts.seminary || track.seminary || "chongshin";
    const ts = getTopicStats(
      questions,
      { seminary: rowSem, subject, tags, tagsMode: "all" },
      statCtx
    );
    if (!ts.total) return "";
    const count = opts.count || recommendCount(ts.total, track.recommend || 15);
    const tier = track.tier
      ? `<span class="topic-tier tier-${track.tier.toLowerCase()}">${TIER_LABELS[track.tier] || track.tier}</span>`
      : track.weight
        ? `<span class="topic-tier tier-${track.weight >= 5 ? "s" : track.weight >= 3 ? "a" : "b"}">W${track.weight}</span>`
        : track.focus
          ? `<span class="topic-tier tier-a">${track.focus}</span>`
          : "";
    const wrongBadge = ts.wrong ? `<span class="topic-wrong">${ts.wrong}오답</span>` : "";
    const hint = opts.hint || track.hint || track.theme || "";
    const countHint = track.count ? ` · 빈도 ${track.count}` : "";
    return `
      <button type="button" class="topic-row" data-quick
        data-mode="${mode}"
        data-tags="${tags.join(",")}"
        data-subject="${subject}"
        data-seminary="${rowSem}"
        data-count="${count}">
        ${index != null ? `<span class="topic-rank">${index}</span>` : ""}
        <div class="topic-info">
          <strong>${track.label}${track.theme ? ` · ${track.theme}` : ""}</strong>
          <span class="muted small">${hint}${track.range ? ` · ${track.range}` : ""}${countHint}</span>
          <span class="topic-meta">${ts.total}문항 · ${ts.pct}% 학습${wrongBadge ? ` · ${wrongBadge}` : ""}</span>
        </div>
        ${tier}
        <span class="topic-go">▶</span>
      </button>`;
  }

  const topBooks = BIBLE_BOOK_TRACKS.slice(0, 10);
  const moreBooks = BIBLE_BOOK_TRACKS.slice(10);
  const vocabEarly = VOCAB_DAY_TRACKS.slice(0, 9);
  const vocabLate = VOCAB_DAY_TRACKS.slice(9);

  const schoolSwitch = `
    <div class="keyword-chips" style="margin:0.5rem 0 1rem">
      <button type="button" class="chip-btn ${seminary === "chongshin" ? "active" : ""}" id="goto-chongshin-study">총신 학습</button>
      <button type="button" class="chip-btn ${seminary === "jangsin" ? "active" : ""}" id="goto-jangsin-study">장신 학습</button>
    </div>`;

  // 장신 전용 학습 화면 — 총신 성경 트랙과 분리
  if (seminary === "jangsin") {
    return `
    <header class="page-header">
      <h1>장신 학습</h1>
      <p class="muted">장로회신학대 · 문제집 ${jangsinBook} · 암송 ${jangsinMem} · 총신 자료와 분리</p>
    </header>
    ${schoolSwitch}
    <section class="strategy-card card">
      <p class="mode-kicker">장신 오늘</p>
      <h2 class="strategy-title">구약 문제집 + 2027 암송</h2>
      <p class="muted small">문제집은 정답 미수록(열람) · 암송은 개역개정 본문으로 채점 가능</p>
      <div class="strategy-actions">
        <button type="button" class="btn btn-primary" data-quick
          data-mode="flash" data-tags="구약암송,한암송" data-subject="성경" data-seminary="jangsin" data-count="15">
          암송 플래시 15
        </button>
        <button type="button" class="btn btn-secondary" data-quick
          data-mode="study" data-tags="장신,장신기출" data-subject="성경" data-seminary="jangsin" data-count="15">
          문제집 열람 15
        </button>
        <button type="button" class="btn btn-ghost" data-quick
          data-mode="study" data-tags="구약암송,장절맞히기" data-subject="성경" data-seminary="jangsin" data-count="15">
          장절 맞히기
        </button>
      </div>
    </section>
    <section class="study-section card study-section-accent">
      <div class="study-section-head">
        <h2>2027 구약 암송</h2>
        <p class="muted small">입시 암송구절 25곳 · 개역개정</p>
      </div>
      <div class="topic-list topic-list-compact">
        ${JANGSIN_MEMORY_TRACKS.map((t) =>
          renderTopicRow(t, null, {
            tags: t.tags,
            subject: "성경",
            seminary: "jangsin",
            mode: t.mode || "flash",
            count: t.recommend,
          })
        ).join("")}
      </div>
    </section>
    <section class="study-section card">
      <div class="study-section-head">
        <h2>성경문제집 [구약]</h2>
        <p class="muted small">300문항 · 난이도 A/B/C · 정답지 미반영</p>
      </div>
      <div class="topic-list topic-list-compact">
        ${JANGSIN_TRACKS.map((t) =>
          renderTopicRow(t, null, {
            tags: t.tags,
            subject: "성경",
            seminary: "jangsin",
            mode: t.mode || "study",
            count: t.recommend,
          })
        ).join("")}
      </div>
    </section>
    <p class="muted small" style="margin-top:1rem">총신 기출·영어는 <button type="button" class="chip-btn" id="goto-chongshin-study-2">총신 학습</button>에서 따로 공부하세요.</p>
    `;
  }

  return `
    <header class="page-header">
      <h1>총신 학습</h1>
      <p class="muted">총신대 · 오늘 ${today.answered}/${today.goal} · 필수 ${mustTotal.toLocaleString("ko-KR")} · 기출 ${gichulTotal.toLocaleString("ko-KR")}</p>
    </header>
    ${schoolSwitch}

    <div class="daily-goal card">
      <div class="daily-goal-top">
        <span>오늘의 목표</span>
        <strong>${today.answered} / ${today.goal}</strong>
      </div>
      <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${today.pct}%"></div></div>
      <p class="muted small">누적 정답 ${stats.totalCorrect || 0} · 최고 연속 ${stats.bestCombo || 0}</p>
    </div>

    <section class="strategy-card card">
      <p class="mode-kicker">오늘 전략 · ${phase.label}</p>
      <h2 class="strategy-title">${typeFocus.label} → ${bibleFocus.label} → ${vocabDay.label}</h2>
      <p class="muted small">${phase.goal}</p>
      <ol class="strategy-steps">
        <li><strong>유형 ${typeFocus.label}</strong> — ${typeFocus.hint || ""} (${typeFocus.pct}% 학습)</li>
        <li><strong>권 ${bibleFocus.label}</strong> — ${bibleFocus.hint || ""} (${bibleFocus.pct}% 학습)</li>
        <li><strong>영어 ${vocabDay.label}</strong> — ${vocabDay.theme} (${vocabDay.pct}% 학습)</li>
      </ol>
      <div class="strategy-actions">
        <button type="button" class="btn btn-primary" data-quick
          data-mode="study" data-tags="${typeFocus.tag}" data-subject="성경" data-seminary="chongshin" data-count="15">
          유형 15
        </button>
        <button type="button" class="btn btn-secondary" data-quick
          data-mode="study" data-tags="기출,${bibleFocus.tag}" data-subject="성경" data-seminary="chongshin" data-count="10">
          권별 10
        </button>
        <button type="button" class="btn btn-ghost" data-quick
          data-mode="study" data-tags="${vocabDay.tag},영한" data-subject="영어" data-seminary="chongshin" data-count="20">
          영→한 20
        </button>
      </div>
      <p class="muted small strategy-note">공략 순서: 기출 유형 가중치 → 다빈도 권 → 실전 모의 → 영어</p>
    </section>

    <section class="mode-grid">
      <button type="button" class="mode-card mode-study" data-quick
        data-mode="study" data-tags="필수" data-subject="성경" data-seminary="chongshin" data-count="15">
        <span class="mode-kicker">필수</span>
        <strong>필수 가중 15</strong>
        <span>가중치 5</span>
      </button>
      <button type="button" class="mode-card" data-quick
        data-mode="study" data-tags="${typeFocus.tag}" data-subject="성경" data-seminary="chongshin" data-count="15">
        <span class="mode-kicker">유형</span>
        <strong>${typeFocus.label}</strong>
        <span>${typeFocus.hint || ""}</span>
      </button>
      <button type="button" class="mode-card" data-quick
        data-mode="study" data-tags="${vocabDay.tag},영한" data-subject="영어" data-seminary="chongshin" data-count="20">
        <span class="mode-kicker">영어</span>
        <strong>${vocabDay.label} 영→한</strong>
        <span>${vocabDay.theme}</span>
      </button>
      <button type="button" class="mode-card" data-quick
        data-mode="exam" data-tags="필수" data-seminary="chongshin" data-count="25">
        <span class="mode-kicker">모의</span>
        <strong>필수 시험 25</strong>
        <span>점수 집중</span>
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

    <section class="study-section card study-section-accent">
      <div class="study-section-head">
        <h2>1. 기출 유형 (가중치) · 총신</h2>
        <p class="muted small">신_유형 → 성종·신유형 → 목유형 → 학기형</p>
      </div>
      <div class="topic-list topic-list-compact">
        ${IMPORTANCE_TRACKS.map((t) =>
          renderTopicRow(t, null, {
            tags: [t.tag],
            subject: "성경",
            seminary: "chongshin",
            mode: t.mode,
            count: t.recommend,
          })
        ).join("")}
        ${EXAM_TYPE_TRACKS.map((t) =>
          renderTopicRow(t, null, {
            tags: [t.tag],
            subject: "성경",
            seminary: "chongshin",
            count: t.recommend,
          })
        ).join("")}
      </div>
    </section>

    <section class="study-section card">
      <div class="study-section-head">
        <h2>2. 성경 권별 · 총신</h2>
        <p class="muted small">총신 기출·문제은행·원문 합산 · S필수 → A중요</p>
      </div>
      <div class="topic-list">
        ${topBooks.map((t, i) => renderTopicRow(t, i + 1, { seminary: "chongshin" })).join("")}
      </div>
      ${
        moreBooks.length
          ? `<details class="topic-more">
              <summary>11위 이하 더 보기 (${moreBooks.length}권)</summary>
              <div class="topic-list">${moreBooks.map((t, i) => renderTopicRow(t, i + 11, { seminary: "chongshin" })).join("")}</div>
            </details>`
          : ""
      }
    </section>

    <section class="study-section card">
      <div class="study-section-head">
        <h2>3. 실전 세트 · 총신</h2>
        <p class="muted small">필수 모의 · 통합 기출 · 원문기출 · 문제은행</p>
      </div>
      <div class="topic-list topic-list-compact">
        ${PRACTICE_TRACKS.map((t) =>
          renderTopicRow(t, null, {
            tags: t.tags,
            subject: t.subject || "",
            seminary: t.seminary || "chongshin",
            mode: t.mode || "exam",
            count: t.recommend,
          })
        ).join("")}
      </div>
    </section>

    <section class="study-section card">
      <div class="study-section-head">
        <h2>4. 영어 단어장 300 · 15일</h2>
        <p class="muted small">2020–22 기출 맞춤 · 뜻·동의어·반의어·예문 묶음</p>
      </div>
      <div class="topic-list">
        ${vocabEarly
          .map((t) =>
            renderTopicRow(t, t.day, {
              tags: [t.tag, "영한"],
              subject: "영어",
              count: 20,
              hint: t.theme,
            })
          )
          .join("")}
      </div>
      <details class="topic-more">
        <summary>Day 10–15 · 신학·구문 (${vocabLate.length}일)</summary>
        <div class="topic-list">
          ${vocabLate
            .map((t) =>
              renderTopicRow(t, t.day, {
                tags: [t.tag, "영한"],
                subject: "영어",
                count: 20,
                hint: t.theme,
              })
            )
            .join("")}
        </div>
      </details>
    </section>

    <section class="study-section card">
      <div class="study-section-head">
        <h2>영어 회독 · 성경영어 · 문법</h2>
        <p class="muted small">회독 방식 / ESV 병행 / 빈출 문법</p>
      </div>
      <div class="topic-list topic-list-compact">
        ${ENGLISH_DRILL_TRACKS.map((t) =>
          renderTopicRow(t, null, {
            tags: [t.tag],
            subject: "영어",
            mode: t.mode,
            count: t.recommend,
          })
        ).join("")}
        ${BIBLE_ENGLISH_TRACKS.map((t) =>
          renderTopicRow(t, null, {
            tags: t.tags,
            subject: "영어",
            mode: t.mode,
            count: t.recommend,
          })
        ).join("")}
      </div>
      <button type="button" class="btn btn-secondary btn-block" style="margin:0.75rem 1rem 0.5rem;width:auto"
        data-quick data-mode="study" data-tags="문법,신대원영어" data-subject="영어" data-count="20">
        문법 종합 20문항
      </button>
      <div class="topic-list topic-list-compact">
        ${GRAMMAR_TRACKS.map((t) =>
          renderTopicRow(t, null, {
            tags: ["문법", t.tag],
            subject: "영어",
            mode: "study",
            count: 10,
          })
        ).join("")}
      </div>
      <details class="topic-more">
        <summary>성경영어 주제별</summary>
        <div class="keyword-chips" style="padding-top:0.75rem">
          ${BIBLE_ENGLISH_THEMES.map(
            (t) =>
              `<button type="button" class="chip-btn" data-quick data-mode="study" data-tags="성경영어,${t.tag}" data-subject="영어" data-count="10" title="${t.hint}">${t.label}</button>`
          ).join("")}
        </div>
      </details>
    </section>

    <section class="study-section card">
      <div class="study-section-head">
        <h2>자주 나오는 키워드</h2>
        <p class="muted small">탐색에서 해당 키워드 문제를 볼 수 있어요</p>
      </div>
      <div class="keyword-chips">
        ${HOT_KEYWORDS.map(
          (k) =>
            `<button type="button" class="chip-btn" data-browse data-search="${k.search}" data-subject="성경">${k.label}</button>`
        ).join("")}
      </div>
    </section>

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
            <option value="필수">필수 (가중치5)</option>
            <option value="중요">중요</option>
            <option value="권장">권장</option>
            <option value="기출">기출</option>
            <option value="신_유형">신(약) 유형</option>
            <option value="성종유형">성종유형</option>
            <option value="원문기출">원문기출</option>
            <option value="문제은행">성경고사 문제은행</option>
            <option value="2026문제은행">2026 문제은행</option>
            <option value="구약">구약</option>
            <option value="신약">신약</option>
            <option value="단어장300">단어장300</option>
            <option value="성경영어">성경영어(ESV)</option>
            <option value="문법">문법</option>
            <option value="영한">영한</option>
            <option value="한영">한영</option>
            <option value="동의어">동의어</option>
            <option value="반의어">반의어</option>
            <option value="신학영어">신학영어</option>
            ${VOCAB_DAY_TRACKS.map((d) => `<option value="${d.tag}">${d.label} ${d.theme}</option>`).join("")}
            ${BIBLE_BOOK_TRACKS.slice(0, 12)
              .map((b) => `<option value="${b.tag}">${b.label}</option>`)
              .join("")}
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
        <p class="muted small">전체 ${questions.length.toLocaleString("ko-KR")}문항 · 매번 랜덤 출제 · 객관식 위주 (플래시는 암송)</p>
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
  const dq = displayQuestion(session, q);

  if (session.phase === "feedback" && session.lastResult) {
    root.innerHTML = renderFeedback(session, dq, modeLabel, pct);
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
    dq.type === "multiple" && dq.choices
      ? dq.choices
          .map(
            (c, i) =>
              `<button type="button" class="choice-btn" data-index="${i}"><span class="choice-mark">${CIRCLE[i]}</span> ${escapeHtml(c)}</button>`
          )
          .join("")
      : dq.type === "ox"
        ? `<button type="button" class="choice-btn ox-btn" data-ox="O">O · 맞다</button>
           <button type="button" class="choice-btn ox-btn" data-ox="X">X · 틀리다</button>`
        : `<div class="short-study">
            <input type="text" class="text-answer" id="text-answer" placeholder="${q.tags?.includes("한영") || q.tags?.includes("암송") ? "영어 단어 입력 후 확인" : "정답 입력 (선택)"}" autocomplete="off" autocapitalize="off" />
            <button type="button" class="btn btn-primary btn-block" id="check-short">확인</button>
            <button type="button" class="btn btn-ghost btn-block" id="reveal-short">정답만 보기</button>
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
      <p class="question-title">${escapeHtml(dq.question)}</p>
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
        const ok = btn.dataset.ox === String(dq.answer).toUpperCase();
        commitAnswer(session, dq, btn.dataset.ox, ok, root, allQuestions, onFinish);
        return;
      }
      const idx = parseInt(btn.dataset.index, 10);
      const ok = hasAnswer(dq) ? isChoiceCorrect(dq.answer, idx) : true;
      commitAnswer(session, dq, idx, ok, root, allQuestions, onFinish);
    });
  });

  function normalizeShort(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  root.querySelector("#check-short")?.addEventListener("click", () => {
    const typed = root.querySelector("#text-answer")?.value?.trim() || "";
    if (!typed) {
      alert("답을 입력하거나 ‘정답만 보기’를 누르세요.");
      return;
    }
    const ok = normalizeShort(typed) === normalizeShort(q.answer);
    commitAnswer(session, q, typed, ok, root, allQuestions, onFinish);
  });

  root.querySelector("#text-answer")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      root.querySelector("#check-short")?.click();
    }
  });

  root.querySelector("#reveal-short")?.addEventListener("click", () => {
    root.querySelector("#check-short")?.classList.add("hidden");
    root.querySelector("#reveal-short")?.classList.add("hidden");
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
  const unanswered = !hasAnswer(q);
  session.answers.push({ questionId: q.id, selected, correct: unanswered ? true : correct, unanswered });
  if (unanswered) {
    // 정답 미수록: 오답노트·점수 집계에서 제외, 열람만
    session.combo = session.combo || 0;
  } else if (correct) {
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
  session.lastResult = { correct: unanswered ? true : correct, selected, unanswered };
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
        <p>${escapeHtml(hasAnswer(q) ? formatAnswer(q) : "정답 미수록")}</p>
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
  const { correct, selected, unanswered } = session.lastResult;
  const showExplain = (session.mode || "study") !== "exam" || !correct || unanswered;
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
    <article class="card feedback-card ${unanswered ? "" : correct ? "is-correct" : "is-wrong"} feedback-pop">
      <p class="feedback-emoji">${unanswered ? "열람" : correct ? "맞아요" : "아쉬워요"}</p>
      <p class="question-title small-q">${escapeHtml(q.question)}</p>
      <p><span class="muted">정답</span> · <strong>${escapeHtml(unanswered || !hasAnswer(q) ? "정답 미수록 (정답지 대기)" : formatAnswer(q))}</strong></p>
      ${
        !unanswered && !correct && selected != null && selected !== "miss" && selected !== "self-miss"
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
