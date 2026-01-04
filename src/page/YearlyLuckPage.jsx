import { useRef, useState, useEffect } from 'react';
import AnalysisStepContainer from '../component/AnalysisStepContainer';
import ViewResult from './ViewResult';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import EnergyBadge from '../ui/EnergyBadge';
import { useAuthContext } from '../context/useAuthContext';
import { useUsageLimit } from '../context/useUsageLimit';
import { db } from '../lib/firebase';
import { setDoc, doc, increment } from 'firebase/firestore';
import { useLoading } from '../context/useLoadingContext';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import { TicketIcon, LockClosedIcon } from '@heroicons/react/24/outline';

import { langPrompt, hanja } from '../data/constants';
import { fetchGeminiAnalysis } from '../api/gemini';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { classNames } from '../utils/helpers';
import { getEng } from '../utils/helpers';
import { calculateSajuData } from '../utils/sajuLogic';
import { ref, get, child } from 'firebase/database';
import { database } from '../lib/firebase';
import CreditIcon from '../ui/CreditIcon';
// 1. 로딩 컴포넌트
function SajuLoading({ sajuData }) {
  const [displayedTexts, setDisplayedTexts] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const containerRef = useRef(null);
  const { language } = useLanguage();
  const pillars = sajuData?.pillars;
  const age = sajuData?.age;
  const counts = sajuData?.ohaengCount || { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const daewoonArr = sajuData?.daewoonList || [];
  const currentDae = daewoonArr.find((d) => d.isCurrent)?.name || '현재';
  const shinsalList = sajuData?.myShinsal?.map((s) => s.name) || [];
  const primaryShinsal = shinsalList.length > 0 ? shinsalList[0] : '특별한';

  const loadingTexts =
    language === 'ko'
      ? [
          `2026년 병오년(丙午年), 붉은 말의 해가 ${pillars?.year || '해당'}년생 당신에게 오고 있습니다...`,
          `가장 먼저 당신의 타고난 바탕인 '${pillars?.day || '일주'}'의 고유한 성질을 읽어냅니다.`,
          `현재 ${age}세의 생애 주기를 관통하는 '${currentDae}' 대운의 거대한 흐름을 확인합니다.`,
          `사주 원국의 나무(${counts.wood}), 불(${counts.fire}), 흙(${counts.earth}), 금(${counts.metal}), 물(${counts.water}) 배합비를 분석합니다.`,
          `일지 '${pillars?.day?.charAt(1) || ''}'와 2026년의 '오화(午火)'가 만날 때 발생하는 에너지 파동을 계산합니다.`,
          `당신에게 깃든 '${primaryShinsal}'의 기운이 새해의 성취에 어떤 동력이 될지 살핍니다.`,
          `사주에 기록된 ${shinsalList.length}가지 신살들이 병오년의 빛을 받아 활성화되는 시점을 찾습니다.`,
          `현재 대운인 '${currentDae}'의 환경이 2026년이라는 새로운 시간을 어떻게 맞이하는지 분석합니다.`,
          `일간 '${pillars?.day?.charAt(0) || ''}'과 새해 천간 '병화(丙火)'의 관계를 통해 명예운의 향방을 도출합니다.`,
          `지지의 글자들이 일으키는 합(合)과 충(沖)의 작용을 통해 올해의 변동성을 미리 시뮬레이션합니다.`,
          `사주 원국에서 다소 부족했던 오행의 기운이 2026년의 열기로 어떻게 보완되는지 확인합니다.`,
          `상반기(봄/여름) — 당신의 '${pillars?.month || ''}'월 기운이 새해의 시작과 맺는 인연을 분석 중입니다.`,
          `하반기(가을/겨울) — '${pillars?.time || ''}'시에 담긴 결과물들이 병오년의 결실로 이어지는지 추적합니다.`,
          `이제 사자가 기록한 당신만을 위한 2026년 병오년 종합 분석 리포트를 완성합니다.`,
        ]
      : [
          `2026, the Year of the Red Horse (Byeong-o), is approaching those born in the year of ${getEng(pillars?.year[0]) + getEng(pillars?.year[1]) || 'Day Pillar'}...`,
          `First, I am reading the unique characteristics of '${getEng(pillars?.day[0]) + getEng(pillars?.day[1]) || 'Day Pillar'}', the very foundation of your existence.`,
          `Identifying the great flow of the '${getEng(currentDae[0]) + getEng(currentDae[1])}' Daewoon, which penetrates your current life cycle at age ${age}.`,
          `Analyzing the composition ratio of Wood (${counts.wood}), Fire (${counts.fire}), Earth (${counts.earth}), Metal (${counts.metal}), and Water (${counts.water}) in your original birth chart.`,
          `Calculating the energy fluctuations that occur when your Day Branch '${getEng(pillars?.day[1]) || ''}' meets the 'Oh-hwa' (Fire energy) of 2026.`,
          `Observing how the energy of '${primaryShinsal}' within you will serve as a driving force for achievement in the new year.`,
          `Locating the exact moments when the ${shinsalList.length} different Shinsal (stars) in your chart activate under the light of the Byeong-o year.`,
          `Analyzing how the environment of your current '${getEng(currentDae[0]) + getEng(currentDae[1])}' Daewoon welcomes the new era of 2026.`,
          `Tracing the direction of your honor and reputation through the relationship between your Day Stem '${getEng(pillars?.month[0]) || ''}' and the New Year’s Heavenly Stem, 'Byeong-hwa'.`,
          `Simulating this year's volatility in advance through the interactions of 'Hap' (harmonies) and 'Chung' (clashes) triggered by the Earthly Branches.`,
          `Checking how the elements that were somewhat lacking in your original chart are supplemented by the intense heat of 2026.`,
          `First Half (Spring/Summer) — Analyzing the connection between the energy of your '${getEng(pillars?.month[0]) + getEng(pillars?.month[1]) || ''}' month and the beginning of the new year.`,
          `Second Half (Autumn/Winter) — Tracing whether the potentials contained in your '${getEng(pillars?.time[0]) + getEng(pillars?.time[1]) || ''}' hour lead to the fruits of the Byeong-o year.`,
          `Finalizing the comprehensive 2026 Byeong-o Year Analysis Report, recorded by the Saju master exclusively for you.`,
        ];

  useEffect(() => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      containerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth',
      });
    }
  }, [displayedTexts]);

  useEffect(() => {
    if (!sajuData) return;
    let textIdx = 0;
    const addNextSentence = () => {
      if (textIdx >= loadingTexts.length) {
        setIsFinished(true);
        return;
      }
      const fullText = loadingTexts[textIdx];
      let charIdx = 0;
      setDisplayedTexts((prev) => [...prev, '']);
      const typeChar = () => {
        if (charIdx < fullText.length) {
          setDisplayedTexts((prev) => {
            const lastIdx = prev.length - 1;
            const updated = [...prev];
            updated[lastIdx] = fullText.substring(0, charIdx + 1);
            return updated;
          });
          charIdx++;
          setTimeout(typeChar, 45);
        } else {
          textIdx++;
          setTimeout(addNextSentence, 800);
        }
      };
      typeChar();
    };
    addNextSentence();
  }, [sajuData]);

  return (
    <div className="flex flex-col items-center px-6 overflow-hidden">
      <svg className="absolute w-0 h-0 text-transparent">
        <filter id="paper-edge">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
        </filter>
      </svg>

      <div className="relative w-full max-w-lg animate-in fade-in duration-1000 mt-6">
        <div
          ref={containerRef}
          className="relative z-10 bg-[#fffef5] dark:bg-slate-900 shadow-2xl p-8 md:p-14 border border-stone-200/50 dark:border-slate-800 h-[500px] overflow-y-auto scrollbar-hide"
          style={{ filter: 'url(#paper-edge)' }}
        >
          {/* bg-fixed를 빼고 bg-repeat로 수정해서 스크롤 시 종이가 따라오게 함 */}
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none z-0"></div>

          <div className="relative z-10">
            <div className="flex flex-col items-center mb-10 opacity-40">
              <div className="w-10 h-[1px] bg-stone-500 mb-2"></div>
              <span className="text-[10px] tracking-[0.4em] uppercase text-stone-600 dark:text-stone-300 font-serif font-bold text-center">
                Heavenly Record
              </span>
            </div>

            <div className="flex flex-col gap-3 pb-10">
              {displayedTexts.map((text, idx) => {
                const isCurrentTyping = idx === displayedTexts.length - 1 && !isFinished;
                return (
                  <div key={idx} className="min-h-[28px] flex items-start py-1">
                    <p className="font-handwriting text-lg md:text-xl text-slate-800 dark:text-slate-200 leading-relaxed break-keep">
                      {text}
                      {isCurrentTyping && (
                        <span className="inline-block w-[2px] h-[1.1em] bg-stone-500 ml-1 align-middle animate-cursor-blink" />
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[98%] h-12 bg-stone-800/20 blur-3xl rounded-[100%]"></div>
      </div>

      <div className="mt-14 text-center">
        <div className="text-stone-500 dark:text-slate-400 text-[11px] tracking-[0.2em] animate-pulse font-serif italic">
          <p className="text-stone-500 dark:text-slate-400 text-[11px] tracking-[0.2em] animate-pulse font-serif italic">
            {language === 'ko'
              ? '운명의 실타래를 푸는 중입니다...'
              : 'Untangling the threads of destiny...'}
          </p>
        </div>
      </div>

      <style>{`
   @import url('https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&display=swap');
  
  .font-handwriting { 
    font-family: 'Nanum Brush Script', cursive; 
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transform: translateZ(0); /* GPU 가속으로 렌더링 최적화 */
    text-rendering: optimizeLegibility;
    font-weight: 500; /* 너무 얇으면 모바일에서 깨져 보이니 두께를 올림 */
    letter-spacing: -0.03em; 
    line-height: 1.6;
    word-break: keep-all;
  }
  
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

  /* 커서 깜빡임 애니메이션 */
  @keyframes cursor-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  .animate-cursor-blink {
    animation: cursor-blink 0.8s infinite;
  }
`}</style>
    </div>
  );
}

// 2. 메인 페이지 컴포넌트
export default function YearlyLuckPage() {
  const { setLoadingType, aiResult, setAiResult } = useLoading();
  const [loading, setLoading] = useState(false);
  const [sajuData, setSajuData] = useState(null);
  const { userData, user, isYearDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender } = userData || {};
  const { saju } = useSajuCalculator(inputDate, isTimeUnknown);
  const { language } = useLanguage();
  // useUsageLimit에서 editCount와 setEditCount 가져오기
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading;
  const isDisabled2 = !isYearDone && isLocked;

  useEffect(() => {
    if (inputDate) {
      const data = calculateSajuData(inputDate, gender, isTimeUnknown, language);
      if (data) {
        setSajuData(data);
        //   if (data.currentDaewoon) setSelectedDae(data.currentDaewoon);
      }
    }
  }, [inputDate, gender, isTimeUnknown, language]);
  // 버튼 클릭 시 실행될 중간 로직
  const handleStartClick = async (onStart) => {
    // 1. 기본 방어 로직
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!userData?.birthDate) return alert(UI_TEXT.saveFirst[language]);

    setLoading(true);
    setLoadingType('year');
    setAiResult('');

    const todayDate = new Date().toLocaleDateString('en-CA');
    const nextYear = new Date().getFullYear() + 1;
    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

    try {
      const data = userData.usageHistory || {};

      // 2. 신년 운세 캐시 체크 (연도 + 사주 + 언어 + 성별 일치 확인)
      if (data.ZLastNewYear) {
        const {
          year: savedYear,
          language: savedLang,
          saju: savedSaju,
          gender: savedGender,
          result: savedResult,
        } = data.ZLastNewYear;

        const isYearMatch = String(savedYear) === String(nextYear);
        const isLangMatch = savedLang === language;
        const isGenderMatch = savedGender === gender;
        const isSajuMatch = savedSaju && keys.every((k) => savedSaju[k] === saju[k]);

        if (isYearMatch && isLangMatch && isGenderMatch && isSajuMatch && savedResult) {
          setAiResult(savedResult);
          setLoading(false);
          setLoadingType(null);
          onStart();
          return;
        }
      }

      // 3. 한도 초과 체크
      const currentCount = data.editCount || 0;
      if (currentCount >= MAX_EDIT_COUNT) {
        return alert(UI_TEXT.limitReached[language]);
      }

      // 4. 프롬프트 생성 (요청하신 호칭 및 사주 텍스트 반영)
      // --- [3. 프롬프트 생성: 당신이 주신 로직 그대로 실행] ---
      const dbRef = ref(database);
      const [basicSnap, strictSnap, yearSnap] = await Promise.all([
        get(child(dbRef, 'prompt/new_year_basic')),
        get(child(dbRef, `prompt/default_instruction`)),
        get(child(dbRef, `prompt/new_year_format_${language}`)),
      ]);

      if (!basicSnap.exists()) {
        throw new Error('신년운세 기본 뼈대가 DB에 없습니다.');
      }

      const template = basicSnap.val();
      const displayName = userData?.displayName || (language === 'ko' ? '선생님' : 'User');

      const replacements = {
        '{{STRICT_INSTRUCTION}}': strictSnap.val() || '',
        '{{NEW_YEAR_FORMAT}}': yearSnap.val() || '',
        '{{gender}}': gender,
        '{{birthDate}}': userData.birthDate || '미입력',
        '{{sajuJson}}': `${JSON.stringify(saju)} - sky3+grd3 는 연주, sky2+grd2는 월주, sky1+grd1은 일주, sky0+grd0는 시주야`,
        '{{displayName}}': displayName,
        '{{langPrompt}}': typeof langPrompt === 'function' ? langPrompt(language) : '',
        '{{hanjaPrompt}}': typeof hanja === 'function' ? hanja(language) : '',
      };

      let fullPrompt = template;

      Object.entries(replacements).forEach(([key, value]) => {
        fullPrompt = fullPrompt.split(key).join(value || '');
      });
      // --- [프롬프트 생성 로직 끝] ---
      // 5. API 호출 및 DB 업데이트 (ZLastNewYear 필드 사용)

      const result = await fetchGeminiAnalysis(fullPrompt);
      const newCount = currentCount + 1;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          saju: saju,
          editCount: increment(1),
          lastEditDate: todayDate,
          usageHistory: {
            ZLastNewYear: {
              result: result,
              year: nextYear,
              saju: saju,
              language: language,
              gender: gender,
            },
          },
          dailyUsage: {
            [todayDate]: increment(1),
          },
        },
        { merge: true },
      );

      // 6. 결과 반영 및 이동
      setEditCount((prev) => prev + 1);
      setAiResult(result);
      onStart();
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  // 안내 디자인 정의
  const sajuGuide = (onStart) => {
    // return <SajuLoading sajuData={sajuData} />;
    if (loading) {
      return <SajuLoading sajuData={sajuData} />;
    }

    return (
      <div className="max-w-lg mx-auto text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <h2 className=" text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
          {language === 'ko' ? '오행으로 읽는' : 'Reading the Five Elements'}
          <br />
          <span className="relative text-red-600 dark:text-red-400">
            {language === 'ko' ? '2026 신년운세' : '2026 Fortune Preview'}
            <div className="absolute inset-0 bg-red-200/50 dark:bg-red-900/30 blur-md rounded-full scale-100"></div>
          </span>
        </h2>
        {/* 설명문구 */}
        <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
          <p className="text-sm">
            {language === 'ko' ? (
              <>
                <strong>붉은 말의 해</strong>, 사주에 숨겨진 월별 건강운, 재물운, 연애운.
              </>
            ) : (
              '2026 is Year of the Red Horse, find out the fortune upcoming of yours'
            )}
          </p>

          <div>
            <CreditIcon num={-1} />
          </div>

          <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img
              src="/images/introcard/newyear_1.png"
              alt="2026 yearly luck"
              className="w-full h-auto"
            />
          </div>
        </div>
        {/* 시작 버튼: handleYearlyStartClick (가칭) 연결 */}
        <button
          onClick={() => handleStartClick(onStart)}
          disabled={isDisabled || isDisabled2}
          className={classNames(
            'w-full  px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
            isDisabled
              ? DISABLED_STYLE
              : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-red-200 hover:-translate-y-1',
          )}
        >
          {language === 'ko' ? '2026 신년 운세 보기' : 'Check the 2026 Fortune'}
          {isYearDone ? (
            <div className="flex items-center gap-1 backdrop-blur-md bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
              <span className="text-[9px] font-bold text-white uppercase">Free</span>
              <TicketIcon className="w-3 h-3 text-white" />
            </div>
          ) : isLocked ? (
            <>
              <div
                className="mt-1 flex items-center gap-1 backdrop-blur-sm px-2 py-0.5 rounded-full border shadow-sm relative z-10 border-gray-500/50 bg-gray-400/40" // 잠겼을 때
              >
                <span className="text-[9px] font-bold text-white tracking-wide uppercase">
                  <LockClosedIcon className="w-4 h-4 text-amber-500" />
                </span>
              </div>
            </>
          ) : (
            user && (
              <div className="relative scale-90">
                <EnergyBadge active={userData?.birthDate} consuming={loading} cost={-1} />
              </div>
            )
          )}
        </button>
        {isLocked ? (
          <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
            <ExclamationTriangleIcon className="w-4 h-4" />{' '}
            {/* 아이콘이 없다면 ⚠️ 이모지로 대체 가능 */}
            {language === 'ko' ? '크레딧이 부족합니다..' : 'not Enough credit'}
          </p>
        ) : (
          <p className="mt-4 text-[11px] text-slate-400">
            {language === 'ko'
              ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.'
              : 'Fortunes that have already been analyzed do not use credits.'}
          </p>
        )}
      </div>
    );
  };
  // 1. 결과가 나왔을 때 스크롤을 위로 올리는 로직
  useEffect(() => {
    // aiResult가 유효한 문자열인지 확인
    if (typeof aiResult === 'string' && aiResult.trim().length > 0) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [aiResult]); // <--- aiResult를 반드시 넣어줘야 합니다!

  // 2. 로딩이 시작될 때 스크롤 상단 이동
  useEffect(() => {
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);

  return (
    <AnalysisStepContainer
      guideContent={sajuGuide}
      loadingContent={<SajuLoading />}
      resultComponent={ViewResult}
      loadingTime={0}
    />
  );
}
