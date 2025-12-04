// src/utils/sajuDataProcessor.js
import { SAJU_DATA } from './data/constants';
import { jijiText } from './data/constants';
/**
 * 사주 데이터와 관계 데이터를 기반으로 천간 및 지지 데이터를 구조화하여 반환합니다.
 * @param {object} saju - 사주팔자 데이터 ({ sky0: 시천간, grd0: 시지지, ... })
 * @param {array} relationAd - 십신 관계 및 메타 데이터를 포함하는 배열 (prop으로 받아야 함)
 * @param {string} jijiText - 지지 문자열 (prop으로 받아야 함)
 * @returns {object} 구조화된 사주팔자 데이터 객체
 */
export default function processSajuData(saju) {
  const relationAd = SAJU_DATA.sky;
  if (!relationAd || !saju) {
    // 필수 데이터가 없으면 빈 객체를 반환합니다.
  }

  // ----------------------------------------------------
  // 1. 지지 데이터 검색 유틸리티 함수 (기존 findGrdData 로직)
  // ----------------------------------------------------
  const findGrdData = (char) => {
    // 지지 데이터가 없거나 유효하지 않으면 빈 값 처리
    if (!char || !jijiText.includes(char)) {
      const empty = relationAd.find((i) => i.id === 0);
      return { data: empty, sub: empty.sub.grd[1], hidden: [] };
    }

    // 지지 데이터 검색 (grd[0] 또는 grd[1]에서 해당 지지를 찾음)
    const found =
      relationAd.find((i) => i.sub.grd[0][0] === char) ||
      relationAd.find((i) => i.sub.grd[1] && i.sub.grd[1][0] === char);
    // NOTE: found.sub.grd[1] 존재 여부 체크를 추가했습니다.

    if (!found) {
      const empty = relationAd.find((i) => i.id === 0);
      return { data: empty, sub: empty.sub.grd[1], hidden: [] };
    }

    // 해당 지지의 메인 속성(sub) 및 지장간(hidden) 추출
    const sub = found.sub.grd[0][0] === char ? found.sub.grd[0] : found.sub.grd[1];

    // sub[3]에 있는 ID를 사용하여 relationAd에서 지장간 데이터 추출
    const hidden = sub[3].map((id) => relationAd.find((item) => item.id === id)).filter(Boolean);

    return { data: found, sub, hidden };
  };

  // ----------------------------------------------------
  // 2. 천간 데이터 검색 (기존 로직)
  // ----------------------------------------------------
  const findSkyData = (skyChar) => {
    return relationAd.find((i) => i.sub.sky[0] === skyChar) || relationAd.find((i) => i.id === 0);
  };

  // ----------------------------------------------------
  // 3. 데이터 구조화
  // ----------------------------------------------------

  // 천간 (Sky)
  const sigan = findSkyData(saju.sky0);
  const ilgan = findSkyData(saju.sky1);
  const wolgan = findSkyData(saju.sky2);
  const yeongan = findSkyData(saju.sky3);

  // 지지 (Ground) 및 지장간 (Hidden)
  const s = findGrdData(saju.grd0);
  const i = findGrdData(saju.grd1);
  const w = findGrdData(saju.grd2);
  const y = findGrdData(saju.grd3);

  return {
    // 천간 데이터
    sigan,
    ilgan,
    wolgan,
    yeongan,

    // 지지 데이터 및 지장간
    sijidata: s.data,
    siji: s.sub,
    sijiji: s.hidden,

    iljidata: i.data,
    ilji: i.sub,
    iljiji: i.hidden,

    woljidata: w.data,
    wolji: w.sub,
    woljiji: w.hidden,

    yeonjidata: y.data,
    yeonji: y.sub,
    yeonjiji: y.hidden,
  };
}
