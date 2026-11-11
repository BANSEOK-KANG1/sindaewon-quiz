// Source-linked captions stay separate from generated illustration pixels.
import { CORE_CARDS } from './commute.js';
const definitions = [
  {
    "cardId": "창세기:0",
    "slug": "01-abraham",
    "title": "아브라함의 네 장면",
    "type": "장면 순서",
    "note": "창세기 12·15·17·22장을 순서대로 그린 학습용 장면입니다. 17장은 언약 장면으로 표현했으며 할례 자체를 묘사하지 않았습니다.",
    "steps": [
      "12장 · 고향을 떠나는 부르심",
      "15장 · 횃불 언약과 믿음",
      "17장 · 아브라함이라는 이름과 할례",
      "22장 · 이삭 대신 준비된 숫양"
    ],
    "footer": "12 부르심 → 15 횃불 → 17 이름·할례 → 22 숫양",
    "sources": [
      {
        "label": "창세기 본문",
        "url": "https://www.biblegateway.com/passage/?search=Genesis+12%3B15%3B17%3B22&version=NIV"
      }
    ]
  },
  {
    "cardId": "창세기:1",
    "slug": "02-jacob",
    "title": "같은 야곱, 다른 두 장소",
    "type": "장소 비교",
    "note": "왼쪽은 벧엘의 사닥다리 꿈, 오른쪽은 얍복강에서의 씨름입니다. 이스라엘은 사람 이름, 브니엘은 장소 이름입니다.",
    "steps": [
      "벧엘 · 사닥다리 꿈을 꾼 장소",
      "브니엘 · 씨름 뒤 붙인 장소 이름"
    ],
    "footer": "이스라엘 = 사람 이름     브니엘 = 장소 이름",
    "sources": [
      {
        "label": "창세기 본문",
        "url": "https://www.biblegateway.com/passage/?search=Genesis+28%3B32&version=NIV"
      }
    ]
  },
  {
    "cardId": "출애굽기:core-moses-signs",
    "slug": "03-moses",
    "title": "표징의 재료와 재앙의 재료",
    "type": "상징 비교",
    "note": "왼쪽의 지팡이·손·물은 출애굽기 4장의 표징, 오른쪽의 화덕 재는 9장의 재앙과 연결합니다.",
    "steps": [
      "4장 · 지팡이·손·물이 표징의 재료",
      "9장 · 화덕의 재를 날려 종기가 생김"
    ],
    "footer": "4장 표징과 9장 여섯째 재앙을 구분해요",
    "sources": [
      {
        "label": "출애굽기 4장",
        "url": "https://www.biblegateway.com/passage/?search=Exodus%204&version=NIV"
      },
      {
        "label": "출애굽기 9장",
        "url": "https://www.biblegateway.com/passage/?search=Exodus%209&version=NIV"
      }
    ]
  },
  {
    "cardId": "여호수아:core-covenant-places",
    "slug": "04-joshua",
    "title": "산의 제단, 세겜의 언약",
    "type": "장소 비교",
    "note": "왼쪽은 에발산의 율법 낭독, 오른쪽은 세겜의 언약입니다. 지형과 건축물은 상상해 표현했습니다.",
    "steps": [
      "에발산 · 제단·돌에 기록한 율법·낭독",
      "세겜 · 백성이 모여 언약과 섬김을 결단"
    ],
    "footer": "에발산 8장 · 세겜 24장",
    "sources": [
      {
        "label": "여호수아 8장",
        "url": "https://www.biblegateway.com/passage/?search=Joshua%208&version=NIV"
      },
      {
        "label": "여호수아 24장",
        "url": "https://www.biblegateway.com/passage/?search=Joshua%2024&version=NIV"
      }
    ]
  },
  {
    "cardId": "사무엘하:core-david-covenant",
    "slug": "05-david",
    "title": "나단이 다윗에게 전한 약속",
    "type": "언약 장면",
    "note": "나단이 다윗에게 전한 약속의 한 장면입니다. 사무엘하 7장과 역대상 17장은 같은 사건의 병행 기록입니다.",
    "steps": [
      "사무엘하 7장 · 나단이 다윗에게 전함",
      "역대상 17장 · 같은 약속의 병행 기록"
    ],
    "footer": "한 사건의 병행 기록 · 두 번의 별개 언약이 아니에요",
    "sources": [
      {
        "label": "사무엘하 7장",
        "url": "https://www.biblegateway.com/passage/?search=2%20Samuel%207&version=NIV"
      },
      {
        "label": "역대상 17장",
        "url": "https://www.biblegateway.com/passage/?search=1%20Chronicles%2017&version=NIV"
      }
    ]
  },
  {
    "cardId": "욥기:core-wisdom-locations",
    "slug": "06-wisdom",
    "title": "지혜를 기억하는 두 가지 그림",
    "type": "개념 그림",
    "note": "갈림길과 나무의 뿌리는 경외와 지혜의 근본을 기억하기 위한 비유입니다. 본문에 실제로 등장하는 사건이나 사물이라는 뜻은 아닙니다.",
    "steps": [
      "욥 28:28 · 경외와 악을 떠남",
      "잠 1:7·9:10 · 지식과 지혜의 근본"
    ],
    "footer": "같은 “경외”라도 책과 표현을 함께 기억해요",
    "sources": [
      {
        "label": "욥기 28장",
        "url": "https://www.biblegateway.com/passage/?search=Job%2028&version=NIV"
      },
      {
        "label": "잠언 1장",
        "url": "https://www.biblegateway.com/passage/?search=Proverbs%201&version=NIV"
      },
      {
        "label": "잠언 9장",
        "url": "https://www.biblegateway.com/passage/?search=Proverbs%209&version=NIV"
      }
    ]
  },
  {
    "cardId": "스가랴:core-prophetic-visions",
    "slug": "07-visions",
    "title": "등잔대부터 무화과까지, 네 환상",
    "type": "환상 도감",
    "note": "왼쪽 위부터 등잔대와 두 감람나무, 날아가는 두루마리, 네 병거, 무화과 두 광주리입니다. 각 환상을 해석해 그린 장면이며 고고학적 복원도는 아닙니다.",
    "steps": [
      "슥 4장 · 등잔대와 두 감람나무",
      "슥 5장 · 날아가는 두루마리",
      "슥 6장 · 네 병거",
      "렘 24장 · 좋은 무화과와 나쁜 무화과"
    ],
    "footer": "스가랴 4·5·6장 / 무화과 광주리는 예레미야 24장",
    "sources": [
      {
        "label": "스가랴 4장",
        "url": "https://www.biblegateway.com/passage/?search=Zechariah%204&version=NIV"
      },
      {
        "label": "스가랴 5장",
        "url": "https://www.biblegateway.com/passage/?search=Zechariah%205&version=NIV"
      },
      {
        "label": "스가랴 6장",
        "url": "https://www.biblegateway.com/passage/?search=Zechariah%206&version=NIV"
      },
      {
        "label": "예레미야 24장",
        "url": "https://www.biblegateway.com/passage/?search=Jeremiah%2024&version=NIV"
      }
    ]
  },
  {
    "cardId": "누가복음:core-gospel-scenes",
    "slug": "08-gospels",
    "title": "사건 옆에 복음서 이름 붙이기",
    "type": "장면 비교",
    "note": "왼쪽 위부터 마리아의 찬양, 어리석은 부자, 헤롯 앞의 예수님, 물고기 입의 동전입니다. 인물과 공간은 본문을 바탕으로 상상해 표현했습니다.",
    "steps": [
      "누가 1장 · 마리아의 찬양",
      "누가 12장 · 어리석은 부자 비유",
      "누가 23장 · 헤롯 앞의 예수님",
      "마태 17장 · 물고기 입의 성전세 동전"
    ],
    "footer": "누가의 세 장면 · 마태의 성전세",
    "sources": [
      {
        "label": "누가복음 1장",
        "url": "https://www.biblegateway.com/passage/?search=Luke%201&version=NIV"
      },
      {
        "label": "누가복음 12장",
        "url": "https://www.biblegateway.com/passage/?search=Luke%2012&version=NIV"
      },
      {
        "label": "누가복음 23장",
        "url": "https://www.biblegateway.com/passage/?search=Luke%2023&version=NIV"
      },
      {
        "label": "마태복음 17장",
        "url": "https://www.biblegateway.com/passage/?search=Matthew%2017&version=NIV"
      }
    ]
  },
  {
    "cardId": "사도행전:core-paul-journeys",
    "slug": "09-paul",
    "title": "바울이 만난 세 도시",
    "type": "여행 장면",
    "note": "왼쪽부터 루스드라의 신격화 거절, 고린도의 천막 일, 드로아의 유두고 사건입니다. 서로 다른 여행에서 고른 장면이며, 전체 이동 경로나 지도가 아닙니다.",
    "steps": [
      "1차 · 루스드라 · 바나바를 제우스, 바울을 헤르메스라 부름",
      "2차 · 고린도 · 아굴라·브리스길라를 만나 함께 일함",
      "3차 · 드로아 · 유두고가 떨어졌다가 살아남"
    ],
    "sources": [
      {
        "label": "사도행전 14장",
        "url": "https://www.biblegateway.com/passage/?search=Acts%2014&version=NIV"
      },
      {
        "label": "사도행전 18장",
        "url": "https://www.biblegateway.com/passage/?search=Acts%2018&version=NIV"
      },
      {
        "label": "사도행전 20장",
        "url": "https://www.biblegateway.com/passage/?search=Acts%2020&version=NIV"
      },
      {
        "label": "루스드라 위치",
        "url": "https://www.openbible.info/geo/ancient/af0719d/lystra"
      },
      {
        "label": "고린도 위치",
        "url": "https://www.openbible.info/geo/modern/me0518f"
      },
      {
        "label": "드로아 위치",
        "url": "https://www.openbible.info/geo/ancient/a91c509"
      }
    ],
    "footer": "1차 루스드라 → 2차 고린도 → 3차 드로아 · 여행별 대표 사건"
  },
  {
    "cardId": "빌립보서:core-timothy-senders",
    "slug": "10-timothy",
    "title": "바울과 디모데, 여섯 편지",
    "type": "동역자와 편지",
    "note": "바울과 디모데의 편지 사역을 상상한 그림입니다. 아래 연결은 편지 첫머리에 이름이 함께 적힌 관계이며 공동 집필 여부를 판정하지 않습니다.",
    "steps": [
      "빌립보서·골로새서 · 바울과 디모데",
      "데살로니가전후서 · 바울·실루아노·디모데",
      "고린도후서·빌레몬서 · 바울과 디모데"
    ],
    "footer": "빌·골 / 살전·살후 / 고후·몬 = 여섯 편지",
    "sources": [
      {
        "label": "빌립보서 1장",
        "url": "https://www.biblegateway.com/passage/?search=Philippians%201&version=NIV"
      },
      {
        "label": "골로새서 1장",
        "url": "https://www.biblegateway.com/passage/?search=Colossians%201&version=NIV"
      },
      {
        "label": "데살로니가전서 1장",
        "url": "https://www.biblegateway.com/passage/?search=1%20Thessalonians%201&version=NIV"
      },
      {
        "label": "데살로니가후서 1장",
        "url": "https://www.biblegateway.com/passage/?search=2%20Thessalonians%201&version=NIV"
      },
      {
        "label": "고린도후서 1장",
        "url": "https://www.biblegateway.com/passage/?search=2%20Corinthians%201&version=NIV"
      },
      {
        "label": "빌레몬서",
        "url": "https://www.biblegateway.com/passage/?search=Philemon%201&version=NIV"
      }
    ]
  },
  {
    "cardId": "로마서:core-people-roles",
    "slug": "11-romans",
    "title": "로마서 16장, 세 가지 역할",
    "type": "인물 역할도",
    "note": "왼쪽부터 더디오의 기록, 뵈뵈의 교회 섬김, 가이오의 대접을 그렸습니다. 인물의 실제 외모를 복원한 그림은 아닙니다.",
    "steps": [
      "더디오 · 22절 · 편지를 기록한 사람",
      "뵈뵈 · 1–2절 · 겐그레아 교회의 일꾼",
      "가이오 · 23절 · 바울과 교회를 대접한 사람"
    ],
    "footer": "이름마다 역할 하나씩 붙여요",
    "sources": [
      {
        "label": "로마서 16장",
        "url": "https://www.biblegateway.com/passage/?search=Romans%2016&version=NIV"
      }
    ]
  },
  {
    "cardId": "히브리서:core-faith-names",
    "slug": "12-hebrews",
    "title": "요셉의 부탁과 여섯 이름",
    "type": "본문과 기억",
    "note": "왼쪽은 요셉의 부탁, 오른쪽의 두루마리와 여섯 돌은 32절의 이름을 기억하기 위한 비유입니다. 돌은 본문의 사물이 아니며, 이름의 열거 순서는 연대순이 아닙니다. 바락은 직접 언급되지만 드보라는 직접 언급되지 않습니다.",
    "steps": [
      "22절 · 요셉이 출애굽과 자신의 뼈에 관해 부탁함",
      "32절 · 기드온·바락·삼손·입다·다윗·사무엘과 선지자들",
      "이름 구분 · 바락은 직접 나오고 드보라는 직접 나오지 않음"
    ],
    "footer": "32절의 열거 순서 · 인물의 연대순이 아니에요",
    "sources": [
      {
        "label": "히브리서 11장",
        "url": "https://www.biblegateway.com/passage/?search=Hebrews%2011&version=NIV"
      }
    ]
  }
];

const full=[0,0,1536,1024];
const pair=[[0,0,768,1024],[768,0,768,1024]];
const quad=[[0,0,768,512],[768,0,768,512],[0,512,768,512],[768,512,768,512]];
const triple=[[0,0,512,1024],[512,0,512,1024],[1024,0,512,1024]];
const frames={
 '01-abraham':quad,'02-jacob':pair,'03-moses':pair,'04-joshua':pair,
 '05-david':[full,full],'06-wisdom':pair,'07-visions':quad,'08-gospels':quad,
 '09-paul':triple,'10-timothy':[full,full,full],'11-romans':triple,
 '12-hebrews':[pair[0],pair[1],pair[1]],
};
export const BIBLE_VISUALS=definitions.map(meta=>{
 const card=CORE_CARDS.find(card=>card.id===meta.cardId);
 if(!card)throw new Error('Missing source card: '+meta.cardId);
 return {...meta,book:card.book,reference:card.reference,image:'visuals/paintings/'+meta.slug+'.png',width:1536,height:1024,frames:frames[meta.slug]};
});
export const VISUAL_BY_CARD=Object.fromEntries(BIBLE_VISUALS.map(v=>[v.cardId,v]));
export function visualStep(visual,index) {
 return Number.isInteger(index)&&index>=0&&index<visual.steps.length?index:-1;
}
export function visualCaption(visual,index=-1) {
 const selected=visualStep(visual,index);
 return selected<0?visual.steps.join(' / '):visual.steps[selected];
}
export function visualFrame(visual,index=-1) {
 const selected=visualStep(visual,index);
 return [...(visual.frames[selected]||full)];
}
