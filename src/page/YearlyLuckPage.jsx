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
import { STRICT_INSTRUCTION, NEW_YEAR_FORTUNE_PROMPT } from '../data/aiResultConstants';
import { langPrompt, hanja } from '../data/constants';
import { fetchGeminiAnalysis } from '../api/gemini';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { classNames } from '../utils/helpers';

import { calculateSajuData, createPromptForGemini } from '../utils/sajuLogic';
import CreditIcon from '../ui/CreditIcon';
// 1. 로딩 컴포넌트

function SajuLoading({ sajuData }) {
  const [displayedTexts, setDisplayedTexts] = useState([]);
  const [isFinished, setIsFinished] = useState(false); // 전체 로딩 완료 여부
  const containerRef = useRef(null);

  const pillars = sajuData?.pillars;
  const age = sajuData?.currentAge || 0;
  const daewoonArr = sajuData?.daewoonList || [];
  const currentDae = daewoonArr.find((d) => d.isCurrent)?.name || '현재';
  const counts = sajuData?.ohaengCount || { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const shinsalList = sajuData?.myShinsal?.map((s) => s.name) || [];
  const primaryShinsal = shinsalList.length > 0 ? shinsalList[0] : '특별한';

  const loadingTexts = [
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
  ];

  // 스크롤 제어
  useEffect(() => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = containerRef.current;
      const threshold = 100;
      if (scrollHeight > clientHeight + scrollTop - threshold) {
        containerRef.current.scrollTo({
          top: scrollHeight - clientHeight + threshold,
          behavior: 'smooth',
        });
      }
    }
  }, [displayedTexts]);

  // 글자 단위 타이핑 로직 (커서 포함)
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

      // 새 문장을 위한 빈 공간 추가
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
          {/* 종이 배경 질감 (가로줄 제거됨) */}
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] z-0"></div>

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
                      {/* 현재 타이핑 중인 문장에만 커서 표시 */}
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
        <p className="text-stone-500 dark:text-slate-400 text-[11px] tracking-[0.2em] animate-pulse font-serif italic">
          운명의 실타래를 푸는 중입니다...
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap');
        .font-handwriting { font-family: 'Nanum Pen Script', cursive; }
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
  const { loading, setLoading, setLoadingType, aiResult, setAiResult } = useLoading();
  const [sajuData, setSajuData] = useState(null);
  const { userData, user, isYearDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender } = userData || {};
  const { saju } = useSajuCalculator(inputDate, isTimeUnknown);
  const { language } = useLanguage();
  // useUsageLimit에서 editCount와 setEditCount 가져오기
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading;
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
      const currentSajuJson = JSON.stringify(saju);
      const displayName = userData?.displayName || (language === 'ko' ? '선생님' : 'User');
      const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${userData.birthDate}, 팔자:${currentSajuJson} sky3+grd3 는 연주, sky2+grd2는 월주, sky1+grd1은 일주, sky0+grd0는 시주야. 나를 선생님이 아닌 ${displayName}님 이라고 불러줘. 영어로는 ${displayName}. undefined시는 그냥 선생님이라고 해..`;
      const fullPrompt = `${STRICT_INSTRUCTION[language]}\n${NEW_YEAR_FORTUNE_PROMPT[language]}\n${sajuInfo}\n${langPrompt(language)}\n${hanja(language)}`;

      // 5. API 호출 및 DB 업데이트 (ZLastNewYear 필드 사용)

      const result = await fetchGeminiAnalysis(fullPrompt);
      const newCount = currentCount + 1;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          saju: saju,
          editCount: newCount,
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
      setEditCount(newCount);
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
      return <SajuLoading sajuData={sajuData} />;
    }

    return (
      <div className="max-w-lg mx-auto pt-10 text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
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
          disabled={isDisabled && !isYearDone}
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
