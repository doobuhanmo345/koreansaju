import { Solar } from "lunar-javascript";

const HANJA_MAP = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무",
  己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
  午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해"
};

export const calculateSaju = (inputDate, isTimeUnknown = false) => {
  if (!inputDate) return null;
  const dateObj = new Date(inputDate);
  if (isNaN(dateObj.getTime())) return null;

  try {
    const solar = Solar.fromYmdHms(
      dateObj.getFullYear(),
      dateObj.getMonth() + 1,
      dateObj.getDate(),
      dateObj.getHours(),
      dateObj.getMinutes(),
      0
    );
    const lunar = solar.getLunar();
    const baZi = lunar.getBaZi();

    const parse = (h) => ({
      sky: HANJA_MAP[h[0]] || h[0],
      grd: HANJA_MAP[h[1]] || h[1],
    });

    const hP = parse(baZi[3]);

    return {
      sky3: parse(baZi[0]).sky, grd3: parse(baZi[0]).grd, // 연
      sky2: parse(baZi[1]).sky, grd2: parse(baZi[1]).grd, // 월
      sky1: parse(baZi[2]).sky, grd1: parse(baZi[2]).grd, // 일
      sky0: isTimeUnknown ? "" : hP.sky, 
      grd0: isTimeUnknown ? "" : hP.grd, // 시
    };
  } catch (e) {
    return null;
  }
};