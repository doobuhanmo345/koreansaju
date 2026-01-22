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
import { SajuAnalysisService, AnalysisPresets } from '../service/SajuAnalysisService';
import DayLuckPage from './DayLuckPage';
import ReportTemplateToday from '../component/ReportTemplateToday';
// 1. 로딩 컴포넌트

// 2. 메인 페이지 컴포넌트
export default function TodaysLuckPage() {
  const { loading, setLoading, setLoadingType, aiResult, setAiResult } = useLoading();
  const [sajuData, setSajuData] = useState(null);
  const { userData, user, isDailyDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender,saju } = userData || {};
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


  const service = new SajuAnalysisService({
    user,
    userData,
    language,
    maxEditCount: MAX_EDIT_COUNT,
    uiText: UI_TEXT,
    langPrompt,
    hanja,
    setEditCount,
    setLoading,
    setAiResult,
  });

  const handleStartClick = async (onstart) => {
    setAiResult('');
    try {
      await service.analyze(AnalysisPresets.daily({ saju, gender, language }));
      onstart();
    } catch (error) {
      console.error(error);
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
      loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />}
      resultComponent={ReportTemplateToday}
      loadingTime={0}
    />
  );
}
