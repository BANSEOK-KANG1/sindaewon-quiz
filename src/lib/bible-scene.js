import { escapeVisual as esc, localVisualUrl } from './book-visual.js';

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
