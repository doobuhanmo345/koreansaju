// src/data/constants.js
export const BD_EDIT_UI = {
  cancel: { en: 'Cancel Edit Birthday', ko: '생일 수정 취소' },
  complete: { en: 'Complete Edit Birthday', ko: '생일 수정 완료' },
  edit: { en: 'Edit Birthday', ko: '생일 수정하기' },
};
export const UI_TEXT = {
  title: { ko: '🔮 만세력 분석기', en: '🔮 Saju Analyzer' },

  // --- 로그인 및 저장 관련 텍스트 ---
  welcome: { ko: '환영합니다!', en: 'Welcome!' },
  logout: { ko: '로그아웃', en: 'Logout' },
  saveAndAnalyze: { ko: '정보 저장하고 결과 보기', en: 'Save Info' },
  updateInfo: { ko: '정보 수정하기', en: 'Update Info' },
  saved: { ko: '저장 완료', en: 'Saved' },
  googleLogin: { ko: '구글로 시작하기', en: 'Continue with Google' },
  loginMsg: { ko: '로그인하고 내 사주 저장하기', en: 'Login to save your Saju' },

  // --- 알림 메시지 ---
  loginReq: { ko: '로그인이 필요합니다!', en: 'Login is required!' },
  saveConfirm: {
    ko: '정보를 저장하시겠습니까?',
    en: 'Do you want to save?',
  },
  saveSuccess: {
    ko: '저장되었습니다! ',
    en: 'Saved successfully! You Decoding is availiable.',
  },
  saveFail: { ko: '저장에 실패했습니다.', en: 'Failed to save.' },
  limitReached: {
    ko: '오늘 수정 횟수(3회)를 모두 소모했습니다.\n내일 다시 시도해주세요.',
    en: 'Daily edit limit (3 times) reached.\nPlease try again tomorrow.',
  },
  saveFirst: { ko: '내 정보를 먼저 저장해주세요.', en: 'Please save your info first.' },
  lockedMsg: { ko: '일일 한도 초과', en: 'Limit Reached' },
  // --- 채팅 기록 관련 텍스트 ---
  historyTitle: { ko: '최근 분석 기록', en: 'Recent Decoding History' },
  historyQ: { ko: '질문:', en: 'Q:' },
  historyA: { ko: '답변:', en: 'A:' },
  noHistory: { ko: '아직 저장된 분석 기록이 없습니다.', en: 'No analysis history found.' },

  // --- 기본 라벨 ---
  birthLabel: { ko: '생년월일시 입력', en: 'Date of Birth & Time' },
  unknownTime: { ko: '생시 모름', en: 'Unknown Time' },
  genderLabel: { ko: '성별', en: 'Gender' },
  male: { ko: '남성 👨', en: 'Male 👨' },
  female: { ko: '여성 👩', en: 'Female 👩' },
  promptLabel: {
    ko: '분석 프롬프트 직접 수정하기 (고급)',
    en: 'Customize Prompt (Advanced)',
  },
  resetPrompt: { ko: '기본값으로 초기화', en: 'Reset to Default' },
  analyzeBtn: {
    ko: '사주 풀이 보기',
    en: ' Life Path Decoding',
  },
  shareBtn: { ko: '사이트 공유하기', en: 'Share this Site' },
  modalTitle: {
    ko: '🔮  분석 결과',
    en: '🔮  Decoding Result',
  },
  copyBtn: { ko: '📋 복사', en: '📋 Copy' },
  copiedBtn: { ko: '✔️ 완료', en: '✔️ Copied' },
  confirmBtn: { ko: '확인했습니다', en: 'Confirm' },
  year: { ko: '년', en: 'Year' },
  month: { ko: '월', en: 'Month' },
  day: { ko: '일', en: 'Day' },
  hour: { ko: '시', en: 'Hour' },

  // ✨ [추가] 캐시 로딩 멘트
  loadingCached: { ko: '기존 분석 결과 불러오는 중...', en: 'Loading saved result...' },
};

export const HANJA_MAP = {
  甲: '갑',
  乙: '을',
  丙: '병',
  丁: '정',
  戊: '무',
  己: '기',
  庚: '경',
  辛: '신',
  壬: '임',
  癸: '계',
  子: '자',
  丑: '축',
  寅: '인',
  卯: '묘',
  辰: '진',
  巳: '사',
  午: '오',
  未: '미',
  申: '신',
  酉: '유',
  戌: '술',
  亥: '해',
};

export const ENG_MAP = {
  갑: 'Gap',
  을: 'Eul',
  병: 'Byeong',
  정: 'Jeong',
  무: 'Mu',
  기: 'Gi',
  경: 'Gyeong',
  신: 'Sin',
  임: 'Im',
  계: 'Gye',
  자: 'Ja',
  축: 'Chuk',
  인: 'In',
  묘: 'Myo',
  진: 'Jin',
  사: 'Sa',
  오: 'O',
  미: 'Mi',
  유: 'Yu',
  술: 'Sul',
  해: 'Hae',
};

export const jijiText = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
export const HANJA_ENG_MAP = {
  甲: 'Gap',
  乙: 'Eul',
  丙: 'Byeong',
  丁: 'Jeong',
  戊: 'Mu',
  己: 'Gi',
  庚: 'Gyeong',
  辛: 'Sin',
  壬: 'Im',
  癸: 'Gye',
  子: 'Ja',
  丑: 'Chuk',
  寅: 'In',
  卯: 'Myo',
  辰: 'Jin',
  巳: 'Sa',
  午: 'O',
  未: 'Mi',
  申: 'Sin',
  酉: 'Yu',
  戌: 'Sul',
  亥: 'Hae',
};
export const langPrompt = (language) => {
  return language === 'ko' ? '답변은 한국어로. 300단어 이내.' : 'Answer in English. 300 WORDS.';
};

const hantoeng = `[Terminology Reference]
When translating or referring to Saju terms (Heavenly Stems & Earthly Branches), strictly use **Korean Hanja** (Traditional Chinese characters as used in Korea). 
DO NOT use Simplified Chinese characters.
Refer to the following mapping for exact terms:
${HANJA_ENG_MAP}
`;
const hantokor = `[Terminology Reference]
사주 용어를 해석할 때(천간과 지지), strictly use **한국한자** (Traditional Chinese characters as used in Korea). 
아래의 매핑을 참조:
${HANJA_MAP}`;
export const hanja = (language) => {
  return language === 'ko' ? hantokor : hantoeng;
};

export const SAJU_DATA = {
  sky: [
    {
      id: 0,
      color: 'bg-red-500',
      sub: {
        sky: ['', '-', '-'],
        grd: [
          ['', '-', '-', [0, 0, 0]],
          ['', '-', '-', [0, 0, 0]],
        ],
      },
      relation: { 인수: [0, 0], 식상: [0, 0], 관성: [0, 0], 재성: [0, 0] },
      grd1: { 인수: [0], 식상: [0], 관성: [0], 재성: [0], 비겁: [0] },
      sky2: { 인수: [0, 0], 식상: [0, 0], 관성: [0, 0], 재성: [0, 0], 비겁: [0, 0] },
    },
    {
      id: 1,
      color: 'bg-lime-500',
      sub: {
        sky: ['갑', '\u7532', '🌳'],
        grd: [
          ['인', '\u5bc5', '🐯', [5, 3, 1]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [9, 10], 식상: [3, 4], 관성: [7, 8], 재성: [5, 6] },
      grd1: { 인수: [9], 식상: [3], 관성: [7], 재성: [5], 비겁: [1] },
      sky2: { 인수: [9, 10], 식상: [3, 4], 관성: [7, 8], 재성: [5, 6], 비겁: [1, 2] },
    },
    {
      id: 2,
      color: 'bg-lime-500',
      sub: {
        sky: ['을', '\u4e59', '🌱'],
        grd: [
          ['묘', '\u536f', '🐰', [1, 2]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [9, 10], 식상: [3, 4], 관성: [7, 8], 재성: [5, 6] },
    },
    {
      id: 3,
      color: 'bg-red-300',
      sub: {
        sky: ['병', '\u4e19', '☀️'],
        grd: [
          ['사', '\u5df3', '🐍', [5, 7, 3]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [1, 2], 식상: [5, 6], 관성: [9, 10], 재성: [7, 8] },
    },
    {
      id: 4,
      color: 'bg-red-300',
      sub: {
        sky: ['정', '\u4e01', '🔥'],
        grd: [
          ['오', '\u5348', '🐴', [3, 6, 4]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [1, 2], 식상: [5, 6], 관성: [9, 10], 재성: [7, 8] },
    },
    {
      id: 5,
      color: 'bg-orange-300',
      sub: {
        sky: ['무', '\u620a', '🏔'],
        grd: [
          ['진', '\u8fb0', '🐲', [2, 10, 5]],
          ['술', '\u620c', '🐶', [8, 4, 5]],
        ],
      },
      relation: { 인수: [3, 4], 식상: [7, 8], 관성: [1, 2], 재성: [9, 10], 비겁: [5, 6] },
      grd1: { 인수: [3], 식상: [7], 관성: [1], 재성: [9], 비겁: [5] },
      sky2: { 인수: [3, 4], 식상: [7, 8], 관성: [1, 2], 재성: [9, 10], 비겁: [5, 6] },
    },
    {
      id: 6,
      color: 'bg-orange-300',
      sub: {
        sky: ['기', '\u5df1', '🪹'],
        grd: [
          ['축', '\u4e11', '🐮', [10, 8, 6]],
          ['미', '\u672a', '🐑', [4, 2, 6]],
        ],
      },
      relation: { 인수: [3, 4], 식상: [7, 8], 관성: [1, 2], 재성: [9, 10] },
    },
    {
      id: 7,
      color: 'bg-gray-300',
      sub: {
        sky: ['경', '\u5e9a', '🔨'],
        grd: [
          ['신', '\u7533', '🐵', [5, 9, 7]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [5, 6], 식상: [9, 10], 관성: [3, 4], 재성: [1, 2] },
    },
    {
      id: 8,
      color: 'bg-gray-300',
      sub: {
        sky: ['신', '\u8f9b', '🖊'],
        grd: [
          ['유', '\u9149', '🐔', [7, 8]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [5, 6], 식상: [9, 10], 관성: [3, 4], 재성: [1, 2] },
    },
    {
      id: 9,
      color: 'bg-blue-300',
      sub: {
        sky: ['임', '\u58ec', '💧'],
        grd: [
          ['해', '\u4ea5', '🐷', [5, 1, 9]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [7, 8], 식상: [1, 2], 관성: [5, 6], 재성: [3, 4] },
    },
    {
      id: 10,
      color: 'bg-blue-300',
      sub: {
        sky: ['계', '\u7678', '🌧'],
        grd: [
          ['자', '\u5b50', '🐭', [9, 10]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [7, 8], 식상: [1, 2], 관성: [5, 6], 재성: [3, 4] },
    },
    {
      id: 11,
      sub: { sky: ['?', '', ''], grd: [['?', '', '', '']] },
      relation: { 인수: [11, 11], 식상: [11, 11], 관성: [11, 11], 재성: [11, 11] },
    },
  ],
};

export const GONGMANG_DATA = [
  ['갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유'],
  ['갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미'],
  ['갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사'],
  ['갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘'],
  ['갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축'],
  ['갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해'],
];

export const CHUNEUL = {
  갑: ['축', '미'],
  을: ['자', '신'],
  병: ['유', '해'],
  정: ['유', '해'],
  무: ['축', '미'],
  기: ['자', '신'],
  경: ['축', '미'],
  신: ['인', '오'],
  임: ['묘', '사'],
  계: ['묘', '사'],
};

export const SKY_CH_TEXT = ['갑경', '을신', '병임', '정계'];
export const GRD_CH_TEXT = ['자오', '축미', '인신', '묘유', '진술', '사해'];
export const BANGHAP_TEXT = ['해자축', '인묘진', '사오미', '유술해'];
export const HAP3_TEXT = ['인오술', '신자진', '해묘미', '사유축'];
export const HAP6_TEXT = ['자축', '인해', '묘술', '진유', '사신', '오미'];
export const GRD_BANHAP_TEXT = ['오술', '오인', '자신', '자진', '묘해', '묘미', '유사', '유축'];
export const SKY_HAP_TEXT = ['갑기', '을경', '병신', '정임', '무계'];

export const BANGHAP_EXP = {
  해자축: { text: '수', color: 'bg-blue-300' },
  인묘진: { text: '목', color: 'bg-lime-500' },
  사오미: { text: '화', color: 'bg-red-300' },
  유술해: { text: '금', color: 'bg-gray-300' },
};
export const HAP3_EXP = {
  인오술: { text: '화', color: 'bg-red-300' },
  신자진: { text: '수', color: 'bg-blue-300' },
  해묘미: { text: '목', color: 'bg-lime-500' },
  사유축: { text: '금', color: 'bg-gray-300' },
};
export const HAP6_EXP = {
  자축: { text: '수', str: 'h-8 w-8 text-yellow-200', color: 'bg-blue-600' },
  인해: { text: '목', str: 'h-7 w-7 text-yellow-200', color: 'bg-lime-500' },
  묘술: { text: '화', str: 'h-6 w-6 text-yellow-200', color: 'bg-red-400' },
  진유: { text: '금', str: 'h-6 w-6 text-yellow-200', color: 'bg-gray-400' },
  사신: { text: '수', str: 'h-7 w-7 text-yellow-200', color: 'bg-blue-500' },
  오미: { text: '화', str: 'h-8 w-8 text-yellow-200', color: 'bg-red-600' },
};
export const GRD_BANHAP_EXP = {
  오술: { text: '화', color: 'bg-red-300', def: '인' },
  오인: { text: '화', color: 'bg-red-300', def: '술' },
  자진: { text: '수', color: 'bg-blue-300', def: '신' },
  자신: { text: '수', color: 'bg-blue-300', def: '진' },
  묘미: { text: '목', color: 'bg-lime-500', def: '해' },
  묘해: { text: '목', color: 'bg-lime-500', def: '미' },
  유축: { text: '금', color: 'bg-gray-300', def: '사' },
  유사: { text: '금', color: 'bg-gray-300', def: '축' },
};
export const SKY_HAP_EXP = {
  갑기: { text: '토', color: 'bg-orange-300' },
  을경: { text: '금', color: 'bg-gray-300' },
  병신: { text: '수', color: 'bg-blue-300' },
  정임: { text: '목', color: 'bg-lime-500' },
  무계: { text: '화', color: 'bg-red-300' },
};
