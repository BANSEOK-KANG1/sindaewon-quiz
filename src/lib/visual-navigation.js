export const VISUAL_FILTERS = ['전체','구약','신약','사건 24장면','핵심 12장면'];

export function readLibraryState(query = new URLSearchParams()) {
 const requested = Number(query.get('page'));
 return {
  filter: VISUAL_FILTERS.includes(query.get('filter')) ? query.get('filter') : '전체',
  term: (query.get('q') || '').slice(0,120),
  page: Number.isSafeInteger(requested) && requested >= 1 ? Math.min(requested,100)-1 : 0,
 };
}

export function libraryUrl({filter='전체',term='',page=0} = {}) {
 const query = new URLSearchParams();
 if (filter!=='전체' && VISUAL_FILTERS.includes(filter)) query.set('filter',filter);
 if (term.trim()) query.set('q',term.trim().slice(0,120));
 if (Number.isInteger(page) && page>0) query.set('page',String(Math.min(page,99)+1));
 return `#/visuals${query.size ? '?'+query.toString() : ''}`;
}

export function libraryReturnUrl(raw) {
 if (typeof raw !== 'string' || !raw.startsWith('#/visuals?')) return '#/visuals';
 return libraryUrl(readLibraryState(new URLSearchParams(raw.slice('#/visuals?'.length))));
}

export function withLibraryReturn(destination, from) {
 return `${destination}${destination.includes('?') ? '&' : '?'}from=${encodeURIComponent(libraryReturnUrl(from))}`;
}
