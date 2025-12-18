export const SAMHAP_MAP = {
  신: ['수', '인', '유', '진'],
  자: ['수', '인', '유', '진'],
  진: ['수', '인', '유', '진'], // 신자진 수국
  인: ['화', '신', '묘', '술'],
  오: ['화', '신', '묘', '술'],
  술: ['화', '신', '묘', '술'], // 인오술 화국
  사: ['금', '해', '오', '축'],
  유: ['금', '해', '오', '축'],
  축: ['금', '해', '오', '축'], // 사유축 금국
  해: ['목', '사', '자', '미'],
  묘: ['목', '사', '자', '미'],
  미: ['목', '사', '자', '미'], // 해묘미 목국
};

export const ohaengKorean = {
    wood: '나무(木)',
    fire: '불(火)',
    earth: '흙(土)',
    metal: '쇠(金)',
    water: '물(水)',
  };

// 백호살 목록
export const BAEKHO_LIST = ['갑진', '을미', '병술', '정축', '무진', '임술', '계축'];

// 괴강살 목록
export const GOEGANG_LIST = ['무술', '경진', '경술', '임진', '임술'];
// [기존 유지] 지장간 데이터 맵
export const JIJANGGAN_MAP = {
  자: { initial: '임', middle: null, main: '계' },
  축: { initial: '계', middle: '신', main: '기' },
  인: { initial: '무', middle: '병', main: '갑' },
  묘: { initial: '갑', middle: null, main: '을' },
  진: { initial: '을', middle: '계', main: '무' },
  사: { initial: '무', middle: '경', main: '병' },
  오: { initial: '병', middle: '기', main: '정' },
  미: { initial: '정', middle: '을', main: '기' },
  신: { initial: '무', middle: '임', main: '경' },
  유: { initial: '경', middle: null, main: '신' },
  술: { initial: '신', middle: '정', main: '무' },
  해: { initial: '무', middle: '갑', main: '임' },
};
// [기존 유지] 십성(Ten Gods) 계산 헬퍼
export const getTenGodType = (masterOhaeng, targetOhaeng) => {
  const relations = {
    wood: { wood: '비겁', fire: '식상', earth: '재성', metal: '관성', water: '인성' },
    fire: { wood: '인성', fire: '비겁', earth: '식상', metal: '재성', water: '관성' },
    earth: { wood: '관성', fire: '인성', earth: '비겁', metal: '식상', water: '재성' },
    metal: { wood: '재성', fire: '관성', earth: '인성', metal: '비겁', water: '식상' },
    water: { wood: '식상', fire: '재성', earth: '관성', metal: '인성', water: '비겁' },
  };
  return relations[masterOhaeng]?.[targetOhaeng] || '비겁';
};

/**
 * 신살 계산 메인 함수
 * @param {Object} pillars - { year: '갑자', month: '을축', day: '병인', time: '정유' }
 * @param {Object} branches - { year: '자', month: '축', day: '인', time: '유' } (지지 글자만)
 * @param {string} dayMaster - 일간 (예: '병')
 */
// 천간 (10개) 영문 매핑
const STEMS_EN = {
  갑: 'gap',
  을: 'eul',
  병: 'byeong',
  정: 'jeong',
  무: 'mu',
  기: 'gi',
  경: 'gyeong',
  신: 'sin',
  임: 'im',
  계: 'gye',
};

// 지지 (12개) 영문 매핑
const BRANCHES_EN = {
  자: 'ja',
  축: 'chuk',
  인: 'in',
  묘: 'myo',
  진: 'jin',
  사: 'sa',
  오: 'o',
  미: 'mi',
  신: 'shin',
  유: 'yu',
  술: 'sul',
  해: 'hae',
};

// [헬퍼 함수] 한글 일주(예: '갑자')를 받아서 영어(예: 'gabja')로 변환
export const getRomanizedIlju = (korName) => {
  if (!korName || korName.length < 2) return 'default';

  const stem = korName[0]; // '갑'
  const branch = korName[1]; // '자'

  const enStem = STEMS_EN[stem] || '';
  const enBranch = BRANCHES_EN[branch] || '';

  return `${enStem}${enBranch}`; // 'gapja'
};


// --- 1. 합충(Chemistry) 데이터 ---
export const RELATION_RULES = {
  자축: { type: '합', name: '자축합(土)', desc: '믿음직하고 끈끈한 결속력을 가집니다' },
  인해: { type: '합', name: '인해합(木)', desc: '먼저 베풀고 화합하는 따뜻한 기운이 있습니다' },
  묘술: { type: '합', name: '묘술합(火)', desc: '예술적 감각과 뜨거운 열정이 결합된 형태입니다' },
  진유: { type: '합', name: '진유합(金)', desc: '의리와 원칙을 중요시하며 맺고 끊음이 확실합니다' },
  사신: { type: '합', name: '사신합(水)', desc: '현실적인 지혜와 변화를 추구하는 성향이 강합니다' },
  오미: { type: '합', name: '오미합(火)', desc: '화려함 속에 실속을 챙기는 조화로움이 있습니다' },
  자오: {
    type: '충',
    name: '자오충',
    desc: '물과 불이 만나 강한 에너지와 역동적인 변화를 만듭니다',
  },
  축미: {
    type: '충',
    name: '축미충',
    desc: '끈기와 고집이 부딪히니 형제나 지인 간의 갈등을 조심해야 합니다',
  },
  인신: {
    type: '충',
    name: '인신충',
    desc: '시작과 끝이 부딪히는 형상이라 이동수가 많고 매우 바쁩니다',
  },
  묘유: {
    type: '충',
    name: '묘유충',
    desc: '환경의 변화가 잦고 예민해질 수 있으니 마음을 잘 다스려야 합니다',
  },
  진술: {
    type: '충',
    name: '진술충',
    desc: '고독할 수 있으나 투쟁심과 개성이 매우 강하여 리더가 되기도 합니다',
  },
  사해: {
    type: '충',
    name: '사해충',
    desc: '쓸데없는 잡념이 많을 수 있으나 해외나 원거리 이동을 통해 해소됩니다',
  },
};

// --- 2. 천을귀인 매핑 ---
export const GWIN_MAP = {
  갑: ['축', '미'],
  무: ['축', '미'],
  경: ['축', '미'],
  을: ['자', '신'],
  기: ['자', '신'],
  병: ['해', '유'],
  정: ['해', '유'],
  신: ['인', '오'],
  임: ['사', '묘'],
  계: ['사', '묘'],
};

// 오행 매핑
export const OHAENG_MAP = {
  갑: 'wood',
  을: 'wood',
  인: 'wood',
  묘: 'wood',
  병: 'fire',
  정: 'fire',
  사: 'fire',
  오: 'fire',
  무: 'earth',
  기: 'earth',
  진: 'earth',
  술: 'earth',
  축: 'earth',
  미: 'earth',
  경: 'metal',
  신: 'metal',
  유: 'metal',
  임: 'water',
  계: 'water',
  해: 'water',
  자: 'water',
};
