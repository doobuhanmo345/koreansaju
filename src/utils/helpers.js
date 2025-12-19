// src/utils/helpers.js
import { ENG_MAP } from '../data/constants';

// 1. 클래스 합치기 헬퍼
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// --- 내부 사용 아이콘/한자 매핑 데이터 ---
const skyIcons = {
  갑: '🌳',
  을: '🌱',
  병: '☀️',
  정: '🔥',
  무: '⛰️',
  기: '🪹',
  경: '⚔️',
  신: '💎',
  임: '🌊',
  계: '🌧️',
};

const grdIcons = {
  자: '🐭',
  축: '🐮',
  인: '🐯',
  묘: '🐰',
  진: '🐲',
  사: '🐍',
  오: '🐴',
  미: '🐑',
  신: '🐵',
  유: '🐔',
  술: '🐶',
  해: '🐷',
};

const skyHanja = {
  갑: '甲',
  을: '乙',
  병: '丙',
  정: '丁',
  무: '戊',
  기: '己',
  경: '庚',
  신: '辛',
  임: '壬',
  계: '癸',
};

const grdHanja = {
  자: '子',
  축: '丑',
  인: '寅',
  묘: '卯',
  진: '辰',
  사: '巳',
  오: '午',
  미: '未',
  신: '申',
  유: '酉',
  술: '戌',
  해: '亥',
};

// 2. 아이콘 가져오기
export const getIcon = (val, type) => {
  if (!val) return '';
  if (type === 'sky') return skyIcons[val] || val;
  if (type === 'grd') return grdIcons[val] || val;
  return val;
};

// 3. 한자 가져오기
export const getHanja = (val, type) => {
  if (!val) return '';
  if (type === 'sky') return skyHanja[val] || val;
  if (type === 'grd') return grdHanja[val] || val;
  return val;
};

// 4. 영문 변환
export const getEng = (val) => ENG_MAP[val] || '';

// 5. 로딩 멘트 생성 (type: 'main' | 'year' | 'daily')
export const getLoadingText = (progress, lang, type = 'main') => {
  // 1️⃣ 신년 운세 로딩 멘트
  if (type === 'year') {
    if (lang === 'ko') {
      if (progress < 15) return '새해의 천간과 지지(干支) 기운을 읽어내는 중...';
      if (progress < 30) return '올해 나에게 들어올 대운과 세운의 흐름 분석...';
      if (progress < 50) return '직업, 재물, 연애... 새해 종합 운세 스캔 중...';
      if (progress < 70) return '1월부터 6월까지, 상반기 월별 운세 흐름 파악...';
      if (progress < 90) return '7월부터 12월까지, 하반기 월별 변화 예측 중...';
      return '한 해의 길흉화복을 담은 신년 운세표 완성 중!';
    } else {
      if (progress < 15) return 'Reading the energy flow of the New Year...';
      if (progress < 30) return 'Analyzing the major luck cycles approaching you...';
      if (progress < 50) return 'Scanning comprehensive luck: Career, Wealth, Love...';
      if (progress < 70) return 'Forecasting monthly flows for the first half...';
      if (progress < 90) return 'Predicting changes for the second half of the year...';
      return "Finalizing your complete New Year's Fortune blueprint!";
    }
  }

  // 2️⃣ 오늘의 운세 로딩 멘트
  if (type === 'daily') {
    if (lang === 'ko') {
      if (progress < 20) return '나의 사주 팔자(八字) 기운을 불러오는 중...';
      if (progress < 40) return '오늘의 날짜와 시간, 일진(日辰) 에너지 분석...';
      if (progress < 60) return '나의 기운과 오늘의 기운이 만나는 지점 포착...';
      if (progress < 80) return '오늘 특히 조심해야 할 것과 행운의 포인트 계산...';
      return '오늘 하루를 위한 맞춤 조언을 작성하고 있습니다.';
    } else {
      if (progress < 20) return 'Retrieving your innate energy signature...';
      if (progress < 40) return "Analyzing today's specific date and time energy...";
      if (progress < 60) return "Merging your Saju with today's atmospheric flow...";
      if (progress < 80) return 'Calculating lucky points and cautions for today...';
      return 'Writing personalized advice for your day.';
    }
  }
  if (type === 'compati') {
    if (lang === 'ko') {
      if (progress < 20) return '두 사람의 생년월일시, 운명의 코드를 대조하고 있습니다.';
      if (progress < 40) return '서로의 오행(Five Elements)이 상생하는지 상극인지 분석 중...';
      if (progress < 60) return '겉으로 보이는 성격 차이와 숨겨진 속마음의 조화 확인...';
      if (progress < 80) return '두 분이 함께할 때 생겨나는 특별한 시너지와 인연의 깊이 계산...';
      return '두 사람의 관계를 위한 현실적인 궁합 리포트를 완성하고 있습니다.';
    } else {
      if (progress < 20) return 'Retrieving the celestial blueprints of both individuals...';
      if (progress < 40) return 'Analyzing the harmony of Yin-Yang and Five Elements...';
      if (progress < 60) return 'Checking the chemistry between your personalities and values...';
      if (progress < 80) return 'Calculating the depth of your connection and future synergy...';
      return 'Finalizing the compatibility report for your relationship!';
    }
  }
  // 3️⃣ 기본(메인) 사주 분석 로딩 멘트 (기존 유지)
  if (lang === 'ko') {
    if (progress < 10) return '의뢰인의 사주 명식(命式)을 정밀 스캔하고 있습니다.';
    if (progress < 25) return '타고난 성향과 숨겨진 잠재력을 파헤치는 중...';
    if (progress < 40) return '재물의 그릇 크기, 평생 재물운의 흐름 계산 중...';
    if (progress < 55) return '나에게 다가올 인연, 애정운과 결혼운 분석 중...';
    if (progress < 70) return '사회적 성공과 명예, 직업/사업운의 방향 탐색 중...';
    if (progress < 85) return '조심해야 할 시기와 기회, 인생의 터닝포인트 포착 중...';
    return '분석 결과를 정리하여 운명의 지도를 그리는 중...';
  } else {
    if (progress < 15) return 'Aligning the stars to open the Gate of Destiny...';
    if (progress < 30) return 'Reading the ancient energy of Heaven and Earth...';
    if (progress < 50) return 'Deciphering the secrets of your Eight Characters...';
    if (progress < 70) return 'Tracing the Four Seasons of your Life...';
    if (progress < 85) return 'Finding your Guardian Spirit and lucky flows...';
    if (progress < 95) return 'Unraveling the complex threads of your Fate...';
    return 'Your Special Destiny Reading is ready.';
  }
};

// 6. (💥 누락되었던 함수) 천간 심볼 가져오기
export const getSymbol = (sky) => {
  const map = {
    갑: '🌳甲',
    을: '🌱乙',
    병: '☀️丙',
    정: '🔥丁',
    무: '🏔戊',
    기: '🪹己',
    경: '🔨庚',
    신: '🖊辛',
    임: '💧壬',
    계: '🌧癸',
  };
  return map[sky] || '';
};

// 7. 배경색 -> 테두리색 변환
const colorMap = {
  'bg-lime-500': 'border-lime-500',
  'bg-green-300': 'border-green-300',
  'bg-red-300': 'border-red-300',
  'bg-red-400': 'border-red-400',
  'bg-yellow-300': 'border-yellow-300',
  'bg-orange-300': 'border-orange-300',
  'bg-gray-300': 'border-gray-300',
  'bg-slate-300': 'border-slate-300',
  'bg-blue-300': 'border-blue-300',
  'bg-blue-400': 'border-blue-400',
  'bg-black': 'border-black',
};

export const bgToBorder = (bgClass) => {
  if (!bgClass) return 'border-gray-200';
  // 1. colorMap에 있으면 그거 씀
  if (colorMap[bgClass]) return colorMap[bgClass];
  // 2. 없으면 bg-를 border-로 바꿔서 시도
  return bgClass.replace('bg-', 'border-');
};
export const t = (char) => (language === 'en' ? getEng(char) : char);
