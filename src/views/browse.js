import { SEMINARIES, UI } from "../config.js";
import { loadQuestions, filterQuestions, getYears } from "../data/questions.js";
import { getQuery, navigate } from "../router.js";
import { isBookmarked } from "../storage/progress.js";

const PAGE_SIZE = 40;

const TAG_PRESETS = [
  { value: "", label: "전체" },
  { value: "기출", label: "기출" },
  { value: "암송", label: "암송" },
  { value: "창세기", label: "창세기" },
  { value: "시편", label: "시편" },
  { value: "로마서", label: "로마서" },
];

export async function renderBrowse(root) {
  const questions = await loadQuestions();
  const q = getQuery();
  const seminary = q.get("seminary") || "";
  const subject = q.get("subject") || "";
  const search = q.get("q") || "";
  const year = q.get("year") || "";
  const tag = q.get("tag") || "";
  const page = Math.max(1, parseInt(q.get("page") || "1", 10) || 1);

  const filtered = filterQuestions(questions, { seminary, subject, search, year, tag });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const sem = seminary ? SEMINARIES[seminary] : null;
  const subjects = sem ? sem.subjects : [...new Set(questions.map((x) => x.subject))];
  const years = getYears(questions);

  function pageHref(p) {
    const params = new URLSearchParams();
    if (seminary) params.set("seminary", seminary);
    if (subject) params.set("subject", subject);
    if (year) params.set("year", year);
    if (tag) params.set("tag", tag);
    if (search) params.set("q", search);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/browse${qs ? `?${qs}` : ""}`;
  }

  root.innerHTML = `
    <header class="page-header">
      <h1>문제 탐색</h1>
      <p class="muted">${filtered.length}문항${totalPages > 1 ? ` · ${safePage}/${totalPages}쪽` : ""}</p>
    </header>
    <form class="filter-bar" id="filter-form">
      <label>
        <span>신학대</span>
        <select name="seminary">
          <option value="">전체</option>
          ${Object.values(SEMINARIES)
            .map(
              (s) =>
                `<option value="${s.id}" ${s.id === seminary ? "selected" : ""}>${s.shortName}</option>`
            )
            .join("")}
        </select>
      </label>
      <label>
        <span>과목</span>
        <select name="subject">
          <option value="">전체</option>
          ${subjects
            .map(
              (sub) =>
                `<option value="${sub}" ${sub === subject ? "selected" : ""}>${sub}</option>`
            )
            .join("")}
        </select>
      </label>
      <label>
        <span>연도</span>
        <select name="year">
          <option value="">전체</option>
          ${years
            .map((y) => `<option value="${y}" ${String(y) === year ? "selected" : ""}>${y}</option>`)
            .join("")}
        </select>
      </label>
      <label>
        <span>태그</span>
        <select name="tag">
          ${TAG_PRESETS.map(
            (t) =>
              `<option value="${escapeHtml(t.value)}" ${t.value === tag ? "selected" : ""}>${escapeHtml(t.label)}</option>`
          ).join("")}
        </select>
      </label>
      <label class="grow">
        <span>검색</span>
        <input name="q" type="search" placeholder="문제·해설·태그" value="${escapeHtml(search)}" />
      </label>
      <button type="submit" class="btn btn-primary">적용</button>
    </form>
    <ul class="question-list">
      ${
        pageItems.length
          ? pageItems
              .map((item) => {
                const meta = [
                  SEMINARIES[item.seminary]?.shortName || item.seminary,
                  item.subject,
                  item.year != null ? String(item.year) : null,
                  (item.tags || []).find(
                    (t) => !["기출", "총신", "00-14", "quizlet", "구약", "신약"].includes(t)
                  ),
                ]
                  .filter(Boolean)
                  .join(" · ");
                return `
        <li>
          <a class="question-card" href="#/question/${encodeURIComponent(item.id)}">
            <span class="badge">${escapeHtml(meta)}</span>
            ${item.tags?.includes("암송") ? '<span class="badge">암송</span>' : ""}
            ${item.source === "paste" ? '<span class="badge">붙여넣기</span>' : ""}
            <p class="question-preview">${escapeHtml(item.question)}</p>
            ${isBookmarked(item.id) ? '<span class="bookmark-flag">★</span>' : ""}
          </a>
        </li>`;
              })
              .join("")
          : `<li class="empty">${UI.emptyQuestions}</li>`
      }
    </ul>
    ${
      totalPages > 1
        ? `<nav class="pager" aria-label="페이지">
            <button type="button" class="btn btn-ghost" data-page="${safePage - 1}" ${safePage <= 1 ? "disabled" : ""}>이전</button>
            <span class="muted small">${safePage} / ${totalPages}</span>
            <button type="button" class="btn btn-ghost" data-page="${safePage + 1}" ${safePage >= totalPages ? "disabled" : ""}>다음</button>
          </nav>`
        : ""
    }
  `;

  root.querySelector("#filter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const params = new URLSearchParams();
    for (const [k, v] of fd.entries()) {
      if (v) params.set(k, v);
    }
    navigate(`/browse?${params.toString()}`);
  });

  root.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = parseInt(btn.dataset.page, 10);
      if (p >= 1 && p <= totalPages) navigate(pageHref(p));
    });
  });

  root.querySelectorAll("a.question-card").forEach((a) => {
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
