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
      };
    } catch (err) {
      console.error('사주 계산 전체 오류:', err);
      return null;
    }
  }, [saju, inputGender]);
  console.log(sajuData);
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
  const getDaewoonStory = (selectedDae, language, pillars) => {
    const isEn = language === 'en';

    // 데이터 방어 로직
    if (!selectedDae || !pillars || !pillars.day) {
      return isEn ? 'Loading luck cycle data...' : '대운 정보를 불러오는 중입니다...';
    }

    // 1. [데이터 추출] pillars.day(예: "갑진")에서 일간 "갑" 추출
    const userGan = pillars.day.charAt(0); // 첫 글자인 일간 추출
    const name = selectedDae.name || selectedDae.pillar || '';
    const startAge = selectedDae.startAge || selectedDae.age || 0;
    const endAge = selectedDae.endAge || Number(startAge) + 9;
    const dGanKor = selectedDae.ganKor || (name ? name.charAt(0) : ''); // 대운 천간
    const ganO = selectedDae.ganOhaeng || '';
    const zhiO = selectedDae.zhiOhaeng || '';

    // 2. [십성 실시간 계산 테이블] 일간(userGan) vs 대운 천간(dGanKor)
    const shipSungTable = {
      갑: {
        갑: '비견',
        을: '겁재',
        병: '식신',
        정: '상관',
        무: '편재',
        기: '정재',
        경: '편관',
        신: '정관',
        임: '편인',
        계: '정인',
      },
      을: {
        을: '비견',
        갑: '겁재',
        정: '식신',
        병: '상관',
        기: '편재',
        무: '정재',
        신: '편관',
        경: '정관',
        계: '편인',
        임: '정인',
      },
      병: {
        병: '비견',
        정: '겁재',
        무: '식신',
        기: '상관',
        경: '편재',
        신: '정재',
        임: '편관',
        계: '정관',
        갑: '편인',
        을: '정인',
      },
      정: {
        정: '비견',
        병: '겁재',
        기: '식신',
        무: '상관',
        신: '편재',
        경: '정재',
        계: '편관',
        임: '정관',
        을: '편인',
        갑: '정인',
      },
      무: {
        무: '비견',
        기: '겁재',
        경: '식신',
        신: '상관',
        임: '편재',
        계: '정재',
        갑: '편관',
        을: '정관',
        병: '편인',
        정: '정인',
      },
      기: {
        기: '비견',
        무: '겁재',
        신: '식신',
        경: '상관',
        계: '편재',
        임: '정재',
        을: '편관',
        갑: '정관',
        정: '편인',
        병: '정인',
      },
      경: {
        경: '비견',
        신: '겁재',
        임: '식신',
        계: '상관',
        갑: '편재',
        을: '정재',
        병: '편관',
        정: '정관',
        무: '편인',
        기: '정인',
      },
      신: {
        신: '비견',
        경: '겁재',
        계: '식신',
        임: '상관',
        을: '편재',
        갑: '정재',
        정: '편관',
        병: '정관',
        기: '편인',
        무: '정인',
      },
      임: {
        임: '비견',
        계: '겁재',
        갑: '식신',
        을: '상관',
        병: '편재',
        정: '정재',
        무: '편관',
        기: '정관',
        경: '편인',
        신: '정인',
      },
      계: {
        계: '비견',
        임: '겁재',
        을: '식신',
        갑: '상관',
        정: '편재',
        병: '정재',
        기: '편관',
        무: '정관',
        신: '편인',
        경: '정인',
      },
    };

    const calculatedShipSung = shipSungTable[userGan]?.[dGanKor] || '대운';

    const shipSungMap = {
      비견: { ko: '주체성과 자립', en: 'Independence' },
      겁재: { ko: '경쟁과 사회적 변동', en: 'Competition' },
      식신: { ko: '창의력과 풍요', en: 'Creativity' },
      상관: { ko: '혁신과 도전', en: 'Innovation' },
      편재: { ko: '재물 확장과 모험', en: 'Wealth Expansion' },
      정재: { ko: '안정적 결실과 성실', en: 'Stability' },
      편관: { ko: '책임감과 권위', en: 'Discipline' },
      정관: { ko: '명예와 사회적 인정', en: 'Honor' },
      편인: { ko: '특수 기술과 통찰', en: 'Intuition' },
      정인: { ko: '지원과 학문적 성취', en: 'Support' },
    };

    const ohaengMap = {
      wood: isEn ? 'Wood' : '나무(木)',
      fire: isEn ? 'Fire' : '불(火)',
      earth: isEn ? 'Earth' : '흙(土)',
      metal: isEn ? 'Metal' : '금(金)',
      water: isEn ? 'Water' : '물(水)',
    };

    // 3. 60갑자 전체 데이터 (생략 없이 수록)
    const pillarDetails = {
      갑자: {
        ko: '차가운 물을 머금고 겨울을 견디는 나무입니다. 성장은 더디나 지혜가 깊어지는 10년입니다.',
        en: 'A tree in winter water. Internal growth is prioritized over visible results.',
      },
      을축: {
        ko: '얼어붙은 땅에서 인내하는 풀의 모습입니다. 끈기와 인내로 척박한 환경을 이겨내고 성공합니다.',
        en: 'Grass on frozen earth. Perseverance leads to breaking through social obstacles.',
      },
      병인: {
        ko: '봄 숲 위로 떠오르는 태양입니다. 역동적인 시작과 확장의 기운이 넘치는 매우 화려한 시기입니다.',
        en: 'Sun rising over a forest. A dynamic decade of expansion and new beginnings.',
      },
      정묘: {
        ko: '나무 정자 안을 비추는 따스한 등불입니다. 세심한 감각으로 실속을 챙기며 명예를 쌓는 10년입니다.',
        en: 'A warm lamp in a pavilion. Delicate talents lead to steady progress and honor.',
      },
      무진: {
        ko: '호수를 품은 산의 형상입니다. 포용력이 넓어지고 사회적 신뢰를 바탕으로 큰 책임을 맡게 됩니다.',
        en: 'A mountain holding a lake. You gain great trust and take on heavy responsibilities.',
      },
      기사: {
        ko: '햇살 받은 비옥한 땅입니다. 노력해온 일들이 성과로 이어지며 경제적 풍요를 누리는 시기입니다.',
        en: 'Golden earth warmed by sun. Past efforts turn into tangible financial results.',
      },
      경오: {
        ko: '불길 속을 달리는 백마의 기상입니다. 강직한 의지로 어려운 과업을 성공시켜 권위를 얻게 됩니다.',
        en: 'A horse running through fire. Overcoming challenges brings you immense authority.',
      },
      신미: {
        ko: '사막 속 보석을 제련하는 과정입니다. 고된 환경을 거쳐 독보적인 전문성을 갖춘 인재가 됩니다.',
        en: 'Refining jewelry in a desert. This process turns you into a highly valuable expert.',
      },
      임신: {
        ko: '바위 사이 흐르는 강물처럼 지혜가 깊습니다. 환경 적응력이 뛰어나며 활동 범위를 넓히는 시기입니다.',
        en: 'Deep river over rocks. You will use new knowledge to expand your reach globally.',
      },
      계유: {
        ko: '맑은 샘물처럼 통찰력이 날카로워집니다. 전문 분야에서 독보적 성과를 거두며 삶의 질이 높아집니다.',
        en: 'Clear water from a cave. Your intuition becomes sharp, leading to professional success.',
      },
      갑술: {
        ko: '언덕 위 홀로 선 거목입니다. 독립심이 강해지며 본인만의 확고한 가치관을 세우는 시기입니다.',
        en: 'A lone tree on a hill. You will establish your own philosophy and foundation.',
      },
      을해: {
        ko: '호수 위 연꽃의 모습입니다. 주변의 도움과 자원이 모여들며 명예와 실속을 동시에 챙깁니다.',
        en: 'Lotus on a peaceful lake. Resources and supporters naturally flow toward you.',
      },
      병자: {
        ko: '밤 호수 위 비치는 햇살입니다. 어둠을 밝히는 해결사로 부각되어 명예와 이름이 널리 알려집니다.',
        en: 'Sun rising over a night lake. Your name and honor will be widely recognized.',
      },
      정축: {
        ko: '설원 위 촛불의 형상입니다. 환경은 차갑지만 지혜와 끈기로 보이지 않는 곳에서 실속을 챙깁니다.',
        en: 'A candle in snowy field. Inner warmth and wisdom move and inspire others.',
      },
      무인: {
        ko: '산속 호랑이의 기세입니다. 리더십이 극대화되고 본인의 주장이 관철되며 새로운 분야를 개척합니다.',
        en: 'A tiger on a mountain. Your leadership is at its peak to lead large projects.',
      },
      기묘: {
        ko: '비옥한 들판에 핀 꽃처럼 조화롭습니다. 재능을 발산하여 꾸준한 수익과 생활의 안정을 기하게 됩니다.',
        en: 'Flowers in a fertile field. Artistic activities flourish with steady income.',
      },
      경진: {
        ko: '진흙 속 솟구치는 백룡의 기운입니다. 대전환점을 맞이하게 되며 과감한 결단이 큰 성공을 부릅니다.',
        en: 'A dragon rising from marsh. A bold decision will completely change your life path.',
      },
      신사: {
        ko: '용광로 속 보석입니다. 규율 안에서 본인을 다듬어야 하며 최상위 계층의 자격을 갖추게 됩니다.',
        en: 'Jewelry refined in a furnace. Following rules will carve you into high social status.',
      },
      임오: {
        ko: '태양 아래 흐르는 강물입니다. 감성과 이성이 교차하며 예술적, 창의적 분야에서 큰 성과를 거둡니다.',
        en: 'Water meeting fire. Passion and charm lead to dynamic social success.',
      },
      계미: {
        ko: '마른 숲에 내리는 단비입니다. 막혔던 일들이 해결되고 귀인의 덕을 보며 갈증이 해소되는 흐름입니다.',
        en: 'Rain on parched land. Obstacles are cleared and mentors appear to help.',
      },
      갑신: {
        ko: '바위산 위 거목의 형상으로 강한 책임감이 따릅니다. 단련을 통해 리더나 큰 인물로 거듭나게 됩니다.',
        en: 'Tree on a rocky cliff. Social pressure molds you into a powerful leader.',
      },
      을유: {
        ko: '칼날 위 핀 꽃처럼 긴장감이 넘칩니다. 유연한 처세술로 경쟁을 뚫고 독보적인 위치를 점하게 됩니다.',
        en: 'Flower on a sharp blade. Your delicate intuition leads to extraordinary success.',
      },
      병술: {
        ko: '지는 저녁 노을입니다. 화려했던 활동을 정리하고 내실을 기하며 안정적 기반을 마련하는 시기입니다.',
        en: 'Sunset over a plain. Mature experience leads to a stable foundation.',
      },
      정해: {
        ko: '밤바다를 비추는 등불입니다. 정신적 성장이 크며 보이지 않는 곳에서 돕는 귀인의 조력이 따릅니다.',
        en: 'Lamp on the night sea. You act as a mentor with deep wisdom and support.',
      },
      무자: {
        ko: '샘물 품은 산처럼 풍요롭습니다. 재물이 남모르게 쌓이는 운세로 경제적 안정을 이룰 수 있습니다.',
        en: 'Spring hidden in a mountain. Financial resources accumulate quietly but steadily.',
      },
      기축: {
        ko: '얼어붙은 논밭처럼 에너지를 비축해야 합니다. 내면 수양에 힘쓰며 다음의 큰 운을 준비하십시오.',
        en: 'Frozen earth waiting for spring. Focus on cultivation to prepare for the next cycle.',
      },
      경인: {
        ko: '숲속 백호처럼 용맹하고 결단력이 빠릅니다. 개척 정신으로 새로운 분야를 장악하는 시기입니다.',
        en: 'Tiger hunting in a forest. You pioneer new fields with bold actions.',
      },
      신묘: {
        ko: '나무 조각하는 정교한 칼입니다. 기술이 극대화되어 남들이 흉내 낼 수 없는 가치를 창출합니다.',
        en: 'A chisel carving a masterpiece. Specialized skills lead to professional success.',
      },
      임진: {
        ko: '바다 속 흑룡의 기세로 스케일이 큰 일에 도전합니다. 큰 변화를 타고 거부가 될 수 있는 운세입니다.',
        en: 'A dragon in the ocean. Large-scale activities bring massive wealth.',
      },
      계사: {
        ko: '안개 걷히고 햇살 비치는 마을입니다. 목표가 명확해지며 지혜를 활용해 생활 수준이 향상됩니다.',
        en: 'Fog lifting over a village. Confusion clears and your life goals become vivid.',
      },
      갑오: {
        ko: '여름철 그늘 내어주는 거목입니다. 교육, 문화 사업에서 두각을 나타내며 주변을 이끄는 리더의 시기입니다.',
        en: 'Tree providing shade. Influence expands through education or culture.',
      },
      을미: {
        ko: '마른 언덕 위 끈질긴 풀입니다. 척박한 환경을 이겨내며 재산이 안정적으로 축적되는 시기입니다.',
        en: 'Grass on a dry hill. Persistence in harsh conditions leads to steady wealth.',
      },
      병신: {
        ko: '금속에 반사되는 햇살입니다. 대중적 인기나 사회적 평판이 상승하며 역동적으로 부를 거머쥡니다.',
        en: 'Sun reflecting off metal. Dynamic activities lead to wealth and social fame.',
      },
      정유: {
        ko: '별빛 아래 금빛 봉황입니다. 전문 분야에서 장인 정신을 발휘하여 명성을 얻고 존경을 받습니다.',
        en: 'Phoenix under starlight. You reach the level of a master in your professional field.',
      },
      무술: {
        ko: '황혼 녘 사막처럼 신념이 확고합니다. 무게감이 있어 함부로 대하지 못하며 정신적 지주 역할을 합니다.',
        en: 'Desert at dusk. Convictions become unshakable as you act as a spiritual anchor.',
      },
      기해: {
        ko: '비옥한 땅처럼 재물이 마르지 않습니다. 사람들과 어울리며 이익을 취하고 의식주가 풍족해집니다.',
        en: 'Fertile earth over water. Social interactions bring profits and comfort.',
      },
      경자: {
        ko: '우물 속 빛나는 칼날입니다. 냉철한 분석력이 돋보이며 연구나 기술 분야에서 압도적 전문성을 보입니다.',
        en: 'Blade shining in a well. You excel in research, law, or high-tech fields.',
      },
      신축: {
        ko: '진흙 속 보석처럼 인내가 필요합니다. 내실을 다지다 보면 당신의 가치를 알아봐 줄 귀인을 만납니다.',
        en: 'Jewelry hidden in mud. Internal cultivation leads to a dramatic turning point later.',
      },
      임인: {
        ko: '봄 숲 적시는 강물처럼 창의적입니다. 기획이나 교육 업종에서 보람을 얻으며 새로운 활로가 열립니다.',
        en: 'River feeding a forest. Creative ideas sprout, opening new career paths.',
      },
      계묘: {
        ko: '꽃 위 아침 이슬처럼 다정합니다. 예술적 감수성이 높아지고 부드러운 카리스마로 성공합니다.',
        en: "Dew on fresh flowers. Gentle charisma moves people's hearts to achieve goals.",
      },
      갑진: {
        ko: '기름진 땅 위 거목처럼 기반이 든든합니다. 활동 영역이 넓어지고 사업이 성공 궤도에 오릅니다.',
        en: 'Tree on fertile land. Rock-solid foundation leads to expanded business.',
      },
      을사: {
        ko: '열기 속 풀처럼 본인을 화려하게 드러냅니다. 화술이 좋아지고 사교 모임의 중심이 되는 구간입니다.',
        en: 'Grass in summer heat. Fame and success come through showmanship.',
      },
      병오: {
        ko: '한낮 태양처럼 기세가 하늘을 찌릅니다. 폭발적 에너지로 성취를 이루지만 겸손해야 복을 지킵니다.',
        en: 'Blazing sun at noon. Explosive energy drives rapid achievements with power.',
      },
      정미: {
        ko: '마른 땅 데우는 열기처럼 열정이 뜨겁습니다. 한 우물을 파면 독보적 전문가로 인정받는 운세입니다.',
        en: 'Heat warming dry earth. Craftsmanship leads you to become a top authority.',
      },
      무신: {
        ko: '보석 품은 산처럼 잠재력이 터져 나옵니다. 움직일수록 숨겨진 재물과 성과를 계속 발굴합니다.',
        en: 'Mountain containing minerals. The more active you are, the more wealth you find.',
      },
      기유: {
        ko: '황금 들판 추수처럼 노력이 결실을 맺습니다. 재물운이 안정적이며 풍요로운 10년을 보냅니다.',
        en: 'Field ready for harvest. Past hard work turns into tangible wealth and comfort.',
      },
      경술: {
        ko: '언덕 위 백호처럼 권위가 생깁니다. 강한 신념으로 조직을 개혁하거나 이끌며 명성을 얻습니다.',
        en: 'Tiger guarding a hill. You lead reforms in organizations with charisma.',
      },
      신해: {
        ko: '맑은 물에 씻긴 보석처럼 가치가 드러납니다. 지혜로운 판단으로 사람들의 부러움을 사는 삶을 삽니다.',
        en: 'Jewelry washed in water. Your value is clearly revealed with unexpected luck.',
      },
      임자: {
        ko: '밤의 광활한 바다처럼 깊은 지혜를 품습니다. 포용력이 넓어지고 큰 조직이나 학문적 대업을 이룹니다.',
        en: 'Ocean in the dark night. Immense capacity leads to leading large organizations.',
      },
      계축: {
        ko: '얼어붙은 땅 위 비처럼 고독하지만 성숙해집니다. 남들이 모르는 비장의 무기를 준비하는 시기입니다.',
        en: 'Rain on frozen earth. Internal maturity prepares you for a breakthrough.',
      },
      갑인: {
        ko: '봄날 울창한 거목 숲처럼 독립심이 강합니다. 추진력이 거침없어 본인의 사업을 일으키는 시기입니다.',
        en: 'Forest of trees in spring. Pioneer your own field and take control of your path.',
      },
      을묘: {
        ko: '푸른 초원처럼 유연한 생명력을 보입니다. 원만한 대인 관계와 영리함으로 영역을 확장합니다.',
        en: 'Green fields in mid-spring. Expand territory with flexibility and networking.',
      },
      병진: {
        ko: '습지 위 햇살처럼 희망을 줍니다. 창의적 아이디어가 결과로 이어지는 복덩이 운세입니다.',
        en: 'Sunlight over a marsh. Creative planning leads to prosperity of your community.',
      },
      정사: {
        ko: '용광로 속 등불처럼 집념으로 결과를 냅니다. 성취욕이 강해지며 목표를 끝내 쟁취하는 시기입니다.',
        en: 'Lamp in the furnace. Intense social success and striking honor define this cycle.',
      },
      무오: {
        ko: '화산 품은 산처럼 폭발적 기운을 가졌습니다. 인내심이 대단하며 결정적 순간에 파괴력을 보여줍니다.',
        en: 'Mountain with a volcano inside. Your patience leads to powerful governance.',
      },
      기미: {
        ko: '뜨거운 모래처럼 자립심이 강합니다. 역경을 스스로 극복하며 안정적인 부를 쌓는 운세입니다.',
        en: 'Hot sand in the desert. Unbreakable self-reliance helps build stable wealth.',
      },
      경신: {
        ko: '바위에 가는 칼날처럼 승부욕이 최고조입니다. 결단력 있는 행동으로 전문 분야에서 최고가 됩니다.',
        en: 'Blade sharpened on a rock. You excel in high-stakes professional fields.',
      },
      신유: {
        ko: '순도 높은 황금처럼 본인의 세계를 지킵니다. 고귀하고 품격 있는 활동으로 가치를 증명합니다.',
        en: 'Pure gold and jewelry. Maintain high standards and live a life of dignity.',
      },
      임술: {
        ko: '계곡에 갇힌 물처럼 인내하며 기다립니다. 내실을 다지면 훗날 바다로 나가는 큰 운을 맞습니다.',
        en: 'Water in a dry valley. Internal cultivation leads to a massive breakthrough.',
      },
      계해: {
        ko: '끝없이 흐르는 바다처럼 포용력이 넓습니다. 해외 운이나 유통 분야에서 지혜롭게 성공합니다.',
        en: 'Endless flow of the ocean. Embrace changes with wisdom and global networking.',
      },
    };

    // 4. 최종 결과 조립
    const currentNuance = pillarDetails[name]
      ? isEn
        ? pillarDetails[name].en
        : pillarDetails[name].ko
      : isEn
        ? 'Significant transition.'
        : '중요한 변화의 시기입니다.';
    const shipSungDetail = shipSungMap[calculatedShipSung]
      ? isEn
        ? shipSungMap[calculatedShipSung].en
        : shipSungMap[calculatedShipSung].ko
      : '개인적 성장';

    const introText = isEn
      ? `<b>Luck Cycle: ${name} (Age ${startAge} - ${endAge})</b>`
      : `<b>${name} 대운 (약 ${startAge}세 ~ ${endAge}세)</b>`;
    const shipSungText = isEn
      ? `The energy of <b>${calculatedShipSung}</b> is the primary driver, focusing on <b>${shipSungDetail}</b>.`
      : `당신의 운명에서 이 구간은 <b>${calculatedShipSung}</b>의 작용력이 가장 크게 나타납니다. 이는 <b>${shipSungDetail}</b>의 흐름이 주도하게 됨을 의미합니다.`;

    const clashKey = `${ganO}_${zhiO}`;
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
      }[clashKey] || ganO === zhiO
    );

    const environmentText = isEn
      ? `The interaction between ${ohaengMap[ganO] || ganO} and ${ohaengMap[zhiO] || zhiO} creates a <b>${isClash ? 'dynamic and innovative' : 'steady and supportive'}</b> environment.`
      : `천간의 ${ohaengMap[ganO] || ganO} 기운과 지지의 ${ohaengMap[zhiO] || zhiO} 기운이 만나는 이 환경은, <b>${isClash ? '역동적인 변화와 혁신을' : '안정적인 성장과 기반을'}</b> 만들어내는 소중한 바탕이 됩니다.`;

    return `
    <div style="line-height: 1.8; color: inherit; text-align: left; font-size: 15px; font-family: sans-serif;">
      <p style="margin-bottom: 12px; font-size: 16px;">${introText}</p>
      <p style="margin-bottom: 20px; font-weight: 500;">${currentNuance}</p>
      <p style="margin-bottom: 16px;">${shipSungText}</p>
      <p style="margin-bottom: 16px;">${environmentText}</p>
      <p style="margin-bottom: 8px; opacity: 0.8; font-size: 14px; border-top: 1px solid #eee; padding-top: 10px;">
        ${isEn ? '※ Interpretation based on traditional Saju principles.' : '※ 이 분석은 전통 명리학의 대운 흐름 분석 원리를 바탕으로 구성되었습니다.'}
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
                    __html: getDaewoonStory(selectedDae, currentAge, pillars),
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
