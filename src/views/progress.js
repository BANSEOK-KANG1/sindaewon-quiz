/**
 * 진도 — 시험 준비 전체를 100%로 보고, 오늘 몇 % 하면 되는지 보여 준다.
 * 무엇을 할지는 사용자가 고른다. 날짜별 예시 일정은 #/plan/daily.
 */
import { loadQuestions } from "../data/questions.js";
import { dueWrongNotes } from "../storage/progress.js";
import { buildTracks, pace, recommended, wrongCount, EXAM_DATE } from "../data/progress-model.js";
import { dDay, toDateKey } from "../data/daily-plan.js";
import { navigate } from "../router.js";
import { icon } from "../lib/icons.js";

const pct1 = (n) => `${(Math.round(n * 10) / 10).toFixed(1)}%`;
const hm = (min) => {
  const m = Math.round(min);
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  return `${h}시간${m % 60 ? ` ${m % 60}분` : ""}`;
};

function trackCard(t, rec) {
  const ratio = t.total ? Math.min(100, (t.done / t.total) * 100) : 100;
  const left = Math.max(0, t.minutes - t.doneMinutes);
  const complete = t.done >= t.total;
  return `
    <article class="track-card ${complete ? "complete" : ""}">
      <div class="track-top">
        <div class="track-title">
          <strong>${t.label}</strong>
          ${rec ? `<span class="track-badge">추천</span>` : ""}
          ${complete ? `<span class="track-badge done">완료</span>` : ""}
        </div>
        <span class="track-pct">${Math.round(ratio)}%</span>
      </div>
      <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${ratio}%"></div></div>
      <div class="track-bottom">
        <span class="muted small">${t.done}/${t.total}${t.unit} · ${complete ? "다 했어요" : `남은 약 ${hm(left)}`}${t.note ? ` · ${t.note}` : ""}</span>
        <a class="btn ${rec ? "btn-primary" : "btn-secondary"} track-go" href="${t.href}">${complete ? "다시" : "시작"}</a>
      </div>
    </article>`;
}

export async function renderProgress(root) {
  const questions = await loadQuestions();
  const tracks = buildTracks(questions);
  const p = pace(tracks);
  const rec = recommended(tracks);
  const wrong = wrongCount();
  const todayKey = toDateKey();
  const metToday = p.remainingToday <= 0.05;

  const groups = ["성경", "영어", "면접"].map((g) => ({ g, list: tracks.filter((t) => t.group === g) }));
  const groupPct = (list) => {
    const tot = list.reduce((n, t) => n + t.minutes, 0);
    const done = list.reduce((n, t) => n + Math.min(t.doneMinutes, t.minutes), 0);
    return tot ? (done / tot) * 100 : 0;
  };

  root.innerHTML = `
    <header class="page-header">
      <h1>진도</h1>
      <p class="muted">총신 ${dDay(todayKey, EXAM_DATE)} · 11/27까지 100%가 목표 · 무엇을 할지는 직접 고르세요</p>
    </header>

    <section class="card progress-hero">
      <div class="progress-hero-main">
        <div class="today-ring progress-ring" style="--progress:${Math.round(p.pct)}">
          <div><strong>${pct1(p.pct)}</strong><span>전체</span></div>
        </div>
        <div class="progress-hero-copy">
          <p class="mode-kicker">${p.daysLeft}일 남음 · 남은 양 약 ${hm(p.leftMinutes)}</p>
          <h2>${metToday ? "오늘 몫은 채웠어요" : `오늘 <span class="accent">+${pct1(p.remainingToday)}</span> 더 하면 페이스 유지`}</h2>
          <p class="muted small">오늘 목표 +${pct1(p.target)} (약 ${hm(p.targetMinutes)}) · 오늘 한 것 +${pct1(p.doneToday)}</p>
        </div>
      </div>
      <div class="pace-bar" aria-label="오늘 목표 대비">
        <div class="pace-fill" style="width:${p.todayRatio}%"></div>
      </div>
      <div class="pace-line">
        <div class="pace-overall">
          <div class="pace-overall-fill" style="width:${p.pct}%"></div>
          <span class="pace-marker" style="left:${p.idealEnd}%" title="오늘 끝 예정 진도"></span>
        </div>
        <p class="muted small">${
          p.ahead >= 0
            ? `오늘 끝 예정(${pct1(p.idealEnd)})보다 <strong class="ok">${pct1(p.ahead)} 앞서</strong> 있어요`
            : `오늘 끝 예정 ${pct1(p.idealEnd)} · 지금 ${pct1(p.pct)} — <strong class="behind">${pct1(-p.ahead)} 뒤처짐</strong>`
        } · 남은 날 하루 평균 약 ${hm(p.minutesPerDay)}</p>
      </div>
    </section>

    ${
      wrong
        ? `<a class="card notes-review-cta" href="#/wrong-note">
            <span class="stat-icon">${icon("notebook-pen")}</span>
            <span><strong>오답 ${wrong}개</strong><span class="muted small">오늘 복습 ${dueWrongNotes().length}개 · 진도 %에는 안 들어가요</span></span>
            ${icon("chevron-right")}
          </a>`
        : ""
    }

    ${groups
      .map(
        ({ g, list }) => `
      <section class="track-group">
        <h2>${g} <span class="muted small">${Math.round(groupPct(list))}%</span></h2>
        ${list.map((t) => trackCard(t, rec.has(t.id))).join("")}
      </section>`
      )
      .join("")}

    <p class="muted small" style="margin-top:1rem">
      전체 %는 항목마다 걸리는 시간으로 가중한 값이에요. 문제는 한 번 풀면, 카드는 한 번 넘기면 진도에 들어가요.
      '추천'은 그룹에서 가장 덜 한 항목일 뿐이니 하고 싶은 것부터 하세요.
    </p>
    <a class="text-link" href="#/plan/daily">날짜별 예시 일정 보기 ${icon("chevron-right")}</a>
  `;

  root.querySelectorAll("a[href^='#/']").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(a.getAttribute("href").slice(1));
    });
  });
}
