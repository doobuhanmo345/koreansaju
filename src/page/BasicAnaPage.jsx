import { useState, useEffect } from 'react';
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
import { langPrompt, hanja } from '../data/constants';
import { getPillars } from '../utils/sajuCalculator';
import { fetchGeminiAnalysis } from '../api/gemini';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import SajuResult from '../component/SajuResult';
import { calculateSajuData, createPromptForGemini } from '../utils/sajuLogic';
import { BoltIcon } from '@heroicons/react/24/outline';
// 1. 로딩 컴포넌트
function SajuLoading() {
  const [textIndex, setTextIndex] = useState(0);
  const loadingTexts = [
    '태어난 날의 천간과 지지를 조합하는 중...',
    '오행의 균형과 기운을 분석하는 중...',
    '당신의 인생을 바꿀 대운의 흐름을 계산 중...',
    '사주 명식의 신살과 합충을 풀이하는 중...',
    '운명의 지도를 완성하고 있습니다...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 800);
    return () => clearInterval(interval);
  }, [loadingTexts.length]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-slate-900 px-6">
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 border-4 border-indigo-100 dark:border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-4 border-2 border-purple-400 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-pulse"></div>
        </div>
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
          운명의 실타래를 푸는 중
        </h3>
        <p className="text-indigo-600 dark:text-indigo-400 font-medium min-h-[1.5rem] transition-all duration-300">
          {loadingTexts[textIndex]}
        </p>
      </div>
    </div>
  );
}

// 2. 메인 페이지 컴포넌트
export default function BasicAnaPage() {
  const [sajuData, setSajuData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const { loading, setLoading, loadingType, setLoadingType, aiResult, setAiResult } = useLoading();
  const { userData, user, isMainDone } = useAuthContext();
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
    // 1. 방어 로직
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!userData?.birthDate) return alert(UI_TEXT.saveFirst[language]);

    setLoading(true);
    setLoadingType('main');
    setAiResult(''); // 기존 결과 초기화

    const todayDate = new Date().toLocaleDateString('en-CA');
    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

    try {
      const data = userData || {};

      // 2. 캐시 체크 (기존 로직 유지)
      if (data.ZApiAnalysis) {
        const {
          language: savedLang,
          saju: savedSaju,
          gender: savedGender,
          result: savedResult,
        } = data.ZApiAnalysis;

        const isLangMatch = savedLang === language;
        const isGenderMatch = savedGender === gender;
        const isSajuMatch = savedSaju && keys.every((k) => savedSaju[k] === saju[k]);

        if (isLangMatch && isGenderMatch && isSajuMatch && savedResult) {
          setAiResult(savedResult);
          setLoading(false);
          setLoadingType(null);
          onStart(); // 저장된 결과가 있으면 즉시 이동
          return;
        }
      }

      // 3. 한도 체크
      const currentCount = data.editCount || 0;
      if (currentCount >= MAX_EDIT_COUNT) {
        setLoading(false);
        return alert(UI_TEXT.limitReached[language]);
      }

      // 4. API 호출 및 결과 확보 (핵심: 변수 'result'에 직접 할당)
      const prompt = createPromptForGemini(sajuData, language);
      const result = await fetchGeminiAnalysis(prompt); // API 결과 대기
      console.log('promp:', prompt); // 확인용
      if (!result) {
        throw new Error('API로부터 결과를 받지 못했습니다.');
      }

      // 5. DB 업데이트 (aiAnalysis 스테이트 대신, 방금 받은 따끈따끈한 'result' 변수 사용)
      const newCount = currentCount + 1;
      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: newCount,
          lastEditDate: todayDate,
          ZApiAnalysis: {
            result: result, // 스테이트가 아닌 변수를 직접 저장
            date: todayDate,
            saju: saju,
            language: language,
            gender: gender,
          },
          dailyUsage: {
            [todayDate]: increment(1),
          },
        },
        { merge: true },
      );

      // 6. 상태 반영 및 화면 전환
      setEditCount(newCount);
      setAiAnalysis(result); // UI용 스테이트 업데이트
      setAiResult(result); // SajuResult로 전달될 결과값 설정

      console.log('분석 완료 데이터:', result); // 확인용
      onStart(); // 이제 안전하게 다음 스테이지로 이동
    } catch (e) {
      console.error('발생한 에러:', e);
      alert(`분석 중 오류가 발생했습니다: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  // 안내 디자인 정의
  const sajuGuide = (onStart) => {
    if (loading) {
      return <SajuLoading />;
    }
    return (
      <div className="max-w-md mx-auto pt-10 text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* 상단 비주얼: 🔮 대신 오늘을 상징하는 해/달 또는 달력 이모지 */}
        <div>
       
          {/* 타이틀: 매일의 흐름을 강조 */}
          <h2 className=" text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
            오행으로 읽는
            <br />
            <span className=" relative text-amber-600 dark:text-amber-500">
              평생운세 & 10년 대운
              <div className="absolute inset-0 bg-amber-200/50 dark:bg-amber-800/60 blur-md rounded-full scale-100"></div>
            </span>
          </h2>
          {/* 설명문구: 줄줄이 쓰지 않고 핵심만 */}
          <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
            <p className="text-sm">
              <strong>타고난 운명</strong>과 <strong>10년마다 찾아오는 변화의 시기</strong>, 당신의
              운명 지도 분석.
            </p>
            <div>
              <span
                className="
    inline-flex items-center gap-1.5 
    /* 라이트 모드 디자인 */
    bg-amber-50 text-amber-700 border border-amber-200 
    /* 다크 모드 디자인 (어두운 배경에 대비되게) */
    dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50 
    /* 공통 스타일: 둥글게, 글자 크기, 여백, 그림자 */
    py-1 px-3.5 rounded-md text-[13px] font-bold shadow-sm
    transition-all duration-300
  "
              >
                {/* 아이콘 부분: 살짝 애니메이션을 줘서 생동감 있게 */}
                <BoltIcon className="h-4 w-4 fill-amber-500 dark:fill-amber-400 animate-pulse" />

                <span className="tracking-tight">
                  -1 <span className="text-[11px] opacity-80 ml-0.5 font-medium">크레딧</span>
                </span>
              </span>
            </div>

            <img src="/images/introcard/basicana_1.png" />
          </div>
        </div>

        {/* 시작 버튼: handleDailyStartClick 연결 */}
        <button
          onClick={() => handleStartClick(onStart)} // 일일 운세용 함수 호출
          disabled={isDisabled && !isMainDone}
          className={classNames(
            'w-full  px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
            isDisabled
              ? DISABLED_STYLE
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-200 hover:-translate-y-1',
          )}
        >
          {loading ? '기운 분석 중...' : '오늘의 운세 확인하기'}

          {isMainDone ? (
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
            크레딧이 부족합니다.
          </p>
        ) : (
          <p className="mt-4 text-[11px] text-slate-400">
            이미 분석된 운세는 크래딧을 재소모하지 않습니다.
          </p>
        )}
      </div>
    );
  };

  return (
    <AnalysisStepContainer
      guideContent={sajuGuide}
      loadingContent={<SajuLoading />}
      resultComponent={() => <SajuResult aiResult={aiResult} />}
      loadingTime={0}
    />
  );
}
