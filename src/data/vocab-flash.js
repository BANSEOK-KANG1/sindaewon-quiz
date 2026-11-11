import WORDS from './vocab-300-words.json' with { type: 'json' };
import { VOCAB_DAY_TRACKS } from './study-curriculum.js';

export const FLASH_WORDS = WORDS;
export const FLASH_BY_NO = Object.fromEntries(WORDS.map(word => [word.no, word]));
export const FLASH_UNITS = Array.from({ length: Math.ceil(WORDS.length / 10) }, (_, index) => ({
  index,
  theme: VOCAB_DAY_TRACKS[Math.floor(index / 2)]?.theme || '단어 읽기',
  words: WORDS.slice(index * 10, index * 10 + 10),
}));
export const phaseDuration = (phase, speed) => (([2,3,5].includes(speed) ? speed : 3) + (phase === 'meaning' ? 1 : 0)) * 1000;
