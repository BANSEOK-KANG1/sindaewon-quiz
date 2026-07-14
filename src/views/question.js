import { SEMINARIES } from "../config.js";
import { loadQuestions, getQuestionById } from "../data/questions.js";
import { navigate } from "../router.js";
import { toggleBookmark, isBookmarked } from "../storage/progress.js";

const CIRCLE = ["①", "②", "③", "④"];

export async function renderQuestion(root, { id }) {
  const questions = await loadQuestions();
  const q = getQuestionById(questions, id);
  if (!q) {
    root.innerHTML = `<p class="empty">문제를 찾을 수 없습니다.</p><a class="btn" href="#/browse">목록으로</a>`;
    return;
  }

  let showAnswer = false;
  let bookmarked = isBookmarked(q.id);

  const render = () => {
    const choices =
      q.type === "multiple" && q.choices
        ? `<ol class="choices">${q.choices
            .map(
              (c, i) =>
                `<li>${CIRCLE[i]} ${escapeHtml(c)}${
                  showAnswer && i === q.answer ? ' <span class="correct">정답</span>' : ""
                }</li>`
            )
            .join("")}</ol>`
        : showAnswer
          ? `<p class="answer-box">정답: ${escapeHtml(String(q.answer))}</p>`
          : "";

    const badges = [
      SEMINARIES[q.seminary]?.shortName || q.seminary,
      q.subject,
      q.year != null ? String(q.year) : null,
    ]
      .filter(Boolean)
      .join(" · ");

    const tagBits = (q.tags || [])
      .filter((t) => !["총신", "quizlet"].includes(t))
      .slice(0, 6)
      .map((t) => `<span class="badge">${escapeHtml(t)}</span>`)
      .join("");

    const explanation =
      showAnswer && q.explanation
        ? `<section class="explanation card"><h2>해설</h2><p>${escapeHtml(q.explanation).replace(/\n/g, "<br>")}</p></section>`
        : "";

    root.innerHTML = `
      <header class="page-header">
        <button type="button" class="btn btn-ghost back-btn">← 탐색</button>
        <span class="badge">${escapeHtml(badges)}</span>
        <div class="tag-row">${tagBits}</div>
        <h1 class="question-title">${escapeHtml(q.question)}</h1>
      </header>
      ${choices}
      ${explanation}
      <div class="toolbar">
        <button type="button" class="btn btn-primary" id="toggle-answer">${showAnswer ? "정답 숨기기" : "정답 보기"}</button>
        <button type="button" class="btn btn-secondary" id="bookmark">${bookmarked ? "북마크 해제" : "북마크"}</button>
      </div>
    `;

    root.querySelector(".back-btn").onclick = () => navigate("/browse");
    root.querySelector("#toggle-answer").onclick = () => {
      showAnswer = !showAnswer;
      render();
    };
    root.querySelector("#bookmark").onclick = () => {
      bookmarked = toggleBookmark(q.id);
      render();
    };
  };

  render();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
