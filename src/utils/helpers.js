// src/utils/helpers.js
import { ENG_MAP } from "../data/constants";

// 1. 클래스 합치기 헬퍼
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

// --- 내부 사용 아이콘/한자 매핑 데이터 ---
const skyIcons = {
  갑: "🌳", 을: "🌱", 병: "☀️", 정: "🔥", 무: "⛰️", 기: "🪹", 경: "⚔️", 신: "💎", 임: "🌊", 계: "🌧️",
};

const grdIcons = {
  자: "🐭", 축: "🐮", 인: "🐯", 묘: "🐰", 진: "🐲", 사: "🐍", 오: "🐴", 미: "🐑", 신: "🐵", 유: "🐔", 술: "🐶", 해: "🐷",
};

const skyHanja = {
  갑: "甲", 을: "乙", 병: "丙", 정: "丁", 무: "戊", 기: "己", 경: "庚", 신: "辛", 임: "壬", 계: "癸",
};

const grdHanja = {
  자: "子", 축: "丑", 인: "寅", 묘: "卯", 진: "辰", 사: "巳", 오: "午", 미: "未", 신: "申", 유: "酉", 술: "戌", 해: "亥",
};

// 2. 아이콘 가져오기
export const getIcon = (val, type) => {
  if (!val) return "";
  if (type === "sky") return skyIcons[val] || val;
  if (type === "grd") return grdIcons[val] || val;
  return val;
};

// 3. 한자 가져오기
export const getHanja = (val, type) => {
  if (!val) return "";
  if (type === "sky") return skyHanja[val] || val;
  if (type === "grd") return grdHanja[val] || val;
  return val;
};

// 4. 영문 변환
export const getEng = (val) => ENG_MAP[val] || "";

// 5. 로딩 멘트 생성
export const getLoadingText = (progress, lang) => {
  if (lang === "ko") {
    if (progress < 10) return "의뢰인의 사주 명식(命式)을 정밀 스캔하고 있습니다.";
    if (progress < 25) return "타고난 성향과 숨겨진 잠재력을 파헤치는 중...";
    if (progress < 40) return "재물의 그릇 크기, 평생 재물운의 흐름 계산 중...";
    if (progress < 55) return "나에게 다가올 인연, 애정운과 결혼운 분석 중...";
    if (progress < 70) return "사회적 성공과 명예, 직업/사업운의 방향 탐색 중...";
    if (progress < 85) return "조심해야 할 시기와 기회, 인생의 터닝포인트 포착 중...";
    return "분석 결과를 정리하여 운명의 지도를 그리는 중...";
  } else {
    if (progress < 15) return "Aligning the stars to open the Gate of Destiny...";
    if (progress < 30) return "Reading the ancient energy of Heaven and Earth...";
    if (progress < 50) return "Deciphering the secrets of your Eight Characters...";
    if (progress < 70) return "Tracing the Four Seasons of your Life...";
    if (progress < 85) return "Finding your Guardian Spirit and lucky flows...";
    if (progress < 95) return "Unraveling the complex threads of your Fate...";
    return "Your Special Destiny Reading is ready.";
  }
};

// 6. (💥 누락되었던 함수) 천간 심볼 가져오기
export const getSymbol = (sky) => {
  const map = {
    갑: "🌳甲", 을: "🌱乙", 병: "☀️丙", 정: "🔥丁", 무: "🏔戊", 
    기: "🪹己", 경: "🔨庚", 신: "🖊辛", 임: "💧壬", 계: "🌧癸",
  };
  return map[sky] || "";
};

// 7. 배경색 -> 테두리색 변환
const colorMap = {
  "bg-lime-500": "border-lime-500",
  "bg-green-300": "border-green-300",
  "bg-red-300": "border-red-300",
  "bg-red-400": "border-red-400",
  "bg-yellow-300": "border-yellow-300",
  "bg-orange-300": "border-orange-300",
  "bg-gray-300": "border-gray-300",
  "bg-slate-300": "border-slate-300",
  "bg-blue-300": "border-blue-300",
  "bg-blue-400": "border-blue-400",
  "bg-black": "border-black",
};

export const bgToBorder = (bgClass) => {
  if (!bgClass) return "border-gray-200";
  // 1. colorMap에 있으면 그거 씀
  if (colorMap[bgClass]) return colorMap[bgClass];
  // 2. 없으면 bg-를 border-로 바꿔서 시도
  return bgClass.replace("bg-", "border-");
};