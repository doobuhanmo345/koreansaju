export const TARO_CARDS = [
  // === Major Arcana (0-21) ===
  { id: 0, type: 'major', name: 'The Fool', kor: '바보', keyword: '시작, 자유, 순수, 모험' },
  {
    id: 1,
    type: 'major',
    name: 'The Magician',
    kor: '마법사',
    keyword: '창조, 능력, 자신감, 시작',
  },
  {
    id: 2,
    type: 'major',
    name: 'The High Priestess',
    kor: '고위 여사제',
    keyword: '지혜, 직관, 신비, 무의식',
  },
  { id: 3, type: 'major', name: 'The Empress', kor: '여황제', keyword: '풍요, 모성애, 결실, 자연' },
  { id: 4, type: 'major', name: 'The Emperor', kor: '황제', keyword: '권위, 질서, 지배, 책임감' },
  { id: 5, type: 'major', name: 'The Hierophant', kor: '교황', keyword: '전통, 교육, 신념, 자비' },
  { id: 6, type: 'major', name: 'The Lovers', kor: '연인', keyword: '선택, 사랑, 조화, 관계' },
  { id: 7, type: 'major', name: 'The Chariot', kor: '전차', keyword: '승리, 전진, 의지, 극복' },
  { id: 8, type: 'major', name: 'Strength', kor: '힘', keyword: '인내, 용기, 부드러운 통제' },
  {
    id: 9,
    type: 'major',
    name: 'The Hermit',
    kor: '은둔자',
    keyword: '성찰, 탐구, 고독, 내면의 빛',
  },
  {
    id: 10,
    type: 'major',
    name: 'Wheel of Fortune',
    kor: '운명의 수레바퀴',
    keyword: '운명, 변화, 순환, 기회',
  },
  { id: 11, type: 'major', name: 'Justice', kor: '정의', keyword: '균형, 공정, 결단, 인과응보' },
  {
    id: 12,
    type: 'major',
    name: 'The Hanged Man',
    kor: '매달린 사람',
    keyword: '희생, 관점의 변화, 인내, 정지',
  },
  { id: 13, type: 'major', name: 'Death', kor: '죽음', keyword: '종결, 새로운 시작, 변화, 이별' },
  { id: 14, type: 'major', name: 'Temperance', kor: '절제', keyword: '조화, 중용, 인내, 섞임' },
  {
    id: 15,
    type: 'major',
    name: 'The Devil',
    kor: '악마',
    keyword: '속박, 중독, 유혹, 물질적 욕망',
  },
  {
    id: 16,
    type: 'major',
    name: 'The Tower',
    kor: '탑',
    keyword: '갑작스러운 변화, 붕괴, 깨달음, 충격',
  },
  { id: 17, type: 'major', name: 'The Star', kor: '별', keyword: '희망, 영감, 치유, 평온' },
  { id: 18, type: 'major', name: 'The Moon', kor: '달', keyword: '불안, 혼란, 환상, 직관' },
  { id: 19, type: 'major', name: 'The Sun', kor: '태양', keyword: '성공, 기쁨, 활력, 명확함' },
  { id: 20, type: 'major', name: 'Judgement', kor: '심판', keyword: '부활, 결단, 소식, 각성' },
  {
    id: 21,
    type: 'major',
    name: 'The World',
    kor: '세계',
    keyword: '완성, 통합, 성공적인 마무리, 여행',
  },

  // === Minor Arcana: Wands (열정, 일, 에너지) ===
  ...Array.from({ length: 14 }, (_, i) => ({
    id: 100 + i,
    type: 'minor',
    suite: 'Wands',
    name: i < 10 ? `Ace of Wands` : ['Page', 'Knight', 'Queen', 'King'][i - 10] + ' of Wands',
    kor: `지팡이 ${i < 10 ? i + 1 : ['시종', '기사', '여왕', '왕'][i - 10]}`,
    keyword: '열정, 행동, 창의성, 성장',
  })),

  // === Minor Arcana: Cups (감정, 사랑, 관계) ===
  ...Array.from({ length: 14 }, (_, i) => ({
    id: 200 + i,
    type: 'minor',
    suite: 'Cups',
    name: i < 10 ? `Ace of Cups` : ['Page', 'Knight', 'Queen', 'King'][i - 10] + ' of Cups',
    kor: `컵 ${i < 10 ? i + 1 : ['시종', '기사', '여왕', '왕'][i - 10]}`,
    keyword: '감정, 직관, 사랑, 인간관계',
  })),

  // === Minor Arcana: Swords (이성, 갈등, 결단) ===
  ...Array.from({ length: 14 }, (_, i) => ({
    id: 300 + i,
    type: 'minor',
    suite: 'Swords',
    name: i < 10 ? `Ace of Swords` : ['Page', 'Knight', 'Queen', 'King'][i - 10] + ' of Swords',
    kor: `검 ${i < 10 ? i + 1 : ['시종', '기사', '여왕', '왕'][i - 10]}`,
    keyword: '논리, 사고, 갈등, 명확한 결정',
  })),

  // === Minor Arcana: Pentacles (금전, 현실, 결과) ===
  ...Array.from({ length: 14 }, (_, i) => ({
    id: 400 + i,
    type: 'minor',
    suite: 'Pentacles',
    name:
      i < 10 ? `Ace of Pentacles` : ['Page', 'Knight', 'Queen', 'King'][i - 10] + ' of Pentacles',
    kor: `펜타클 ${i < 10 ? i + 1 : ['시종', '기사', '여왕', '왕'][i - 10]}`,
    keyword: '재물, 현실, 보상, 안정',
  })),
];
