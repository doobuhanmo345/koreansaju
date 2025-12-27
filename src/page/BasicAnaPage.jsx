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
import { pillarStyle } from '../data/style';

// 1. 로딩 컴포넌트

function SajuLoading({ sajuData }) {
  const [displayedTexts, setDisplayedTexts] = useState([]);
  // 데이터 추출 최적화
  const pillars = sajuData?.pillars;
  const currentDaewoon = sajuData?.currentDaewoon?.name;
  const shinsal = sajuData?.myShinsal?.[0]?.name;
  const age = sajuData?.currentAge;
  const counts = sajuData?.ohaengCount; // 오행 개수
  const maxOhaeng = sajuData?.maxOhaeng?.[0]; // 가장 강한 기운

  const loadingTexts = [
    `먼저 ${pillars?.year || '태어난 해'}의 기운을 종이에 옮깁니다...`,
    `${pillars?.month || '태어난 달'}의 계절적 흐름을 살피는 중입니다.`,
    `당신의 본질인 ${pillars?.day || '태어난 날'}의 에너지를 기록합니다.`,
    `${pillars?.time || '태어난 시'}를 더해 사주 팔자의 형상을 완성합니다.`,
    `오행 중 ${maxOhaeng || '특정'}의 기운이 강하게 나타나고 있군요.`,
    `나무(${counts?.wood}), 불(${counts?.fire}), 흙(${counts?.earth}), 금(${counts?.metal}), 물(${counts?.water})의 배합을 확인합니다.`,
    `천간의 네 글자가 하늘의 뜻을 어떻게 전하는지 읽어내는 중입니다.`,
    `지지의 네 글자가 땅의 형상으로 어떻게 뿌리내렸는지 분석합니다.`,
    `현재 ${currentDaewoon || '운명'} 대운의 거대한 흐름 속에 계시는군요.`,
    `당신에게 깃든 ${shinsal || '특별한'} 기운의 깊은 의미를 풀이합니다.`,
    `인생의 변곡점이 될 합(合)과 충(沖)의 작용을 세밀히 검토 중입니다.`,
    `음양의 균형이 당신의 삶에 어떤 조화를 이루는지 살피고 있습니다.`,
    `${age || '현재'}세, 지금 이 순간 당신의 위치를 운명의 지도 위에 그립니다.`,
    `앞으로 다가올 변화의 파동을 하나하나 문장으로 정리하고 있습니다.`,
    `이제 당신만을 위한 운명 보고서의 마지막 마침표를 찍습니다.`,
  ];

  useEffect(() => {
    if (sajuData) {
      setDisplayedTexts([loadingTexts[0]]);
      let currentIndex = 1;

      // 15문장 x 2.5초 간격 = 약 37.5초 (취향에 따라 3000ms~4000ms로 조절하세요)
      const interval = setInterval(() => {
        if (currentIndex < loadingTexts.length) {
          setDisplayedTexts((prev) => [...prev, loadingTexts[currentIndex]]);
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [sajuData]);
  return (
    <div className="flex flex-col items-center px-6 overflow-hidden min-h-screen">
      <svg className="absolute w-0 h-0">
        <filter id="paper-edge">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
        </filter>
      </svg>

      <div className="relative w-full max-w-lg animate-in fade-in duration-1000">
        <div
          className="mt-1 relative z-10 bg-[#fffef5] dark:bg-slate-900 shadow-2xl p-6 md:p-14 border border-stone-200/50 dark:border-slate-800 transition-all duration-500"
          style={{ filter: 'url(#paper-edge)' }}
        >
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[linear-gradient(transparent_31px,#5d4037_32px)] bg-[length:100%_32px]"></div>

          <div className="relative z-10">
            <div className="flex flex-col items-center mb-6 opacity-40">
              <div className="w-10 h-[1px] bg-stone-500 mb-2"></div>
              <span className="text-[10px] tracking-[0.4em] uppercase text-stone-600 font-serif font-bold">
                Heavenly Record
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {displayedTexts.map((text, idx) => (
                <div key={idx} className="relative h-8 flex items-center">
                  <p className="font-handwriting text-lg md:text-xl text-slate-800 dark:text-slate-200 leading-none break-keep animate-writing-ink-slow">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[98%] h-12 bg-stone-800/20 blur-3xl rounded-[100%]"></div>
      </div>

      <div className="mt-14 text-center">
        <p className="text-stone-500 dark:text-slate-400 text-xs tracking-[0.2em] animate-pulse font-serif italic">
          사자가 당신의 운명을 기록하고 있어요. 조금만 기다려 주세요.
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap');
        
        .font-handwriting {
          font-family: 'Nanum Pen Script', cursive;
        }

        /* 2. 한 문장이 써지는 속도 자체를 3초로 늦춤 */
        .animate-writing-ink-slow {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          mask-image: linear-gradient(to right, black 100%, transparent 100%);
          mask-size: 200% 100%;
          mask-position: 100% 0;
          animation: writing-ink 3s ease-in-out forwards; 
        }

        @keyframes writing-ink {
          0% { width: 0; mask-position: 100% 0; opacity: 0; filter: blur(2px); transform: translateY(1px); }
          20% { opacity: 1; filter: blur(1px); }
          100% { width: 100%; mask-position: 0% 0; opacity: 1; filter: blur(0); transform: translateY(0); }
        }
      `}</style>
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
          saju: saju,
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
      return <SajuLoading sajuData={sajuData} />;
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
      resultComponent={() => <SajuResult aiResult={aiResult} />}
      loadingTime={0}
    />
  );
}
