import { mkdir, writeFile } from 'node:fs/promises';
import { BIBLE_VISUALS } from '../src/data/bible-visuals.js';
const destination=new URL('../public/visuals/',import.meta.url);
await mkdir(destination,{recursive:true});
for(const visual of BIBLE_VISUALS) await writeFile(new URL(`${visual.slug}.svg`,destination),visual.svg+'\n');
console.log(`Exported ${BIBLE_VISUALS.length} original SVG teaching diagrams`);
