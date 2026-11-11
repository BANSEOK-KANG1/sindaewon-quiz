import { VISUAL_BY_CARD, visualStep, visualCaption, visualFrame, moveVisualStep } from '../data/bible-visuals.js';
import { icon } from './icons.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const visualImage = visual => `${import.meta.env?.BASE_URL||'./'}${visual.image}`;
export function visualThumbnail(cardId) {
 const v=VISUAL_BY_CARD[cardId];
 return v?`<img class="bv-thumbnail" src="${esc(visualImage(v))}" alt="${esc(v.title)}" width="${v.width}" height="${v.height}" loading="lazy" decoding="async">`:'';
}
function legend(v,selected=-1) {
 if(selected>=0)return `<div class="bv-guided-caption"><p class="bv-look"><span>그림에서 볼 곳</span>${esc(v.looks[selected])}</p><p class="bv-selected-caption"><span>기억할 연결</span><strong>${esc(visualCaption(v,selected))}</strong></p></div>`;
 return `<ol class="bv-legend">${v.steps.map(step=>{
  const [label,...rest]=step.split(' · ');
  return `<li><strong>${esc(label)}</strong><span>${esc(rest.join(' · '))}</span></li>`;
 }).join('')}</ol>`;
}
function canvas(v,selected) {
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${visualFrame(v,selected).join(' ')}" role="img" aria-labelledby="${v.slug}-title ${v.slug}-desc"><title id="${v.slug}-title">${esc(v.title)}</title><desc id="${v.slug}-desc">${esc(visualCaption(v,selected))}</desc><image href="${esc(visualImage(v))}" width="${v.width}" height="${v.height}"/></svg>`;
}
export function renderBibleVisual(cardId) {
 const v=VISUAL_BY_CARD[cardId];
 if(!v)return '';
 const canCrop=v.frames.some(frame=>frame[2]!==v.width);
 const initial=0;
 const frame=visualFrame(v,initial);
 return `<figure class="bv-figure${canCrop?' bv-scene-focused':''}" style="--bv-scene-width:${520*frame[2]/frame[3]}px" data-bible-visual="${esc(cardId)}" data-visual-selected="0">
  <header class="bv-figure-head"><span>${icon('compass')} 그림으로 기억하기 <small>${esc(v.type)}</small></span><button type="button" data-visual-zoom aria-pressed="false">크게 보기</button></header>
  <div class="bv-steps" role="group" aria-label="장면과 본문 연결 선택"><button type="button" data-visual-step="-1" aria-pressed="${initial===-1}">전체 보기</button>${v.steps.map((step,i)=>`<button type="button" data-visual-step="${i}" aria-pressed="${initial===i}"><span>${i+1}</span>${esc(step.split(' · ')[0])}</button>`).join('')}</div>
  <p class="bv-interaction-hint">${canCrop?'장면을 고르면 그 부분을 크게 볼 수 있어요.':'본문 연결을 고르면 설명을 한 줄씩 볼 수 있어요.'}</p>
  <div class="bv-canvas" tabindex="0" role="region" aria-label="${esc(v.title)} 그림. 크게 보기에서는 가로로 이동할 수 있어요.">${canvas(v,initial)}</div>
  <p class="bv-zoom-hint" hidden>옆으로 밀거나 방향키로 그림을 살펴보세요.</p>
  <nav class="bv-scene-nav" aria-label="그림 설명 이동"><button type="button" data-visual-direction="-1" aria-label="이전 그림 설명" disabled>← 이전</button><span data-visual-position>1 / ${v.steps.length}</span><button type="button" data-visual-direction="1" aria-label="다음 그림 설명">다음 →</button></nav>
  <figcaption class="bv-caption" aria-live="polite">${legend(v,initial)}</figcaption>
  <p class="bv-memory-line">${esc(v.footer)}</p>
  <details class="bv-context"><summary>그림 읽는 법과 본문</summary><p>${esc(v.note)}</p><p>본문 이해를 돕는 AI 일러스트입니다. 인물의 실제 외모나 당시 모습을 복원한 자료는 아닙니다.</p><p>${esc(v.reference)}</p><div>${v.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ${icon('external-link')}</a>`).join('')}</div></details>
 </figure>`;
}
export function bindBibleVisuals(root) {
 root.querySelectorAll('[data-bible-visual]').forEach(figure=>{
  const v=VISUAL_BY_CARD[figure.dataset.bibleVisual];
  const surface=figure.querySelector('.bv-canvas');
  const svg=surface.querySelector('svg');
  const zoomButton=figure.querySelector('[data-visual-zoom]');
  const previousButton=figure.querySelector('[data-visual-direction="-1"]');
  const nextButton=figure.querySelector('[data-visual-direction="1"]');
  let selected=Number(figure.dataset.visualSelected);
  const resetZoom=()=>{
   figure.classList.remove('bv-enlarged');
   zoomButton.setAttribute('aria-pressed','false');
   zoomButton.textContent='크게 보기';
   figure.querySelector('.bv-zoom-hint').hidden=true;
   surface.scrollLeft=0;
  };
  const showStep=index=>{
   selected=visualStep(v,index);
   figure.dataset.visualSelected=String(selected);
   figure.querySelectorAll('[data-visual-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.visualStep)===selected)));
   const frame=visualFrame(v,selected);
   svg.setAttribute('viewBox',frame.join(' '));
   svg.querySelector('desc').textContent=visualCaption(v,selected);
   figure.style.setProperty('--bv-scene-width',`${520*frame[2]/frame[3]}px`);
   figure.classList.toggle('bv-scene-focused',frame[2]!==v.width);
   resetZoom();
   figure.querySelector('.bv-caption').innerHTML=legend(v,selected);
   previousButton.disabled=selected<=0;
   nextButton.disabled=selected===v.steps.length-1;
   nextButton.textContent=selected<0?'한 장면씩':selected===v.steps.length-1?'마지막 설명':'다음 →';
   figure.querySelector('[data-visual-position]').textContent=selected<0?'전체 보기':`${selected+1} / ${v.steps.length}`;
  };
  figure.querySelectorAll('[data-visual-step]').forEach(button=>button.addEventListener('click',()=>showStep(Number(button.dataset.visualStep))));
  figure.querySelectorAll('[data-visual-direction]').forEach(button=>button.addEventListener('click',()=>showStep(moveVisualStep(v,selected,Number(button.dataset.visualDirection)))));
  figure.addEventListener('keydown',event=>{
   if(!event.target.closest('.bv-steps,.bv-scene-nav')||!['ArrowLeft','ArrowRight'].includes(event.key))return;
   event.preventDefault();event.stopPropagation();
   showStep(moveVisualStep(v,selected,event.key==='ArrowRight'?1:-1));
  });
  zoomButton.addEventListener('click',()=>{
   const zoomed=figure.classList.toggle('bv-enlarged');
   zoomButton.setAttribute('aria-pressed',String(zoomed));
   zoomButton.textContent=zoomed?'원래 크기':'크게 보기';
   figure.querySelector('.bv-zoom-hint').hidden=!zoomed;
   if(!zoomed)surface.scrollLeft=0;
  });
  surface.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(event.key))event.stopPropagation();});
 });
}
