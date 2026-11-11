import { BIBLE_SCENES } from '../data/bible-scenes.js';
import { sceneThumbnail, sceneCredit } from '../lib/bible-scene.js';
import { BIBLE_VISUALS } from '../data/bible-visuals.js';
import { BOOKS } from '../data/book-notes/index.js';
import { CARD_BY_ID } from '../data/commute.js';
import { POSTER_BY_BOOK } from '../data/book-visuals.js';
import { visualThumbnail } from '../lib/bible-visual.js';
import { renderBookPoster, bindBookPosters, posterThumbnail, posterCredit, atlasUrl, escapeVisual as esc } from '../lib/book-visual.js';
import { getQuery } from '../router.js';
import { readLibraryState, libraryUrl, withLibraryReturn, VISUAL_FILTERS } from '../lib/visual-navigation.js';
import { icon, hydrateIcons } from '../lib/icons.js';

export async function renderVisualLibrary(root) {
 const initial = readLibraryState(getQuery());
 let selected=initial.filter, page=initial.page;
 const pageSize=9;
 root.innerHTML=`<div class="bv-library atlas-library"><header class="cr-topline"><a class="cr-quiet-link" href="#/">← 읽기 홈</a><a class="cr-quiet-link" href="#/sprint">한방에 끝내기 ${icon('arrow-right')}</a></header>
 <div class="cr-heading"><p class="cr-eyebrow">구약 39권 · 신약 27권 · 한국어 그림 개요</p><h1>성경을 펼치면,<br>이야기가 보여요.</h1><p>한 권의 흐름을 그림으로 보고,<br>인물·사건·장소를 하나씩 연결하세요.</p></div>
 <div class="atlas-reading-order"><span><b>66</b> 권별 그림 개요</span><span><b>24</b> 사건별 성경 삽화</span><span><b>12</b> 핵심 장면</span><span>확대해서 자세히 보기</span></div>
 <details class="atlas-book-context"><summary>구약·신약 전체를 두 장으로 보기</summary>${renderBookPoster("old-testament-tanak")}${renderBookPoster("new-testament-overview")}</details>
 <label class="cr-search">${icon('search')}<input type="search" value="${esc(initial.term)}" maxlength="120" aria-label="그림 자료 검색" placeholder="책 이름이나 내용으로 찾기 · 창세기, 언약, 부활"></label>
 <div class="bv-filters" role="group" aria-label="성경 그림 종류">${VISUAL_FILTERS.map(label=>`<button type="button" data-visual-filter="${label}" aria-pressed="${selected===label}">${label}</button>`).join('')}</div>
 <p class="bv-results" role="status" tabindex="-1"></p><div class="bv-gallery atlas-book-grid"></div><nav class="atlas-pagination" aria-label="그림 목록 페이지"></nav>
 <p class="bv-library-note">책별 그림 개요는 BibleProject 한국어 포스터 원본입니다. 여러 권을 한 장에 담은 경우 같은 포스터를 함께 사용합니다. 세부 사실의 장·절은 각 책의 학습 내용에서 확인하세요.</p></div>`;
 function render(){
  const searchText=root.querySelector('input').value;
  const term=searchText.trim().replace(/\s/g,'').toLowerCase();
  const isCore=selected==='핵심 12장면';
  const isScene=selected==='사건 24장면';
  const matches=text=>!term||text.replace(/\s/g,'').toLowerCase().includes(term);
  const rows=isScene ? BIBLE_SCENES.filter(s=>matches(`${s.books.join(' ')} ${s.title} ${s.remember}`)) : isCore ? BIBLE_VISUALS.filter(v=>matches(`${v.book} ${v.title} ${v.steps.join(' ')}`)) : BOOKS.filter(b=>(selected==='전체'||selected===b.testament)&&matches(`${b.n} ${b.s} ${b.k.join(' ')} ${b.p.join(' ')}`));
  const pages=Math.max(1,Math.ceil(rows.length/pageSize)); page=Math.min(page,pages-1);
  const returnTo = libraryUrl({filter:selected,term:searchText,page});
  window.history.replaceState(window.history.state,'',returnTo);
  root.querySelector('.bv-results').textContent=`${selected} · ${isCore||isScene?'장면':'성경'} ${rows.length}${isCore||isScene?'개':'권'}${rows.length ? ` · ${page+1} / ${pages}쪽` : ''}`;
  root.querySelector('.bv-gallery').classList.toggle('atlas-core-grid',isCore);
  root.querySelector('.bv-gallery').innerHTML=rows.slice(page*pageSize,(page+1)*pageSize).map(row=>{
   if(isScene) return `<article class="bv-gallery-card"><a class="atlas-scene-tile" href="${esc(withLibraryReturn(`${atlasUrl(row.books[0])}?scene=${row.id}`,returnTo))}">${sceneThumbnail(row)}<span class="bv-gallery-meta">${esc(row.reference)}</span><h2>${esc(row.title)}</h2><span class="bv-gallery-open">그림·사실 함께 읽기 →</span></a>${sceneCredit(row)}</article>`;
   if(isCore){
    const card=CARD_BY_ID[row.cardId];
    return `<article class="bv-gallery-card"><a href="${esc(withLibraryReturn(`#/read/${encodeURIComponent(card.book)}?id=${encodeURIComponent(card.id)}&focus=core`,returnTo))}">${visualThumbnail(row.cardId)}<span class="bv-gallery-meta">${row.book}<small>AI 학습 일러스트</small></span><h2>${row.title}</h2><span class="bv-gallery-open">그림과 본문 보기 →</span></a></article>`;
   }
   const poster=POSTER_BY_BOOK[row.n];
   return `<article class="bv-gallery-card atlas-tile"><a class="atlas-tile-image" href="${esc(withLibraryReturn(atlasUrl(row.n),returnTo))}">${posterThumbnail(poster)}</a>${posterCredit()}<a class="atlas-tile-copy" href="${esc(withLibraryReturn(atlasUrl(row.n),returnTo))}"><span class="bv-gallery-meta">${row.testament} · ${esc(row.g)}<small>${row.c}장</small></span><h2>${esc(row.n)}</h2><p>${esc(row.s)}</p><span class="bv-gallery-open">그림·인물·핵심 사실 →</span></a></article>`;
  }).join('') || '<p class="cr-empty">연결된 자료가 없어요. 책 이름이나 다른 단어로 찾아보세요.</p>';
  root.querySelector('.atlas-pagination').innerHTML=pages>1?`<button type="button" data-page="-1" ${page===0?'disabled':''}>← 이전</button><span>${page+1} / ${pages}</span><button type="button" data-page="1" ${page===pages-1?'disabled':''}>다음 →</button>`:'';
  root.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>{page+=Number(button.dataset.page);render();root.querySelector('.bv-results').scrollIntoView({block:'start'});root.querySelector('.bv-results').focus({preventScroll:true});}));
  hydrateIcons(root);
 }
 root.querySelector('input').addEventListener('input',()=>{page=0;render();});
 root.querySelectorAll('[data-visual-filter]').forEach(button=>button.addEventListener('click',()=>{
  selected=button.dataset.visualFilter;page=0;
  root.querySelectorAll('[data-visual-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();
 }));
 render(); bindBookPosters(root);
}
