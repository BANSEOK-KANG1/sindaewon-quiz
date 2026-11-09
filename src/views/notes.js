/**
 * 권별 핵심 — 성경 66권을 1분 카드로 짬짬이 읽는다.
 * #/notes · #/notes/:book · #/review (읽은 책에서 무작위 10장 복습)
 */
import { BOOKS, BOOK_BY_NAME, GROUPS, bookCards, bookMinutes, reviewItems } from "../data/book-notes/index.js";
import { buildPlan, focusDay, toDateKey } from "../data/daily-plan.js";
import { loadQuestions } from "../data/questions.js";
import { getPlanProgress } from "../storage/progress.js";
import {
  getNotesProgress,
  setCardPosition,
  markBookRead,
  addReviewed,
  notesStreak,
  syncReadSteps,
  firstUnread,
} from "../storage/notes-progress.js";
import { navigate, getQuery } from "../router.js";
import { icon, hydrateIcons } from "../lib/icons.js";
import { studyTabs } from "./english.js";
import { isCover, coverItem, coverToggle, bindCover } from "../lib/cover.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** "앞 — 뒤" 형태면 앞을 굵게 */
function emph(text) {
  const i = text.indexOf(" — ");
  if (i > 0 && i < 40) return `<strong>${esc(text.slice(0, i))}</strong><span> — ${esc(text.slice(i + 3))}</span>`;
  return esc(text);
}

function todayReadStep() {
  const plan = buildPlan(getPlanProgress().startDate);
  const day = focusDay(plan, toDateKey());
  const step = day?.steps.find((s) => s.kind === "read");
  return step ? { day, step } : null;
}

function bindLinks(root) {
  root.querySelectorAll("a[href^='#/']").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(a.getAttribute("href").slice(1));
    });
  });
}

/* ───────────── 목록 ───────────── */

export async function renderNotes(root) {
  syncReadSteps(buildPlan(getPlanProgress().startDate));
  const prog = getNotesProgress();
  const readCount = BOOKS.filter((b) => prog.read[b.n]).length;
  const pct = Math.round((readCount / BOOKS.length) * 100);
  const today = todayReadStep();
  const todayBooks = today?.step.books || [];
  const todayLeft = todayBooks.filter((b) => !prog.read[b]);
  const continueBook = prog.last && !prog.read[prog.last] ? prog.last : null;

  const hero = today
    ? `<section class="card notes-today">
        <p class="mode-kicker">오늘 읽을 책 · ${todayBooks.length}권${todayLeft.length ? ` · 남은 ${todayLeft.length}권` : " · 완료"}</p>
        <div class="notes-chip-row">
          ${todayBooks.map((b) => `<a class="notes-chip ${prog.read[b] ? "read" : ""}" href="#/notes/${encodeURIComponent(b)}">${prog.read[b] ? "✓ " : ""}${b}</a>`).join("")}
        </div>
        ${
          todayLeft.length
            ? `<a class="btn btn-primary btn-block" href="#/notes/${encodeURIComponent(firstUnread(todayBooks))}?from=plan">${icon("book-open")} ${firstUnread(todayBooks)} 읽기 · 약 ${bookMinutes(BOOK_BY_NAME[firstUnread(todayBooks)])}분</a>`
            : `<a class="btn btn-secondary btn-block" href="#/review">${icon("brain-circuit")} 오늘 읽은 책 복습 10장</a>`
        }
      </section>`
    : continueBook
      ? `<section class="card notes-today"><p class="mode-kicker">이어 읽기</p>
          <a class="btn btn-primary btn-block" href="#/notes/${encodeURIComponent(continueBook)}">${icon("book-open")} ${continueBook} 이어서</a></section>`
      : "";

  root.innerHTML = `
    ${studyTabs("bible")}
    <header class="page-header">
      <h1>성경 66권 핵심</h1>
      <p class="muted">한 권을 1분 카드 여러 장으로 · 출퇴근, 점심, 자기 전에 몇 장씩</p>
    </header>

    <section class="home-stat-strip notes-stats" aria-label="읽기 현황">
      <div><span class="stat-icon">${icon("library-big")}</span><p><strong>${readCount}/66</strong><span>읽은 권</span></p></div>
      <div><span class="stat-icon">${icon("flame")}</span><p><strong>${notesStreak()}일</strong><span>연속</span></p></div>
      <div><span class="stat-icon">${icon("brain-circuit")}</span><p><strong>${prog.reviewed || 0}</strong><span>복습한 카드</span></p></div>
    </section>
    <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${pct}%"></div></div>

    ${hero}

    <a class="card notes-review-cta" href="#/topics">
      <span class="stat-icon">${icon("list-checks")}</span>
      <span><strong>주제별 핵심 12장</strong><span class="muted small">66권 분류 · 연대표 · 12지파 · 사사 · 왕 · 선지자 · 12제자 · 바울 · 숫자 · 지명 · 기적 · 예언 성취</span></span>
      ${icon("chevron-right")}
    </a>

    <a class="card notes-review-cta" href="#/review">
      <span class="stat-icon">${icon("brain-circuit")}</span>
      <span><strong>짬짬이 복습 10장</strong><span class="muted small">${readCount ? "읽은 책에서 무작위 · 구절 출처 맞히기와 셀프체크" : "아직 읽은 책이 없으면 전체에서 · 2~3분"}</span></span>
      ${icon("chevron-right")}
    </a>

    ${GROUPS.map(
      (g) => `
      <section class="notes-group">
        <h2><span class="muted small">${g.testament}</span> ${g.label} <span class="muted small">${g.books.filter((b) => prog.read[b.n]).length}/${g.books.length}</span></h2>
        <div class="notes-grid">
          ${g.books
            .map((b) => {
              const read = prog.read[b.n];
              const reading = !read && prog.position[b.n] > 0;
              return `<a class="notes-book ${read ? "read" : ""} ${reading ? "reading" : ""}" href="#/notes/${encodeURIComponent(b.n)}">
                <strong>${read ? "✓ " : ""}${b.n}</strong>
                <span>${b.c}장 · ${bookMinutes(b)}분${read?.times > 1 ? ` · ${read.times}회독` : ""}${reading ? " · 읽는 중" : ""}</span>
              </a>`;
            })
            .join("")}
        </div>
      </section>`
    ).join("")}

    <p class="muted small" style="margin-top:1rem">구절은 개역개정을 줄인 핵심 어구입니다. 헷갈리면 본문으로 확인하세요.</p>
  `;
  bindLinks(root);
}

/* ───────────── 한 권 읽기 ───────────── */

function cardBody(book, card) {
  switch (card.type) {
    case "intro":
      return `
        <p class="notes-group-label">${book.testament} · ${book.g} · ${book.c}장</p>
        <h2 class="notes-book-title">${book.n}</h2>
        <p class="notes-summary">${esc(book.s)}</p>
        <p class="muted small">${icon("graduation-cap")} ${esc(book.a)}</p>
        <p class="muted small">카드 ${bookCards(book).length - 1}장 · 약 ${bookMinutes(book)}분</p>`;
    case "list":
      if (isCover()) return `<ol class="notes-list cover-list ${card.accent ? "accent" : ""}">${card.items.map((t) => `<li>${coverItem(t)}</li>`).join("")}</ol>`;
      return `<ol class="notes-list ${card.accent ? "accent" : ""}">${card.items.map((t) => `<li>${emph(t)}</li>`).join("")}</ol>`;
    case "people":
      if (isCover()) return `<ul class="notes-people cover-list">${card.items.map((t) => `<li>${coverItem(t)}</li>`).join("")}</ul>`;
      return `<ul class="notes-people">${card.items.map((t) => `<li>${emph(t)}</li>`).join("")}</ul>`;
    case "verses":
      return `
        <p class="muted small">구절을 보고 장절을 떠올린 뒤 탭하세요</p>
        <ul class="notes-verses">
          ${card.items
            .map(
              ([ref, text]) => `<li><button type="button" class="notes-reveal" aria-expanded="false">
                <span class="notes-verse-text">“${esc(text)}”</span>
                <span class="notes-verse-ref"><span class="hidden-label">어디일까?</span><span class="answer">${esc(book.n)} ${esc(ref)}</span></span>
              </button></li>`
            )
            .join("")}
        </ul>`;
    case "check":
      return `
        <p class="muted small">답을 말해 보고 탭해서 확인하세요</p>
        <ul class="notes-checks">
          ${card.items
            .map(
              ([q, a]) => `<li><button type="button" class="notes-reveal" aria-expanded="false">
                <span class="notes-q">Q. ${esc(q)}</span>
                <span class="notes-a"><span class="hidden-label">답 보기</span><span class="answer">${esc(a)}</span></span>
              </button></li>`
            )
            .join("")}
        </ul>`;
    default:
      return "";
  }
}

function nextBookName(book, fromPlan) {
  const { read } = getNotesProgress();
  if (fromPlan) {
    const today = todayReadStep();
    const left = today?.step.books.filter((b) => !read[b] && b !== book.n) || [];
    if (left.length) return left[0];
  }
  const after = BOOKS.slice(book.order + 1).find((b) => !read[b.n]);
  return after?.n || null;
}

export async function renderNoteBook(root, params) {
  const book = BOOK_BY_NAME[params.book];
  if (!book) {
    navigate("/notes");
    return;
  }
  const fromPlan = getQuery().get("from") === "plan";
  const cards = bookCards(book);
  const saved = getNotesProgress().position[book.n] || 0;
  let index = Math.min(saved, cards.length - 1);
  let counted = false; // 이번에 펼친 동안 회독 수는 한 번만 올린다
  const questions = await loadQuestions();
  const quizCount = questions.filter((q) => q.seminary === "chongshin" && q.subject === "성경" && (q.tags || []).includes(book.n)).length;

  function doneBody() {
    const prog = getNotesProgress();
    const readCount = BOOKS.filter((b) => prog.read[b.n]).length;
    const next = nextBookName(book, fromPlan);
    return `
      <div class="notes-done">
        <p class="notes-done-mark">✓</p>
        <h2>${book.n} 완료</h2>
        <p class="muted">66권 중 ${readCount}권 · ${prog.read[book.n]?.times || 1}회독</p>
        <div class="notes-done-actions">
          ${
            quizCount
              ? `<a class="btn btn-primary btn-block" href="#/quiz?auto=1&mode=study&tags=${encodeURIComponent(book.n)}&subject=${encodeURIComponent("성경")}&seminary=chongshin&count=10">${icon("circle-play")} ${book.n} 기출 10문제 바로 풀기</a>`
              : `<p class="muted small">이 책은 앱에 기출 문항이 거의 없어요. 셀프체크를 한 번 더 보는 게 좋아요.</p>`
          }
          ${next ? `<a class="btn btn-secondary btn-block" href="#/notes/${encodeURIComponent(next)}${fromPlan ? "?from=plan" : ""}">${icon("book-open")} 다음 책 · ${next}</a>` : ""}
          <a class="btn btn-ghost btn-block" href="${fromPlan ? "#/plan" : "#/notes"}">${fromPlan ? "계획으로" : "목록으로"}</a>
        </div>
      </div>`;
  }

  function render() {
    const card = cards[index];
    if (card.type === "done") {
      if (!counted) markBookRead(book.n);
      counted = true;
      syncReadSteps(buildPlan(getPlanProgress().startDate));
    } else {
      setCardPosition(book.n, index);
    }
    const isRead = Boolean(getNotesProgress().read[book.n]);
    root.innerHTML = `
      <div class="notes-reader">
        <header class="notes-reader-head">
          <a class="btn btn-ghost notes-back" href="${fromPlan ? "#/plan" : "#/notes"}" aria-label="뒤로">←</a>
          <div class="notes-reader-title">
            <strong>${book.n}</strong>
            <span class="muted small">${card.title} · ${index + 1}/${cards.length}</span>
          </div>
          ${card.type !== "done" ? coverToggle() : ""}
          ${isRead ? `<span class="notes-read-tag">✓ 읽음</span>` : ""}
        </header>
        <div class="notes-dots" aria-hidden="true">
          ${cards.map((_, i) => `<span class="${i < index ? "past" : i === index ? "now" : ""}"></span>`).join("")}
        </div>
        <article class="card notes-card notes-card-${card.type}">
          ${
            card.type === "done"
              ? doneBody()
              : `<div class="notes-card-head"><h3 class="notes-card-title">${card.title}</h3>${
                  isCover() && (card.type === "list" || card.type === "people") ? `<button type="button" class="cover-all" data-cover-all>전부 보기</button>` : ""
                }</div>${cardBody(book, card)}`
          }
        </article>
        ${
          card.type === "done"
            ? `<div class="notes-nav"><button type="button" class="btn btn-ghost" data-nav="prev">← 이전</button><button type="button" class="btn btn-ghost" data-nav="restart">처음부터</button></div>`
            : `<div class="notes-nav">
                <button type="button" class="btn btn-ghost" data-nav="prev" ${index === 0 ? "disabled" : ""}>← 이전</button>
                <button type="button" class="btn btn-primary" data-nav="next">${index === cards.length - 2 ? "완료 ✓" : "다음 →"}</button>
              </div>`
        }
      </div>`;

    root.querySelectorAll(".notes-reveal").forEach((btn) => {
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
      });
    });
    bindCover(root, render);
    root.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.addEventListener("click", () => go(btn.dataset.nav));
    });
    bindLinks(root);
    hydrateIcons(root);
    window.scrollTo({ top: 0 });
  }

  function go(dir) {
    if (dir === "next" && index < cards.length - 1) index += 1;
    else if (dir === "prev" && index > 0) index -= 1;
    else if (dir === "restart") index = 0;
    else return;
    render();
  }

  // 좌우 스와이프 · 방향키
  let startX = null;
  let startY = null;
  root.ontouchstart = (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };
  root.ontouchend = (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    startX = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? "next" : "prev");
  };
  const onKey = (e) => {
    if (!document.body.contains(root) || !root.querySelector(".notes-reader")) {
      window.removeEventListener("keydown", onKey);
      return;
    }
    if (e.key === "ArrowRight") go("next");
    if (e.key === "ArrowLeft") go("prev");
  };
  window.addEventListener("keydown", onKey);

  render();
}

/* ───────────── 짬짬이 복습 ───────────── */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function renderReview(root) {
  const { read } = getNotesProgress();
  const readBooks = BOOKS.filter((b) => read[b.n]);
  const source = readBooks.length ? readBooks : BOOKS;
  let queue = shuffle(reviewItems(source)).slice(0, 10);
  const total = queue.length;
  let known = 0;
  let shown = false;

  function render() {
    if (!queue.length) {
      addReviewed(total);
      root.innerHTML = `
        <div class="notes-reader">
          <article class="card notes-card notes-done">
            <p class="notes-done-mark">✓</p>
            <h2>복습 ${total}장 끝</h2>
            <p class="muted">${readBooks.length ? `읽은 ${readBooks.length}권에서` : "전체 66권에서"} 뽑았어요</p>
            <div class="notes-done-actions">
              <a class="btn btn-primary btn-block" href="#/review">${icon("brain-circuit")} 10장 더</a>
              <a class="btn btn-ghost btn-block" href="#/notes">목록으로</a>
            </div>
          </article>
        </div>`;
      bindLinks(root);
      hydrateIcons(root);
      return;
    }
    const item = queue[0];
    root.innerHTML = `
      <div class="notes-reader">
        <header class="notes-reader-head">
          <a class="btn btn-ghost notes-back" href="#/notes" aria-label="뒤로">←</a>
          <div class="notes-reader-title">
            <strong>짬짬이 복습</strong>
            <span class="muted small">알았음 ${known}/${total} · 남은 카드 ${queue.length}</span>
          </div>
        </header>
        <article class="card notes-card notes-review-card">
          <p class="notes-group-label">${item.kind === "v" ? "이 구절은 어디?" : `셀프체크 · ${item.book}`}</p>
          <p class="notes-review-q">${esc(item.question)}</p>
          ${shown ? `<p class="notes-review-a">${esc(item.answer)}</p>` : ""}
        </article>
        <div class="notes-nav">
          ${
            shown
              ? `<button type="button" class="btn btn-secondary" data-act="again">다시 볼래요</button>
                 <button type="button" class="btn btn-primary" data-act="know">알았어요</button>`
              : `<button type="button" class="btn btn-primary btn-block" data-act="show">답 보기</button>`
          }
        </div>
      </div>`;
    root.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.dataset.act;
        if (act === "show") shown = true;
        else {
          const cur = queue.shift();
          if (act === "know") known += 1;
          else queue.push(cur);
          shown = false;
        }
        render();
      });
    });
    bindLinks(root);
    hydrateIcons(root);
  }
  render();
}
