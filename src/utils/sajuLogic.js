// utils/sajuLogic.js
import { Solar } from 'lunar-javascript';
import {
  HANJA_MAP,
  ENG_MAP,
  OHAENG_MAP,
  SAMHAP_MAP,
  LISTS,
  RELATION_RULES,
  PILLAR_DETAILS,
  GWIN_MAP,
  NOBLE_DESCRIPTIONS,
  GONGMANG_DESCRIPTIONS,
  SHIP_SUNG_MAP,
  SHIP_SUNG_TABLE,
} from '../data/saju_data';
import { ILJU_DATA } from '../data/ilju_data';
import { DEFAULT_FORMAT } from '../data/saju_data_prompt';
import { DEFAULT_INSTRUCTION } from '../data/aiResultConstants';
import { ref, get, child } from 'firebase/database';
import { database } from '../lib/firebase';
// 한자 변환 헬퍼
const t = (char, lang = 'ko') => {
  const kor = HANJA_MAP[char] || char;
  return lang === 'en' ? ENG_MAP[kor] || kor : kor;
};

export const calculateSajuData = (inputDate, inputGender, isTimeUnknown, language) => {
  if (!inputDate || !inputDate.includes('T')) return null;

  try {
    const [datePart, timePart] = inputDate.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, min] = timePart.split(':').map(Number);

    // 1. 만세력 인스턴스 생성
    const solar = Solar.fromYmdHms(year, month, day, isTimeUnknown ? 0 : hour, min, 0);
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();

    // 2. 사주 명식(Pillars) 추출
    const saju = {
      sky3: HANJA_MAP[eightChar.getYearGan()],
      grd3: HANJA_MAP[eightChar.getYearZhi()],
      sky2: HANJA_MAP[eightChar.getMonthGan()],
      grd2: HANJA_MAP[eightChar.getMonthZhi()],
      sky1: HANJA_MAP[eightChar.getDayGan()],
      grd1: HANJA_MAP[eightChar.getDayZhi()],
      sky0: HANJA_MAP[eightChar.getTimeGan()],
      grd0: HANJA_MAP[eightChar.getTimeZhi()],
    };

    const pillars = {
      year: saju.sky3 + saju.grd3,
      month: saju.sky2 + saju.grd2,
      day: saju.sky1 + saju.grd1,
      time: saju.sky0 + saju.grd0,
    };

    const branches = { year: saju.grd3, month: saju.grd2, day: saju.grd1, time: saju.grd0 };
    const stems = { year: saju.sky3, month: saju.sky2, day: saju.sky1, time: saju.sky0 };

    // 3. 오행 계산
    const allChars = [saju.sky3, saju.grd3, saju.sky2, saju.grd2, saju.sky1, saju.grd1];
    if (!isTimeUnknown) allChars.push(saju.sky0, saju.grd0);

    const ohaengCount = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    allChars.forEach((char) => {
      const type = OHAENG_MAP[char];
      if (type) ohaengCount[type]++;
    });
    const dayTypes = [OHAENG_MAP[allChars[4]], OHAENG_MAP[allChars[5]]];
    const monthTypes = [OHAENG_MAP[allChars[2]], OHAENG_MAP[allChars[3]]];

    // 가장 강한 오행
    const maxOhaeng = Object.entries(ohaengCount).reduce((a, b) => {
      if (a[1] !== b[1]) {
        return a[1] > b[1] ? a : b;
      }
      const getScore = (type) => {
        if (dayTypes.includes(type)) return 2;
        if (monthTypes.includes(type)) return 1;
        return 0;
      };
      return getScore(a[0]) >= getScore(b[0]) ? a : b;
    });

    // 4. 신살(Shinsal) 계산
    let myShinsal = [];
    const isEn = language === 'en';

    // 4-1. 삼합 기준 (역마, 도화, 화개)
    const checkSamhap = (criteria, label) => {
      const group = SAMHAP_MAP[criteria];
      if (!group) return;
      const [el, yeokma, dohwa, hwagae] = group;

      Object.values(branches).forEach((b) => {
        if (!b) return;
        if (b === yeokma)
          myShinsal.push({
            name: isEn ? 'Yeokma' : '역마살',
            type: label,
            desc: isEn ? 'Movement/Travel' : '이동수, 변동',
          });
        if (b === dohwa)
          myShinsal.push({
            name: isEn ? 'Dohwa' : '도화살',
            type: label,
            desc: isEn ? 'Popularity/Charm' : '인기, 매력',
          });
        if (b === hwagae)
          myShinsal.push({
            name: isEn ? 'Hwagae' : '화개살',
            type: label,
            desc: isEn ? 'Art/Religion' : '예술, 종교, 복귀',
          });
      });
    };
    checkSamhap(branches.year, isEn ? 'Year Base' : '년지기준');
    checkSamhap(branches.day, isEn ? 'Day Base' : '일지기준');

    // 4-2. 백호, 괴강
    if (LISTS.baekho.includes(pillars.day))
      myShinsal.push({
        name: isEn ? 'Baekho' : '백호살',
        type: isEn ? 'Day' : '일주',
        desc: isEn ? 'Strong Energy/Pro' : '강한 기운, 프로페셔널',
      });
    if (LISTS.goegang.includes(pillars.day))
      myShinsal.push({
        name: isEn ? 'Goegang' : '괴강살',
        type: isEn ? 'Day' : '일주',
        desc: isEn ? 'Leadership' : '총명, 우두머리 기질',
      });

    // (3) 천을귀인 - 위치별 해석 적용 (수정됨)
    const nobleTargets = GWIN_MAP[saju.sky1];

    if (nobleTargets) {
      // 위치 한글 매핑 (UI_TEXT 제거하고 직접 정의)
      const posNameMap = { year: '년주', month: '월주', day: '일주', time: '시주' };

      Object.entries(branches).forEach(([pos, branchChar]) => {
        if (nobleTargets.includes(branchChar)) {
          // 1. 위치별 설명 가져오기 (데이터 파일 활용)
          const detailDesc = NOBLE_DESCRIPTIONS[pos]
            ? isEn
              ? NOBLE_DESCRIPTIONS[pos].en
              : NOBLE_DESCRIPTIONS[pos].ko
            : isEn
              ? 'Great Help'
              : '귀인의 도움';

          // 2. 제목 설정 (UI_TEXT 없이 안전하게 변환)
          // 예: 천을귀인 (년주)
          const label = isEn ? pos : posNameMap[pos];
          const nobleTitle = isEn ? `Noble Star (${label})` : `천을귀인 (${label})`;

          myShinsal.push({
            name: nobleTitle,
            type: isEn ? 'Auspicious' : '대길신',
            desc: detailDesc,
          });
        }
      });
    }

    // 4-4. 공망
    const gongmangStr = lunar.getDayXunKong(); // 예: "戌亥"
    const gmChars = gongmangStr.split('').map((h) => HANJA_MAP[h]);

    // 위치 이름 한글 매핑 (UI_TEXT 의존성 제거)
    const posNameMap = { year: '년주', month: '월주', day: '일주', time: '시주' };

    Object.entries(branches).forEach(([pos, branchChar]) => {
      // 일지(day)는 공망 기준이므로 제외
      if (pos !== 'day' && gmChars.includes(branchChar)) {
        // 1. 위치별 설명 가져오기
        const detailDesc = GONGMANG_DESCRIPTIONS[pos]
          ? isEn
            ? GONGMANG_DESCRIPTIONS[pos].en
            : GONGMANG_DESCRIPTIONS[pos].ko
          : isEn
            ? 'Empty Void'
            : '비어있음, 채워지지 않는 갈증';

        // 2. 제목 설정 (UI_TEXT 대신 posNameMap 사용)
        const label = isEn ? pos : posNameMap[pos];
        const title = isEn ? `Gongmang (${label})` : `공망 (${label})`;

        myShinsal.push({
          name: title,
          type: isEn ? 'Void' : '공허',
          desc: detailDesc,
        });
      }
    });

    // 중복 제거
    myShinsal = [...new Map(myShinsal.map((item) => [item.name + item.desc, item])).values()];

    // 5. 합충(Relations) 계산
    const relations = [];

    const checkPair = (b1, b2, targetName) => {
      // 1. 두 가지 키 조합 생성 (순서 무관하게 찾기 위함)
      const key1 = [b1, b2].join(''); // 예: 갑기
      const key2 = [b2, b1].join(''); // 예: 기갑

      // 2. 딕셔너리 조회 (OR 연산자 사용)
      // key1에 정의된게 있으면 그걸 쓰고, 없으면 key2를 찾아봅니다.
      const rule = RELATION_RULES[key1] || RELATION_RULES[key2];

      // 3. 룰이 존재하면 배열에 '한 번만' 추가
      if (rule) {
        relations.push({ ...rule, target: targetName });
      }
    };

    checkPair(
      branches.day,
      branches.month,
      language === 'ko' ? '월지(사회)' : 'Month Branch (Society)',
    );

    checkPair(
      branches.day,
      branches.time,
      language === 'ko' ? '시지(자녀)' : 'Time Branch (Children)',
    );

    checkPair(
      branches.day,
      branches.year,
      language === 'ko' ? '년지(조상)' : 'Year Branch (Ancestors)',
    );
    checkPair(stems.day, stems.month, language === 'ko' ? '월간(사회)' : 'Month Stem (Society)');
    checkPair(stems.day, stems.time, language === 'ko' ? '시간(자녀)' : 'Time Stem (Children)');
    checkPair(stems.day, stems.year, language === 'ko' ? '년간(조상)' : 'Year Stem (Ancestors)');

    // 6. 대운(Daewoon) 계산
    const daewoonList = [];
    let currentDaewoon = null;
    const currentAge = new Date().getFullYear() - year + 1; // 한국 나이
    const genderNum = inputGender === 'male' ? 1 : 0;

    try {
      const yun = eightChar.getYun(genderNum);
      const dyRaw = yun.getDaYun();
      const arr = dyRaw;

      for (let i = 0; i < arr.length; i++) {
        const dy = arr[i];
        const start = dy.getStartAge();
        const end = dy.getEndAge();
        const gan = HANJA_MAP[dy.getGanZhi()[0]];
        const zhi = HANJA_MAP[dy.getGanZhi()[1]];
        const name = gan + zhi;

        const nextStart = arr[i + 1] ? arr[i + 1].getStartAge() : 999;
        const isCurrent = currentAge >= start && currentAge < nextStart;

        const item = {
          startAge: start,
          endAge: end,
          name,
          ganKor: gan,
          zhiKor: zhi,
          ganOhaeng: OHAENG_MAP[gan],
          zhiOhaeng: OHAENG_MAP[zhi],
          isCurrent,
        };
        if (isCurrent) currentDaewoon = item;
        daewoonList.push(item);
      }
    } catch (e) {
      console.error('Daewoon Calc Error', e);
    }

    return {
      saju,
      pillars,
      ohaengCount,
      maxOhaeng,
      myShinsal,
      relations,
      daewoonList,
      currentDaewoon,
      currentAge,
      inputDate,
      inputGender,
    };
  } catch (err) {
    console.error('Saju Calc Error', err);
    return null;
  }
};

// Gemini 프롬프트 생성기 (Expression Logic)
export const createPromptForGemini = async (sajuData, language = 'ko') => {
  if (!sajuData) return '';
  const { pillars, maxOhaeng, myShinsal, currentDaewoon, inputDate, inputGender, daewoonList } =
    sajuData;

  // 1. 기존 대운 해석 로직 (수정 절대 없음)
  const daewoonDesc = currentDaewoon
    ? PILLAR_DETAILS[currentDaewoon.name]?.[language] || '정보 없음'
    : '정보 없음';

  const getDaewoonStory = (selectedDae, language, pillars) => {
    const isEn = language === 'en';
    const userGan = pillars.day.charAt(0);
    const name = selectedDae.name || selectedDae.pillar || '';
    const startAge = selectedDae.startAge || selectedDae.age || 0;
    const endAge = selectedDae.endAge || Number(startAge) + 9;
    const dGanKor = selectedDae.ganKor || (name ? name.charAt(0) : '');
    const ganO = selectedDae.ganOhaeng || '';
    const zhiO = selectedDae.zhiOhaeng || '';

    const calculatedShipSung = SHIP_SUNG_TABLE[userGan]?.[dGanKor] || '대운';
    const shipSungDetail = SHIP_SUNG_MAP[calculatedShipSung]
      ? isEn
        ? SHIP_SUNG_MAP[calculatedShipSung].en
        : SHIP_SUNG_MAP[calculatedShipSung].ko
      : '개인적 성장';

    const ohaengMap = {
      wood: isEn ? 'Wood' : '나무(木)',
      fire: isEn ? 'Fire' : '불(火)',
      earth: isEn ? 'Earth' : '흙(土)',
      metal: isEn ? 'Metal' : '금(金)',
      water: isEn ? 'Water' : '물(水)',
    };

    const currentNuance = PILLAR_DETAILS[name]
      ? isEn
        ? PILLAR_DETAILS[name].en
        : PILLAR_DETAILS[name].ko
      : isEn
        ? 'Significant transition.'
        : '중요한 변화의 시기입니다.';

    const introText = isEn
      ? `<b>Luck Cycle: ${name} (Age ${startAge} - ${endAge})</b>`
      : `<b>${name} 대운 (약 ${startAge}세 ~ ${endAge}세)</b>`;

    const shipSungText = isEn
      ? `The energy of <b>${calculatedShipSung}</b> is the primary driver, focusing on <b>${shipSungDetail}</b>.`
      : `당신의 운명에서 이 구간은 <b>${calculatedShipSung}</b>의 작용력이 가장 크게 나타납니다. 이는 <b>${shipSungDetail}</b>의 흐름이 주도하게 됨을 의미합니다.`;

    const clashKey = `${ganO}_${zhiO}`;
    const clashMap = {
      water_wood: 1,
      wood_fire: 1,
      fire_earth: 1,
      earth_metal: 1,
      metal_water: 1,
      wood_water: 1,
      fire_wood: 1,
      earth_fire: 1,
      metal_earth: 1,
      water_metal: 1,
    };
    const isClash = !(clashMap[clashKey] || ganO === zhiO);

    const environmentText = isEn
      ? `The interaction between ${ohaengMap[ganO] || ganO} and ${ohaengMap[zhiO] || zhiO} creates a <b>${isClash ? 'dynamic and innovative' : 'steady and supportive'}</b> environment.`
      : `천간의 ${ohaengMap[ganO] || ganO} 기운과 지지의 ${ohaengMap[zhiO] || zhiO} 기운이 만나는 이 환경은, <b>${isClash ? '역동적인 변화와 혁신을' : '안정적인 성장과 기반을'}</b> 만들어냅니다.`;

    return `
      ${selectedDae.name}대운: ${selectedDae.startAge}세~ ${selectedDae.endAge}세 :
        ${introText} ${currentNuance} ${shipSungText}${environmentText}
      `;
  };

  try {
    const dbRef = ref(database);

    const [templateSnap, instructionSnap, formatSnap] = await Promise.all([
      get(child(dbRef, 'prompt/basic')), // 전체 프롬프트 뼈대
      get(child(dbRef, 'prompt/default_instruction')), // "당신은 역학자입니다..."
      get(child(dbRef, `prompt/basic_format_${language}`)), // 사용자님이 주신 HTML
    ]);

    if (!templateSnap.exists() || !formatSnap.exists()) {
      console.error('DB 데이터 누락: prompt/basic 또는 target_format을 확인하세요.');
      return '';
    }

    const dbInstruction = instructionSnap.val() || '';
    const dbTargetFormat = formatSnap.val() || '';
    const template = templateSnap.val();

    // 3. 템플릿 치환용 변수 매핑
    const replacements = {
      // 👈 DB 데이터
      '{{dayPillar}}': pillars.day,
      '{{monthPillar}}': pillars.month,
      '{{yearPillar}}': pillars.year,
      '{{maxOhaeng}}': maxOhaeng,
      '{{inputDate}}': inputDate,
      '{{inputGender}}': inputGender,
      '{{traits}}': ILJU_DATA[pillars.day].desc[inputGender].join(', '),
      '{{shinsal}}': myShinsal.map((s) => `- ${s.name}: ${s.desc}`).join('\n'),
      '{{currentDaewoonName}}': currentDaewoon?.name || '정보없음',
      '{{daewoonDesc}}': daewoonDesc,
      '{{daewoonStories}}': daewoonList
        .map((i) => getDaewoonStory(i, language, pillars)) // 기존 내부함수 사용
        .join('\n'),
      '{{targetFormat}}': dbTargetFormat, // 👈 DB 데이터
      '{{DEFAULT_INSTRUCTION}}': dbInstruction,
      '{{language}}': language === 'en' ? 'English' : 'Korean',
    };

    // 4. 최종 프롬프트 생성
    let finalPrompt = template;
    Object.entries(replacements).forEach(([key, value]) => {
      finalPrompt = finalPrompt.split(key).join(value || '');
    });

    return finalPrompt;
  } catch (error) {
    console.error('프롬프트 생성 에러:', error);
    return '';
  }
};
// 1. 'Who Am I' 섹션: 일주와 강한 오행을 중심으로 성격을 요약해주세요.
// 2. 'Special Energy' 섹션: 신살이 삶에 미치는 긍정적 영향을 설명해주세요.
// 3. 'Flow of Luck' 섹션: 현재 대운의 흐름을 설명하고 조언을 해주세요.
