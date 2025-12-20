// 1. React Core
import { useEffect, useState } from 'react';

// 2. External Libraries (Firebase, Icons)
import { doc, setDoc } from 'firebase/firestore';

import {
  CircleStackIcon, // 평생 재물 (동전 쌓임)
  CalendarDaysIcon, // 시기/타이밍
  PresentationChartLineIcon, // 투자/주식 차트
  BriefcaseIcon, // 사업/가방
  SparklesIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { LinkIcon, UserIcon } from '@heroicons/react/24/solid';

// 3. Internal Config, Libs, Utils, API
import { db } from '../lib/firebase';
import { fetchGeminiAnalysis } from '../api/gemini';
import { getEng } from '../utils/helpers';
import { UI_TEXT, langPrompt, hanja } from '../data/constants';

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
export default function Wealth({
  saju,
  inputDate,
  gender,
  isTimeUnknown,
  isOpen,
  aiResult,
  setAiResult,
}) {
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }
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
        prompt: 'Analyze financial leakage (Gyeop-jae) and spending habits.',
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
        prompt: 'Analyze the financial flow for the current month and the next month specifically.',
      },
      {
        id: 'next_year',
        label: '다가오는 2026년 재물운',
        labelEn: 'Financial luck for 2026',
        desc: '내년의 전체적인 총운과 승부처',
        descEn: 'Overall fortune and key opportunities for the upcoming year.',
        prompt: 'Predict the overall financial fortune and key opportunities for the year 2026.',
      },
      {
        id: 'caution',
        label: '언제 조심해야 할까요? (손재수)',
        labelEn: 'When to be cautious (Financial Loss)',
        desc: '돈이 나가는 시기와 피해야 할 행동',
        descEn: 'Periods of financial loss and actions to avoid.',
        prompt: 'Identify months or periods with high risk of financial loss (Son-jae-su).',
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
        prompt: 'Analyze suitability for high-risk, high-return investments like stocks or crypto.',
      },
      {
        id: 'real_estate',
        label: '부동산 / 청약 (문서운)',
        labelEn: 'Real Estate (Document Luck)',
        desc: '집을 사도 되는지, 이사 운이 있는지',
        descEn: 'Buying property and luck regarding moving.',
        prompt: 'Analyze luck related to real estate, property documents, and moving.',
      },
      {
        id: 'safe',
        label: '예적금 / 안전 자산',
        labelEn: 'Savings / Safe Assets',
        desc: '지키는 것이 중요한 시기인지 확인',
        descEn: 'Check if asset protection is prioritized over investment.',
        prompt: 'Check if conservative asset management (savings) is better than investing now.',
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
        prompt: 'Analyze the timing and potential success for starting a new business.',
      },
      {
        id: 'partnership',
        label: '동업 vs 독자 생존',
        labelEn: 'Partnership vs. Solo',
        desc: '누구와 함께하는 게 좋은지, 혼자가 좋은지',
        descEn: 'Pros and cons of partnership vs. going solo.',
        prompt: 'Analyze whether partnership is beneficial or if they should work alone.',
      },
      {
        id: 'item',
        label: '나에게 맞는 업종/아이템',
        labelEn: 'Suitable Industry/Item',
        desc: '물장사, 금속, 교육 등 오행 기반 추천',
        descEn: 'Industry recommendations based on your Five Elements.',
        prompt:
          'Recommend suitable business industries based on their favorable elements (Yong-sin).',
      },
    ],
  };
  const t = (char) => (language === 'en' ? getEng(char) : char);
  const { language } = useLanguage();
  const { user, userData } = useAuthContext();
  const { MAX_EDIT_COUNT, MAX_LIMIT, isLocked } = useUsageLimit();

  // --- States ---
  const [step, setStep] = useState(1);
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
    setStep(1);
    if (step === 1) {
      setAiResult('');
    }
  }, []);

  // --- Handlers ---

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

  const handleWealthAnalysis = async () => {
    // 1. 유효성 검사
    if (!user) return alert(UI_TEXT.loginReq[language]);

    setLoading(true);
    setAiResult('');

    // ✅ [핵심] 비교할 사주 팔자의 키값 8개 (순서 상관없이 값만 비교하기 위함)
    const SAJU_KEYS = ['sky3', 'grd3', 'sky2', 'grd2', 'sky1', 'grd1', 'sky0', 'grd0'];

    // ✅ [비교 함수] 두 사주 객체의 8글자 값이 정확히 일치하는지 확인
    const checkSajuEqual = (source, target) => {
      if (!source || !target) return false;
      // 8개 키 중 하나라도 값이 다르면 false 리턴
      return SAJU_KEYS.every((key) => source[key] === target[key]);
    };

    try {
      const data = userData || {};
      const currentCount = data.editCount || 0;

      // ---------------------------------------------------------
      // 2. 캐시 체크 (사주 글자 정밀 비교)
      // ---------------------------------------------------------

      if (data.ZWealthAnalysis) {
        const saved = data.ZWealthAnalysis;

        // 1) 기본 정보 비교 (언어, 관계, 성별)
        const isBasicMatch =
          saved.language === language &&
          saved.ques === selectedQ &&
          saved.ques2 === selectedSubQ &&
          saved.gender === gender;

        // 2) ★ 사주 글 비교 (saju & saju2)
        // inputDate가 달라도, 사주 8글자가 같으면 캐시를 사용함 (사용자 요청 사항)
        const isMySajuMatch = checkSajuEqual(saved.saju, saju);
        if (isBasicMatch && isMySajuMatch && saved.result) {
          setAiResult(saved.result);
          setLoading(false);
          setStep(4);
          // 필요한 경우 결과창 이동

          return;
        }
      }

      // ---------------------------------------------------------
      // 3. API 호출 (사주 글자가 달라졌을 때)
      // ---------------------------------------------------------
      console.log('🚀 사주 글자가 변경되었습니다. API를 호출합니다.');
      if (currentCount >= MAX_EDIT_COUNT) {
        setLoading(false);
        return alert(UI_TEXT.limitReached[language]);
      }
      if (currentCount >= MAX_LIMIT) {
        setLoading(false);
        return alert(UI_TEXT.limitReached[language]);
      }

      const mySajuStr = JSON.stringify(saju);

      const qLabel = Q_TYPES.find((r) => r.id === selectedQ)?.label || 'General Wealth';

      // 💡 [수정됨] 역할 부여를 재물운 전문가로 변경
      const strictPrompt =
        'You are a professional Saju consultant specializing in Wealth and Financial Career analysis.';

      // 💡 [수정됨] 재물운 전용 프롬프트
      const fullPrompt = `
        ${strictPrompt}
        
        Analyze the **Financial Destiny (Wealth Luck)** for this person based on the Saju (Four Pillars of Destiny) chart provided below.

        [Input Data]
        - Question Type: "${qLabel}", "${SUB_Q_TYPES[selectedQ]?.find((i) => i.id === selectedSubQ).prompt}"
        - Gender: ${gender}
        - Saju Chart: ${mySajuStr}
        (Key Structure: sky3/grd3=Year(Ancestors), sky2/grd2=Month(Career/Society), sky1/grd1=Day(Me), sky0/grd0=Hour(Children/Result))

### 🚫 Critical Style Rules (절대적 서식 규칙)
이 규칙들은 답변의 내용보다 우선순위가 높으며, 반드시 지켜야 합니다.
1. **[Plain Text Only]**: 볼드(**), 이탤릭(*), 리스트 기호 등 어떠한 마크다운(Markdown) 강조 문법도 절대 사용하지 마십시오. 오직 순수한 텍스트와 줄바꿈(Enter)만 사용하세요.
2. **[No Hanja]**: 한자(Chinese characters)는 절대 출력하지 마십시오. (예: '甲' -> 제거 혹은 '갑목'으로 표기)

### 🗣️ Language & Terminology Guidelines
1. **용어 순화 (Translation Layer)**
   - 전문 용어(식신, 상관, 재성, 비겁, 관성 등)를 절대 직접 언급하지 마십시오.
   - 대신 이를 일상 용어로 풀어서 설명하세요.
     - (예: 재성 -> 재물운, 결실 / 관성 -> 직장운, 명예 / 식상 -> 표현력, 손재주)
2. **언어별 규칙**
   - **한국어 답변 시:** 모든 한자는 삭제하고 순수 한글로만 작성하세요.
   - **영어 답변 시:**
     - 사주 용어를 그대로 영문 음차(Pyeon-gwan)하지 말고 의미를 번역(Pressure, Challenge)하세요.
     - 'Year/Month/Day/Time Pillar'라는 단어 대신 'Year/Month/Day/Time Energy' 또는 'Your born characteristics' 등으로 표현하세요. 'Pillar' 단어 사용을 금지합니다.

        [Analysis Requirements]
        1. "${qLabel}", "${SUB_Q_TYPES[selectedQ]?.find((i) => i.id === selectedSubQ).prompt}" 에 정확히 부합하는 해석
2. 사용자가 이해하기 힘든 복잡한 이론적 배경(신강/신약 계산 과정 등)은 생략하세요.

        ${langPrompt(language)}
        ${hanja(language)}
        
        Write in a professional, insightful, and encouraging tone. Use Markdown for clarity.
      `;

      console.log(fullPrompt);

      const result = await fetchGeminiAnalysis(fullPrompt);

      const newCount = currentCount + 1;

      // ---------------------------------------------------------
      // 4. 저장 (현재의 saju와 saju2를 저장해야 다음 비교 가능)
      // ---------------------------------------------------------
      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: newCount,
          lastEditDate: new Date().toLocaleDateString('en-CA'),
          dailyUsage: {
            [new Date().toLocaleDateString('en-CA')]: newCount,
          },
          ZWealthAnalysis: {
            result: result,
            // ★ 비교 기준이 되는 사주 데이터 저장
            saju: saju,
            gender: gender,
            ques: selectedQ,
            ques2: selectedSubQ,
            language: language,

            // 참고용 날짜 정보 (비교엔 안 씀)
            inputDate: inputDate,
            date: new Date().toISOString(),
          },
        },
        { merge: true },
      );

      setAiResult(result);
      setStep(4); // 필요시 이동
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = (loading && !wealthEnergy2.isConsuming) || !user || loading;
  const SAJU_KEYS = ['sky3', 'grd3', 'sky2', 'grd2', 'sky1', 'grd1', 'sky0', 'grd0'];

  const checkSajuEqual = (source, target) => {
    if (!source || !target) return false;
    // 8개 키 중 하나라도 값이 다르면 false 리턴
    return SAJU_KEYS.every((key) => source[key] === target[key]);
  };
  const isAnalysisDone =
    userData?.ZWealthAnalysis &&
    userData.ZWealthAnalysis.language === language &&
    userData.ZWealthAnalysis.gender === gender &&
    userData.ZWealthAnalysis.ques === selectedQ &&
    userData.ZWealthAnalysis.ques2 === selectedSubQ &&
    checkSajuEqual(userData.ZWealthAnalysis.saju, saju);

  return (
    <>
      {/* 상단 단계 표시바 (Stepper) */}
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
                          className={`text-base font-bold ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-200'}`}
                        >
                          {labelText}
                        </span>

                        {language !== 'en' && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'opacity-70' : 'text-slate-400'}`}
                          >
                            {type.sub}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs ${isSelected ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}
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
      {/* 🟢 STEP 2: 정보 입력 (나 & 상대방) */}
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
                disabled={!selectedSubQ || loading}
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
              disabled={loading && !wealthEnergy2.isConsuming}
              className={classNames(
                'w-full sm:w-auto px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
                isDisabled
                  ? DISABLED_STYLE
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-200 hover:-translate-y-1',
              )}
            >
              <SparklesIcon className="w-5 h-5 animate-pulse" />
              <span>{language === 'en' ? 'Start Analysis' : '분석 시작하기'}</span>

              {!isAnalysisDone && !user && (
                <div className="mt-1 relative z-10">
                  <LockClosedIcon className="w-4 h-4 text-amber-500" />
                </div>
              )}

              {!isAnalysisDone && !!user && (
                <div className="mt-1 relative w-10">
                  <EnergyBadge
                    active={user}
                    consuming={wealthEnergy2.isConsuming}
                    loading={loading && !wealthEnergy2.isConsuming}
                    cost={-1}
                  />
                </div>
              )}

              {isAnalysisDone && !loading && (
                <div
                  className={classNames(
                    'mt-1 flex items-center gap-1 backdrop-blur-sm px-2 py-0.5 rounded-full border shadow-sm relative z-10',
                    isLocked
                      ? 'border-gray-500/50 bg-gray-400/40' // 잠겼을 때
                      : 'border-white/30 bg-white/20', // 열렸을 때
                  )}
                >
                  <span className="text-[9px] font-bold text-white tracking-wide uppercase">
                    Free
                  </span>
                </div>
              )}
            </button>
          </div>
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
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <SparklesIcon className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 m-0">
                {language === 'en' ? 'AI Detailed Analysis' : 'AI 상세 분석 결과'}
              </h3>
            </div>

            {/* 실제 결과 텍스트 */}
            <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
              {aiResult}
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
