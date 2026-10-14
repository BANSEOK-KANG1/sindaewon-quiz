import { SEMINARIES } from "../config.js";
import { loadQuestions, getQuestionById } from "../data/questions.js";
import { getQuery, navigate } from "../router.js";
import { getWrongNotes, removeWrongNote } from "../storage/progress.js";

const FILTERS = [
  { id: "all", label: "전체", match: () => true },
  { id: "bible", label: "총신 성경", match: (n) => n.seminary === "chongshin" && n.subject === "성경" },
  { id: "english", label: "영어", match: (n) => n.subject === "영어" },
  { id: "jangsin", label: "장신", match: (n) => n.seminary === "jangsin" },
  { id: "repeat", label: "2번 이상", match: (n) => (n.missCount || 1) >= 2 },
];

/** 퀴즈에서는 보기 순서를 섞으므로 번호 없이 보기 내용만 보여 준다. */
function answerText(q) {
  if (!q) return "";
  if (q.type === "multiple" && Array.isArray(q.choices)) {
    const idxs = Array.isArray(q.answer) ? q.answer : [q.answer];
    return idxs.map((i) => q.choices[i] ?? "").filter(Boolean).join(" / ");
  }
  return String(q.answer ?? "");
}

function stripMark(label) {
  return String(label || "").replace(/^[①②③④]\s*/, "");
}

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export async function renderWrongNote(root) {
  const all = getWrongNotes();
  const questions = await loadQuestions();
  const filterId = getQuery().get("f") || "all";
  const filter = FILTERS.find((f) => f.id === filterId) || FILTERS[0];
  const notes = all.filter(filter.match);

  root.innerHTML = `
    <header class="page-header">
      <h1>오답노트</h1>
      <p class="muted">${all.length}건 · 맞히면 자동으로 빠집니다</p>
    </header>
    <div class="keyword-chips wrong-filters">
      ${FILTERS.map((f) => {
        const n = all.filter(f.match).length;
        return `<button type="button" class="chip-btn ${f.id === filter.id ? "active" : ""}" data-filter="${f.id}" ${n || f.id === "all" ? "" : "disabled"}>${f.label} ${n}</button>`;
      }).join("")}
    </div>
    ${
      notes.length
        ? `<button type="button" class="btn btn-primary btn-block" id="retry-all">${filter.id === "all" ? "오답 전체" : filter.label} ${notes.length}문항 다시 풀기</button>`
        : ""
    }
    <ul class="question-list wrong-list">
      ${
        notes.length
          ? notes
              .map((n) => {
                const q = getQuestionById(questions, n.questionId);
                const sem = SEMINARIES[n.seminary]?.shortName || n.seminary;
                const correct = q ? answerText(q) : stripMark(n.answerLabel);
                const mine = stripMark(n.selectedLabel);
                const misses = n.missCount || 1;
                return `
          <li class="wrong-item card">
            <div class="wrong-meta">
              <span class="badge">${sem} · ${n.subject}</span>
              ${misses >= 2 ? `<span class="wrong-count">${misses}번 틀림</span>` : ""}
              <span class="muted small">${formatDate(n.updatedAt)}</span>
            </div>
            <p class="wrong-question">${escapeHtml(n.question)}</p>
            ${correct ? `<p class="wrong-answer"><span>정답</span> ${escapeHtml(correct)}</p>` : ""}
            ${mine ? `<p class="wrong-mine"><span>내 답</span> ${escapeHtml(mine)}</p>` : ""}
            <div class="card-actions">
              <a class="btn btn-secondary" href="#/question/${encodeURIComponent(n.questionId)}">해설 보기</a>
              <button type="button" class="btn btn-ghost" data-remove="${escapeHtml(n.questionId)}">외웠어요 · 빼기</button>
            </div>
          </li>`;
              })
              .join("")
          : `<li class="empty">${all.length ? "이 분류에는 오답이 없습니다." : "오답 기록이 없습니다. 계획 학습을 풀면 틀린 문항이 여기 모입니다."}</li>`
      }
    </ul>
  `;

  root.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate(btn.dataset.filter === "all" ? "/wrong-note" : `/wrong-note?f=${btn.dataset.filter}`);
    });
  });

  root.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeWrongNote(btn.dataset.remove);
      renderWrongNote(root);
    });
  });

  root.querySelector("#retry-all")?.addEventListener("click", () => {
    const ids = notes.map((n) => n.questionId);
    sessionStorage.setItem("wrong-note-quiz-ids", JSON.stringify(ids));
    navigate("/quiz?mode=wrong");
  });

  root.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(a.getAttribute("href").slice(1));
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
