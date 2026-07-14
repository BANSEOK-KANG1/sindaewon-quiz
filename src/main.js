import { UI } from "./config.js";
import { registerRoute, startRouter, navigate } from "./router.js";
import { renderHome } from "./views/home.js";
import { renderBrowse } from "./views/browse.js";
import { renderQuestion } from "./views/question.js";
import { renderQuiz } from "./views/quiz.js";
import { renderWrongNote } from "./views/wrong-note.js";
import { renderSources } from "./views/sources.js";

import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";

const app = document.querySelector("#app");

const NAV = [
  { hash: "#/", label: UI.nav.home, icon: "⌂" },
  { hash: "#/browse", label: UI.nav.browse, icon: "☰" },
  { hash: "#/quiz", label: UI.nav.quiz, icon: "▶" },
  { hash: "#/wrong-note", label: UI.nav.wrongNote, icon: "✎" },
  { hash: "#/sources", label: UI.nav.sources, icon: "↗" },
];

function shell(contentHtml) {
  const current = window.location.hash || "#/";
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" aria-label="주 메뉴">
        <div class="brand">${UI.appTitle}</div>
        <nav class="side-nav">
          ${NAV.map(
            (n) =>
              `<a href="${n.hash}" class="nav-link ${current.startsWith(n.hash.replace(/\/$/, "")) || (n.hash === "#/" && current === "#/") ? "active" : ""}">${n.label}</a>`
          ).join("")}
        </nav>
      </aside>
      <main class="main" id="view-root">${contentHtml}</main>
      <nav class="bottom-nav" aria-label="하단 메뉴">
        ${NAV.map(
          (n) =>
            `<a href="${n.hash}" class="bottom-link ${isActive(n.hash, current) ? "active" : ""}"><span class="icon">${n.icon}</span><span>${n.label}</span></a>`
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
    } else if (matched.path === "/browse" || matched.path.startsWith("/browse")) {
      await renderBrowse(root);
    } else if (matched.path === "/quiz" || matched.path.startsWith("/quiz")) {
      await renderQuiz(root);
    } else if (matched.path === "/wrong-note") {
      await renderWrongNote(root);
    } else if (matched.path === "/sources") {
      await renderSources(root);
    } else {
      await renderHome(root);
    }
  } catch (err) {
    root.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

registerRoute("/", () => {});
registerRoute("/browse", () => {});
registerRoute("/question/:id", () => {});
registerRoute("/quiz", () => {});
registerRoute("/wrong-note", () => {});
registerRoute("/sources", () => {});

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
