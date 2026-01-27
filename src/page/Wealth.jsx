// 1. React Core
import { useEffect, useState } from 'react';

// 2. External Libraries (Firebase, Icons)
import { doc, setDoc, increment } from 'firebase/firestore';
import { ref, get, child } from 'firebase/database';
import { database } from '../lib/firebase';
import {
  CircleStackIcon, // 평생 재물 (동전 쌓임)
  CalendarDaysIcon, // 시기/타이밍
  PresentationChartLineIcon, // 투자/주식 차트
  BriefcaseIcon, // 사업/가방
  SparklesIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { LinkIcon, UserIcon, TicketIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

// 3. Internal Config, Libs, Utils, API
import { db } from '../lib/firebase';
import { fetchGeminiAnalysis } from '../api/gemini';
import { getEng } from '../utils/helpers';
import { UI_TEXT, langPrompt, hanja } from '../data/constants';
import StartButton from '../component/StartButton';
// 4. Contexts
import { useAuthContext } from '../context/useAuthContext';
import { useLanguage } from '../context/useLanguageContext';
import { useUsageLimit } from '../context/useUsageLimit';

// 5. Custom Hooks
import { useConsumeEnergy } from '../hooks/useConsumingEnergy';
import { useSajuCalculator } from '../hooks/useSajuCalculator';

// 6. UI Components
import Step from '../ui/Step';
import ModifyBd from '../ui/ModifyBd';
import EnergyBadge from '../ui/EnergyBadge';
import LoadingBar from '../ui/LoadingBar';
import { SajuAnalysisService, AnalysisPresets } from '../service/SajuAnalysisService';
import { parseAiResponse } from '../utils/helpers';
import WealthAppeal from './WealthAppeal';
export default function Wealth({}) {
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  const [aiResult, setAiResult] = useState();
  const Q_TYPES = [
    {
      id: 'capacity',
      label: '평생 재물운',
      sub: 'Lifetime Wealth',
      desc: '타고난 그릇의 크기와 부자 사주 분석',
      descEn: 'Analysis of innate wealth capacity and potential',
      icon: CircleStackIcon,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      activeBorder: 'border-amber-500 ring-amber-200',
    },
    {
      id: 'timing',
      label: '올해/내년 흐름',
      sub: 'Yearly Flow',
      desc: '단기적인 자금 흐름과 승부수 타이밍',
      descEn: 'Short-term cash flow and strategic timing',
      icon: CalendarDaysIcon,
      color: 'text-sky-500',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      activeBorder: 'border-sky-500 ring-sky-200',
    },
    {
      id: 'investment',
      label: '투자 / 재테크',
      sub: 'Investment',
      desc: '주식, 코인, 부동산 등 투기 적합성',
      descEn: 'Suitability for stocks, crypto, and real estate',
      icon: PresentationChartLineIcon,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      activeBorder: 'border-rose-500 ring-rose-200',
    },
    {
      id: 'business',
      label: '사업 / 창업운',
      sub: 'Business',
      desc: '내 사업을 해도 되는지, 동업이 좋은지',
      descEn: 'Entrepreneurial potential and partnership luck',
      icon: BriefcaseIcon,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      activeBorder: 'border-emerald-500 ring-emerald-200',
    },
  ];
  const SUB_Q_TYPES = {
    // 1. 평생 재물운
    capacity: [
      {
        id: 'scale',
        label: '나의 타고난 부의 그릇은?',
        labelEn: 'My innate wealth capacity?',
        desc: '얼마나 벌 수 있는지, 언제 부자가 되는지',
        descEn: 'Potential wealth volume and timing of financial success.',
        prompt: 'Focus on the total volume of wealth and the peak period of life.',
      },
      {
        id: 'style',
        label: '월급 관리형 vs 사업 투자형',
        labelEn: 'Salary Manager vs. Business Investor',
        desc: '안정적인 직장이 맞는지, 내 일이 맞는지',
        descEn: 'Suitability for a stable career vs. running your own business.',
        prompt: 'Analyze whether a stable salary or business income suits this person better.',
      },
      {
        id: 'leak',
        label: '돈이 모이지 않고 새는 이유',
        labelEn: "Why money leaks and doesn't accumulate",
        desc: '재물 창고(재고)와 소비 성향 분석',
        descEn: 'Analysis of wealth retention capacity and spending habits.',
        prompt:
          "겁재의 탈재 기운이나 식상 과다로 인한 감정적 소비를 짚어주고 보완책 제시. Perform a deep dive into the 'Wealth Accumulation' potential of this chart. Identify the 'Hole' where money leaks out (e.g., Gyeop-jae interference or lack of an Earth-element storage). Then, suggest the most effective wealth-keeping strategy (e.g., utilizing 'In-seong' for patience or 'Gwan-seong' for strict budgeting) tailored to this specific elemental balance.",
      },
    ],

    // 2. 올해/내년 흐름
    timing: [
      {
        id: 'now',
        label: '당장 이번 달과 다음 달 운세',
        labelEn: 'Luck for this and next month',
        desc: '단기적인 자금 융통과 흐름',
        descEn: 'Short-term cash flow and liquidity analysis.',
        prompt: '월운의 합충을 분석하여 당장 60일 이내의 현금 흐름과 유의할 날짜 특정. Analyze the financial flow for the current month and the next month specifically.',
      },
      {
        id: 'next_year',
        label: '다가오는 2026년 재물운',
        labelEn: 'Financial luck for 2026',
        desc: '내년의 전체적인 총운과 승부처',
        descEn: 'Overall fortune and key opportunities for the upcoming year.',
        prompt: '병오년의 화(Fire) 기운이 본인의 일간과 만드는 상호작용을 통한 연간 자산 흐름 분석. Predict the overall financial fortune and key opportunities for the year 2026.',
      },
      {
        id: 'caution',
        label: '언제 조심해야 할까요? (손재수)',
        labelEn: 'When to be cautious (Financial Loss)',
        desc: '돈이 나가는 시기와 피해야 할 행동',
        descEn: 'Periods of financial loss and actions to avoid.',
        prompt: ' 형, 충이 들어오는 달을 정확히 명시하고 계약이나 큰 지출을 피해야 할 이유 설명. Identify months or periods with high risk of financial loss (Son-jae-su).',
      },
    ],

    // 3. 투자 / 재테크
    investment: [
      {
        id: 'aggressive',
        label: '주식 / 코인 (공격적 투자)',
        labelEn: 'Stocks / Crypto (Aggressive)',
        desc: '변동성이 큰 시장에서의 승률',
        descEn: 'Success rate in high-volatility markets.',
        prompt: '편재와 식신의 생재 능력을 분석하여 변동성 자산 투자 적합도와 진입 시점 제안. Analyze suitability for high-risk, high-return investments like stocks or crypto.',
      },
      {
        id: 'real_estate',
        label: '부동산 / 청약 (문서운)',
        labelEn: 'Real Estate (Document Luck)',
        desc: '집을 사도 되는지, 이사 운이 있는지',
        descEn: 'Buying property and luck regarding moving.',
        prompt: '인성(문서) 기운이 관성(권위)과 만나는 시기를 분석하여 실거주 및 투자 목적의 취득운 분석. Analyze luck related to real estate, property documents, and moving.',
      },
      {
        id: 'safe',
        label: '예적금 / 안전 자산',
        labelEn: 'Savings / Safe Assets',
        desc: '지키는 것이 중요한 시기인지 확인',
        descEn: 'Check if asset protection is prioritized over investment.',
        prompt: '사주상 금(Metal)이나 토(Earth)의 보존 능력을 확인하여 자산을 지키는 방식 제안.Check if conservative asset management (savings) is better than investing now.',
      },
    ],

    // 4. 사업 / 창업운
    business: [
      {
        id: 'startup',
        label: '내 사업을 시작해도 될까요?',
        labelEn: 'Should I start a business?',
        desc: '창업 시기와 성공 가능성',
        descEn: 'Optimal timing for starting up and success potential.',
        prompt: '독립적 의지(비겁)와 실행력(식상)이 대운과 맞물리는지 분석하여 창업 시기 결정. Analyze the timing and potential success for starting a new business.',
      },
      {
        id: 'partnership',
        label: '동업 vs 독자 생존',
        labelEn: 'Partnership vs. Solo',
        desc: '누구와 함께하는 게 좋은지, 혼자가 좋은지',
        descEn: 'Pros and cons of partnership vs. going solo.',
        prompt: '타인과의 에너지 분배(비겁의 희기)를 분석하여 협력 구조와 지분 분할에 대한 명확한 가이드. Analyze whether partnership is beneficial or if they should work alone.',
      },
      {
        id: 'item',
        label: '나에게 맞는 업종/아이템',
        labelEn: 'Suitable Industry/Item',
        desc: '물장사, 금속, 교육 등 오행 기반 추천',
        descEn: 'Industry recommendations based on your Five Elements.',
        prompt:
          '오행 물상을 현대적 유망 산업(핀테크, 플랫폼, 콘텐츠 등) 중 가장 강한 기운 1~2개로 매핑. Recommend suitable business industries based on their favorable elements (Yong-sin).',
      },
    ],
  };
  const t = (char) => (language === 'en' ? getEng(char) : char);
  const { language } = useLanguage();
  const { user, userData } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = userData || {};

  const { MAX_EDIT_COUNT, isLocked, setEditCount, editCount } = useUsageLimit();

  // --- States ---
  const [step, setStep] = useState(0);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);
  const totalStep = 4;
  const [selectedQ, setSelectedQ] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSubQ, setSelectedSubQ] = useState(null);
  const [isCachedLoading, setIsCachedLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  // 상대방 정보 State
  const [gender2, setGender2] = useState('male');
  const [isTimeUnknown2, setIsTimeUnkown2] = useState(false);
  const [isSaved2, setIsSaved] = useState(false);
  const wealthEnergy2 = useConsumeEnergy();
  const [inputDate2, setInputDate2] = useState(() => {
    try {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    } catch (e) {
      return '2024-01-01T00:00';
    }
  });
  const toConfirm = () => {
    setStep(3);
  };
  const saju2 = useSajuCalculator(inputDate2, isTimeUnknown2).saju;
  // --- 3. 로딩바 Effect ---
  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(
        () => {
          setProgress((prev) => {
            if (prev >= 99) return 99;
            return prev + (isCachedLoading ? 25 : 1);
          });
        },
        isCachedLoading ? 50 : 232,
      );
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading, isCachedLoading]);
  // 🟢 [초기화] 모달 열릴 때마다 Step 1로 리셋
  useEffect(() => {
    setStep(0);
    if (step === 0) {
      setAiResult('');
    }
  }, []);

  // --- Handlers ---
  const handleStartClick = () => {
    setStep(1);
  };
  // 뒤로가기
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Step 1 완료 (관계 선택) -> Step 2로 이동
  const handleQNext = () => {
    if (selectedQ) {
      setStep(2);
    }
    setAiResult('');
  };

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

  const handleWealthAnalysis = async () => {
    setAiResult('');
    try {
      await service.analyze(
        AnalysisPresets.wealth({
          saju,
          gender,
          q1,
          q2,
          qprompt,
          language,
        }),
      );
      setStep(4);
    } catch (error) {
      console.error(error);
    }
  };

  const SAJU_KEYS = ['sky3', 'grd3', 'sky2', 'grd2', 'sky1', 'grd1', 'sky0', 'grd0'];

  const checkSajuEqual = (source, target) => {
    if (!source || !target) return false;
    // 8개 키 중 하나라도 값이 다르면 false 리턴
    return SAJU_KEYS.every((key) => source[key] === target[key]);
  };
  const isAnalysisDone =
    userData?.usageHistory?.ZWealthAnalysis &&
    userData.usageHistory.ZWealthAnalysis.language === language &&
    userData.usageHistory.ZWealthAnalysis.gender === gender &&
    userData.usageHistory.ZWealthAnalysis.ques === selectedQ &&
    userData.usageHistory.ZWealthAnalysis.ques2 === selectedSubQ &&
    checkSajuEqual(userData.usageHistory.ZWealthAnalysis.saju, saju);

  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = (loading && !wealthEnergy2.isConsuming) || !user || loading;
  const isDisabled2 = !isAnalysisDone && isLocked;
  // const data = {
  //   header: {
  //     keywords: ['키워드1', '키워드2', '키워드3'],
  //     keywordSummary: '키워드들에 대한 요약 한문장',
  //     title: '제목',
  //     summary: '전체 요약',
  //   },
  //   contents: [
  //     //해당 주제에 대한 내용을 제목과 설명으로 세개 이상
  //     { title: '제목', desc: '설명. 세문장 이상' },
  //     { title: '제목', desc: '설명. 세문장 이상' },
  //     { title: '제목', desc: '설명. 세문장 이상' },
  //   ],
  //   conclusion: {
  //     title: '잘 되기 위한 조언 제목',
  //     desc: '잘 되기 위한 조언 내용. 두문장 이하',
  //   },
  //   tosaza: '사자에게 유도문구',
  // };

  const q1 = Q_TYPES.find((i) => i.id === selectedQ)?.desc;
  const q2 = SUB_Q_TYPES?.[selectedQ]?.find((i) => i.id === selectedSubQ)?.desc;
  const qprompt = SUB_Q_TYPES?.[selectedQ]?.find((i) => i.id === selectedSubQ)?.prompt;
  const [data, setData] = useState(null); // 파싱된 데이터를 담을 로컬 상태
  // [수정] 더 강력한 파싱 함수 및 에러 로그 추가

  useEffect(() => {
    if (aiResult) {
      const parsedData = parseAiResponse(aiResult);
      if (parsedData) {
        setData(parsedData); // 파싱 성공 시 데이터 세팅
      }
    }
  }, [aiResult]); // aiResult가 업데이트될 때마다 실행
  console.log(aiResult)
  return (
    <>
      {/* 상단 단계 표시바 (Stepper) */}
      {step > 0 && (
        <Step
          step={step}
          totalStep={totalStep}
          title={
            step === 1
              ? 'Question 1'
              : step === 2
                ? 'Question 2'
                : step === 3
                  ? 'Confirm Data'
                  : 'Analysis Result'
          }
          onBack={handleBack}
        />
      )}

      {/* ================================================= */}
      {/* 🟢 STEP 0: 인트로 화면 (추가된 부분) */}
      {/* 🟢 STEP 0: 인트로 화면 (Appeal 적용) */}
      {/* ================================================= */}
      {step === 0 && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="max-w-lg mx-auto text-center px-6 mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                {language === 'ko' ? '오행으로 읽는' : 'Reading the Five Elements'}
                <br />
                <span className="relative text-emerald-600 dark:text-emerald-500">
                  {language === 'ko' ? '평생 재물운 & 투자운' : 'Lifetime Wealth & Investment'}
                  <div className="absolute inset-0 bg-emerald-200/50 dark:bg-emerald-800/60 blur-md rounded-full scale-100"></div>
                </span>
              </h2>

              <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
                <p className="text-sm">
                  <strong>
                    {language === 'ko' ? '타고난 금전의 그릇' : 'Innate Wealth Capacity'}
                  </strong>
                  {language === 'ko' ? '과 ' : ' and '}
                  <strong>
                    {language === 'ko' ? '재물이 모이는 시기' : 'Strategic Financial Timing'}
                  </strong>
                  {language === 'ko' ? ', 당신의 재물 지도 분석.' : ', Analyzing your financial map.'}
                </p>

                {/* 이미지 경로 확인 필요 */}
                <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                  <img src="/images/introcard/wealth_1.webp" alt="wealth" className="w-full h-auto" />
                </div>
              </div>
            </div>

            <StartButton
              onClick={handleStartClick}
              disabled={loading}
              isDone={false}
              label={language === 'ko' ? '나의 재물운 분석하기' : 'Start Wealth Analysis'}
              color='emerald'
            />
          </div>

          <WealthAppeal />
        </div>
      )}
      {/* ================================================= */}
      {/* 🟢 STEP 1: 관계 선택 (Relationship) */}
      {/* ================================================= */}
      {step === 1 && (
        // const { language } = useLanguage(); // 상단에 선언되어 있어야 함

        <div className="w-full max-w-3xl mx-auto px-1 animate-fadeIn">
          <div className="flex flex-col gap-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {language === 'ko'
                  ? '어떤 재물운이 궁금하신가요?'
                  : 'What financial insight do you need?'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {language === 'ko'
                  ? '주제를 선택하면 그 주제로 당신의 사주를 정밀하게 분석해 드립니다.'
                  : 'Select a topic for a precise analysis based on your Saju.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Q_TYPES.map((type) => {
                const isSelected = selectedQ === type.id;
                const Icon = type.icon;

                // 3. 카드 내부 텍스트 변수 처리
                const labelText = language === 'en' ? type.sub : type.label; // 영어일 땐 sub(Lover) 사용
                const descText = language === 'en' ? type.descEn : type.desc; // 영어일 땐 descEn 사용

                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedQ(type.id)}
                    className={`
              relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-200 text-left group
              ${
                isSelected
                  ? `${type.activeBorder} ${type.bg} ring-4 ring-opacity-30`
                  : `border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-100 dark:hover:border-slate-600 hover:shadow-md`
              }
            `}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div
                        className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-700 ${isSelected ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}
                      >
                        <Icon className={`w-6 h-6 ${type.color}`} />
                      </div>

                      {isSelected && (
                        <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1.5 mb-0.5">
                        <span
                          className={`text-base font-bold ${isSelected ? 'text-slate-900 dark:text-slate-700' : 'text-slate-700 dark:text-slate-200'}`}
                        >
                          {labelText}
                        </span>

                        {language !== 'en' && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'opacity-70 dark:text-slate-600' : 'text-slate-400'}`}
                          >
                            {type.sub}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs ${isSelected ? 'text-slate-600 dark:text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}
                      >
                        {/* 설명 출력 */}
                        {descText}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                disabled={!selectedQ}
                onClick={handleQNext}
                className={`
          px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg
          ${
            selectedQ
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200 dark:shadow-none translate-y-0'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
          }
        `}
              >
                {/* 4. 버튼 텍스트 번역 */}
                {language === 'en' ? 'Next Step' : '다음 단계로 (Next)'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================================================= */}
      {/* 🟢 STEP 2: 정보 입력 
      {/* ================================================= */}

      {step === 2 && (
        <div className="w-full max-w-3xl mx-auto px-1 animate-fadeIn">
          <div className="flex flex-col gap-6">
            {/* 1. 헤더 섹션 */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {language === 'ko'
                  ? '구체적으로 무엇이 궁금한가요?'
                  : 'What specific details do you need?'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {language === 'ko'
                  ? '선택하신 주제에 맞춰 더 정밀하게 분석해 드립니다.'
                  : 'We will analyze in more detail based on your choice.'}
              </p>
            </div>

            {/* 2. 질문 그리드 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* selectedQ에 해당하는 하위 질문 리스트 가져오기 */}
              {(SUB_Q_TYPES[selectedQ] || []).map((sub) => {
                const isSelected = selectedSubQ === sub.id;

                // 텍스트 변수 처리
                const labelText = language === 'en' ? sub.labelEn : sub.label;
                const descText = language === 'en' ? sub.descEn : sub.desc;

                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubQ(sub.id)}
                    className={`
                relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-200 text-left group h-full
                ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500 ring-opacity-20'
                    : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-200 hover:shadow-md'
                }
              `}
                  >
                    {/* 선택 표시 아이콘 (우측 상단) */}
                    <div className="flex items-center justify-between w-full mb-3">
                      {/* 아이콘이 따로 없다면 체크 표시 등으로 대체 */}
                      <div
                        className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200
                    ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'}
                 `}
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* 텍스트 내용 */}
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <span
                          className={`text-lg font-bold block mb-1 ${
                            isSelected ? 'text-indigo-900' : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {labelText}
                        </span>
                        <p
                          className={`text-sm ${
                            isSelected ? 'text-indigo-700' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {descText}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 3. 하단 버튼 액션 (뒤로가기 / 분석하기) */}
            <div className="mt-6 flex justify-end">
              <></>
              {/* 분석 시작 버튼 */}
              <button
                disabled={!selectedSubQ || !!loading}
                onClick={toConfirm}
                className={`
            flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg
            ${
              selectedSubQ && !loading
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200 translate-y-0'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
            }
          `}
              >
                <SparklesIcon className="w-4 h-4" />
                {language === 'en' ? 'Next' : '다음'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================================================= */}
      {/* 🟢 STEP 3: 결과 화면 (Result) */}
      {/* ================================================= */}
      {step === 3 && (
        <div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
            {/* (1) 대분류 배지 (기존 코드 유지 및 스타일 통일) */}
            {(() => {
              const qData = Q_TYPES.find((r) => r.id === selectedQ);
              const RelIcon = qData?.icon || UserGroupIcon;
              const qLabel = language === 'en' ? qData?.sub : qData?.label;

              return (
                <div
                  className={`
                      relative flex items-center gap-3 px-5 py-3 rounded-2xl border-2 shadow-sm w-full sm:w-auto
                      ${qData?.bg || 'bg-slate-50'} 
                      ${qData?.border || 'border-slate-200'} 
                      dark:bg-slate-800 dark:border-slate-700
                    `}
                >
                  <div
                    className={`p-2 rounded-full bg-white dark:bg-slate-900 shadow-sm ${qData?.color || 'text-slate-400'}`}
                  >
                    <RelIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Topic
                    </span>
                    <span
                      className={`text-base sm:text-lg font-bold ${
                        qData?.color
                          ? qData.color.replace('text-', 'text-slate-700 dark:text-')
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {qLabel}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* 연결 화살표 (모바일: 아래, PC: 오른쪽) */}
            {selectedSubQ && (
              <div className="text-slate-300 dark:text-slate-600">
                <ArrowRightIcon className="w-6 h-6 hidden sm:block" />
                <ArrowDownIcon className="w-6 h-6 block sm:hidden" />
              </div>
            )}

            {/* (2) 소분류 배지 (새로 추가됨) */}
            {(() => {
              // 서브 질문 데이터 찾기
              const subList = SUB_Q_TYPES[selectedQ] || [];
              const subData = subList.find((r) => r.id === selectedSubQ);

              if (!subData) return null; // 선택된 게 없으면 안 보임

              const subLabel = language === 'en' ? subData.labelEn : subData.label;

              return (
                <div className="relative flex items-center gap-3 px-5 py-3 rounded-2xl border-2 border-indigo-100 bg-indigo-50 dark:bg-slate-800 dark:border-indigo-900 shadow-sm w-full sm:w-auto">
                  <div className="p-2 rounded-full bg-white dark:bg-slate-900 shadow-sm text-indigo-500">
                    <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                      Detail
                    </span>
                    <span className="text-base sm:text-lg font-bold text-indigo-900 dark:text-indigo-100">
                      {subLabel}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
          {/* 로딩 바 */}
          <div className="my-5 flex justify-center">
            {loading && (
              <LoadingBar
                progress={progress}
                loadingType={'wealth'}
                isCachedLoading={isCachedLoading}
              />
            )}
          </div>

          {/* 4. 최종 분석 버튼 */}
          <div className="flex justify-center">
            <button
              onClick={() => wealthEnergy2.triggerConsume(handleWealthAnalysis)}
              disabled={isDisabled || isDisabled2}
              className={classNames(
                'w-full sm:w-auto px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
                isDisabled
                  ? DISABLED_STYLE
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-200 hover:-translate-y-1',
              )}
            >
              <SparklesIcon className="w-5 h-5 animate-pulse" />
              <span>{language === 'en' ? 'Start Analysis' : '분석 시작하기'}</span>
              {!!isAnalysisDone ? (
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
          </div>
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
      )}
      {step === 4 && (
        <div className="w-full max-w-4xl mx-auto px-1 animate-fadeIn">
          {/* ================================================= */}
          {/* 1. 분석 요약 헤더 (Summary Header) */}
          {/* ================================================= */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-8 relative overflow-hidden">
            {/* 배경 데코레이션 */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

            <div className="flex flex-col gap-6">
              {/* ① 관계 배지 (Relationship Badge) */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Topic
                  </span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center">
                    {/* 1. 대주제 (Main Topic) */}
                    {(() => {
                      const r = Q_TYPES.find((t) => t.id === selectedQ);
                      if (!r) return selectedQ;
                      return language === 'en' ? r.sub : r.label;
                    })()}

                    {/* 2. 소주제 (Sub Topic) - 데이터가 있을 때만 표시 */}
                    {(() => {
                      const subList = SUB_Q_TYPES[selectedQ] || [];
                      const subData = subList.find((s) => s.id === selectedSubQ);

                      if (!subData) return null;

                      return (
                        <>
                          {/* 구분선 */}
                          <span className="mx-2 text-slate-300 dark:text-slate-500 font-normal">
                            /
                          </span>
                          {/* 소주제 텍스트 */}
                          <span className="text-indigo-600 dark:text-indigo-400">
                            {language === 'en' ? subData.labelEn : subData.label}
                          </span>
                        </>
                      );
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* 2. AI 분석 결과 본문 (AI Result) */}
          {/* ================================================= */}
          <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-indigo-50 dark:border-slate-700">
            {/* 테스트 */}
            <div className="bg-indigo-50/30 dark:bg-slate-800/50 rounded-2xl border border-indigo-100/50 dark:border-slate-700 p-5 sm:p-6 shadow-sm">
              {!!data && (
                <div className="flex flex-col gap-8 py-2 animate-up">
                  {/* 1. 상단: 점수 및 핵심 타이틀 */}
                  <section className="text-center">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1">
                      {data.header.title}
                    </h2>
                    <p className="text-sm text-indigo-500 font-semibold"> {data.header.summary}</p>
                  </section>

                  {/* 2. 분위기 요약 (얇은 구분선) */}
                  <section className="border-t border-slate-100 dark:border-slate-800 pt-6 text-center">
                    {data.header.keywordSummary}
                    <div className="flex flex-wrap justify-center gap-2">
                      {data.header.keywords.map((word, i) => (
                        <span key={i} className="text-[10px] font-medium text-slate-400">
                          #{word}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* 3. 에너지 분석 (나 vs 상대) - 색상 통일 */}
                  <section className="grid grid-cols-1gap-x-10 gap-y-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                    <div>
                      {data.contents.map((i) => (
                        <div key={i} className="mb-5">
                          <h4 className="font-sm font-black text-slate-600 uppercase tracking-widest mb-2">
                            {i.title}
                          </h4>
                          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            {i.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 6. 최종 결론 및 가이드 */}
                  <section className="border-t border-slate-100 dark:border-slate-800 pt-6 pb-4">
                    <h4 className="font-xs font-black text-indigo-500 uppercase tracking-widest mb-3 text-center">
                      Master's Conclusion
                    </h4>
                    <p className="text-[14px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed text-center max-w-md mx-auto mb-4">
                      {data.conclusion.title}
                    </p>
                    <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 text-center">
                      {data.conclusion.desc}
                    </p>
                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-900 text-center">
                      <span className="text-xs text-slate-800 font-bold italic">
                        {data.tosaza} 사자에게 물어보기를 이용해 보세요.
                      </span>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>

          {/* 하단 버튼 (다시하기 등) */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-slate-400 hover:text-indigo-500 underline underline-offset-4 transition-colors"
            >
              {language === 'en' ? 'Check Another Topic' : '다른 재물운 보기'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
