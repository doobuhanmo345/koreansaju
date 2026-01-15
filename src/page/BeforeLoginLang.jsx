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
  const [step, setStep] = useState(2);
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
    setStep(3);
  };
  const handleEdit = () => {
    setBirthData(birthInit);
    setGender(null);
    setTimeUnknown(false);
    setStep(2);
  };
  // [데이터 무결성: 요구하신 Z 필드명 정확히 반영]
  const [tryLogin, setTryLogin] = useState(false);
  const me = saju?.sky1;

  const me_exp = dayStem.find((i) => i.name_kr === me);

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
    // 1. 로그인 시도 중이 아니거나 인증 정보가 없으면 아예 실행 안 함
    if (!tryLogin || !user) return;

    // 2. [가장 중요] 데이터가 실제로 로드되었는지 확인
    // 만약 userData가 초기값(null)이라면, 잠시 대기해야 합니다.
    // 이 문제를 피하기 위해 'userData'가 확실히 들어오거나,
    // 혹은 서버에서 '데이터 없음'이 확정될 때까지 기다리는 조건이 필요합니다.

    const checkUser = async () => {
      // userData가 아직 없는 경우(null 또는 undefined) 0.5초~1초 정도 짧게 대기하며 재확인
      if (!userData) {
        // 만약 훅에서 loading 상태를 제공한다면 그것을 쓰는게 베스트입니다.
        // 예: if (loading) return;
        return;
      }

      if (userData.birthDate) {
        // CASE 1: 기존 회원
        window.location.replace('/');
      } else {
        // CASE 2: 아이디는 있는데 생일만 없는 회원
        alert(language === 'ko' ? '사주 정보를 입력해주세요.' : 'Please enter info.');
        setStep(2);
        setTryLogin(false);
      }
    };

    checkUser();
  }, [user, userData, tryLogin]);
  useEffect(() => {
    const saveAndRedirect = async () => {
      if (user?.uid && step === 5) {
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

  const t = {
    ko: {
      step1: '언어를 선택해주세요',
      step2: '생년월일을 바탕으로 나의 오행을 분석합니다',
      step3: '입력 정보 확인',
      step3_desc: '로그인하시면 결과를 저장하고 리포트를 확인합니다.',
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
      step1: 'Select Language',
      step2: 'Analyzing your Five Elements based on your birth date.',
      step3: 'Check Your Info',
      step3_desc: 'Login to save your data.',
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

  console.log(systemLang);
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
    if (step === 3) {
      setBirthData(birthInit);
      setTimeUnknown(false);
      setGender(null);
      setStep(2);
    } else if (step === 4) {
      setStep(3);
    } else if (step === 5) {
      setStep(4);
    } else if (step === 4) setStep(1);
    else if (step === 2) setStep(1);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      {step > 1 && !isAnalyzing && (
        <button
          onClick={handleBack}
          className="absolute left-5 top-6 z-20 p-2 rounded-full 
               bg-white dark:bg-slate-800 
               text-indigo-600 dark:text-indigo-400 
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
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-black text-center dark:text-white">{t.step1}</h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setLanguage('ko');
                  setStep(2);
                }}
                className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-bold dark:text-white hover:border-indigo-500 transition-all"
              >
                한국어
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  setStep(2);
                }}
                className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-bold dark:text-white hover:border-indigo-500 transition-all"
              >
                English
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <CakeIcon className="w-12 h-12 text-amber-500 mx-auto mb-2" />
              <h2 className="text-2xl font-black dark:text-white">{t.step2}</h2>
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
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
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
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center mt-1"
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
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center mt-1"
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
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center mt-1"
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
                        className="flex-1 min-w-0 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                        onChange={(e) =>
                          setBirthData({ ...birthData, hour: e.target.value.slice(0, 2) })
                        }
                      />
                      <span className="font-bold dark:text-white text-xl px-1">:</span>
                      <input
                        type="number"
                        placeholder={language === 'ko' ? '태어난 시간' : 'Birth time'}
                        value={birthData.minute}
                        className="flex-1 min-w-0 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
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
                      className="w-5 h-5 accent-indigo-500"
                    />
                    <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-500 transition-colors">
                      {t.time_unknown}
                    </span>
                  </label>
                </div>
              </div>
            </div>
            {/* 추가 테스트 */}
            <div className="flex items-center gap-1.5 animate-pulse">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-indigo-500" />
              <span className="text-[18px] font-black text-indigo-600 dark:text-indigo-400">
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
                {/* <CakeIcon className="w-4 h-4 text-indigo-500" /> */}
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  Progress
                </span>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 text-xs font-black">
                {getProgress()}%
              </span>
            </div>

            {/* 바 본체 */}
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-indigo-500 transition-all duration-700 ease-out rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            {isFormValid && (
              <button
                onClick={handleNextStep}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg animate-in fade-in zoom-in-95 duration-300 active:scale-95 transition-all mt-4"
              >
                {language === 'ko' ? '나의 사주 오행 분석하기' : 'Analyze My Five Elements'}
              </button>
            )}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-5 text-center animate-in `slide-in-from-right-4">
            <div className="space-y-1">
              <SparklesIcon className="w-10 h-10 text-yellow-400 mx-auto animate-bounce" />
              <h2 className="text-xl font-black dark:text-white">{t.step3}</h2>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-indigo-200 dark:border-indigo-900">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      {language === 'en' ? 'Gender' : '성별'}
                    </p>
                    <p className="text-sm font-black  ">
                      {gender === 'male'
                        ? language === 'ko'
                          ? '남성 ♂'
                          : 'Male ♂'
                        : language === 'ko'
                          ? '여성 ♀'
                          : 'Female ♀'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      {language === 'en' ? 'Birth of Date' : '생년월일'}
                    </p>
                    <p className="text-sm font-black  ">
                      {birthData.year}.{birthData.month}.{birthData.day}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      {language === 'en' ? 'Birth Time' : '시분'}
                    </p>
                    <p className="text-sm font-black  ">
                      {timeUnknown
                        ? language === 'ko'
                          ? '시간 모름'
                          : 'Unknown'
                        : `${birthData.hour}:${birthData.minute}`}
                    </p>
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      onClick={handleEdit}
                      className="px-3 py-1.5 bg-white dark:bg-slate-700 rounded-lg text-[11px] font-black text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-600 active:scale-95 transition-all"
                    >
                      {language === 'ko' ? '정보 수정' : 'Edit Info'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 일주 분석 텍스트 박스 (5줄 분량) */}
              <div className="">
                {!!sajuData && <FourPillarVis saju={saju} isTimeUnknown={timeUnknown} />}
              </div>
            </div>
            <p className="mt-4 text-[13px] text-slate-400 font-bold italic tracking-tight">
              <div className="mt-3 bg-slate-50   text-sm dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="py-2 space-y-8 text-left animate-in fade-in slide-in-from-bottom-3 duration-1000">
                  {/* 1. 핵심 정체성 - 가장 크게 강조 */}
                  <section className="px-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-lg">
                        {preview.coreEmoji}
                      </span>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {language === 'ko' ? 'Identity' : 'Identity'}
                      </h3>
                    </div>
                    <p className="text-lg font-black   leading-snug break-keep">
                      {preview.coreText}
                    </p>
                  </section>

                  {/* 구분선 없이 여백과 좌측 포인트 바 사용 */}
                  <div className="space-y-7 border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-6">
                    {/* 2. 지배적 에너지 */}
                    <section className="relative">
                      <div className="absolute -left-[31px] top-1 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                      <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                        {language === 'ko' ? 'Dominant Energy' : 'Dominant Energy'}
                      </h4>
                      <p className="text-[15px] font-bold text-slate-700 dark:text-slate-200">
                        {preview.dominantText}
                      </p>
                    </section>

                    {/* 3. 잠재 능력 */}
                    <section className="relative ">
                      <div className="absolute  -left-[31px] top-1 w-2 h-2 rounded-full bg-emerald-500" />
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                        {language === 'ko' ? 'Hidden Talents' : 'Hidden Talents'}
                      </h4>
                      <div className="text-[14px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                        {preview.talentText
                          ?.split(']')
                          .filter((t) => t.trim())
                          .map((item, idx) => (
                            <div key={idx} className="flex items-start gap-1">
                              <span>•</span>
                              <span>{item.replace('[', '')}</span>
                            </div>
                          ))}
                      </div>
                    </section>

                    {/* 4. 인생의 주기 */}
                    <section className="relative">
                      <div className="absolute -left-[31px] top-1 w-2 h-2 rounded-full bg-amber-500" />
                      <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">
                        {language === 'ko' ? 'Life Cycle' : 'Life Cycle'}
                      </h4>
                      <p className="text-[15px] font-bold text-slate-700 dark:text-slate-200">
                        {preview.daewoonText}
                      </p>
                    </section>
                  </div>
                </div>
              </div>
            </p>
            <button
              onClick={() => setStep(4)}
              className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {language === 'ko' ? '분석 보러가기' : 'Check analysis'}
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-black text-center  ">
              {language === 'ko' ? '분석 결과 요약' : 'Analysis Preview'}
            </h2>

            <div className="relative  overflow-hidden rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              {/* 50줄 분량의 텍스트 영역 (70%만 보이게 설정) */}
              <div className="space-y-3  opacity-80 select-none">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <p className="text-sm font-black  ">
                    {language === 'ko' ? '종합 운세 분석 리포트' : 'Comprehensive Fortune Report'}
                  </p>
                </div>
                <div className="mt-3 bg-slate-50   text-sm dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                  {/* 프리뷰 리포트 컨테이너 - 박스 중첩 없이 여백으로 구분 */}
                  <div className="py-2 space-y-8 text-left animate-in fade-in slide-in-from-bottom-3 duration-1000">
                    {/* 1. 핵심 정체성 - 가장 크게 강조 */}
                    <section className="px-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-lg">
                          {preview.coreEmoji}
                        </span>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          {language === 'ko' ? 'Identity' : 'Identity'}
                        </h3>
                      </div>
                      <p className="text-lg font-black   leading-snug break-keep">
                        {preview.coreText}
                      </p>
                    </section>

                    {/* 구분선 없이 여백과 좌측 포인트 바 사용 */}
                    <div className="space-y-7 border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-6">
                      {/* 2. 지배적 에너지 */}
                      <section className="relative">
                        <div className="absolute -left-[31px] top-1 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                          {language === 'ko' ? 'Dominant Energy' : 'Dominant Energy'}
                        </h4>
                        <p className="text-[15px] font-bold text-slate-700 dark:text-slate-200">
                          {preview.dominantText}
                        </p>
                      </section>

                      {/* 3. 잠재 능력 */}
                      <section className="relative ">
                        <div className="absolute  -left-[31px] top-1 w-2 h-2 rounded-full bg-emerald-500" />
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                          {language === 'ko' ? 'Hidden Talents' : 'Hidden Talents'}
                        </h4>
                        <div className="text-[14px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                          {preview.talentText
                            ?.split(']')
                            .filter((t) => t.trim())
                            .map((item, idx) => (
                              <div key={idx} className="flex items-start gap-1">
                                <span>•</span>
                                <span>{item.replace('[', '')}</span>
                              </div>
                            ))}
                        </div>
                      </section>

                      {/* 4. 인생의 주기 */}
                      <section className="relative">
                        <div className="absolute -left-[31px] top-1 w-2 h-2 rounded-full bg-amber-500" />
                        <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">
                          {language === 'ko' ? 'Life Cycle' : 'Life Cycle'}
                        </h4>
                        <p className="text-[15px] font-bold text-slate-700 dark:text-slate-200">
                          {preview.daewoonText}
                        </p>
                      </section>
                    </div>
                  </div>
                </div>
                <div className="text-[15px] leading-relaxed dark:text-slate-300 ">
                  {(language === 'ko' ? me_exp?.full_text_kr : me_exp?.full_text_en)
                    ?.split('\n')
                    ?.filter((text) => text.trim() !== '')
                    .map((sentence, index) => (
                      <p
                        key={index}
                        style={{
                          fontWeight: index === 0 ? 'bold' : 'normal',
                          fontSize: index === 0 ? '1.1rem' : '1rem', // 첫 줄만 살짝 키울 수도 있습니다
                          marginBottom: '0.8rem',
                        }}
                      >
                        {sentence}
                      </p>
                    ))}
                </div>
                {/* 반복문을 사용하여 50줄 분량의 더미 텍스트 생성 */}
              </div>

              {/* 하단 30% 가림막 및 버튼 영역 */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 dark:from-slate-950 dark:via-slate-950/80 to-transparent flex flex-col items-center justify-end pb-8 px-5">
                <div className="text-center mb-6">
                  <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 animate-bounce">
                    {language === 'ko'
                      ? '▼ 나머지 내용을 분석 중입니다'
                      : '▼ Analyzing the rest of the content'}
                  </p>
                </div>
                <button
                  onClick={() => setStep(5)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-[0_10px_20px_rgba(79,70,229,0.3)] active:scale-95 transition-all"
                >
                  {language === 'ko' ? '전체 리포트 받기' : 'Get Full Report'}
                </button>
              </div>
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 text-center">
            <ShieldCheckIcon className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-black dark:text-white">
              {language === 'ko' ? '무료 사주 보기' : 'Get Free Report'}
            </h2>
            <button
              onClick={() => login()}
              className="w-full flex items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-slate-700 dark:text-white hover:bg-slate-50 transition-all shadow-xl"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-6 h-6"
                alt="google"
              />
              {t.google}
            </button>
          </div>
        )}

        {/* 하단 로그인 안내 (Step 1, 2에서만 표시) */}
        {(step === 1 || step === 2) && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center animate-in fade-in duration-700">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {t.already_member}{' '}
              <button
                onClick={() => hasId()}
                className="text-indigo-600 dark:text-indigo-400 font-black hover:underline underline-offset-4 transition-all"
              >
                {t.login_now}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
