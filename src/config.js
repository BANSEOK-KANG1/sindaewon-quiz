/** 활성 신학교 — 현재 문제은행은 총신만 구축됨 */
export const SEMINARIES = {
  chongshin: {
    id: "chongshin",
    name: "총신대학교",
    shortName: "총신",
    subjects: ["성경", "영어"],
    active: true,
  },
};

/** 자료만 있는 예비 슬롯 (문제 0건 — UI에 노출하지 않음) */
export const SEMINARY_COMING_SOON = {
  jangsin: {
    id: "jangsin",
    name: "장로회신학대학교",
    shortName: "장신",
    subjects: ["성경"],
    active: false,
    note: "장신 기출은 아직 수집되지 않았습니다.",
  },
};

export const UI = {
  appTitle: "총신 신대원 기출",
  nav: {
    home: "홈",
    browse: "탐색",
    quiz: "학습",
    wrongNote: "오답노트",
    sources: "자료",
  },
  quizCounts: [10, 20, 30],
  emptyQuestions: "등록된 문제가 없습니다. 자료 모으기에서 입력 방법을 확인하세요.",
};

export const LINKS = {
  quizlet: "https://quizlet.com/kr/103234634/",
  quizletOtShort: "https://quizlet.com/kr/44561581/",
  quizletOtMc: "https://quizlet.com/kr/44632793/",
  quizletEnglish: "https://quizlet.com/kr/893342880/",
  cstsent: "https://cstsent.csu.ac.kr/",
  puts: "http://www.puts.ac.kr/www/sub/haksa_sw/",
  chongshinAdmissions: "https://www.chongshin.ac.kr/",
};
