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
import { classNames } from '../utils/helpers';
import { TicketIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { STRICT_INSTRUCTION, DAILY_FORTUNE_PROMPT } from '../data/aiResultConstants';
import { langPrompt, hanja } from '../data/constants';
import { getPillars } from '../utils/sajuCalculator';
import { fetchGeminiAnalysis } from '../api/gemini';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { calculateSajuData } from '../utils/sajuLogic';
import { getEng } from '../utils/helpers';
import { ref, get, child } from 'firebase/database';
import { database } from '../lib/firebase';
import LoadingFourPillar from '../component/LoadingFourPillar';
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
          `하늘의 시간과 '${pillars?.day || '일주'}'의 기운이 만나는 오늘의 좌표를 계산합니다...`,
          `본질인 '${pillars?.day || '신묘'}'의 기운과 오늘 일진(日辰)의 합충(合沖)을 정밀 대조 중입니다.`,
          `오늘 당신의 기운을 보완할 행운의 색상을 찾기 위해 오행의 과다를 분석합니다.`,
          `나무(${counts.wood}), 불(${counts.fire}), 흙(${counts.earth}), 금(${counts.metal}), 물(${counts.water}) 중 오늘 가장 길한 에너지를 선별합니다.`,
          `당신에게 행운을 가져다줄 '최적의 방향'을 동서남북 방위학적 관점에서 추출하고 있습니다.`,
          `재물운 분석 — '${pillars?.day?.charAt(0)}'금 일간이 오늘 만나는 편재와 정재의 흐름을 읽습니다.`,
          `애정운 분석 — 당신에게 깃든 '${primaryShinsal}'의 매력이 오늘 타인에게 어떻게 비칠지 살핍니다.`,
          `학업/사업운 — 현재의 '${currentDae}' 대운과 오늘 관성(官星)의 조화를 통해 효율성을 측정합니다.`,
          `건강운 분석 — 오행의 균형이 깨지는 지점을 찾아 조심해야 할 신체 부위와 컨디션을 체크합니다.`,
          `전체 데이터를 종합하여 당신의 오늘 운세 점수를 100점 만점 기준으로 산출하고 있습니다.`,
          `현재의 파동이 내일로 이어지는 흐름을 미리 살피며, 내일의 전체적인 운의 고저를 확인합니다.`,
          `내일의 운세는 수치보다 흐름에 집중하여, 당신이 맞이할 오전과 오후의 기운 변화를 추적합니다.`,
          `현재 ${age}세의 생애 주기 내에서 오늘 하루가 갖는 운명적인 무게감을 분석 중입니다.`,
          `당신을 도울 '귀인'의 방위와 에너지를 충전해줄 행운의 아이템을 선별하고 있습니다.`,
          `오늘의 실수를 방지하고 내일의 기회를 선점할 수 있는 개인화 가이드를 구성합니다.`,
          `이제 사자가 기록한 당신의 오늘 종합 점수와 내일의 운세 리포트를 완성합니다.`,
        ]
      : [
          `Calculating today's coordinates where the celestial time meets the energy of your '${getEng(pillars?.day[0]) + getEng(pillars?.day[1]) || 'Day Pillar'}'...`,
          `Precisely contrasting the harmony and clashes between your essence, '${getEng(pillars?.day[0]) + getEng(pillars?.day[1]) || 'Day Pillar'}', and today's daily energy...`,
          `Analyzing the balance of the Five Elements to find the lucky color that will supplement your energy today...`,
          `Selecting today's most auspicious energy among Wood (${counts.wood}), Fire (${counts.fire}), Earth (${counts.earth}), Metal (${counts.metal}), and Water (${counts.water}).`,
          `Extracting the 'Optimal Direction' that will bring you luck from a compass-based geomantic perspective.`,
          `Wealth Analysis — Reading the flow of 'Pyeon-jae' (indirect wealth) and 'Jeong-jae' (direct wealth) for your '${getEng(pillars?.day[1])}' Day Stem.`,
          `Love & Relationship Analysis — Observing how the charm of '${primaryShinsal}' within you will project to others today.`,
          `Work & Education Analysis — Measuring efficiency through the harmony of your '${getEng(currentDae[0]) + getEng(currentDae[1])}' Daewoon and today’s 'Gwan-seong' (career star).`,
          `Health Analysis — Checking for potential physical vulnerabilities by identifying where the balance of elements might be disrupted.`,
          `Synthesizing all data to calculate your daily fortune score on a scale of 100.`,
          `Checking tomorrow's overall fortune levels by observing how current vibrations carry over into the next day.`,
          `Tracing the energy shifts between tomorrow's morning and afternoon, focusing on the flow rather than just numbers.`,
          `Analyzing the fateful significance of today within your current life cycle at age ${age}.`,
          `Identifying the direction of the 'Gui-in' (Nobleman/Helper) and selecting lucky items to recharge your energy.`,
          `Constructing a personalized guide to prevent today's mistakes and seize tomorrow's opportunities.`,
          `Finalizing today's comprehensive score and tomorrow's fortune report, as recorded by the Saju master.`,
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
  /* 폰트를 조금 더 굵은 '나눔 브러쉬(붓)' 체로 변경 */
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
export default function TodaysLuckPage() {
  const { loading, setLoading, setLoadingType, aiResult, setAiResult } = useLoading();
  const [sajuData, setSajuData] = useState(null);
  const { userData, user, isDailyDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender } = userData || {};
  const { saju } = useSajuCalculator(inputDate, isTimeUnknown);
  const { language } = useLanguage();
  // useUsageLimit에서 editCount와 setEditCount 가져오기
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading;
  const isDisabled2 = !isDailyDone && isLocked;
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
    setLoadingType('daily');
    setAiResult('');

    const todayDate = new Date().toLocaleDateString('en-CA');
    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

    try {
      const data = userData.usageHistory || {};

      // 2. 일일 운세 캐시 체크 (오늘 날짜 + 사주 + 언어 + 성별 일치 확인)
      if (data.ZLastDaily) {
        const {
          date: savedDate,
          language: savedLang,
          saju: savedSaju,
          gender: savedGender,
          result: savedResult,
        } = data.ZLastDaily;

        const isDateMatch = savedDate === todayDate;
        const isLangMatch = savedLang === language;
        const isGenderMatch = savedGender === gender;
        const isSajuMatch = savedSaju && keys.every((k) => savedSaju[k] === saju[k]);

        // 모든 조건이 맞고 결과값이 이미 있다면 바로 결과 모달/스텝으로 이동
        if (isDateMatch && isLangMatch && isGenderMatch && isSajuMatch && savedResult) {
          setAiResult(savedResult);
          setLoading(false);
          setLoadingType(null);
          onStart();
          return;
        }
      }

      // 3. 한도 초과 체크 (새로 뽑아야 하는 경우에만 체크)
      const currentCount = data.editCount || 0;
      if (currentCount >= MAX_EDIT_COUNT) {
        return alert(UI_TEXT.limitReached[language]);
      }
      const dbRef = ref(database); // 실시간 DB 참조
      const [basicSnap, strictSnap, dailySnap] = await Promise.all([
        get(child(dbRef, 'prompt/daily_basic')), // 전체 뼈대
        get(child(dbRef, `prompt/default_instruction`)), // 기본 지침
        get(child(dbRef, `prompt/daily_format_${language}`)), // 일일운세 특화 지침
      ]);

      if (!basicSnap.exists()) {
        throw new Error('DB에 일일운세 템플릿이 없습니다.');
      }
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const todayPillars = getPillars(today);
      const tomorrowPillars = getPillars(tomorrow);
      const userSajuText = `${saju.sky3}${saju.grd3}년 ${saju.sky2}${saju.grd2}월 ${saju.sky1}${saju.grd1}일 ${saju.sky0}${saju.grd0}시`;
      const todaySajuText = `${todayPillars.sky3}${todayPillars.grd3}년 ${todayPillars.sky2}${todayPillars.grd2}월 ${todayPillars.sky1}${todayPillars.grd1}일`;
      const tomorrowSajuText = `${tomorrowPillars.sky3}${tomorrowPillars.grd3}년 ${tomorrowPillars.sky2}${tomorrowPillars.grd2}월 ${tomorrowPillars.sky1}${tomorrowPillars.grd1}일`;

      // --- 4. 프롬프트 조립 (템플릿 내 {{key}}를 실제 데이터로 치환) ---
      const replacements = {
        '{{STRICT_INSTRUCTION}}': strictSnap.val() || '',
        '{{DAILY_FORTUNE_PROMPT}}': dailySnap.val() || '',
        '{{gender}}': gender,
        '{{userSajuText}}': userSajuText,
        '{{todayDate}}': todayPillars.date,
        '{{todaySajuText}}': todaySajuText,
        '{{tomorrowDate}}': tomorrowPillars.date,
        '{{tomorrowSajuText}}': tomorrowSajuText,
        '{{displayName}}': userData?.displayName || (language === 'ko' ? '선생님' : 'User'),
        '{{langPrompt}}': typeof langPrompt === 'function' ? langPrompt(language) : '',
        '{{hanjaPrompt}}': typeof hanja === 'function' ? hanja(language) : '',
      };

      let fullPrompt = basicSnap.val();
      Object.entries(replacements).forEach(([key, value]) => {
        fullPrompt = fullPrompt.split(key).join(value || '');
      });

      // --- 5. Gemini API 호출 ---
      const result = await fetchGeminiAnalysis(fullPrompt);
      // 4. 새로운 분석 데이터 준비 (API 프롬프트 생성용)

      // if (!todayPillars || !tomorrowPillars) return;

      // const userSajuText = `${saju.sky3}${saju.grd3}년 ${saju.sky2}${saju.grd2}월 ${saju.sky1}${saju.grd1}일 ${saju.sky0}${saju.grd0}시`;
      // const todaySajuText = `${todayPillars.sky3}${todayPillars.grd3}년 ${todayPillars.sky2}${todayPillars.grd2}월 ${todayPillars.sky1}${todayPillars.grd1}일`;
      // const tomorrowSajuText = `${tomorrowPillars.sky3}${tomorrowPillars.grd3}년 ${tomorrowPillars.sky2}${tomorrowPillars.grd2}월 ${tomorrowPillars.sky1}${tomorrowPillars.grd1}일`;

      // const fullPrompt = `${STRICT_INSTRUCTION[language]}\n${DAILY_FORTUNE_PROMPT[language]}\n[User Gender] ${gender}\n[User Saju] ${userSajuText}\n[Today: ${todayPillars.date}] ${todaySajuText}\n[Tomorrow: ${tomorrowPillars.date}] ${tomorrowSajuText}\n${langPrompt(language)}\n${hanja(language)}`;

      // // 5. API 호출 및 DB 업데이트

      // const result = await fetchGeminiAnalysis(fullPrompt);
      // const newCount = currentCount + 1;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          saju: saju,
          editCount: increment(1),
          lastEditDate: todayDate,
          usageHistory: {
            ZLastDaily: {
              result: result,
              date: todayDate,
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
     if (loading) {
          return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />;
        }
    return (
      <div className="max-w-lg mx-auto  text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* 상단 비주얼: 🔮 대신 오늘을 상징하는 해/달 또는 달력 이모지 */}
        <div>
          {/* 타이틀: 매일의 흐름을 강조 */}
          <h2 className=" text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
            {language === 'ko' ? '사자가 읽어주는' : "by Saza's Saju reading"}

            <br />
            <span className=" relative text-amber-600 dark:text-amber-500">
              {language === 'ko' ? '당신의 오늘' : 'Luck of the day'}
              <div className="absolute inset-0 bg-amber-200/50 dark:bg-amber-800/60 blur-md rounded-full scale-100"></div>
            </span>
          </h2>
          {/* 설명문구: 줄줄이 쓰지 않고 핵심만 */}
          <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
            <p className="text-sm">
              {language === 'ko' ? (
                <>
                  사주로 보는
                  <strong>오늘의 재물운, 연애운</strong>부터 <strong>오늘의 방향과 컬러</strong>
                  까지! 운명 지도 분석.
                </>
              ) : (
                'Including ‘Total score’, ‘Daily short report: Wealth, Love etc.’, ‘Lucky color, direction, keywords of the day’'
              )}
            </p>
            

            <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
              <img
                src="/images/introcard/todaysluck_1.png"
                alt="today's luck"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* 시작 버튼: handleDailyStartClick 연결 */}
        <button
          onClick={() => handleStartClick(onStart)} // 일일 운세용 함수 호출
          disabled={isDisabled || isDisabled2}
          className={classNames(
            'w-full  px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
            isDisabled
              ? DISABLED_STYLE
              : 'bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white shadow-amber-200 hover:-translate-y-1',
          )}
        >
          {language === 'ko' ? '오늘의 운세 확인하기' : 'Check my Luck of the day'}

          {isDailyDone ? (
            <div className="flex items-center gabackdrop-blur-md bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
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
  useEffect(() => {
    if (aiResult) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [aiResult]);

  // 추가: 로딩이 시작될 때도 상단으로 올리고 싶다면 (선택 사항)
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
