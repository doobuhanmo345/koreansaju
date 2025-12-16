/**
 * functions/saju/constants.js
 * 60갑자 일주론 해석 데이터
 */

export const ILJU_INTERPRETATION = {
  // === 갑(甲)목 일간 ===
  갑자: {
    title: '푸른 쥐 (거목이 물 위에 뜬 형상)',
    desc: '이상과 꿈이 높고 지혜롭지만, 현실 감각이 떨어질 수 있습니다. 시작은 잘하나 마무리가 약할 수 있으니 끈기가 필요합니다.',
    keywords: ['지혜', '이상', '부유'],
  },
  갑술: { title: '산 위의 나무', desc: '', keywords: [] },
  갑신: { title: '바위 위의 나무', desc: '', keywords: [] },
  갑오: { title: '불타는 나무', desc: '', keywords: [] },
  갑진: { title: '청룡', desc: '', keywords: [] },
  갑인: { title: '큰 숲', desc: '', keywords: [] },

  // === 을(乙)목 일간 ===
  을축: {
    title: '진흙 속의 연꽃',
    desc: '어려운 환경에서도 싹을 틔우는 끈기가 있습니다. 겉은 부드러워 보이나 속은 매우 강인합니다. 재물 복이 있습니다.',
    keywords: ['끈기', '생활력', '현실적'],
  },
  을해: { title: '물 위의 꽃', desc: '', keywords: [] },
  을유: { title: '바위 틈의 꽃', desc: '', keywords: [] },
  을미: { title: '마른 땅의 풀', desc: '', keywords: [] },
  을사: { title: '꽃 밭의 뱀', desc: '', keywords: [] },
  을묘: { title: '들판의 풀', desc: '', keywords: [] },

  // === 병(丙)화 일간 ===
  병인: {
    title: '봄날의 태양',
    desc: '밝고 명랑하며 추진력이 강합니다. 목소리가 크고 행동이 시원시원하여 리더십이 있습니다.',
    keywords: ['열정', '시작', '명랑'],
  },
  병자: { title: '호수 위의 태양', desc: '', keywords: [] },
  병술: { title: '노을 지는 산', desc: '', keywords: [] },
  병신: { title: '저녁 노을', desc: '', keywords: [] },
  병오: { title: '한낮의 태양', desc: '', keywords: [] },
  병진: { title: '구름 속 태양', desc: '', keywords: [] },

  // === 정(丁)화 일간 ===
  정묘: { title: '촛불', desc: '', keywords: [] },
  정축: { title: '등불', desc: '', keywords: [] },
  정해: { title: '별빛', desc: '', keywords: [] },
  정유: { title: '달빛', desc: '', keywords: [] },
  정미: { title: '모닥불', desc: '', keywords: [] },
  정사: { title: '용광로', desc: '', keywords: [] },

  // === 무(戊)토 일간 ===
  무진: { title: '큰 산', desc: '', keywords: [] },
  무인: { title: '산 속의 호랑이', desc: '', keywords: [] },
  무자: { title: '산 속의 호수', desc: '', keywords: [] },
  무술: { title: '첩첩산중', desc: '', keywords: [] },
  무신: { title: '광산', desc: '', keywords: [] },
  무오: { title: '화산', desc: '', keywords: [] },

  // === 기(己)토 일간 ===
  기사: { title: '논밭', desc: '', keywords: [] },
  기묘: { title: '정원', desc: '', keywords: [] },
  기축: { title: '겨울 논밭', desc: '', keywords: [] },
  기해: { title: '강변의 흙', desc: '', keywords: [] },
  기유: { title: '자갈밭', desc: '', keywords: [] },
  기미: { title: '메마른 땅', desc: '', keywords: [] },

  // === 경(庚)금 일간 ===
  경오: { title: '제련된 검', desc: '', keywords: [] },
  경진: { title: '원석', desc: '', keywords: [] },
  경인: { title: '도끼', desc: '', keywords: [] },
  경자: { title: '녹슨 칼', desc: '', keywords: [] },
  경술: { title: '괴강', desc: '', keywords: [] },
  경신: { title: '큰 바위', desc: '', keywords: [] },

  // === 신(辛)금 일간 ===
  신미: { title: '보석', desc: '', keywords: [] },
  신사: { title: '빛나는 보석', desc: '', keywords: [] },
  신묘: { title: '예리한 칼', desc: '예쁜종수', keywords: [] },
  신축: { title: '진흙 속 진주', desc: '', keywords: [] },
  신해: { title: '씻은 보석', desc: '', keywords: [] },
  신유: { title: '다이아몬드', desc: '', keywords: [] },

  // === 임(壬)수 일간 ===
  임신: { title: '큰 강물', desc: '', keywords: [] },
  임오: { title: '호수', desc: '', keywords: [] },
  임진: { title: '용', desc: '', keywords: [] },
  임인: { title: '봄비', desc: '', keywords: [] },
  임자: { title: '홍수', desc: '', keywords: [] },
  임술: { title: '댐', desc: '', keywords: [] },

  // === 계(癸)수 일간 ===
  계유: { title: '맑은 샘물', desc: '', keywords: [] },
  계미: { title: '여름 비', desc: '', keywords: [] },
  계사: { title: '아지랑이', desc: '', keywords: [] },
  계묘: { title: '이슬비', desc: '', keywords: [] },
  계축: { title: '겨울 비', desc: '', keywords: [] },
  계해: { title: '바다', desc: '', keywords: [] },
};
/**
 * 신살 계산 로직
 */

// 삼합(Samhap) 기준표
// [0]: 삼합 그룹, [1]: 역마(Station), [2]: 도화(Peach), [3]: 화개(Art)
const SAMHAP_MAP = {
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

// 백호살 목록
const BAEKHO_LIST = ['갑진', '을미', '병술', '정축', '무진', '임술', '계축'];

// 괴강살 목록
const GOEGANG_LIST = ['무술', '경진', '경술', '임진', '임술'];

/**
 * 신살 계산 메인 함수
 * @param {Object} pillars - { year: '갑자', month: '을축', day: '병인', time: '정유' }
 * @param {Object} branches - { year: '자', month: '축', day: '인', time: '유' } (지지 글자만)
 * @param {string} dayMaster - 일간 (예: '병')
 */
export const calculateShinsal = (pillars, branches, dayMaster) => {
  const result = []; // 발견된 신살을 담을 배열

  // 기준점 설정 (보통 년지 기준, 현대에는 일지 기준도 많이 봄)
  // 여기서는 '년지'와 '일지' 두 기준을 모두 체크하여 합집합으로 보여주는 방식 예시
  const criteriaBranches = [branches.year, branches.day];

  criteriaBranches.forEach((criteria, index) => {
    const baseLabel = index === 0 ? '년지기준' : '일지기준';
    const group = SAMHAP_MAP[criteria];

    if (!group) return; // 예외 처리

    const [element, yeokma, dohwa, hwagae] = group;

    // 지지 4글자를 순회하며 체크
    Object.values(branches).forEach((branch) => {
      if (branch === yeokma) result.push({ name: '역마살', type: baseLabel, desc: '이동수, 변동' });
      if (branch === dohwa) result.push({ name: '도화살', type: baseLabel, desc: '인기, 매력' });
      if (branch === hwagae)
        result.push({ name: '화개살', type: baseLabel, desc: '예술, 종교, 복귀' });
    });
  });

  // 2. 일주 자체로 보는 살 (백호, 괴강)
  if (BAEKHO_LIST.includes(pillars.day)) {
    result.push({ name: '백호살', type: '일주', desc: '강한 기운, 혈광지사 조심, 프로페셔널' });
  }

  if (GOEGANG_LIST.includes(pillars.day)) {
    result.push({ name: '괴강살', type: '일주', desc: '우두머리 기질, 총명, 강한 리더십' });
  }

  // 3. 천을귀인 (일간 기준)
  // 갑무경-축미, 을기-자신, 병정-해유, 신-인오, 임계-사묘
  const GWIN_MAP = {
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

  const targets = GWIN_MAP[dayMaster];
  if (targets) {
    Object.values(branches).forEach((branch) => {
      if (targets.includes(branch)) {
        result.push({ name: '천을귀인', type: '일간기준', desc: '최고의 길신, 조력자, 액땜' });
      }
    });
  }

  // 중복 제거 (Set 활용)
  const uniqueResult = [...new Map(result.map((item) => [item.name, item])).values()];

  return uniqueResult;
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
