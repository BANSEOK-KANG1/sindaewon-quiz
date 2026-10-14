import { UI } from "./config.js";
import { registerRoute, startRouter, navigate } from "./router.js";
import { renderHome } from "./views/home.js";
import { renderAdmissions } from "./views/admissions.js";
import { renderBrowse } from "./views/browse.js";
import { renderQuestion } from "./views/question.js";
import { renderQuiz } from "./views/quiz.js";
import { renderWrongNote } from "./views/wrong-note.js";
import { renderSources } from "./views/sources.js";
import { renderPlan } from "./views/plan.js";
import { hydrateIcons, icon } from "./lib/icons.js";

import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";

const app = document.querySelector("#app");

const NAV = [
  { hash: "#/", label: UI.nav.home, icon: "house" },
  { hash: "#/plan", label: UI.nav.plan, icon: "calendar-days" },
  { hash: "#/quiz", label: UI.nav.quiz, icon: "circle-play" },
  { hash: "#/wrong-note", label: UI.nav.wrongNote, icon: "notebook-pen" },
  { hash: "#/browse", label: UI.nav.browse, icon: "search" },
  { hash: "#/admissions", label: UI.nav.admissions, icon: "graduation-cap" },
  { hash: "#/sources", label: UI.nav.sources, icon: "files" },
];

// 하단 탭은 5개까지 — 입시 가이드·자료는 홈과 사이드 메뉴에서 연다.
const BOTTOM_NAV = NAV.filter((item) => item.hash !== "#/sources" && item.hash !== "#/admissions");

function shell(contentHtml) {
  const current = window.location.hash || "#/";
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" aria-label="주 메뉴">
        <a href="#/" class="brand" aria-label="${UI.appTitle} 홈">
          <span class="brand-icon">${icon("graduation-cap")}</span>
          <span><strong>${UI.appTitle}</strong><small>SEMINARY PREP</small></span>
        </a>
        <nav class="side-nav">
          ${NAV.map(
            (n) =>
              `<a href="${n.hash}" class="nav-link ${isActive(n.hash, current) ? "active" : ""}">${icon(n.icon)}<span>${n.label}</span></a>`
          ).join("")}
        </nav>
        <div class="sidebar-note">
          ${icon("sparkles")}
          <p><strong>날짜별 학습 계획</strong><span>총신 11/28 · 장신 12/10까지 하루 단위</span></p>
          <a href="#/plan">계획 보기 ${icon("chevron-right")}</a>
        </div>
      </aside>
      <main class="main" id="view-root">${contentHtml}</main>
      <nav class="bottom-nav" aria-label="하단 메뉴">
        ${BOTTOM_NAV.map(
          (n) =>
            `<a href="${n.hash}" class="bottom-link ${isActive(n.hash, current) ? "active" : ""}"><span class="icon">${icon(n.icon)}</span><span>${n.label === UI.nav.admissions ? "입시" : n.label}</span></a>`
        ).join("")}
      </nav>
    </div>
  `;

  app.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(a.getAttribute("href").slice(1));
    });
  });

  return app.querySelector("#view-root");
}

function isActive(hash, current) {
  if (hash === "#/") return current === "#/" || current === "";
  return current.startsWith(hash.replace("#", "#"));
}

async function renderView(matched) {
  const root = shell('<p class="loading">불러오는 중…</p>');
  try {
    if (matched.path.startsWith("/question/")) {
      await renderQuestion(root, matched.params);
    } else if (matched.path === "/admissions") {
      await renderAdmissions(root);
    } else if (matched.path === "/browse" || matched.path.startsWith("/browse")) {
      await renderBrowse(root);
    } else if (matched.path === "/quiz" || matched.path.startsWith("/quiz")) {
      await renderQuiz(root);
    } else if (matched.path === "/wrong-note") {
      await renderWrongNote(root);
    } else if (matched.path === "/sources") {
      await renderSources(root);
    } else if (matched.path === "/plan") {
      await renderPlan(root);
    } else {
      await renderHome(root);
    }
    hydrateIcons(app);
  } catch (err) {
    root.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

registerRoute("/", () => {});
registerRoute("/admissions", () => {});
registerRoute("/browse", () => {});
registerRoute("/question/:id", () => {});
registerRoute("/quiz", () => {});
registerRoute("/wrong-note", () => {});
registerRoute("/sources", () => {});
registerRoute("/plan", () => {});

startRouter(renderView);

// Service Worker: 웹(PWA)만 — Capacitor 네이티브에서는 미등록
const isNativeApp =
  window.Capacitor?.isNativePlatform?.() === true ||
  window.location.protocol.startsWith("capacitor");

if ("serviceWorker" in navigator && !isNativeApp) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
