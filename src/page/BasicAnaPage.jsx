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
import { langPrompt, hanja } from '../data/constants';
import { getPillars } from '../utils/sajuCalculator';
import { fetchGeminiAnalysis } from '../api/gemini';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import SajuResult from '../component/SajuResult';
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
    `당신이 태어난 순간의 천기(天氣)를 종이 위에 정밀하게 옮기고 있습니다...`,
    `본질을 상징하는 '${pillars?.day || '일주'}'의 글자를 통해 당신의 타고난 성질을 읽어냅니다.`,
    `내면의 에너지를 관장하는 '${pillars?.month || '월지'}'의 계절감을 분석하여 기질의 온도를 측정합니다.`,
    `나무(${counts.wood}), 불(${counts.fire}), 흙(${counts.earth}), 금(${counts.metal}), 물(${counts.water}) — 다섯 기운의 과다와 결핍을 확인합니다.`,
    `가장 강한 기운인 '${primaryShinsal}'의 에너지가 당신의 성격 형성에 미친 영향력을 추적합니다.`,
    `겉으로 드러나는 사회적 모습과 내면에 감춰진 본능적인 욕구 사이의 균형점을 살핍니다.`,
    `당신이 타인에게 비치는 첫인상과 시간이 흐를수록 드러나는 진면목의 차이를 분석 중입니다.`,
    `사주 원국의 '${pillars?.year || '년주'}'에 새겨진 조상의 기운과 가문으로부터 이어진 성향을 훑습니다.`,
    `정신적 지향점을 보여주는 천간의 합과 현실적 행동 양식을 보여주는 지지의 충을 대조합니다.`,
    `인생 전체를 지배하는 10년 단위의 거대한 파동, '${currentDae}' 대운의 위치를 좌표 위에 찍습니다.`,
    `과거 대운에서 겪었을 심리적 변화의 궤적을 복기하며 현재의 기운과 연결하고 있습니다.`,
    `잠재된 재능을 깨우는 '${shinsalList.length > 1 ? shinsalList[1] : '특별한'}' 기운이 인생의 어느 시점에 개화할지 계산합니다.`,
    `당신의 성격이 인간관계와 사회적 성취에 어떤 방식으로 작용하는지 메커니즘을 파악합니다.`,
    `결핍된 오행을 채우기 위해 당신이 무의식적으로 추구해온 가치관과 행동 패턴을 분석 중입니다.`,
    `현재 대운 리스트에 기록된 10단계의 운명 궤적을 훑으며 장기적인 성장의 방향성을 잡습니다.`,
    `타고난 팔자의 한계를 넘어서는 '개운(開運)'의 실마리를 당신의 명식 안에서 찾고 있습니다.`,
    `논리적인 분석을 넘어 당신의 영혼이 가진 고유한 색깔과 울림을 문장으로 정리합니다.`,
    `인생의 파도 속에서도 변치 않을 당신만의 강력한 무기와 자산이 무엇인지 특정하고 있습니다.`,
    `복잡하게 얽힌 운명의 실타래에서 당신이라는 존재의 핵심 키워드를 도출합니다.`,
    `이제 사자가 기록한 당신의 본질과 평생의 흐름에 대한 종합 분석 보고서를 완성합니다.`,
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
    <div className="flex flex-col items-center px-6 overflow-hidden ">
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
      const data = userData.usageHistory || {};

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
          usageHistory: {
            ZApiAnalysis: {
              result: result, // 스테이트가 아닌 변수를 직접 저장
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
      <div className="max-w-lg mx-auto pt-10 text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* 상단 비주얼: 🔮 대신 오늘을 상징하는 해/달 또는 달력 이모지 */}
        <div>
          {/* 타이틀: 매일의 흐름을 강조 */}
          <h2 className=" text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
            오행으로 읽는
            <br />
            <span className=" relative text-sky-600 dark:text-sky-500">
              평생운세 & 10년 대운
              <div className="absolute inset-0 bg-sky-200/50 dark:bg-sky-800/60 blur-md rounded-full scale-100"></div>
            </span>
          </h2>
          {/* 설명문구: 줄줄이 쓰지 않고 핵심만 */}
          <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
            <p className="text-sm">
              <strong>타고난 운명</strong>과 <strong>10년마다 찾아오는 변화의 시기</strong>, 당신의
              운명 지도 분석.
            </p>
            <div>
              <CreditIcon num={-1} />
            </div>

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
          disabled={isDisabled && !isMainDone}
          className={classNames(
            'w-full  px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
            isDisabled
              ? DISABLED_STYLE
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-200 hover:-translate-y-1',
          )}
        >
          {loading ? '기운 분석 중...' : '평생 운세 보기'}

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
