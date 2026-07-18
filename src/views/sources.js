import { LINKS, SEMINARIES } from "../config.js";
import { loadQuestions, clearQuestionsCache } from "../data/questions.js";
import { getCollectionChecklist, toggleCollectionItem } from "../storage/progress.js";
import {
  addPastedQuestions,
  getPastedQuestions,
  previewPaste,
} from "../storage/pasted-questions.js";

const CHECKLIST = [
  { id: "cs-bible-2016", label: "총신 성경 2016" },
  { id: "cs-bible-2017", label: "총신 성경 2017" },
  { id: "cs-bible-2018", label: "총신 성경 2018" },
  { id: "cs-bible-2019", label: "총신 성경 2019" },
  { id: "cs-bible-2020", label: "총신 성경 2020–22 원문" },
  { id: "cs-english-recent", label: "총신 영어 (최근 연도)" },
  { id: "cs-bank-2026", label: "총신 성경고사 문제은행 2026" },
  { id: "js-bible-book", label: "장신 구약 문제집 PDF (300문항 반영)" },
  { id: "js-bible-answers", label: "장신 정답지 (미수집)" },
  { id: "community-verify", label: "커뮤니티 자료 교차검증" },
];

export async function renderSources(root) {
  const questions = await loadQuestions();
  const checklist = getCollectionChecklist();
  const done = CHECKLIST.filter((c) => checklist[c.id]).length;
  const pastedCount = getPastedQuestions().length;

  root.innerHTML = `
    <header class="page-header">
      <h1>자료 모으기</h1>
      <p class="muted">앱에 ${questions.length}문항 등록됨 (붙여넣기 ${pastedCount} · JSON ${questions.length - pastedCount}) · 수집 체크 ${done}/${CHECKLIST.length}</p>
    </header>
    <section class="card">
      <h2>공식·참고 링크</h2>
      <ul class="link-list">
        <li><a href="${LINKS.quizlet}" target="_blank" rel="noopener">Quizlet — 총신 기출 세트 (103234634)</a></li>
        <li><a href="${LINKS.quizletOtShort}" target="_blank" rel="noopener">Quizlet — 구약 단답 (44561581)</a></li>
        <li><a href="${LINKS.quizletOtMc}" target="_blank" rel="noopener">Quizlet — 구약 객관식 (44632793)</a></li>
        <li><a href="${LINKS.quizletEnglish}" target="_blank" rel="noopener">Quizlet — 영어 (893342880)</a></li>
        <li><a href="${LINKS.cstsent}" target="_blank" rel="noopener">총신 신학대학원 입시 (cstsent)</a></li>
        <li><a href="${LINKS.puts}" target="_blank" rel="noopener">장로회신학대 신대원 학사안내 (puts)</a></li>
        <li><a href="${LINKS.chongshinAdmissions}" target="_blank" rel="noopener">총신대 입학정보</a></li>
      </ul>
    </section>
    <section class="card">
      <h2>붙여넣기로 추가</h2>
      <p class="muted small">해피캠퍼스 <code>-문제?(정답)</code>, Quizlet 단답(문제/정답 줄), 객관식(1. … ①②) 형식을 지원합니다.</p>
      <form id="paste-form" class="paste-form">
        <label class="grow">
          <span>내용</span>
          <textarea name="paste" rows="8" placeholder="-여호와 이레?(하나님이 제공하시리라)&#10;또는&#10;문제 줄&#10;정답 줄"></textarea>
        </label>
        <div class="filter-bar">
          <label>
            <span>신학대</span>
            <select name="seminary">
              ${Object.values(SEMINARIES)
                .map((s) => `<option value="${s.id}">${s.shortName}</option>`)
                .join("")}
            </select>
          </label>
          <label>
            <span>과목</span>
            <select name="subject" id="paste-subject">
              <option value="성경">성경</option>
              <option value="영어">영어</option>
            </select>
          </label>
          <label>
            <span>형식</span>
            <select name="type">
              <option value="auto">자동 감지</option>
              <option value="happycampus">해피캠퍼스 한 줄</option>
              <option value="flashcard">단답 플래시카드</option>
              <option value="multiple">객관식</option>
            </select>
          </label>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-ghost" id="paste-preview">미리보기</button>
          <button type="submit" class="btn btn-primary" id="paste-save">저장</button>
        </div>
      </form>
      <div id="paste-preview-box" class="paste-preview hidden"></div>
    </section>
    <section class="card">
      <h2>문제 추가 방법 (CLI)</h2>
      <ol class="numbered">
        <li><code>scripts/quizlet-bible.txt</code> · <code>quizlet-english.txt</code> · <code>quizlet-bible-ot-short.txt</code> 형식으로 편집</li>
        <li><code>npm run import</code> 또는 <code>node scripts/import-paste.js &lt; pasted.txt</code></li>
        <li>개발 서버 새로고침 (붙여넣기는 브라우저 저장소에 즉시 반영)</li>
      </ol>
    </section>
    <section class="card">
      <h2>수집 체크리스트</h2>
      <ul class="checklist" id="collection-list">
        ${CHECKLIST.map(
          (item) => `
          <li>
            <label class="check-row">
              <input type="checkbox" data-id="${item.id}" ${checklist[item.id] ? "checked" : ""} />
              <span>${item.label}</span>
            </label>
          </li>`
        ).join("")}
      </ul>
    </section>
  `;

  const semSelect = root.querySelector('select[name="seminary"]');
  const subSelect = root.querySelector("#paste-subject");
  semSelect?.addEventListener("change", () => {
    const sem = SEMINARIES[semSelect.value];
    if (!sem || !subSelect) return;
    subSelect.innerHTML = sem.subjects
      .map((sub) => `<option value="${sub}">${sub}</option>`)
      .join("");
  });

  function getPasteOptions() {
    const fd = new FormData(root.querySelector("#paste-form"));
    return {
      seminary: fd.get("seminary"),
      subject: fd.get("subject"),
      type: fd.get("type"),
      subjectKey: fd.get("subject") === "영어" ? "english" : "bible",
    };
  }

  root.querySelector("#paste-preview")?.addEventListener("click", () => {
    const text = new FormData(root.querySelector("#paste-form")).get("paste");
    const box = root.querySelector("#paste-preview-box");
    const { format, questions: preview } = previewPaste(String(text || ""), getPasteOptions());
    if (!preview.length) {
      box.classList.remove("hidden");
      box.innerHTML = `<p class="muted">파싱된 문항이 없습니다. (감지: ${format})</p>`;
      return;
    }
    box.classList.remove("hidden");
    box.innerHTML = `
      <p class="muted small">감지 형식: <strong>${format}</strong> · ${preview.length}문항</p>
      <ol class="paste-preview-list">
        ${preview
          .slice(0, 15)
          .map(
            (q) => `
          <li>
            <span class="badge">${q.type}</span>
            ${escapeHtml(q.question)}
            <span class="muted small">→ ${
              q.type === "multiple"
                ? `정답 ${["①", "②", "③", "④"][q.answer] ?? q.answer}`
                : escapeHtml(String(q.answer))
            }</span>
          </li>`
          )
          .join("")}
        ${preview.length > 15 ? `<li class="muted">… 외 ${preview.length - 15}문항</li>` : ""}
      </ol>`;
  });

  root.querySelector("#paste-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = new FormData(e.target).get("paste");
    const { questions: parsed } = previewPaste(String(text || ""), getPasteOptions());
    if (!parsed.length) {
      alert("저장할 문항이 없습니다.");
      return;
    }
    const added = addPastedQuestions(parsed);
    clearQuestionsCache();
    alert(`저장 완료: 새로 ${added.length}문항 (중복 ${parsed.length - added.length}건 제외)`);
    renderSources(root);
  });

  root.querySelectorAll("#collection-list input").forEach((input) => {
    input.addEventListener("change", () => {
      toggleCollectionItem(input.dataset.id);
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
