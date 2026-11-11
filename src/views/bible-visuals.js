import { BIBLE_VISUALS } from '../data/bible-visuals.js';
import { CARD_BY_ID } from '../data/commute.js';
import { visualThumbnail } from '../lib/bible-visual.js';
import { icon, hydrateIcons } from '../lib/icons.js';
const category=index=>[1,3,8].includes(index)?'사건·장소':[4,9,10,11].includes(index)?'인물·관계':'장면·사물';
export async function renderVisualLibrary(root) {
 let selected='전체';
 root.innerHTML=`<div class="bv-library"><header class="cr-topline"><a class="cr-quiet-link" href="#/">← 읽기 홈</a><a class="cr-quiet-link" href="#/sprint">한방에 끝내기 ${icon('arrow-right')}</a></header><div class="cr-heading"><p class="cr-eyebrow">핵심 연결 12개 · 그림으로 다시 보기</p><h1>읽던 말씀이,<br>그림으로 이어져요.</h1><p>인물의 표정과 동작, 사건이 일어난 장소까지.<br>그림을 고르면 본문과 함께 크게 볼 수 있어요.</p></div><div class="bv-filters" role="group" aria-label="성경 그림 종류">${['전체','사건·장소','인물·관계','장면·사물'].map(label=>`<button type="button" data-visual-filter="${label}" aria-pressed="${selected===label}">${label}</button>`).join('')}</div><p class="bv-results" role="status"></p><div class="bv-gallery"></div><p class="bv-library-note">첫 핵심 묶음 12개를 위한 AI 학습 일러스트입니다. 장·절과 이름은 그림 아래에서 확인하세요. 실제 인물의 외모나 당시 모습을 복원한 자료는 아닙니다.</p></div>`;
 function render(){
  const rows=BIBLE_VISUALS.map((v,i)=>({...v,index:i,category:category(i)})).filter(v=>selected==='전체'||selected===v.category);
  root.querySelector('.bv-results').textContent=`${selected} · 그림 ${rows.length}장`;
  root.querySelector('.bv-gallery').innerHTML=rows.map(v=>{
   const card=CARD_BY_ID[v.cardId];
   return `<a class="bv-gallery-card" href="#/read/${encodeURIComponent(card.book)}?id=${encodeURIComponent(card.id)}&focus=core">${visualThumbnail(v.cardId)}<span class="bv-gallery-meta">${String(v.index+1).padStart(2,'0')} · ${v.book}<small>${v.type}</small></span><h2>${v.title}</h2><span class="bv-gallery-open">그림과 본문 보기 ${icon('arrow-right')}</span></a>`;
  }).join('');
  hydrateIcons(root);
 }
 root.querySelectorAll('[data-visual-filter]').forEach(button=>button.addEventListener('click',()=>{
  selected=button.dataset.visualFilter;
  root.querySelectorAll('[data-visual-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  render();
 }));
 render();
}
