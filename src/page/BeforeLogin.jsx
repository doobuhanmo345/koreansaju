import React, { useEffect, useState, useMemo } from 'react';
import { useAuthContext } from '../context/useAuthContext';
import {
  SparklesIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/solid';
import { CakeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../context/useLanguageContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import { calculateSajuData } from '../utils/sajuLogic';
import dayStem from '../data/dayStem.json';
import FourPillarVis from '../component/FourPillarVis';
export default function BeforeLogin() {
  const { user, userData, login } = useAuthContext();
  const { language, setLanguage } = useLanguage();
  const [sajuData, setSajuData] = useState();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('');
  const birthInit = {
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
  };
  const [birthData, setBirthData] = useState(birthInit);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const pad = (n) => n?.toString().padStart(2, '0') || '00';
  const memoizedBirthDate = useMemo(() => {
    const { year, month, day, hour, minute } = birthData;
    if (!year || !month || !day) return null;
    const pad = (n) => n?.toString().padStart(2, '0') || '00';
    const formatted = `${year}-${pad(month)}-${pad(day)}T${timeUnknown ? '12' : pad(hour)}:${timeUnknown ? '00' : pad(minute)}`;
    return new Date(formatted);
  }, [birthData, timeUnknown]);

  const { saju } = useSajuCalculator(memoizedBirthDate, timeUnknown);

  const handleNextStep = () => {
    const { year, month, day, hour, minute } = birthData;
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = parseInt(hour);
    const min = parseInt(minute);

    // 1. 연도 체크 (1900-2030)
    if (!y || y < 1900 || y > 2030) {
      alert(
        language === 'ko'
          ? '연도를 1900~2030년 사이로 입력해주세요.'
          : 'Please enter a year between 1900-2030.',
      );
      return;
    }

    // 2. 월 체크 (1-12)
    if (!m || m < 1 || m > 12) {
      alert(
        language === 'ko'
          ? '월을 1~12월 사이로 입력해주세요.'
          : 'Please enter a month between 1-12.',
      );
      return;
    }

    // 3. 일 체크 (해당 월의 실제 마지막 날짜 계산)
    // JavaScript의 Date 객체는 day에 0을 넣으면 '이전 달의 마지막 날'을 반환하는 특성을 이용
    const lastDayOfMonth = new Date(y, m, 0).getDate();
    if (!d || d < 1 || d > lastDayOfMonth) {
      alert(
        language === 'ko'
          ? `${m}월은 ${lastDayOfMonth}일까지 있습니다. 다시 확인해주세요.`
          : `${month}/${m} only has ${lastDayOfMonth} days. Please check again.`,
      );
      return;
    }
    if (!timeUnknown) {
      // 4. 시간 체크 (0-23)
      if (isNaN(h) || h < 0 || h > 23) {
        alert(
          language === 'ko'
            ? ' 시간을 0~23시 사이로 입력해주세요.'
            : 'Please enter hours between 0-23.',
        );
        return;
      }

      // 5. 분 체크 (0-59)
      if (isNaN(min) || min < 0 || min > 59) {
        alert(
          language === 'ko'
            ? '분을 0~59분 사이로 입력해주세요.'
            : 'Please enter minutes between 0-59.',
        );
        return;
      }
    }

    // 모든 검증 통과
    setStep(2);
  };
  const handleEdit = () => {
    setBirthData(birthInit);
    setGender(null);
    setTimeUnknown(false);
    setStep(1);
  };
  // [데이터 무결성: 요구하신 Z 필드명 정확히 반영]
  const [tryLogin, setTryLogin] = useState(false);

  const hasId = async () => {
    // 상태값 대신 로컬 스토리지를 사용해 기록을 남깁니다.
    setTryLogin(true);
    login();
  };
  useEffect(() => {
    if (user && userData?.birthDate) {
      // CASE 1: 기존 회원
      window.location.replace('/');
    }
  }, [user]);
  useEffect(() => {
    if (!tryLogin || !user) return;
    const checkUser = async () => {
      // userData가 아직 없는 경우(null 또는 undefined) 0.5초~1초 정도 짧게 대기하며 재확인
      if (!userData) {
        return;
      }

      if (userData.birthDate) {
        // CASE 1: 기존 회원
        window.location.replace('/');
      } else {
        // CASE 2: 아이디는 있는데 생일만 없는 회원
        alert(language === 'ko' ? '사주 정보를 입력해주세요.' : 'Please enter info.');
        setStep(1);
        setTryLogin(false);
      }
    };

    checkUser();
  }, [user, userData, tryLogin]);
  useEffect(() => {
    const saveAndRedirect = async () => {
      if (user?.uid && step === 3) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const pad = (n) => n.toString().padStart(2, '0');
          const birthDate = `${birthData.year}-${pad(birthData.month)}-${pad(birthData.day)}T${timeUnknown ? '12' : pad(birthData.hour)}:${timeUnknown ? '00' : pad(birthData.minute)}`;

          await setDoc(
            userRef,
            {
              saju: saju,
              birthDate: birthDate,
              gender: gender,
              isTimeUnknown: timeUnknown,
              createdAt: userData?.createdAt || new Date(),
              updatedAt: new Date(),
              status: userData?.status || 'active',
              role: userData?.role || 'user',
              editCount: userData?.editCount || 0,
              lastLoginDate: new Date().toISOString().split('T')[0],
              displayName: user.displayName || '',
              email: userData?.email || user.email || '',
              // 요구하신 Z 필드명으로 수정
              usageHistory: userData?.usageHistory || {
                ZLastDaily: null,
                ZLastNewYear: null,
                ZApiAnalysis: null,
                ZWealthAnalysis: null,
                ZMatchAnalysis: null,
                ZCookie: null,
              },
              question_history: userData?.question_history || [],
            },
            { merge: true },
          );

          window.location.replace('/');
        } catch (err) {
          console.error('저장 오류:', err);
        }
      }
    };
    saveAndRedirect();
  }, [user, step]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]); // step 변수가 바뀔 때마다 실행됨
  const t = {
    ko: {
      step0: '언어를 선택해주세요',
      step1: '생년월일을 바탕으로 나의 오행을 분석합니다',
      step2: '입력 정보 확인',
      step3: '로그인 후 확인',
      step2_desc: '로그인하시면 결과를 저장하고 리포트를 확인합니다.',
      gender_m: '남성',
      gender_f: '여성',
      google: '구글로 로그인하고 결과 저장하기',
      complete: '사주 분석하기',
      time_unknown: '태어난 시간을 몰라요',
      // 추가된 문구
      already_member: '이미 계정이 있으신가요?',
      login_now: '로그인하기',
    },
    en: {
      step0: 'Select Language',
      step1: 'Analyzing your Five Elements based on your birth date.',
      step2: 'Check Your Info',
      step3: 'Find out after login',
      step2_desc: 'Login to save your data.',
      gender_m: 'Male',
      gender_f: 'Female',
      google: 'Continue with Google',
      complete: 'Analyze',
      time_unknown: 'Unknown Time',
      // 추가된 문구
      already_member: 'Already have an account?',
      login_now: 'Log in',
    },
  }[language];
  const systemLang =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages[0]
      : navigator.language || navigator.userLanguage || 'en';

  const isYearDone = birthData.year.length === 4;
  const isMonthDone = birthData.month.length >= 1 && parseInt(birthData.month) <= 12;
  const isDayDone = birthData.day.length >= 1 && parseInt(birthData.day) <= 31;
  const isHourDone = birthData.hour.length >= 1;
  const isMinuteDone = birthData.minute.length >= 1;
  const isTimeDone = timeUnknown || (birthData.hour.length >= 1 && birthData.minute.length >= 1);
  const isInvalid =
    !birthData.year ||
    !birthData.month ||
    !birthData.day ||
    (!timeUnknown && (!birthData.hour || !birthData.minute));
  useEffect(() => {
    if (!!memoizedBirthDate) {
      const date = `${birthData.year}-${pad(birthData.month)}-${pad(birthData.day)}T${timeUnknown ? '12' : pad(birthData.hour)}:${timeUnknown ? '00' : pad(birthData.minute)}`;
      const data = calculateSajuData(date, gender, timeUnknown, language) || '';
      if (data) {
        setSajuData(data);
        //   if (data.currentDaewoon) setSelectedDae(data.currentDaewoon);
      }
    }
  }, [step]);
  const sajuTranslations = {
    elements: {
      wood: { ko: '나무 (Wood)', en: 'Wood (Growth)', color: '#22c55e', emoji: '🌳' },
      fire: { ko: '불 (Fire)', en: 'Fire (Passion)', color: '#ef4444', emoji: '🔥' },
      earth: { ko: '흙 (Earth)', en: 'Earth (Stability)', color: '#eab308', emoji: '🌍' },
      metal: { ko: '쇠 (Metal)', en: 'Metal (Logic)', color: '#94a3b8', emoji: '💎' },
      water: { ko: '물 (Water)', en: 'Water (Wisdom)', color: '#3b82f6', emoji: '🌊' },
    },
    // 데이터에서 "name"으로 들어오는 한글/영문 키값 모두 대응
    shinsal: {
      Dohwa: {
        ko: '도화살',
        en: 'Irresistible Charm',
        desc_ko: '사람을 홀리는 치명적인 매력',
        desc_en: 'Magnetic charisma that naturally attracts others',
      },
      Yeokma: {
        ko: '역마살',
        en: 'Dynamic Wanderer',
        desc_ko: '세상을 누비는 활동적인 에너지',
        desc_en: 'Active energy for global movement and change',
      },
      Hwagae: {
        ko: '화개살',
        en: 'Artistic Soul',
        desc_ko: '깊은 고독 속에서 피어나는 예술성',
        desc_en: 'Deep artistic sensitivity and inner wisdom',
      },
      Baekho: {
        ko: '백호살',
        en: 'Power Authority',
        desc_ko: '압도적인 카리스마와 전문성',
        desc_en: 'Overwhelming professional charisma and drive',
      },
      Geuigo: {
        ko: '귀문관살',
        en: 'Sharp Intuition',
        desc_ko: '천재적인 영감과 날카로운 직관',
        desc_en: 'Genius-like inspiration and keen intuition',
      },
      Cheoneul: {
        ko: '천을귀인',
        en: 'Heavenly Patron',
        desc_ko: '하늘이 돕는 최고의 인복과 행운',
        desc_en: 'Divine protection and supreme luck from others',
      },
      Hongyeom: {
        ko: '홍염살',
        en: 'Sweet Seduction',
        desc_ko: '다정하고 매혹적인 붉은 에너지',
        desc_en: 'Sweet and seductive personal attraction',
      },
      Yangin: {
        ko: '양인살',
        en: 'Iron Will',
        desc_ko: '어떤 역경도 뚫고 나가는 강철 의지',
        desc_en: 'Steel-like determination to overcome any obstacle',
      },
    },
  };

  const skyToKey = {
    갑: 'wood',
    을: 'wood',
    병: 'fire',
    정: 'fire',
    무: 'earth',
    기: 'earth',
    경: 'metal',
    신: 'metal',
    임: 'water',
    계: 'water',
  };
  const generatePreview = (sajuData, lang) => {
    if (!sajuData || !sajuData.saju) return {};
    const isKo = lang === 'ko';

    // 1. 핵심 정체성 (Core Identity)
    const coreSky = sajuData.saju.sky1;
    const coreKey = skyToKey[coreSky] || 'wood';
    const coreInfo = sajuTranslations.elements[coreKey];

    const coreText = isKo
      ? `당신은 ${coreInfo.ko}의 기질을 타고난 사람입니다.`
      : `You are naturally gifted with the spirit of ${coreInfo.en}.`;

    // 2. 가장 강한 오행 (Dominant Energy)
    const maxOhaengKey = sajuData.maxOhaeng?.[0] || 'wood';
    const maxValue = sajuData.maxOhaeng?.[1] || 0;
    const maxInfo = sajuTranslations.elements[maxOhaengKey];

    const dominantText = isKo
      ? `${maxInfo.emoji}${maxInfo.ko} 에너지가 압도적입니다 (강도: ${maxValue}/8).`
      : `Your ${maxInfo.emoji}${maxInfo.en} energy is overwhelming (Intensity: ${maxValue}/8).`;

    // 3. 신살/잠재 능력 (Hidden Powers)
    const talentText =
      sajuData.myShinsal && sajuData.myShinsal.length > 0
        ? sajuData.myShinsal
            .map((s) => {
              // 데이터의 s.name이 "Dohwa" 혹은 "도화"로 올 때를 대비
              const t = sajuTranslations.shinsal[s.name];
              if (t) {
                return isKo ? `[${t.ko}: ${t.desc_ko}]` : `[${t.en}: ${t.desc_en}]`;
              }
              // 사전에 없는 신살이면 데이터 그대로 노출
              return `[${s.name}: ${s.desc}]`;
            })
            .join(' ')
        : isKo
          ? '특별한 잠재력을 분석 중입니다.'
          : 'Analyzing your hidden potentials...';

    // 4. 대운 (Life Cycle)
    const dw = sajuData.currentDaewoon;
    const daewoonText = isKo
      ? `${dw.startAge}세부터 ${dw.endAge}세까지 인생의 큰 전환점이 시작됩니다.`
      : `A major turning point in your life begins from age ${dw.startAge} to ${dw.endAge}.`;

    return {
      coreText,
      dominantText,
      talentText,
      daewoonText,
      coreColor: coreInfo.color,
      coreEmoji: coreInfo.emoji,
    };
  };
  const preview = sajuData ? generatePreview(sajuData, language) : {};
  const guideMessages = {
    ko: {
      putGender: '성별을 선택해주세요',
      putYear: '태어난 연도를 입력해주세요',
      putMonth: '태어난 달을 입력해주세요',
      putDay: '태어난 날짜를 입력해주세요',
      putHour: '태어난 시간을 입력해주세요 (모르면 체크)',
      putMin: '태어난 분을 입력해주세요 (모르면 체크)',
      ready: '다음 단계로 넘어갈 준비가 되었어요!',
    },
    en: {
      putGender: 'Please select your gender',
      putYear: 'Please enter your birth year',
      putMonth: 'Please enter your birth month',
      putDay: 'Please enter your birth day',
      putHour: 'Please enter birth hour (or check unknown)',
      putMin: 'Please enter birth minute (or check unknown)',
      ready: 'Ready to move to the next step!',
    },
  };

  const handleBack = () => {
    if (step === 2) {
      setBirthData(birthInit);
      setTimeUnknown(false);
      setGender(null);
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 2) setStep(1);
  };
  // 퍼센테이지 계산 로직
  const getProgress = () => {
    let score = 0;
    if (gender) score += 20;
    if (isYearDone) score += 20;
    if (isMonthDone) score += 20;
    if (isDayDone) score += 20;
    if (timeUnknown) {
      score += 20;
    } else {
      if (isHourDone) score += 10;
      if (isMinuteDone) score += 10;
    }
    return score;
  };

  const isFormValid = getProgress() === 100;
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4500); // 4.5초 후 폼으로 전환
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 tracking-tight font-light">
      {step > 1 && !isAnalyzing && (
        <button
          onClick={handleBack}
          className="absolute left-5 top-6 z-20 p-2 rounded-full 
               bg-white dark:bg-slate-800 
               text-[#3B82F6] dark:text-[#3B82F6] 
               shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
               border border-slate-100 dark:border-slate-700
               hover:bg-slate-50 dark:hover:bg-slate-700 
               active:scale-90 transition-all duration-200"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="w-6 h-6 stroke-[3px]" />
        </button>
      )}

      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-slate-100 dark:border-slate-800">
        {/* Progress Bar */}
        <div className="flex justify-center items-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-[3px] rounded-full transition-all duration-700 ${
                step >= s ? 'w-10 bg-[#3B82F6]' : 'w-2 bg-stone-100 dark:bg-stone-800'
              }`}
            />
          ))}
        </div>
        {step === 1 && (
          <div className="min-h-[450px] flex flex-col justify-center">
            {showIntro ? (
              /* --- 인트로 에니메이션 세션 --- */
              <>
                <div className="space-y-10 text-center py-10 overflow-hidden">
                  {/* 브랜드 태그 */}
                  <p className="text-[#3B82F6] font-black text-[12px] tracking-[0.4em] animate-pulse">
                    SAJA SAJU
                  </p>

                  <div className="space-y-6">
                    <h2 className="text-[24px] font-light text-[#1A1A1A] dark:text-white leading-[1.4] tracking-tight">
                      {/* 1번 문장 */}
                      <span
                        className="block"
                        style={{
                          animation: 'fadeInUp 0.8s ease-out 0.3s forwards',
                          opacity: 0,
                        }}
                      >
                        {language === 'ko' ? '복잡한 절차 없이' : 'No complex steps,'}
                      </span>
                      {/* 2번 문장 */}
                      <span
                        className="block font-black"
                        style={{
                          animation: 'fadeInUp 0.8s ease-out 0.7s forwards',
                          opacity: 0,
                        }}
                      >
                        {language === 'ko'
                          ? '무료로 사주를 분석하는'
                          : 'Get your free Saju analysis'}
                      </span>
                      {/* 3번 문장 */}
                      <span
                        className="block"
                        style={{
                          animation: 'fadeInUp 0.8s ease-out 1.1s forwards',
                          opacity: 0,
                        }}
                      >
                        {language === 'ko' ? (
                          <>
                            <span className="text-[#3B82F6]">사자사주</span>에 오신 것을 환영해요.
                          </>
                        ) : (
                          <>
                            Welcome to <span className="text-[#3B82F6]">Saja Saju</span>.
                          </>
                        )}
                      </span>
                    </h2>

                    {/* 보조 설명 */}
                    <div
                      className="space-y-1"
                      style={{
                        animation: 'fadeInUp 0.8s ease-out 1.8s forwards',
                        opacity: 0,
                      }}
                    >
                      <p className="text-stone-400 text-[15px] font-medium leading-relaxed">
                        {language === 'ko' ? (
                          <>
                            생일만 넣으면{' '}
                            <span className="text-[#3B82F6] font-bold italic underline underline-offset-4 decoration-blue-100">
                              매일 3개씩
                            </span>
                          </>
                        ) : (
                          <>
                            Just enter your birthday for{' '}
                            <span className="text-[#3B82F6] font-bold italic underline underline-offset-4 decoration-blue-100">
                              3 free reports daily
                            </span>
                          </>
                        )}
                      </p>
                      <p className="text-stone-400 text-[15px] font-medium">
                        {language === 'ko'
                          ? '정밀한 분석 결과를 확인할 수 있어요.'
                          : 'Discover your destiny with precision.'}
                      </p>
                    </div>
                  </div>

                  {/* 하단 로딩 점 */}
                  <div
                    className="pt-6"
                    style={{
                      animation: 'fadeInUp 0.8s ease-out 2.5s forwards',
                      opacity: 0,
                    }}
                  >
                    <div className="flex justify-center items-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ✅ 로컬 스타일 시트: Keyframes를 직접 주입 */}
                  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}</style>
                </div>
              </>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="text-center space-y-3">
                  <h2 className="text-[24px] font-light text-[#1A1A1A] dark:text-white tracking-tight">
                    {t.step1.split(' ').map((word, i) => (
                      <span key={i}>
                        {i === 0 ? <b className="font-bold">{word}</b> : word}
                        {/* 마지막 단어가 아닐 때만 공백 추가 */}
                        {i !== t.step1.split(' ').length - 1 && ' '}
                      </span>
                    ))}
                  </h2>
                  <p className="text-stone-400 text-[12px] tracking-[0.2em] uppercase font-medium italic">
                    Step 01. Essential Info
                  </p>
                </div>

                <div className="space-y-4">
                  {/* 1. 성별: 항상 노출 */}
                  <div className="flex gap-2">
                    {['male', 'female'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 p-4 rounded-xl border-2 font-bold transition-all duration-300 ${
                          gender === g
                            ? 'border-[#3B82F6] bg-indigo-50 text-[#3B82F6]'
                            : 'border-slate-100 dark:border-slate-800 dark:text-white'
                        }`}
                      >
                        {g === 'male' ? t.gender_m : t.gender_f}
                      </button>
                    ))}
                  </div>

                  {/* 2. 연도 */}
                  <div
                    className={`grid transition-all duration-500 ease-in-out ${gender ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <input
                        type="number"
                        placeholder={
                          language === 'ko'
                            ? '태어난 연도를 입력해주세요'
                            : 'Please put your birth year'
                        }
                        value={birthData.year}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-[#3B82F6] outline-none font-bold text-center mt-1"
                        onChange={(e) =>
                          setBirthData({ ...birthData, year: e.target.value.slice(0, 4) })
                        }
                      />
                    </div>
                  </div>

                  {/* 3. 월 */}
                  <div
                    className={`grid transition-all duration-500 ease-in-out ${isYearDone ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <input
                        type="number"
                        placeholder={
                          language === 'ko'
                            ? '태어난 월을 선택해주세요'
                            : 'Please put your month of birth'
                        }
                        value={birthData.month}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-[#3B82F6] outline-none font-bold text-center mt-1"
                        onChange={(e) =>
                          setBirthData({ ...birthData, month: e.target.value.slice(0, 2) })
                        }
                      />
                    </div>
                  </div>

                  {/* 4. 일 */}
                  <div
                    className={`grid transition-all duration-500 ease-in-out ${isMonthDone && isYearDone ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <input
                        type="number"
                        placeholder={
                          language === 'ko'
                            ? '태어난 날을 선택해주세요'
                            : 'Please put your day of birth'
                        }
                        value={birthData.day}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-[#3B82F6] outline-none font-bold text-center mt-1"
                        onChange={(e) =>
                          setBirthData({ ...birthData, day: e.target.value.slice(0, 2) })
                        }
                      />
                    </div>
                  </div>

                  {/* 5. 시간: 레이아웃 깨짐 방지 포함 */}
                  <div
                    className={`grid transition-all duration-500 ease-in-out ${isDayDone && isMonthDone ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden space-y-4 pt-1">
                      {!timeUnknown && (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="number"
                            placeholder={language === 'ko' ? '태어난 시' : 'Birth time'}
                            value={birthData.hour}
                            className="flex-1 min-w-0 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-[#3B82F6] outline-none font-bold text-center"
                            onChange={(e) =>
                              setBirthData({ ...birthData, hour: e.target.value.slice(0, 2) })
                            }
                          />
                          <span className="font-bold dark:text-white text-xl px-1">:</span>
                          <input
                            type="number"
                            placeholder={language === 'ko' ? '태어난 시간' : 'Birth time'}
                            value={birthData.minute}
                            className="flex-1 min-w-0 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-[#3B82F6] outline-none font-bold text-center"
                            onChange={(e) =>
                              setBirthData({ ...birthData, minute: e.target.value.slice(0, 2) })
                            }
                          />
                        </div>
                      )}
                      <label className="flex items-center gap-3 cursor-pointer w-fit group ml-1">
                        <input
                          type="checkbox"
                          checked={timeUnknown}
                          onChange={(e) => setTimeUnknown(e.target.checked)}
                          className="w-5 h-5 accent-[#3B82F6]"
                        />
                        <span className="text-sm font-bold text-slate-500 group-hover:text-[#3B82F6] transition-colors">
                          {t.time_unknown}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                {/* 추가 테스트 */}
                <div className="flex items-center gap-1.5 animate-pulse">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-[18px] font-black text-[#3B82F6] dark:text-[#3B82F6]">
                    {language === 'ko'
                      ? !gender
                        ? guideMessages.ko.putGender
                        : !isYearDone
                          ? guideMessages.ko.putYear
                          : !isMonthDone
                            ? guideMessages.ko.putMonth
                            : !isDayDone
                              ? guideMessages.ko.putDay
                              : !timeUnknown && !isHourDone
                                ? guideMessages.ko.putHour
                                : !timeUnknown && !isMinuteDone
                                  ? guideMessages.ko.putMin
                                  : guideMessages.ko.ready
                      : !gender
                        ? guideMessages.en.putGender
                        : !isYearDone
                          ? guideMessages.en.putYear
                          : !isMonthDone
                            ? guideMessages.en.putMonth
                            : !isDayDone
                              ? guideMessages.en.putDay
                              : !timeUnknown && !isHourDone
                                ? guideMessages.en.putHour
                                : !timeUnknown && !isMinuteDone
                                  ? guideMessages.en.putMin
                                  : guideMessages.en.ready}
                  </span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-1">
                    {/* <CakeIcon className="w-4 h-4 text-[#3B82F6]" /> */}
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Progress
                    </span>
                  </div>
                  <span className="text-[#3B82F6] dark:text-[#3B82F6] text-xs font-black">
                    {getProgress()}%
                  </span>
                </div>

                {/* 바 본체 */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-[#3B82F6] transition-all duration-700 ease-out rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
                {isFormValid && (
                  <button
                    onClick={handleNextStep}
                    className="w-full py-4 bg-[#3B82F6] text-white rounded-xl font-black shadow-lg animate-in fade-in zoom-in-95 duration-300 active:scale-95 transition-all mt-4"
                  >
                    {language === 'ko' ? '나의 사주 오행 분석하기' : 'Analyze My Five Elements'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 text-center animate-in `slide-in-from-right-4">
            <div className="space-y-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {/* 타이틀: 얇은 폰트와 굵은 폰트의 조화 */}
              <div className="space-y-1.5">
                <h2 className="text-[22px] font-light text-[#1A1A1A] dark:text-white tracking-tight leading-snug">
                  {t.step2.split(' ').map((word, i) => (
                    <span key={i}>
                      {i === t.step2.split(' ').length - 1 ? (
                        <b className="font-black text-[#3B82F6]">{word}</b>
                      ) : (
                        word
                      )}
                      {i !== t.step3.split(' ').length - 1 && ' '}
                    </span>
                  ))}
                </h2>

                {/* 보조 설명 라인 */}
                <p className="text-stone-400 text-[12px] tracking-[0.2em] uppercase font-medium italic">
                  Step 02. Confirm Info
                </p>
              </div>
            </div>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="relative group bg-white dark:bg-[#1A1A1A] rounded-[30px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-stone-100 dark:border-stone-800 overflow-hidden">
                {/* 정보 그리드 (3분할) */}
                <div className="grid grid-cols-3 items-center mb-2">
                  {/* 1. 성별 */}
                  <div className="flex flex-col gap-1.5 text-left pl-1">
                    <p className="text-[10px] font-black text-stone-300 dark:text-stone-600 uppercase tracking-tighter">
                      {language === 'en' ? 'Gender' : '성별'}
                    </p>
                    <p className="text-[15px] font-bold text-stone-800 dark:text-stone-200">
                      {gender === 'male'
                        ? language === 'ko'
                          ? '남성'
                          : 'Male'
                        : language === 'ko'
                          ? '여성'
                          : 'Female'}
                      <span
                        className={`ml-1 ${gender === 'male' ? 'text-blue-500' : 'text-rose-400'}`}
                      >
                        {gender === 'male' ? '♂' : '♀'}
                      </span>
                    </p>
                  </div>

                  {/* 2. 생년월일 */}
                  <div className="flex flex-col gap-1.5 text-center border-x border-stone-50 dark:border-stone-800/50 px-2">
                    <p className="text-[10px] font-black text-stone-300 dark:text-stone-600 uppercase tracking-tighter">
                      {language === 'en' ? 'Birth' : '생년월일'}
                    </p>
                    <p className="text-[15px] font-bold text-stone-800 dark:text-stone-200 tracking-tight">
                      {birthData.year.slice(2)}.{birthData.month}.{birthData.day}
                    </p>
                  </div>

                  {/* 3. 시간 */}
                  <div className="flex flex-col gap-1.5 text-right pr-1">
                    <p className="text-[10px] font-black text-stone-300 dark:text-stone-600 uppercase tracking-tighter">
                      {language === 'en' ? 'Time' : '시간'}
                    </p>
                    <p className="text-[15px] font-bold text-stone-800 dark:text-stone-200">
                      {timeUnknown ? '—' : `${birthData.hour}:${birthData.minute}`}
                    </p>
                  </div>
                </div>

                {/* 수정 버튼: 카드 우측 하단에 자연스럽게 녹아든 '플로팅 태그' 스타일 */}
                <div className="absolute bottom-0 right-0">
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-[#3B82F6] dark:text-blue-400 rounded-tl-2xl rounded-br-[28px] text-[11px] font-black hover:bg-[#3B82F6] hover:text-white transition-all duration-300 active:scale-95 shadow-[-5px_-5px_15px_rgba(0,0,0,0.02)]"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="4"
                    >
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    {language === 'ko' ? '수정하기' : 'EDIT'}
                  </button>
                </div>
              </div>
              {/* 사주 오행 영역 */}
              {!!sajuData && (
                <div className="animate-in fade-in zoom-in-95 duration-1000 delay-300">
                  <FourPillarVis saju={saju} isTimeUnknown={timeUnknown} />
                </div>
              )}
            </div>
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="bg-white dark:bg-[#1A1A1A] rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-stone-50 dark:border-white/5 overflow-hidden">
                <div className=" space-y-8 text-left">
                  {/* 1. 핵심 정체성 (Identity) - 컴팩트하게 조정 */}
                  <section className="relative">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-base shadow-sm">
                        {preview.coreEmoji}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-[9px] font-black text-[#3B82F6] uppercase tracking-[0.2em]">
                          {language === 'ko' ? 'Identity' : 'Identity'}
                        </h3>
                        <div className="h-0.5 w-3 bg-[#3B82F6] rounded-full opacity-40" />
                      </div>
                    </div>
                    {/* 텍스트 크기를 19px -> 16px로 축소, 두께는 유지 */}
                    <p className="text-[16px] font-bold text-[#1A1A1A] dark:text-white leading-[1.6] break-keep px-0.5">
                      {preview.coreText}
                    </p>
                  </section>

                  {/* 분석 타임라인 섹션 - 선 두께와 간격 미세 조정 */}
                  <div className="relative ml-1 pl-7 border-l-[1px] border-stone-100 dark:border-stone-800/60 space-y-8">
                    {/* 2. 지배적 에너지 (Dominant Energy) */}
                    <section className="relative">
                      <div className="absolute -left-[32.5px] top-1.5 w-2 h-2 rounded-full bg-[#3B82F6] ring-[3px] ring-white dark:ring-[#1A1A1A]" />
                      <h4 className="text-[9px] font-bold text-stone-300 dark:text-stone-600 uppercase tracking-widest mb-1.5">
                        {language === 'ko' ? 'Dominant Energy' : 'Dominant Energy'}
                      </h4>
                      <p className="text-[13.5px] font-semibold text-stone-600 dark:text-stone-300 leading-relaxed">
                        {preview.dominantText}
                      </p>
                    </section>

                    {/* 3. 잠재 능력 (Hidden Talents) */}
                    <section className="relative">
                      <div className="absolute -left-[32.5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-[3px] ring-white dark:ring-[#1A1A1A]" />
                      <h4 className="text-[9px] font-bold text-stone-300 dark:text-stone-600 uppercase tracking-widest mb-2.5">
                        {language === 'ko' ? 'Hidden Talents' : 'Hidden Talents'}
                      </h4>
                      <div className="grid gap-1.5">
                        {preview.talentText
                          ?.split(']')
                          .filter((t) => t.trim())
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-[13px] font-medium text-stone-500 dark:text-stone-400  p-2 rounded-lg"
                            >
                              <span className="text-emerald-500 text-[10px] mt-0.5">•</span>
                              <span>{item.replace('[', '')}</span>
                            </div>
                          ))}
                      </div>
                    </section>

                    {/* 4. 인생의 주기 (Life Cycle) */}
                    <section className="relative">
                      <div className="absolute -left-[32.5px] top-1.5 w-2 h-2 rounded-full bg-amber-500 ring-[3px] ring-white dark:ring-[#1A1A1A]" />
                      <h4 className="text-[9px] font-bold text-stone-300 dark:text-stone-600 uppercase tracking-widest mb-1.5">
                        {language === 'ko' ? 'Life Cycle' : 'Life Cycle'}
                      </h4>
                      <p className="text-[13.5px] font-semibold text-stone-600 dark:text-stone-300 leading-relaxed">
                        {preview.daewoonText}
                      </p>
                    </section>
                  </div>
                </div>
              </div>

              {/* 하단 엠블럼: 분석의 신뢰도 암시 */}
              <div className="mt-8 flex justify-center opacity-30">
                <div className="h-px w-12 bg-stone-300" />
                <div className="mx-4 text-[10px] font-black tracking-[0.3em] uppercase text-stone-400">
                  Saja Saju Analysis
                </div>
                <div className="h-px w-12 bg-stone-300" />
              </div>
            </div>
            <div className="mt-12 space-y-6 text-center animate-in fade-in slide-in-from-top-4 duration-1000 delay-700">
              {/* 브릿지 섹션: 궁금증 유발 */}
              <div className="relative inline-block px-8 py-4">
                {/* 배경에 은은한 블루 글로우로 시선 집중 */}
                <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 rounded-[24px] blur-xl" />

                <div className="relative space-y-2">
                  <p className="text-[14px] font-bold text-stone-400 dark:text-stone-500 tracking-tight">
                    {language === 'ko'
                      ? '사주 용어들이 조금 어렵죠?'
                      : 'Are these terms a bit complex?'}
                  </p>
                  <h3 className="text-[17px] font-black text-stone-800 dark:text-white leading-tight">
                    {language === 'ko' ? (
                      <>
                        당신만을 위한 <span className="text-[#3B82F6]">자세한 인생 해석</span>을
                        <br />
                        지금 바로 확인해 보세요
                      </>
                    ) : (
                      <>
                        Check out your{' '}
                        <span className="text-[#3B82F6]">detailed life analysis</span>
                        <br />
                        tailored just for you
                      </>
                    )}
                  </h3>
                </div>
              </div>

              {/* 아래로 향하는 안내 화살표 (부드러운 움직임) */}
              <div className="flex justify-center">
                <div className="animate-bounce">
                  <svg
                    className="w-6 h-6 text-[#3B82F6] opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M19 14l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* 메인 액션 버튼: 최종 분석 결과 보기 */}
              <button
                onClick={() => setStep(3)}
                className="group relative w-full max-w-[300px] py-5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-[28px] font-black text-[17px] shadow-[0_15px_35px_rgba(59,130,246,0.3)] hover:shadow-[0_20px_45px_rgba(59,130,246,0.4)] transition-all duration-300 active:scale-[0.96]"
              >
                <div className="relative flex items-center justify-center gap-2">
                  <span>{language === 'ko' ? '상세 해석 보러가기' : 'View Full Report'}</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M13 7l5 5-5 5" />
                  </svg>
                </div>

                {/* 버튼 내부 은은한 반짝임 효과 */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>

              {/* 보안 및 무료 안내 (안심 장치) */}
              <p className="text-[11px] font-bold text-stone-300 dark:text-stone-700 tracking-[0.15em] uppercase">
                1:1 Personalized & 100% Secure
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="pt-12 pb-6 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 text-center">
            {/* 상단 섹션: 패딩을 주어 상단 바와의 간격 확보 */}
            <div className="space-y-6">
              <div className="relative mx-auto w-16 h-16">
                {/* 부드러운 오로라 글로우 */}
                <div className="absolute inset-0 bg-blue-400/15 rounded-full blur-2xl" />
                <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-[24px] shadow-sm border border-blue-50/50 dark:border-slate-700 flex items-center justify-center">
                  <div className="w-6 h-6 bg-[#3B82F6] rounded-lg rotate-12 shadow-lg shadow-blue-200" />
                </div>
              </div>
              <h2 className="text-[22px] font-light text-[#1A1A1A] dark:text-white tracking-tight leading-snug">
                {t.step3.split(' ').map((word, i) => (
                  <span key={i}>
                    {i === t.step3.split(' ').length - 1 ? (
                      <b className="font-black text-[#3B82F6]">{word}</b>
                    ) : (
                      word
                    )}
                    {i !== t.step3.split(' ').length - 1 && ' '}
                  </span>
                ))}
              </h2>

              {/* 보조 설명 라인 */}
              <p className="text-stone-400 text-[12px] tracking-[0.2em] uppercase font-medium italic">
                Step 03. Login
              </p>
              <div className="space-y-2">
                <p className="text-stone-400 text-[14px] font-medium leading-relaxed px-4">
                  {language === 'ko' ? (
                    <>
                      간편한 구글 로그인으로 <span className="text-[#3B82F6]">매일 3개</span>의
                      <br />
                      무료 사주 분석을 시작할 수 있어요
                    </>
                  ) : (
                    <>
                      Get <span className="text-[#3B82F6]">3 free reports</span> daily
                      <br />
                      by login
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* 구글 로그인 버튼: 모바일 최적화 (텍스트 단축 & 패딩 확보) */}
            <div className="max-w-[280px] mx-auto w-full">
              <button
                onClick={() => login()}
                className="group w-full flex items-center justify-between p-2 bg-[#F8FBFF] dark:bg-blue-900/15 rounded-[28px] border border-[#E0EEFF] dark:border-blue-800/30 transition-all duration-300 shadow-sm active:scale-[0.96]"
              >
                {/* 왼쪽: 로고 박스 */}
                <div className="flex items-center justify-center w-11 h-11 bg-white rounded-full shadow-sm">
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    className="w-5 h-5"
                    alt="google"
                  />
                </div>

                {/* 중앙: 텍스트 (모바일에선 짧게) */}
                <span className="flex-1 text-[15px] font-bold text-[#3B82F6] dark:text-blue-300 tracking-tight">
                  {language === 'ko' ? '구글로 시작하기' : 'Sign in with Google'}
                </span>

                {/* 오른쪽: 빈 공간 또는 작은 화살표로 균형 맞춤 */}
                <div className="w-11 h-11 flex items-center justify-center opacity-20">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            {/* 하단 여유 공간 및 보안 뱃지 */}
            <div className="pt-4 opacity-50">
              <p className="text-[11px] text-stone-300 font-bold uppercase tracking-widest">
                100% Secure & Free
              </p>
            </div>
          </div>
        )}

        {/* 하단 로그인 안내 (Step 1, 2에서만 표시) */}
        {(step === 1 || step === 2) && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            {/* 배경과 대비를 준 실질적인 버튼 형태의 가이드 */}
            <div className="inline-block w-full max-w-[300px] p-[1px] bg-gradient-to-r from-transparent via-stone-200 dark:via-slate-700 to-transparent mb-6">
              {/* 얇은 그라데이션 선으로 위아래 구분 */}
            </div>

            <div className="space-y-3">
              <p className="text-[14px] text-stone-500 dark:text-slate-400 font-bold tracking-tight">
                {t.already_member}
              </p>

              <button
                onClick={() => hasId()}
                className="inline-flex items-center justify-center px-8 py-3 bg-white dark:bg-slate-900 border-2 border-[#3B82F6] text-[#3B82F6] rounded-full font-black text-[15px] shadow-[0_8px_20px_rgba(59,130,246,0.12)] hover:bg-[#3B82F6] hover:text-white transition-all duration-300 active:scale-[0.97]"
              >
                {t.login_now}
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M13 7l5 5-5 5M6 7l5 5-5 5" />
                </svg>
              </button>
            </div>

            {/* 보안 및 신뢰 강조 문구 */}
            <p className="mt-8 text-[11px] text-stone-300 dark:text-slate-600 font-bold tracking-[0.15em] uppercase">
              Protected by SajaSaju Security
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
