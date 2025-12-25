// 1. React Core
import { useEffect, useState } from 'react';

// 2. External Libraries (Firebase, Icons)
import { doc, setDoc, increment } from 'firebase/firestore';
import {
  CalendarDaysIcon,
  PencilSquareIcon,
  HeartIcon,
  SparklesIcon,
  HomeModernIcon,
  BriefcaseIcon,
  FaceSmileIcon,
  UserGroupIcon,
  UsersIcon,
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
export default function Compatibility({
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
  const RELATION_TYPES = [
    {
      id: 'lover',
      label: '연인',
      sub: 'Lover',
      desc: '깊은 사랑을 나누는 사이',
      descEn: 'A relationship sharing deep love', // 🇺🇸 추가됨
      icon: HeartIcon,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      activeBorder: 'border-rose-500 ring-rose-200',
    },
    {
      id: 'some',
      label: '썸 / 짝사랑',
      sub: 'Crush / Some',
      desc: '설렘이 시작되는 단계',
      descEn: 'The beginning of heart-fluttering excitement', // 🇺🇸 추가됨
      icon: SparklesIcon,
      color: 'text-pink-400',
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      activeBorder: 'border-pink-500 ring-pink-200',
    },
    {
      id: 'married',
      label: '부부',
      sub: 'Spouse',
      desc: '평생을 함께하는 동반자',
      descEn: 'A lifelong partner walking together', // 🇺🇸 추가됨
      icon: HomeModernIcon,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      activeBorder: 'border-purple-500 ring-purple-200',
    },
    {
      id: 'family',
      label: '부모 / 자식',
      sub: 'Parent / Child',
      desc: '서로를 이끌어주는 소중한 혈연',
      descEn: 'Precious blood ties guiding each other', // 🇺🇸 추가됨
      icon: UsersIcon,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      activeBorder: 'border-orange-500 ring-orange-200',
    },
    {
      id: 'business',
      label: '사업 파트너',
      sub: 'Business',
      desc: '성공을 위한 비즈니스 관계',
      descEn: 'Strategic partnership for success', // 🇺🇸 추가됨
      icon: BriefcaseIcon,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      activeBorder: 'border-slate-600 ring-slate-200',
    },
    {
      id: 'friend',
      label: '친구 / 동료',
      sub: 'Friend',
      desc: '격의 없이 편안한 사이',
      descEn: 'Comfortable relationship without barriers', // 🇺🇸 추가됨
      icon: FaceSmileIcon,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      activeBorder: 'border-emerald-500 ring-emerald-200',
    },
    {
      id: 'etc',
      label: '기타',
      sub: 'Others',
      desc: '그 외의 다양한 관계',
      descEn: 'Various other types of connections', // 🇺🇸 추가됨
      icon: UserGroupIcon,
      color: 'text-indigo-400',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      activeBorder: 'border-indigo-500 ring-indigo-200',
    },
  ];
  const t = (char) => (language === 'en' ? getEng(char) : char);
  const { language } = useLanguage();
  const { user, userData } = useAuthContext();
  const { editCount, MAX_EDIT_COUNT, MAX_LIMIT, isLocked } = useUsageLimit();

  // --- States ---
  const [step, setStep] = useState(1);
  const totalStep = 4;
  const [selectedRel, setSelectedRel] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isCachedLoading, setIsCachedLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  // 상대방 정보 State
  const [gender2, setGender2] = useState('male');
  const [isTimeUnknown2, setIsTimeUnkown2] = useState(false);
  const [isSaved2, setIsSaved] = useState(false);
  const compaEnergy2 = useConsumeEnergy();
  const [inputDate2, setInputDate2] = useState(() => {
    try {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    } catch (e) {
      return '2024-01-01T00:00';
    }
  });

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
  const handleRelationshipNext = () => {
    if (selectedRel) {
      setStep(2);
    }
    setAiResult('');
  };

  // Step 2 완료 (정보 저장) -> Step 3로 이동
  const handleSaveInfo2 = async () => {
    if (!user) {
      alert(UI_TEXT.loginReq[language]);
      login();
      return;
    }
    setAiResult('');
    if (true) {
      try {
        setStep(3); // 결과 화면으로 이동
        setIsSaved(true);
        // alert(UI_TEXT.saveSuccess[language]);
      } catch (error) {
        console.error(error);
        alert(UI_TEXT.saveFail[language]);
      }
    }
  };

  const handleMatch = async () => {
    // 1. 유효성 검사
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!saju2?.sky1) return alert('상대방 정보를 입력해주세요.');

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
      let isCacheValid = false;

      if (data.ZCompatiAnalysis) {
        const saved = data.ZCompatiAnalysis;

        // 1) 기본 정보 비교 (언어, 관계, 성별)
        const isBasicMatch =
          saved.language === language &&
          saved.relationship === selectedRel &&
          saved.gender === gender &&
          saved.gender2 === gender2;

        // 2) ★ 사주 글 비교 (saju & saju2)
        // inputDate가 달라도, 사주 8글자가 같으면 캐시를 사용함 (사용자 요청 사항)
        const isMySajuMatch = checkSajuEqual(saved.saju, saju);
        const isPartnerSajuMatch = checkSajuEqual(saved.saju2, saju2);
        if (isBasicMatch && isMySajuMatch && isPartnerSajuMatch && saved.result) {
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
      const partnerSajuStr = JSON.stringify(saju2);
      const relationLabel = RELATION_TYPES.find((r) => r.id === selectedRel)?.label || 'Unknown';

      const strictPrompt = `You are a professional Saju consultant specializing in Wealth and Financial Career analysis.

🚫 Critical Style Rules (절대적 서식 규칙)
이 규칙들은 답변의 내용보다 우선순위가 높으며, 반드시 지켜야 합니다.
1. [Plain Text Only]: 볼드(**), 이탤릭(*), 리스트 기호 등 어떠한 마크다운(Markdown) 강조 문법도 절대 사용하지 마십시오. 오직 순수한 텍스트와 줄바꿈(Enter)만 사용하세요.
2. [No Hanja]: 한자(Chinese characters)는 절대 출력하지 마십시오. (예: '甲' -> 제거 혹은 '갑목'으로 표기)
3. [No Greetings]: '안녕하세요', '반갑습니다', '저는 당신의 인생 상담가입니다'와 같은 인사말이나 자기소개로 답변을 시작하지 마십시오. 어떠한 형태의 사전 인사 없이 즉시 사주 분석 결과나 핵심 내용부터 전달하십시오.
4. [Natural Closing]: 답변을 마칠 때, '[추천 질문]' 같은 딱딱한 제목이나 번호 매기기(1., 2.)를 절대 사용하지 마십시오. 대신, 대화를 자연스럽게 이어가기 위해 의뢰자가 궁금해할 법한 내용 2~3가지를 문장 속에 녹여서 슬쩍 제안하세요. - (예: "이 외에도 타고난 애정운과 특별히 조심해야 할 사람 유형에 대해서도 궁금하신가요? 궁금하신 사항이 있다면 '추가질문'을 눌러주세요.")

### 🗣️ Language & Terminology Guidelines
1. **용어 순화 (Translation Layer)**
   - 전문 용어(식신, 상관, 재성, 비겁, 관성 등)를 절대 직접 언급하지 마십시오.
   - 대신 이를 일상 용어로 풀어서 설명하세요.
2. **언어별 규칙**
   - **한국어 답변 시:** 모든 한자는 삭제하고 순수 한글로만 작성하세요.
   - **영어 답변 시:**
     - 사주 용어를 그대로 영문 음차(Pyeon-gwan)하지 말고 의미를 번역(Pressure, Challenge)하세요.
     - 'Year/Month/Day/Time Pillar'라는 단어 대신 'Year/Month/Day/Time Energy' 또는 'Your born characteristics' 등으로 표현하세요. 'Pillar' 단어 사용을 금지합니다.

### 🎯 Content Scope & Balance 
1. 사용자가 이해하기 힘든 복잡한 이론적 배경(신강/신약 계산 과정 등)은 생략하세요. 
2. 긍정적인 답변을 쓰더라도 약한 부정적인 답변을 추가하고, 부정적인 답변이 주제인 답변은 긍정적인 답변을 추가해서 반전의 가능성을 시사해주세요.
3. [Constructive Caution]: 부정적인 답변은 "당신은 이게 나쁘다"고 지적하는 것이 아니라, "이 특성만 보완하면 상대방과의 사이가 2배 좋아진다"**는 식의 '개선 포인트(Quest)'로 전달하세요. 
4. [Directional Specificity]: - 사용자가 A vs B를 물어보면 5:5 중립을 피하고, 사주상 유리한 쪽을 7:3 이상의 확률로 확실히 집어주세요. - 추상적 조언 대신 현대적 키워드(자연스러운 만남, 쉽게 사랑에 빠지는 타입 등)로 매핑하여 답변하세요.
`;
      const specificPrompt = `Analyze the compatibility by prioritizing personality harmony and mutual social growth, incorporating wealth-related insights only as a secondary factor when it significantly impacts the relationship's foundation
       [Context Weight]: 분석의 80%는 두 사람의 성격적 기질, 가치관의 충돌이나 조화, 사회적 발전을 위한 시너지에 집중하십시오. 재물이나 경제적 측면은 분석 흐름상 반드시 필요한 경우에만 20% 이내의 비중으로만 다루십시오.`;

      const fullPrompt = `
        ${strictPrompt} ${specificPrompt}
        
        Analyze the compatibility (Gunghap) between two people.
        Relationship Type: "${relationLabel} (${selectedRel})".
sajuStr - sky3+grd3 : year pillar, sky2+grd2 : month pillar, sky1+grd1 : day pillar, sky0+grd0 : hour pillar
        [Person 1 (Me)]
        Gender: ${gender}
        Saju Chart: ${mySajuStr}-sky3+grd3 는 연주, sky2+grd2는 월주, sky1+grd1은 일주, sky0+grd0는 시주야
        나를 선생님이 아닌 ${userData?.displayName}님 이라고 불러줘.영어로는 ${userData?.displayName}. undefined시는 그냥 선생님이라고 해..

        [Person 2 (Partner)]
        Gender: ${gender2}
        Saju Chart: ${partnerSajuStr}-sky3+grd3 는 연주, sky2+grd2는 월주, sky1+grd1은 일주, sky0+grd0는 시주야

        ${langPrompt(language)}
        ${hanja(language)}
      `;
      const result = await fetchGeminiAnalysis(fullPrompt);

      const newCount = currentCount + 1;

      // ---------------------------------------------------------
      // 4. 저장 (현재의 saju와 saju2를 저장해야 다음 비교 가능)
      // ---------------------------------------------------------
      await setDoc(
        doc(db, 'users', user.uid),
        {
          saju: saju,
          editCount: newCount,
          lastEditDate: new Date().toLocaleDateString('en-CA'),
          dailyUsage: {
            [new Date().toLocaleDateString('en-CA')]: increment(1),
          },
          ZCompatiAnalysis: {
            result: result,

            // ★ 비교 기준이 되는 사주 데이터 저장
            saju: saju,
            saju2: saju2,

            gender: gender,
            gender2: gender2,
            relationship: selectedRel,
            language: language,

            // 참고용 날짜 정보 (비교엔 안 씀)
            inputDate: inputDate,
            inputDate2: inputDate2,
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
  const isDisabled = (loading && !compaEnergy2.isConsuming) || !user || loading;
  const SAJU_KEYS = ['sky3', 'grd3', 'sky2', 'grd2', 'sky1', 'grd1', 'sky0', 'grd0'];

  const checkSajuEqual = (source, target) => {
    if (!source || !target) return false;
    // 8개 키 중 하나라도 값이 다르면 false 리턴
    return SAJU_KEYS.every((key) => source[key] === target[key]);
  };
  const isAnalysisDone =
    userData?.ZCompatiAnalysis &&
    userData.ZCompatiAnalysis.language === language &&
    userData.ZCompatiAnalysis.gender === gender &&
    userData.ZCompatiAnalysis.relationship === selectedRel &&
    checkSajuEqual(userData.ZCompatiAnalysis.saju, saju) &&
    checkSajuEqual(userData.ZCompatiAnalysis.saju2, saju2);

  return (
    <>
      {/* 상단 단계 표시바 (Stepper) */}
      <Step
        step={step}
        totalStep={totalStep}
        title={
          step === 1
            ? 'Select Relationship'
            : step === 2
              ? 'Enter Birth Details'
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
            <div className="text-center mb-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {/* 1. 제목 번역 */}
                {language === 'en' ? 'What is the relationship?' : '두 분은 어떤 사이인가요?'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {/* 2. 부제목 번역 */}
                {language === 'en'
                  ? 'Analysis points vary based on the relationship.'
                  : '관계에 따라 중점적으로 분석할 포인트가 달라집니다.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {RELATION_TYPES.map((type) => {
                const isSelected = selectedRel === type.id;
                const Icon = type.icon;

                // 3. 카드 내부 텍스트 변수 처리
                const labelText = language === 'en' ? type.sub : type.label; // 영어일 땐 sub(Lover) 사용
                const descText = language === 'en' ? type.descEn : type.desc; // 영어일 땐 descEn 사용

                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedRel(type.id)}
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
                          {/* 라벨 출력 */}
                          {labelText}
                        </span>

                        {/* 영어 모드가 아닐 때만 sub(영어이름)을 작게 표시하거나, 영어 모드일 땐 숨길 수도 있음. 
                    여기서는 영어 모드일 땐 subText를 숨겨서 깔끔하게 처리 */}
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
                disabled={!selectedRel}
                onClick={handleRelationshipNext}
                className={`
          px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg
          ${
            selectedRel
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
        <div className="w-full max-w-5xl mx-auto px-1 animate-fadeIn">
          {/* 📱 모바일: 세로 / 💻 PC: 가로 배치 */}
          <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-6">
            {/* 1. [나의 정보] (Indigo Theme) - 읽기 전용 뷰 */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>

              <div className="p-5 flex flex-col h-full justify-center">
                <div className="mb-4 flex items-center">
                  <span className="px-3 py-1 rounded-md text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 tracking-widest border border-indigo-100 dark:border-indigo-800">
                    ME
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-700/30 py-3 rounded-xl mb-6 text-sm font-medium text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                  <CalendarDaysIcon className="w-4 h-4 text-indigo-400" />
                  <span className="font-mono tracking-wide text-slate-700 dark:text-slate-300">
                    {isTimeUnknown ? inputDate.split('T')[0] : inputDate.replace('T', ' ')}
                  </span>
                  <span className="text-lg ml-1">{gender === 'male' ? '👨' : '👩'}</span>
                  {isTimeUnknown && (
                    <span className="text-[10px] bg-white dark:bg-slate-600 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-500 text-slate-400">
                      {UI_TEXT.unknownTime[language]}
                    </span>
                  )}
                </div>

                {/* 사주 명식 시각화 */}
                <div className="flex-1 flex items-center justify-center">
                  {saju?.sky1 && (
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
                          {UI_TEXT.year[language]}
                        </span>
                        <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
                          {t(saju.sky3)}
                          {t(saju.grd3)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
                          {UI_TEXT.month[language]}
                        </span>
                        <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
                          {t(saju.sky2)}
                          {t(saju.grd2)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center relative">
                        <div className="absolute inset-0 bg-indigo-100/50 dark:bg-indigo-500/20 blur-md rounded-full transform scale-150"></div>
                        <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase mb-0.5 relative z-10">
                          {UI_TEXT.day[language]}
                        </span>
                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-200 tracking-widest leading-none relative z-10 drop-shadow-sm">
                          {t(saju.sky1)}
                          {t(saju.grd1)}
                        </span>
                      </div>
                      {!isTimeUnknown && (
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
                            {UI_TEXT.hour[language]}
                          </span>
                          <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
                            {t(saju.sky0)}
                            {t(saju.grd0)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 🔗 연결 고리 */}
            <div className="flex items-center justify-center -my-3 md:my-0 md:-mx-5 z-10">
              <div className="bg-white dark:bg-slate-700 p-2.5 rounded-full shadow-md border border-slate-200 dark:border-slate-600">
                <LinkIcon className="w-5 h-5 text-slate-400 dark:text-slate-300 transform -rotate-45" />
              </div>
            </div>

            {/* 2. [상대방 정보 입력] (Emerald Theme) */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>

              <div className="p-5 flex flex-col h-full justify-center">
                <div className="mb-2 flex items-center">
                  <span className="px-3 py-1 rounded-md text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 tracking-widest border border-emerald-100 dark:border-emerald-800">
                    TARGET
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <ModifyBd
                    gender={gender2}
                    inputDate={inputDate2}
                    isTimeUnknown={isTimeUnknown2}
                    setIsTimeUnknown={setIsTimeUnkown2}
                    saju={saju2}
                    handleSaveMyInfo={handleSaveInfo2} // 저장 -> Step 3
                    setInputDate={setInputDate2}
                    isSaved={false}
                    setGender={setGender2}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* 🟢 STEP 3: 결과 화면 (Result) */}
      {/* ================================================= */}
      {step === 3 && (
        <>
          <div className="w-full max-w-4xl mx-auto px-1 animate-fadeIn">
            {/* 1. 타이틀 & 안내 문구 */}
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                {language === 'en' ? 'Is the information correct?' : '정보가 맞나요?'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {language === 'en' ? (
                  <>
                    Precise analysis will begin based on this information.
                    <br />
                    Please go back if you need to make changes.
                  </>
                ) : (
                  <>
                    입력하신 정보를 바탕으로 정밀 분석을 시작합니다.
                    <br />
                    수정이 필요하면 이전 단계로 돌아가주세요.
                  </>
                )}
              </p>
            </div>

            {/* 2. 선택한 관계 표시 (배지 형태) */}
            <div className="flex justify-center mb-8">
              {(() => {
                // 선택된 관계 데이터 찾기
                const relData = RELATION_TYPES.find((r) => r.id === selectedRel);
                const RelIcon = relData?.icon || UserGroupIcon;

                // 언어에 따른 텍스트 설정 (영어면 sub, 한국어면 label)
                const relLabel = relData
                  ? language === 'en'
                    ? relData.sub
                    : relData.label
                  : language === 'en'
                    ? 'Not Selected'
                    : '선택 안함';

                return (
                  <div
                    className={`
              flex items-center gap-3 px-6 py-3 rounded-2xl border-2 shadow-sm
              ${relData?.bg || 'bg-slate-50'} 
              ${relData?.border || 'border-slate-200'} 
              dark:bg-slate-800 dark:border-slate-700
            `}
                  >
                    <div
                      className={`p-2 rounded-full bg-white dark:bg-slate-900 shadow-sm ${relData?.color || 'text-slate-400'}`}
                    >
                      <RelIcon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        RELATIONSHIP
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          relData?.color
                            ? relData.color.replace('text-', 'text-slate-700 dark:text-')
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {relLabel}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 3. 정보 매치업 카드 (나 vs 상대방) */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-center relative">
              {/* [ME] 카드 (Indigo) */}
              <div className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-sm flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500"></div>
                <span className="mb-4 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 uppercase tracking-widest">
                  ME
                </span>

                {/* 생년월일 */}
                <div className="text-center mb-4">
                  <div className="text-lg font-bold text-slate-700 dark:text-slate-200 font-mono">
                    {inputDate.split('T')[0]}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-2">
                    <span>
                      {gender === 'male'
                        ? language === 'en'
                          ? 'Male 👨'
                          : '남성 👨'
                        : language === 'en'
                          ? 'Female 👩'
                          : '여성 👩'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>
                      {isTimeUnknown
                        ? language === 'en'
                          ? 'Time Unknown'
                          : '시간 모름'
                        : inputDate.split('T')[1]}
                    </span>
                  </div>
                </div>

                {/* 사주 간략 보기 */}
                <div className="flex gap-3 opacity-80">
                  <div className="flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-xs text-slate-400 mb-1">
                      {language === 'en' ? 'Day Pillar' : '일주'}
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-300">
                      {t(saju.sky1)}
                      {t(saju.grd1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* VS 아이콘 (중앙) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 md:static md:translate-x-0 md:translate-y-0 md:flex md:items-center">
                <div className="bg-white dark:bg-slate-700 p-2 rounded-full shadow-md border border-slate-100 dark:border-slate-600">
                  <span className="font-black text-slate-300 text-xs">VS</span>
                </div>
              </div>

              {/* [TARGET] 카드 (Emerald) */}
              <div className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                <span className="mb-4 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 uppercase tracking-widest">
                  TARGET
                </span>

                {/* 생년월일 */}
                <div className="text-center mb-4">
                  <div className="text-lg font-bold text-slate-700 dark:text-slate-200 font-mono">
                    {inputDate2.split('T')[0]}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-2">
                    <span>
                      {gender2 === 'male'
                        ? language === 'en'
                          ? 'Male 👨'
                          : '남성 👨'
                        : language === 'en'
                          ? 'Female 👩'
                          : '여성 👩'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>
                      {isTimeUnknown2
                        ? language === 'en'
                          ? 'Time Unknown'
                          : '시간 모름'
                        : inputDate2.split('T')[1]}
                    </span>
                  </div>
                </div>

                {/* 사주 간략 보기 (상대방) */}
                <div className="flex gap-3 opacity-80">
                  <div className="flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-xs text-slate-400 mb-1">
                      {language === 'en' ? 'Day Pillar' : '일주'}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-300">
                      {saju2?.sky1 ? `${t(saju2.sky1)}${t(saju2.grd1)}` : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 로딩 바 */}
            <div className="my-5 flex justify-center">
              {loading && (
                <LoadingBar
                  progress={progress}
                  loadingType={'compati'}
                  isCachedLoading={isCachedLoading}
                />
              )}
            </div>

            {/* 4. 최종 분석 버튼 */}
            <div className="flex justify-center">
              <button
                onClick={() => compaEnergy2.triggerConsume(handleMatch)}
                disabled={isDisabled && !isAnalysisDone}
                className={classNames(
                  'w-full sm:w-auto px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
                  isDisabled && !isAnalysisDone
                    ? DISABLED_STYLE
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-200 hover:-translate-y-1',
                )}
              >
                <SparklesIcon className="w-5 h-5 animate-pulse" />
                <span>{language === 'en' ? 'Start Chemistry Analysis' : '궁합 분석 시작하기'}</span>

                {isAnalysisDone ? (
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
                크레딧이 부족합니다.
              </p>
            ) : (
              <p className="mt-4 text-[11px] text-slate-400">
                이미 분석된 운세는 크래딧을 재소모하지 않습니다.
              </p>
            )}
          </div>
        </>
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
                    RELATIONSHIP
                  </span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {(() => {
                      const r = RELATION_TYPES.find((t) => t.id === selectedRel);
                      if (!r) return selectedRel;
                      return language === 'en' ? r.sub : r.label;
                    })()}
                  </span>
                </div>
              </div>

              {/* ② 매치업 카드 (Me vs Target) */}
              <div className="flex flex-col sm:flex-row items-stretch gap-4 md:gap-0">
                {/* [LEFT] ME */}
                <div className="flex-1 flex flex-col items-center md:items-end md:pr-8 text-center md:text-right">
                  <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded mb-2">
                    ME
                  </span>

                  {/* 기본 정보 */}
                  <div className="mb-2">
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200 mr-2">
                      {inputDate.split('T')[0]}
                    </span>
                    <span className="text-sm text-slate-500">
                      {gender === 'male'
                        ? language === 'en'
                          ? 'Male'
                          : '남성'
                        : language === 'en'
                          ? 'Female'
                          : '여성'}{' '}
                      {gender === 'male' ? '👨' : '👩'}
                    </span>
                  </div>

                  {/* 사주 간략 (일주 강조) */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400 text-xs">
                      {language === 'en' ? 'Day Pillar:' : '본원(일주):'}
                    </span>
                    <div className="flex flex-col leading-none border border-indigo-200 rounded p-1 bg-indigo-50/50 dark:bg-slate-700 dark:border-slate-600">
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        {t(saju.sky1)}
                      </span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        {t(saju.grd1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* [CENTER] VS Divider */}
                <div className="relative flex items-center justify-center md:w-12 my-2 md:my-0">
                  <div className="absolute inset-0 md:left-1/2 md:w-px bg-slate-100 dark:bg-slate-700 md:-translate-x-1/2 hidden md:block"></div>
                  <div className="relative z-10 bg-white dark:bg-slate-800 p-1.5 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm">
                    <span className="text-[10px] font-black text-slate-300">VS</span>
                  </div>
                </div>

                {/* [RIGHT] TARGET */}
                <div className="flex-1 flex flex-col items-center md:items-start md:pl-8 text-center md:text-left">
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded mb-2">
                    TARGET
                  </span>

                  {/* 기본 정보 */}
                  <div className="mb-2">
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200 mr-2">
                      {inputDate2.split('T')[0]}
                    </span>
                    <span className="text-sm text-slate-500">
                      {gender2 === 'male'
                        ? language === 'en'
                          ? 'Male'
                          : '남성'
                        : language === 'en'
                          ? 'Female'
                          : '여성'}{' '}
                      {gender2 === 'male' ? '👨' : '👩'}
                    </span>
                  </div>

                  {/* 사주 간략 (일주 강조) */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex flex-col leading-none border border-emerald-200 rounded p-1 bg-emerald-50/50 dark:bg-slate-700 dark:border-slate-600">
                      <span className="font-bold text-emerald-600 dark:text-emerald-300">
                        {t(saju2.sky1)}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-300">
                        {t(saju2.grd1)}
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs">
                      {language === 'en' ? ':Day Pillar' : ':본원(일주)'}
                    </span>
                  </div>
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
                {language === 'en' ? 'Detailed Analysis' : '상세 분석 결과'}
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
              {language === 'en' ? 'Check Another Match' : '다른 궁합 보러가기'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
