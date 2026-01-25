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
  GUIN_MAP,
  SHIP_SUNG_MAP,
  SHIP_SUNG_TABLE,
  NAKJEONG_MAP,
  SAMJAE_MAP,
  WONJIN_PAIRS,
  YANGIN_MAP,
} from '../data/saju_data';
import { ILJU_DATA } from '../data/ilju_data';
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
    const isEn = language === 'en';

    // ---------------------------------------------------------
    // 1. 만세력 인스턴스 생성 (lunar-javascript 라이브러리 가정)
    // ---------------------------------------------------------
    const solar = Solar.fromYmdHms(year, month, day, isTimeUnknown ? 0 : hour, min, 0);
    const lunar = solar.getLunar();

    const eightChar = lunar.getEightChar();

    // ---------------------------------------------------------
    // 2. 사주 명식(Pillars) 추출 및 한글 변환
    // ---------------------------------------------------------
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

    // 계산 편의를 위한 지지(branches)와 천간(stems) 객체
    const branches = { year: saju.grd3, month: saju.grd2, day: saju.grd1, time: saju.grd0 };
    const stems = { year: saju.sky3, month: saju.sky2, day: saju.sky1, time: saju.sky0 };

    // ---------------------------------------------------------
    // 3. 오행(Ohaeng) 계산
    // ---------------------------------------------------------
    const allChars = [saju.sky3, saju.grd3, saju.sky2, saju.grd2, saju.sky1, saju.grd1];
    if (!isTimeUnknown) allChars.push(saju.sky0, saju.grd0);

    const ohaengCount = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    allChars.forEach((char) => {
      const type = OHAENG_MAP[char];
      if (type) ohaengCount[type]++;
    });

    const dayTypes = [OHAENG_MAP[allChars[4]], OHAENG_MAP[allChars[5]]];
    const monthTypes = [OHAENG_MAP[allChars[2]], OHAENG_MAP[allChars[3]]];

    // 가장 강한 오행 판단 로직
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

    // ---------------------------------------------------------
    // 4. 신살(Shinsal) 통합 계산
    // ---------------------------------------------------------
    let myShinsal = [];

    // [4-1] 12신살 (삼합 기준)
    const checkSamhap = (criteria, label) => {
      const group = SAMHAP_MAP[criteria];
      if (!group) return;
      const [el, yeokma, dohwa, hwagae, mangsin, cheonsal, yukhae, geobsal] = group;

      Object.entries(branches).forEach(([position, b]) => {
        if (!b) return;

        // 기준이 된 자리(label)는 화개/망신/겁살 판정에서 제외 (자기참조 버그 방지)
        const isBasePosition =
          label.includes('Year') || label.includes('년') ? position === 'year' : position === 'day';

        let newShinsal = null;

        if (b === yeokma) {
          newShinsal = {
            name: isEn ? 'Yeokma' : '역마살',
            desc: isEn ? 'Movement/Travel' : '이동수, 주거 및 직장 변동, 활발한 활동',
          };
        } else if (b === dohwa) {
          newShinsal = {
            name: isEn ? 'Dohwa' : '도화살',
            desc: isEn ? 'Charm/Popularity' : '타인의 시선을 끄는 매력, 인기, 끼',
          };
        } else if (b === hwagae && !isBasePosition) {
          newShinsal = {
            name: isEn ? 'Hwagae' : '화개살',
            desc: isEn ? 'Art/Religion' : '예술적 재능, 종교, 학문, 화려함 뒤의 고독',
          };
        } else if (b === mangsin && !isBasePosition) {
          newShinsal = {
            name: isEn ? 'Mangsin' : '망신살',
            desc: isEn ? 'Exposure/Fame' : '자신을 드러내어 얻는 이득 혹은 구설수',
          };
        } else if (b === cheonsal && !isBasePosition) {
          newShinsal = {
            name: isEn ? 'Cheonsal' : '천살',
            desc: isEn ? 'Higher Power' : '하늘의 뜻, 감당하기 어려운 목표나 기회',
          };
        } else if (b === yukhae && !isBasePosition) {
          newShinsal = {
            name: isEn ? 'Yukhae' : '육해살',
            desc: isEn ? 'Quick Wit' : '빠른 문제 해결 능력, 예리한 직관',
          };
        } else if (b === geobsal && !isBasePosition) {
          newShinsal = {
            name: isEn ? 'Geobsal' : '겁살',
            desc: isEn ? 'Competition' : '빼앗거나 뺏기는 경쟁심, 강한 투쟁심',
          };
        }

        if (newShinsal) {
          newShinsal.type = `${label}`; // 예: 년지기준, 일지기준

          // 이름 중복 방지 (같은 살이 년/일 기준 둘 다 나오면 하나만 표시)
          const isDuplicate = myShinsal.some((s) => s.name === newShinsal.name);
          if (!isDuplicate) {
            myShinsal.push(newShinsal);
          }
        }
      });
    };

    checkSamhap(branches.year, isEn ? 'Year Base' : '년지기준');
    checkSamhap(branches.day, isEn ? 'Day Base' : '일지기준');

    // [4-2] 백호살 / 괴강살
    if (LISTS.baekho.includes(pillars.day)) {
      myShinsal.push({
        name: isEn ? 'Baekho' : '백호살',
        type: isEn ? 'Day Pillar' : '일주',
        desc: isEn ? 'Strong Energy' : '강한 추진력과 기세, 프로페셔널한 능력',
      });
    }
    if (LISTS.goegang.includes(pillars.day)) {
      myShinsal.push({
        name: isEn ? 'Goegang' : '괴강살',
        type: isEn ? 'Day Pillar' : '일주',
        desc: isEn ? 'Leadership' : '우두머리 기질, 총명함, 강력한 리더십',
      });
    }

    // [4-3] 천을귀인 (Nobleman)
    const nobleChars = GUIN_MAP[stems.day];
    if (nobleChars) {
      Object.entries(branches).forEach(([pos, char]) => {
        if (nobleChars.includes(char)) {
          const posName =
            pos === 'year' ? '년지' : pos === 'month' ? '월지' : pos === 'day' ? '일지' : '시지';
          const newShinsal = {
            name: isEn ? 'Nobleman' : '천을귀인',
            type: isEn ? `Nobleman in ${pos}` : `${posName}`,
            desc: isEn ? 'Great Help' : '최고의 길신, 위기에서 돕는 조력자',
          };
          // 중복 체크
          if (!myShinsal.some((s) => s.name === newShinsal.name)) {
            myShinsal.push(newShinsal);
          }
        }
      });
    }

    // [4-4] 양인살 (Yangin)
    const yanginChar = YANGIN_MAP[stems.day];
    if (yanginChar) {
      Object.entries(branches).forEach(([pos, char]) => {
        if (char === yanginChar) {
          const posName =
            pos === 'year' ? '년지' : pos === 'month' ? '월지' : pos === 'day' ? '일지' : '시지';
          myShinsal.push({
            name: isEn ? 'Yangin' : '양인살',
            type: isEn ? `Yangin in ${pos}` : `${posName}`,
            desc: isEn ? 'Strong Authority' : '강한 고집과 권위, 칼을 쥔 듯한 전문성',
          });
        }
      });
    }

    // [4-5] 원진살 (Wonjin)
    const wonjinTarget = WONJIN_PAIRS[branches.day];
    if (wonjinTarget) {
      Object.entries(branches).forEach(([pos, char]) => {
        if (pos !== 'day' && char === wonjinTarget) {
          const posName = pos === 'year' ? '년지' : pos === 'month' ? '월지' : '시지';
          myShinsal.push({
            name: isEn ? 'Wonjin' : '원진살',
            type: isEn ? `Day <-> ${pos}` : `일지 <-> ${posName}`,
            desc: isEn ? 'Disharmony' : '이유 없는 미움, 예민함, 애증 관계',
          });
        }
      });
    }

    // [4-6] 공망 (Gongmang)
    const gongmangStr = lunar.getDayXunKong(); // "戌亥"
    const gmChars = gongmangStr.split('').map((h) => HANJA_MAP[h]);

    Object.entries(branches).forEach(([pos, char]) => {
      // 일지는 공망 기준점이므로 제외
      if (pos !== 'day' && gmChars.includes(char)) {
        const posName = pos === 'year' ? '년지' : pos === 'month' ? '월지' : '시지';
        myShinsal.push({
          name: isEn ? 'Gongmang' : '공망',
          type: isEn ? `${pos} Void` : `${posName}`,
          desc: isEn ? 'Void/Empty' : '채워지지 않는 갈증, 비어있음으로 인한 아쉬움',
        });
      }
    });

    // [4-7] 특수 신살: 천라지망 (Cheonrajimang) & 낙정관살
    const branchList = Object.values(branches);
    const hasJin = branchList.includes('진');
    const hasSa = branchList.includes('사');
    const hasSul = branchList.includes('술');
    const hasHae = branchList.includes('해');

    if (hasJin && hasSa) {
      myShinsal.push({
        name: isEn ? 'Cheonrajimang (Earth)' : '천라지망 (지망)',
        type: 'Special',
        desc: isEn ? 'Restricted Movement' : '하늘과 땅의 그물. 활인업/수성(守成)이 길함',
      });
    }
    if (hasSul && hasHae) {
      myShinsal.push({
        name: isEn ? 'Cheonrajimang (Heaven)' : '천라지망 (천라)',
        type: 'Special',
        desc: isEn ? 'Spiritual Potential' : '하늘의 그물. 정신적/종교적/예술적 분야 대성',
      });
    }

    const nakTarget = NAKJEONG_MAP[stems.day];
    if (branchList.includes(nakTarget)) {
      myShinsal.push({
        name: isEn ? 'Nakjeonggwansal' : '낙정관살',
        type: 'Special',
        desc: isEn ? 'Unexpected Trap' : '예기치 못한 함정이나 수재(水災) 주의, 신중함 필요',
      });
    }

    // 신살 배열 중복 제거 (최종 클린업)
    myShinsal = [...new Map(myShinsal.map((item) => [item.name + item.type, item])).values()];

    // ---------------------------------------------------------
    // 5. 합충(Hap/Chung) 관계 계산
    // ---------------------------------------------------------
    const relations = [];
    const checkPair = (b1, b2, targetName) => {
      const key1 = [b1, b2].join('');
      const key2 = [b2, b1].join('');
      const rule = RELATION_RULES[key1] || RELATION_RULES[key2];
      if (rule) {
        relations.push({ ...rule, target: targetName });
      }
    };

    checkPair(branches.day, branches.month, language === 'ko' ? '월지(사회)' : 'Month(Society)');
    checkPair(branches.day, branches.time, language === 'ko' ? '시지(자녀)' : 'Time(Children)');
    checkPair(branches.day, branches.year, language === 'ko' ? '년지(조상)' : 'Year(Ancestors)');

    checkPair(stems.day, stems.month, language === 'ko' ? '월간(사회)' : 'Month Stem');
    checkPair(stems.day, stems.time, language === 'ko' ? '시간(자녀)' : 'Time Stem');
    checkPair(stems.day, stems.year, language === 'ko' ? '년간(조상)' : 'Year Stem');

    // ---------------------------------------------------------
    // 6. 대운(Daewoon) 계산
    // ---------------------------------------------------------
    const daewoonList = [];
    let currentDaewoon = null;
    const currentAge = new Date().getFullYear() - year + 1; // 한국 나이
    const genderNum = inputGender === 'male' ? 1 : 0;

    try {
      const yun = eightChar.getYun(genderNum);
      const arr = yun.getDaYun();

      // 대운수(진짜 대운이 시작되는 나이)를 가져옵니다.
      const daewoonSu = arr[1] ? arr[1].getStartAge() : 10;

      for (let i = 0; i < arr.length; i++) {
        const dy = arr[i];
        let ganZhi = dy.getGanZhi();
        const start = dy.getStartAge();
        const end = dy.getEndAge();

        // 1. 대운 시작 전 구간(1세 ~ 대운수 전) 처리
        if (!ganZhi || ganZhi.length < 2) {
          if (start < daewoonSu) {
            // 대운 시작 전에는 '월주'의 기운을 쓰거나 '대운 진입 전'으로 표시
            // 여기서는 월주의 간지를 가져와서 대운 시작 전 기운으로 설정합니다.
            const monthGan = eightChar.getMonthGan();
            const monthZhi = eightChar.getMonthZhi();

            const gan = HANJA_MAP[monthGan];
            const zhi = HANJA_MAP[monthZhi];

            const item = {
              startAge: 1, // 1세부터 시작하도록 고정
              endAge: daewoonSu - 1,
              name: `${gan}${zhi}`,
              ganKor: gan,
              zhiKor: zhi,
              ganOhaeng: OHAENG_MAP[gan],
              zhiOhaeng: OHAENG_MAP[zhi],
              isCurrent: currentAge >= 1 && currentAge < daewoonSu,
              isPreDaewoon: true, // 대운 시작 전임을 나타내는 플래그
            };

            if (item.isCurrent) currentDaewoon = item;
            daewoonList.push(item);
            continue;
          }
          continue;
        }

        // 2. 실제 대운 구간 처리
        const gan = HANJA_MAP[ganZhi[0]];
        const zhi = HANJA_MAP[ganZhi[1]];
        const name = gan + zhi;

        // 현재 나이가 이 구간에 있는지 확인
        const nextStart = arr[i + 1] ? arr[i + 1].getStartAge() : end + 1;
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

    // ---------------------------------------------------------
    // 7. 추가 데이터: 명궁, 삼재
    // ---------------------------------------------------------

    const samjaeYears = SAMJAE_MAP[branches.year] || [];

    // ---------------------------------------------------------
    // 8. 최종 결과 반환
    // ---------------------------------------------------------
    return {
      saju,
      pillars,
      ohaengCount,
      maxOhaeng,

      // 통합된 신살 리스트 (12신살, 귀인, 양인, 원진, 공망, 특수신살 포함)
      myShinsal,

      // 관계 (합, 충)
      relations,

      // 대운 정보
      daewoonList,
      currentDaewoon,
      currentAge,

      // 추가 정보

      samjae: {
        years: samjaeYears,
        // 현재 연도가 삼재인지 체크 (현재 년지 오행이 samjaeYears에 포함되는지)
        // *주의: 여기선 현재 년도(2026)를 자동으로 가져오거나 인자로 받아야 함.
        // 편의상 리스트만 제공
      },
      gongmang: gmChars, // ['인', '묘']

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
      get(child(dbRef, 'prompt/basic_basic')), // 전체 프롬프트 뼈대
      get(child(dbRef, 'prompt/default_instruction')), // "당신은 역학자입니다..."
      get(child(dbRef, `prompt/basic_format_${language}`)), // 사용자님이 주신 HTML
    ]);

    if (!templateSnap.exists() || !formatSnap.exists()) {
      console.error('DB 데이터 누락: prompt/basic_basic_basic 또는 target_format을 확인하세요.');
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
