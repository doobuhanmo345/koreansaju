import React, { useEffect, useState, useMemo } from 'react';
import SajuIntroSection from '../component/SajuIntroSection2';
import { useLanguage } from '../context/useLanguageContext';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import { ref, get, child } from 'firebase/database';
import { database } from '../lib/firebase';
import { setDoc, doc, getDoc, arrayUnion } from 'firebase/firestore';
import {
  ChatBubbleLeftRightIcon,
  CakeIcon,
  ChevronLeftIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid';
import { Zap, Brain, Cpu, ChevronRight, Check, Search, Database, Users } from 'lucide-react';
import { calculateSajuData } from '../utils/sajuLogic';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthContext } from '../context/useAuthContext';
import dayStem from '../data/dayStem.json';
import dayBranch from '../data/dayBranch.json';
import { classNames } from '../utils/helpers';
import { fetchGeminiAnalysis } from '../api/gemini';
import AmaKr from './AmaKr';
import AdMyInfo from '../component/AdMyInfo';
import CopyUrlAd from '../component/CopyUrlAd';
const SazaTalkAdKr = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [guestId, setGuestId] = useState('');
  const [sajuData, setSajuData] = useState();
  const [step, setStep] = useState(0.5); // '0.5' '1', 'input' 'result'
  const { language, setLanguage } = useLanguage();
  const { user, userData, loadingUser } = useAuthContext();
  const [userQuestion, setUserQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');

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
      await addDoc(collection(db, 'sazatalk_funnel_logs'), {
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

  useEffect(() => setLanguage('ko'), [step]);
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
  const [aiResult, setAiResult] = useState();
  const pureHtml = useMemo(() => {
    if (!aiResult) return '';
    let cleanedResponse = aiResult.trim();
    const startMarker = /^\s*```html\s*|^\s*```\s*/i;
    const endMarker = /\s*```\s*$/;
    cleanedResponse = cleanedResponse.replace(startMarker, '').replace(endMarker, '');
    return cleanedResponse.trim();
  }, [aiResult]);
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
    if (step === 'input') {
      setBirthData(birthInit);
      setTimeUnknown(false);
      setGender(null);
      setStep(1);
    } else if (step === 1) {
      setStep(0.5);
    } else if (step === 'result') {
      setStep('input');
    }
  };
  //키값 정열
  const sortObject = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObject(obj[key]); // 중첩 객체까지 재귀적으로 정렬
        return acc;
      }, {});
  };
  const isFormValid = getProgress() === 100;
  const handleAskSaza = async () => {
    // 아이디 확인
    if (true) {
    
      const docRef = doc(db, 'sazatalkad_logs', guestId);
      const docSnap = await getDoc(docRef);
   

      if (docSnap.exists()) {
        const existingData = docSnap.data();

        // 2. 저장된 사주와 현재 사주가 동일한지 비교
        // JSON.stringify를 사용하면 객체 내부 값까지 간편하게 비교 가능합니다.
        if (JSON.stringify(sortObject(existingData.saju)) === JSON.stringify(sortObject(saju))) {
          // 3. 동일할 경우 알림창 띄우기
          const alertMessage =
            language === 'en'
              ? 'Visit our website! Log in to get 3 premium reports daily for free.'
              : '사자사주 홈페이지에 방문해 보세요! 로그인만 하면 무료로 하루에 세 개씩 프리미엄 리포트를 확인할 수 있어요.';

          alert(alertMessage);

          // 4. 로그 출력 후 함수 종료 (아래의 setDoc 실행 안 함)
          console.log('Duplicate saju data found for ID:', guestId || user?.uid);
          return;
        } else {
   
        }
      }
    }
    // 아이디확인 끝
    const myQuestion = userQuestion;
    if (!myQuestion.trim()) return alert('질문을 입력해주세요.');

    setLoading(true);

    try {
      const dbRef = ref(database);
      const [basicSnap, strictSnap, formatSnap] = await Promise.all([
        get(child(dbRef, 'prompt/saza_basic')),
        get(child(dbRef, `prompt/saza_strict`)),
        get(child(dbRef, `prompt/saza_format`)),
      ]);

      if (!basicSnap.exists()) throw new Error('DB에 사자 템플릿이 없습니다.');

      // 2. 텍스트 가공 (기존 로직 유지)
      const displayName = userData?.displayName || (language === 'ko' ? '의뢰자' : 'guest');
      const sajuInfo = `성별:${gender}, 생년${birthData.year} 생월${birthData.month} 생일${birthData.day}, 팔자:${JSON.stringify(saju)} (sky3+grd3=연주, sky2+grd2=월주, sky1+grd1=일주, sky0+grd0=시주). 호칭:${displayName}`;
      const todayInfo = `현재 시각:${new Date().toLocaleString()}. 2026년=병오년. `;

      const replacements = {
        '{{STRICT_PROMPT}}': strictSnap.val() || '',
        '{{SAZA_FORMAT}}': formatSnap.val() || '',
        '{{myQuestion}}': myQuestion,
        '{{sajuInfo}}': sajuInfo,
        '{{todayInfo}}': todayInfo,
        '{{langPrompt}}': '**한국어로 150~200 단어로**',
        '{{hanjaPrompt}}': typeof hanja === 'function' ? hanja(language) : '',
      };

      // 3. 프롬프트 조립
      let fullPrompt = basicSnap.val();
      Object.entries(replacements).forEach(([key, value]) => {
        fullPrompt = fullPrompt.split(key).join(value || '');
      });

      // 4. API 호출
      const result = await fetchGeminiAnalysis(fullPrompt);

      const newQuestionLog = {
        question: myQuestion,
        sajuKey: saju,
        timestamp: new Date().toISOString(),
        id: Date.now(),
      };
   
      // DB 업데이트 (카운트 + 질문로그)
      const safeDate = new Date().toISOString().replace(/[:.]/g, '-');
      const docId = guestId || user?.uid;
      await setDoc(
        doc(db, 'sazatalkad_logs', docId),
        {
          id: guestId || user?.uid,
          date: safeDate,
          user: !!user,
          saju: saju,
          usageHistory: { question_history: arrayUnion(newQuestionLog) },
        },
        { merge: true },
      );

      // App 상태 업데이트

      setAiResult(result);
      setStep('result');
    } catch (e) {
      alert(e);
    } finally {
      setLoading(false);
    }
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
    userQuestion.trim() && handleAskSaza();
  };
  //내 일주
  const me = saju?.sky1;
  const meg = saju?.grd1;

  const me_exp = dayStem.find((i) => i.name_kr === me);
  const me_exp_g = dayBranch.find((i) => i.name_kr === meg);

  const Loading = () => {
    return (
      <div className="bg-[#FDF5F0] min-h-screen flex flex-col items-center justify-center overflow-hidden transform-gpu px-6">
        <div className="relative flex items-center justify-center w-72 h-72">
          {/* 1. 배경 회전 링 - 사자사주 오렌지 톤으로 변경 */}
          <div className="absolute w-44 h-44 rounded-full border-2 border-orange-200 border-dashed animate-[spin_10s_linear_infinite] opacity-40 will-change-transform"></div>
          <div className="absolute w-52 h-52 rounded-full border border-orange-100 animate-[spin_15s_linear_infinite_reverse] opacity-30 will-change-transform"></div>

          {/* 2. 공전하는 이모지들 (천체 흐름 컨셉) */}
          {/* ✨ 반짝이 */}
          <div className="absolute w-56 h-56 animate-[spin_4s_linear_infinite] will-change-transform">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl">✨</span>
          </div>

          {/* 🧭 나침반/팔괘 느낌 */}
          <div className="absolute w-40 h-40 animate-[spin_6s_linear_infinite_reverse] will-change-transform">
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xl">☀️</span>
          </div>

          {/* 🌙 달 */}
          <div className="absolute w-64 h-64 animate-[spin_8s_linear_infinite] will-change-transform">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl">🌙</span>
          </div>

          {/* 3. 중앙 사자 캐릭터 */}
          <div className="relative flex flex-col items-center z-10">
            {/* 중앙 글로우 효과 */}
            <div className="absolute inset-0 bg-orange-400/20 blur-3xl rounded-full scale-150"></div>
            <span className="text-8xl select-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)] mb-2">
              🦁
            </span>
            <div className="bg-[#F47521] text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest animate-pulse">
              ANALYZING
            </div>
          </div>
        </div>

        {/* 텍스트 구역 */}
        <div className="mt-8 text-center px-4 transform-gpu max-w-[300px]">
          <h2 className="text-2xl font-black text-[#4A3428] mb-3">
            {language === 'ko' ? '사자가 분석 중...' : 'Saza is Analyzing...'}
          </h2>
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-[15px] text-[#8B6E5E] font-bold break-keep leading-snug">
              {language === 'ko'
                ? '사자와 27명의 명리학자가 함께 당신의 사주를 풀고 있어요'
                : 'Saza and 27 Saju masters are analyzing together'}
            </p>

            {/* 로딩 바 섹션 (약 30초 애니메이션) */}
            <div className="w-full mt-6 space-y-2">
              <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-orange-100 shadow-inner">
                <div
                  className="h-full bg-[#F47521] rounded-full shadow-[0_0_10px_rgba(244,117,33,0.5)] animate-[loading_30s_linear_forwards]"
                  style={{ width: '0%' }}
                ></div>
              </div>
              <div className="flex items-center justify-center gap-1">
                <p className="text-xs text-[#C4B5A9] font-bold uppercase tracking-widest">
                  {language === 'ko' ? '하늘의 흐름을 읽는 중' : 'Reading the celestial flow'}
                </p>
                <span className="flex text-[#F47521] font-bold">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce [animation-delay:0.2s]">.</span>
                  <span className="animate-bounce [animation-delay:0.4s]">.</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 로딩바 애니메이션을 위한 스타일 태그 (Tailwind config 수정 없이 사용 가능) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
    @keyframes loading {
      0% { width: 0%; }
      100% { width: 100%; }
    }
  `,
          }}
        />
      </div>
    );
  };
  if (loading) return <Loading />;
  return (
    <div className="bg-white">
      {step !== 0.5 && step !== 'result' && !isAnalyzing && (
        <button
          onClick={handleBack}
          className="absolute left-5 top-6 z-20 p-2 rounded-full 
                   bg-white  
                   text-indigo-600 
                   shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
                   border border-slate-100 
                   hover:bg-slate-50  
                   active:scale-90 transition-all duration-200"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="w-6 h-6 stroke-[3px]" />
        </button>
      )}
      <div className="max-w-3xl mx-auto">
        {step === 0.5 && (
          <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            <AmaKr
              setStep={() => setStep(1)}
              question={userQuestion}
              setQuestion={setUserQuestion}
            />
          </div>
        )}
        {step === 1 && !isAnalyzing && (
          <>
            <div className="min-h-screen bg-[#FDF5F0] font-sans text-[#4A3428] px-6 py-10 selection:bg-orange-100 selection:text-orange-700">
              {/* 상단 타이틀 섹션 */}
              <div className="text-center mb-8">
                <div className="flex justify-center items-center gap-1.5 mb-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xl">
                    🦁
                  </div>
                  <span className="text-xl font-bold tracking-tight text-[#333]">사자사주</span>
                </div>
                <h2 className="text-lg font-black leading-tight break-keep">
                  {language === 'ko'
                    ? '생년월일을 바탕으로 나의 오행을 분석합니다'
                    : 'Analyzing your Five Elements based on your birth date.'}
                </h2>
              </div>

              <div className="space-y-3">
                {/* 성별 선택 */}
                <div className="flex gap-2 mb-4">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all shadow-sm ${
                        gender === g
                          ? 'border-[#F47521] bg-white text-[#F47521]'
                          : 'border-white bg-white/50 text-[#C4B5A9]'
                      }`}
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

                {/* 연도 입력 */}
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
                      className="w-full p-5 bg-white rounded-2xl border-2 border-transparent focus:border-[#F47521] outline-none font-bold text-center shadow-sm placeholder-[#C4B5A9]"
                      onChange={(e) =>
                        setBirthData({ ...birthData, year: e.target.value.slice(0, 4) })
                      }
                    />
                  </div>
                </div>

                {/* 월 입력 */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${isYearDone ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <input
                      type="number"
                      placeholder={
                        language === 'ko' ? '태어난 월을 입력해주세요' : 'Birth Month(MM)'
                      }
                      value={birthData.month}
                      className="w-full p-5 bg-white rounded-2xl border-2 border-transparent focus:border-[#F47521] outline-none font-bold text-center shadow-sm placeholder-[#C4B5A9]"
                      onChange={(e) =>
                        setBirthData({ ...birthData, month: e.target.value.slice(0, 2) })
                      }
                    />
                  </div>
                </div>

                {/* 일 입력 */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${isMonthDone && isYearDone ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <input
                      type="number"
                      placeholder={language === 'ko' ? '태어난 날을 입력해주세요' : 'Birth Day(DD)'}
                      value={birthData.day}
                      className="w-full p-5 bg-white rounded-2xl border-2 border-transparent focus:border-[#F47521] outline-none font-bold text-center shadow-sm placeholder-[#C4B5A9]"
                      onChange={(e) =>
                        setBirthData({ ...birthData, day: e.target.value.slice(0, 2) })
                      }
                    />
                  </div>
                </div>

                {/* 시간(시) */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${isDayDone && !timeUnknown ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden px-0.5">
                    <input
                      type="number"
                      placeholder={language === 'ko' ? '태어난 시 (HH)' : 'Birth Hour (HH)'}
                      className="w-full p-5 bg-white rounded-2xl border-2 border-transparent focus:border-[#F47521] outline-none font-bold text-center shadow-sm placeholder-[#C4B5A9]"
                      onChange={(e) =>
                        setBirthData({ ...birthData, hour: e.target.value.slice(0, 2) })
                      }
                    />
                  </div>
                </div>

                {/* 시간(분) */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${isHourDone && !timeUnknown ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden px-0.5">
                    <input
                      type="number"
                      placeholder={language === 'ko' ? '태어난 분 (mm)' : 'Birth Minute (mm)'}
                      className="w-full p-5 bg-white rounded-2xl border-2 border-transparent focus:border-[#F47521] outline-none font-bold text-center shadow-sm placeholder-[#C4B5A9]"
                      onChange={(e) =>
                        setBirthData({ ...birthData, minute: e.target.value.slice(0, 2) })
                      }
                    />
                  </div>
                </div>

                {/* 시간 모름 체크박스 */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${isDayDone ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <label className="flex items-center gap-2 cursor-pointer w-fit mx-auto py-2 overflow-hidden group">
                    <input
                      type="checkbox"
                      checked={timeUnknown}
                      onChange={(e) => setTimeUnknown(e.target.checked)}
                      className="w-5 h-5 accent-[#F47521] cursor-pointer"
                    />
                    <span className="text-md font-bold text-[#C4B5A9] group-hover:text-[#F47521] transition-colors">
                      {language === 'ko' ? '시간을 몰라요' : 'time unknown'}
                    </span>
                  </label>
                </div>
              </div>

              {/* 가이드 메시지 영역 */}
              <div className="mt-8 mb-4">
                <div className="flex items-center justify-center gap-2 animate-pulse">
                  <div className="w-2 h-2 bg-[#F47521] rounded-full" />
                  <span className="text-[16px] font-bold text-[#F47521]">
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

              {/* 프로그레스 바 섹션 */}
              <div className="space-y-2 mb-8">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-[#C4B5A9] uppercase tracking-wider">
                      Progress
                    </span>
                  </div>
                  <span className="text-[#F47521] text-xs font-black">{getProgress()}%</span>
                </div>
                <div className="w-full h-2.5 bg-white rounded-full overflow-hidden shadow-sm border border-orange-50">
                  <div
                    className="h-full bg-[#F47521] transition-all duration-700 ease-out rounded-full shadow-[0_0_8px_rgba(244,117,33,0.3)]"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
              </div>

              {/* 최종 버튼 */}
              {isFormValid && (
                <button
                  onClick={handleNextStep}
                  className="w-full py-5 bg-[#F47521] text-white rounded-full font-bold text-lg shadow-[0_4px_15px_rgba(244,117,33,0.3)] animate-in fade-in zoom-in-95 duration-300 active:scale-95 transition-all"
                >
                  {language === 'ko' ? '나의 사주 오행 분석하기' : 'Analyze My Five Elements'}
                </button>
              )}
            </div>
          </>
        )}
        {isAnalyzing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative mb-6">
              {/* 돋보기 아이콘 애니메이션 */}
              <div className="text-7xl animate-bounce drop-shadow-2xl">🔍</div>
              {/* 하단 그림자/빛 효과 */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-indigo-500/20 rounded-[100%] blur-lg animate-pulse"></div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xl font-black   tracking-tight animate-pulse">{loadingText}</p>
              <div className="flex justify-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {step === 'input' && (
        <div className="max-w-lg min-h-screen mx-auto px-6 animate-in slide-in-from-bottom duration-500 my-9">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-100  shadow-sm">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </div>
                <span className="text-[10px] font-bold tracking-wider text-violet-600  uppercase">
                  AI Intelligence Analysis
                </span>
              </div>
            </div>
            <h2 className=" text-2xl font-black text-slate-800  mb-4 tracking-tight">
              {language === 'ko' ? '무엇이든 물어보사자' : 'Clear Solutions for Any Concern'}
              <br />
              <span className="relative text-violet-600">
                {language === 'ko' ? '1:1 맞춤 사주 솔루션' : 'Personalized 1:1 Saju Solution'}
                <div className="absolute inset-0 bg-violet-200/50 blur-md rounded-full scale-100"></div>
              </span>
            </h2>
            {/* 설명문구 */}
            <div className="space-y-4 text-slate-600  mb-10 leading-relaxed break-keep">
              <p className="text-sm">
                {language === 'ko' ? (
                  <>
                    <p>27인의 명리 해석을 학습한 AI가 </p>
                    <p>어떤 고민도 차분하게 듣고 해결책을 드려요</p>
                  </>
                ) : (
                  <>
                    <p>AI trained on 27 expert Myeongni interpretations</p>
                    <p>listens calmly to your concerns and provides solutions.</p>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4 text-purple-600">
            <PencilSquareIcon className="w-5 h-5" />
            <h3 className="font-bold">
              {language === 'ko' ? '당신의 고민을 들려주세요' : 'Tell me what is on your mind'}
            </h3>
          </div>
          <textarea
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder={
              language === 'ko'
                ? '예: 과 동아리 선배 한명이랑 유독 안 맞는데, 제 올해 대인관계 운이 궁금해요!"'
                : "Ex: I really don't get along with one of the seniors in my college club. I'm curious about my relationship luck for this year!"
            }
            className="w-full h-40 p-4 border border-slate-200  rounded-2xl focus:ring-2 focus:ring-purple-400  focus:border-transparent outline-none resize-none text-slate-700  bg-white shadow-inner placeholder:text-slate-400 "
          />

          <button
            onClick={() => userQuestion.trim() && handleAskSaza()}
            disabled={!userQuestion.trim()}
            className={classNames(
              'w-full gap-3 py-4 mt-6 rounded-xl font-bold transition-all',
              userQuestion.trim()
                ? 'bg-purple-600  text-white shadow-lg shadow-purple-100 '
                : 'bg-slate-200  text-slate-400  cursor-not-allowed',
            )}
          >
            <div className="flex gap-3 justify-center align-center">
              <div className="flex justify-center items-center">
                {language === 'ko' ? '물어보기' : 'Ask Saza'}
              </div>

              {/* 부모 컨테이너: justify-center 추가 */}
              <div className="flex justify-center items-center text-center mt-1"></div>
            </div>
          </button>
        </div>
      )}
      {step === 'result' && (
        <div className="flex flex-col min-h-screen bg-[#FDF5F0] font-sans text-[#4A3428]">
          {/* 1. 상단 네비게이션 로고바 (새로 추가) */}
          <nav className="w-full bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-orange-100 px-6 py-4 flex justify-center items-center gap-1.5">
            <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-lg shadow-sm">
              🦁
            </div>
            <span className="text-lg font-bold tracking-tight text-[#333]">사자사주</span>
          </nav>
          <AdMyInfo
            birthData={birthData}
            isTimeUnknown={timeUnknown}
            gender={gender}
            saju={sajuData?.saju}
          />

          <div className="flex-1 p-6 flex flex-col gap-6">
            {/* 3. 사용자의 질문 (오른쪽 정렬 말풍선) */}
            {userQuestion && (
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-[#F47521] text-white p-5 rounded-[24px] rounded-tr-none shadow-lg shadow-orange-200/50">
                  <p className="text-[15px] font-bold leading-relaxed">{userQuestion}</p>
                </div>
              </div>
            )}

            {/* 4. AI의 사주 분석 답변 (디자인 개선) */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-orange-100 text-lg">
                  🦁
                </div>
                <span className="text-sm font-bold text-gray-600">사자사주 분석팀</span>
              </div>

              <div className="leading-8 w-full bg-white p-6 rounded-[24px] rounded-tl-none shadow-sm border border-[#E8DCCF]/50">
                <div
                  className="prose prose-sm max-w-none prose-strong:text-[#F47521] prose-strong:font-black prose-headings:text-[#4A3428] text-[#4A3428]"
                  dangerouslySetInnerHTML={{ __html: pureHtml }}
                />
              </div>
            </div>

            {/* 5. 하단 CTA 및 안내 섹션 */}
            <CopyUrlAd saju={saju} from="sazatalkadkr" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SazaTalkAdKr;
