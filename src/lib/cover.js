/**
 * 가리기 모드 — 카드 항목의 설명을 가려 두고, 먼저 떠올린 뒤 탭해서 확인한다.
 * 설정은 기기에 기억한다.
 */
const KEY = "sindaewon-quiz:cover-mode";

export function isCover() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setCover(on) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* 무시 */
  }
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** 항목을 '보이는 단서'와 '가릴 부분'으로 나눈다: " — " → ": " → " · " → 첫 낱말 */
export function coverSplit(text) {
  for (const sep of [" — ", ": ", " · "]) {
    const i = text.indexOf(sep);
    if (i > 0 && i < 48) return [text.slice(0, i), text.slice(i + sep.length), sep.trim()];
  }
  const sp = text.indexOf(" ");
  if (sp > 0 && sp < 24) return [text.slice(0, sp), text.slice(sp + 1), ""];
  return ["", text, ""];
}

/** 가리기 항목 HTML (버튼) */
export function coverItem(text) {
  const [head, tail, sep] = coverSplit(text);
  return `<button type="button" class="cover-item" aria-expanded="false">
    ${head ? `<strong class="cover-head">${esc(head)}${sep && sep !== "·" ? ` ${esc(sep)}` : ""}</strong>` : ""}
    <span class="cover-tail">${esc(tail)}</span>
    <span class="cover-mask" aria-hidden="true">떠올리고 탭</span>
  </button>`;
}

/** 단서를 직접 정한 가리기 항목 (문법 카드용) */
export function coverPair(head, tail, cls = "") {
  return `<button type="button" class="cover-item ${cls}" aria-expanded="false">
    <strong class="cover-head">${esc(head)}</strong>
    <span class="cover-tail">${esc(tail)}</span>
    <span class="cover-mask" aria-hidden="true">떠올리고 탭</span>
  </button>`;
}

/** 가리기 토글 버튼 */
export function coverToggle() {
  const on = isCover();
  return `<button type="button" class="cover-toggle ${on ? "on" : ""}" data-cover-toggle aria-pressed="${on}">${on ? "가리기 켬" : "가리기"}</button>`;
}

/** 이벤트 연결: 항목 탭으로 펼치기, '전부 보기', 토글 */
export function bindCover(root, rerender) {
  root.querySelectorAll(".cover-item").forEach((btn) =>
    btn.addEventListener("click", () => btn.setAttribute("aria-expanded", String(btn.getAttribute("aria-expanded") !== "true")))
  );
  root.querySelectorAll("[data-cover-all]").forEach((btn) =>
    btn.addEventListener("click", () => root.querySelectorAll(".cover-item").forEach((b) => b.setAttribute("aria-expanded", "true")))
  );
  root.querySelectorAll("[data-cover-toggle]").forEach((btn) =>
    btn.addEventListener("click", () => {
      setCover(!isCover());
      rerender();
    })
  );
}
