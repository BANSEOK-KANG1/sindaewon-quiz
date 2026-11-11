import { VISUAL_BY_CARD, visualStep, visualCaption } from '../data/bible-visuals.js';
import { icon } from './icons.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const visualImage = visual => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(visual.svg)}`;
export function visualThumbnail(cardId) {
 const visual=VISUAL_BY_CARD[cardId];
 return visual?`<img class="bv-thumbnail" src="${visualImage(visual)}" alt="${esc(visual.title)}" width="800" height="560" loading="lazy">`:'';
}
export function renderBibleVisual(cardId) {
 const v=VISUAL_BY_CARD[cardId];
 if(!v)return '';
 return `<figure class="bv-figure" data-bible-visual="${esc(cardId)}"><header class="bv-figure-head"><span>${icon('compass')} 그림으로 기억하기 <small>${esc(v.type)}</small></span><button type="button" data-visual-zoom aria-pressed="false">크게 보기</button></header><div class="bv-canvas" tabindex="0" role="region" aria-label="${esc(v.title)} 그림. 크게 보기에서는 가로로 이동할 수 있어요.">${v.svg}</div><p class="bv-zoom-hint" hidden>옆으로 밀거나 방향키로 그림을 살펴보세요.</p><div class="bv-steps" role="group" aria-label="그림에서 강조할 장면"><button type="button" data-visual-step="-1" aria-pressed="true">전체 보기</button>${v.steps.map((step,i)=>`<button type="button" data-visual-step="${i}" aria-pressed="false"><span>${i+1}</span>${esc(step.split(' · ')[0])}</button>`).join('')}</div><figcaption class="bv-caption" aria-live="polite">${esc(visualCaption(v))}</figcaption><details class="bv-context"><summary>그림 읽는 법과 본문</summary><p>${esc(v.note)}</p><p>${esc(v.reference)}</p><div>${v.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ${icon('external-link')}</a>`).join('')}</div></details></figure>`;
}
export function bindBibleVisuals(root) {
 root.querySelectorAll('[data-bible-visual]').forEach(figure=>{
  const v=VISUAL_BY_CARD[figure.dataset.bibleVisual];
  figure.querySelectorAll('[data-visual-step]').forEach(button=>button.addEventListener('click',()=>{
   const selected=visualStep(v,Number(button.dataset.visualStep));
   figure.querySelectorAll('[data-visual-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.visualStep)===selected)));
   figure.querySelectorAll('[data-visual-part]').forEach(part=>part.classList.toggle('bv-dim',selected>=0&&Number(part.dataset.visualPart)!==selected));
   figure.querySelector('.bv-caption').textContent=visualCaption(v,selected);
  }));
  figure.querySelector('[data-visual-zoom]').addEventListener('click',event=>{
   const zoomed=figure.classList.toggle('bv-enlarged');
   event.currentTarget.setAttribute('aria-pressed',String(zoomed));
   event.currentTarget.textContent=zoomed?'원래 크기':'크게 보기';
   figure.querySelector('.bv-zoom-hint').hidden=!zoomed;
   if(!zoomed)figure.querySelector('.bv-canvas').scrollLeft=0;
  });
  figure.querySelector('.bv-canvas').addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(event.key))event.stopPropagation();});
 });
}
