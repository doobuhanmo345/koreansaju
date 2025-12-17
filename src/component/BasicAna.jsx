import { useMemo } from 'react';
import { Solar } from 'lunar-javascript';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import {
  GOEGANG_LIST,
  BAEKHO_LIST,
  SAMHAP_MAP,
  OHAENG_MAP,
  RELATION_RULES,
  GWIN_MAP,
  JIJANGGAN_MAP,
  getRomanizedIlju,
  getTenGodType,
} from '../data/sajuInt';
import { ENG_MAP, UI_TEXT } from '../data/constants';
import { HANJA_MAP } from '../data/constants';
import { ILJU_DATA, ILJU_DATA_EN } from '../data/ilju_data';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import FourPillarVis from '../component/FourPillarVis';
import { useLanguage } from '../context/useLanguageContext';
import { getEng } from '../utils/helpers';
const BasicAna = ({ inputDate, saju, inputGender, isTimeUnknown }) => {
  const { language } = useLanguage();

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
        saju.sky3,
        saju.grd3,
        saju.sky2,
        saju.grd2,
        saju.sky1,
        saju.grd1,
        saju.sky0,
        saju.grd0,
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
      const isEn = language === 'en';
      const ilju = pillars.day;
      const calculateShinsal = (pillars, branches, dayMaster, language) => {
        // language 인자 추가
        const result = [];
        const criteriaBranches = [branches.year, branches.day];

        criteriaBranches.forEach((criteria, index) => {
          // 템플릿 구조 유지: baseLabel 언어 분기
          const baseLabel =
            index === 0
              ? isEn
                ? 'Based on Year'
                : '년지기준'
              : isEn
                ? 'Based on Day'
                : '일지기준';

          const group = SAMHAP_MAP[criteria];
          if (!group) return;

          const [element, yeokma, dohwa, hwagae] = group;

          Object.values(branches).forEach((branch) => {
            if (branch === yeokma && index === 0) {
              result.push({
                name: isEn ? 'Yeokma-sal' : '역마살',
                type: baseLabel,
                desc: isEn ? 'Movement, change, and travel' : '이동수, 변동',
              });
            }
            if (branch === dohwa && index === 0) {
              result.push({
                name: isEn ? 'Dohwa-sal' : '도화살',
                type: baseLabel,
                desc: isEn ? 'Popularity, charm, and attraction' : '인기, 매력',
              });
            }
            if (branch === hwagae) {
              result.push({
                name: isEn ? 'Hwagae-sal' : '화개살',
                type: baseLabel,
                desc: isEn ? 'Art, religion, and reflection' : '예술, 종교, 복귀',
              });
            }
          });
        });

        // 2. 일주 자체로 보는 살 (백호, 괴강)
        if (BAEKHO_LIST.includes(pillars.day)) {
          result.push({
            name: isEn ? 'Baekho-sal' : '백호살',
            type: isEn ? 'Day Pillar' : '일주',
            desc: isEn
              ? 'Strong energy, professionalism, and intensity'
              : '강한 기운, 혈광지사 조심, 프로페셔널',
          });
        }

        if (GOEGANG_LIST.includes(pillars.day)) {
          result.push({
            name: isEn ? 'Goegang-sal' : '괴강살',
            type: isEn ? 'Day Pillar' : '일주',
            desc: isEn
              ? 'Leadership, intelligence, and strong character'
              : '우두머리 기질, 총명, 강한 리더십',
          });
        }

        // 3. 천을귀인 (GWIN_MAP 구조 유지)
        const GWIN_MAP = {
          갑: ['축', '미'],
          무: ['축', '미'],
          경: ['축', '미'],
          을: ['자', '신'],
          기: ['자', '신'],
          병: ['해', '유'],
          정: ['해', '유'],
          신: ['인', '오'],
          임: ['사', '묘'],
          계: ['사', '묘'],
        };

        const targets = GWIN_MAP[dayMaster];
        if (targets) {
          Object.values(branches).forEach((branch) => {
            if (targets.includes(branch)) {
              result.push({
                name: isEn ? 'noble gold star' : '천을귀인',
                type: isEn ? 'Day Master Basis' : '일간기준',
                desc: isEn
                  ? 'The ultimate auspicious star, helper, and protector'
                  : '최고의 길신, 조력자, 액땜',
              });
            }
          });
        }

        const uniqueResult = [...new Map(result.map((item) => [item.name, item])).values()];
        return uniqueResult;
      };
      let finalShinsal = calculateShinsal(pillars, branches, dayMaster);
      const nobleTargets = GWIN_MAP[dayMaster] || [];

      nobleTargets.forEach((target) => {
        Object.entries(branches).forEach(([pos, branch]) => {
          if (branch === target) {
            const posName = {
              year: language === 'en' ? 'Year Pillar (Ancestors)' : '년지(조상자리)',
              month: language === 'en' ? 'Month Pillar (Social)' : '월지(사회자리)',
              day: language === 'en' ? 'Day Pillar (Spouse)' : '일지(배우자자리)',
              time: language === 'en' ? 'Hour Pillar (Children/Late Life)' : '시지(자식/말년자리)',
            }[pos];

            finalShinsal.push({
              name: language === 'en' ? 'noble gold star' : '천을귀인',
              type: language === 'en' ? 'Great Auspicious Star' : '대길신',
              desc:
                language === 'en'
                  ? `Located in '${ENG_MAP[branch]}' of your ${posName}. This is the ultimate auspicious star that turns bad luck into good and brings help from noble people at decisive moments.`
                  : `사주의 ${posName}인 '${branch}'에 위치하고 있습니다. 이는 흉을 길로 바꾸고 결정적인 순간에 귀인의 도움을 받는 최고의 길신입니다`,
            });
          }
        });
      });

      const gongmangHanja = lunar.getDayXunKong();
      const gongmangTargets = gongmangHanja.split('').map((h) => HANJA_MAP[h]);
      Object.entries(branches).forEach(([pos, branch]) => {
        if (pos === 'day') return;
        if (gongmangTargets.includes(branch)) {
          const posName = {
            year: language === 'en' ? 'Year Pillar (Early Life)' : '년지(초년)',
            month: language === 'en' ? 'Month Pillar (Social)' : '월지(청년/사회)',
            time: language === 'en' ? 'Hour Pillar (Late Life)' : '시지(말년)',
          }[pos];

          finalShinsal.push({
            name: language === 'en' ? 'gongmang' : '공망',
            type: language === 'en' ? 'emptiness' : '공허',
            desc:
              language === 'en'
                ? `${posName} contains the character '${ENG_MAP[branch]}', which is in Gongmang (Emptiness). During this period, you will find more peace by pursuing spiritual or philosophical values rather than material greed.`
                : `${posName}에 해당하는 '${branch}' 글자가 비어있는 공망입니다. 해당 시기에는 현실적 욕심보다 정신적, 철학적 가치를 추구할 때 마음이 편안해집니다`,
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

      const myIljuData =
        language === 'ko'
          ? ILJU_DATA[ilju]
          : ILJU_DATA_EN[ilju] || {
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

      const TEN_GOD_DESC = {
        비겁: {
          name: isEn ? 'Self (Bigeop)' : '비겁',
          initial: isEn
            ? 'have developed a strong sense of self and uncompromising conviction'
            : '타협하지 않는 주관과 뚝심을 익혔으며',
          middle: isEn
            ? 'a competitive spirit that refuses to be defeated by others'
            : '타인에게 지지 않으려는 승부욕',
        },
        식상: {
          name: isEn ? 'Expression (Siksang)' : '식상',
          initial: isEn
            ? 'possess a free-spirited curiosity that is not bound by formality'
            : '형식에 얽매이지 않는 자유로운 호기심을 가지고 있으며',
          middle: isEn
            ? 'an instinct to express yourself uniquely from others'
            : '남과 다르게 자신을 표현하고자 하는 본능',
        },
        재성: {
          name: isEn ? 'Wealth (Jaeseong)' : '재성',
          initial: isEn
            ? 'have the ability to perceive reality with a cool and analytical mind'
            : '현실을 냉철하게 파악하는 능력이 있으며',
          middle: isEn
            ? 'a practical desire to achieve tangible results and efficiency'
            : '확실한 결과와 실속을 챙기려는 실리적 욕망',
        },
        관성: {
          name: isEn ? 'Honor (Gwanseong)' : '관성',
          initial: isEn
            ? 'maintain an attitude of self-discipline and adherence to principles'
            : '스스로를 절제하고 원칙을 지키려는 태도를 가지고 있으며',
          middle: isEn
            ? 'a will to value honor and control yourself with integrity'
            : '명예를 중요시하고 흐트러짐 없이 자신을 통제하려는 의지',
        },
        인성: {
          name: isEn ? 'Resource (Inseong)' : '인성',
          initial: isEn
            ? 'think deeply about situations and accept them with an open mind'
            : '상황을 깊이 생각하고 수용하며',
          middle: isEn
            ? 'profound insight and intuition to pierce through the essence of things'
            : '본질을 꿰뚫어 보고자 하는 깊은 통찰력과 직관',
        },
      };

      const getHiddenStory = () => {
        const order = [
          {
            key: 'year',
            title: isEn ? '🌱 Early Life' : '🌱 초년',
            context: isEn
              ? 'Influenced by your childhood experiences and family background, you'
              : '당신은 어린시절 경험과 가족의 영향으로',
          },
          {
            key: 'month',
            title: isEn ? '🏢 Social Environment' : '🏢 사회적 환경',
            context: isEn
              ? 'Behind your professional and social persona,'
              : '당신의 사회적 모습 이면에는',
          },
          {
            key: 'day',
            title: isEn ? '🏠 Inner Heart' : '🏠 본심과 속마음',
            context: isEn
              ? 'In your private life and personal relationships,'
              : '당신이 배우자를 대할 때에는',
          },
          {
            key: 'time',
            title: isEn ? '🌇 Later Life' : '🌇 말년',
            context: isEn ? 'As you grow older, you' : '나이가 들수록',
          },
        ];

        let fullStory = '';

        order.forEach((section) => {
          const data = jijangganList[section.key];
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
            parts.push(
              isEn
                ? `within that lies <b>${TEN_GOD_DESC[tenGod].middle}</b>`
                : `그 내면에는 <b>${TEN_GOD_DESC[tenGod].middle}</b>이(가) 있습니다`,
            );
          } else {
            parts.push(
              isEn
                ? `show a <b>straightforward and transparent nature</b>, where your outer energy is exactly what lies in your heart, with no hidden motives`
                : `숨겨진 다른 마음 없이, 겉으로 드러난 기운이 곧 본심인 <b>솔직하고 투명한 직진성</b>을 보입니다`,
            );
          }

          sectionStory += parts.join(isEn ? ', and ' : ', ');
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
  }, [saju, inputGender]);

  // 스토리텔링 함수
  const getAnalysisStory = (iljuData, shinsalList, maxOhaeng, relations) => {
    const ohaengNames = {
      ko: { wood: '나무(목)', fire: '불(화)', earth: '흙(토)', metal: '쇠(금)', water: '물(수)' },
      en: { wood: 'wood', fire: 'fire', earth: 'earth', metal: 'metal', water: 'water' },
    };
    const dominant = ohaengNames[language][maxOhaeng[0]];

    let story = ``;
    const safeIlju = ilju ? getRomanizedIlju(ilju) : 'gapja';
    const safeGender = inputGender ? inputGender.toLowerCase() : 'male';
    const iljuImagePath = `/images/ilju/${safeIlju}_${safeGender}.png`;

    // 다크모드 클래스 추가
    story += `<div class="rounded-xl p-6 border border-blue-50 dark:border-slate-700  shadow-sm dark:bg-slate-800/50">`;

    story += `<div id="share-card" class="mb-6 mx-auto max-w-md bg-indigo-50/50 dark:bg-slate-700/50 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-5 text-center shadow-sm backdrop-blur-sm">
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
    //여기서부터 해석
    const isEn = language === 'en';

    // 1. 기본 서술 시작
    story += `<div class="leading-relaxed tracking-wide text-[15px]">`;
    story += `<br/>${isEn ? 'Looking at the overall energy flow of your Saju, the energy of ' : '사주 전체를 흐르는 기운을 보면 '}<span class="text-red-600 dark:text-red-400 font-bold">${dominant}</span>${isEn ? ' is the most powerful.' : '의 에너지가 가장 강합니다. '}`;

    // 2. 오행(Five Elements) 분석
    const ohaengDescriptions = {
      wood: {
        ko: '이로 인해 성장하고자 하는 욕구가 강하고, 새로운 일을 시작하는 추진력이 돋보입니다.',
        en: ' This gives you a strong desire for growth and a remarkable drive to initiate new projects.',
      },
      fire: {
        ko: '이로 인해 매사에 열정적이며, 자신을 표현하고 드러내는 능력이 탁월합니다.',
        en: ' This makes you passionate in everything you do, with an excellent ability to express yourself.',
      },
      earth: {
        ko: '이로 인해 주변을 아우르는 포용력이 있고, 누구에게나 믿음을 주는 묵직함이 있습니다.',
        en: ' This provides you with an inclusive embrace and a grounded reliability that earns everyone’s trust.',
      },
      metal: {
        ko: '이로 인해 공과 사를 구분하는 결단력이 있고, 맺고 끊음이 확실하여 실수를 줄입니다.',
        en: ' This grants you the decisiveness to separate public and private matters, minimizing mistakes with clear boundaries.',
      },
      water: {
        ko: '이로 인해 상황에 맞춰 유연하게 대처하는 지혜가 있고, 깊은 통찰력을 가졌습니다.',
        en: ' This endows you with the wisdom to adapt flexibly to situations and a profound depth of insight.',
      },
    };

    story += isEn ? ohaengDescriptions[maxOhaeng[0]].en : ohaengDescriptions[maxOhaeng[0]].ko;
    story += `<br/><br/>`;

    // 3. 관계(Relations: 합/충) 분석
    if (relations.length > 0) {
      story += isEn
        ? `Examining the relationships and changes in your life flow:<br/>`
        : `삶의 흐름 속에서 나타나는 인간관계와 변화를 살펴보면 다음과 같습니다.<br/>`;

      const haps = relations.filter((r) => r.type === '합');
      if (haps.length > 0) {
        story += isEn
          ? `First, there is the energy of <span class="text-indigo-600 dark:text-indigo-400 font-bold">Harmony (Hap)</span>. `
          : `먼저 <span class="text-indigo-600 dark:text-indigo-400 font-bold">합(合)</span>의 기운이 있습니다. `;
        haps.forEach((h) => {
          story += isEn
            ? `With ${h.target}, you form ${h.name}, which means ${h.desc}. `
            : `${h.target}와는 ${h.name}을 이루어 ${h.desc}. `;
        });
      }

      const chungs = relations.filter((r) => r.type === '충');
      if (chungs.length > 0) {
        const intro = isEn
          ? haps.length > 0
            ? ` Additionally, `
            : ` `
          : haps.length > 0
            ? ` 또한 `
            : ` `;
        story += `${intro}<span class="text-amber-600 dark:text-amber-400 font-bold">${isEn ? 'Conflict (Chung)' : '충(沖)'}</span>${isEn ? ' energy is also at play. ' : '의 기운도 함께 작용합니다. '}`;
        chungs.forEach((c) => {
          story += isEn
            ? `With ${c.target}, it becomes ${c.name}, leading to ${c.desc}. `
            : `${c.target}와는 ${c.name}이 되어 ${c.desc}. `;
        });
      }
      story += `<br/><br/>`;
    } else {
      story += isEn
        ? `As the characters in your Saju do not clash or bind significantly, you show a <span class="text-green-600 dark:text-green-400 font-bold">peaceful and smooth flow</span>. You are likely to lead a stable life, like a calm river rather than turbulent waves. <br/><br/>`
        : `사주 내의 글자들이 서로 크게 부딪히거나 묶이지 않아, <span class="text-green-600 dark:text-green-400 font-bold">평온하고 무난한 흐름</span>을 보입니다. 격렬한 파도보다는 잔잔한 강물처럼 안정적인 삶을 영위할 가능성이 높습니다. <br/><br/>`;
    }

    // 4. 신살(Special Stars) 분석
    story += isEn
      ? `Finally, here is a detailed analysis of the hidden special weapons (Shinsal) in your destiny.<br/>`
      : `마지막으로, 당신의 운명에 숨겨진 특별한 무기(신살)들에 대한 상세 분석입니다.<br/>`;

    const gwiins = shinsalList.filter((s) => s.name === '천을귀인' || s.name === 'noble gold star');
    const gongmangs = shinsalList.filter((s) => s.name === '공망' || s.name === 'gongmang');
    const others = shinsalList.filter(
      (s) =>
        s.name !== '천을귀인' &&
        s.name !== '공망' &&
        s.name !== 'gongmang' &&
        s.name !== 'noble gold star',
    );

    if (gwiins.length > 0) {
      const label = isEn ? 'Noble Grade Star' : '천을귀인';
      story += `<br/>✨ <span class="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 font-bold px-1 rounded">${label}</span>: `;
      story += gwiins.map((g) => g.desc).join(isEn ? ' and also ' : ' 또한 ');
    }

    if (gongmangs.length > 0) {
      const label = isEn ? 'Emptiness (Gongmang)' : '공망';
      story += `<br/>🌫 <span class="text-gray-500 dark:text-gray-400 font-bold">${label}</span>: `;
      story += gongmangs.map((g) => g.desc).join(isEn ? ' and ' : ' 그리고 ');
    }

    if (others.length > 0) {
      const label = isEn ? 'Other Special Stars' : '그 외 신살';
      story += `<br/>🔑 <span class="text-indigo-700 dark:text-indigo-400 font-bold">${label}</span>: `;
      const otherSentences = others.map((sal) => {
        return isEn
          ? `having <b>${sal.name}</b> tends to ${sal.desc}`
          : `<b>${sal.name}</b>이(가) 있어 ${sal.desc}하는 경향`;
      });
      story += otherSentences.join(', ');
      story += isEn
        ? `. These energies harmonize to form your unique charm.`
        : `이 나타납니다. 이러한 기운들이 어우러져 당신만의 고유한 매력을 형성하고 있습니다.`;
    }

    story += `</div>`;
    //여기까지
    return story;
  };
  const isEn = language === 'en';
  const getDaewoonStory = (currentDaewoon, currentAge, language) => {
    if (!currentDaewoon) {
      return isEn
        ? 'Current Daewoon information cannot be calculated.'
        : '현재 대운 정보를 계산할 수 없습니다.';
    }

    const ohaengNames = {
      wood: isEn ? 'Wood (木)' : '나무(木)',
      fire: isEn ? 'Fire (火)' : '불(火)',
      earth: isEn ? 'Earth (土)' : '흙(土)',
      metal: isEn ? 'Metal (金)' : '쇠(金)',
      water: isEn ? 'Water (水)' : '물(水)',
    };

    let story = isEn
      ? `You are currently in the <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xl">'${ENG_MAP[currentDaewoon.name[0]]}${ENG_MAP[currentDaewoon.name[1]]}'</span> Daewoon, which began at the age of <b>${currentDaewoon.startAge}</b>. (Current Age: ${currentAge})<br/><br/>`
      : `현재 당신은 <b>${currentDaewoon.startAge}세</b>부터 시작된 <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xl">'${currentDaewoon.name}'</span> 대운을 지나고 있습니다. (현재 나이: ${currentAge}세)<br/><br/>`;

    story += isEn
      ? `In this period, the energy of <b>${ohaengNames[currentDaewoon.ganOhaeng]}</b> from the Heaven Pillar and <b>${ohaengNames[currentDaewoon.zhiOhaeng]}</b> from the Earth Pillar form the background of your life path. `
      : `이 시기는 천간의 <b>${ohaengNames[currentDaewoon.ganOhaeng]}</b> 기운과 지지의 <b>${ohaengNames[currentDaewoon.zhiOhaeng]}</b> 기운이 당신의 인생 배경이 되는 시기입니다. `;

    // 로직 판별 및 스토리 추가
    if (currentDaewoon.ganOhaeng === currentDaewoon.zhiOhaeng) {
      story += isEn
        ? `As both pillars consist of the same element, <b>the characteristics of this energy will manifest very powerfully over these 10 years</b>. You may experience clear goals and a strong concentration of energy in one direction.`
        : `위아래가 같은 오행으로 이루어져 있어, <b>해당 기운의 특성이 매우 강력하게 드러나는 10년</b>입니다. 목표가 명확해지고 한 방향으로 에너지가 쏠리는 경험을 할 수 있습니다.`;
    } else if (
      (currentDaewoon.ganOhaeng === 'water' && currentDaewoon.zhiOhaeng === 'wood') ||
      (currentDaewoon.ganOhaeng === 'wood' && currentDaewoon.zhiOhaeng === 'fire') ||
      (currentDaewoon.ganOhaeng === 'fire' && currentDaewoon.zhiOhaeng === 'earth') ||
      (currentDaewoon.ganOhaeng === 'earth' && currentDaewoon.zhiOhaeng === 'metal') ||
      (currentDaewoon.ganOhaeng === 'metal' && currentDaewoon.zhiOhaeng === 'water')
    ) {
      story += isEn
        ? `This is a flow of 'Mutual Generation' where energy circulates smoothly, making it a <b>period where things progress relatively well and results are achieved naturally</b>.`
        : `기운이 순환하는 '상생'의 흐름이라, <b>일의 진행이 비교적 순조롭고 결과물이 자연스럽게 맺어지는 시기</b>입니다.`;
    } else {
      story += isEn
        ? `Since the energies are in a controlling or clashing relationship, you may experience <b>high volatility and dynamic changes</b>. This can be a challenge, but it also serves as a stepping stone for a great leap forward.`
        : `기운이 서로 부딪히거나 제어하는 관계라, <b>변동성이 크고 다이내믹한 변화</b>를 겪을 수 있습니다. 이는 위기가 될 수도 있지만, 큰 도약을 위한 발판이 되기도 합니다.`;
    }

    story += `<br/><br/>`;
    story += isEn
      ? `Daewoon tells us more about <b>'what kind of environment I am placed in'</b> rather than simple good or bad luck. Recognizing that you are in the season of <span class="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold px-1">${ENG_MAP[currentDaewoon.name[0]]}${ENG_MAP[currentDaewoon.name[1]]}</span>, you need the wisdom to move in harmony with that flow.`
      : `대운은 좋고 나쁨(길흉)보다는 <b>'내가 어떤 환경에 놓여있는가'</b>를 말해줍니다. 지금은 <span class="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold px-1">${currentDaewoon.name}</span>이라는 계절 속에 있음을 인지하고, 그 흐름에 맞춰 나아가는 지혜가 필요합니다.`;

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

    hiddenStory,
  } = sajuData;

  const analysisStory = getAnalysisStory(myIljuData, myShinsal, maxOhaeng, relations);
  const daewoonStory = getDaewoonStory(currentDaewoon, currentAge);
  const t = (char) => (language === 'en' ? getEng(char) : char);
  return (
    <div className="max-w-2xl mx-auto min-h-screen  flex flex-col items-center transition-colors">
      <div className="bg-white dark:bg-slate-800 w-full rounded-sm shadow-xl overflow-hidden relative mb-8 transition-colors">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="w-full overflow-x-auto mt-2">
          {/* 입력생일 정보 */}
          <div className="flex flex-col gap-1 p-3">
            <div className="gap-1.5 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <CalendarDaysIcon className="w-4 h-4 text-indigo-400" />
              <span className="font-mono tracking-wide">
                {isTimeUnknown ? (
                  <>{inputDate.split('T')[0]}</>
                ) : (
                  <>{inputDate.replace('T', ' ')}</>
                )}
              </span>

              {inputGender === 'male' ? '👨' : '👩'}
              {isTimeUnknown && (
                <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 rounded text-gray-400">
                  {UI_TEXT.unknownTime[language]}
                </span>
              )}
            </div>
            {/* 구분선 */}
            <div className="border-t border-dashed border-indigo-100 dark:border-indigo-800 w-full"></div>
            {/* 3. 사주 명식 (변환값) - 가장 중요하게 강조 */}
            {saju?.sky1 && (
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {/* 년주 */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
                    {UI_TEXT.year[language]}
                  </span>
                  <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
                    {t(saju.sky3)}
                    {t(saju.grd3)}
                  </span>
                </div>

                {/* 월주 */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
                    {UI_TEXT.month[language]}
                  </span>
                  <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
                    {t(saju.sky2)}
                    {t(saju.grd2)}
                  </span>
                </div>

                {/* 일주 (강조) */}
                <div className="flex flex-col items-center relative">
                  {/* 일주 강조용 배경 점 */}
                  <div className="absolute inset-0 bg-indigo-100/50 dark:bg-indigo-500/20 blur-md rounded-full transform scale-150"></div>
                  <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase mb-0.5 relative z-10">
                    {UI_TEXT.day[language]}
                  </span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-200 tracking-widest leading-none relative z-10 drop-shadow-sm">
                    {t(saju.sky1)}
                    {t(saju.grd1)}
                  </span>
                </div>

                {/* 시주 */}
                {!isTimeUnknown && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
                      {UI_TEXT.hour[language]}
                    </span>
                    <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
                      {t(saju.sky0)}
                      {t(saju.grd0)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* FourPillarVis가 찌그러지지 않도록 최소 너비 등을 컴포넌트 내부나 래퍼에 주어야 함 */}
          <div className="min-w-[320px] md:min-w-0 ">
            <FourPillarVis isTimeUnknown={isTimeUnknown} saju={saju} />
          </div>
        </div>
      </div>
      {/* 오행 그래프 */}
      <div className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
          {Object.entries(ohaengCount).map(([type, count]) => (
            <div
              key={type}
              style={{ width: `${(count / (isTimeUnknown ? 6 : 8)) * 100}%` }}
              className={getBarColor(type)}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 px-1 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {language === 'ko' ? '목' : 'wood'}
            {ohaengCount.wood}
          </span>
          <span>
            {language === 'ko' ? '화' : 'fire'}
            {ohaengCount.fire}
          </span>
          <span>
            {language === 'ko' ? '토' : 'earth'}
            {ohaengCount.earth}
          </span>
          <span>
            {language === 'ko' ? '금' : 'metal'}
            {ohaengCount.metal}
          </span>
          <span>
            {language === 'ko' ? '수' : 'water'}
            {ohaengCount.water}
          </span>
        </div>
      </div>
      <div
        className="prose prose-stone dark:prose-invert leading-loose text-slate-700 dark:text-slate-300 text-justify my-6"
        dangerouslySetInnerHTML={{ __html: analysisStory }}
      />

      {/* 지장간 UI: 표(간단보기) + 스토리텔링(상세해석) */}
      <div className="mb-10 w-full">
        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors">
          <h4 className="text-slate-600 dark:text-slate-400 font-bold text-xs mb-4 uppercase tracking-wider">
            {language === 'en'
              ? '🔮 Soul’s Blueprint (Deep Analysis)'
              : '🔮 영혼의 설계도 (심층 분석)'}
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
              <span>
                {language === 'en'
                  ? '🌟 My Special Energies (Shinsal & Gongmang)'
                  : '🌟 나의 특별한 기운 (신살 & 공망)'}
              </span>
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
              <span>
                {language === 'en'
                  ? '🌊 Flow of Daewoon (Changes Every 10 Years)'
                  : '🌊 대운의 흐름 (10년마다 바뀌는 운)'}
              </span>
              <span className="text-xs font-normal bg-slate-200 dark: dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                {language === 'en' ? `Age ${currentAge}` : `현재 ${currentAge}세`}
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
                    {/* 나이 표시 부분 수정 */}
                    <span className="text-xs mb-1 opacity-80">
                      {language === 'en' ? `Age ${dae.startAge}` : `${dae.startAge}세`}
                    </span>

                    <span className="font-bold text-lg">
                      {language === 'en'
                        ? dae.name &&
                          dae.name[0] &&
                          dae.name[1] &&
                          ENG_MAP[dae.name[0]] &&
                          ENG_MAP[dae.name[1]]
                          ? `${ENG_MAP[dae.name[0]]} ${ENG_MAP[dae.name[1]]}`
                          : ''
                        : dae.name || ''}
                    </span>

                    {dae.isCurrent && (
                      <span className="text-[10px] mt-1 bg-white/20 px-1 rounded">
                        {language === 'en' ? 'NOW' : '현재'}
                      </span>
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
                      {language === 'en' ? (
                        <>
                          {ENG_MAP[currentDaewoon.name[0]]}
                          {ENG_MAP[currentDaewoon.name[1]]}
                        </>
                      ) : (
                        <>{currentDaewoon.name}</>
                      )}{' '}
                      {language === 'en' ? 'Period' : '대운'} ({currentDaewoon.startAge} ~{' '}
                      {currentDaewoon.endAge || '...'} {language === 'en' ? 'Age' : '세'})
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
