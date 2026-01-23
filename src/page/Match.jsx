// 1. React Core
import { useEffect, useState } from 'react';
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
  LockClosedIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';
import { LinkIcon, UserIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

// 3. Internal Config, Libs, Utils, API

import { getEng } from '../utils/helpers';
import { UI_TEXT, langPrompt, hanja } from '../data/constants';
import { parseAiResponse } from '../utils/helpers';

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

export default function Match({}) {
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }
  // const data = {
  //   score: 92,//1~100사이의 궁합점수
  //   title: '관계를 요약하는 세련된 한 문장 헤드라인',
  //   vibe: '두 사람 사이에 흐르는 전반적인 에너지 분위기',
  //   pros: ['관계의 구체적인 강점 1', '관계의 구체적인 강점 2'],
  //   cons: ['주의가 필요한 지점 1', '주의가 필요한 지점 2'],
  //   advice: '마스터가 전하는 짧고 강렬한 핵심 조언',
  //   keywords: ['키워드1', '키워드2', '키워드3'],
  //   matchIdentity: '은유적이고 시적인 관계의 정체성 (예: 안개 속의 등불)',
  //   insights: {
  //     me: '관계 내에서의 본인 사주 특징 및 기질 분석 (심층 줄글)',
  //     target: '관계 내에서의 상대방 사주 특징 및 기질 분석 (심층 줄글)',
  //     synergyPros: '두 사주가 만났을 때 발생하는 긍정적 시너지와 운의 상승 효과 (심층 줄글)',
  //     synergyCons: '두 사주 사이에서 충돌하거나 조율이 필요한 에너지적 지점 (심층 줄글)',
  //     solution: '더 나은 관계를 위해 오늘 당장 실천해야 할 구체적인 방안 (심층 줄글)',
  //     ctaChat: "상황에 맞게 변주된 '사자와의 대화' 유도 문구 (다정하고 매력적으로)",
  //   },
  // };

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
  const isEn = language === 'en';
  const { user, userData } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = userData || {};

  const { setEditCount, MAX_EDIT_COUNT, MAX_LIMIT, isLocked } = useUsageLimit();

  // --- States ---
  const [step, setStep] = useState(0);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);
  const [aiResult, setAiResult] = useState();
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
    setStep(0);
    if (step === 0) {
      setAiResult('');
    }
  }, []);

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

  const handleMatch = async () => {
    setAiResult('');
    try {
      await service.analyze(
        AnalysisPresets.match({
          saju,
          saju2,
          gender,
          gender2,
          inputDate,
          inputDate2,
          relationship: selectedRel,
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
    userData?.usageHistory.ZMatchAnalysis &&
    userData.usageHistory.ZMatchAnalysis.language === language &&
    userData.usageHistory.ZMatchAnalysis.gender === gender &&
    userData.usageHistory.ZMatchAnalysis.relationship === selectedRel &&
    checkSajuEqual(userData.usageHistory.ZMatchAnalysis.saju, saju) &&
    checkSajuEqual(userData.usageHistory.ZMatchAnalysis.saju2, saju2);
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = (loading && !compaEnergy2.isConsuming) || !user || loading;
  const isDisabled2 = !isAnalysisDone && isLocked;
  //json

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

  return (
    <>
      {/* 상단 단계 표시바 (Stepper) */}
      {step > 0 && (
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
      )}

      {step === 0 && (
        <div className="max-w-lg mx-auto text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
              {language === 'ko' ? '사주로 보는' : 'Reading the Fate'}
              <br />
              <span className="relative text-rose-600 dark:text-rose-500">
                {language === 'ko' ? '운명적 궁합 & 조화' : 'Destined Match & Harmony'}
                <div className="absolute inset-0 bg-rose-200/50 dark:bg-rose-800/60 blur-md rounded-full scale-100"></div>
              </span>
            </h2>

            <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
              <p className="text-sm">
                <strong>
                  {language === 'ko' ? '두 사람의 에너지 조화' : 'Harmony of Two Energies'}
                </strong>
                {language === 'ko' ? '와 ' : ' and '}
                <strong>
                  {language === 'ko' ? '서로에게 미치는 영향' : 'Mutual Impact on Fate'}
                </strong>
                {language === 'ko'
                  ? ', 정밀한 관계 지도 분석.'
                  : ', Precise Relationship Map Analysis.'}
              </p>

              {/* 궁합용 이미지 경로 (필요시 수정) */}
              <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                <img
                  src="/images/introcard/match_1.webp"
                  alt="Relationship Match Intro"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(1)} // 다음 단계로 이동
            disabled={loading || (isLocked && !isAnalysisDone)}
            className={classNames(
              'w-full px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
              loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-rose-200 hover:-translate-y-1',
            )}
          >
            {loading
              ? language === 'ko'
                ? '기운 대조 중...'
                : 'Matching...'
              : language === 'ko'
                ? '궁합 분석 시작하기'
                : 'Start Match Analysis'}
            {/* 이미 분석한 적이 있다면 무료 티켓 표시 */}
          </button>
          {isLocked && !isAnalysisDone ? (
            <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
              <ExclamationTriangleIcon className="w-4 h-4" />
              {language === 'ko' ? '크레딧이 부족합니다.' : 'Not enough credits.'}
            </p>
          ) : (
            <p className="mt-4 text-[11px] text-slate-400">
              {language === 'ko'
                ? '이미 분석된 궁합은 크레딧을 재소모하지 않습니다.'
                : 'Analysis already done does not consume credits again.'}
            </p>
          )}
        </div>
      )}
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
                disabled={isDisabled || isDisabled2}
                className={classNames(
                  'w-full sm:w-auto px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
                  isDisabled
                    ? DISABLED_STYLE
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-200 hover:-translate-y-1',
                )}
              >
                <SparklesIcon className="w-5 h-5 animate-pulse" />
                <span>{language === 'en' ? 'Start Chemistry Analysis' : '궁합 분석 시작하기'}</span>

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
        </>
      )}

      {step === 4 && (
        <div className="w-full max-w-4xl mx-auto px-1 animate-fadeIn">
          {/* ================================================= */}
          {/* 1. 분석 요약 헤더 (Summary Header) */}
          {/* ================================================= */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 mb-4 relative overflow-hidden">
            {/* 상단 포인트 라인 */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

            {/* 헤더 영역: 관계 배지를 우측 상단으로 이동하여 세로 공간 절약 */}
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black tracking-tighter text-slate-400 uppercase">
                MATCH ANALYSIS
              </span>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                  RELATION
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {(() => {
                    const r = RELATION_TYPES.find((t) => t.id === selectedRel);
                    if (!r) return selectedRel;
                    return language === 'en' ? r.sub : r.label;
                  })()}
                </span>
              </div>
            </div>

            {/* 매치업 영역: 더 촘촘하게 배치 */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center">
              {/* [LEFT] ME */}
              <div className="flex flex-col items-center text-center">
                <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded mb-1">
                  ME
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-1">
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200">
                    {inputDate.split('T')[0].slice(2)} {/* 연도 앞자리 잘라서 더 짧게 */}
                  </span>
                  <span className="text-xs text-slate-400">
                    {gender === 'male'
                      ? language === 'en'
                        ? 'M'
                        : '남'
                      : language === 'en'
                        ? 'F'
                        : '여'}
                    {gender === 'male' ? '👨' : '👩'}
                  </span>
                </div>
              </div>

              {/* [CENTER] VS - 더 작고 심플하게 */}
              <div className="px-3 flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 shadow-inner">
                  <span className="text-[10px] font-black text-slate-300">VS</span>
                </div>
              </div>

              {/* [RIGHT] TARGET */}
              <div className="flex flex-col items-center text-center">
                <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded mb-1">
                  TARGET
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-1">
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200">
                    {inputDate2.split('T')[0].slice(2)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {gender2 === 'male'
                      ? language === 'en'
                        ? 'M'
                        : '남'
                      : language === 'en'
                        ? 'F'
                        : '여'}
                    {gender2 === 'male' ? '👨' : '👩'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* 2. AI 분석 결과 본문 (AI Result) */}
          {/* ================================================= */}
          <div className="bg-indigo-50/30 dark:bg-slate-800/50 rounded-2xl border border-indigo-100/50 dark:border-slate-700 p-5 sm:p-6 shadow-sm">
            {!!data && (
              <div className="flex flex-col gap-8 py-2 animate-up">
                {/* 1. 상단: 점수 및 핵심 타이틀 */}
                <section className="text-center">
                  <span className="font-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-2 block">
                    Match Identity
                  </span>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1">
                    {data.matchIdentity}
                  </h2>
                  <p className="text-sm text-indigo-500 font-semibold">{data.title}</p>

                  <div className="mt-6 max-w-[240px] mx-auto">
                    <div className="flex justify-between items-end mb-1.5 px-0.5">
                      <span className="font-xs font-bold text-slate-400 uppercase">
                        Compatibility
                      </span>
                      <span className="text-xl font-black text-slate-800 dark:text-white leading-none">
                        {data.score}%
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-1000"
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                  </div>
                </section>

                {/* 2. 분위기 요약 (얇은 구분선) */}
                <section className="border-t border-slate-100 dark:border-slate-800 pt-6 text-center">
                  <p className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-400 italic mb-4">
                    "{data.vibe}"
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {data.keywords.map((word, i) => (
                      <span key={i} className="text-[10px] font-medium text-slate-400">
                        #{word}
                      </span>
                    ))}
                  </div>
                </section>

                {/* 3. 에너지 분석 (나 vs 상대) - 색상 통일 */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div>
                    <h4 className="font-xs font-black text-indigo-500 uppercase tracking-widest mb-2">
                      Analysis: Me
                    </h4>
                    <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {data.insights.me}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-xs font-black text-indigo-500 uppercase tracking-widest mb-2">
                      Analysis: Target
                    </h4>
                    <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {data.insights.target}
                    </p>
                  </div>
                </section>

                {/* 4. 시너지 및 조율점 - 불필요한 색상 제거 */}
                <section className="space-y-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div>
                    <h4 className="font-xs font-black text-slate-800 uppercase tracking-widest mb-2">
                      {isEn ? 'Synergy' : '관계 시너지'}
                    </h4>
                    <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {data.insights.synergyPros}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-xs font-black text-slate-800 uppercase tracking-widest mb-2">
                      {isEn ? 'Points of Friction' : '주의할 지점'}
                    </h4>
                    <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {data.insights.synergyCons}
                    </p>
                  </div>
                </section>

                {/* 5. 핵심 요약 리스트 - 깔끔한 점(dot) 처리 */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div>
                    <h4 className="font-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      Strengths
                    </h4>
                    <ul className="space-y-1.5">
                      {data.pros.map((item, i) => (
                        <li key={i} className="text-[13px] text-slate-500 flex gap-2">
                          <span className="text-indigo-300">·</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      Cautions
                    </h4>
                    <ul className="space-y-1.5">
                      {data.cons.map((item, i) => (
                        <li key={i} className="text-[13px] text-slate-500 flex gap-2">
                          <span className="text-indigo-300">·</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                {/* 6. 최종 결론 및 가이드 */}
                <section className="border-t border-slate-100 dark:border-slate-800 pt-6 pb-4">
                  <h4 className="font-xs font-black text-indigo-500 uppercase tracking-widest mb-3 text-center">
                    Master's Conclusion
                  </h4>
                  <p className="text-[14px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed text-center max-w-md mx-auto mb-4">
                    {data.advice}
                  </p>
                  <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 text-center">
                    {data.insights.solution}
                  </p>
                  <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-900 text-center">
                    <span className="text-xs text-slate-800 font-bold italic">
                      {data.insights.ctaChat}
                    </span>
                  </div>
                </section>
              </div>
            )}
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
