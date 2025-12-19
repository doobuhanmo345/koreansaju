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
    if (!selectedDae || !selectedDae.name) return '';

    const gan = selectedDae.ganOhaeng;
    const zhi = selectedDae.zhiOhaeng;
    const combo = `${gan}_${zhi}`;

    // 1. 오행별 상극 상황 세분화 (부제와 내용의 일치)
    const getClashDetail = () => {
      const clashMap = {
        water_fire: {
          subtitle: isEn ? 'Conflict of Wisdom and Passion' : '지혜와 열정의 충돌',
          content: isEn
            ? "The heaven's water (Wisdom) meets the earth's fire (Ambition). You may feel a gap between your cool analytical thoughts and your burning social desires. This decade is about finding the 'Steam'—the energy created when fire and water balance each other to drive powerful transformation."
            : '하늘의 물(지혜)과 땅의 불(열정)이 만났습니다. 머리는 차갑게 이성을 말하지만 가슴은 뜨겁게 사회적 발현을 갈망하는 시기입니다. 이 상충하는 두 기운을 조화시킨다면, 물이 끓어 증기가 되듯 폭발적인 추진력을 얻게 될 것입니다.',
        },
        fire_metal: {
          subtitle: isEn ? 'Refining the Inner Value' : '내실을 다지는 제련의 시간',
          content: isEn
            ? 'The fire of expansion meets the metal of results. Your raw talents are being tested in a furnace of high social pressure. It is a period of intense discipline, eventually turning you into a highly valuable expert in your field.'
            : '확산하려는 불과 결실을 보려는 금이 만났습니다. 본인의 거친 재능이 사회적 압박이라는 용광로 속에서 단련되는 과정입니다. 다소 고될 수 있으나, 이 과정을 거치면 누구도 대체할 수 없는 순도 높은 전문성을 갖추게 됩니다.',
        },
        metal_wood: {
          subtitle: isEn ? 'Decisive Transformation' : '결단과 새로운 질서',
          content: isEn
            ? 'The sharp metal trims the growing wood. You are forced to cut away unnecessary branches and focus your life energy on one single direction. A painful but necessary restructuring of your life path is expected.'
            : '예리한 금의 기운이 자라나는 나무를 다듬습니다. 방만했던 활동을 정리하고 하나의 목표에 집중해야 하는 시기입니다. 불필요한 인연이나 습관을 잘라내는 결단이 필요하며, 이를 통해 인생의 새로운 질서가 잡힙니다.',
        },
        // ... 필요시 다른 상극 조합 추가
      };

      // 기본값 (상극이지만 구체적 정의가 없을 때)
      const defaultClash = {
        subtitle: isEn ? 'Dynamic Evolution' : '역동적인 변화와 진화',
        content: isEn
          ? "Two different energies collide to spark change. It's a decade of adaptation where your growth is accelerated by the friction between your ideals and your environment."
          : '서로 다른 두 기운이 부딪히며 변화의 불꽃을 일으킵니다. 이상과 현실 사이의 마찰이 오히려 당신을 성장시키는 자극제가 되며, 적응력을 키워 더 큰 세상으로 나아가는 발판이 됩니다.',
      };

      return clashMap[combo] || clashMap[`${zhi}_${gan}`] || defaultClash;
    };

    // 2. 상생/비슷한 기운에 대한 정의
    const getHarmoniousDetail = () => {
      if (gan === zhi)
        return {
          subtitle: isEn ? 'Peak Concentration' : '집중된 에너지의 정점',
          content: isEn
            ? 'Your will and environment are perfectly aligned. Push forward with absolute confidence.'
            : '내면의 의지와 환경이 일치합니다. 타협 없는 추진력으로 본인의 영역을 확실히 구축하십시오.',
        };
      return {
        subtitle: isEn ? 'Natural Progression' : '순조로운 흐름과 지원',
        content: isEn
          ? 'Resources flow to you naturally. Use this supportive cycle to expand your foundation.'
          : '주변의 도움과 자원이 자연스럽게 흐릅니다. 이 순풍을 이용해 당신의 기반을 넓히고 내실을 기하세요.',
      };
    };

    // 3. 최종 스토리 조립 (중복 제목 제거)
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
      }[combo] || gan === zhi
    );
    const detail = isClash ? getClashDetail() : getHarmoniousDetail();

    let story = `<div class="py-2 space-y-5 text-slate-700 dark:text-slate-300">`;

    // [본문 서술형 구성]
    story += `
    <div class="space-y-3 leading-relaxed">
      <div class="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full mb-1">
        ${detail.subtitle}
      </div>
      
      <p class="text-[15px]">
        ${
          isEn
            ? `Starting from age <b>${selectedDae.startAge}</b>, your life enters a period of profound transition. `
            : `<b>${selectedDae.startAge}세</b>부터 시작된 이 시기는 당신의 인생에서 매우 독특한 에너지의 조화를 경험하는 구간입니다.`
        }
      </p>

      <p class="text-[15px] text-justify">
        ${detail.content}
      </p>

      <p class="text-sm opacity-80 pt-2 border-t border-slate-100 dark:border-slate-800">
        ${
          isEn
            ? `This environment, where the energy of <b>${gan}</b> (Heaven) and <b>${zhi}</b> (Earth) interact, will be the backdrop of your journey for the next 10 years.`
            : `천간의 <b>${ohaengKorean[gan]}</b> 기운과 지지의 <b>${ohaengKorean[zhi]}</b> 기운이 만나 형성된 이 환경은 앞으로 당신이 나아갈 길의 소중한 밑거름이 될 것입니다.`
        }
        }
      </p>
    </div>
  </div>`;

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
