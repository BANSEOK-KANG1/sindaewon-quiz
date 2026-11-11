// Original teaching diagrams. The source notes remain the authority for the text.
import { CORE_CARDS } from './commute.js';
const E = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const C={ink:'#244744',green:'#6e8963',sage:'#dce6d0',cream:'#fcfaf1',gold:'#d2a859',clay:'#b96c48',blue:'#bcd4d9',muted:'#708073'};
const text=(x,y,label,size=26,fill=C.ink,anchor='middle',weight=600)=>`<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${E(label)}</text>`;
const path=(d,fill='none',stroke=C.ink,width=4,extra='')=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const rect=(x,y,w,h,fill=C.sage,r=18,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const circle=(x,y,r,fill=C.gold,stroke='none')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
const g=(x,y,svg,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})">${svg}</g>`;
const arrow=(x1,y1,x2,y2,color=C.green)=>path(`M${x1} ${y1} L${x2} ${y2}`,'none',color,4)+path(`M${x2-8} ${y2-6} L${x2} ${y2} L${x2-8} ${y2+6}`,'none',color,4);
const person=(color=C.green)=>circle(0,-35,12,C.gold)+path('M-21 20 Q-18 -17 0 -18 Q18 -17 21 20Z',color,'none')+path('M-13 22 L-18 47 M13 22 L18 47','none',C.ink,5);
const tent=()=>path('M-70 45 L0 -50 L70 45Z',C.gold)+path('M-34 45 L0 -16 L34 45Z',C.cream)+path('M0 -50 L0 -68 M-83 46 H83','none',C.ink,4);
const stars=()=>[[-58,-36],[-18,-58],[30,-39],[67,-63],[57,6],[-58,14]].map(([x,y])=>g(x,y,path('M0 -7 V7 M-7 0 H7','none',C.gold,3))).join('');
const fire=()=>path('M-18 31 Q-39 7 -9 -31 Q-10 -1 8 0 Q23 -10 20 -26 Q55 17 22 34Z',C.clay,'none')+path('M-1 29 Q-19 14 7 -5 Q5 12 19 15 Q22 30 -1 29Z',C.gold,'none');
const altar=()=>rect(-53,10,106,48,'#c3b7a1',4)+path('M-53 32 H53 M-18 10 V32 M20 32 V58','none','#8c8778',3);
const scroll=()=>path('M-57 -35 H47 Q63 -35 63 -19 V35 H-46 Q-62 35 -62 18 V-35Z','#f5e6bb')+path('M-57 -35 Q-39 -35 -39 -18 V22 Q-39 35 -53 35 M-39 -18 H63','none',C.ink,3)+path('M-23 -3 H42 M-23 10 H32 M-23 23 H42','none',C.green,3);
const crown=()=>path('M-49 -15 L-42 29 H42 L49 -15 L22 2 L0 -28 L-22 2Z',C.gold)+path('M-41 17 H41','none',C.ink,3);
const tree=()=>path('M0 46 V-13 M0 10 L-20 -9 M0 -1 L22 -22','none',C.green,7)+circle(-22,-20,25,C.sage)+circle(20,-33,28,C.sage)+circle(-3,-49,27,C.green);
const envelope=()=>rect(-62,-37,124,76,'#fffdf5',5,C.green)+path('M-60 -33 L0 10 L60 -33 M-60 36 L-20 0 M60 36 L20 0','none',C.green,3);
const bowl=()=>path('M-45 0 Q-38 48 0 48 Q38 48 45 0Z',C.gold)+path('M-45 0 Q0 -16 45 0','none',C.ink,3);
const tablet=()=>path('M-43 43 L-47 -25 L-31 -51 L27 -53 L46 -29 L43 43Z','#c8c7b7')+[-25,-8,9,26].map(y=>path(`M-27 ${y} H27`,'none',C.green,3)).join('');
const stool=()=>rect(-48,-18,96,14,C.gold,4)+path('M-32 -4 L-40 45 M32 -4 L40 45','none',C.ink,5);
const house=()=>path('M-63 -20 L0 -65 L63 -20Z',C.clay)+rect(-51,-20,102,79,'#e7d7b4',2)+rect(-13,15,26,44,C.green,0)+rect(-37,-5,17,19,C.cream,0)+rect(20,-5,17,19,C.cream,0);
const chapter=(x,y,label)=>rect(x-47,y-24,94,33,C.ink,16)+text(x,y,label,19,'#fffaf0');
const stage=(i,body)=>`<g data-visual-part="${i}">${body}</g>`;
function panel(x,y,w,h,i,label,ref,art,bg=C.sage) {
 return stage(i,rect(x,y,w,h,bg)+chapter(x+61,y+35,ref)+g(x+w/2,y+h/2+3,art)+text(x+w/2,y+h-18,label,26));
}
const grid=(items)=>items.map((it,i)=>panel(24+(i%2)*384,86+Math.floor(i/2)*218,368,202,i,it.label,it.ref,it.art,it.bg||(['#e3e9d8','#f1e5ca','#dce8e7','#eee2d6'][i]))).join('');
function svg(slug,title,description,body,footer) {
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560" role="img" aria-labelledby="${slug}-title ${slug}-desc" font-family="Noto Sans CJK KR, Apple SD Gothic Neo, sans-serif"><title id="${slug}-title">${E(title)}</title><desc id="${slug}-desc">${E(description)}</desc>${rect(0,0,800,560,C.cream,22)}${text(28,49,title,30,C.ink,'start',700)}${text(771,46,'말씀 그림 노트',14,C.muted,'end',500)}${body}${text(400,540,footer,17,C.muted,'middle',500)}</svg>`;
}
const definitions=[
 {cardId:'창세기:0',slug:'01-abraham',title:'아브라함의 네 장면',type:'장면 순서',note:'장 순서로 보는 상징 그림입니다.',steps:['12장 · 고향을 떠나는 부르심','15장 · 횃불 언약과 믿음','17장 · 아브라함이라는 이름과 할례','22장 · 이삭 대신 준비된 숫양'],
 body:()=>grid([
  {label:'부르심',ref:'12장',art:g(-18,6,tent(),.55)+arrow(35,24,105,24)},
  {label:'횃불 언약',ref:'15장',art:g(0,0,stars(),.9)+g(0,6,fire(),.85)},
  {label:'이름과 할례',ref:'17장',art:g(-63,4,person(),.6)+text(33,-8,'아브람',22)+text(33,28,'아브라함',25)+arrow(-12,6,76,6)},
  {label:'여호와 이레',ref:'22장',art:g(-40,8,altar(),.65)+g(52,5,`<ellipse cx="0" cy="0" rx="27" ry="18" fill="#f5ecd6" stroke="${C.ink}" stroke-width="3"/>${circle(31,-10,14,C.cream,C.ink)}${path('M33 -17 C12 -37 12 0 31 -8 M-17 16 V38 M11 17 V38','none',C.ink,4)}`,1)},
 ]),footer:'12 부르심 → 15 횃불 → 17 이름·할례 → 22 숫양'},
 {cardId:'창세기:1',slug:'02-jacob',title:'같은 야곱, 다른 두 장소',type:'장소 비교',note:'두 장면을 나란히 놓은 그림이며 지리적 위치나 거리를 뜻하지 않습니다.',steps:['벧엘 · 사닥다리 꿈을 꾼 장소','브니엘 · 씨름 뒤 붙인 장소 이름'],
 body:()=>stage(0,rect(24,86,368,400,'#dce5e2')+chapter(89,124,'28장')+g(207,203,stars(),.8)+g(207,273,path('M-85 86 L36 -96 M-51 102 L70 -80','none',C.ink,8)+[0,1,2,3,4,5].map(n=>path(`M${-76+n*20} ${72-n*30} l34 16`,'none',C.gold,7)).join('')+path('M-121 111 Q-60 92 3 113 T148 109','none',C.green,4)+g(-78,92,person(),.55))+text(208,444,'벧엘 · 사닥다리 꿈',27))+
 stage(1,rect(408,86,368,400,'#eee2d2')+chapter(472,124,'32장')+g(593,277,path('M-150 90 Q-80 57 -20 93 T160 97','none',C.blue,28)+g(-36,0,person(C.green),1.15)+g(37,0,person(C.clay),1.15)+path('M-53 -9 L20 -22 M53 -9 L-20 -22','none',C.ink,7))+text(593,407,'야곱 → 이스라엘',24)+text(593,444,'브니엘 · 얍복강 씨름',27)),footer:'이스라엘 = 사람 이름     브니엘 = 장소 이름'},
 {cardId:'출애굽기:core-moses-signs',slug:'03-moses',title:'표징의 재료와 재앙의 재료',type:'상징 비교',note:'출애굽기 4장의 세 표징과 9장의 재앙을 재료 그림으로 구분합니다.',steps:['4장 · 지팡이·손·물이 표징의 재료','9장 · 화덕의 재를 날려 종기가 생김'],
 body:()=>stage(0,rect(24,86,485,400,'#e2e8d8')+chapter(89,126,'4장')+text(267,172,'모세에게 주신 표징',27)+g(120,275,path('M-25 58 V-52 Q-25 -79 -3 -70','none',C.clay,9)+path('M18 53 C70 15 1 20 45 -27 Q68 -46 41 -57','none',C.green,9))+g(270,275,path('M-31 42 L-45 4 Q-47 -14 -31 -8 L-20 7 V-43 Q-15 -60 -7 -43 V-3 V-58 Q2 -70 10 -55 V-4 V-47 Q20 -59 27 -44 V2 V-26 Q37 -38 44 -23 V32 Q38 67 -7 65Z',C.gold))+g(423,275,path('M0 -58 C-18 -30 -45 -4 -39 21 C-30 65 32 65 40 21 C44 -3 19 -30 0 -58Z',C.blue)+path('M-36 20 Q0 0 38 20 Q29 57 0 55 Q-30 57 -36 20Z',C.clay,'none'))+text(120,391,'지팡이',24)+text(270,391,'손',24)+text(421,391,'물',24))+
 stage(1,rect(525,86,251,400,'#eee0d1')+chapter(590,126,'9장')+g(650,276,rect(-56,-37,112,98,'#bdb4a3',9)+rect(-30,-10,60,65,C.ink,24)+g(0,23,fire(),.7)+[-40,-10,20,50].map((x,i)=>circle(x,-75-i%2*18,5,C.muted)).join(''))+text(650,391,'재 → 종기',26)),footer:'4장 표징과 9장 여섯째 재앙을 구분해요'},
 {cardId:'여호수아:core-covenant-places',slug:'04-joshua',title:'산의 제단, 세겜의 언약',type:'장소 비교',note:'장면을 비교한 도식입니다. 실제 지형이나 건축물을 복원한 그림은 아닙니다.',steps:['에발산 · 제단·돌에 기록한 율법·낭독','세겜 · 백성이 모여 언약과 섬김을 결단'],
 body:()=>stage(0,rect(24,86,368,400,'#e0e7d6')+chapter(87,126,'8장')+path('M46 370 L177 166 L355 370Z','#b7c7a6','none')+path('M177 166 L140 226 L184 212 L219 223Z','#f7f6e8','none')+g(202,328,altar(),.9)+g(277,268,tablet(),.45)+text(207,440,'에발산 · 율법 낭독',27))+
 stage(1,rect(408,86,368,400,'#f0e5cd')+chapter(470,126,'24장')+g(588,226,tree(),.9)+[0,1,2,3,4].map((_,i)=>g(470+i*62,350,person(i%2?C.green:C.clay),.55)).join('')+g(594,326,scroll(),.62)+text(592,440,'세겜 · 언약과 결단',27)),footer:'에발산 8장 · 세겜 24장'},
 {cardId:'사무엘하:core-david-covenant',slug:'05-david',title:'나단이 전한 하나의 왕조 약속',type:'전달 관계도',note:'화살표는 약속의 전달과 두 책의 병행 기록을 나타냅니다.',steps:['사무엘하 7장 · 나단이 다윗에게 전함','역대상 17장 · 같은 약속의 병행 기록'],
 body:()=>rect(275,84,250,54,'#e6dfc7')+text(400,120,'하나님의 약속',26)+path('M400 141 V172','none',C.green,4)+g(205,245,person(),1)+text(205,320,'나단',27)+g(595,238,crown(),1.1)+text(595,320,'다윗과 후손',27)+arrow(275,238,515,238)+text(398,219,'전달',22,C.muted)+path('M400 172 H205 V190 M595 330 V360 H205 V382 M595 360 V382','none',C.green,4)+stage(0,g(205,422,scroll(),.88)+text(205,499,'사무엘하 7장',25))+stage(1,g(595,422,scroll(),.88)+text(595,499,'역대상 17장',25))+text(400,430,'같은 약속',22,C.muted),footer:'한 사건의 병행 기록 · 두 번의 별개 언약이 아니에요'},
 {cardId:'욥기:core-wisdom-locations',slug:'06-wisdom',title:'지혜를 기억하는 두 가지 그림',type:'개념 그림',note:'나무와 갈림길은 구절을 기억하기 위한 비유 그림입니다.',steps:['욥 28:28 · 경외와 악을 떠남','잠 1:7·9:10 · 지식과 지혜의 근본'],
 body:()=>stage(0,rect(24,86,368,400,'#e2e8dc')+chapter(91,126,'욥 28')+path('M208 372 V274 L128 202 M208 274 L284 202','none',C.ink,17)+circle(128,202,20,C.sage,C.green)+path('M272 190 L296 214 M296 190 L272 214','none',C.clay,7)+text(208,424,'경외 · 악을 떠남',27)+text(208,465,'28:28',20,C.muted))+
 stage(1,rect(408,86,368,400,'#f0e6cf')+chapter(475,126,'잠언')+g(594,267,tree(),1.5)+path('M594 337 L560 373 M594 337 V379 M594 337 L628 373','none',C.green,6)+text(593,424,'지식 · 지혜의 근본',26)+text(593,465,'1:7 · 9:10',20,C.muted)),footer:'같은 “경외”라도 책과 표현을 함께 기억해요'},
 {cardId:'스가랴:core-prophetic-visions',slug:'07-visions',title:'환상을 사물 그림으로 연결하기',type:'환상 도감',note:'본문에 등장하는 사물을 단순화한 상징 그림입니다.',steps:['슥 4장 · 등잔대와 두 감람나무','슥 5장 · 날아가는 두루마리','슥 6장 · 네 병거','렘 24장 · 좋은 무화과와 나쁜 무화과'],
 body:()=>grid([
  {label:'등잔대 · 감람나무 둘',ref:'슥 4',art:g(-92,7,tree(),.7)+g(92,7,tree(),.7)+path('M0 52 V-55 M-40 -40 V-12 Q-40 8 0 8 M40 -40 V-12 Q40 8 0 8 M-26 -48 V-18 Q-26 -3 0 -3 M26 -48 V-18 Q26 -3 0 -3 M-13 -54 V-25 Q-13 -15 0 -15 M13 -54 V-25 Q13 -15 0 -15 M-28 52 H28','none',C.gold,6)+[-40,-26,-13,0,13,26,40].map((x,i)=>circle(x,[-43,-51,-57,-62,-57,-51,-43][i],4,C.clay)).join('')},
  {label:'날아가는 두루마리',ref:'슥 5',art:scroll()+path('M-96 6 H-73 M77 -15 H102 M82 4 H119','none',C.blue,4)},
  {label:'네 병거',ref:'슥 6',art:[-105,-35,35,105].map(x=>g(x,3,path('M-23 -20 V16 H23 V-10','none',C.ink,4)+circle(-14,22,9,C.gold,C.ink)+circle(17,22,9,C.gold,C.ink),.85)).join('')},
  {label:'무화과 두 광주리',ref:'렘 24',art:[-57,57].map((x,i)=>g(x,-4,bowl()+[-18,0,18].map((xx,j)=>circle(xx,-7-j%2*8,11,i?C.clay:C.green)).join('')+text(0,64,i?'나쁜 것':'좋은 것',20),.75)).join('')},
 ]),footer:'스가랴 4·5·6장 / 무화과 광주리는 예레미야 24장'},
 {cardId:'누가복음:core-gospel-scenes',slug:'08-gospels',title:'사건 옆에 복음서 이름 붙이기',type:'장면 비교',note:'사물과 인물은 기억을 돕는 상징으로 그렸습니다.',steps:['누가 1장 · 마리아의 찬양','누가 12장 · 어리석은 부자 비유','누가 23장 · 헤롯 앞의 예수님','마태 17장 · 물고기 입의 성전세 동전'],
 body:()=>grid([
  {label:'마리아의 찬양',ref:'눅 1',art:g(-18,8,person(C.clay),.9)+path('M25 -20 V16 Q5 35 0 15 Q3 4 25 7 M25 -20 L60 -31 V5 Q42 23 35 8 Q37 -2 60 -4','none',C.green,4)},
  {label:'어리석은 부자',ref:'눅 12',art:g(-20,10,house(),.8)+g(55,16,bowl(),.65)},
  {label:'헤롯 앞의 예수님',ref:'눅 23',art:g(-67,13,person(),.85)+g(55,20,stool(),.7)+g(55,-34,crown(),.55)},
  {label:'물고기 입의 동전',ref:'마 17',art:path('M-75 0 L-112 -31 V31Z',C.blue)+path('M-75 0 Q-13 -66 65 0 Q-13 66 -75 0Z',C.blue)+circle(30,-9,4,C.ink)+circle(72,7,17,C.gold,C.ink)+text(72,14,'◦',20)},
 ]),footer:'누가의 세 장면 · 마태의 성전세'},
 {cardId:'사도행전:core-paul-journeys',slug:'09-paul',title:'바울의 여행과 세 도시',type:'도시 지도',note:'고린도·드로아·루스드라의 대략적 위치를 표시한 학습 지도입니다. 각 여행에서 고른 장면이며, 전체 이동 경로나 거리 비례 지도는 아닙니다.',steps:['1차 · 루스드라 · 바나바를 제우스, 바울을 헤르메스라 부름','2차 · 고린도 · 아굴라·브리스길라를 만나 함께 일함','3차 · 드로아 · 유두고가 떨어졌다가 살아남'],
 sources:[{label:'루스드라 위치',url:'https://www.openbible.info/geo/ancient/af0719d/lystra'},{label:'고린도 위치',url:'https://www.openbible.info/geo/modern/me0518f'},{label:'드로아 위치',url:'https://www.openbible.info/geo/ancient/a91c509'}],
 body:()=>rect(24,83,752,407,'#d9e8e9')+path('M25 85 H353 L336 126 L302 136 L315 172 L270 195 L285 235 L261 250 L248 290 L210 302 L238 332 L225 349 L190 321 L164 343 L144 311 L102 328 L71 299 L25 294Z','#e2e5c9','#acbda6',3)+path('M414 85 H776 V399 L717 387 L650 401 L594 382 L528 390 L492 352 L464 341 L471 310 L449 297 L462 270 L440 254 L449 224 L427 200 L421 169 L399 148Z','#e2e5c9','#acbda6',3)+path('M145 340 L195 338 L215 373 L193 414 L160 396 L140 419 L109 386Z','#e2e5c9','#acbda6',3)+path('M277 440 Q321 421 373 440 L353 451 L296 452Z','#e2e5c9','#acbda6',2)+text(143,144,'그리스',22,C.muted)+text(629,145,'소아시아',25,C.muted)+text(336,346,'에게해',24,'#7c9d9f')+text(735,118,'북 ↑',18,C.muted)+stage(0,circle(648,349,22,C.clay)+text(648,357,'1',22,'white')+text(650,279,'루스드라',28)+text(650,307,'1차 · 행 14장',20,C.clay))+stage(1,circle(201,327,22,C.green)+text(201,335,'2',22,'white')+text(114,257,'고린도',28)+text(114,283,'2차 · 행 18장',20,C.green)+path('M162 288 L192 311','none',C.green,2))+stage(2,circle(415,204,22,C.ink)+text(415,212,'3',22,'white')+text(502,202,'드로아',28)+text(513,229,'3차 · 행 20장',20,C.ink)),footer:'위치 참고: OpenBible.info · 해안선과 배치는 학습용으로 단순화'},
 {cardId:'빌립보서:core-timothy-senders',slug:'10-timothy',title:'디모데에서 여섯 편지로',type:'편지 연결도',note:'화살표는 편지 첫머리에 이름이 함께 적힌 관계를 뜻합니다. 공동 집필 여부를 판정한 도식은 아닙니다.',steps:['빌립보서·골로새서 · 바울과 디모데','데살로니가전후서 · 바울·실루아노·디모데','고린도후서·빌레몬서 · 바울과 디모데'],
 body:()=>g(350,157,person(),.75)+g(450,157,person(C.clay),.75)+text(400,228,'바울 · 디모데',29)+path('M400 246 V277 M142 277 H658 M142 277 V319 M400 277 V319 M658 277 V319','none',C.green,4)+[0,1,2].map((i)=>stage(i,g(142+i*258,372,envelope(),1.1)+text(142+i*258,446,['빌립보서 · 골로새서','데살로니가전후서','고린도후서 · 빌레몬서'][i],22)+text(142+i*258,481,i===1?'실루아노도 함께':'각 편지의 첫머리',18,C.muted))).join(''),footer:'빌·골 / 살전·살후 / 고후·몬 = 여섯 편지'},
 {cardId:'로마서:core-people-roles',slug:'11-romans',title:'로마서 16장, 세 가지 역할',type:'인물 역할도',note:'기록·교회 일꾼·대접이라는 본문의 역할을 도구와 장면으로 연결합니다.',steps:['더디오 · 22절 · 편지를 기록한 사람','뵈뵈 · 1–2절 · 겐그레아 교회의 일꾼','가이오 · 23절 · 바울과 교회를 대접한 사람'],
 body:()=>[0,1,2].map(i=>stage(i,rect(24+i*258,86,236,400,['#e2e8d9','#eee3d0','#dce8e5'][i])+chapter(87+i*258,128,['22절','1–2절','23절'][i])+g(142+i*258,261,[scroll()+path('M-2 39 L64 -40 Q65 -67 39 -52 L-2 39Z',C.gold),g(0,-12,house(),.7)+g(-39,42,person(),.5)+g(44,42,person(C.clay),.5),g(0,17,stool(),1)+g(0,-27,bowl(),.6)][i],.9)+text(142+i*258,397,['더디오','뵈뵈','가이오'][i],30)+text(142+i*258,440,['기록','교회 일꾼','대접'][i],25,C.green))).join(''),footer:'이름마다 역할 하나씩 붙여요'},
 {cardId:'히브리서:core-faith-names',slug:'12-hebrews',title:'히브리서 11장의 이름 펼쳐 보기',type:'본문 이름 지도',note:'32절에 나오는 이름의 열거 순서를 나타내며 연대순은 아닙니다. 드보라의 믿음에 대한 판단이 아니라 이름의 직접 언급 여부를 구분합니다.',steps:['22절 · 요셉이 출애굽과 자신의 뼈에 관해 부탁함','32절 · 기드온·바락·삼손·입다·다윗·사무엘과 선지자들','이름 구분 · 바락은 직접 나오고 드보라는 직접 나오지 않음'],
 body:()=>stage(0,rect(24,86,230,400,'#e1e8d7')+chapter(88,127,'22절')+g(138,248,scroll(),.9)+text(139,356,'요셉',32)+text(139,401,'출애굽 · 뼈',23,C.green))+
 stage(1,rect(272,86,504,307,'#efe4ce')+chapter(338,127,'32절')+['기드온','바락','삼손','입다','다윗','사무엘'].map((name,i)=>g(363+i%3*148,211+Math.floor(i/3)*105,circle(0,-8,33,i===1?C.gold:'#e2d3b0')+text(0,1,name,24)+text(0,38,String(i+1).padStart(2,'0'),15,C.muted))).join('')+text(525,378,'그리고 선지자들',22,C.muted))+
 stage(2,rect(272,409,504,77,'#dce8e6')+text(524,444,'바락 ○    드보라 이름은 없음',24)+text(524,472,'본문에 적힌 이름을 구분해요',17,C.muted)),footer:'32절의 열거 순서 · 인물의 연대순이 아니에요'},
];
export const BIBLE_VISUALS=definitions.map((definition,index)=>{
 const card=CORE_CARDS.find(card=>card.id===definition.cardId);
 if(!card)throw new Error(`Missing source card: ${definition.cardId}`);
 const {body,...meta}=definition;
 return {...meta,cardId:card.id,book:card.book,reference:card.reference,svg:svg(meta.slug,meta.title,meta.steps.join('. '),body(),meta.footer),sources:[...(card.sources||[{label:'창세기 본문',url:`https://www.biblegateway.com/passage/?search=Genesis+${index===0?'12%3B15%3B17%3B22':'28%3B32'}&version=NIV`}]),...(meta.sources||[])]};
});
export const VISUAL_BY_CARD=Object.fromEntries(BIBLE_VISUALS.map(v=>[v.cardId,v]));
export function visualStep(visual,index) {
 return Number.isInteger(index)&&index>=0&&index<visual.steps.length ? index : -1;
}
export function visualCaption(visual,index=-1) {
 const selected=visualStep(visual,index);
 return selected<0?visual.steps.join(' / '):visual.steps[selected];
}

// Scene panels can fill a small screen. Maps and connected diagrams keep their context.
const sceneFrames = {
 '01-abraham': [[12,74,392,226],[396,74,392,226],[12,292,392,226],[396,292,392,226]],
 '02-jacob': [[12,74,392,424],[396,74,392,424]],
 '03-moses': [[12,74,509,424],[513,74,275,424]],
 '04-joshua': [[12,74,392,424],[396,74,392,424]],
 '06-wisdom': [[12,74,392,424],[396,74,392,424]],
 '07-visions': [[12,74,392,226],[396,74,392,226],[12,292,392,226],[396,292,392,226]],
 '08-gospels': [[12,74,392,226],[396,74,392,226],[12,292,392,226],[396,292,392,226]],
 '11-romans': [[12,74,260,424],[270,74,260,424],[528,74,260,424]],
};
export function visualFrame(visual,index=-1) {
 const selected=visualStep(visual,index);
 return [...(sceneFrames[visual.slug]?.[selected] || [0,0,800,560])];
}
