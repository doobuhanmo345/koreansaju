import React, { useMemo, useState } from 'react';
import { Solar } from 'lunar-javascript';
import { calculateShinsal, OHAENG_MAP, RELATION_RULES, GWIN_MAP } from '../data/sajuInt';
import { HANJA_MAP } from '../data/constants';
import { ILJU_DATA } from '../data/ilju_data';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import FourPillarVis from '../component/FourPillarVis';
import { getRomanizedIlju } from '../data/sajuInt';

// [기존 유지] 지장간 데이터 맵
const JIJANGGAN_MAP = {
  자: { initial: '임', middle: null, main: '계' },
  축: { initial: '계', middle: '신', main: '기' },
  인: { initial: '무', middle: '병', main: '갑' },
  묘: { initial: '갑', middle: null, main: '을' },
  진: { initial: '을', middle: '계', main: '무' },
  사: { initial: '무', middle: '경', main: '병' },
  오: { initial: '병', middle: '기', main: '정' },
  미: { initial: '정', middle: '을', main: '기' },
  신: { initial: '무', middle: '임', main: '경' },
  유: { initial: '경', middle: null, main: '신' },
  술: { initial: '신', middle: '정', main: '무' },
  해: { initial: '무', middle: '갑', main: '임' },
};

// [기존 유지] 십성(Ten Gods) 계산 헬퍼
const getTenGodType = (masterOhaeng, targetOhaeng) => {
  const relations = {
    wood: { wood: '비겁', fire: '식상', earth: '재성', metal: '관성', water: '인성' },
    fire: { wood: '인성', fire: '비겁', earth: '식상', metal: '재성', water: '관성' },
    earth: { wood: '관성', fire: '인성', earth: '비겁', metal: '식상', water: '재성' },
    metal: { wood: '재성', fire: '관성', earth: '인성', metal: '비겁', water: '식상' },
    water: { wood: '식상', fire: '재성', earth: '관성', metal: '인성', water: '비겁' },
  };
  return relations[masterOhaeng]?.[targetOhaeng] || '비겁';
};

// [기존 유지] 십성별 해석 멘트
const TEN_GOD_DESC = {
  비겁: {
    name: '비겁',
    initial: '타협하지 않는 주관과 뚝심을 익혔으며',
    middle: '타인에게 지지 않으려는 승부욕',
  },
  식상: {
    name: '식상',
    initial: '형식에 얽매이지 않는 자유로운 호기심이 있으며',
    middle: '남과 다르게 자신을 표현하고자 하는 본능',
  },
  재성: {
    name: '재성',
    initial: '현실을 냉철하게 파악하는 감각이 있으며',
    middle: '확실한 결과와 실속을 챙기려는 실리적 욕망',
  },
  관성: {
    name: '관성',
    initial: '스스로를 절제하고 원칙을 지키려는 태도를 가지고 있으며',
    middle: '명예를 중요시하고 흐트러짐 없이 자신을 통제하려는 의지',
  },
  인성: {
    name: '인성',
    initial: '상황을 깊이 생각하고 수용하며',
    middle: '본질을 꿰뚫어 보고자 하는 깊은 통찰력과 직관',
  },
};

const BasicAna = ({ inputDate, inputGender, isTimeUnknown }) => {
  const saju = useSajuCalculator(inputDate, isTimeUnknown).saju;

  // [기존 유지] 입력 폼
  const SajuInputForm = ({ date, setDate, gender, setGender }) => {
    return (
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8 transition-colors">
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 border-b dark:border-slate-700 pb-2">
          정보 입력
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              태어난 날짜와 시간 (양력)
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              성별
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setGender('male')}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  gender === 'male'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                남성 (Male)
              </button>
              <button
                onClick={() => setGender('female')}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  gender === 'female'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                여성 (Female)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const sajuData = useMemo(() => {
    if (!inputDate || !inputDate.includes('T')) return null;

    try {
      const [datePart, timePart] = inputDate.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, min] = timePart.split(':').map(Number);

      const solar = Solar.fromYmdHms(year, month, day, hour, min, 0);
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();
      const getKor = (fn) => HANJA_MAP[fn] || '';

      const allChars = [
        getKor(eightChar.getYearGan()),
        getKor(eightChar.getYearZhi()),
        getKor(eightChar.getMonthGan()),
        getKor(eightChar.getMonthZhi()),
        getKor(eightChar.getDayGan()),
        getKor(eightChar.getDayZhi()),
        getKor(eightChar.getTimeGan()),
        getKor(eightChar.getTimeZhi()),
      ];

      // 오행 계산
      const ohaengCount = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
      allChars.forEach((char) => {
        const type = OHAENG_MAP[char];
        if (type) ohaengCount[type]++;
      });

      const dayMaster = allChars[4];
      const dayMasterOhaeng = OHAENG_MAP[dayMaster];

      const dayTypes = [OHAENG_MAP[allChars[4]], OHAENG_MAP[allChars[5]]];
      const monthTypes = [OHAENG_MAP[allChars[2]], OHAENG_MAP[allChars[3]]];

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

      const branches = {
        year: allChars[1],
        month: allChars[3],
        day: allChars[5],
        time: allChars[7],
      };
      const pillars = {
        year: allChars[0] + allChars[1],
        month: allChars[2] + allChars[3],
        day: allChars[4] + allChars[5],
        time: allChars[6] + allChars[7],
      };

      const ilju = pillars.day;

      let finalShinsal = calculateShinsal(pillars, branches, dayMaster);
      const nobleTargets = GWIN_MAP[dayMaster] || [];
      nobleTargets.forEach((target) => {
        Object.entries(branches).forEach(([pos, branch]) => {
          if (branch === target) {
            const posName = {
              year: '년지(조상자리)',
              month: '월지(사회자리)',
              day: '일지(배우자자리)',
              time: '시지(자식/말년자리)',
            }[pos];
            finalShinsal.push({
              name: '천을귀인',
              type: '대길신',
              desc: `사주의 ${posName}인 '${branch}'에 위치하고 있습니다. 이는 흉을 길로 바꾸고 결정적인 순간에 귀인의 도움을 받는 최고의 길신입니다`,
            });
          }
        });
      });

      const gongmangHanja = lunar.getDayXunKong();
      const gongmangTargets = gongmangHanja.split('').map((h) => HANJA_MAP[h]);
      Object.entries(branches).forEach(([pos, branch]) => {
        if (pos === 'day') return;
        if (gongmangTargets.includes(branch)) {
          const posName = { year: '년지(초년)', month: '월지(청년/사회)', time: '시지(말년)' }[pos];
          finalShinsal.push({
            name: '공망',
            type: '공허',
            desc: `${posName}에 해당하는 '${branch}' 글자가 비어있는 공망입니다. 해당 시기에는 현실적 욕심보다 정신적, 철학적 가치를 추구할 때 마음이 편안해집니다`,
          });
        }
      });

      finalShinsal = [
        ...new Map(finalShinsal.map((item) => [item.name + item.desc, item])).values(),
      ];

      const relations = [];
      const checkPair = (b1, b2, targetName) => {
        const key = [b1, b2].sort().join('');
        const rule = RELATION_RULES[key];
        if (rule) relations.push({ ...rule, target: targetName });
      };
      checkPair(branches.day, branches.month, '월지(사회)');
      checkPair(branches.day, branches.time, '시지(자녀)');
      checkPair(branches.day, branches.year, '년지(조상)');

      const myIljuData = ILJU_DATA[ilju] || {
        title: ilju,
        desc: '데이터 없음',
        keywords: [],
      };

      const jijangganList = {
        time: { branch: branches.time, ...JIJANGGAN_MAP[branches.time] },
        day: { branch: branches.day, ...JIJANGGAN_MAP[branches.day] },
        month: { branch: branches.month, ...JIJANGGAN_MAP[branches.month] },
        year: { branch: branches.year, ...JIJANGGAN_MAP[branches.year] },
      };

      // --- [수정] 지장간 스토리텔링 생성 로직 ---
      const getHiddenStory = () => {
        const order = [
          {
            key: 'year',
            title: '🌱 초년과 뿌리',
            context: '당신은 어린시절 경험과 가족의 영향으로',
          },
          {
            key: 'month',
            title: '🏢 사회적 환경',
            context: '당신의 사회적 모습 이면에는',
          },
          {
            key: 'day',
            title: '🏠 본심과 속마음',
            context: '당신이 배우자를 대할 때에는',
          },
          {
            key: 'time',
            title: '🌇 말년과 비밀',
            context: '나이가 들수록',
          },
        ];

        let fullStory = '';

        order.forEach((section) => {
          const data = jijangganList[section.key];
          // 다크모드 클래스 추가
          let sectionStory = `<div class="mb-6 last:mb-0"><h4 class="font-bold text-slate-700 dark:text-slate-200 mb-1">${section.title}</h4>`;
          sectionStory += `<p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">`;
          sectionStory += `${section.context} `;

          const parts = [];

          if (data.initial) {
            const initialOhaeng = OHAENG_MAP[data.initial];
            const tenGod = getTenGodType(dayMasterOhaeng, initialOhaeng);
            parts.push(`<b>${TEN_GOD_DESC[tenGod].initial}</b>`);
          }

          if (data.middle) {
            const middleOhaeng = OHAENG_MAP[data.middle];
            const tenGod = getTenGodType(dayMasterOhaeng, middleOhaeng);
            parts.push(`그 내면에는 <b>${TEN_GOD_DESC[tenGod].middle}</b>이(가) 있습니다`);
          } else {
            parts.push(
              `숨겨진 다른 마음 없이, 겉으로 드러난 기운이 곧 본심인 <b>솔직하고 투명한 직진성</b>을 보입니다`,
            );
          }

          sectionStory += parts.join(', ');
          sectionStory += `.</p></div>`;
          fullStory += sectionStory;
        });

        return fullStory;
      };

      const hiddenStory = getHiddenStory();

      const daewoonList = [];
      let currentDaewoon = null;
      let currentAge = 0;

      try {
        const gender = inputGender === 'male' ? 1 : 0;
        const yun = eightChar.getYun(gender);
        const daewoonRaw = yun.getDaYun();
        currentAge = new Date().getFullYear() - solar.getYear() + 1;

        if (daewoonRaw && Array.isArray(daewoonRaw)) {
          for (let i = 0; i < daewoonRaw.length; i++) {
            const dy = daewoonRaw[i];
            const startAge = dy.getStartAge();
            const endAge = dy.getEndAge();
            const ganHanja = dy.getGanZhi()[0];
            const zhiHanja = dy.getGanZhi()[1];
            const ganKor = HANJA_MAP[ganHanja];
            const zhiKor = HANJA_MAP[zhiHanja];
            const name = ganKor + zhiKor;
            const ganOhaeng = OHAENG_MAP[ganKor];
            const zhiOhaeng = OHAENG_MAP[zhiKor];

            const item = {
              startAge,
              endAge,
              name,
              ganKor,
              zhiKor,
              ganOhaeng,
              zhiOhaeng,
              desc: `${ganKor}(${ganOhaeng}) / ${zhiKor}(${zhiOhaeng})`,
            };

            const nextDy = daewoonRaw[i + 1];
            const nextStartAge = nextDy ? nextDy.getStartAge() : 999;

            if (currentAge >= startAge && currentAge < nextStartAge) {
              item.isCurrent = true;
              currentDaewoon = item;
            } else {
              item.isCurrent = false;
            }

            daewoonList.push(item);
          }
        }
      } catch (e) {
        console.error('대운 계산 중 오류 발생:', e);
      }

      return {
        pillars,
        myShinsal: finalShinsal,
        myIljuData,
        ilju,
        ohaengCount,
        maxOhaeng,
        relations,
        daewoonList,
        currentDaewoon,
        currentAge,
        jijangganList,
        hiddenStory,
      };
    } catch (err) {
      console.error('사주 계산 전체 오류:', err);
      return null;
    }
  }, [inputDate, inputGender]);

  // 스토리텔링 함수
  const getAnalysisStory = (iljuData, shinsalList, maxOhaeng, relations) => {
    const ohaengNames = {
      wood: '나무(목)',
      fire: '불(화)',
      earth: '흙(토)',
      metal: '쇠(금)',
      water: '물(수)',
    };
    const dominant = ohaengNames[maxOhaeng[0]];

    let story = ``;
    const iljuEn = getRomanizedIlju(ilju);
    const safeIlju = ilju ? getRomanizedIlju(ilju) : 'gapja';
    const safeGender = inputGender ? inputGender.toLowerCase() : 'male';
    const iljuImagePath = `/images/ilju/${safeIlju}_${safeGender}.png`;

    // 다크모드 클래스 추가
    story += `<div class="rounded-xl p-6 border border-blue-50 dark:border-slate-700 my-6 shadow-sm dark:bg-slate-800/50">`;
    story += `<div class="mb-6 mx-auto max-w-md bg-indigo-50/50 dark:bg-slate-700/50 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-5 text-center shadow-sm backdrop-blur-sm">
                        <div class="flex items-center justify-center gap-2 mb-2 opacity-80">
                          <div class="h-[1px] w-6 bg-gradient-to-r from-transparent to-indigo-300 dark:to-indigo-500"></div>
                          <span class="text-[12px] font-black tracking-[0.3em] text-indigo-400 dark:text-indigo-300 uppercase drop-shadow-sm">
                            Who Am I?
                          </span>
                          <div class="h-[1px] w-6 bg-gradient-to-l from-transparent to-indigo-300 dark:to-indigo-500"></div>
                        </div>
                        <div class="text-indigo-400 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1">
                          <div class="flex-cols items-center justify-center gap-1 text-indigo-400 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1">
                            <div class="flex items-center justify-center mx-auto">
                              <img 
              src=${iljuImagePath} 
              class="w-1/2 h-auto"
            />
                            </div>
                            <div>Signature</div>
                          </div>
                        </div>
                        <div class="text-lg sm:text-xl font-extrabold text-gray-800 dark:text-gray-100 font-serif mb-2">
                         ${iljuData.title[inputGender].title}
                        </div>
                        <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed break-keep">
                          ${iljuData.title[inputGender].desc}
                        </div>
                      </div>`;
    story += `<ul class="space-y-3">`;
    story += iljuData.desc[inputGender]
      ?.map(
        (item) =>
          `<li class="flex items-start gap-3 text-slate-700 dark:text-slate-300">
         <span class="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></span>
         <span class="leading-relaxed tracking-wide text-[15px]">${item}</span>
       </li>`,
      )
      .join('');
    story += `</ul></div>`;

    story += `<br/>사주 전체를 흐르는 기운을 보면 <span class="text-red-600 dark:text-red-400 font-bold">${dominant}</span>의 에너지가 가장 강합니다. `;
    if (maxOhaeng[0] === 'wood')
      story += `이로 인해 성장하고자 하는 욕구가 강하고, 새로운 일을 시작하는 추진력이 돋보입니다. `;
    else if (maxOhaeng[0] === 'fire')
      story += `이로 인해 매사에 열정적이며, 자신을 표현하고 드러내는 능력이 탁월합니다. `;
    else if (maxOhaeng[0] === 'earth')
      story += `이로 인해 주변을 아우르는 포용력이 있고, 누구에게나 믿음을 주는 묵직함이 있습니다. `;
    else if (maxOhaeng[0] === 'metal')
      story += `이로 인해 공과 사를 구분하는 결단력이 있고, 맺고 끊음이 확실하여 실수를 줄입니다. `;
    else if (maxOhaeng[0] === 'water')
      story += `이로 인해 상황에 맞춰 유연하게 대처하는 지혜가 있고, 깊은 통찰력을 가졌습니다. `;
    story += `<br/><br/>`;

    if (relations.length > 0) {
      story += `삶의 흐름 속에서 나타나는 인간관계와 변화를 살펴보면 다음과 같습니다.<br/>`;
      const haps = relations.filter((r) => r.type === '합');
      if (haps.length > 0) {
        story += `먼저 <span class="text-indigo-600 dark:text-indigo-400 font-bold">합(合)</span>의 기운이 있습니다. `;
        haps.forEach((h) => {
          story += `${h.target}와는 ${h.name}을 이루어 ${h.desc}. `;
        });
      }
      const chungs = relations.filter((r) => r.type === '충');
      if (chungs.length > 0) {
        const intro = haps.length > 0 ? ` 또한 ` : ` `;
        story += `${intro}<span class="text-amber-600 dark:text-amber-400 font-bold">충(沖)</span>의 기운도 함께 작용합니다. `;
        chungs.forEach((c) => {
          story += `${c.target}와는 ${c.name}이 되어 ${c.desc}. `;
        });
      }
      story += `<br/><br/>`;
    } else {
      story += `사주 내의 글자들이 서로 크게 부딪히거나 묶이지 않아, <span class="text-green-600 dark:text-green-400 font-bold">평온하고 무난한 흐름</span>을 보입니다. 격렬한 파도보다는 잔잔한 강물처럼 안정적인 삶을 영위할 가능성이 높습니다. <br/><br/>`;
    }

    story += `마지막으로, 당신의 운명에 숨겨진 특별한 무기(신살)들에 대한 상세 분석입니다.<br/>`;
    const gwiins = shinsalList.filter((s) => s.name === '천을귀인');
    const gongmangs = shinsalList.filter((s) => s.name === '공망');
    const others = shinsalList.filter((s) => s.name !== '천을귀인' && s.name !== '공망');

    if (gwiins.length > 0) {
      story += `<br/>✨ <span class="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 font-bold px-1 rounded">천을귀인</span>: `;
      story += gwiins.map((g) => g.desc).join(' 또한 ');
    }
    if (gongmangs.length > 0) {
      story += `<br/>🌫 <span class="text-gray-500 dark:text-gray-400 font-bold">공망</span>: `;
      story += gongmangs.map((g) => g.desc).join(' 그리고 ');
    }
    if (others.length > 0) {
      story += `<br/>🔑 <span class="text-indigo-700 dark:text-indigo-400 font-bold">그 외 신살</span>: `;
      const otherSentences = others.map(
        (sal) => `<b>${sal.name}</b>이(가) 있어 ${sal.desc}하는 경향`,
      );
      story += otherSentences.join(', ');
      story += `이 나타납니다. 이러한 기운들이 어우러져 당신만의 고유한 매력을 형성하고 있습니다.`;
    }

    return story;
  };

  const getDaewoonStory = (currentDaewoon, currentAge) => {
    if (!currentDaewoon) return '현재 대운 정보를 계산할 수 없습니다.';
    const ohaengKorean = {
      wood: '나무(木)',
      fire: '불(火)',
      earth: '흙(土)',
      metal: '쇠(金)',
      water: '물(水)',
    };

    let story = `현재 당신은 <b>${currentDaewoon.startAge}세</b>부터 시작된 <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xl">'${currentDaewoon.name}'</span> 대운을 지나고 있습니다. (현재 나이: ${currentAge}세)<br/><br/>`;
    story += `이 시기는 천간의 <b>${ohaengKorean[currentDaewoon.ganOhaeng]}</b> 기운과 지지의 <b>${ohaengKorean[currentDaewoon.zhiOhaeng]}</b> 기운이 당신의 인생 배경이 되는 시기입니다. `;

    if (currentDaewoon.ganOhaeng === currentDaewoon.zhiOhaeng) {
      story += `위아래가 같은 오행으로 이루어져 있어, <b>해당 기운의 특성이 매우 강력하게 드러나는 10년</b>입니다. 목표가 명확해지고 한 방향으로 에너지가 쏠리는 경험을 할 수 있습니다.`;
    } else if (
      (currentDaewoon.ganOhaeng === 'water' && currentDaewoon.zhiOhaeng === 'wood') ||
      (currentDaewoon.ganOhaeng === 'wood' && currentDaewoon.zhiOhaeng === 'fire') ||
      (currentDaewoon.ganOhaeng === 'fire' && currentDaewoon.zhiOhaeng === 'earth') ||
      (currentDaewoon.ganOhaeng === 'earth' && currentDaewoon.zhiOhaeng === 'metal') ||
      (currentDaewoon.ganOhaeng === 'metal' && currentDaewoon.zhiOhaeng === 'water')
    ) {
      story += `기운이 순환하는 '상생'의 흐름이라, <b>일의 진행이 비교적 순조롭고 결과물이 자연스럽게 맺어지는 시기</b>입니다.`;
    } else {
      story += `기운이 서로 부딪히거나 제어하는 관계라, <b>변동성이 크고 다이내믹한 변화</b>를 겪을 수 있습니다. 이는 위기가 될 수도 있지만, 큰 도약을 위한 발판이 되기도 합니다.`;
    }
    story += `<br/><br/>대운은 좋고 나쁨(길흉)보다는 <b>'내가 어떤 환경에 놓여있는가'</b>를 말해줍니다. 지금은 <span class="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold px-1">${currentDaewoon.name}</span>이라는 계절 속에 있음을 인지하고, 그 흐름에 맞춰 나아가는 지혜가 필요합니다.`;
    return story;
  };

  const getBarColor = (type) =>
    ({
      wood: 'bg-green-500',
      fire: 'bg-red-500',
      earth: 'bg-yellow-500',
      metal: 'bg-slate-400',
      water: 'bg-blue-600',
    })[type];

  if (!sajuData)
    return <div className="p-10 text-center dark:text-gray-300">생년월일을 입력해주세요.</div>;

  const {
    pillars,
    myShinsal,
    myIljuData,
    ilju,
    ohaengCount,
    maxOhaeng,
    relations,
    daewoonList,
    currentDaewoon,
    currentAge,
    jijangganList,
    hiddenStory,
  } = sajuData;

  const analysisStory = getAnalysisStory(myIljuData, myShinsal, maxOhaeng, relations);
  const daewoonStory = getDaewoonStory(currentDaewoon, currentAge);

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen  flex flex-col items-center transition-colors">
      <div className="bg-white dark:bg-slate-800 w-full rounded-sm shadow-xl overflow-hidden relative mb-8 transition-colors">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <FourPillarVis isTimeUnknown={isTimeUnknown} saju={saju} />
        <div className="p-8 md:p-12">
          {/* 사주 기둥 */}
          <div className="flex justify-center gap-4 mb-8 text-slate-400 dark:text-slate-500 text-sm border-b border-slate-100 dark:border-slate-700 pb-6">
            <div className="flex flex-col items-center">
              <span>시</span>
              <strong className="text-lg text-slate-700 dark:text-slate-300">{pillars.time}</strong>
            </div>
            <div className="flex flex-col items-center">
              <span>일</span>
              <strong className="text-lg text-slate-900 dark:text-white border-b-2 border-indigo-500">
                {pillars.day}
              </strong>
            </div>
            <div className="flex flex-col items-center">
              <span>월</span>
              <strong className="text-lg text-slate-700 dark:text-slate-300">
                {pillars.month}
              </strong>
            </div>
            <div className="flex flex-col items-center">
              <span>년</span>
              <strong className="text-lg text-slate-700 dark:text-slate-300">{pillars.year}</strong>
            </div>
          </div>

          {/* 오행 그래프 */}
          <div className="mb-8 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
            <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
              {Object.entries(ohaengCount).map(([type, count]) => (
                <div
                  key={type}
                  style={{ width: `${(count / 8) * 100}%` }}
                  className={getBarColor(type)}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 px-1 text-xs text-slate-500 dark:text-slate-400">
              <span>목 {ohaengCount.wood}</span>
              <span>화 {ohaengCount.fire}</span>
              <span>토 {ohaengCount.earth}</span>
              <span>금 {ohaengCount.metal}</span>
              <span>수 {ohaengCount.water}</span>
            </div>
          </div>

          {/* 스토리텔링 본문 */}
          <div
            className="prose prose-stone dark:prose-invert leading-loose text-lg text-slate-700 dark:text-slate-300 text-justify"
            dangerouslySetInnerHTML={{ __html: analysisStory }}
          />

          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-700 text-right">
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">
              당신의 잠재력을 믿으세요.
            </p>
          </div>
        </div>
      </div>
      {/* 지장간 UI: 표(간단보기) + 스토리텔링(상세해석) */}
      <div className="mb-10 w-full">
        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors">
          <h4 className="text-slate-600 dark:text-slate-400 font-bold text-xs mb-4 uppercase tracking-wider">
            🔮 Hidden Story (심층 분석)
          </h4>
          <div dangerouslySetInnerHTML={{ __html: hiddenStory }} />
        </div>
      </div>
      <div className="w-full space-y-6">
        {/* 합충 카드 */}
        {relations.length > 0 && (
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-3 px-2">
              ⚡ 에너지의 화학 반응 (합/충)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {relations.map((rel, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border flex items-center justify-between transition-colors ${
                    rel.type === '합'
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800'
                      : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-bold ${
                          rel.type === '합'
                            ? 'text-indigo-700 dark:text-indigo-300'
                            : 'text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {rel.name}
                      </span>
                      <span className="text-[10px] bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-300">
                        {rel.target}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rel.desc}</p>
                  </div>
                  <span
                    className={`text-xl font-bold ${
                      rel.type === '합'
                        ? 'text-indigo-300 dark:text-indigo-500'
                        : 'text-amber-300 dark:text-amber-500'
                    }`}
                  >
                    {rel.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 신살 상세 카드 */}
        {myShinsal.length > 0 && (
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-3 px-2">
              🌟 나의 특별한 기운 (신살 & 공망)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {myShinsal.map((sal, idx) => {
                const isNoble = sal.name === '천을귀인';
                const isVoid = sal.name === '공망';
                let cardStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700';
                let typeStyle = 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400';

                if (isNoble) {
                  cardStyle =
                    'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30 ring-1 ring-yellow-200 dark:ring-yellow-900/30';
                  typeStyle =
                    'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 font-bold';
                } else if (isVoid) {
                  cardStyle =
                    'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 border-dashed';
                  typeStyle = 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
                }

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg shadow-sm border flex items-center justify-between transition-colors ${cardStyle}`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-bold ${isNoble ? 'text-yellow-800 dark:text-yellow-300' : 'text-slate-800 dark:text-slate-200'}`}
                        >
                          {sal.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeStyle}`}>
                          {sal.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{sal.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 대운 분석 섹션 */}
        {daewoonList.length > 0 && (
          <div className="mt-8">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-3 px-2 flex items-center justify-between">
              <span>🌊 대운의 흐름 (10년마다 바뀌는 운)</span>
              <span className="text-xs font-normal bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                현재 {currentAge}세
              </span>
            </h3>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto transition-colors">
              <div className="flex gap-2 min-w-max pb-2">
                {daewoonList.map((dae, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg border transition-all
                      ${
                        dae.isCurrent
                          ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white shadow-md transform scale-105'
                          : 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600 text-slate-400 dark:text-slate-500'
                      }`}
                  >
                    <span className="text-xs mb-1 opacity-80">{dae.startAge}세</span>
                    <span className="font-bold text-lg">{dae.name}</span>
                    {dae.isCurrent && (
                      <span className="text-[10px] mt-1 bg-white/20 px-1 rounded">NOW</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {currentDaewoon && (
              <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-100 dark:border-indigo-900/50 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                    {currentDaewoon.name[0]}
                  </div>
                  <div>
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">
                      Current Season
                    </p>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {currentDaewoon.name} 대운 ({currentDaewoon.startAge}~
                      {currentDaewoon.endAge || '...'}세)
                    </h4>
                  </div>
                </div>
                <div
                  className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm text-justify"
                  dangerouslySetInnerHTML={{ __html: daewoonStory }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicAna;
