import { Solar } from 'lunar-javascript';

const HANJA_MAP = {
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

/**
 * 주어진 Date 객체를 lunar-javascript을 사용해 사주 팔자(년/월/일/시주)로 변환합니다.
 * 이 함수는 오직 Date 객체와 HANJA_MAP에 의존하는 순수 로직입니다.
 * @param {Date} targetDate - 계산할 날짜와 시간을 가진 Date 객체
 * @returns {object | null} 8글자 사주 데이터 및 날짜 정보 또는 null
 */
export const getPillars = (targetDate) => {
  try {
    const solar = Solar.fromYmdHms(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      targetDate.getDate(),
      targetDate.getHours(),
      targetDate.getMinutes(),
      targetDate.getSeconds(), // getPillars는 초까지 사용했으므로 포함
    );

    const lunar = solar.getLunar();
    const baZi = lunar.getBaZi(); // [년주, 월주, 일주, 시주] (한자 문자열 배열)

    const parsePillar = (ganjiHanja) => {
      const skyHanja = ganjiHanja[0];
      const grdHanja = ganjiHanja[1];
      return { sky: HANJA_MAP[skyHanja] || skyHanja, grd: HANJA_MAP[grdHanja] || grdHanja };
    };

    const yearP = parsePillar(baZi[0]);
    const monthP = parsePillar(baZi[1]);
    const dayP = parsePillar(baZi[2]);
    const hourP = parsePillar(baZi[3]);

    return {
      sky3: yearP.sky,
      grd3: yearP.grd, // 년
      sky2: monthP.sky,
      grd2: monthP.grd, // 월
      sky1: dayP.sky,
      grd1: dayP.grd, // 일
      sky0: hourP.sky,
      grd0: hourP.grd, // 시
      date: targetDate.toLocaleDateString('en-CA'), // YYYY-MM-DD 형식
    };
  } catch (error) {
    // console.error('사주 계산 실패:', error); // 에러 출력은 calculateSaju에서 처리하는 것이 일반적
    return null;
  }
};

/**
 * 외부 입력(inputDate)을 받아 사주 팔자를 계산합니다.
 * 기존 calculateSaju 로직을 유지하면서 getPillars를 활용합니다.
 */
export const calculateSaju = (inputDate, isTimeUnknown = false) => {
  if (!inputDate) return null;
  const dateObj = new Date(inputDate);
  if (isNaN(dateObj.getTime())) return null;

  // 1. 핵심 계산 로직은 getPillars 함수를 호출하여 재사용
  const pillarsData = getPillars(dateObj);

  if (!pillarsData) return null;

  // 2. isTimeUnknown 조건에 따라 시주(sky0, grd0) 처리
  return {
    sky3: pillarsData.sky3,
    grd3: pillarsData.grd3, // 연
    sky2: pillarsData.sky2,
    grd2: pillarsData.grd2, // 월
    sky1: pillarsData.sky1,
    grd1: pillarsData.grd1, // 일
    sky0: isTimeUnknown ? '' : pillarsData.sky0,
    grd0: isTimeUnknown ? '' : pillarsData.grd0, // 시
  };
};
