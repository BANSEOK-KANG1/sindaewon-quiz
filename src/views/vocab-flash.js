import { FLASH_BY_NO, FLASH_UNITS, phaseDuration } from '../data/vocab-flash.js';
import { getFlash, startFlash, repeatFlash, revealFlash, advanceFlash, previousFlash, flashSpeed, markFlash, flashSaveFailed } from '../storage/vocab-flash.js';
import { createFlashClock } from '../lib/flash-clock.js';
import { getQuery } from '../router.js';
import { icon, hydrateIcons } from '../lib/icons.js';

const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number = n => String(n).padStart(2,'0');
const saveNote = () => flashSaveFailed() ? '<p class="cr-storage-note" role="status">지금은 기록을 저장할 수 없어요. 이 화면에서는 계속 볼 수 있습니다.</p>' : '';

export function flashFeature() {
  const state = getFlash();
  const run = state.run;
  const word = FLASH_BY_NO[run?.ids[run.index]] || FLASH_UNITS[state.unit].words[0];
  const continuing = run && !run.done && (run.index > 0 || run.phase === 'meaning');
  const caption = run?.done ? '단어와 뜻을 함께 다시 훑어보세요' : continuing ? `${run.index+1}/${run.ids.length} · ${esc(word.word)}부터 이어가요` : run?.kind==='review' ? '표시한 단어만 · 언제든 멈출 수 있어요' : '기본 속도 약 1분 10초 · 언제든 멈출 수 있어요';
  return `<section class="vf-feature" aria-label="깜빡이 영어"><div><p class="vf-kicker">출퇴근 영어 · ${run?.kind==='review'?'표시한 단어 복습':'10개씩 가볍게'}</p><h2>잠깐 떠올리고,<br>뜻이 보이면 한 번 더.</h2><p>단어 → 뜻 → 다음 단어.<br>내 속도로 자동으로 넘겨 보세요.</p><a class="cr-primary" href="#/english/flash?play=1">${icon('circle-play')} ${run?.done ? '최근 묶음 요약 보기' : continuing ? '읽던 단어부터 재생' : `깜빡이 ${run?.ids.length || 10}개 시작`} ${icon('arrow-right')}</a><small>${caption}</small>${state.marked.length ? `<a class="vf-review-link" href="#/english/flash?mode=review&play=1">${icon('bookmark')} 헷갈린 ${state.marked.length}개만 다시 보기 ${icon('chevron-right')}</a>` : ''}</div><div class="vf-feature-preview"><span>먼저, 영어만</span><strong lang="en">${esc(word.word)}</strong><small>뜻을 떠올리는 짧은 틈</small><div aria-hidden="true"><span></span><span></span><span></span></div><p>단어 ${state.speed}초 <span>→</span> 뜻 ${state.speed+1}초</p></div></section>`;
}

export async function renderVocabFlash(root) {
  const query = getQuery();
  const reviewRequested = query.get('mode') === 'review';
  let emptyReview = reviewRequested && !getFlash().marked.length;
  if (reviewRequested && !emptyReview) startFlash(getFlash().unit,true);
  else if (!getFlash().run && !emptyReview) startFlash();
  let playing = query.get('play') === '1' && !document.hidden && !emptyReview && !getFlash().run?.done;
  // Autoplay is a one-time action from the entry link. A reload always opens paused.
  if (query.has('play') || query.has('mode')) history.replaceState(history.state,'','#/english/flash');
  let disposed = false;
  let exampleOpen = false;
  let message = '';
  const clock = createFlashClock(() => {
    if (disposed || !root.isConnected || document.hidden || !playing) { playing = false; return; }
    step();
  });
  function pause() { playing = false; clock.stop(); }
  function schedule() {
    clock.stop();
    const state = getFlash();
    if (playing && state.run && !state.run.done && !emptyReview) clock.start(phaseDuration(state.run.phase,state.speed));
  }
  function step() {
    const run = getFlash().run;
    if (!run || run.done) return;
    const no = run.ids[run.index];
    const changed = run.phase === 'word' ? revealFlash(no) : advanceFlash(no);
    if (!changed) return;
    exampleOpen = false; message = '';
    if (getFlash().run.done) pause();
    render();
  }
  function finishHtml(state) {
    const run = state.run;
    return `<div class="vf-done"><header class="cr-topline"><a class="cr-quiet-link" href="#/english">← 영어 홈</a><span class="cr-eyebrow">${run.kind==='review'?'표시한 단어 복습':`묶음 ${number(run.unit+1)}`}</span></header><section class="vf-done-heading"><span>${icon('book-check')}</span><p class="cr-eyebrow">한 번 더 눈에 담기</p><h1 tabindex="-1">${run.ids.length}개, 한 바퀴 봤어요.</h1><p>뜻과 함께 다시 훑어보세요.<br>헷갈리는 단어는 책갈피에 남겨 두면 돼요.</p></section><div class="vf-recap">${run.ids.map(no=>{const w=FLASH_BY_NO[no];return `<article><div><strong lang="en">${esc(w.word)}</strong><p>${esc(w.meaning)}</p></div><button class="cr-tool ${state.marked.includes(no)?'selected':''}" type="button" data-mark="${no}" aria-pressed="${state.marked.includes(no)}" aria-label="${esc(w.word)} ${state.marked.includes(no)?'복습 표시 해제':'복습 표시'}">${icon('bookmark')}</button></article>`;}).join('')}</div><p class="vf-record-note">이번 기록은 뜻을 본 기록이에요. 기존 ‘알았어요’ 복습 기록과 구분됩니다.</p><div class="vf-done-actions"><button class="cr-primary" type="button" data-action="next-unit">${run.kind==='review'?'일반 묶음으로 돌아가기':run.unit===FLASH_UNITS.length-1?'첫 묶음부터 다시':'다음 10개 보기'} ${icon('arrow-right')}</button><button class="cr-secondary" type="button" data-action="repeat">같은 묶음 한 번 더</button>${state.marked.length?`<button class="cr-secondary" type="button" data-action="review">${icon('bookmark')} 헷갈린 ${state.marked.length}개 다시 보기</button>`:''}</div>${saveNote()}</div>`;
  }
  function render() {
    if (disposed) return;
    const focused = root.contains(document.activeElement) ? document.activeElement.dataset.action || (document.activeElement.dataset.mark ? `mark:${document.activeElement.dataset.mark}` : null) : null;
    const state = getFlash(); const run = state.run;
    if (emptyReview || !run) {
      pause();
      root.innerHTML = `<div class="vf-done cr-empty">${icon('bookmark')}<h1>표시한 단어가 아직 없어요.</h1><p>깜빡이를 보다가 헷갈리는 단어에 책갈피를 눌러 주세요.</p><button type="button" class="cr-primary" data-action="begin">단어 10개 보기 ${icon('arrow-right')}</button><a class="cr-quiet-link" href="#/english">영어 홈으로</a></div>`;
    } else if (run.done) {
      pause(); root.innerHTML = finishHtml(state);
    } else {
      const word = FLASH_BY_NO[run.ids[run.index]];
      const meaning = run.phase === 'meaning';
      const marked = state.marked.includes(word.no);
      const seconds = phaseDuration(run.phase,state.speed)/1000;
      root.innerHTML = `<div class="vf-reader"><header class="cr-reader-top"><a class="cr-back" href="#/english" aria-label="영어 홈으로">←</a><span><strong>깜빡이 영어</strong><small>${run.kind==='review'?'헷갈린 단어':`묶음 ${number(run.unit+1)}`} · ${number(run.index+1)} / ${run.ids.length}</small></span><button class="cr-tool ${marked?'selected':''}" type="button" data-action="mark" aria-pressed="${marked}" aria-label="${marked?'복습 표시 해제':'헷갈리는 단어로 표시'}">${icon('bookmark')}</button></header>
        <div class="vf-session-head"><span>${run.kind==='review'?'내가 표시한 단어':esc(FLASH_UNITS[run.unit].theme)}</span><small>${run.ids.length-run.index}개 남음</small></div><div class="vf-position" role="progressbar" aria-label="단어 묶음 위치" aria-valuemin="1" aria-valuemax="${run.ids.length}" aria-valuenow="${run.index+1}"><span style="width:${(run.index+1)/run.ids.length*100}%"></span></div>
        <div class="vf-phase-steps" aria-label="단어와 뜻 표시 순서"><span class="${meaning?'':'current'}">01 <b>단어 ${state.speed}초</b></span><span aria-hidden="true">→</span><span class="${meaning?'current':''}">02 <b>뜻 ${state.speed+1}초</b></span></div>
        <article class="vf-card ${meaning?'shows-meaning':''}"><div class="vf-card-meta"><span>${meaning?'뜻을 확인해요':'먼저 떠올려요'}</span><small>${esc(word.pos)}</small></div><h1 lang="en" class="${word.word.length>16?'vf-long':''}">${esc(word.word)}</h1><div class="vf-answer">${meaning?`<h2>${esc(word.meaning)}</h2><div class="vf-relations">${word.synonym && !['-','—'].includes(word.synonym)?`<span><small>비슷한 뜻</small><b lang="en">${esc(word.synonym)}</b></span>`:''}${word.antonym && !['-','—'].includes(word.antonym)?`<span><small>반대 뜻</small><b lang="en">${esc(word.antonym)}</b></span>`:''}</div>`:'<p class="vf-hidden-answer"><span aria-hidden="true">···</span>어떤 뜻이었는지, 잠깐 떠올려 보세요.</p>'}</div>${meaning?`<details class="vf-example" ${exampleOpen?'open':''}><summary>예문도 보기</summary><p lang="en">${esc(word.example)}</p></details>`:'<p class="vf-card-foot">아래 ‘뜻 보기’를 누르면 바로 확인할 수 있어요.</p>'}<div class="vf-timer" aria-hidden="true">${playing?`<span style="animation-duration:${seconds}s"></span>`:''}</div></article>
        <p class="vf-play-state" role="status">${message || (playing?`${seconds}초 뒤 ${meaning?(run.index===run.ids.length-1?'한 바퀴 요약':'다음 단어'):'뜻이 나와요'} · 자동 재생 중`:'멈춰 있어요 · 재생하거나 직접 넘겨 보세요')}</p>
        <nav class="vf-controls" aria-label="깜빡이 재생"><button type="button" class="cr-secondary" data-action="previous" ${run.index===0?'disabled':''} aria-label="이전 단어">←</button><button type="button" class="cr-primary" data-action="play" aria-pressed="${playing}">${icon(playing?'pause':'circle-play')} ${playing?'일시정지':'자동 재생'}</button><button type="button" class="cr-secondary" data-action="step">${meaning?(run.index===run.ids.length-1?'한 바퀴 끝':'다음 단어'):'뜻 보기'} ${icon('arrow-right')}</button></nav>
        <div class="vf-settings"><fieldset><legend>단어 보는 시간</legend><div>${[2,3,5].map(n=>`<button type="button" data-speed="${n}" data-action="speed-${n}" aria-pressed="${state.speed===n}">${n}초</button>`).join('')}</div></fieldset><label>다른 묶음 고르기<select data-unit data-action="unit" aria-label="10단어 묶음 선택">${run.kind==='review'?'<option value="review" selected>헷갈린 단어 복습 중</option>':''}${FLASH_UNITS.map(unit=>`<option value="${unit.index}" ${run.kind==='unit'&&unit.index===run.unit?'selected':''}>${number(unit.index+1)} · ${esc(unit.theme)} (${unit.words[0].no}–${unit.words.at(-1).no})</option>`).join('')}</select></label></div><p class="vf-footnote">뜻은 단어보다 1초 더 보여요. 다른 화면으로 나가면 재생이 멈춥니다.</p>${saveNote()}</div>`;
    }
    bind(); hydrateIcons(root);
    if (focused) {
      const element = focused.startsWith('mark:') ? root.querySelector(`[data-mark="${focused.slice(5)}"]`) : root.querySelector(`[data-action="${focused}"]`);
      element?.focus({preventScroll:true});
    }
    schedule();
  }
  function bind() {
    root.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',event=>{
      const action = button.dataset.action;
      if (action==='unit' || action.startsWith('speed-') || event.detail>1) return;
      if (action==='play') { playing=!playing; exampleOpen=false; message=''; render(); return; }
      pause();
      const state = getFlash();
      if (action==='step') { step(); return; }
      if (action==='previous') { previousFlash(); exampleOpen=false; message=''; }
      if (action==='mark') { const on=markFlash(state.run.ids[state.run.index]); message=on?'헷갈린 단어로 표시했어요 · 재생은 잠시 멈췄어요':'복습 표시를 해제했어요'; }
      if (action==='begin') { emptyReview=false; startFlash(); }
      if (action==='repeat') repeatFlash();
      if (action==='next-unit') startFlash(state.run.kind==='review'?state.unit:(state.run.unit+1)%FLASH_UNITS.length);
      if (action==='review') startFlash(state.unit,true);
      if (['begin','repeat','next-unit','review'].includes(action)) { exampleOpen=false; message=''; window.scrollTo({top:0}); }
      render();
    }));
    root.querySelectorAll('[data-mark]').forEach(button=>button.addEventListener('click',()=>{markFlash(Number(button.dataset.mark));render();}));
    root.querySelectorAll('[data-speed]').forEach(button=>button.addEventListener('click',()=>{flashSpeed(Number(button.dataset.speed));message='';render();}));
    const unitSelect = root.querySelector('[data-unit]');
    // Keep the open native menu stable while the user chooses a different unit.
    unitSelect?.addEventListener('focus',()=>{
      if (!playing) return;
      pause(); message='묶음을 고르는 동안 잠시 멈췄어요';
      root.querySelector('.vf-play-state').textContent=message;
      const playButton=root.querySelector('[data-action="play"]');
      playButton.innerHTML=`${icon('circle-play')} 자동 재생`;
      playButton.setAttribute('aria-pressed','false');
      root.querySelector('.vf-timer').innerHTML='';
      hydrateIcons(root);
    });
    unitSelect?.addEventListener('change',event=>{if(event.target.value==='review')return;pause();startFlash(Number(event.target.value));exampleOpen=false;message='';render();});
    root.querySelector('.vf-example')?.addEventListener('toggle',event=>{
      exampleOpen=event.target.open;
      if(exampleOpen && playing){pause();message='예문을 읽는 동안 잠시 멈췄어요';render();}
    });
  }
  const onVisibility = () => { if(document.hidden && playing){pause();message='화면을 벗어나 재생을 멈췄어요';render();} };
  const onPageHide = () => pause();
  document.addEventListener('visibilitychange',onVisibility);
  window.addEventListener('pagehide',onPageHide);
  root.onkeydown = event => {
    if(emptyReview || !getFlash().run || getFlash().run.done)return;
    if(event.repeat || event.target.closest('button,a,summary,input,select,textarea'))return;
    if(event.code==='Space' && getFlash().run && !getFlash().run.done){event.preventDefault();playing=!playing;message='';render();}
    if(event.key==='ArrowRight'){event.preventDefault();pause();step();}
    if(event.key==='ArrowLeft'){event.preventDefault();pause();previousFlash();exampleOpen=false;message='';render();}
  };
  render();
  return () => { disposed=true;pause();clock.dispose();document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('pagehide',onPageHide);root.onkeydown=null; };
}
