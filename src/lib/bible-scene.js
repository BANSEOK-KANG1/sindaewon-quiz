import { escapeVisual as esc, localVisualUrl } from './book-visual.js';
import { SCENE_BY_ID } from '../data/bible-scenes.js';

export function sceneThumbnail(scene) {
 return `<img class="atlas-scene-image" src="${localVisualUrl(scene.image)}" alt="${esc(scene.title)}" width="${scene.width}" height="${scene.height}" loading="lazy" decoding="async">`;
}
export function sceneCredit(scene) {
 return `<p class="atlas-credit">Gustave Doré · <a href="${esc(scene.source)}" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> · 퍼블릭 도메인</p>`;
}
export function renderSceneFigure(scene) {
 if (!scene) return '';
 return `<figure class="atlas-scene" id="${scene.id}"><figcaption><small>본문과 연결하는 성경 삽화</small><strong>${esc(scene.title)}</strong></figcaption><a class="atlas-scene-open" href="${localVisualUrl(scene.image)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(scene.title)} 원본 크게 열기">${sceneThumbnail(scene)}<span>원본 크게 열기 ↗</span></a><div class="bv-guided-caption"><p class="bv-look"><span>그림에서 볼 곳</span>${esc(scene.look)}</p><p class="bv-selected-caption"><span>기억할 사실</span><strong>${esc(scene.remember)}</strong></p><a class="atlas-scene-ref" href="${scene.referenceSource}" target="_blank" rel="noopener noreferrer">${esc(scene.reference)} · 본문 확인 ↗</a></div>${sceneCredit(scene)}<details class="atlas-scene-note"><summary>그림의 표현과 출처</summary><p>${esc(scene.note)}</p></details></figure>`;
}

export function renderSceneSequence(scenes) {
 if (!scenes.length) return '';
 if (scenes.length === 1) return renderSceneFigure(scenes[0]);
 return `<section class="atlas-scene-sequence" data-scene-sequence="${scenes.map(s=>s.id).join(',')}" aria-label="이 카드에 연결된 사건 그림">
 <p class="atlas-sequence-heading">이 카드와 연결된 장면 <strong>${scenes.length}개</strong></p>
 <div class="bv-filters atlas-scene-choices" role="group" aria-label="관련 사건 선택">${scenes.map((s,i)=>`<button type="button" data-scene-choice="${i}" aria-pressed="${i===0}">${esc(s.title)}</button>`).join('')}</div>
 <nav class="bv-scene-nav" aria-label="관련 그림 이동"><button type="button" data-scene-direction="-1" disabled>← 이전 그림</button><span data-scene-position role="status">1 / ${scenes.length}</span><button type="button" data-scene-direction="1">다음 그림 →</button></nav>
 <div data-scene-stage>${renderSceneFigure(scenes[0])}</div></section>`;
}

export function bindSceneSequences(root) {
 root.querySelectorAll('[data-scene-sequence]').forEach(sequence => {
  const scenes = sequence.dataset.sceneSequence.split(',').map(id=>SCENE_BY_ID[id]).filter(Boolean);
  if (!scenes.length) return;
  let index = 0;
  const buttons = [...sequence.querySelectorAll('[data-scene-choice]')];
  const show = requested => {
   if (!Number.isInteger(requested)) return;
   const next = Math.max(0,Math.min(scenes.length-1,requested));
   if (next === index) return;
   index = next;
   sequence.querySelector('[data-scene-stage]').innerHTML = renderSceneFigure(scenes[index]);
   buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
   sequence.querySelector('[data-scene-position]').textContent = `${index+1} / ${scenes.length}`;
   sequence.querySelector('[data-scene-direction="-1"]').disabled = index === 0;
   sequence.querySelector('[data-scene-direction="1"]').disabled = index === scenes.length-1;
  };
  buttons.forEach(button=>button.addEventListener('click',()=>show(Number(button.dataset.sceneChoice))));
  sequence.querySelectorAll('[data-scene-direction]').forEach(button=>button.addEventListener('click',()=>show(index+Number(button.dataset.sceneDirection))));
  sequence.addEventListener('keydown',event=>{
   if (!event.target.closest('[data-scene-choice],[data-scene-direction]') || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
   event.preventDefault(); event.stopPropagation();
   show(index+(event.key==='ArrowRight'?1:-1));
   buttons[index].focus({preventScroll:true});
  });
 });
}
