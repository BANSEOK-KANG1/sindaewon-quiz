import { BOOKS, BOOK_BY_NAME } from '../data/book-notes/index.js';
import { readingCards, splitLabel } from '../data/commute.js';
import { POSTER_BY_BOOK } from '../data/book-visuals.js';
import { BIBLE_VISUALS } from '../data/bible-visuals.js';
import { renderBookPoster, bindBookPosters, atlasUrl, escapeVisual as esc } from '../lib/book-visual.js';
import { visualThumbnail } from '../lib/bible-visual.js';
import { hydrateIcons } from '../lib/icons.js';
import { scenesForBook } from '../data/bible-scenes.js';
import { renderSceneFigure } from '../lib/bible-scene.js';
import { getQuery } from '../router.js';

const tabs = [{key:'o',label:'이야기 순서'},{key:'p',label:'인물'},{key:'k',label:'핵심 사실'},{key:'v',label:'구절'}];
export function bookFactRows(book, key) {
 const divider = key === 'v' ? '|' : ' — ';
 return (book[key] || []).map(text => splitLabel(text, divider));
}

export async function renderBookVisuals(root, params) {
 const book = BOOK_BY_NAME[params.book];
 if (!book) { root.innerHTML = '<p class="cr-empty">책을 찾을 수 없어요. <a href="#/visuals">그림 자료실로</a></p>'; return; }
 const poster = POSTER_BY_BOOK[book.n];
 const core = BIBLE_VISUALS.filter(v => v.book === book.n);
 const overview = readingCards(book).find(c => c.kind === 'overview');
 const scenes = scenesForBook(book.n);
 const requestedScene = scenes.find(s => s.id === getQuery().get('scene'));
 const remainingScenes = scenes.filter(s => s !== requestedScene);
 let selected = 'o';
 root.innerHTML = `<div class="atlas-book bv-library"><header class="cr-topline"><a class="cr-quiet-link" href="#/visuals">← 66권 그림 자료실</a><a class="cr-quiet-link" href="#/read/${encodeURIComponent(book.n)}?card=${overview.index}">한 카드씩 읽기 →</a></header>
  <div class="cr-heading"><p class="cr-eyebrow">${book.testament} · ${esc(book.g)} · ${book.c}장</p><h1>${esc(book.n)}<br><span>그림으로 한 권.</span></h1><p>${esc(book.s)}</p></div>
  <div class="atlas-reading-order"><span><b>01</b> 그림의 큰 흐름</span><span><b>02</b> 인물·사건 연결</span><span><b>03</b> 장·절 확인</span></div>
  ${requestedScene ? renderSceneFigure(requestedScene) : ''}
  ${renderBookPoster(book.n)}
  <section class="atlas-facts"><header><p class="cr-eyebrow">그림 옆에서 다시 확인</p><h2>기억할 연결</h2><p>그림은 책 전체를 안내합니다. 세부 이름과 장·절은 아래 학습 내용으로 확인하세요.</p></header><div class="bv-filters" role="group" aria-label="학습 내용 선택">${tabs.map(t => `<button type="button" data-atlas-tab="${t.key}" aria-pressed="${t.key === selected}">${t.label}</button>`).join('')}</div><div data-atlas-facts aria-live="polite"></div></section>
  ${remainingScenes.length ? `<section class="atlas-related"><div class="cr-section-title"><h2>이 책의 사건을 그림으로</h2><span>${remainingScenes.length}장 · 19세기 성경 삽화</span></div><div class="atlas-scene-grid">${remainingScenes.map(renderSceneFigure).join('')}</div></section>` : ''}
  ${core.length ? `<section class="atlas-related"><div class="cr-section-title"><h2>장면으로 더 가까이</h2><span>AI 학습 일러스트</span></div><div class="bv-gallery">${core.map(v => `<a class="bv-gallery-card" href="#/read/${encodeURIComponent(book.n)}?id=${encodeURIComponent(v.cardId)}&focus=core">${visualThumbnail(v.cardId)}<h2>${esc(v.title)}</h2><span class="bv-gallery-open">장면과 본문 읽기 →</span></a>`).join('')}</div></section>` : ''}
  <details class="atlas-video-links"><summary>한국어 개요 영상도 보기</summary>${poster.videos.map(v => `<a href="${v.url}" target="_blank" rel="noopener noreferrer">${esc(v.title)} ↗</a>`).join('')}<p>영상은 인터넷 연결이 필요합니다.</p></details>
  <nav class="atlas-book-nav" aria-label="성경 책 이동">${book.order > 0 ? `<a href="${atlasUrl(BOOKS[book.order-1].n)}">← ${BOOKS[book.order-1].n}</a>` : '<span></span>'}${book.order < 65 ? `<a href="${atlasUrl(BOOKS[book.order+1].n)}">${BOOKS[book.order+1].n} →</a>` : '<span></span>'}</nav>
 </div>`;
 const render = () => {
  root.querySelector('[data-atlas-facts]').innerHTML = `<ol class="atlas-fact-list">${bookFactRows(book, selected).map(([label,body],i) => `<li><span>${String(i+1).padStart(2,'0')}</span><div><strong>${esc(label)}</strong>${body ? `<p>${esc(body)}</p>` : ''}</div></li>`).join('')}</ol>${selected === 'v' ? '<p class="cr-footnote">개역개정 핵심 어구 요약 · 정확한 문장은 성경 본문에서 확인하세요.</p>' : ''}`;
 };
 root.querySelectorAll('[data-atlas-tab]').forEach(button => button.addEventListener('click', () => {
  selected = button.dataset.atlasTab;
  root.querySelectorAll('[data-atlas-tab]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
  render();
 }));
 render(); bindBookPosters(root); hydrateIcons(root);
}
