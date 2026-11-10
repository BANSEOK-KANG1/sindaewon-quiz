// Short teaching summaries checked against the linked biblical passages.
// The exam IDs refer to the existing 2020 local question bank, not a frequency forecast.
const passage = (label, search) => ({ label, url: `https://www.biblegateway.com/passage/?search=${encodeURIComponent(search)}&version=NIV` });
const exam = number => ({ id: `hwp-2020-성경-${String(number).padStart(3, '0')}`, label: `보유 2020학년도 성경 기출 ${number}번의 학습 개념` });

export const CORE_READING_CARDS = [
  {
    id: '출애굽기:core-moses-signs', book: '출애굽기', kind: 'compare',
    title: '모세의 표징과 애굽의 재앙', lead: '같은 모세 이야기라도 등장하는 장과 상황이 달라요.',
    items: [
      ['4장', '모세에게 주신 표징', '지팡이가 뱀이 되었다가 돌아옴 · 손에 나병이 생겼다가 회복됨 · 나일 물을 땅에 부으면 피가 됨. 모세를 믿지 않을 때 보여 줄 표징이에요.'],
      ['9장', '재로 생긴 악성 종기', '바로 앞에서 화덕의 재를 날리자 사람과 짐승에게 종기가 생겨요. 애굽에 내린 재앙의 장면이에요.'],
    ],
    takeaway: '4장: 지팡이·손·물 / 9장: 재·종기', reference: '출애굽기 4:1–9 · 9:8–10',
    exam: exam(4), sources: [passage('출애굽기 4장', 'Exodus 4'), passage('출애굽기 9장', 'Exodus 9')],
  },
  {
    id: '여호수아:core-covenant-places', book: '여호수아', kind: 'compare',
    title: '에발산과 세겜을 구분하기', lead: '율법을 읽는 장면과 마지막 언약을 맺는 장면을 장소에 붙여 기억해요.',
    items: [
      ['8장', '에발산', '제단을 쌓고 율법을 돌에 기록해요. 백성 앞에서 축복과 저주의 말씀을 읽어요.'],
      ['24장', '세겜', '이스라엘 지파를 모으고 하나님을 섬기겠다는 결단을 확인해요. 여호수아가 백성과 언약을 맺고 율례와 법도를 세워요.'],
    ],
    takeaway: '에발산 8장: 제단·율법 낭독 / 세겜 24장: 언약·섬김의 결단', reference: '여호수아 8:30–35 · 24:1, 25–27',
    exam: exam(8), sources: [passage('여호수아 8장', 'Joshua 8'), passage('여호수아 24장', 'Joshua 24')],
  },
  {
    id: '사무엘하:core-david-covenant', book: '사무엘하', kind: 'compare',
    title: '다윗 언약의 두 기록', lead: '한 사건을 두 책에서 함께 찾을 수 있어요. 전달자는 나단이에요.',
    items: [
      ['삼하 7장', '다윗의 왕조 약속', '하나님이 나단을 통해 다윗의 후손과 왕위에 관한 약속을 전하세요. 다윗은 그 말씀을 듣고 기도해요.'],
      ['대상 17장', '같은 약속의 병행 기록', '역대상에도 나단이 다윗에게 전한 후손과 왕위의 약속이 기록돼 있어요. 책 이름과 장을 한 쌍으로 묶어요.'],
    ],
    takeaway: '나단 → 다윗 / 사무엘하 7장 ↔ 역대상 17장', reference: '사무엘하 7:4–17 · 역대상 17:3–15',
    exam: exam(18), sources: [passage('사무엘하 7장', '2 Samuel 7'), passage('역대상 17장', '1 Chronicles 17')],
  },
  {
    id: '욥기:core-wisdom-locations', book: '욥기', kind: 'compare',
    title: '경외와 지혜, 어느 책일까', lead: '뜻이 비슷한 구절도 책과 표현을 함께 보면 구분할 수 있어요.',
    items: [
      ['욥 28:28', '경외·악을 떠남', '주를 경외하는 것을 지혜, 악을 떠나는 것을 명철과 연결해요. 욥기의 지혜에 관한 대목이에요.'],
      ['잠 1:7 · 9:10', '지식·지혜의 근본', '잠언 1:7은 여호와 경외와 지식의 근본, 9:10은 여호와 경외와 지혜의 근본을 연결해요.'],
    ],
    takeaway: '욥 28:28: 경외·악을 떠남 / 잠 1:7: 지식의 근본 / 잠 9:10: 지혜의 근본', reference: '욥기 28:28 · 잠언 1:7 · 9:10',
    exam: exam(13), sources: [passage('욥기 28장', 'Job 28'), passage('잠언 1장', 'Proverbs 1'), passage('잠언 9장', 'Proverbs 9')],
  },
  {
    id: '스가랴:core-prophetic-visions', book: '스가랴', kind: 'journey',
    title: '환상을 책과 장에 붙이기', lead: '먼저 스가랴의 4·5·6장을 한 줄로 묶고, 예레미야의 환상을 구분해요.',
    items: [
      ['슥 4장', '등잔대와 두 감람나무', '순금 등잔대 곁에 두 감람나무가 있는 환상이에요.'],
      ['슥 5장', '날아가는 두루마리', '스가랴가 날아가는 두루마리를 보아요.'],
      ['슥 6장', '네 병거', '두 놋 산 사이에서 네 병거가 나와요.'],
      ['렘 24장', '무화과 두 광주리', '좋은 무화과와 먹을 수 없는 나쁜 무화과를 담은 두 광주리예요.'],
    ],
    takeaway: '스가랴 4·5·6: 등잔대 → 두루마리 → 병거 / 무화과 광주리: 예레미야 24', reference: '스가랴 4:2–3 · 5:1–2 · 6:1–3 · 예레미야 24:1–3',
    exam: exam(14), sources: [passage('스가랴 4장', 'Zechariah 4'), passage('스가랴 5장', 'Zechariah 5'), passage('스가랴 6장', 'Zechariah 6'), passage('예레미야 24장', 'Jeremiah 24')],
  },
  {
    id: '누가복음:core-gospel-scenes', book: '누가복음', kind: 'compare',
    title: '누가의 세 장면, 마태의 성전세', lead: '복음서 이름을 사건 옆에 붙여 읽어요.',
    items: [
      ['눅 1·12·23장', '누가복음에 있는 장면', '1장: 마리아의 찬양 / 12장: 어리석은 부자 비유 / 23장: 헤롯 앞에 서신 예수님.'],
      ['마 17장', '물고기 입의 동전', '성전세를 내는 이야기에서 예수님은 베드로에게 물고기 입의 동전으로 두 사람의 세금을 내라고 하세요.'],
    ],
    takeaway: '눅 1 마리아 · 눅 12 부자 · 눅 23 헤롯 / 마 17 성전세', reference: '누가복음 1:46–55 · 12:16–21 · 23:6–12 · 마태복음 17:24–27',
    exam: exam(30), sources: [passage('누가복음 1장', 'Luke 1'), passage('누가복음 12장', 'Luke 12'), passage('누가복음 23장', 'Luke 23'), passage('마태복음 17장', 'Matthew 17')],
  },
  {
    id: '사도행전:core-paul-journeys', book: '사도행전', kind: 'journey',
    title: '바울의 여행, 도시와 사건', lead: '여행 차수에 도시 하나와 사건 하나를 붙여 기억해요.',
    items: [
      ['1차 · 14장', '루스드라', '무리가 바나바를 제우스, 말하는 바울을 헤르메스라 불러요.'],
      ['2차 · 18장', '고린도', '바울이 아굴라·브리스길라를 만나 함께 일해요. 회당장 그리스보와 그 집안이 주를 믿어요.'],
      ['3차 · 20장', '드로아', '밤중에 말씀을 듣던 유두고가 창문에서 떨어져요. 바울이 내려가 그를 안고, 사람들은 살아난 유두고를 데려가요.'],
    ],
    takeaway: '1차 루스드라: 제우스·헤르메스 / 2차 고린도: 아굴라 부부 / 3차 드로아: 유두고', reference: '사도행전 14:8–18 · 18:1–8 · 18:23 · 20:6–12',
    exam: exam(50), sources: [passage('사도행전 14장', 'Acts 14'), passage('사도행전 18장', 'Acts 18'), passage('사도행전 20장', 'Acts 20')],
  },
  {
    id: '빌립보서:core-timothy-senders', book: '빌립보서', kind: 'people',
    title: '디모데가 함께 이름을 올린 편지', lead: '편지 첫머리의 발신인 목록을 세 묶음으로 읽어요. 디모데가 받는 편지와 구분하세요.',
    items: [
      ['빌립보서 · 골로새서', '두 편지 모두 1:1에서 바울과 디모데를 함께 언급해요.'],
      ['데살로니가전서 · 후서', '각각 1:1에 바울·실루아노(실라)·디모데가 함께 등장해요.'],
      ['고린도후서 · 빌레몬서', '고린도후서 1:1과 빌레몬서 1절에도 디모데가 바울과 함께 이름을 올려요.'],
    ],
    takeaway: '빌·골 / 살전·살후 / 고후·몬 — 총 6편', reference: '빌립보서 1:1 · 골로새서 1:1 · 데살로니가전후서 1:1 · 고린도후서 1:1 · 빌레몬서 1절',
    exam: exam(32), sources: [passage('빌립보서 1장', 'Philippians 1'), passage('골로새서 1장', 'Colossians 1'), passage('데살로니가전서 1장', '1 Thessalonians 1'), passage('데살로니가후서 1장', '2 Thessalonians 1'), passage('고린도후서 1장', '2 Corinthians 1'), passage('빌레몬서', 'Philemon 1')],
  },
  {
    id: '로마서:core-people-roles', book: '로마서', kind: 'people',
    title: '로마서 16장의 세 사람', lead: '한 장에 여러 이름이 나와도 역할을 하나씩 붙이면 덜 헷갈려요.',
    items: [
      ['더디오 · 22절', '이 편지를 기록했다고 직접 인사하는 사람. 바울의 편지를 받아 적은 사람으로 기억해요.'],
      ['뵈뵈 · 1–2절', '겐그레아 교회의 일꾼. 바울은 그를 영접하고 필요한 일을 도와 달라고 권해요.'],
      ['가이오 · 23절', '바울과 온 교회를 대접하는 사람으로 소개돼요.'],
    ],
    takeaway: '더디오: 기록 / 뵈뵈: 겐그레아 일꾼 / 가이오: 대접', reference: '로마서 16:1–2, 22–23',
    exam: exam(33), sources: [passage('로마서 16장', 'Romans 16')],
  },
  {
    id: '히브리서:core-faith-names', book: '히브리서', kind: 'journey',
    title: '히브리서 11장의 이름들', lead: '믿음의 인물들을 다루는 장에서 실제로 언급된 이름을 살펴봐요.',
    items: [
      ['22절', '요셉', '이스라엘이 애굽에서 나갈 일을 말하며 자신의 뼈에 관해 부탁해요.'],
      ['32절', '여섯 이름과 선지자들', '기드온·바락·삼손·입다·다윗·사무엘을 열거하고 선지자들도 언급해요.'],
      ['이름 구분', '바락은 있고, 드보라는 없음', '드보라의 이름은 이 장에 직접 나오지 않아요. 믿음의 유무를 판정하는 말이 아니라 본문에 적힌 이름의 구분이에요.'],
    ],
    takeaway: '히 11:22 요셉 / 11:32 기드온·바락·삼손·입다·다윗·사무엘', reference: '히브리서 11:22, 32',
    exam: exam(47), sources: [passage('히브리서 11장', 'Hebrews 11')],
  },
];

export const CORE_READING_IDS = ['창세기:0', '창세기:1', ...CORE_READING_CARDS.map(card => card.id)];
