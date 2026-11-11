import { BOOKS, BOOK_BY_NAME, GROUPS } from '../data/book-notes/index.js';
import { readingCards, sessionCards, READING_PATH, CARD_BY_ID, CORE_CARDS, nextCoreCard, splitLabel } from '../data/commute.js';
import { getReading, readingPreference, rememberPosition, finishReadingCard, finishSession, toggleSaved, readingSaveFailed } from '../storage/commute.js';
import { getSprint, sprintComplete, sprintSaveFailed } from '../storage/sprint.js';
import { icon, hydrateIcons } from '../lib/icons.js';
import { getQuery, navigate } from '../router.js';
import { renderBibleVisual, bindBibleVisuals, visualThumbnail } from '../lib/bible-visual.js';
import { VISUAL_BY_CARD } from '../data/bible-visuals.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const readUrl = name => `#/read/${encodeURIComponent(name)}`;
const coreUrl = card => `${readUrl(card.book)}?id=${encodeURIComponent(card.id)}&focus=core`;
const validRead = state => state.read.filter(id => CARD_BY_ID[id]);
const savedCards = () => getReading().saved.map(id => CARD_BY_ID[id]).filter(Boolean);
function bookCount(book, state) { return readingCards(book).filter(c => state.read.includes(c.id)).length; }
function bookLink(book, state) {
  const seen = bookCount(book, state);
  const total = readingCards(book).length;
  return `<a class="cr-book" href="${readUrl(book.n)}"><span class="cr-book-mark ${book.testament === '신약' ? 'nt' : ''}">${esc(book.n.slice(0, 1))}</span><span><strong>${esc(book.n)}</strong><small>${book.c}장 · ${seen ? `${seen}/${total}카드 읽음` : `${total}카드`}</small>${seen ? `<span class="cr-book-progress" aria-hidden="true"><span style="width:${seen / total * 100}%"></span></span>` : ''}</span>${icon('chevron-right')}</a>`;
}
function storageNote() { return readingSaveFailed() ? '<p class="cr-storage-note" role="status">이 브라우저에 기록을 저장할 수 없어요. 현재 화면에서는 계속 읽을 수 있습니다.</p>' : ''; }
const cardStyle = card => ({ compare: '나란히 비교', journey: '순서로 연결', timeline: '이야기의 흐름', overview: '한눈에 보기', people: '인물과 역할', focus: '핵심 연결', verses: '구절과 출처' }[card.kind] || '핵심 읽기');
function coreSection(state) {
  const run = getSprint();
  const done = sprintComplete(run);
  const count = run.read.length;
  const label = done ? '완주 요약 보기' : count > 0 ? '이어서 끝내기' : '한방에 끝내기';
  return `<section class="sp-feature-section" aria-label="핵심 연결 한방에 끝내기">
    <div class="sp-feature"><div class="sp-feature-copy"><p class="sp-kicker"><span>첫 번째 묶음</span> 핵심 연결 ${CORE_CARDS.length}개</p><h1>기출 핵심,<br><em>한방에 끝내기.</em></h1><p class="sp-intro">헷갈리는 인물, 장소, 장을 한눈에.<br>한 장씩 읽으면 마지막에 한 장으로 정리돼요.</p><div class="sp-meta"><span>${icon('clock-3')} 약 12분</span><span>${icon('book-open')} 읽기 → 한 장 요약</span></div><a class="cr-primary sp-start" href="#/sprint">${label} ${icon('arrow-right')}</a><small>${done ? '12개 연결을 모두 읽었어요. 요약을 다시 펼쳐 보세요.' : count > 0 ? `${count}개 읽음 · ${esc(CORE_CARDS[run.index].book)}부터 이어가요` : '한 번에 다 못 읽어도, 다음에 그대로 이어서.'}</small></div>
    <div class="sp-route bv-home-preview"><div class="sp-route-heading"><span>이번 연결을 그림으로</span><small>VISUAL NOTES</small></div>${visualThumbnail(CORE_CARDS[run.index].id)}<a href="#/visuals">그림 자료 12장 한눈에 보기 ${icon('arrow-right')}</a></div></div>
    <div class="sp-home-progress"><span>${done ? '이번 한 바퀴 완료' : '이번 한 바퀴'} <strong>${count} / ${CORE_CARDS.length}</strong></span><div aria-hidden="true">${CORE_CARDS.map(c=>`<span class="${run.read.includes(c.id)?'read':''}"></span>`).join('')}</div><small>${done ? '다시 펼쳐도 요약이 남아요' : `${CORE_CARDS.length-count}개 남았어요`}</small></div>
    <details class="cr-core-menu"><summary><span>${icon('list')} 무엇을 읽나요? · 12개 연결</span>${icon('chevron-down')}</summary><p>창세기 2개와 보유 기출 개념 10개로 구성한 첫 묶음이에요. 원하는 연결만 골라 읽을 수도 있어요.</p><ol>${CORE_CARDS.map((c,i) => `<li><a href="${esc(coreUrl(c))}"><span>${String(i+1).padStart(2,'0')}</span><span><strong>${esc(c.title)}</strong><small>${esc(c.book)}</small></span>${state.read.includes(c.id) ? `<span class="cr-core-read">${icon('check')} 읽음</span>` : icon('chevron-right')}</a></li>`).join('')}</ol></details>
    ${sprintSaveFailed() ? '<p class="cr-storage-note" role="status">지금은 진도를 저장할 수 없어요. 이 화면에서는 계속 읽을 수 있습니다.</p>' : ''}
  </section>`;
}

function sourceDetails(card) {
  if (!card.sources?.length) return '';
  return `<details class="cr-card-sources"><summary>학습 내용과 본문 근거</summary><p>${esc(card.exam.label)}을 비교·흐름으로 정리했어요.</p><p>내용은 학습용 요약이며, 아래 링크는 본문 확인용 영문 성경(NIV)이에요.</p><ul>${card.sources.map(source => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)} ${icon('external-link')}</a></li>`).join('')}</ul></details>`;
}

export async function renderCommuteHome(root) {
  function render() {
    const state = getReading();
    const book = BOOK_BY_NAME[state.last] || BOOKS[0];
    const all = readingCards(book);
    const position = state.positions[book.n] < all.length ? state.positions[book.n] : 0;
    const card = all[position || 0];
    const count = sessionCards(book.n, position || 0, state.minutes).length;
    const saved = savedCards();
    const currentDay = READING_PATH.find(d => d.books.includes(book.n));
    root.innerHTML = `<div class="cr-home cr-home-refined">
      <header class="cr-topline"><span class="cr-wordmark">${icon('book-open')} 길 위의 말씀</span><a href="#/saved" class="cr-quiet-link">${icon('bookmark')} 보관함 <b>${saved.length}</b></a></header>
      <p class="sp-home-caption">총신 신대원 준비 · 70점을 향한 출퇴근 읽기</p>
      ${coreSection(state)}${storageNote()}<a class="bv-library-entry" href="#/visuals"><span><strong>성경 그림 자료실</strong><small>도시 지도 · 인물 관계 · 장면 그림 12장</small></span>${icon('arrow-right')}</a>
      <div class="cr-home-shelves"><section class="cr-free-reading" aria-label="책별 자유 읽기"><div class="cr-section-title"><h2>조금 더 읽고 싶다면</h2><a href="#/notes">66권 보기 ${icon('arrow-right')}</a></div><div class="cr-duration" aria-label="책별 읽을 분량 선택"><span>책별 읽기 분량</span><div role="group" aria-label="예상 읽기 시간">${[3,5,10].map(n => `<button type="button" data-minutes="${n}" aria-pressed="${state.minutes === n}">${n}분</button>`).join('')}</div></div><a class="cr-resume-card" href="${readUrl(book.n)}"><span class="cr-book-mark">${esc(book.n.slice(0,1))}</span><span><small>${state.last ? '읽던 곳부터' : '처음 읽기'} · ${esc(book.n)}</small><strong>${esc(card.title)}</strong><small>이번 분량 ${count}카드 · 약 ${count}분</small></span>${icon('arrow-right')}</a><p class="cr-footnote">예상 시간은 카드당 약 1분 기준이에요.</p></section>
      <section class="cr-reading-pocket" aria-label="나의 읽기"><p class="cr-eyebrow">차곡차곡 쌓이는 읽기</p><div class="cr-pocket-count"><strong>${validRead(state).length}</strong><span>카드 읽음</span></div><a href="#/saved">${icon('bookmark')} 다시 볼 카드 <strong>${saved.length}개</strong> ${icon('chevron-right')}</a><p>읽은 수는 진도 표시예요.<br>시험 점수로 환산하지 않아요.</p></section></div>
      <details class="cr-path-section cr-path-disclosure"><summary><span>${icon('compass')}<span><strong>2주 전체 읽기 길잡이</strong><small>창세기부터 요한계시록까지 · 14개 주제</small></span></span>${icon('chevron-down')}</summary><p class="cr-section-description">하루 한 주제를 중심으로, 짧게 나눠 읽어도 괜찮아요.</p><div class="cr-path-grid">${READING_PATH.map(d => {
        const started = d.books.some(n => bookCount(BOOK_BY_NAME[n], state));
        return `<a class="cr-day ${d.day === currentDay.day ? 'current' : ''}" href="#/notes?day=${d.day}"><span class="cr-day-number">${String(d.day).padStart(2,'0')}</span><span><strong>${esc(d.title)}</strong><small>${esc(d.books.length <= 3 ? d.books.join(' · ') : `${d.books[0]} 외 ${d.books.length - 1}권`)}${started ? ' · 읽는 중' : ''}</small></span>${icon('chevron-right')}</a>`;
      }).join('')}</div></details>
      <section class="cr-more"><a href="#/english">${icon('languages')}<span><strong>깜빡이 영어</strong><small>단어 10개 자동 반복</small></span>${icon('arrow-right')}</a><a href="#/topics">${icon('compass')}<span><strong>주제별로 연결</strong><small>왕·선지자·지명·연대표</small></span>${icon('arrow-right')}</a></section>
      <footer class="cr-footer"><span>읽은 기록은 이 브라우저에 보관됩니다.</span><a href="#/dashboard">문제 풀이 현황 ${icon('chevron-right')}</a></footer>
    </div>`;
    root.querySelectorAll('[data-minutes]').forEach(btn => btn.addEventListener('click', () => {
      readingPreference('minutes', Number(btn.dataset.minutes)); render(); root.querySelector(`[data-minutes="${btn.dataset.minutes}"]`)?.focus({preventScroll:true});
    }));
    hydrateIcons(root);
  }
  render();
}

export async function renderReadingLibrary(root) {
  const state = getReading();
  const day = READING_PATH.find(d => d.day === Number(getQuery().get('day')));
  let testament = '전체';
  root.innerHTML = `<div class="cr-library"><header class="cr-topline"><a class="cr-quiet-link" href="#/">← 읽기 홈</a><a class="cr-quiet-link" href="#/saved">${icon('bookmark')} 보관함</a></header><div class="cr-heading"><p class="cr-eyebrow">${day ? `${day.day}일차 읽기 길잡이` : '성경 66권 학습 지도'}</p><h1>${day ? esc(day.title) : '큰 흐름부터,<br>한 권씩.'}</h1><p>사건의 순서, 인물의 역할, 구절의 출처를 함께 읽어요.</p></div>
    ${day ? '<a class="cr-quiet-link" href="#/notes">66권 전체로 돌아가기 →</a>' : ''}
    <label class="cr-search">${icon('search')}<input type="search" placeholder="성경 이름으로 찾기" aria-label="성경 이름 검색"></label>
    <div class="cr-filters" role="group" aria-label="성경 구분">${['전체','구약','신약'].map(t => `<button type="button" data-testament="${t}" aria-pressed="${t === testament}">${t}</button>`).join('')}</div>
    <div class="cr-library-results" aria-live="polite"></div>
    <p class="cr-footnote">구절은 개역개정의 핵심 어구를 줄인 것입니다. 정확한 표현은 본문에서 확인하세요.</p></div>`;
  function results() {
    const term = root.querySelector('input').value.replace(/\s/g, '');
    const groups = GROUPS.map(g => ({ ...g, books: g.books.filter(b => (!day || day.books.includes(b.n)) && (testament === '전체' || b.testament === testament) && b.n.includes(term)) })).filter(g => g.books.length);
    root.querySelector('.cr-library-results').innerHTML = groups.length ? groups.map(g => `<section class="cr-library-group"><div class="cr-section-title"><h2><small>${g.testament}</small> ${esc(g.label)}</h2><span>${g.books.length}권</span></div><div class="cr-book-grid">${g.books.map(b => bookLink(b, state)).join('')}</div></section>`).join('') : '<p class="cr-empty">찾는 책이 없어요. 이름이나 구약·신약 선택을 바꿔 보세요.</p>';
    hydrateIcons(root);
  }
  root.querySelector('input').addEventListener('input', results);
  root.querySelectorAll('[data-testament]').forEach(btn => btn.addEventListener('click', () => {
    testament = btn.dataset.testament;
    root.querySelectorAll('[data-testament]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    results();
  }));
  results();
}

function renderCardText(card, book) {
  switch (card.kind) {
    case 'journey':
      return `<ol class="cr-journey">${card.items.map(([chapter,title,body]) => `<li><span class="cr-chapter">${esc(chapter)}</span><div><h3>${esc(title)}</h3><p>${esc(body)}</p></div></li>`).join('')}</ol>`;
    case 'compare':
      return `<div class="cr-compare">${card.items.map(([chapter,title,body]) => `<section><span class="cr-chapter">${esc(chapter)}</span><h3>${esc(title)}</h3><p>${esc(body)}</p></section>`).join('')}</div>`;
    case 'overview':
      return `<div class="cr-overview"><span class="cr-book-seal">${book.c}<small>장</small></span><p>${esc(book.testament)}<br><strong>${esc(book.g)}</strong></p></div><ol class="cr-outline">${card.items.map(([chapter,body]) => `<li><span>${esc(chapter)}</span><p>${esc(body)}</p></li>`).join('')}</ol>`;
    case 'timeline':
      return `<ol class="cr-journey">${card.items.map(([chapter,body]) => `<li><span class="cr-chapter">${esc(chapter || '흐름')}</span><div><p>${esc(body)}</p></div></li>`).join('')}</ol>`;
    case 'people':
      return `<div class="cr-people">${card.items.map(([name,body],i) => `<section><span class="cr-person-icon">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(name)}</h3>${body ? `<p>${esc(body)}</p>` : ''}</div></section>`).join('')}</div>`;
    case 'focus':
      return `<div class="cr-facts">${card.items.map((text,i) => {
        const [label, body] = splitLabel(text);
        return `<section><span class="cr-fact-number">0${i+1}</span>${body ? `<h3>${esc(label)}</h3><p>${esc(body)}</p>` : `<p>${esc(label)}</p>`}</section>`;
      }).join('')}</div>`;
    case 'verses':
      return `<div class="cr-quotes">${card.items.map(([ref,text]) => `<figure><span aria-hidden="true">“</span><blockquote>${esc(text)}</blockquote><figcaption>${esc(book.n)} ${esc(ref)}</figcaption></figure>`).join('')}</div><p class="cr-footnote">개역개정 핵심 어구 요약</p>`;
    default: return '';
  }
}

function renderCard(card, book) {
  const body=renderCardText(card,book);
  return VISUAL_BY_CARD[card.id] ? `<details class="bv-reading-text"><summary>글로 자세히 읽기</summary>${body}</details>` : body;
}

function readingContents(book, cards, current, state, coreMode = false) {
  const read = new Set(state.read);
  const list = coreMode ? CORE_CARDS : cards;
  const count = list.filter(card => read.has(card.id)).length;
  const position = coreMode ? list.findIndex(card=>card.id===current.id) : current.index;
  return `<details class="cr-toc"><summary><span>${icon('list')} <strong>${coreMode ? '핵심 연결 목차' : `${esc(book.n)} 카드 목차`}</strong></span><span class="cr-toc-position">${position + 1} / ${list.length} ${icon('chevron-down')}</span></summary><div class="cr-toc-content"><p>읽은 카드 ${count} / ${list.length} · 원하는 내용을 골라 보세요.</p><ol>${list.map((card,i) => `<li><a href="${coreMode ? esc(coreUrl(card)) : `${readUrl(book.n)}?card=${card.index}`}" ${card.id === current.id ? 'aria-current="page"' : ''}><span class="cr-toc-number">${String(i+1).padStart(2, '0')}</span><span>${esc(card.title)}</span><small>${card.id === current.id ? '현재' : read.has(card.id) ? '읽음' : ''}</small></a></li>`).join('')}</ol>${coreMode ? `<a class="cr-toc-book" href="${readUrl(book.n)}?card=0">${esc(book.n)} 전체 내용 보기 ${icon('arrow-right')}</a>` : ''}</div></details>`;
}

export async function renderCommuteReader(root, params) {
  const book = BOOK_BY_NAME[params.book];
  if (!book) { root.innerHTML = '<p class="cr-empty">책을 찾을 수 없어요. <a href="#/notes">성경 목록으로</a></p>'; return; }
  const state = getReading();
  const all = readingCards(book);
  const requested = getQuery().get('card');
  const namedIndex = all.findIndex(card => card.id === getQuery().get('id'));
  const requestedIndex = namedIndex >= 0 ? namedIndex : requested === null ? NaN : Number(requested);
  const start = Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex < all.length ? requestedIndex : (state.positions[book.n] || 0);
  const coreMode = getQuery().get('focus') === 'core' && CORE_CARDS.some(card => card.id === all[start]?.id);
  const cards = coreMode ? [all[start]] : sessionCards(book.n, start, state.minutes);
  let index = 0;
  let ended = false;
  let counted = false;
  let leaving = false;
  const acknowledged = new Set();
  function render(focus = false) {
    const currentState = getReading();
    if (ended) {
      const next = coreMode ? nextCoreCard(currentState.read, cards[0].id) : null;
      root.innerHTML = `<div class="cr-reader"><header class="cr-topline"><a href="#/" class="cr-quiet-link">← 읽기 홈</a><span class="cr-eyebrow">${esc(book.n)}</span></header><section class="cr-session-done"><span class="cr-done-icon">${icon('book-check')}</span><p class="cr-eyebrow">한 번의 읽기, 잘 마쳤어요</p><h1>${coreMode ? '12가지 연결을<br>모두 읽었어요.' : `${acknowledged.size}개 카드를<br>읽었어요.`}</h1><p>다음에 열면 이어서 볼 수 있어요.<br>다시 보고 싶은 카드는 보관함에 남아 있어요.</p>${next ? `<a class="cr-primary" href="${esc(coreUrl(next))}">다음 핵심 · ${esc(next.title)} ${icon('arrow-right')}</a>` : ''}<a class="${next ? 'cr-secondary' : 'cr-primary'}" href="#/">읽기 홈으로 ${icon('arrow-right')}</a><a class="cr-secondary" href="#/saved">${icon('bookmark')} 보관한 카드 보기</a><details class="cr-optional"><summary>시간이 더 있다면</summary><a href="#/notes/${encodeURIComponent(book.n)}">${esc(book.n)} 셀프체크와 기존 카드 →</a><a href="#/quiz">문제 풀이 선택 →</a></details>${storageNote()}</section></div>`;
      hydrateIcons(root); window.scrollTo({top:0}); root.querySelector('h1').setAttribute('tabindex','-1'); root.querySelector('h1').focus({preventScroll:true}); return;
    }
    const card = cards[index];
    rememberPosition(book.n, card.index);
    const saved = currentState.saved.includes(card.id);
    const coreIndex = CORE_CARDS.findIndex(c=>c.id===card.id);
    const next = coreMode ? nextCoreCard([...currentState.read, card.id], card.id) : cards[index+1];
    const track = coreMode ? CORE_CARDS : cards;
    const trackPosition = coreMode ? coreIndex : index;
    root.innerHTML = `<div class="cr-reader ${currentState.large ? 'cr-large' : ''}">
      <header class="cr-reader-top"><a class="cr-back" href="#/" aria-label="읽기 홈으로">←</a><span><strong>${esc(book.n)}</strong><small>${coreMode ? `핵심 연결 ${coreIndex+1} / ${CORE_CARDS.length}` : `이번 읽기 ${index+1} / ${cards.length}카드`}</small></span><button type="button" class="cr-tool" data-size aria-pressed="${currentState.large}" aria-label="글자 크게 보기">가<span>+</span></button><button type="button" class="cr-tool ${saved ? 'selected' : ''}" data-save aria-pressed="${saved}" aria-label="${saved ? '보관 취소' : '다시 볼 카드로 보관'}">${icon('bookmark')}</button></header>
      <div class="cr-session-track" role="progressbar" aria-label="${coreMode ? '핵심 연결 위치' : '이번 읽기 위치'}" aria-valuemin="0" aria-valuemax="${track.length}" aria-valuenow="${trackPosition+1}">${track.map((c,i) => `<span class="${coreMode ? (currentState.read.includes(c.id) ? 'filled' : '') : (i < index ? 'filled' : '')} ${i===trackPosition?'current':''}"></span>`).join('')}</div>
      ${readingContents(book, all, card, currentState, coreMode)}
      <article class="cr-reading-card cr-kind-${card.kind}"><p class="cr-eyebrow"><span class="cr-style-chip">${icon(card.kind==='people'?'book-open':'compass')} ${esc(cardStyle(card))}</span><span>${esc(book.testament)} · ${esc(book.g)}</span></p><h1 tabindex="-1">${esc(card.title)}</h1><p class="cr-card-lead">${esc(card.lead)}</p>${renderBibleVisual(card.id)}${card.takeaway ? `<aside class="cr-takeaway"><span>${icon('sparkles')} 먼저 기억할 한 줄</span><strong>${esc(card.takeaway)}</strong></aside>` : ''}<div class="cr-detail-label"><span>${esc(cardStyle(card))}</span><span aria-hidden="true"></span></div>${renderCard(card,book)}${card.reference ? `<p class="cr-source">${esc(card.reference)}</p>` : ''}${sourceDetails(card)}</article>
      <p class="cr-save-status" role="status">${saved ? '보관함에 담아 두었어요' : '기억해 두고 싶은 연결은 책갈피에 담아 보세요'}</p>${storageNote()}
      <nav class="cr-reader-controls" aria-label="읽기 카드 이동">${next ? `<p class="cr-up-next"><span>다음 연결</span><strong>${esc(next.title)}</strong></p>` : '<p class="cr-up-next">여기까지 읽은 내용을 저장해요</p>'}<button type="button" class="cr-secondary" data-prev ${(coreMode ? coreIndex===0 : index===0) ? 'disabled' : ''}>← 이전</button><button type="button" class="cr-primary" data-next>${next ? '읽었어요 · 다음' : '여기까지 읽었어요'} ${icon('arrow-right')}</button></nav>
    </div>`;
    root.querySelector('[data-save]').addEventListener('click', () => {
      const on = toggleSaved(card.id); const button = root.querySelector('[data-save]');
      button.setAttribute('aria-pressed', String(on)); button.setAttribute('aria-label', on ? '보관 취소' : '다시 볼 카드로 보관'); button.classList.toggle('selected',on);
      root.querySelector('.cr-save-status').textContent = readingSaveFailed() ? '지금은 기록을 저장할 수 없어요. 이 화면에서만 보관됩니다.' : on ? '보관함에 담아 두었어요' : '보관을 취소했어요';
    });
    root.querySelector('[data-size]').addEventListener('click', () => { const large = !getReading().large; readingPreference('large', large); root.querySelector('.cr-reader').classList.toggle('cr-large',large); root.querySelector('[data-size]').setAttribute('aria-pressed', String(large)); });
    root.querySelector('[data-prev]').addEventListener('click', () => go(-1));
    root.querySelector('[data-next]').addEventListener('click', () => go(1));
    root.querySelector('.cr-toc a[aria-current]').addEventListener('click', () => { root.querySelector('.cr-toc').open = false; });
    hydrateIcons(root);
    bindBibleVisuals(root);
    if (focus) { window.scrollTo({top:0}); root.querySelector('h1').focus({preventScroll:true}); }
  }
  function go(direction) {
    if (ended || leaving) return;
    if (coreMode) {
      if (direction < 0) {
        const previous = CORE_CARDS[CORE_CARDS.findIndex(c=>c.id===cards[0].id)-1];
        if (previous) { leaving = true; navigate(coreUrl(previous)); }
        return;
      }
      finishReadingCard(cards[0], all.length);
      acknowledged.add(cards[0].id);
      if (!counted) finishSession();
      counted = true;
      const next = nextCoreCard(getReading().read, cards[0].id);
      if (next) { leaving = true; navigate(coreUrl(next)); return; }
      ended = true;
    } else {
      if (direction < 0 && index === 0) return;
      if (direction > 0) {
        finishReadingCard(cards[index], all.length);
        acknowledged.add(cards[index].id);
        if (index === cards.length - 1) { ended = true; if (!counted) finishSession(); counted = true; }
        else index++;
      } else index--;
    }
    render(true);
  }
  root.onkeydown = e => { if (e.target.closest('button,a,input,textarea,select,summary')) return; if (e.key === 'ArrowRight') {e.preventDefault();go(1);} if (e.key === 'ArrowLeft') {e.preventDefault();go(-1);} };
  render(coreMode);
}

export async function renderReadingSaved(root) {
  function render() {
    const cards = savedCards();
    root.innerHTML = `<div class="cr-saved"><header class="cr-topline"><a href="#/" class="cr-quiet-link">← 읽기 홈</a><span>${cards.length}카드</span></header><div class="cr-heading"><p class="cr-eyebrow">나만의 작은 복습 노트</p><h1>다시 보고 싶은<br>연결들.</h1><p>읽다가 남겨 둔 카드를 한곳에서 볼 수 있어요.</p></div>${cards.length ? `<div class="cr-saved-grid">${cards.map(c => `<article class="cr-saved-card"><a href="${CORE_CARDS.some(card=>card.id===c.id) ? esc(coreUrl(c)) : `${readUrl(c.book)}?card=${c.index}`}"><span class="cr-eyebrow">${esc(c.book)} · ${CORE_CARDS.some(card=>card.id===c.id) ? `핵심 ${String(CORE_CARDS.findIndex(card=>card.id===c.id)+1).padStart(2,'0')}` : `카드 ${String(c.index+1).padStart(2,'0')}`}</span><h2>${esc(c.title)}</h2><p>${esc(c.takeaway || c.lead)}</p><span class="cr-text-link">다시 읽기 ${icon('arrow-right')}</span></a><button class="cr-remove" type="button" data-remove="${esc(c.id)}" aria-label="${esc(c.book)} ${esc(c.title)} 보관 취소">보관 취소</button></article>`).join('')}</div>` : `<div class="cr-empty">${icon('bookmark')}<h2>마음에 남는 카드부터</h2><p>읽기 화면의 책갈피를 누르면 여기에 모여요.</p><a class="cr-primary" href="#/notes">성경 읽으러 가기 ${icon('arrow-right')}</a></div>`}${storageNote()}</div>`;
    root.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => { toggleSaved(btn.dataset.remove);render(); }));
    hydrateIcons(root);
  }
  render();
}

// Shared content renderer keeps the guided round and individual cards consistent.
export { esc, coreUrl, cardStyle, renderCard, sourceDetails };
