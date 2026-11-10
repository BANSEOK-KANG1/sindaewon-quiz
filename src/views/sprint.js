import { BOOK_BY_NAME } from '../data/book-notes/index.js';
import { CORE_CARDS, readingCards } from '../data/commute.js';
import { SPRINT_STAGES, sprintStage, sprintRecap } from '../data/sprint.js';
import { getSprint, openSprint, advanceSprint, previousSprintCard, restartSprint, sprintComplete, sprintSaveFailed } from '../storage/sprint.js';
import { getReading, finishReadingCard, finishSession, readingPreference, toggleSaved, readingSaveFailed } from '../storage/commute.js';
import { esc, coreUrl, cardStyle, renderCard, sourceDetails } from './commute.js';
import { icon, hydrateIcons } from '../lib/icons.js';

function saveNote() {
  return sprintSaveFailed() || readingSaveFailed() ? '<p class="cr-storage-note" role="status">지금은 기록을 저장할 수 없어요. 이 화면에서는 계속 읽을 수 있습니다.</p>' : '';
}

function summary() {
  return `<div class="sp-summary"><header class="cr-topline"><a class="cr-quiet-link" href="#/">← 읽기 홈</a><a class="cr-quiet-link" href="#/saved">${icon('bookmark')} 보관함</a></header>
    <section class="sp-finish-hero"><span class="sp-finish-seal">${icon('check')}<strong>12</strong><small>연결 완료</small></span><div><p class="cr-eyebrow">첫 번째 묶음 · 한 바퀴 완료</p><h1 tabindex="-1">한 바퀴 끝.<br>이제 한 장으로.</h1><p>읽은 내용을 짧게 다시 훑어보세요.<br>제목을 누르면 자세한 설명도 다시 볼 수 있어요.</p></div></section>
    <div class="sp-summary-label"><h2>핵심 연결 한 장 요약</h2><span>12 / 12 읽음</span></div>
    ${SPRINT_STAGES.map((stage,i) => `<section class="sp-summary-group"><h3><span>${String(i+1).padStart(2,'0')}</span>${stage.title}<small>${stage.end-stage.start}개 연결</small></h3><div class="sp-summary-grid">${CORE_CARDS.slice(stage.start,stage.end).map((card,n) => `<article><div class="sp-summary-meta"><span>${String(stage.start+n+1).padStart(2,'0')}</span><small>${esc(card.book)}</small></div><h4><a href="${esc(coreUrl(card))}">${esc(card.title)} ${icon('chevron-right')}</a></h4><p>${esc(sprintRecap(card))}</p></article>`).join('')}</div></section>`).join('')}
    <p class="sp-summary-footnote">이번 묶음은 전체 시험 범위 중 12개 핵심 연결이에요. 이어지는 내용은 66권 읽기와 2주 길잡이에서 볼 수 있어요.</p>
    <div class="sp-summary-actions"><a class="cr-primary" href="#/">읽기 홈으로 ${icon('arrow-right')}</a><button type="button" class="cr-secondary" data-restart>다시 한 바퀴 읽기</button></div>${saveNote()}</div>`;
}

export async function renderSprint(root) {
  openSprint();
  function render(focus = false) {
    const run = getSprint();
    if (sprintComplete(run)) {
      root.innerHTML = summary();
      root.querySelector('[data-restart]').addEventListener('click', () => { restartSprint(); render(true); });
    } else {
      const card = CORE_CARDS[run.index];
      const book = BOOK_BY_NAME[card.book];
      const state = getReading();
      const saved = state.saved.includes(card.id);
      const stage = sprintStage(run.index);
      const stageIndex = SPRINT_STAGES.indexOf(stage);
      const next = CORE_CARDS[run.index+1];
      root.innerHTML = `<div class="cr-reader sp-reader ${state.large ? 'cr-large' : ''}">
        <header class="cr-reader-top"><a class="cr-back" href="#/" aria-label="읽기 홈으로 나가기">←</a><span><strong>한방에 끝내기</strong><small>핵심 연결 ${String(run.index+1).padStart(2,'0')} / ${CORE_CARDS.length}</small></span><button type="button" class="cr-tool" data-size aria-pressed="${state.large}" aria-label="글자 크게 보기">가<span>+</span></button><button type="button" class="cr-tool ${saved ? 'selected' : ''}" data-save aria-pressed="${saved}" aria-label="${saved ? '보관 취소' : '다시 볼 카드로 보관'}">${icon('bookmark')}</button></header>
        <div class="sp-progress-caption"><span>이번 한 바퀴 <strong>${run.read.length}개 읽음</strong></span><small>${CORE_CARDS.length-run.read.length}개 남았어요</small></div><div class="cr-session-track sp-track" role="progressbar" aria-label="이번 한 바퀴 읽은 진도" aria-valuemin="0" aria-valuemax="${CORE_CARDS.length}" aria-valuenow="${run.read.length}">${CORE_CARDS.map((c,i)=>`<span class="${run.read.includes(c.id)?'filled':''} ${i===run.index?'current':''}"></span>`).join('')}</div>
        <ol class="sp-stage-nav" aria-label="읽기 흐름">${SPRINT_STAGES.map((s,i)=>`<li ${i===stageIndex?'aria-current="step"':''} class="${run.read.length>=s.end?'done':''}"><span>${run.read.length>=s.end ? icon('check') : String(i+1).padStart(2,'0')}</span>${s.title}</li>`).join('')}</ol>
        <article class="cr-reading-card cr-kind-${card.kind}"><p class="cr-eyebrow"><span class="cr-style-chip">${icon('compass')} ${esc(cardStyle(card))}</span><span>${esc(card.book)}</span></p><h1 tabindex="-1">${esc(card.title)}</h1><p class="cr-card-lead">${esc(card.lead)}</p><aside class="cr-takeaway"><span>${icon('sparkles')} 이것만 먼저 기억해요</span><strong>${esc(card.takeaway || card.lead)}</strong></aside><div class="cr-detail-label"><span>이렇게 연결하면 쉬워요</span><span aria-hidden="true"></span></div>${renderCard(card,book)}${card.reference ? `<p class="cr-source">${esc(card.reference)}</p>` : ''}${sourceDetails(card)}</article>
        <p class="cr-save-status" role="status">${saved ? '보관함에 담아 두었어요' : '기억하고 싶은 연결은 위쪽 책갈피에 담아 보세요.'}</p>${saveNote()}
        <nav class="cr-reader-controls sp-controls" aria-label="한 바퀴 읽기 이동"><p class="cr-up-next"><span>${next ? '다음' : '마지막'}</span><strong>${next ? esc(next.title) : '읽은 12개 연결을 한 장으로 정리해요'}</strong></p><button type="button" class="cr-secondary" data-prev ${run.index===0?'disabled':''}>← 이전</button><button type="button" class="cr-primary" data-next>${next ? '읽었어요 · 다음' : '한 바퀴 마치기'} ${icon('arrow-right')}</button></nav>
      </div>`;
      root.querySelector('[data-next]').addEventListener('click', e => { if (e.detail < 2) go(card,1); });
      root.querySelector('[data-prev]').addEventListener('click', e => { if (e.detail < 2) go(card,-1); });
      root.querySelector('[data-size]').addEventListener('click', e => {
        const large = !getReading().large;
        readingPreference('large',large);
        root.querySelector('.cr-reader').classList.toggle('cr-large',large);
        e.currentTarget.setAttribute('aria-pressed',String(large));
        if (readingSaveFailed()) root.querySelector('.cr-save-status').textContent = '글자 크기를 바꿨어요. 지금은 설정을 저장할 수 없어요.';
      });
      root.querySelector('[data-save]').addEventListener('click', e => {
        const on = toggleSaved(card.id);
        e.currentTarget.setAttribute('aria-pressed',String(on));
        e.currentTarget.setAttribute('aria-label',on?'보관 취소':'다시 볼 카드로 보관');
        e.currentTarget.classList.toggle('selected',on);
        root.querySelector('.cr-save-status').textContent = readingSaveFailed() ? '지금은 기록을 저장할 수 없어요. 이 화면에서만 보관됩니다.' : on ? '보관함에 담아 두었어요' : '보관을 취소했어요';
      });
    }
    hydrateIcons(root);
    if (focus) { window.scrollTo({top:0}); root.querySelector('h1')?.focus({preventScroll:true}); }
  }
  function go(card,direction) {
    if (sprintComplete()) return;
    if (direction < 0) previousSprintCard();
    else {
      const result = advanceSprint(card.id);
      if (!result.accepted) return;
      finishReadingCard(card,readingCards(BOOK_BY_NAME[card.book]).length);
      if (result.completed) finishSession();
    }
    render(true);
  }
  root.onkeydown = e => {
    if (e.repeat || e.target.closest('button,a,input,textarea,select,summary') || sprintComplete()) return;
    if (e.key==='ArrowRight' || e.key==='ArrowLeft') {
      e.preventDefault(); go(CORE_CARDS[getSprint().index],e.key==='ArrowRight'?1:-1);
    }
  };
  render();
}
