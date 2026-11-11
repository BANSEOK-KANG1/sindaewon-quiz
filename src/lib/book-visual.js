import { POSTER_BY_BOOK, POSTER_BY_ID, BIBLEPROJECT_CREDIT } from '../data/book-visuals.js';

export const escapeVisual = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const localVisualUrl = path => `${import.meta.env?.BASE_URL || './'}${path}`;
export const atlasUrl = book => `#/visuals/${encodeURIComponent(book)}`;
export const posterCredit = () => `<p class="atlas-credit">포스터 제작·저작권: <a href="${BIBLEPROJECT_CREDIT.home}" target="_blank" rel="noopener noreferrer">BibleProject</a> · 한국어 원본</p>`;

export function posterThumbnail(poster) {
 return `<img src="${localVisualUrl(poster.image)}" alt="${escapeVisual(poster.title)}" width="${poster.width}" height="${poster.height}" loading="lazy" decoding="async">`;
}

export function renderBookPoster(bookOrId) {
 const p = POSTER_BY_BOOK[bookOrId] || POSTER_BY_ID[bookOrId];
 if (!p) return '';
 return `<figure class="atlas-poster" data-poster="${p.id}">
  <figcaption><span>책 전체의 그림 개요</span><strong>${escapeVisual(p.title)}</strong></figcaption>
  ${posterCredit()}
  <div class="atlas-zoom" role="group" aria-label="포스터 확대">
   <button type="button" data-poster-size="0" aria-pressed="true">전체</button><button type="button" data-poster-size="1800" aria-pressed="false">확대</button><button type="button" data-poster-size="3000" aria-pressed="false">더 크게</button>
   <a href="${localVisualUrl(p.image)}" target="_blank" rel="noopener noreferrer">원본 열기 ↗</a>
  </div>
  <p class="atlas-pan-hint" data-poster-hint>전체 흐름을 본 뒤, ‘확대’로 글씨와 작은 장면을 살펴보세요.</p>
  <div class="atlas-viewport" tabindex="0" role="region" aria-label="${escapeVisual(p.title)}. 확대 후 손가락 또는 방향키로 이동">${posterThumbnail(p)}</div>
  <div class="atlas-source-links"><a href="${p.source}" target="_blank" rel="noopener noreferrer">공식 원본</a><a href="${BIBLEPROJECT_CREDIT.terms}" target="_blank" rel="noopener noreferrer">이용 조건</a><span>원본 그대로 · 비상업 학습</span></div>
 </figure>`;
}

export function bindBookPosters(root) {
 root.querySelectorAll('[data-poster]').forEach(figure => {
  const surface = figure.querySelector('.atlas-viewport');
  const img = surface.querySelector('img');
  figure.querySelectorAll('[data-poster-size]').forEach(button => button.addEventListener('click', () => {
   const width = Number(button.dataset.posterSize);
   img.style.width = width ? `${width}px` : '100%';
   figure.querySelectorAll('[data-poster-size]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
   figure.querySelector('[data-poster-hint]').textContent = width ? '그림을 위아래·좌우로 밀어 보세요. ‘전체’를 누르면 처음 크기로 돌아갑니다.' : '전체 흐름을 본 뒤, ‘확대’로 글씨와 작은 장면을 살펴보세요.';
   surface.scrollLeft = 0; surface.scrollTop = 0;
  }));
  surface.addEventListener('keydown', event => {
   if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(event.key)) event.stopPropagation();
  });
 });
}

export function renderReadingPoster(card, hasScene = false) {
 if (!POSTER_BY_BOOK[card.book]) return '';
 const poster = renderBookPoster(card.book);
 const link = `<a class="atlas-open-book" href="${atlasUrl(card.book)}">${escapeVisual(card.book)} 그림·인물·핵심 사실 모아 보기 →</a>`;
 return hasScene ? `<details class="atlas-book-context"><summary>이 사건이 놓인 책 전체 흐름 보기</summary>${poster}${link}</details>` : `${poster}${link}`;
}
