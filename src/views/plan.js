import {
  buildPlan,
  stepKey,
  toDateKey,
  dDay,
  daysBetween,
  formatDateLabel,
  nextPlanStep,
  focusDay,
  EXAMS,
  MILESTONES,
  PHASES,
} from "../data/daily-plan.js";
import { getPlanProgress, setPlanStepDone } from "../storage/progress.js";
import { navigate } from "../router.js";
import { syncReadSteps, firstUnread } from "../storage/notes-progress.js";

const MODE_LABEL = { study: "학습", exam: "시험", flash: "플래시" };

function stepMeta(s) {
  if (s.kind === "manual") return "직접 체크";
  if (s.kind === "wrong") return "오답노트";
  if (s.kind === "read") return `핵심 카드 · ${s.books.length}권`;
  return `${MODE_LABEL[s.mode] || "학습"} · ${s.count}문항`;
}

function renderStep(day, s, done, todayKey, prefix = "") {
  const key = stepKey(day.date, s.id);
  const rec = done[key];
  const result = rec?.total ? ` · ${rec.correct}/${rec.total}` : rec?.skipped ? ` · ${rec.skipped}` : "";
  const action =
    s.kind === "read"
      ? `<a class="btn ${rec ? "btn-ghost" : day.date === todayKey ? "btn-primary" : "btn-secondary"} plan-go" href="#/notes/${encodeURIComponent(firstUnread(s.books))}?from=plan">${rec ? "다시" : "읽기"}</a>`
      : s.kind === "manual"
      ? `<label class="plan-manual"><input type="checkbox" data-plan-toggle="${key}" ${rec ? "checked" : ""}/> 완료</label>`
      : `<a class="btn ${rec ? "btn-ghost" : day.date === todayKey ? "btn-primary" : "btn-secondary"} plan-go" href="#/quiz?plan=${encodeURIComponent(key)}">${rec ? "다시" : "시작"}</a>`;
  return `
    <li class="plan-step ${rec ? "done" : ""}">
      <span class="plan-check">${rec ? "✓" : ""}</span>
      <div class="plan-step-info">
        <strong>${prefix}${s.label}</strong>
        <span class="muted small">${s.detail}</span>
        <span class="topic-meta">${stepMeta(s)}${s.minutes ? ` · 약 ${s.minutes}분` : ""}${result}</span>
      </div>
      ${action}
    </li>`;
}

function renderDay(day, done, todayKey, open = false) {
  const doneCount = day.steps.filter((s) => done[stepKey(day.date, s.id)]).length;
  const isToday = day.date === todayKey;
  const isPast = day.date < todayKey;
  const complete = doneCount === day.steps.length;
  const status = complete ? "plan-day-complete" : isPast && doneCount < day.steps.length ? "plan-day-missed" : "";
  return `
    <details class="plan-day ${isToday ? "plan-day-today" : ""} ${status}" ${open ? "open" : ""} id="day-${day.date}">
      <summary>
        <span class="plan-day-date">${formatDateLabel(day.date)}</span>
        <span class="plan-day-title">${isToday ? `<span class="plan-today-tag">오늘</span>` : ""}${day.examDay ? "🎯 " : ""}${day.title}</span>
        <span class="plan-day-count">${complete ? "완료" : `${doneCount}/${day.steps.length}`}</span>
      </summary>
      <ol class="plan-step-list">
        ${day.steps.map((s) => renderStep(day, s, done, todayKey)).join("")}
      </ol>
    </details>`;
}

export async function renderPlan(root) {
  syncReadSteps(buildPlan(getPlanProgress().startDate));
  const progress = getPlanProgress();
  const plan = buildPlan(progress.startDate);
  const todayKey = toDateKey();
  const done = progress.done;
  const today = focusDay(plan, todayKey);
  const next = nextPlanStep(plan, done, todayKey);

  const allSteps = plan.flatMap((d) => d.steps.map((s) => ({ d, s })));
  const totalDone = allSteps.filter(({ d, s }) => done[stepKey(d.date, s.id)]).length;
  const missed = allSteps.filter(
    ({ d, s }) => d.date < todayKey && s.kind !== "manual" && !done[stepKey(d.date, s.id)]
  );
  const pct = allSteps.length ? Math.round((totalDone / allSteps.length) * 100) : 0;

  const phaseRanges = Object.values(PHASES)
    .map((p) => {
      const days = plan.filter((d) => d.phase === p.id && !d.examDay);
      if (!days.length) return "";
      const current = today?.phase === p.id;
      return `
        <li class="plan-phase ${current ? "current" : ""}">
          <strong>${p.label}</strong>
          <span class="muted small">${formatDateLabel(days[0].date)} – ${formatDateLabel(days[days.length - 1].date)} · ${days.length}일</span>
          <span class="small">${p.goal}</span>
        </li>`;
    })
    .join("");

  const weeks = [];
  for (const d of plan) {
    if (!weeks[d.week - 1]) weeks[d.week - 1] = [];
    weeks[d.week - 1].push(d);
  }
  const currentWeek = today?.week || 1;

  const upcoming = MILESTONES.filter((m) => daysBetween(todayKey, m.date) >= 0).slice(0, 4);

  root.innerHTML = `
    <header class="page-header">
      <a class="text-link" href="#/plan">← 진도로</a>
      <h1>날짜별 예시 일정</h1>
      <p class="muted">${formatDateLabel(plan[0].date)} – ${formatDateLabel(plan[plan.length - 1].date)} · ${plan.length}일 · ${totalDone}/${allSteps.length}단계 완료</p>
    </header>

    <div class="plan-dday">
      <div class="plan-dday-item"><span>${EXAMS.chongshin.label}</span><strong>${dDay(todayKey, EXAMS.chongshin.date)}</strong></div>
    </div>
    <p class="muted small plan-total-label">전체 진행 ${pct}%${missed.length ? ` · 밀린 단계 ${missed.length}` : ""}</p>
    <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${pct}%"></div></div>

    ${
      today
        ? `<section class="strategy-card card plan-today">
            <p class="mode-kicker">${today.preview ? "시작 전 · 미리 보기" : "오늘"} · ${today.dayNo}일차 · ${PHASES[today.phase]?.label || ""}</p>
            <h2 class="strategy-title">${today.title}</h2>
            <p class="muted small">약 ${today.minutes}분 · 위에서부터 순서대로</p>
            <ol class="plan-step-list">
              ${today.steps.map((s) => renderStep(today, s, done, todayKey)).join("")}
            </ol>
            ${
              next
                ? `<a class="btn btn-primary btn-block" href="#/quiz?plan=next">다음 학습 · ${next.step.label}</a>`
                : `<p class="muted small">오늘 퀴즈 단계는 모두 끝났습니다.</p>`
            }
          </section>`
        : `<section class="card"><p class="muted">오늘은 계획 기간 밖입니다.</p></section>`
    }

    ${
      missed.length
        ? `<section class="card plan-missed">
            <h2>밀린 학습 ${missed.length}단계</h2>
            <p class="muted small">오늘 계획을 먼저 하고, 시간이 남으면 오래된 것부터</p>
            <ol class="plan-step-list">
              ${missed
                .slice(0, 5)
                .map(({ d, s }) => renderStep(d, s, done, todayKey, `${formatDateLabel(d.date)} · `))
                .join("")}
            </ol>
          </section>`
        : ""
    }

    <section class="card">
      <h2>단계별 목표</h2>
      <ol class="plan-phases">${phaseRanges}</ol>
    </section>

    ${
      upcoming.length
        ? `<section class="card">
            <h2>다가오는 일정</h2>
            <ul class="plan-milestones">
              ${upcoming
                .map((m) => `<li><strong>${formatDateLabel(m.date)}</strong> ${m.label} <span class="muted small">${m.detail} · ${dDay(todayKey, m.date)}</span></li>`)
                .join("")}
            </ul>
          </section>`
        : ""
    }

    <section class="plan-weeks">
      ${weeks
        .map((days, i) => {
          const wDone = days.reduce((n, d) => n + d.steps.filter((s) => done[stepKey(d.date, s.id)]).length, 0);
          const wTotal = days.reduce((n, d) => n + d.steps.length, 0);
          return `
            <details class="card plan-week" ${i + 1 === currentWeek ? "open" : ""}>
              <summary>
                <strong>${i + 1}주차</strong>
                <span class="muted small">${formatDateLabel(days[0].date)} – ${formatDateLabel(days[days.length - 1].date)} · ${wDone}/${wTotal}</span>
              </summary>
              ${days.map((d) => renderDay(d, done, todayKey, false)).join("")}
            </details>`;
        })
        .join("")}
    </section>

    <p class="muted small" style="margin-top:1rem">
      시험일에 맞춘 고정 일정입니다. 평일에 못 끝낸 단계는 '밀린 학습'에 남으니 주말에 채우고, 11/23부터는 새 문제 대신 오답만 봅니다.
    </p>
  `;

  root.querySelectorAll("[data-plan-toggle]").forEach((box) => {
    box.addEventListener("change", () => {
      setPlanStepDone(box.dataset.planToggle, box.checked);
      renderPlan(root);
    });
  });


  root.querySelectorAll("a[href^='#/']").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(a.getAttribute("href").slice(1));
    });
  });
}