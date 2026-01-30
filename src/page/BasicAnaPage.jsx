import { useRef, useState, useEffect, useCallback, useMemo } from 'react'; // 1. useMemo 추가
import { Helmet } from 'react-helmet-async';
import AnalysisStepContainer from '../component/AnalysisStepContainer';
import AnalyzeButton from '../component/AnalyzeButton';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import EnergyBadge from '../ui/EnergyBadge';
import { reportStyleSimple } from '../data/aiResultConstants';
import ReportHid from '../component/ReportHid';
import { useAuthContext } from '../context/useAuthContext';
import { useUsageLimit } from '../context/useUsageLimit';
import { useLoading } from '../context/useLoadingContext';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import { classNames } from '../utils/helpers';
import { TicketIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import SajuResult from '../component/SajuResult';
import { calculateSajuData } from '../utils/sajuLogic';
import LoadingFourPillar from '../component/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '../service/SajuAnalysisService';
import ReportTemplateBasic from '../component/ReportTemplateBasic';
import BasicAnaAppeal from './BasicAnaAppeal';
import BasicAnaPreview from '../component/preview/BasicAnaPreview';

export default function BasicAnaPage() {
  const [sajuData, setSajuData] = useState(null);
  const { loading, setLoading, setAiResult, aiResult } = useLoading();
  const { userData, user, isMainDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender } = userData || {};
  const { saju } = useSajuCalculator(inputDate, isTimeUnknown);
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();

  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading;
  const isDisabled2 = !isMainDone && isLocked;

  // ✅ 1. SajuAnalysisService 인스턴스 고정 (가장 중요)
  // useMemo를 안쓰면 렌더링마다 서비스가 새로 생성되어 내부 리렌더링을 유발합니다.
  const service = useMemo(
    () =>
      new SajuAnalysisService({
        user,
        userData,
        language,
        maxEditCount: MAX_EDIT_COUNT,
        uiText: UI_TEXT,
        setEditCount,
        setLoading,
        setAiResult,
      }),
    [user, userData, language, MAX_EDIT_COUNT, setEditCount, setLoading, setAiResult],
  );

  // ✅ 2. handleStartClick을 useCallback으로 고정
  const handleStartClick = useCallback(
    async (onstart) => {
      setAiResult('');
      try {
        const data = calculateSajuData(inputDate, gender, isTimeUnknown, language);
        if (!data) return;

        await service.analyze(AnalysisPresets.basic({ saju, gender, language }, data), (result) => {
          console.log('✅ 평생운세 완료!');
        });
        onstart();
      } catch (error) {
        console.error(error);
      }
    },
    [inputDate, gender, isTimeUnknown, language, service, saju, setAiResult],
  );

  // ✅ 3. sajuGuide를 useCallback으로 고정
  // AnalysisStepContainer가 이 함수를 의존성으로 가질 경우 무한 루프의 주범이 됩니다.
  const sajuGuide = useCallback(
    (onStart) => {
      if (loading) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />;
      }

      return (
        <div className=" mx-auto text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
              {language === 'ko' ? '오행으로 읽는' : 'Reading the Five Elements'}
              <br />
              <span className="relative text-sky-600 dark:text-sky-500">
                {language === 'ko' ? '평생운세 & 10년 대운' : 'Saju Analysis'}
                <div className="absolute inset-0 bg-sky-200/50 dark:bg-sky-800/60 blur-md rounded-full scale-100"></div>
              </span>
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
              <p className="text-sm">
                {language === 'ko' ? (
                  <>
                    <strong>타고난 운명</strong>과 <strong>10년마다 찾아오는 변화의 시기</strong>,
                    당신의 운명 지도 분석.
                  </>
                ) : (
                  'My innate color and the period of change that comes every ten years. Analyzing your destiny map.'
                )}
              </p>
              <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                <img
                  src="/images/introcard/basicana_1.webp"
                  alt="saju analysis"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* [NEW] Primary Analyze Button */}
          <div className="mb-12 max-w-lg mx-auto">
            <AnalyzeButton
              onClick={() => handleStartClick(onStart)}
              disabled={isDisabled || isDisabled2}
              loading={loading}
              isDone={isMainDone}
              label={language === 'ko' ? '평생 운세 보기' : 'Analyze Saju'}
              color="indigo"
              cost={-1}
            />
            {isLocked ? (
              <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {language === 'ko' ? '크레딧이 부족합니다..' : 'Not Enough credit'}
              </p>
            ) : (
              <p className="mt-4 text-[11px] text-slate-400">
                {language === 'ko'
                  ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.'
                  : 'Fortunes already analyzed do not use credits.'}
              </p>
            )}
          </div>


          {/* [NEW] Appeal Section */}
          <div className="mb-12 -mx-6">
            <BasicAnaAppeal />
          </div>

          {/* 3단 정보 바 (삭제됨 - Appeal 컴포넌트로 대체) */}

          {/* 프리뷰 섹션 시작 */}
          <BasicAnaPreview 
            onStart={() => handleStartClick(onStart)} 
            isDisabled={isDisabled} 
            isDisabled2={isDisabled2} 
            loading={loading} 
            isDone={isMainDone} 
            isLocked={isLocked}
          />
        </div>
      );
    },
    [
      loading,
      saju,
      isTimeUnknown,
      language,
      isDisabled,
      isDisabled2,
      handleStartClick,
      user,
      userData,
      isMainDone,
      isLocked,
    ],
  );

  // ✅ 4. 스크롤 로직 최적화 (aiResult가 바뀔 때만 한 번 실행)
  useEffect(() => {
    if (aiResult && aiResult.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [aiResult]);

  // ✅ 5. Result 컴포넌트 참조 고정
  const resultComp = useCallback(() => <ReportTemplateBasic />, [aiResult]);

  return (
    <>
      <Helmet>
        <title>
          {language === 'ko' 
            ? '사주 평생운세 & 10년 대운 - 사자사주' 
            : 'Life Fortune & 10-Year Cycle - SAZA SAJU'}
        </title>
        <meta 
          name="description" 
          content={language === 'ko' 
            ? '당신의 타고난 운명과 10년 주기 대운의 흐름을 분석합니다. 정통 명리학으로 풀이하는 인생의 지도.' 
            : 'Analyze your innate destiny and the flow of the 10-year major luck cycle. A life map interpreted through authentic Sajuology.'} 
        />
        <link rel="canonical" href="https://sazasaju.com/basic" />
      </Helmet>
      <AnalysisStepContainer
        guideContent={sajuGuide}
        loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />}
        resultComponent={resultComp}
        loadingTime={0}
      />
    </>
  );
}
