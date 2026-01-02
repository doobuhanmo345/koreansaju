import React, { useState, useEffect, useMemo } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  SparklesIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
  LanguageIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/solid';
import { CakeIcon } from '@heroicons/react/24/outline';
import FourPillarVis from '../component/FourPillarVis';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import { useLanguage } from '../context/useLanguageContext';
import dayStem from '../data/dayStem.json';
import { calculateSajuData } from '../utils/sajuLogic';

export default function Ad() {
  const { language, setLanguage } = useLanguage();
  const [sajuData, setSajuData] = useState();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState('');
  const [selectedReports, setSelectedReports] = useState(['general']);
  const [selectedReport, setSelectedReport] = useState();
  const birthInit = {
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
  };
  const [birthData, setBirthData] = useState({
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
  });
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [email, setEmail] = useState(localStorage.getItem('saved_email') || '');
  const memoizedBirthDate = useMemo(() => {
    const { year, month, day, hour, minute } = birthData;
    if (!year || !month || !day) return null;
    const pad = (n) => n?.toString().padStart(2, '0') || '00';
    const formatted = `${year}-${pad(month)}-${pad(day)}T${timeUnknown ? '12' : pad(hour)}:${timeUnknown ? '00' : pad(minute)}`;
    return new Date(formatted);
  }, [birthData, timeUnknown]);
  const pad = (n) => n?.toString().padStart(2, '0') || '00';
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

  const { saju } = useSajuCalculator(memoizedBirthDate, timeUnknown);

  const isYearDone = birthData.year.length === 4;
  const isMonthDone = birthData.month.length >= 1;
  const isDayDone = birthData.day.length >= 1;
  const isHourDone = birthData.hour.length >= 1;
  const isMinuteDone = birthData.minute.length >= 1;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  // 뒤로가기 로직 함수
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
  // sajuData는 제공해주신 Object 기준입니다.
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
    } else if (step === 4) setStep(3);
    else if (step === 5) setStep(0);
    else if (step === 1) setStep(0);
  };
  const startAna = () => {
    setIsAnalyzing(true);

    // 메시지를 순차적으로 변경하여 분석하는 느낌을 줌
    const texts =
      language === 'ko'
        ? [
            '천간과 지지를 분석 중입니다...',
            '오행의 기운을 계산하고 있습니다...',
            '운명의 흐름을 읽어내는 중...',
          ]
        : [
            'Analyzing Heavenly Stems...',
            'Calculating Five Elements...',
            'Reading the flow of destiny...',
          ];

    setLoadingText(texts[0]);
    setTimeout(() => setLoadingText(texts[1]), 1000);
    setTimeout(() => setLoadingText(texts[2]), 2000);

    // 3초 뒤에 다음 단계로 이동
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(3);
    }, 3000);
  };
  const restart = () => {
    setGender('');
    setTimeUnknown(false);
    setBirthData(birthInit);
    setStep(0);
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
  const handleFinalSubmit = async () => {
    // 1. 이메일 유효성 검사
    if (!email.includes('@')) {
      alert(language === 'ko' ? '올바른 이메일을 입력해주세요.' : 'Please enter a valid email.');
      return;
    }

    // 2. 리포트 선택 여부 검사 (최소 1개 이상)
    if (selectedReports.length === 0) {
      alert(
        language === 'ko'
          ? '받아보실 리포트 항목을 하나 이상 선택해주세요.'
          : 'Please select at least one report item.',
      );
      return;
    }

    try {
      // Firebase에 데이터 저장
      await addDoc(collection(db, 'ad_leads'), {
        email,
        gender,
        birthData,
        timeUnknown,
        language,
        // 🚀 추가된 부분: 유저가 선택한 리포트 목록 저장
        requestedReport: selectedReport,
        timestamp: serverTimestamp(),
        source: 'insta_ad',
        // 필요하다면 분석된 오행 결과 요약도 함께 저장하면 좋습니다
        sajuSummary: {
          core: preview.coreText,
          dominant: preview.dominantText,
        },
      });

      localStorage.setItem('saved_email', email);
      setStep(5);
    } catch (err) {
      console.error('데이터 저장 실패:', err);
      alert(
        language === 'ko'
          ? '저장에 실패했습니다. 잠시 후 다시 시도해주세요.'
          : 'Save failed. Please try again.',
      );
    }
  };
  const handleEdit = () => {
    setBirthData(birthInit);
    setGender(null);
    setTimeUnknown(false);
    setStep(1);
  };
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
  const me = saju?.sky1;

  const me_exp =
    language === 'ko'
      ? dayStem.find((i) => i.name_kr === me)?.full_text_ko
      : dayStem.find((i) => i.name_kr === me)?.full_text_en;
  const putGender = !gender;
  const putYear = !!gender && !birthData?.year;
  const putMonth = !!gender && !!birthData?.year && !birthData?.month;
  const putDay = !!gender && !!birthData?.year && !!birthData?.month && !birthData?.day;
  const putHour =
    !!gender && !!birthData?.year && !!birthData?.month && !!birthData?.day && !birthData?.hour;
  const putMin =
    !!gender &&
    !!birthData?.year &&
    !!birthData?.month &&
    !!birthData?.day &&
    !!birthData?.hour &&
    !birthData?.minute;
  const putComp =
    !!gender &&
    !!birthData?.year &&
    !!birthData?.month &&
    !!birthData?.day &&
    !!birthData?.hour &&
    !!birthData?.minute;
  const putTimeUnknown =
    !!gender && !!birthData?.year && !!birthData?.month && !!birthData?.day && timeUnknown;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-2">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-5 border border-slate-100 dark:border-slate-800">
        {/* 뒤로가기 버튼: Step 0이 아닐 때만 노출 */}
        {/* 뒤로가기 버튼: 시인성 강화 버전 */}
        {step > 0 && !isAnalyzing && (
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
        )}{' '}
        {step > 0 && !isAnalyzing && (
          <button
            onClick={handleBack}
            className="absolute left-6 top-7 z-10 p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}
        {step === 0 && (
          <div className="space-y-6 py-4 animate-in fade-in duration-500">
            <div className="text-center">
              <LanguageIcon className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
              <h2 className="text-xl font-black dark:text-white">Select Language / 언어 선택</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  setLanguage('ko');
                  setStep(1);
                }}
                className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-lg dark:text-white border-2 border-transparent hover:border-indigo-500 transition-all"
              >
                한국어
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  setStep(1);
                }}
                className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-lg dark:text-white border-2 border-transparent hover:border-indigo-500 transition-all"
              >
                English
              </button>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              {/* 우측 상단 프로그레스 바 배치 */}

              <h2 className="text-md font-black dark:text-white flex items-center justify-center gap-2">
                {language === 'ko'
                  ? '생년월일을 바탕으로 나의 오행을 분석합니다'
                  : 'Analyzing your Five Elements based on your birth date.'}
              </h2>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2 mb-4">
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${gender === g ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 dark:border-slate-800 dark:text-white'}`}
                  >
                    {g === 'male'
                      ? language === 'ko'
                        ? '남성'
                        : 'Male'
                      : language === 'ko'
                        ? '여성'
                        : 'Female'}
                  </button>
                ))}
              </div>

              {/* 연도 */}
              <div
                className={`grid transition-all duration-500 ease-in-out ${gender ? 'grid-rows-[1fr] opacity-100 mb-2' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <input
                    type="number"
                    placeholder={language === 'ko' ? '태어난 연도 (YYYY)' : 'Birth Year (YYYY)'}
                    className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                    onChange={(e) =>
                      setBirthData({ ...birthData, year: e.target.value.slice(0, 4) })
                    }
                  />
                </div>
              </div>

              {/* 월 */}
              <div
                className={`grid transition-all duration-500 ease-in-out ${isYearDone ? 'grid-rows-[1fr] opacity-100 mb-2' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <input
                    type="number"
                    placeholder={language === 'ko' ? '태어난 월 (MM)' : 'Birth Month (MM)'}
                    className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                    onChange={(e) =>
                      setBirthData({ ...birthData, month: e.target.value.slice(0, 2) })
                    }
                  />
                </div>
              </div>

              {/* 일 */}
              <div
                className={`grid transition-all duration-500 ease-in-out ${isMonthDone ? 'grid-rows-[1fr] opacity-100 mb-2' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <input
                    type="number"
                    placeholder={language === 'ko' ? '태어난 일 (DD)' : 'Birth Day (DD)'}
                    className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                    onChange={(e) =>
                      setBirthData({ ...birthData, day: e.target.value.slice(0, 2) })
                    }
                  />
                </div>
              </div>

              {/* 시간(시) - 개별 분리 */}
              <div
                className={`grid transition-all duration-500 ease-in-out ${isDayDone && !timeUnknown ? 'grid-rows-[1fr] opacity-100 mb-2' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <input
                    type="number"
                    placeholder={language === 'ko' ? '태어난 시 (HH)' : 'Birth Hour (HH)'}
                    className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                    onChange={(e) =>
                      setBirthData({ ...birthData, hour: e.target.value.slice(0, 2) })
                    }
                  />
                </div>
              </div>

              {/* 시간(분) - 개별 분리 */}
              <div
                className={`grid transition-all duration-500 ease-in-out ${isHourDone && !timeUnknown ? 'grid-rows-[1fr] opacity-100 mb-2' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <input
                    type="number"
                    placeholder={language === 'ko' ? '태어난 분 (mm)' : 'Birth Minute (mm)'}
                    className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                    onChange={(e) =>
                      setBirthData({ ...birthData, minute: e.target.value.slice(0, 2) })
                    }
                  />
                </div>
              </div>

              {/* 시간 모름 체크박스 */}
              <div
                className={`grid transition-all duration-500 ease-in-out ${isDayDone ? 'grid-rows-[1fr] opacity-100 mb-2' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <label className="flex items-center gap-2 cursor-pointer w-fit mx-auto pb-1 overflow-hidden">
                  <input
                    type="checkbox"
                    checked={timeUnknown}
                    onChange={(e) => setTimeUnknown(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {language === 'ko' ? '시간을 몰라요' : "I don't know time"}
                  </span>
                </label>
              </div>
            </div>
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-1.5 animate-pulse">
                <ChatBubbleLeftRightIcon className="w-4 h-4 text-indigo-500" />
                <span className="text-[12px] font-black text-indigo-600 dark:text-indigo-400">
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
              <div className="flex items-center gap-1">
                <CakeIcon className="w-4 h-4 text-indigo-500" />
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
        {step === 2 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-500 relative min-h-[500px]">
            {/* --- 분석 중 로딩 오버레이 (돋보기 애니메이션) --- */}
            {isAnalyzing && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-900/95 rounded-[2rem] backdrop-blur-md animate-in fade-in duration-300">
                <div className="relative mb-6">
                  {/* 돋보기 아이콘 애니메이션 */}
                  <div className="text-7xl animate-bounce drop-shadow-2xl">🔍</div>
                  {/* 하단 그림자/빛 효과 */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-indigo-500/20 rounded-[100%] blur-lg animate-pulse"></div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-xl font-black dark:text-white tracking-tight animate-pulse">
                    {loadingText}
                  </p>
                  <div className="flex justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}

            {/* --- 상단 타이틀 --- */}
            <div className="text-center">
              <h2 className="text-xl font-black dark:text-white">
                {language === 'ko' ? '입력 정보 확인' : 'Check Your Info'}
              </h2>
              <p className="text-xs font-bold text-slate-500 mt-1.5 px-4 leading-relaxed">
                {language === 'ko'
                  ? '입력된 생년월일에서 도출된 오행을 기반으로 나의 사주를 분석합니다.'
                  : 'Analyzing your Saju based on the Five Elements derived from your birth date.'}
              </p>
            </div>

            {/* --- 정보 확인 카드 --- */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {language === 'en' ? 'Gender' : '성별'}
                  </p>
                  <p className="text-sm font-black dark:text-white">
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
                  <p className="text-sm font-black dark:text-white">
                    {birthData.year}.{birthData.month}.{birthData.day}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {language === 'en' ? 'Birth Time' : '시분'}
                  </p>
                  <p className="text-sm font-black dark:text-white">
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

            {/* --- 시각화 및 분석 버튼 영역 --- */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-inner">
              {/* 사주 오행 그래프 컴포넌트 */}
              <div className="relative">
                {!isAnalyzing && (
                  <div className="absolute left-[45%] -translate-x-1/2 -top-5 z-[50] flex flex-col items-center">
                    {/* 말풍선 몸통 */}
                    <div className="bg-amber-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-xl animate-pulse whitespace-nowrap">
                      {language === 'ko' ? '나의 성향' : 'My Personality'}
                    </div>
                    {/* 말풍선 꼬리 (삼각형) */}
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-600 -mt-[1px]"></div>
                  </div>
                )}

                {saju && <FourPillarVis saju={saju} isTimeUnknown={timeUnknown} />}
              </div>
              <div className="mt-3 bg-slate-50 dark:text-white text-sm dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
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
                    <p className="text-[10px] font-black dark:text-slate-100 leading-relaxed break-keep tracking-[0.1em]">
                      {preview.coreText} {preview.dominantText}
                    </p>
                  </section>
                </div>
              </div>
              {/* 분석 실행 버튼 오버레이 (로딩 중이 아닐 때만 노출) */}
              {!isAnalyzing && (
                <div className="bg-gradient-to-t from-white dark:from-slate-900 via-white/80 dark:via-slate-900/80 to-transparent flex items-center justify-center pt-6">
                  <button
                    onClick={startAna}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <SparklesIcon className="w-5 h-5" />
                    {language === 'ko' ? '이 정보로 분석 시작' : 'Start Analysis'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Step 2 ~ 4 (기존 유지) */}
        {step === 3 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-black text-center dark:text-white">
              {language === 'ko' ? '분석 결과 요약' : 'Analysis Preview'}
            </h2>

            <div className="relative  overflow-hidden rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              {/* 50줄 분량의 텍스트 영역 (70%만 보이게 설정) */}
              <div className="space-y-3  opacity-80 select-none">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <p className="text-sm font-black dark:text-white">
                    {language === 'ko' ? '종합 운세 분석 리포트' : 'Comprehensive Fortune Report'}
                  </p>
                </div>
                <div className="mt-3 bg-slate-50 dark:text-white text-sm dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
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
                      <p className="text-lg font-black dark:text-white leading-snug break-keep">
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
                            .split(']')
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
                <div className="text-[13px] leading-relaxed dark:text-slate-300"> {me_exp}</div>
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
                  onClick={() => setStep(4)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-[0_10px_20px_rgba(79,70,229,0.3)] active:scale-95 transition-all"
                >
                  {language === 'ko' ? '전체 리포트 열람하기' : 'Unlock Full Report'}
                </button>
              </div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 text-center py-2">
            {/* 상단 아이콘 */}
            <div className="relative inline-block">
              <EnvelopeIcon className="w-12 h-12 text-indigo-500 mx-auto animate-bounce [animation-duration:3s]" />
              <div className="absolute -right-1 -top-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
            </div>

            {/* 제목 섹션 */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold dark:text-white tracking-tight">
                {language === 'ko' ? '맞춤 리포트 구성' : 'Customize Your Report'}
              </h2>
              <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 px-4 break-keep">
                {language === 'ko'
                  ? '이메일로 받아보고 싶은 상세 분석 항목을 모두 선택해주세요.'
                  : 'Please select all the detailed analysis items you wish to receive.'}
              </p>
            </div>

            {/* 🚀 리포트 선택 란 (멀티 셀렉트 칩) */}
            <div className="grid grid-cols-2 gap-2 px-2">
              {[
                { id: '2026', icon: '📅', ko: '2026 신년운세', en: '2026 Fortune' },
                { id: 'love', icon: '💖', ko: '애정/결혼운', en: 'Love & Romance' },
                { id: 'money', icon: '💰', ko: '재물/성공운', en: 'Wealth & Career' },
                { id: 'health', icon: '🌿', ko: '건강/심리분석', en: 'Health & Mind' },
              ].map((item) => {
                // 현재 아이템이 선택되었는지 확인
                const isSelected = selectedReport === item.id;

                return (
                  <button
                    key={item.id}
                    type="button" // form 제출 방지
                    onClick={() => setSelectedReport(item.id)} // 클릭 시 해당 ID로 즉시 변경
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 ring-4 ring-indigo-500/10'
                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70'
                    }`}
                  >
                    <span
                      className={`text-xl transition-transform ${isSelected ? 'scale-110' : ''}`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-[14px] font-bold ${
                        isSelected
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {language === 'ko' ? item.ko : item.en}
                    </span>

                    {/* 선택되었을 때만 우측에 체크 표시 (옵션) */}
                    {isSelected && (
                      <div className="ml-auto w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={4}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 입력 및 전송 섹션 */}
            <div className="space-y-3 pt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center dark:text-white transition-all shadow-inner"
              />
              <button
                onClick={handleFinalSubmit}
                disabled={selectedReports.length === 0} // 아무것도 선택 안하면 비활성화
                className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 ${
                  selectedReports.length > 0
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {language === 'ko'
                  ? `${selectedReports.length}개의 리포트 무료로 받기`
                  : `Get ${selectedReports.length} Free Reports`}
              </button>
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="space-y-5 animate-in zoom-in-95 duration-500 text-center">
            <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-[1.5rem] border-2 border-emerald-100 dark:border-emerald-900">
              <ShieldCheckIcon className="w-10 h-10 text-emerald-500 mx-auto mb-1" />
              <h2 className="text-lg font-black text-emerald-900 dark:text-emerald-400">
                {language === 'ko' ? '분석 완료!' : 'Success!'}
              </h2>
            </div>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-xl font-black"
              >
                WhatsApp
              </a>
              <a
                href="#"
                className="flex items-center justify-center gap-2 py-3 bg-[#0088cc] text-white rounded-xl font-black"
              >
                Telegram
              </a>
            </div>
            <button
              onClick={restart}
              className="text-xs font-bold text-slate-400 underline dark:text-slate-500"
            >
              Restart / 다시하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
