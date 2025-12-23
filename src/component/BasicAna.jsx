import { useMemo, useState, useEffect } from 'react';
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
  ohaengKorean,
} from '../data/sajuInt';
import { ENG_MAP, UI_TEXT } from '../data/constants';
import { HANJA_MAP } from '../data/constants';
import { ILJU_DATA, ILJU_DATA_EN } from '../data/ilju_data';
import html2canvas from 'html2canvas';
import FourPillarVis from '../component/FourPillarVis';
import { useLanguage } from '../context/useLanguageContext';
import { getEng } from '../utils/helpers';
const BasicAna = ({ inputDate, saju, inputGender, isTimeUnknown, handleSetViewMode }) => {
  const { language } = useLanguage();
  const handleShare = async (id) => {
    const el = document.getElementById(id);
    if (!el) {
      alert('share-card를 찾을 수 없습니다.');
      return;
    }

    // 1️⃣ 현재 visibility 상태 저장
    const prevVisibility = el.style.visibility;

    try {
      // 2️⃣ 잠깐 보이게 전환
      el.style.visibility = 'visible';

      // 3️⃣ 이미지 / 폰트 로딩 대기
      const imgs = Array.from(el.querySelectorAll('img'));
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
        ),
      );

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // 4️⃣ 캡쳐
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      // 5️⃣ 이미지 저장
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));

      if (!blob) throw new Error('canvas toBlob 실패');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'share-card.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('캡쳐 실패: 이미지 CORS 또는 렌더링 문제');
    } finally {
      // 6️⃣ 다시 숨김 복구
      el.style.visibility = prevVisibility || 'hidden';
    }
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
      const stems = {
        year: allChars[0],
        month: allChars[2],
        day: allChars[4],
        time: allChars[6],
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
  const safeIlju = saju.sky1 + saju.grd1 ? getRomanizedIlju(saju.sky1 + saju.grd1) : 'gapja';
  const safeGender = inputGender ? inputGender.toLowerCase() : 'male';
  const iljuImagePath = `/images/ilju/${safeIlju}_${safeGender}.png`;
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
      // 1. 언어 설정 ('ko' or 'en')
      const lang = isEn ? 'en' : 'ko';

      // 2. 데이터 매핑 (target 정보와 언어별 데이터를 합칩니다)
      const mappedRelations = relations.map((r) => ({
        target: r.target, // 원래 객체에 있던 대상(예: 'Year Pillar') 유지
        ...(r[lang] || {}), // 언어에 맞는 데이터(name, desc, type) 덮어쓰기
      }));

      // 3. 문구 시작
      story += isEn
        ? `Examining the relationships and changes in your life flow:<br/>`
        : `삶의 흐름 속에서 나타나는 인간관계와 변화를 살펴보면 다음과 같습니다.<br/>`;

      // 4. 합(Harmony) 처리
      // 데이터에 '합', '육합', 'Harmony' 중 하나라도 있으면 통과
      const haps = mappedRelations.filter((r) =>
        ['천간합', '합', '육합', 'Harmony'].includes(r.type),
      );

      if (haps.length > 0) {
        story += isEn
          ? `First, there is the energy of <span class="text-indigo-600 dark:text-indigo-400 font-bold">Harmony (Hap)</span>. `
          : `먼저 <span class="text-indigo-600 dark:text-indigo-400 font-bold">합(合)</span>의 기운이 있습니다. `;

        haps.forEach((h) => {
          story += isEn
            ? `With ${h.target}, you form ${h.name}, which means ${h.desc} `
            : `${h.target}와는 ${h.name}을 이루어 ${h.desc} `;
        });
      }

      // 5. 충(Clash) 처리
      // 데이터에 '충', '육충', 'Clash' 중 하나라도 있으면 통과
      const chungs = mappedRelations.filter((r) => ['충', '육충', 'Clash'].includes(r.type));

      if (chungs.length > 0) {
        const intro = isEn
          ? haps.length > 0
            ? ` Additionally, `
            : ``
          : haps.length > 0
            ? ` 또한 `
            : ``;

        story += `${intro}<span class="text-amber-600 dark:text-amber-400 font-bold">${
          isEn ? 'Conflict (Chung)' : '충(沖)'
        }</span>${isEn ? ' energy is also at play. ' : '의 기운도 함께 작용합니다. '}`;

        chungs.forEach((c) => {
          story += isEn
            ? `With ${c.target}, it becomes ${c.name}, leading to ${c.desc} `
            : `${c.target}와는 ${c.name}이 되어 ${c.desc} `;
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
  const getDaewoonStory = (selectedDae, currentAge, language) => {
    const isEn = language === 'en';
    if (!selectedDae) return '';

    // [데이터 방어] 필드명 불일치 완벽 대응
    const name = selectedDae.name || selectedDae.pillar || '정보 없음';
    const startAge = selectedDae.startAge || selectedDae.age || '0';
    const endAge = selectedDae.endAge || Number(startAge) + 9;
    const shipSung = isEn
      ? selectedDae.shipSungEn || selectedDae.shipsungEn || selectedDae.shipSung || 'Luck'
      : selectedDae.shipSung || selectedDae.shipsung || '운세';
    const gan = selectedDae.ganOhaeng || '';
    const zhi = selectedDae.zhiOhaeng || '';

    const ohaengMap = {
      wood: isEn ? 'Wood' : '나무(木)',
      fire: isEn ? 'Fire' : '불(火)',
      earth: isEn ? 'Earth' : '흙(土)',
      metal: isEn ? 'Metal' : '금(金)',
      water: isEn ? 'Water' : '물(水)',
    };

    // 60갑자 전체 데이터 (KR/EN 통합 객체)
    const pillarDetails = {
      갑자: {
        ko: '추운 겨울 차가운 물 위로 나무가 뿌리를 내리려 고군분투하는 환경입니다. 전반기에는 정체를 겪을 수 있으나, 후반기로 갈수록 내실이 탄탄해지는 흐름입니다.',
        en: 'A giant tree rooted in freezing winter water. External growth is slow, but internal roots are deepening. Focus on wisdom rather than immediate action.',
      },
      을축: {
        ko: '얼어붙은 땅 밑에서 봄을 기다리며 인내하는 풀의 모습입니다. 끈기와 인내심이 최대 무기이며, 고난 끝에 반드시 싹을 틔우게 됩니다.',
        en: 'Spring grass enduring on frozen land. A decade of great perseverance. Success comes through resilience against harsh social environments.',
      },
      병인: {
        ko: '봄 숲 위로 떠오르는 태양과 같습니다. 에너지가 넘치고 새로운 시작에 대한 축복이 따르는 매우 역동적인 시기입니다.',
        en: 'The sun rising over a spring forest. A dynamic decade of expansion and new beginnings. Your social status rises with radiant energy.',
      },
      정묘: {
        ko: '나무 정자 안을 비추는 따스한 등불의 모습입니다. 세심한 감각이 빛을 발하며, 주변 사람들과 조화를 이루며 실속을 챙기는 10년입니다.',
        en: 'A warm lamp inside a wooden pavilion. Your delicate talents and refined social skills shine. A period of steady progress and gaining honor.',
      },
      무진: {
        ko: '깊은 호수를 품은 거대한 산의 형상입니다. 포용력이 넓고 신뢰를 얻는 시기로, 재물 규모가 커지고 리더십을 발휘하게 됩니다.',
        en: 'A vast mountain holding a deep lake. You gain great trust and take on heavy responsibilities. A decade of financial growth and leadership.',
      },
      기사: {
        ko: '따스한 햇살을 받아 비옥해진 땅입니다. 그동안 노력해온 일들이 실질적인 성과로 연결되며 경제적 풍요를 누리는 황금기입니다.',
        en: 'Golden earth warmed by the sun. A time of abundance where past efforts turn into tangible results. Career and financial stability define this cycle.',
      },
      경오: {
        ko: '불길 속을 달리는 백마의 기상입니다. 강직한 의지로 어려운 과업을 성공시켜 명예를 얻게 되는 치열하고 영광스러운 구간입니다.',
        en: 'A white horse running through fire. A decade of intense discipline. Overcoming challenges will bring you immense authority and charisma.',
      },
      신미: {
        ko: '사막의 모래 속에서 보석을 제련하는 과정입니다. 환경이 고될 수 있으나, 이 시기를 거치면 독보적인 전문성을 갖춘 인재가 됩니다.',
        en: 'Refining jewelry in a hot desert. Though the environment feels pressuring, this process turns you into a highly valuable expert.',
      },
      임신: {
        ko: '바위 사이를 흐르는 깊은 강물처럼 지혜가 깊습니다. 환경 적응력이 뛰어나며 새로운 기술을 통해 활동 범위를 넓히는 역동적인 시기입니다.',
        en: 'Deep river water flowing over rocks. High adaptability and wisdom. You will use new knowledge to expand your reach nationally or globally.',
      },
      계유: {
        ko: '금빛 동굴에서 떨어지는 맑은 샘물처럼 통찰력이 날카로워집니다. 전문 분야에서 독보적인 성과를 거두며 삶의 순도가 높아집니다.',
        en: 'Clear water dripping from a golden cave. Your intuition becomes sharp. You achieve unique success by focusing on the professional essence.',
      },
      갑술: {
        ko: '해 질 녘 언덕 위의 외로운 나무처럼 독립심이 강해집니다. 자수성가하려는 기운이 크며 본인만의 확고한 가치관을 세우는 시기입니다.',
        en: 'A lone tree on a sunset hill. A period of strong independence. You will establish your own philosophy and build a foundation for the future.',
      },
      을해: {
        ko: '호수 위로 넓게 퍼져나가는 연꽃의 모습입니다. 주변의 도움과 자원이 자연스럽게 모여들며 명예와 실속을 동시에 챙깁니다.',
        en: 'Lotus spreading across a peaceful lake. Resources and supporters naturally flow toward you. Adaptability leads to great achievements.',
      },
      병자: {
        ko: '깊은 밤 호수 위로 비치는 밝은 햇살과 같습니다. 어둠을 밝히는 존재로 부각되어 본인의 명예와 이름이 널리 알려지는 화려한 운세입니다.',
        en: 'The sun rising over a deep night lake. Your name and honor will be recognized. You take the lead in organizations as a problem solver.',
      },
      정축: {
        ko: '어두운 설원 위를 밝히는 촛불의 형상입니다. 환경은 차갑지만 희망을 꺼뜨리지 않는 끈기로 보이지 않는 곳에서 실속을 챙깁니다.',
        en: 'A candle in a dark snowy field. Though the environment feels cold, your inner warmth and wisdom eventually move and inspire others.',
      },
      무인: {
        ko: '높은 산에서 포효하는 호랑이의 기세입니다. 리더십이 극대화되고 본인의 주장이 강력하게 관철되며 새로운 분야를 개척합니다.',
        en: 'A tiger roaring on a high mountain. Your leadership is at its peak. A great time to lead large-scale projects with power and authority.',
      },
      기묘: {
        ko: '비옥한 들판에 핀 꽃과 풀처럼 주변과 조화를 이룹니다. 재능을 사회적으로 발산하여 꾸준한 수익과 생활의 안정을 기하게 됩니다.',
        en: 'Flowers blooming in a fertile field. Your artistic and social activities flourish. Steady financial flow and happiness define this cycle.',
      },
      경진: {
        ko: '진흙 속에서 솟구치는 백룡의 기운입니다. 인생의 대전환점을 맞이하게 되며, 과감한 결단이 예상치 못한 큰 성공을 불러옵니다.',
        en: 'A white dragon rising from the marsh. A decade of profound transformation. A bold decision will completely change your life path.',
      },
      신사: {
        ko: '용광로 속에서 달궈지는 보석입니다. 사회적 규율 안에서 본인을 다듬어야 하며, 이 과정을 거쳐 최상위 계층의 자격을 갖추게 됩니다.',
        en: 'Jewelry refined in a furnace. You must follow strict rules within a system. This process carves you into a person of high social status.',
      },
      임오: {
        ko: '뜨거운 태양 아래 흐르는 강물처럼 감성과 이성이 교차합니다. 대인 관계가 활발해지고 예술적, 창의적 분야에서 큰 성과를 거둡니다.',
        en: 'Water meeting fire to create steam. Passion and logic are balanced. Your charm is at its peak, leading to dynamic social success.',
      },
      계미: {
        ko: '마른 숲에 내리는 단비와 같습니다. 막혔던 일들이 해결되고 문서운이나 윗사람의 덕을 보며 갈증이 해소되는 흐름입니다.',
        en: 'Gentle rain falling on parched land. Obstacles are cleared, and mentors appear. A supportive period where long-standing problems are solved.',
      },
      갑신: {
        ko: '바위 절벽 위 거목의 형상으로 강한 책임감과 압박이 따릅니다. 이 단련을 통해 비로소 조직의 리더나 큰 인물로 거듭나게 됩니다.',
        en: 'A giant tree on a rocky cliff against the wind. You face heavy responsibilities and social pressure, which molds you into a leader.',
      },
      을유: {
        ko: '칼날 위에 핀 꽃처럼 긴장감이 넘칩니다. 유연한 처세술과 정교한 감각을 발휘하여 경쟁을 뚫고 독보적인 위치를 점하게 됩니다.',
        en: 'A flower blooming on a sharp blade. High tension and competition. Your delicate intuition and refined skills lead to extraordinary success.',
      },
      병술: {
        ko: '마른 산 위로 지는 저녁 노을입니다. 화려했던 활동을 정리하고 내실을 기하며 안정적인 기반을 마련하는 수확의 시기입니다.',
        en: 'The sun setting over a vast dry plain. A time to wrap up activities and focus on internal harvest. Maturity leads to a stable foundation.',
      },
      정해: {
        ko: '밤바다를 비추는 등불처럼 고요한 지혜를 발휘합니다. 정신적 성장이 크며, 보이지 않는 곳에서 돕는 귀인의 조력이 따릅니다.',
        en: 'A lantern guiding ships on the night sea. You act as a mentor with wisdom. Spiritual growth and hidden supporters accompany your journey.',
      },
      무자: {
        ko: '샘물을 품은 거대한 산처럼 겉은 든든하고 속은 풍요롭습니다. 재물이 남모르게 쌓이는 운세로 경제적 안정을 이룰 수 있습니다.',
        en: 'A spring hidden beneath a giant mountain. Financial resources accumulate quietly but steadily. Perfect economic independence is achieved.',
      },
      기축: {
        ko: '얼어붙은 논밭처럼 잠시 활동을 멈추고 에너지를 비축해야 합니다. 내면의 수양에 힘쓰며 다음의 큰 운을 준비하는 시기입니다.',
        en: 'Frozen earth waiting for spring. Activities are limited. Focus on health and internal cultivation to prepare for the next big cycle.',
      },
      경인: {
        ko: '숲속의 백호처럼 용맹하고 결단력이 빠릅니다. 개척 정신으로 새로운 분야를 장악하며 거침없는 행동력으로 성취를 거둡니다.',
        en: 'A white tiger hunting in a forest. Your willpower becomes unbreakable. You pioneer new fields with bold and decisive actions.',
      },
      신묘: {
        ko: '나무를 조각하는 정교한 칼처럼 전문 기술이 극대화됩니다. 디테일에 집중하여 남들이 흉내 낼 수 없는 가치를 창출합니다.',
        en: 'A delicate chisel carving a masterpiece. Your specialized skills are highly valued. Focusing on details leads to unique professional success.',
      },
      임진: {
        ko: '바다를 누비는 흑룡의 기세로 스케일이 큰 일에 도전합니다. 활동 범위가 넓어지며 큰 변화의 파도를 타고 거부가 될 수 있는 운세입니다.',
        en: 'A black dragon riding waves in the ocean. Your scale of activity expands greatly. Great fluctuations bring the chance for massive wealth.',
      },
      계사: {
        ko: '안개가 걷히고 햇살이 비치는 마을처럼 목표가 명확해집니다. 지혜를 활용하여 재물을 모으며 생활의 질이 급격히 향상됩니다.',
        en: 'Fog lifting over a sunny village. Confusion clears, and life goals become vivid. Wisdom leads to a significant rise in living standards.',
      },
      갑오: {
        ko: '여름철 그늘을 내어주는 거목처럼 영향력이 확대됩니다. 교육, 문화 사업에서 두각을 나타내며 주변을 이끄는 리더의 시기입니다.',
        en: 'A giant tree providing shade in summer. Your influence expands as you help others. Fame comes through education or cultural activities.',
      },
      을미: {
        ko: '마른 언덕에 핀 풀처럼 끈질긴 생명력으로 성공합니다. 척박한 환경을 이겨내며 후반부로 갈수록 재산이 안정적으로 축적됩니다.',
        en: 'Grass blooming on a dry hill. You survive and thrive in harsh conditions. Patience leads to the steady accumulation of wealth.',
      },
      병신: {
        ko: '금속에 반사되는 햇살처럼 화려하게 주목받습니다. 대중적인 인기나 사회적 평판이 상승하며 역동적으로 부와 명예를 거머쥡니다.',
        en: 'The sun reflecting off polished metal. Your personality attracts the public eye. Dynamic activities lead to both wealth and social fame.',
      },
      정유: {
        ko: '별빛 아래 금빛 봉황처럼 고귀한 활동이 따릅니다. 전문 분야에서 장인 정신을 발휘하여 명성을 얻고 고귀한 조력자를 만납니다.',
        en: 'A golden phoenix under starlight. Honorable activities bring respect. You reach the level of a master in your professional field.',
      },
      무술: {
        ko: '황혼 녘의 광활한 사막처럼 신념이 확고해집니다. 무게감이 있어 주변에서 함부로 대하지 못하며 정신적 지주 역할을 수행합니다.',
        en: 'A vast desert at dusk. Your convictions become unshakable. You may manage large assets or act as a spiritual anchor for others.',
      },
      기해: {
        ko: '물이 흐르는 비옥한 땅처럼 재물이 마르지 않습니다. 사람들과 어울리며 자연스럽게 이익을 취하고 의식주가 풍족해지는 흐름입니다.',
        en: 'Fertile earth over flowing water. Wealth flows into your life constantly. Social interactions bring profits and a comfortable lifestyle.',
      },
      경자: {
        ko: '깊은 우물 속에서 빛나는 칼날처럼 냉철한 분석력이 돋보입니다. 시시비비를 가리는 연구나 기술 분야에서 압도적 전문성을 보입니다.',
        en: 'A sharp blade shining in a deep well. Your analytical thinking is at its peak. You excel in research, law, or high-tech professional fields.',
      },
      신축: {
        ko: '진흙 속의 보석처럼 인내가 필요합니다. 조용히 내실을 다지다 보면 후반기에 당신의 가치를 알아봐 줄 귀인을 만나게 됩니다.',
        en: 'Jewelry hidden in cold mud. Your value might not be recognized immediately, but internal cultivation will lead to a dramatic turning point.',
      },
      임인: {
        ko: '봄 숲을 적시는 강물처럼 창의적인 아이디어가 샘솟습니다. 기획이나 교육 업종에서 큰 보람을 얻으며 새로운 활로가 열립니다.',
        en: 'A river feeding a spring forest. Creative ideas and new life sprout everywhere. A hopeful decade where new career paths are opened.',
      },
      계묘: {
        ko: '꽃 위의 아침 이슬처럼 섬세하고 다정합니다. 예술적 감수성이 높아지고 부드러운 카리스마로 사람들의 마음을 움직여 성공합니다.',
        en: "Morning dew on fresh flowers. Your sensitivity and popularity rise. Your gentle charisma moves people's hearts to achieve your goals.",
      },
      갑진: {
        ko: '기름진 땅 위의 거목처럼 기반이 든든해집니다. 활동 영역이 넓어지고 사업이나 프로젝트가 성공 궤도에 오르는 대운의 시기입니다.',
        en: 'A giant tree on fertile land. Your economic foundation becomes rock-solid. A once-in-a-lifetime opportunity to expand your business.',
      },
      을사: {
        ko: '열기 속의 풀처럼 본인을 화려하게 드러냅니다. 화술이 좋아지고 사교 모임의 중심이 되며 직업적인 대성공이 따르는 구간입니다.',
        en: 'Grass shimmering in the summer heat. Your social expression is at its maximum. Fame and success come through networking and showmanship.',
      },
      병오: {
        ko: '한낮의 태양처럼 기세가 하늘을 찌릅니다. 폭발적인 에너지로 단기간에 큰 성취를 이루지만 겸손해야 그 복을 온전히 지킵니다.',
        en: 'The blazing sun at noon. Explosive energy drives you toward rapid achievements. Success depends on balancing power with humility.',
      },
      정미: {
        ko: '마른 땅을 데우는 열기처럼 내면의 열정이 뜨겁습니다. 장인 정신으로 한 우물을 파면 독보적인 전문가로 인정받는 운세입니다.',
        en: 'Warm heat warming the dry earth. Quiet but intense passion drives you. Your craftsmanship leads you to become a top authority.',
      },
      무신: {
        ko: '보석을 품은 거대한 산처럼 잠재력이 터져 나옵니다. 활동량이 늘어나며 부지런히 움직일수록 숨겨진 재물과 성과를 계속 발굴합니다.',
        en: 'A huge mountain containing minerals. Hidden potentials are triggered. The more active you are, the more wealth you will discover.',
      },
      기유: {
        ko: '황금 들판의 추수처럼 노력이 결실로 돌아옵니다. 재물운이 안정적이며 생활의 질이 한 차원 높아지는 풍요로운 10년입니다.',
        en: 'A golden field ready for harvest. Past hard work turns into tangible wealth. A decade of stability and enjoying the fruits of labor.',
      },
      경술: {
        ko: '마른 언덕 위의 백호처럼 권위가 생깁니다. 강한 신념으로 조직을 개혁하거나 이끌며 본인의 의지를 세상에 관철하는 시기입니다.',
        en: 'A white tiger guarding a dry hill. You exercise strong authority. You lead reforms in organizations with powerful charisma.',
      },
      신해: {
        ko: '맑은 물에 씻긴 보석처럼 가치가 깨끗하게 드러납니다. 지혜로운 판단력으로 명성을 얻으며 사람들의 부러움을 사는 우아한 삶을 삽니다.',
        en: 'Jewelry washed in clear water. Your value is clearly revealed. A decade of grace and elegance with unexpected lucky events.',
      },
      임자: {
        ko: '캄캄한 밤의 광활한 바다처럼 깊은 지혜를 품습니다. 포용력이 넓어지고 모든 것을 수용하며 큰 조직이나 학문적 대업을 이룹니다.',
        en: 'The vast ocean in the dark night. Your wisdom and capacity become immense. You may lead large organizations or achieve great academic success.',
      },
      계축: {
        ko: '얼어붙은 땅에 내리는 비처럼 고독하지만 성숙해집니다. 정신적 깊이가 깊어지며 남들이 모르는 비장의 무기를 준비하게 됩니다.',
        en: 'Rain falling on frozen earth. A period of solitude but great internal maturity. You gain insights that others miss for a future breakthrough.',
      },
      갑인: {
        ko: '봄날의 울창한 거목 숲처럼 독립심이 강합니다. 추진력이 거침없어 본인의 사업을 일으키거나 리더로서 독보적 존재감을 드러냅니다.',
        en: 'A forest of giant trees in spring. Strong independence drives you. You pioneer your own field and take full control of your path.',
      },
      을묘: {
        ko: '푸른 초원처럼 유연하면서도 끈질긴 생명력을 보입니다. 대인 관계가 원만하고 실속을 차리는 영리함으로 영역을 확장합니다.',
        en: 'Lush green fields in mid-spring. You expand your territory with flexibility and vitality. Success comes through persistent networking.',
      },
      병진: {
        ko: '습지 위로 비치는 햇살처럼 희망을 줍니다. 창의적인 아이디어가 현실적인 결과로 이어지며 주변을 번영하게 만드는 복덩이 운세입니다.',
        en: 'Sunlight over a spring marsh. You bring vitality and hope to others. Creative planning leads to the prosperity of your community.',
      },
      정사: {
        ko: '용광로 속 등불처럼 뜨거운 집념으로 결과를 냅니다. 사회적 성취욕이 강해지며 목표를 정하면 끝내 쟁취하는 강렬한 운의 흐름입니다.',
        en: 'A lamp burning in the furnace. You burn with ambition to achieve results. A decade of intense social success and striking honor.',
      },
      무오: {
        ko: '화산을 품은 산처럼 내면에 폭발적 기운을 가졌습니다. 인내심이 대단하며 결정적인 순간에 천하를 흔들 정도의 파괴력을 보여줍니다.',
        en: 'A high mountain with a volcano inside. Steady on the outside but filled with explosive desire. Patience leads to powerful governance.',
      },
      기미: {
        ko: '사막의 뜨거운 모래처럼 고집과 자립심이 강합니다. 어떤 역경도 스스로 극복하며 한 분야의 장인이 되어 안정적인 부를 쌓습니다.',
        en: 'Hot sand in the desert. Unbreakable self-reliance help you overcome adversity. You will build stable wealth as a specialized master.',
      },
      경신: {
        ko: '바위에 가는 칼날처럼 승부욕이 최고조에 달합니다. 결단력 있는 행동으로 강한 전문직 분야에서 최고의 자리에 오르게 됩니다.',
        en: 'A sharp sword being sharpened on a rock. Your fighting spirit is at its peak. You excel in high-stakes professional fields.',
      },
      신유: {
        ko: '순도 높은 황금과 보석처럼 본인만의 세계를 지킵니다. 고귀하고 품격 있는 활동을 이어가며 완벽주의적 성과로 가치를 증명합니다.',
        en: 'Pure gold and sharp jewelry. Your internal world is perfectly established. You maintain high standards and live a life of dignity.',
      },
      임술: {
        ko: '계곡에 갇힌 깊은 물처럼 인내하며 기회를 기다립니다. 정신적 공부를 통해 내실을 다지면 훗날 바다로 나가는 거대한 운을 맞습니다.',
        en: 'Deep water trapped in a dry valley. A time for patience and insight. Internal cultivation will lead to a massive breakthrough later.',
      },
      계해: {
        ko: '끝없이 흐르는 바다처럼 포용력이 넓고 지혜롭습니다. 해외 운이나 유통 분야에서 성공하며 모든 경험을 자산으로 만드는 시기입니다.',
        en: 'The endless flow of the ocean. You embrace all changes with wisdom. Success comes through global networking or cultural exchange.',
      },
    };

    const shipSungMap = {
      비견: isEn ? 'Independence' : '독립심과 주체성',
      겁재: isEn ? 'Competition' : '경쟁과 사회적 변동',
      식신: isEn ? 'Creativity' : '창의력과 풍요',
      상관: isEn ? 'Innovation' : '혁신과 표현',
      편재: isEn ? 'Adventure' : '역동적 재물과 모험',
      정재: isEn ? 'Stability' : '성실과 안정',
      편관: isEn ? 'Discipline' : '책임감과 권위',
      정관: isEn ? 'Honor' : '명예와 질서',
      편인: isEn ? 'Insight' : '직관과 통찰',
      정인: isEn ? 'Support' : '조력과 수용',
    };

    const currentNuance = pillarDetails[name]
      ? isEn
        ? pillarDetails[name].en
        : pillarDetails[name].ko
      : isEn
        ? 'Significant transition.'
        : '중요한 변화의 시기입니다.';

    const clashKey = `${gan}_${zhi}`;
    const isClash = !(
      {
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
      }[clashKey] || gan === zhi
    );

    const introText = isEn
      ? `<b>Luck Cycle: ${isEn ? '' : name} (Age ${startAge} - ${endAge})</b>`
      : `<b>${name} 대운 (약 ${startAge}세 ~ ${endAge}세)</b>`;

    const flowText = isEn
      ? `Starting from age ${startAge}, here is the flow of this 10-year cycle.`
      : `${startAge}세부터 시작되는 이 10년의 흐름에 대해 설명해 드립니다.`;

    const shipSungText = isEn
      ? `The energy of <b>${shipSung}</b> is the primary driver, focusing on <b>${shipSungMap[shipSung] || shipSung}</b>.`
      : `당신의 운명에서 이 구간은 <b>${shipSung}</b>의 작용력이 가장 크게 나타납니다. 이는 <b>${shipSungMap[shipSung] || shipSung}</b>의 흐름이 주도하게 됨을 의미합니다.`;

    const environmentText = isEn
      ? `The interaction between ${ohaengMap[gan] || gan} and ${ohaengMap[zhi] || zhi} creates a <b>${isClash ? 'dynamic and innovative' : 'steady and supportive'}</b> environment.`
      : `천간의 ${ohaengMap[gan] || gan} 기운과 지지의 ${ohaengMap[zhi] || zhi} 기운이 만나는 이 환경은, <b>${isClash ? '역동적인 변화와 혁신을' : '안정적인 성장과 기반을'}</b> 만들어내는 소중한 바탕이 됩니다.`;

    const footerText = isEn
      ? 'This interpretation is based on the analysis of the Luck Pillar in traditional Saju.'
      : '이 분석은 전통 명리학의 대운 흐름 분석 원리를 바탕으로 구성되었습니다.';

    return `
    <div style="line-height: 1.8; color: inherit; text-align: left; font-size: 15px; font-family: sans-serif;">
      <p style="margin-bottom: 12px; font-size: 16px;">${introText}</p>
      <p style="margin-bottom: 16px;">${flowText}</p>
      <p style="margin-bottom: 20px; font-weight: 500;">${currentNuance}</p>
      <p style="margin-bottom: 16px;">${shipSungText}</p>
      <p style="margin-bottom: 16px;">${environmentText}</p>
      <p style="margin-bottom: 8px; opacity: 0.8; font-size: 14px; border-top: 1px solid #eee; padding-top: 10px;">
        ${footerText}
      </p>
    </div>
  `;
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
  // 기본값은 현재 대운(dae.isCurrent)으로 설정
  const [selectedDae, setSelectedDae] = useState(null);

  // 데이터가 로드될 때 현재 대운을 기본 선택값으로 세팅
  useEffect(() => {
    const current = daewoonList.find((d) => d.isCurrent);
    if (current) setSelectedDae(current);
  }, [daewoonList]);

  // 클릭 핸들러
  const handleDaeClick = (dae) => {
    setSelectedDae(dae);
  };
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
      <div className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-300 dark:border-slate-700 transition-colors">
        <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
          {Object.entries(ohaengCount).map(([type, count]) => (
            <div
              key={type}
              style={{ width: `${(count / (isTimeUnknown ? 6 : 8)) * 100}%` }}
              className={getBarColor(type)}
            />
          ))}
        </div>

        {/* sronly처리할 것 */}
        <div className=" flex absolute justify-center w-full py-4" style={{ visibility: 'hidden' }}>
          <div
            id="share-card"
            style={{
              width: '350px',
              padding: '25px 20px',
              textAlign: 'center',
              borderRadius: '16px',
              border: '2px solid #6366f1',
              backgroundColor: '#edf0ff',
              boxSizing: 'border-box',
              position: 'relative', // 위치 고정
            }}
          >
            {/* 상단 라인 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <div style={{ height: '1px', width: '24px', backgroundColor: '#818cf8' }}></div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '0.3em',
                  color: '#6366f1',
                }}
              >
                WHO AM I?
              </span>
              <div style={{ height: '1px', width: '24px', backgroundColor: '#818cf8' }}></div>
            </div>

            {/* 이미지: 이 방식이 안 짤리고 제일 잘 나옵니다 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <img
                src={iljuImagePath}
                alt="signature"
                crossOrigin="anonymous"
                style={{ width: '160px', height: 'auto', display: 'block' }}
              />
            </div>

            <div
              style={{
                color: '#6366f1',
                fontSize: '10px',
                fontWeight: '900',
                letterSpacing: '0.2em',
                marginBottom: '12px',
              }}
            >
              SIGNATURE
            </div>

            {/* 텍스트 영역 */}
            <div
              style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}
            >
              {language === 'ko'
                ? ILJU_DATA?.[saju.sky1 + saju.grd1]?.title[inputGender]?.title
                : ILJU_DATA_EN?.[saju.sky1 + saju.grd1]?.title[inputGender]?.title}
            </div>

            <div
              style={{
                fontSize: '13px',
                color: '#374151',
                fontWeight: '500',
                lineHeight: '1.6',
                padding: '0 4px',
                wordBreak: 'keep-all',
              }}
            >
              {language === 'ko'
                ? ILJU_DATA?.[saju.sky1 + saju.grd1]?.title[inputGender]?.desc
                : ILJU_DATA_EN?.[saju.sky1 + saju.grd1]?.title[inputGender]?.desc}
            </div>
          </div>
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
              ⚡{' '}
              {language === 'en'
                ? 'Energy Chemistry (Harmony & Clash)'
                : '에너지의 화학 반응 (합/충)'}
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
                        {rel[language].name}
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
                    {rel[language].type}
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
              <span>{language === 'en' ? '🌊 Flow of Daewoon' : '🌊 대운의 흐름'}</span>
              <span className="text-xs font-normal bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                {language === 'en' ? `Age ${currentAge}` : `현재 ${currentAge}세`}
              </span>
            </h3>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto transition-colors">
              <div className="flex gap-2 min-w-max pb-2">
                {daewoonList
                  // 1. name이 존재하고(undefined 방지), 글자 수가 2자인 정상 데이터만 필터링
                  .filter((dae) => dae.name && dae.name.length >= 2)
                  .map((dae, idx) => {
                    const isSelected = selectedDae
                      ? selectedDae.startAge === dae.startAge
                      : dae.isCurrent;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleDaeClick(dae)}
                        className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg border cursor-pointer transition-all
            ${
              isSelected
                ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white shadow-md transform scale-105'
                : 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-indigo-300'
            }`}
                      >
                        {/* 나이 표시 */}
                        <span className="text-xs mb-1 opacity-80">
                          {language === 'en' ? `Age ${dae.startAge}` : `${dae.startAge}세`}
                        </span>

                        {/* 이름 표시 (안전한 렌더링) */}
                        <span className="font-bold text-lg">
                          {language === 'en'
                            ? ENG_MAP[dae.name[0]] && ENG_MAP[dae.name[1]]
                              ? `${ENG_MAP[dae.name[0]]} ${ENG_MAP[dae.name[1]]}`
                              : dae.name // 영어 맵에 없으면 한글이라도 표시
                            : dae.name}
                        </span>

                        {dae.isCurrent && (
                          <span
                            className={`text-[10px] mt-1 px-1 rounded ${isSelected ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'}`}
                          >
                            {language === 'en' ? 'NOW' : '현재'}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 상세 분석 카드 (선택된 selectedDae 기준으로 렌더링) */}
            {selectedDae && (
              <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-100 dark:border-indigo-900/50 transition-colors animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                    {selectedDae.name[0]}
                  </div>
                  <div>
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">
                      {selectedDae.isCurrent
                        ? language === 'en'
                          ? 'Current Season'
                          : '현재 대운'
                        : language === 'en'
                          ? 'Selected Season'
                          : '선택된 대운'}
                    </p>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {language === 'en' ? (
                        <>
                          {ENG_MAP[selectedDae.name[0]]} {ENG_MAP[selectedDae.name[1]]}
                        </>
                      ) : (
                        <>{selectedDae.name}</>
                      )}{' '}
                      {language === 'en' ? 'Period' : '대운'} ({selectedDae.startAge} ~{' '}
                      {selectedDae.endAge || '...'} {language === 'en' ? 'Age' : '세'})
                    </h4>
                  </div>
                </div>
                <div
                  className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm text-justify"
                  dangerouslySetInnerHTML={{
                    __html: getDaewoonStory(selectedDae, currentAge, language),
                  }} // 함수 호출 시 선택된 대운 전달
                />
              </div>
            )}
          </div>
        )}
      </div>
      <button
        onClick={() => handleShare('share-card')}
        className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
      >
        {language === 'en' ? 'Share My Signature' : '나의 결과 저장하기'}
      </button>
    </div>
  );
};

export default BasicAna;
