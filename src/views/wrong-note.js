import { SEMINARIES } from "../config.js";
import { loadQuestions, getQuestionById } from "../data/questions.js";
import { BOOKS } from "../data/book-notes/index.js";
import { getQuery, navigate } from "../router.js";
import {
  getWrongNotes,
  removeWrongNote,
  isWrongDue,
  wrongPriority,
  wrongGraduatedCount,
  WRONG_STAGES,
} from "../storage/progress.js";
import { isCover, coverToggle, bindCover } from "../lib/cover.js";

const WRONG_QUIZ_KEY = "wrong-note-quiz-ids";
const BOOK_ORDER = new Map(BOOKS.map((b, i) => [b.n, i]));
const SESSION_MAX = 20;

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

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shortDate(key) {
  if (!key) return "";
  const [, m, d] = key.split("-").map(Number);
  return `${m}/${d}`;
}

function bookOf(q) {
  return (q?.tags || []).find((t) => BOOK_ORDER.has(t)) || "";
}

function stageDots(stage = 0) {
  return Array.from({ length: WRONG_STAGES }, (_, i) => `<i class="${i < stage ? "on" : ""}"></i>`).join("");
}

export async function renderWrongNote(root) {
  const questions = await loadQuestions();
  const today = todayKey();
  const all = wrongPriority(getWrongNotes()).map((n) => {
    const q = getQuestionById(questions, n.questionId);
    return { n, q, book: bookOf(q), due: isWrongDue(n, today) };
  });
  const dueAll = all.filter((x) => x.due);
  const graduated = wrongGraduatedCount();

  const books = [...new Set(all.map((x) => x.book).filter(Boolean))].sort((a, b) => BOOK_ORDER.get(a) - BOOK_ORDER.get(b));
  const filters = [
    { id: "today", label: "오늘", match: (x) => x.due },
    { id: "all", label: "전체", match: () => true },
    { id: "repeat", label: "2번 이상", match: (x) => (x.n.missCount || 1) >= 2 },
    { id: "english", label: "영어", match: (x) => x.n.subject === "영어" },
    ...books.map((b) => ({ id: `book:${b}`, label: b, match: (x) => x.book === b, book: true })),
  ];
  const fallback = dueAll.length ? "today" : "all";
  const filterId = getQuery().get("f") || fallback;
  const filter = filters.find((f) => f.id === filterId) || filters.find((f) => f.id === fallback);
  const items = all.filter(filter.match);
  const sessionItems = items.slice(0, SESSION_MAX);
  const nextDue = all.filter((x) => !x.due).map((x) => x.n.due).sort()[0];
  const cover = isCover();
  const filterName = filter.id === "today" ? "오늘 복습" : filter.id === "all" ? "오답" : filter.label;

  root.innerHTML = `
    <header class="page-header">
      <h1>오답노트</h1>
      <p class="muted">맞히면 1일 뒤 → 3일 뒤 다시 나오고, 세 번 맞히면 졸업해요.</p>
    </header>

    <section class="wrong-summary card">
      <div><strong>${dueAll.length}</strong><span>오늘 복습</span></div>
      <div><strong>${all.length - dueAll.length}</strong><span>대기 중</span></div>
      <div><strong>${graduated}</strong><span>졸업</span></div>
    </section>

    ${
      sessionItems.length
        ? `<div class="wrong-actions">
            <button type="button" class="btn btn-primary btn-block" data-start="study">${escapeHtml(filterName)} ${sessionItems.length}문항 풀기</button>
            <button type="button" class="btn btn-secondary btn-block" data-start="flash">카드로 빠르게 넘기기</button>
            ${items.length > SESSION_MAX ? `<p class="muted small center">우선순위 높은 ${SESSION_MAX}문항씩 (오늘 차례 → 많이 틀린 것)</p>` : ""}
          </div>`
        : all.length && !dueAll.length
          ? `<p class="wrong-clear card">오늘 복습 끝 ✅${nextDue ? ` · 다음 복습 ${shortDate(nextDue)}` : ""}</p>`
          : ""
    }

    <div class="keyword-chips wrong-filters">
      ${filters
        .filter((f) => !f.book)
        .map((f) => chip(f, all, filter))
        .join("")}
    </div>
    ${books.length ? `<div class="keyword-chips wrong-filters wrong-books">${filters.filter((f) => f.book).map((f) => chip(f, all, filter)).join("")}</div>` : ""}

    <div class="wrong-list-head">
      <span class="muted small">${items.length}문항</span>
      ${coverToggle()}
    </div>

    <ul class="question-list wrong-list">
      ${
        items.length
          ? items.map((x) => itemHtml(x, cover)).join("")
          : `<li class="empty">${all.length ? "이 분류에는 오답이 없습니다." : "오답 기록이 없습니다. 문제를 풀다 틀리면 여기 모입니다."}</li>`
      }
    </ul>
  `;

  root.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(`/wrong-note?f=${encodeURIComponent(btn.dataset.filter)}`));
  });

  root.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeWrongNote(btn.dataset.remove);
      renderWrongNote(root);
    });
  });

  root.querySelectorAll("[data-start]").forEach((btn) => {
    btn.addEventListener("click", () => {
      sessionStorage.setItem(WRONG_QUIZ_KEY, JSON.stringify(sessionItems.map((x) => x.n.questionId)));
      navigate(`/quiz?mode=wrong${btn.dataset.start === "flash" ? "&style=flash" : ""}`);
    });
  });

  bindCover(root, () => renderWrongNote(root));

  root.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(a.getAttribute("href").slice(1));
    });
  });
}

function chip(f, all, active) {
  const n = all.filter(f.match).length;
  const enabled = n || f.id === "all" || f.id === "today";
  return `<button type="button" class="chip-btn ${f.id === active.id ? "active" : ""}" data-filter="${escapeHtml(f.id)}" ${enabled ? "" : "disabled"}>${escapeHtml(f.label)} ${n}</button>`;
}

function itemHtml({ n, q, book, due }, cover) {
  const sem = SEMINARIES[n.seminary]?.shortName || n.seminary;
  const correct = q ? answerText(q) : stripMark(n.answerLabel);
  const mine = stripMark(n.selectedLabel);
  const misses = n.missCount || 1;
  const expl = q?.explanation ? escapeHtml(q.explanation).replace(/\n/g, "<br>") : "";
  const choices =
    q?.type === "multiple" && Array.isArray(q.choices)
      ? `<ol class="wrong-choices">${q.choices.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ol>`
      : "";
  const reveal = `
    ${correct ? `<p class="wrong-answer"><span>정답</span> ${escapeHtml(correct)}</p>` : ""}
    ${mine && !/^(know|miss|self-miss)$/.test(mine) ? `<p class="wrong-mine"><span>내 답</span> ${escapeHtml(mine)}</p>` : ""}
    ${expl ? `<p class="wrong-expl">${expl}</p>` : ""}`;
  return `
    <li class="wrong-item card ${due ? "is-due" : ""}">
      <div class="wrong-meta">
        <span class="badge">${escapeHtml(book || `${sem} · ${n.subject}`)}</span>
        <span class="wrong-stage" title="복습 단계">${stageDots(n.stage || 0)}</span>
        ${misses >= 2 ? `<span class="wrong-count">${misses}번 틀림</span>` : ""}
        <span class="muted small">${due ? "오늘" : `${shortDate(n.due)} 복습`}</span>
      </div>
      <p class="wrong-question">${escapeHtml(n.question)}</p>
      ${choices}
      ${
        cover
          ? `<div class="cover-item wrong-cover" role="button" tabindex="0" aria-expanded="false">
              <div class="cover-tail">${reveal}</div>
              <span class="cover-mask" aria-hidden="true">정답 떠올리고 탭</span>
            </div>`
          : reveal
      }
      <div class="card-actions">
        <a class="btn btn-secondary" href="#/question/${encodeURIComponent(n.questionId)}">문제 화면</a>
        <button type="button" class="btn btn-ghost" data-remove="${escapeHtml(n.questionId)}">확실히 앎 · 빼기</button>
      </div>
    </li>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
