import { useRef, useState, useEffect } from 'react';
import AnalysisStepContainer from '../component/AnalysisStepContainer';

import { useSajuCalculator } from '../hooks/useSajuCalculator';
import EnergyBadge from '../ui/EnergyBadge';
import { useAuthContext } from '../context/useAuthContext';
import { useUsageLimit } from '../context/useUsageLimit';
import { db } from '../lib/firebase';
import { setDoc, doc, increment } from 'firebase/firestore';
import { useLoading } from '../context/useLoadingContext';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import { classNames, getEng } from '../utils/helpers';
import { TicketIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { fetchGeminiAnalysis } from '../api/gemini';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import SajuResult from '../component/SajuResult';
import { calculateSajuData, createPromptForGemini } from '../utils/sajuLogic';
import LoadingFourPillar from '../component/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '../service/SajuAnalysisService';

// 2. 메인 페이지 컴포넌트
export default function BasicAnaPage() {
  const [sajuData, setSajuData] = useState(null);
  const { loading, setLoading, loadingType, setLoadingType, aiResult, setAiResult } = useLoading();
  const { userData, user, isMainDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender } = userData || {};
  const { saju, sajul } = useSajuCalculator(inputDate, isTimeUnknown);
  const { language } = useLanguage();
  // useUsageLimit에서 editCount와 setEditCount 가져오기
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading;
  const isDisabled2 = !isMainDone && isLocked;

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

  // const handleStartClick = async (onStart) => {
  //   // 1. 방어 로직
  //   if (!user) return alert(UI_TEXT.loginReq[language]);
  //   if (!userData?.birthDate) return alert(UI_TEXT.saveFirst[language]);

  //   setLoading(true);
  //   setLoadingType('main');
  //   setAiResult(''); // 기존 결과 초기화

  //   const todayDate = new Date().toLocaleDateString('en-CA');
  //   const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

  //   try {
  //     const data = userData.usageHistory || {};

  //     // 2. 캐시 체크 (기존 로직 유지)
  //     if (data.ZApiAnalysis) {
  //       const {
  //         language: savedLang,
  //         saju: savedSaju,
  //         gender: savedGender,
  //         result: savedResult,
  //       } = data.ZApiAnalysis;

  //       const isLangMatch = savedLang === language;
  //       const isGenderMatch = savedGender === gender;
  //       const isSajuMatch = savedSaju && keys.every((k) => savedSaju[k] === saju[k]);

  //       if (isLangMatch && isGenderMatch && isSajuMatch && savedResult) {
  //         setAiResult(savedResult);
  //         setLoading(false);
  //         setLoadingType(null);
  //         onStart(); // 저장된 결과가 있으면 즉시 이동
  //         return;
  //       }
  //     }

  //     // 3. 한도 체크
  //     const currentCount = data.editCount || 0;
  //     if (currentCount >= MAX_EDIT_COUNT) {
  //       setLoading(false);
  //       return alert(UI_TEXT.limitReached[language]);
  //     }
  //     let result;
  //     // 4. API 호출 및 결과 확보 (핵심: 변수 'result'에 직접 할당)
  //     try {
  //       // 1. await를 사용하여 DB에서 프롬프트를 다 가져올 때까지 기다립니다.
  //       const prompt = await createPromptForGemini(sajuData, language);

  //       // 2. 만약 DB에서 가져온 값이 없으면 여기서 중단시켜야 Gemini 에러가 안 납니다.
  //       if (!prompt) {
  //         alert('데이터베이스에서 프롬프트를 불러오지 못했습니다.');
  //         return;
  //       }

  //       // 3. 이제 정상적인 문자열 프롬프트를 Gemini에게 보냅니다.
  //       result = await fetchGeminiAnalysis(prompt);
  //       // ... 성공 로직
  //     } catch (error) {
  //       console.error('발생한 에러:', error);
  //     }

  //     // 5. DB 업데이트 (aiAnalysis 스테이트 대신, 방금 받은 따끈따끈한 'result' 변수 사용)
    
  //     await setDoc(
  //       doc(db, 'users', user.uid),
  //       {
  //         saju: saju,
  //         editCount: increment(1),
  //         lastEditDate: todayDate,
  //         usageHistory: {
  //           ZApiAnalysis: {
  //             result: result, // 스테이트가 아닌 변수를 직접 저장
  //             date: todayDate,
  //             saju: saju,
  //             language: language,
  //             gender: gender,
  //           },
  //         },

  //         dailyUsage: {
  //           [todayDate]: increment(1),
  //         },
  //       },
  //       { merge: true },
  //     );

  //     // 6. 상태 반영 및 화면 전환
  //     setEditCount((prev) => prev + 1);
  //     setAiAnalysis(result); // UI용 스테이트 업데이트
  //     setAiResult(result); // SajuResult로 전달될 결과값 설정

  //     console.log('분석 완료 데이터:'); // 확인용
  //     onStart(); // 이제 안전하게 다음 스테이지로 이동
  //   } catch (e) {
  //     console.error('발생한 에러:', e);
  //     alert(`분석 중 오류가 발생했습니다: ${e.message}`);
  //   } finally {
  //     setLoading(false);
  //     setLoadingType(null);
  //   }
  // };
   const service = new SajuAnalysisService({
     user,
     userData,
     language,
     maxEditCount: MAX_EDIT_COUNT,
     uiText: UI_TEXT,
     setEditCount,
     setLoading,
     setAiResult,
   });

   const handleStartClick = async (onstart) => {
     setAiResult('');
     try {
       const sajuData = calculateSajuData(
         inputDate, // inputDate
        gender, // inputGender
         isTimeUnknown,
         language, // language
       );

       if (!sajuData) {
        console.log('no data')
         return;
       }


       console.log(sajuData);
       await service.analyze(
         AnalysisPresets.basic(
           { saju, gender, language },
           sajuData,
         ),
         (result) => {
           console.log('✅ 평생운세 완료!', 'success');
           console.log(`결과 길이: ${result?.length || 0}자`, 'info');
         },
       );
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
            {language === 'ko' ? '오행으로 읽는' : 'Reading the Five Elements'}
            <br />
            <span className=" relative text-sky-600 dark:text-sky-500">
              {language === 'ko' ? '평생운세 & 10년 대운' : 'Saju Analysis'}
              <div className="absolute inset-0 bg-sky-200/50 dark:bg-sky-800/60 blur-md rounded-full scale-100"></div>
            </span>
          </h2>
          {/* 설명문구: 줄줄이 쓰지 않고 핵심만 */}
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
                src="/images/introcard/basicana_1.png"
                alt="saju analysis"
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
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-200 hover:-translate-y-1',
          )}
        >
          {language === 'ko' ? '평생 운세 보기' : 'Anaysis Saju'}

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
    // 1. aiResult가 존재하고, 내용이 비어있지 않을 때만 실행 (안전장치)
    if (aiResult && typeof aiResult === 'string' && aiResult.length > 0) {
      // 2. 브라우저 렌더링이 완전히 끝난 뒤에 실행되도록 0ms 타임아웃 부여
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [aiResult]); // aiResult 데이터가 들어오는 순간만 감지
  // 추가: 로딩이 시작될 때도 상단으로f 올리고 싶다면 (선택 사항)
  useEffect(() => {
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);

  return (
    <AnalysisStepContainer
      guideContent={sajuGuide}
      loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />}
      resultComponent={() => <SajuResult aiResult={aiResult} />}
      loadingTime={0}
    />
  );
}
