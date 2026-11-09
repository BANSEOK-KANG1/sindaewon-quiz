/**
 * 영어 짬짬이 — 단어 카드(300) · 문법 포인트 · 유형별 요령.
 * #/english · #/english/words(?day=N) · #/english/grammar · #/english/tips
 */
import WORDS from "../data/vocab-300-words.json";
import { GRAMMAR, TIPS } from "../data/english-notes.js";
import { TOPICS } from "../data/book-notes/topics.js";
import { INTERVIEW } from "../data/interview-cards.js";
import { PLAN_START, daysBetween, toDateKey } from "../data/daily-plan.js";
import { VOCAB_DAY_TRACKS } from "../data/study-curriculum.js";
import { getVocabState, gradeWord, dueWords, vocabSummary, MASTERED_BOX, getDeck, setDeck } from "../storage/vocab-cards.js";
import { navigate, getQuery } from "../router.js";
import { icon, hydrateIcons } from "../lib/icons.js";
import { isCover, coverItem, coverPair, coverToggle, bindCover } from "../lib/cover.js";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const split = (s) => {
  const i = s.indexOf("|");
  return [s.slice(0, i), s.slice(i + 1)];
};
const BY_NO = Object.fromEntries(WORDS.map((w) => [w.no, w]));
const DAYS = VOCAB_DAY_TRACKS.length; // 15일 × 20단어

function dayOf(no) {
  return Math.min(DAYS, Math.ceil(no / 20));
}

/** 오늘 계획의 단어 Day (11/9 = Day 1, 시작 전이면 Day 1) */
function planDay() {
  const i = daysBetween(PLAN_START, toDateKey());
  return Math.max(1, Math.min(DAYS, i + 1));
}

function bindLinks(root) {
  root.querySelectorAll("a[href^='#/']").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(a.getAttribute("href").slice(1));
    });
  });
}

export function studyTabs(active) {
  return `<nav class="notes-tabs" aria-label="짬짬이 학습">
    <a href="#/notes" class="${active === "bible" ? "active" : ""}">${icon("library-big")} 성경</a>
    <a href="#/english" class="${active === "english" ? "active" : ""}">${icon("languages")} 영어</a>
    <a href="#/interview" class="${active === "interview" ? "active" : ""}">${icon("graduation-cap")} 면접</a>
  </nav>`;
}

/* ───────────── 영어 홈 ───────────── */

export async function renderEnglish(root) {
  const sum = vocabSummary(WORDS.length);
  const { words } = getVocabState();
  const today = planDay();
  const g = getDeck("grammar");
  const t = getDeck("tips");

  const dayChips = VOCAB_DAY_TRACKS.map((track) => {
    const nos = WORDS.filter((w) => dayOf(w.no) === track.day).map((w) => w.no);
    const seen = nos.filter((n) => words[n]).length;
    const mastered = nos.filter((n) => words[n]?.box >= MASTERED_BOX).length;
    return `<a class="notes-book ${mastered === nos.length ? "read" : ""} ${track.day === today ? "reading" : ""}" href="#/english/words?day=${track.day}">
      <strong>${track.day === today ? "오늘 · " : ""}${track.label}</strong>
      <span>${esc(track.theme)}</span>
      <span>${seen ? `본 ${seen} · 외움 ${mastered}/${nos.length}` : `${nos.length}단어`}</span>
    </a>`;
  }).join("");

  root.innerHTML = `
    ${studyTabs("english")}
    <header class="page-header">
      <h1>영어 짬짬이</h1>
      <p class="muted">기출 영어의 절반 이상이 어휘 · 단어 10장이면 2~3분</p>
    </header>

    <section class="home-stat-strip notes-stats" aria-label="단어 현황">
      <div><span class="stat-icon">${icon("book-open")}</span><p><strong>${sum.seen}/${sum.total}</strong><span>본 단어</span></p></div>
      <div><span class="stat-icon">${icon("check-circle-2")}</span><p><strong>${sum.mastered}</strong><span>외운 단어</span></p></div>
      <div><span class="stat-icon">${icon("brain-circuit")}</span><p><strong>${sum.due}</strong><span>오늘 복습</span></p></div>
    </section>
    <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${Math.round((sum.mastered / sum.total) * 100)}%"></div></div>

    <section class="card notes-today">
      <p class="mode-kicker">단어 카드 · 복습할 단어 먼저, 그다음 오늘 Day ${today}</p>
      <a class="btn btn-primary btn-block" href="#/english/words">${icon("circle-play")} 단어 10장${sum.due ? ` · 복습 ${Math.min(sum.due, 10)}` : ""}</a>
      <p class="muted small" style="margin-top:0.5rem">알았어요 → 1·2·4·7일 뒤 다시 · 헷갈려요 → 오늘 다시. 세 번 연속 알면 '외움'</p>
    </section>

    <div class="card-grid">
      <a class="card notes-review-cta" href="#/english/grammar">
        <span class="stat-icon">${icon("list-checks")}</span>
        <span><strong>문법 포인트 ${GRAMMAR.length}장</strong><span class="muted small">기출 함정 위주 · ${g.done ? `${g.done}회독 · ` : ""}${g.max >= 0 ? `${Math.min(g.max + 1, GRAMMAR.length)}장까지 봄` : "1장에 1분"}</span></span>
        ${icon("chevron-right")}
      </a>
      <a class="card notes-review-cta" href="#/english/tips">
        <span class="stat-icon">${icon("target")}</span>
        <span><strong>유형별 요령 ${TIPS.length}장</strong><span class="muted small">동의어 · 단어 관계 · 빈칸 · 성경 영어 · 독해${t.done ? ` · ${t.done}회독` : ""}</span></span>
        ${icon("chevron-right")}
      </a>
    </div>

    <section class="notes-group">
      <h2>Day별 단어 <span class="muted small">20단어씩 · 계획과 같은 순서</span></h2>
      <div class="notes-grid notes-grid-wide">${dayChips}</div>
    </section>
  `;
  bindLinks(root);
}

/* ───────────── 단어 카드 ───────────── */

function buildQueue(day) {
  const { words } = getVocabState();
  const due = dueWords();
  const queue = [];
  const add = (no) => {
    if (queue.length < 10 && !queue.includes(no) && BY_NO[no]) queue.push(no);
  };
  if (day) {
    const nos = WORDS.filter((w) => dayOf(w.no) === day).map((w) => w.no);
    nos.filter((n) => due.includes(n)).forEach(add);
    nos.filter((n) => !words[n]).forEach(add);
    nos.filter((n) => words[n]?.box < MASTERED_BOX).forEach(add);
    nos.forEach(add);
    return queue;
  }
  due.forEach(add);
  const start = (planDay() - 1) * 20 + 1;
  // 오늘 Day의 새 단어 → 그 뒤 Day → 앞 Day 순서로 아직 안 본 단어
  const order = [...WORDS.filter((w) => w.no >= start), ...WORDS.filter((w) => w.no < start)];
  order.filter((w) => !words[w.no]).forEach((w) => add(w.no));
  return queue;
}

export async function renderWords(root) {
  const dayParam = Number(getQuery().get("day")) || 0;
  let queue = buildQueue(dayParam);
  const total = queue.length;
  const retried = new Set();
  let knew = 0;
  let flipped = false;

  function finish() {
    const sum = vocabSummary(WORDS.length);
    root.innerHTML = `
      <div class="notes-reader">
        <article class="card notes-card notes-done">
          <p class="notes-done-mark">✓</p>
          <h2>${total ? `단어 ${total}장 끝` : "오늘 볼 단어가 없어요"}</h2>
          <p class="muted">${total ? `바로 안 단어 ${knew}개 · ` : ""}외운 단어 ${sum.mastered}/${sum.total} · 남은 복습 ${sum.due}</p>
          <div class="notes-done-actions">
            <a class="btn btn-primary btn-block" href="#/english/words?${dayParam ? `day=${dayParam}&` : ""}again=${Date.now()}">${icon("circle-play")} 10장 더</a>
            <a class="btn btn-ghost btn-block" href="#/english">영어 홈</a>
          </div>
        </article>
      </div>`;
    bindLinks(root);
    hydrateIcons(root);
  }

  function render() {
    if (!queue.length) {
      finish();
      return;
    }
    const w = BY_NO[queue[0]];
    const state = getVocabState().words[w.no];
    root.innerHTML = `
      <div class="notes-reader">
        <header class="notes-reader-head">
          <a class="btn btn-ghost notes-back" href="#/english" aria-label="뒤로">←</a>
          <div class="notes-reader-title">
            <strong>단어 카드${dayParam ? ` · Day ${dayParam}` : ""}</strong>
            <span class="muted small">${total - queue.length + 1}/${total}${retried.size ? ` · 다시 ${retried.size}` : ""}</span>
          </div>
          ${state ? `<span class="notes-read-tag">${state.box >= MASTERED_BOX ? "외움" : `상자 ${state.box}`}</span>` : `<span class="notes-read-tag new">새 단어</span>`}
        </header>
        <div class="notes-dots" aria-hidden="true">
          ${Array.from({ length: total }, (_, i) => `<span class="${i < total - queue.length ? "past" : i === total - queue.length ? "now" : ""}"></span>`).join("")}
        </div>
        <button type="button" class="card notes-card vocab-card ${flipped ? "flipped" : ""}" data-flip>
          <span class="notes-group-label">Day ${dayOf(w.no)} · #${w.no}${w.source === "예상" ? " · 예상 어휘" : w.source ? ` · ${w.source.split("·").map((y) => `20${y}`).join("·")}학년도 기출` : ""}</span>
          <span class="vocab-word">${esc(w.word)}</span>
          <span class="muted">[${esc(w.pos)}]</span>
          ${
            flipped
              ? `<span class="vocab-meaning">${esc(w.meaning)}</span>
                 <span class="vocab-rel"><span class="syn">≈ ${esc(w.synonym)}</span><span class="ant">↔ ${esc(w.antonym)}</span></span>
                 <span class="vocab-example">${esc(w.example)}</span>`
              : `<span class="muted small vocab-hint">뜻·동의어를 떠올리고 탭</span>`
          }
        </button>
        <div class="notes-nav">
          ${
            flipped
              ? `<button type="button" class="btn btn-secondary" data-grade="0">헷갈려요</button>
                 <button type="button" class="btn btn-primary" data-grade="1">알았어요</button>`
              : `<button type="button" class="btn btn-primary btn-block" data-flip>뜻 보기</button>`
          }
        </div>
      </div>`;

    root.querySelectorAll("[data-flip]").forEach((el) =>
      el.addEventListener("click", () => {
        flipped = true;
        render();
      })
    );
    root.querySelectorAll("[data-grade]").forEach((el) =>
      el.addEventListener("click", () => {
        const ok = el.dataset.grade === "1";
        const no = queue.shift();
        gradeWord(no, ok);
        if (ok && !retried.has(no)) knew += 1;
        if (!ok && !retried.has(no)) {
          retried.add(no);
          queue.push(no); // 이번 묶음 끝에 한 번 더
        }
        flipped = false;
        render();
      })
    );
    bindLinks(root);
    hydrateIcons(root);
  }
  render();
}

/* ───────────── 문법 · 요령 카드 ───────────── */

/**
 * 문법 카드 가리기: 틀린 문장(✗)만 보여 주고 "어디가 틀렸나?"를 먼저 생각하게 한 뒤,
 * 규칙 · 맞는 문장(✓) · 함정을 하나씩 탭해서 확인한다.
 */
function grammarCoverCard(item) {
  return `
    ${item.x ? `<p class="notes-group-label">${esc(item.x)}</p>` : ""}
    <h3 class="notes-card-title eng-title">${esc(item.t)}</h3>
    <div class="notes-card-head"><span class="muted small">틀린 문장을 보고 이유와 고친 문장을 떠올리세요</span><button type="button" class="cover-all" data-cover-all>전부 보기</button></div>
    ${
      item.ng?.length
        ? `<ul class="eng-ex ng cover-ng">${item.ng.map((x) => `<li><span class="eng-mark">✗</span>${esc(x)}</li>`).join("")}</ul>`
        : ""
    }
    <ol class="notes-list cover-list">${item.r.map((x, i) => `<li>${coverPair(`규칙 ${i + 1}`, x)}</li>`).join("")}</ol>
    ${
      item.ok?.length
        ? `<ul class="notes-list cover-list cover-ok">${item.ok.map((x, i) => `<li>${coverPair(`✓ 맞는 문장 ${item.ok.length > 1 ? i + 1 : ""}`.trim(), x, "ok")}</li>`).join("")}</ul>`
        : ""
    }
    ${item.trap ? `<div class="cover-list">${coverPair("함정", item.trap, "trap")}</div>` : ""}`;
}

/** 예시 "A → B", "A = B"는 왼쪽을 단서로, 나머지는 '예시'로 가린다 */
function exampleCover(x) {
  const m = x.match(/^(.{1,40}?)\s*(→|=)\s*(.+)$/);
  return m ? coverPair(`${m[1]} ${m[2]}`, m[3], "ok") : coverPair("예시", x, "ok");
}

/** 유형별 요령 가리기: 요령은 앞부분을 단서로, 예시는 왼쪽만, 함정은 통째로 */
function tipsCoverCard(item) {
  return `
    <h3 class="notes-card-title eng-title">${esc(item.t)}</h3>
    <div class="notes-card-head"><span class="muted small">단서를 보고 요령을 먼저 떠올리세요</span><button type="button" class="cover-all" data-cover-all>전부 보기</button></div>
    <ol class="notes-list cover-list">${item.r.map((x) => `<li>${coverItem(x)}</li>`).join("")}</ol>
    ${item.ok?.length ? `<ul class="notes-list cover-list cover-ok">${item.ok.map((x) => `<li>${exampleCover(x)}</li>`).join("")}</ul>` : ""}
    ${item.trap ? `<div class="cover-list cover-ok">${coverPair("함정", item.trap, "trap")}</div>` : ""}`;
}

function deckCard(item, coverable = false, kind = "") {
  const cover = coverable && isCover();
  if (cover && kind === "grammar") return grammarCoverCard(item) + selfChecks(item);
  if (cover && kind === "tips") return tipsCoverCard(item) + selfChecks(item);
  const list = (arr, cls, mark) =>
    arr?.length ? `<ul class="eng-ex ${cls}">${arr.map((x) => `<li><span class="eng-mark">${mark}</span>${esc(x)}</li>`).join("")}</ul>` : "";
  return `
    ${item.x ? `<p class="notes-group-label">${esc(item.x)}</p>` : ""}
    <h3 class="notes-card-title eng-title">${esc(item.t)}</h3>
    ${cover ? `<div class="notes-card-head"><span></span><button type="button" class="cover-all" data-cover-all>전부 보기</button></div>` : ""}
    <ol class="notes-list ${cover ? "cover-list" : ""}">${item.r.map((x) => `<li>${cover ? coverItem(x) : esc(x)}</li>`).join("")}</ol>
    ${list(item.ok, "ok", "✓")}
    ${list(item.ng, "ng", "✗")}
    ${item.trap ? `<p class="eng-trap"><strong>함정</strong> ${esc(item.trap)}</p>` : ""}
    ${selfChecks(item)}`;
}

function selfChecks(item) {
  return `${
      item.q?.length
        ? `<ul class="notes-checks">${item.q
            .map(split)
            .map(
              ([q, a]) => `<li><button type="button" class="notes-reveal" aria-expanded="false">
                <span class="notes-q">Q. ${esc(q)}</span>
                <span class="notes-a"><span class="hidden-label">답 보기</span><span class="answer">${esc(a)}</span></span>
              </button></li>`
            )
            .join("")}</ul>`
        : ""
    }`;
}

const DECK_FINISH = {
  grammar: { href: `#/quiz?auto=1&mode=study&tags=${encodeURIComponent("문법")}&subject=${encodeURIComponent("영어")}&seminary=chongshin&count=10`, label: "문법 문제 10개 풀기" },
  tips: { href: `#/quiz?auto=1&mode=study&tags=${encodeURIComponent("원문기출")}&subject=${encodeURIComponent("영어")}&seminary=chongshin&count=10`, label: "원문기출 영어 10개 풀기" },
  topics: { href: "#/review", label: "짬짬이 복습 10장" },
  interview: { href: "#/plan", label: "계획으로" },
};

export function renderDeck(root, name, title, items, back = "#/english") {
  let index = Math.min(getDeck(name).pos, items.length - 1);
  const coverable = name === "topics" || name === "grammar" || name === "tips"; // 면접 카드만 빼고 가린다

  function render() {
    const done = index >= items.length;
    setDeck(name, index, items.length);
    root.innerHTML = `
      <div class="notes-reader">
        <header class="notes-reader-head">
          <a class="btn btn-ghost notes-back" href="${back}" aria-label="뒤로">←</a>
          <div class="notes-reader-title">
            <strong>${title}</strong>
            <span class="muted small">${done ? "완료" : `${index + 1}/${items.length}`}</span>
          </div>
          ${coverable && !done ? coverToggle() : ""}
        </header>
        <div class="notes-dots" aria-hidden="true">
          ${items.map((_, i) => `<span class="${i < index ? "past" : i === index ? "now" : ""}"></span>`).join("")}
        </div>
        <article class="card notes-card">
          ${
            done
              ? `<div class="notes-done">
                  <p class="notes-done-mark">✓</p>
                  <h2>${title} ${items.length}장 끝</h2>
                  <p class="muted">${getDeck(name).done}회독</p>
                  <div class="notes-done-actions">
                    <a class="btn btn-primary btn-block" href="${DECK_FINISH[name].href}">${icon("circle-play")} ${DECK_FINISH[name].label}</a>
                    <a class="btn btn-ghost btn-block" href="${back}">돌아가기</a>
                  </div>
                </div>`
              : deckCard(items[index], coverable, name)
          }
        </article>
        ${
          done
            ? ""
            : `<div class="notes-nav">
                <button type="button" class="btn btn-ghost" data-nav="prev" ${index === 0 ? "disabled" : ""}>← 이전</button>
                <button type="button" class="btn btn-primary" data-nav="next">${index === items.length - 1 ? "완료 ✓" : "다음 →"}</button>
              </div>`
        }
      </div>`;
    root.querySelectorAll(".notes-reveal").forEach((btn) =>
      btn.addEventListener("click", () => btn.setAttribute("aria-expanded", String(btn.getAttribute("aria-expanded") !== "true")))
    );
    bindCover(root, render);
    root.querySelectorAll("[data-nav]").forEach((btn) =>
      btn.addEventListener("click", () => {
        if (btn.dataset.nav === "next") index += 1;
        else if (index > 0) index -= 1;
        render();
      })
    );
    bindLinks(root);
    hydrateIcons(root);
    window.scrollTo({ top: 0 });
  }

  let sx = null;
  let sy = null;
  root.ontouchstart = (e) => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  };
  root.ontouchend = (e) => {
    if (sx === null || index >= items.length) return;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) index += 1;
      else if (index > 0) index -= 1;
      render();
    }
  };
  render();
}

export async function renderGrammar(root) {
  renderDeck(root, "grammar", "문법 포인트", GRAMMAR);
}

export async function renderTips(root) {
  renderDeck(root, "tips", "유형별 요령", TIPS);
}

/* ───────────── 주제별 핵심 · 면접 질문 ───────────── */

export async function renderTopics(root) {
  renderDeck(root, "topics", "주제별 핵심", TOPICS, "#/notes");
}

export async function renderInterview(root) {
  const d = getDeck("interview");
  if (getQuery().get("start")) {
    renderDeck(root, "interview", "면접 질문", INTERVIEW, "#/interview");
    return;
  }
  root.innerHTML = `
    ${studyTabs("interview")}
    <header class="page-header">
      <h1>면접 질문 카드</h1>
      <p class="muted">질문을 보고 소리 내어 1분 · 답 보기는 일반적인 방향만</p>
    </header>
    <section class="card notes-today">
      <p class="mode-kicker">${INTERVIEW.length}장 · ${d.done ? `${d.done}회독 · ` : ""}${d.max >= 0 ? `${Math.min(d.max + 1, INTERVIEW.length)}장까지 봄` : "처음부터"}</p>
      <a class="btn btn-primary btn-block" href="#/interview?start=1">${icon("circle-play")} ${d.pos ? "이어서" : "시작"}</a>
      <p class="muted small" style="margin-top:0.6rem">내 답변 초안은 SSD의 면접준비.md에 있어요. 앱은 공개 웹에도 배포되므로 개인 답변은 넣지 않았습니다.</p>
    </section>
    <section class="notes-group">
      <h2>카드 목록</h2>
      <ol class="notes-list">${INTERVIEW.map((c) => `<li><strong>${esc(c.t)}</strong> <span class="muted small">${esc(c.x)} · 질문 ${c.r.length}</span></li>`).join("")}</ol>
    </section>`;
  bindLinks(root);
}
