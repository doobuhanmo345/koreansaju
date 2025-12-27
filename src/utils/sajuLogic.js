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

    // ... (뒷부분: 공망, 합충 로직 등 유지) ...

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
export const createPromptForGemini = (sajuData, language = 'ko') => {
  if (!sajuData) return '';
  const { pillars, maxOhaeng, myShinsal, currentDaewoon, inputDate, inputGender, daewoonList } =
    sajuData;

  // 대운 해석 가져오기
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

    // 1. 십성 계산 (saju_data.js에서 가져온 테이블 사용)
    const calculatedShipSung = SHIP_SUNG_TABLE[userGan]?.[dGanKor] || '대운';

    // 2. 십성 설명 (saju_data.js에서 가져옴)
    const shipSungDetail = SHIP_SUNG_MAP[calculatedShipSung]
      ? isEn
        ? SHIP_SUNG_MAP[calculatedShipSung].en
        : SHIP_SUNG_MAP[calculatedShipSung].ko
      : '개인적 성장';

    // 3. 오행 맵
    const ohaengMap = {
      wood: isEn ? 'Wood' : '나무(木)',
      fire: isEn ? 'Fire' : '불(火)',
      earth: isEn ? 'Earth' : '흙(土)',
      metal: isEn ? 'Metal' : '금(金)',
      water: isEn ? 'Water' : '물(水)',
    };

    // 4. 60갑자 해석 (saju_data.js에서 가져옴)
    const currentNuance = PILLAR_DETAILS[name]
      ? isEn
        ? PILLAR_DETAILS[name].en
        : PILLAR_DETAILS[name].ko
      : isEn
        ? 'Significant transition.'
        : '중요한 변화의 시기입니다.';

    // 5. 텍스트 조립
    const introText = isEn
      ? `<b>Luck Cycle: ${name} (Age ${startAge} - ${endAge})</b>`
      : `<b>${name} 대운 (약 ${startAge}세 ~ ${endAge}세)</b>`;

    const shipSungText = isEn
      ? `The energy of <b>${calculatedShipSung}</b> is the primary driver, focusing on <b>${shipSungDetail}</b>.`
      : `당신의 운명에서 이 구간은 <b>${calculatedShipSung}</b>의 작용력이 가장 크게 나타납니다. 이는 <b>${shipSungDetail}</b>의 흐름이 주도하게 됨을 의미합니다.`;

    // 6. 충 계산 로직
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

  const targetFormat = DEFAULT_FORMAT[language] || DEFAULT_FORMAT['ko'];
  return `
  ${DEFAULT_INSTRUCTION}

    ---
    !!! SYSTEM ALERT: YOU ARE A PROFESSIONAL MYUNG-RI SCHOLAR & HTML GENERATOR. !!!
    
    [YOUR GOAL]
    - Fill the content inside the provided HTML template based on the SAJU data.
    - **CRITICAL**: DO NOT CHANGE class names (e.g., class="section-title-h2", class="report-text").
    - **CRITICAL**: DO NOT REMOVE any <div>, <h2>, <p> tags. Keep the structure EXACTLY as provided.
    - OUTPUT ONLY THE RAW HTML. No markdown code blocks.

    [MYUNG-RI ANALYSIS LOGIC: THE MASTER'S PERSPECTIVE]
    - 당신은 '일주(Day Pillar)'를 개인의 핵심 엔진으로 보되, '월주(Month)'와 '연주(Year)'를 그 엔진이 가동되는 환경과 유전적 배경으로 분석합니다.
    - **핵심 분석법**: 
      1. 일주(${pillars.day})의 기본 특성이 월주(${pillars.month})의 환경(사회궁)을 만났을 때 어떻게 변주되는지 설명하세요. 
         (예: 갑자일주가 월주에 관성이 강하면 모범생 기질이 강박으로, 식상이 강하면 응용력 있는 전문가로 변함)
      2. 일주가 가진 태생적 약점이 사주 전체의 오행(${maxOhaeng})이나 신살에 의해 어떻게 보완되거나 심화되는지 입체적으로 서술하세요.
      3. 대운의 흐름을 단순히 나열하지 말고, 일주라는 주인공이 각 대운(환경)을 지나며 어떻게 성장해왔는지 한 편의 이야기처럼 정제하여 서술하세요.

    [SAJU DATA]
    - Birth: ${inputDate} (${inputGender})
    - Day Pillar (Core): ${pillars.day}
    - Month Pillar (Environment): ${pillars.month}
    - Year Pillar (Root): ${pillars.year}
    - Key Personality Traits: ${ILJU_DATA[pillars.day].desc[inputGender].join(', ')}
    - Dominant Element: ${maxOhaeng}
    - Special Stars: ${myShinsal.map((s) => `${s.name}(${s.desc})`).join(', ')}
    - Current Daewoon: ${currentDaewoon?.name}
    - 대운 흐름 정보:
    ${daewoonList.map((i) => getDaewoonStory(i, language, pillars))}를 참조하여, 사용자의 인생 흐름을 과거부터 현재까지 자세히 서술해줘.
    내용을 정제하여 더 길고 깊이 있게 작성하되, 제공된 정보는 하나도 빠뜨리지 마세요.

    [HTML TEMPLATE TO FILL]
    ${targetFormat}
  `;

  return `
    [시스템 역할]: 당신은 사주 데이터를 분석하여 **정해진 HTML 포맷으로만** 결과를 출력하는 전문 AI입니다.
    [필수 제약 사항]: 
    1. ${DEFAULT_INSTRUCTION}
    2. 인사말이나 부가적인 설명을 덧붙이지 말고, 오직 내용만 채우세요.
    3. 언어: ${language === 'en' ? 'English' : 'Korean'}
    **[출력 포맷 (이 구조를 그대로 유지하고 내용만 채울 것)]:**
    ${DEFAULT_FORMAT}

    ---

    [분석할 사용자 정보]:
    1. 생년월일: ${inputDate} (${inputGender})
    2. 일주(핵심 기운): ${pillars.day}
       - 성격 분석 지침: "${ILJU_DATA[pillars.day].desc[inputGender].join(', ')}" 키워드를 바탕으로 부드럽고 통찰력 있게 서술.
    3. 월주(사회궁): ${pillars.month}
    4. 오행 분석: 가장 강한 오행은 '${maxOhaeng}'입니다.
       - 해석 지침: 일주의 성격과 강한 오행을 결합하여 내면의 심리를 입체적으로 서술 (예: 겉은 부드러우나 속은 단단함 등).

    [신살 데이터]:
    ${myShinsal.map((s) => `- ${s.name}: ${s.desc}`).join('\n')}

    [현재 대운]:
    - 이름: ${currentDaewoon?.name || '정보없음'}
    - 의미: ${daewoonDesc}

    ---
    
    [최종 명령]:
    위 [분석할 사용자 정보]를 바탕으로, 맨 위 [출력 포맷]의 빈칸을 채워 완성된 HTML 문자열만 반환하세요.
`;
};
// 1. 'Who Am I' 섹션: 일주와 강한 오행을 중심으로 성격을 요약해주세요.
// 2. 'Special Energy' 섹션: 신살이 삶에 미치는 긍정적 영향을 설명해주세요.
// 3. 'Flow of Luck' 섹션: 현재 대운의 흐름을 설명하고 조언을 해주세요.
