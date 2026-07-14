import { SEMINARIES } from "../config.js";
import { loadQuestions, getQuestionById } from "../data/questions.js";
import { navigate } from "../router.js";
import { getWrongNotes, removeWrongNote } from "../storage/progress.js";

export async function renderWrongNote(root) {
  const notes = getWrongNotes();
  const questions = await loadQuestions();

  root.innerHTML = `
    <header class="page-header">
      <h1>오답노트</h1>
      <p class="muted">${notes.length}건</p>
    </header>
    <ul class="question-list">
      ${
        notes.length
          ? notes
              .map((n) => {
                const q = getQuestionById(questions, n.questionId);
                const sem = SEMINARIES[n.seminary]?.shortName || n.seminary;
                return `
          <li class="wrong-item card">
            <span class="badge">${sem} · ${n.subject}</span>
            <p>${escapeHtml(n.question)}</p>
            <p class="muted small">내 답: ${escapeHtml(String(n.selected))}</p>
            <div class="card-actions">
              <a class="btn btn-primary" href="#/question/${encodeURIComponent(n.questionId)}">다시 보기</a>
              <button type="button" class="btn btn-ghost" data-remove="${escapeHtml(n.questionId)}">삭제</button>
            </div>
          </li>`;
              })
              .join("")
          : `<li class="empty">오답 기록이 없습니다. 퀴즈를 풀어보세요.</li>`
      }
    </ul>
    ${
      notes.length
        ? `<button type="button" class="btn btn-secondary btn-block" id="retry-all">오답 퀴즈 시작</button>`
        : ""
    }
  `;

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
