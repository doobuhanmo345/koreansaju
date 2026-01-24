import { Solar,Lunar } from 'lunar-javascript';

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
 */
export const getPillars = (targetDate) => {
  try {
    const solar = Solar.fromYmdHms(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      targetDate.getDate(),
      targetDate.getHours(),
      targetDate.getMinutes(),
      targetDate.getSeconds(),
    );

    const lunar = solar.getLunar();
    const baZi = lunar.getBaZi();

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
      date: targetDate.toLocaleDateString('en-CA'), // YYYY-MM-DD
    };
  } catch (error) {
    return null;
  }
};

export const calculateSaju = (inputDate, isTimeUnknown = false) => {
  if (!inputDate) return null;
  const dateObj = new Date(inputDate);
  if (isNaN(dateObj.getTime())) return null;

  const pillarsData = getPillars(dateObj);
  if (!pillarsData) return null;

  return {
    sky3: pillarsData.sky3,
    grd3: pillarsData.grd3,
    sky2: pillarsData.sky2,
    grd2: pillarsData.grd2,
    sky1: pillarsData.sky1,
    grd1: pillarsData.grd1,
    sky0: isTimeUnknown ? '' : pillarsData.sky0,
    grd0: isTimeUnknown ? '' : pillarsData.grd0,
  };
};

export const calculateSajuLunar = (inputDate, isLeapMonth = false, isTimeUnknown = false) => {
  if (!inputDate) return null;
  const dateObj = new Date(inputDate);
  if (isNaN(dateObj.getTime())) return null;

  try {
    const lunar = Lunar.fromYmdHms(
      dateObj.getFullYear(),
      dateObj.getMonth() + 1,
      dateObj.getDate(),
      dateObj.getHours(),
      dateObj.getMinutes(),
      dateObj.getSeconds(),
    );

    const baZi = lunar.getBaZi();
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
      grd3: yearP.grd,
      sky2: monthP.sky,
      grd2: monthP.grd,
      sky1: dayP.sky,
      grd1: dayP.grd,
      sky0: isTimeUnknown ? '' : hourP.sky,
      grd0: isTimeUnknown ? '' : hourP.grd,
    };
  } catch (error) {
    return null;
  }
};

export const calculateCalendarRange = (startDateStr, endDateStr) => {
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    let current = new Date(start);
    const lines = [];

    let count = 0;
    while (current <= end && count < 100) {
      const pillars = getPillars(current);
      if (pillars) {
        const line = `${pillars.date}: ${pillars.sky3}${pillars.grd3}(년) ${pillars.sky2}${pillars.grd2}(월) ${pillars.sky1}${pillars.grd1}(일)`;
        lines.push(line);
      }
      current.setDate(current.getDate() + 1);
      count++;
    }
    return lines.join('\n');
  } catch (error) {
    return '';
  }
};

/**
 * 시작일~종료일 사이의 '모든 시간대(12시) 만세력'을 생성합니다.
 * AI가 시두법을 직접 계산하지 않고, 미리 계산된 데이터를 보고 '선택'만 하게 합니다.
 */
export const calculateDetailedCalendarRange = (startDateStr, endDateStr) => {
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    let current = new Date(start);
    const lines = [];

    const ZODIACS = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
    const HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

    let count = 0;
    while (current <= end && count < 60) {
      const baseYear = current.getFullYear();
      const baseMonth = current.getMonth();
      const baseDate = current.getDate();

      const dailyPillars = getPillars(new Date(baseYear, baseMonth, baseDate, 12));
      if (dailyPillars) {
        const dateHead = `${dailyPillars.date} (${dailyPillars.sky1}${dailyPillars.grd1}일):`;
        const hourPillars = [];

        for (let i = 0; i < 12; i++) {
          const testDate = new Date(baseYear, baseMonth, baseDate, HOURS[i], 30);
          const p = getPillars(testDate);
          if (p) {
            hourPillars.push(`${ZODIACS[i]}(${p.sky0}${p.grd0})`);
          }
        }
        lines.push(`${dateHead} ${hourPillars.join(' ')}`);
      }
      current.setDate(current.getDate() + 1);
      count++;
    }
    return lines.join('\n');
  } catch (error) {
    return '';
  }
};