import React, { useEffect, useState, useMemo } from 'react';
import SajuIntroSection from '../component/SajuIntroSection';
import { useLanguage } from '../context/useLanguageContext';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import { ChatBubbleLeftRightIcon, CakeIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';
import { calculateSajuData } from '../utils/sajuLogic';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthContext } from '../context/useAuthContext';
import dayStem from '../data/dayStem.json';
import dayBranch from '../data/dayBranch.json';
const PayWall = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [guestId, setGuestId] = useState('');
  const [sajuData, setSajuData] = useState();
  const [step, setStep] = useState(0.5); // '0.5' '1', 'result'
  const { language, setLanguage } = useLanguage();
  const { user, userData, loadingUser } = useAuthContext();

  // 1. 비회원용 익명 ID 생성 및 관리
  useEffect(() => {
    // 1. 로그인 정보를 아직 불러오는 중이라면 아무것도 하지 않고 대기
    if (loadingUser) return;

    // 2. 로딩이 끝났는데 userData가 있다면 (회원이면) 로그를 남기지 않음
    if (userData) return;

    // 3. 비회원임이 확실할 때만 ID 생성 및 로그 실행
    let id = localStorage.getItem('guest_id');
    if (!id) {
      id = `guest_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guest_id', id);
    }
    setGuestId(id);

    // [STEP 1] 확실한 비회원 방문 로그
    logStep(step, id);
  }, [step, userData, loadingUser]); // 의존성 배열에 loading과 userData 추가

  // 공통 로그 저장 함수
  const logStep = async (stepName, currentGuestId, extraData = {}) => {
    // userData가 존재하면(로그인 상태면) 함수를 여기서 종료
    if (userData) return;

    try {
      await addDoc(collection(db, 'paywall_funnel_logs'), {
        step: stepName,
        uid: currentGuestId || guestId,
        isLoggedIn: false, // 비회원임을 명확히 기록
        timestamp: serverTimestamp(),
        ...extraData,
      });
    } catch (e) {
      console.error('Log Error: ', e);
    }
  };
  const handlePaymentClick = async () => {
    setShowEmailInput(true);

    try {
      // 'analytics' 컬렉션에 클릭 이벤트 저장
      await addDoc(collection(db, 'paywall_analytics'), {
        eventType: 'PAYMENT_BUTTON_CLICK',
        saju: saju,
        page: 'report_paywall',
        selected: selectedReport,
        price: 29,
        timestamp: serverTimestamp(),
      });
      console.log('Click tracked');
    } catch (e) {
      console.error('Error tracking click: ', e);
    }
  };

  // 2. 이메일 제출 시 실행 (이메일 저장)
  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      // 'waitlist' 컬렉션에 이메일 정보 저장
      await addDoc(collection(db, 'paywall_waitlist'), {
        email: email,
        saju: saju,
        source: 'report_paywall', // 유입 경로
        selected: selectedReport,
        status: 'pending',
        timestamp: serverTimestamp(),
      });
      setIsSubmitted(true);
    } catch (e) {
      console.error('Error adding document: ', e);
      alert('잠시 후 다시 시도해주세요.');
    }
  };
  useEffect(() => setLanguage('en'), [step]);
  //생일 넣기
  const [gender, setGender] = useState('');

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
  // 초기값은 null 혹은 첫 번째 항목의 ID
  const [selectedReport, setSelectedReport] = useState(null);

  const reportOptions = [
    { id: 'patterns', title: 'Relationship Patterns', ko: '연애 패턴', icon: '❤️' },
    { id: 'blindspots', title: 'Emotional Blind Spots', ko: '정서적 사각지대', icon: '🌙' },
    { id: 'career', title: 'Career Decision Style', ko: '커리어 결정 스타일', icon: '💼' },
    { id: 'money', title: 'Money Psychology', ko: '금전 심리', icon: '💰' },
    { id: 'burnout', title: 'Burnout Life Cycle', ko: '번아웃 라이프 사이클', icon: '⏳' },
  ];
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
      setStep('result');
    }, 3000);
  };
  const restart = () => {
    setGender('');
    setTimeUnknown(false);
    setBirthData(birthInit);
    setStep(0.5);
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

  //뒤로 가기
  const handleBack = () => {
    if (step === 'result') {
      setBirthData(birthInit);
      setTimeUnknown(false);
      setGender(null);
      setStep(1);
    } else if (step === 1) {
      setStep(0.5);
      console.log(step);
    }
  };
  const isFormValid = getProgress() === 100;

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
    if (!selectedReport) {
      alert(
        language === 'ko'
          ? '분석할 리포트를 하나 선택해주세요.'
          : 'Please select one report to start your analysis.',
      );
      return;
    }

    // 모든 검증 통과
    setStep('result');
  };
  //result
    const me = saju?.sky1;
    const meg = saju?.grd1;
  
    const me_exp = dayStem.find((i) => i.name_kr === me);
    const me_exp_g = dayBranch.find((i) => i.name_kr === meg);

  return (
    <>
      {step >= 1 && !isAnalyzing && (
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
      <div className="max-w-3xl mx-auto">
        {step === 0.5 && (
          <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            <SajuIntroSection setStep={setStep} language={language} />
          </div>
        )}
        {step === 1 && (
          <>
            <div className="space-y-4 py-10 min-h-screen  font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 px-6">
              <div className="text-center">
                <h2 className="text-md font-black   flex items-center justify-center gap-2">
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
                      className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${gender === g ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 dark:border-slate-800  '}`}
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
                  className={`grid transition-all duration-500 ease-in-out ${gender ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <input
                      type="number"
                      placeholder={
                        language === 'ko' ? '태어난 연도를 입력해주세요' : 'Birth Year(YYYY)'
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
                        language === 'ko' ? '태어난 월을 선택해주세요' : 'Birth Month(MM)'
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
                      placeholder={language === 'ko' ? '태어난 날을 선택해주세요' : 'Birth Day(DD)'}
                      value={birthData.day}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center mt-1"
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
                      className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-xl   border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
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
                      className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-xl   border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
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
                    <span className="text-lg font-bold text-slate-500 dark:text-slate-400">
                      {language === 'ko' ? '시간을 몰라요' : 'time unknown'}
                    </span>
                  </label>
                </div>
              </div>
              <div>
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
              </div>
              <div className="flex justify-between items-center px-1">
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
                <div className="mt-8 p-6 bg-white rounded-2xl border border-indigo-100 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    {language === 'ko' ? '집중 분석할 리포트 선택' : 'Choose Your Main Insight'}
                  </h3>

                  <div className="grid gap-3">
                    {reportOptions.map((report) => (
                      <div
                        key={report.id}
                        onClick={() => setSelectedReport(report.id)} // 클릭 시 해당 ID로 교체
                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedReport === report.id
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-100 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <span className="text-2xl mr-4">{report.icon}</span>
                        <div className="flex-1">
                          <p
                            className={`font-bold ${selectedReport === report.id ? 'text-indigo-700' : 'text-gray-700'}`}
                          >
                            {language === 'ko' ? report.ko : report.title}
                          </p>
                        </div>

                        {/* 선택 표시 동그라미 (Radio 스타일) */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedReport === report.id
                              ? 'border-indigo-500 bg-indigo-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedReport === report.id && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isFormValid && selectedReport && (
                <button
                  onClick={handleNextStep}
                  disabled={!selectedReport}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg animate-in fade-in zoom-in-95 duration-300 active:scale-95 transition-all mt-4"
                >
                  {language === 'ko' ? '나의 사주 오행 분석하기' : 'Analyze My Five Elements'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {step === 'result' && (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
          {/* 1. Hero / Header Area */}
          <header className="max-w-3xl mx-auto pt-16 pb-10">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full">
              Personalized Reading
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Your Cosmic Blueprint</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 border-l-2 border-indigo-200 pl-4">
              <div>
                {/* <span className="block font-medium text-slate-800">Alex Kim</span> */}
                <span>
                  {birthData.month}/{birthData.day}/{birthData.year}
                  {timeUnknown ? '' : `${birthData.hour}:${birthData.minute}`}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-slate-200"></div>
              <p className="italic text-xs">Analysis based on Classic Myeongni Theory</p>
            </div>
          </header>

          <main className="max-w-3xl mx-auto pb-24">
            {/* Section 1: Personality */}
            <section className="bg-white rounded-2xl p-8 shadow-sm mb-8 border border-slate-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                1. Core Personality Architecture
              </h2>
              <div className="space-y-4 leading-relaxed text-slate-600">
                {/* 텍스트 10줄 제한 출력 부분 */}
                <div
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 10,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'pre-line', // 줄바꿈 유지
                  }}
                >
                  {me_exp.full_text_en}
                </div>
              </div>
            </section>

            {/* Section 2: Career/Relationship */}
            <section className="bg-white rounded-2xl p-8 shadow-sm mb-8 border border-slate-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                2. You Tend to...
              </h2>
              <div className="space-y-4 leading-relaxed text-slate-600">
                <div
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 10,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'pre-line', // 줄바꿈 유지
                  }}
                >
                  {me_exp_g.full_text_en}
                </div>
              </div>
            </section>

            {/* Section 3: The Paywall Section (Blur) */}
            <section className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 opacity-40 blur-[2px] pointer-events-none select-none">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                  3. 2026 Wealth & Luck Cycle
                </h2>
                <p className="mb-4">
                  The upcoming year of the Fire Horse brings a massive shift in...
                </p>
                <p>Your financial pillar shows a clash that could mean either huge gain or...</p>
                <p>Specific months to watch for investment are March and September when...</p>
              </div>

              {/* Fake Paywall CTA Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pt-10">
                <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-indigo-50 text-center transform translate-y-4">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Unlock Your Full Destiny</h3>
                  <p className="text-slate-500 text-sm mb-8">
                    Get the full 15-page deep dive including monthly fortune, wealth strategy, and
                    health warnings.
                  </p>

                  {!isSubmitted ? (
                    <div className="space-y-4">
                      {/* 단계 1: 결제 버튼 (처음엔 이것만 보임) */}
                      {!showEmailInput ? (
                        <button
                          type="button"
                          onClick={handlePaymentClick} // 클릭 시 이메일 입력창 등장
                          className="w-full py-4 bg-indigo-700 text-white rounded-2xl font-bold text-lg hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-200"
                        >
                          Unlock Full Report — $29
                        </button>
                      ) : (
                        /* 단계 2: 이메일 입력창 (결제 버튼 클릭 후 등장) */
                        <form
                          onSubmit={handleWaitlistSubmit}
                          className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
                        >
                          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-sm text-amber-800 font-medium">
                              🚀 Payment system launching soon!
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              Leave your email to get early access and a 50% discount when we open.
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="email"
                              placeholder="Enter your email"
                              required
                              autoFocus // 등장하자마자 커서 깜빡이게 (인디고 커서 나오겠죠?)
                              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                            <button
                              type="submit"
                              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors"
                            >
                              Notify Me
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowEmailInput(false)}
                            className="text-xs text-slate-400 underline w-full text-center"
                          >
                            Back to price info
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    /* 단계 3: 완료 상태 */
                    <div className="py-8 bg-green-50 rounded-2xl border border-green-100 text-center animate-in zoom-in duration-300">
                      <p className="text-green-700 font-bold text-lg">
                        You're on the priority list! ✨
                      </p>
                      <p className="text-green-600 text-sm mt-1 px-6">
                        We'll notify you at <strong>{email}</strong> <br />
                        as soon as the full report is ready.
                      </p>
                    </div>
                  )}
                  <p className="mt-6 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Trusted by 5,000+ Seekers
                  </p>
                </div>
              </div>
            </section>

            {/* Footer Note */}
            <footer className="mt-40 text-center">
              <p className="text-xs text-slate-400 leading-loose">
                "Saju is a map, not the destination. Your will is the ultimate compass."
                <br />© 2026 SAZA SAJU Methodology. All rights reserved.
              </p>
            </footer>
          </main>
        </div>
      )}
    </>
  );
};

export default PayWall;
