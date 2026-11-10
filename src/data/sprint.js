export const SPRINT_STAGES = [
  { title: '시작과 언약', detail: '아브라함 · 야곱 · 모세 · 여호수아', start: 0, end: 4 },
  { title: '약속과 지혜', detail: '다윗 언약 · 지혜의 말씀 · 선지자의 환상', start: 4, end: 7 },
  { title: '복음과 교회', detail: '복음서 · 바울의 여행과 편지 · 믿음의 인물', start: 7, end: 12 },
];
export const sprintStage = index => SPRINT_STAGES.find(stage => index >= stage.start && index < stage.end) || SPRINT_STAGES[0];
export function sprintRecap(card) {
  // The short identity mnemonic alone omits the two places this lesson compares.
  if (card.id === '창세기:1') return `${card.items.map(([chapter,place]) => `${chapter} ${place}`).join(' / ')} · ${card.takeaway}`;
  return card.takeaway || card.lead;
}
