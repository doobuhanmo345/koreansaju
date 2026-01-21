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
import LoadingFourPillar from '../component/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '../service/SajuAnalysisService';
import ReportTemplate from '../component/ReportTemplate';

// 1. 로딩 컴포넌트

// 2. 메인 페이지 컴포넌트
export default function YearlyLuckPage() {
  const { setLoadingType, aiResult, setAiResult } = useLoading();
  const [loading, setLoading] = useState(false);
  const [sajuData, setSajuData] = useState(null);
  const { userData, user, isYearDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender,saju } = userData || {};


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
      console.log('전달할 saju:', saju); // 디버그
      await service.analyze(AnalysisPresets.newYear({ saju, gender, language }));
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
      loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />}
      resultComponent={ReportTemplate}
      loadingTime={0}
    />
  );
}
