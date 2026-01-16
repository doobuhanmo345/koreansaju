import React, { useEffect, useState, useMemo } from 'react';
import SajuIntroSection from '../component/SajuIntroSection2';
import { useLanguage } from '../context/useLanguageContext';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import { ref, get, child } from 'firebase/database';
import { database } from '../lib/firebase';
import { setDoc, doc, increment, arrayUnion } from 'firebase/firestore';
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
import NewYearKr from './NewYearKr';
import CopyUrlAd from '../component/CopyUrlAd';
const NewYearAdKr = () => {
  const [guestId, setGuestId] = useState('');

  const [step, setStep] = useState(0.5); // '0.5' '1', 'input' 'result'
  const { language, setLanguage } = useLanguage();
  const { user, userData, loadingUser } = useAuthContext();
  const [userQuestion, setUserQuestion] = useState('');
  const [sajuData, setSajuData] = useState();
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
      await addDoc(collection(db, 'newYear_funnel_logs'), {
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
      console.log(step);
    }
  };
  const isFormValid = getProgress() === 100;
  const handleNewYear = async () => {
    // 1. 기본 방어 로직

    setLoading(true);
    setAiResult('');

    const todayDate = new Date().toLocaleDateString('en-CA');
    const nextYear = new Date().getFullYear() + 1;
    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

    try {
      // 4. 프롬프트 생성 (요청하신 호칭 및 사주 텍스트 반영)
      // --- [3. 프롬프트 생성: 당신이 주신 로직 그대로 실행] ---
      const dbRef = ref(database);
      const [basicSnap, strictSnap, yearSnap] = await Promise.all([
        get(child(dbRef, 'prompt/new_year_basic')),
        get(child(dbRef, `prompt/default_instruction`)),
        get(child(dbRef, `prompt/new_year_format_${language}`)),
      ]);

      if (!basicSnap.exists()) {
        throw new Error('신년운세 기본 뼈대가 DB에 없습니다.');
      }

      const template = basicSnap.val();
      const displayName = userData?.displayName || (language === 'ko' ? '선생님' : 'User');

      const replacements = {
        '{{STRICT_INSTRUCTION}}': strictSnap.val() || '',
        // '{{NEW_YEAR_FORMAT}}': yearSnap.val() || '',
        '{{NEW_YEAR_FORMAT}}':
          '2026년 병오년의 운세를 개략적으로 말해줘. 시작은 <b>태그로 시작해줘. 인사하지 말고 소제목부터. 소제목은 <b>로 감싸주고 질문 형식으로 해줘. 예를 들면 나의 올 한해는? 이렇게  내용은 <p> 내용은 세 문장 정도로.  그렇게 한거를 세개정도 만들어줘.',
        '{{gender}}': gender,
        '{{sajuJson}}': `${JSON.stringify(saju)} - sky3+grd3 는 연주, sky2+grd2는 월주, sky1+grd1은 일주, sky0+grd0는 시주야`,
        '{{displayName}}': displayName,
        '{{langPrompt}}': typeof langPrompt === 'function' ? langPrompt(language) : '',
        '{{hanjaPrompt}}': typeof hanja === 'function' ? hanja(language) : '',
      };

      let fullPrompt = template;

      Object.entries(replacements).forEach(([key, value]) => {
        fullPrompt = fullPrompt.split(key).join(value || '');
      });
      // --- [프롬프트 생성 로직 끝] ---
      // 5. API 호출 및 DB 업데이트 (ZLastNewYear 필드 사용)

      const result = await fetchGeminiAnalysis(fullPrompt);
      const safeDate = new Date().toISOString().replace(/[:.]/g, '-');
      const docId = guestId || user?.uid;

      await setDoc(
        doc(db, 'newyearad_logs', docId),
        {
          id: guestId || user?.uid,
          date: safeDate,
          user: !!user,
          saju: saju,
        },
        { merge: true },
      );

      // 6. 결과 반영 및 이동

      setAiResult(result);
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setStep('result');
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
    handleNewYear();
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
                  className="h-full bg-[#F47521] rounded-full shadow-[0_0_10px_rgba(244,117,33,0.5)] animate-[loading_40s_linear_forwards]"
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
      <div className="max-w-3xl mx-auto px-6">
        {step === 0.5 && (
          <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            <NewYearKr setStep={() => setStep(1)} />
          </div>
        )}
        {step === 1 && !isAnalyzing && (
          <>
            <div className="min-h-screen bg-[#FDF5F0] font-sans text-[#4A3428] px-6 py-10 selection:bg-orange-100 selection:text-orange-700">
              {/* 상단 타이틀 섹션 */}
              <div className="text-center mb-10 sm:mb-12">
                <div className="flex justify-center items-center gap-2 mb-5 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                    🦁
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#333]">
                    사자사주
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight break-keep">
                  {language === 'ko'
                    ? '생년월일을 바탕으로 나의 오행을 분석합니다'
                    : 'Analyzing your Five Elements based on your birth date.'}
                </h2>
              </div>

              <div className="space-y-4">
                {/* 성별 선택 */}
                <div className="flex gap-3 mb-5">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`flex-1 py-5 sm:py-6 rounded-2xl border-2 font-bold text-base sm:text-lg transition-all shadow-sm ${
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
                      className="w-full p-5 sm:p-6 bg-white rounded-2xl border-2 border-transparent focus:border-[#F47521] outline-none font-bold text-center text-base sm:text-lg shadow-sm placeholder-[#C4B5A9]"
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
                      className="w-full p-5 sm:p-6 bg-white rounded-2xl border-2 border-transparent focus:border-[#F47521] outline-none font-bold text-center text-base sm:text-lg shadow-sm placeholder-[#C4B5A9]"
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
                      className="w-full p-5 sm:p-6 bg-white rounded-2xl border-2 border-transparent focus:border-[#F47521] outline-none font-bold text-center text-base sm:text-lg shadow-sm placeholder-[#C4B5A9]"
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
                      className="w-full p-5 sm:p-6 bg-white rounded-2xl border-2 border-transparent focus:border-[#F47521] outline-none font-bold text-center text-base sm:text-lg shadow-sm placeholder-[#C4B5A9]"
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
                      className="w-full p-5 sm:p-6 bg-white rounded-2xl border-2 border-transparent focus:border-[#F47521] outline-none font-bold text-center text-base sm:text-lg shadow-sm placeholder-[#C4B5A9]"
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
                  <label className="flex items-center gap-3 cursor-pointer w-fit mx-auto py-3 overflow-hidden group">
                    <input
                      type="checkbox"
                      checked={timeUnknown}
                      onChange={(e) => setTimeUnknown(e.target.checked)}
                      className="w-6 h-6 accent-[#F47521] cursor-pointer"
                    />
                    <span className="text-base sm:text-lg font-bold text-[#C4B5A9] group-hover:text-[#F47521] transition-colors">
                      {language === 'ko' ? '시간을 몰라요' : 'time unknown'}
                    </span>
                  </label>
                </div>
              </div>

              {/* 가이드 메시지 영역 */}
              <div className="mt-10 sm:mt-12 mb-5">
                <div className="flex items-center justify-center gap-2 sm:gap-3 animate-pulse">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#F47521] rounded-full" />
                  <span className="text-base sm:text-lg md:text-xl font-bold text-[#F47521]">
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
                      : '...'}
                  </span>
                </div>
              </div>

              {/* 프로그레스 바 섹션 */}
              <div className="space-y-3 mb-10 sm:mb-12">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-black text-[#C4B5A9] uppercase tracking-wider">
                      Progress
                    </span>
                  </div>
                  <span className="text-[#F47521] text-sm sm:text-base font-black">
                    {getProgress()}%
                  </span>
                </div>
                <div className="w-full h-3 sm:h-3.5 bg-white rounded-full overflow-hidden shadow-sm border border-orange-50">
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
                  className="w-full py-5 sm:py-6 bg-[#F47521] text-white rounded-full font-bold text-lg sm:text-xl shadow-[0_4px_15px_rgba(244,117,33,0.3)] animate-in fade-in zoom-in-95 duration-300 active:scale-95 transition-all"
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
      {step === 'result' && (
        <div className="flex flex-col min-h-screen bg-[#FDF5F0] font-sans text-[#4A3428]">
          {/* 1. 상단 네비게이션 로고바 (새로 추가) */}
          <nav className="w-full bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-orange-100 px-6 py-4 flex justify-center items-center gap-1.5">
            <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-lg shadow-sm">
              🦁
            </div>
            <span className="text-lg font-bold tracking-tight text-[#333]">사자사주</span>
          </nav>

          <div className="flex-1 p-6 flex flex-col gap-6">
            {/* 4. AI의 사주 분석 답변 (디자인 개선) */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="relative mx-auto w-full max-w-[390px] h-[844px] bg-[#1a1a1c] rounded-[60px] p-[12px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/10">
                {/* 1. 내부 액정 화면 (전체 높이 100%) */}
                <div className="relative w-full h-full bg-[#FCF9F6] rounded-[48px] overflow-hidden flex flex-col">
                  {/* 2. 상단 고정 영역: 다이내믹 아일랜드 & 프로필 */}
                  <div className="shrink-0 pt-3 pb-3 bg-gradient-to-b from-[#F2ECE4] via-[#F2ECE4]/90 to-transparent z-[1]">
                    <div className="w-28 h-7 bg-black rounded-full mx-auto mb-4"></div>{' '}
                    <div className="flex items-center gap-4 px-8 py-2">
                      <div className="relative">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(244,117,33,0.12)] border border-orange-100/50 text-2xl">
                          🦁
                        </div>

                        <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-green-500 border-[3px] border-[#F2ECE4] rounded-full shadow-sm"></div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-orange-500/80 uppercase tracking-[0.15em] leading-none">
                          Saza AI Analyst
                        </span>
                        {/* 메인 타이틀: 가독성 높은 폰트 두께와 색상 정제 */}
                        <span className="text-[17px] font-black text-[#4A3428] tracking-tight">
                          사자사주 분석팀
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. 스크롤 가능 영역 (이 부분이 핵심!) */}
                  {/* flex-1과 overflow-y-auto가 만나서 이 영역만 스크롤됩니다 */}
                  <div className="flex-1 overflow-y-auto px-6 py-2 scroll-smooth no-scrollbar">
                    {/* (A) 채팅 스타일 콘텐츠 */}
                    <div className="chat-format">
                      <p>
                        {birthData.year}년 {birthData.month}월{birthData.day}일
                        {timeUnknown ? (
                          <></>
                        ) : (
                          <>
                            {birthData.hour}시{birthData.time}분
                          </>
                        )}
                        에 태어난 당신의 사주를 기반으로 올해 병오년이 어떨지 풀어드립니다.
                      </p>
                      <div dangerouslySetInnerHTML={{ __html: pureHtml }} />
                    </div>

                    {/* (B) 구분선 */}
                    <div className="border-t border-dashed border-[#E8DCCF]" />

                    {/* (C) 유료 채팅 티저 섹션 */}
                    <div className="relative mt-4 mb-10">
                      {/* 실제 대화가 이어지는 듯한 구성 */}
                      <div
                        className="space-y-6 opacity-60 pointer-events-none select-none"
                        style={{
                          maskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)',
                          WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)',
                        }}
                      >
                        {/* 분석팀의 추가 메시지 1 */}
                        <div className="flex gap-2">
                          <div className="w-8 h-8 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm border border-orange-100 text-sm">
                            🦁
                          </div>
                          <div className="bg-white p-4 rounded-[20px] rounded-tl-none border border-[#E8DCCF] text-[15px] text-[#4A3428] max-w-[80%] shadow-sm">
                            방금 분석한 내용 외에, 2026년 하반기에 정말 조심해야 할 운의 흐름이 하나
                            더 보여요.
                          </div>
                        </div>

                        {/* 분석팀의 추가 메시지 2 (핵심 키워드 노출) */}
                        <div className="flex gap-2">
                          <div className="w-8 h-8 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm border border-orange-100 text-sm">
                            🦁
                          </div>
                          <div className="bg-white p-4 rounded-[20px] rounded-tl-none border border-[#E8DCCF] text-[15px] text-[#4A3428] max-w-[80%] shadow-sm leading-relaxed">
                            {language === 'en' ? (
                              <>
                                Your financial luck could fluctuate significantly between
                                <span className="font-bold"> May and October</span> due to "one
                                specific factor"...
                              </>
                            ) : (
                              <>
                                특히 <span className="font-bold">5월과 10월</span> 사이에는 '이것'
                                때문에 재물운이 크게 흔들릴 수 있는데...
                              </>
                            )}
                          </div>
                        </div>
                        {/* 사용자 리액션 유도 (더 리얼하게) */}
                        <div className="flex justify-end">
                          <div className="bg-[#F47521] text-white p-3 px-5 rounded-[20px] rounded-br-none text-[14px] font-bold shadow-md">
                            그게 뭐예요? 저 조심해야 하나요? 🥺
                          </div>
                        </div>

                        {/* 분석팀의 마지막 끊긴 메시지 */}
                        <div className="flex gap-2">
                          <div className="w-8 h-8 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm border border-orange-100 text-sm">
                            🦁
                          </div>
                          <div className="bg-white p-4 rounded-[20px] rounded-tl-none border border-[#E8DCCF] text-[15px] text-[#4A3428] max-w-[80%] shadow-sm">
                            그 시기에는 주변 사람 중 'ㅅ' 성씨를 가진 사람과... (내용 더보기)
                          </div>
                        </div>
                      </div>

                      {/* (D) 결제 유도 카드 (그라데이션 위에 띄우기) */}
                      <div className="relative w-full max-w-[360px] mx-auto overflow-hidden bg-[#FEFAF7] rounded-[38px] border border-[#F1E9E4] shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
                        {/* 상단 포인트 라인 */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200"></div>

                        <div className="px-7 pt-9 pb-8 text-center">
                          {/* 배지 */}
                          <div className="inline-flex items-center px-3 py-1 bg-white border border-orange-100 rounded-full mb-5 shadow-sm">
                            <span className="text-[10px] font-bold text-orange-500 tracking-tighter uppercase">
                              {language === 'en' ? 'Limited Offer' : '한정 이벤트'}
                            </span>
                            <span className="w-[1px] h-2 bg-orange-200 mx-2"></span>
                            <span className="text-[10px] font-medium text-stone-400">Premium</span>
                          </div>

                          {/* 메인 타이틀 */}
                          <h2 className="text-[#3A322F] text-[22px] font-bold leading-tight mb-3 tracking-tight">
                            {language === 'en' ? (
                              <>
                                Get Your <span className="text-[#F47521]">Premium Report</span>
                                <br />
                                Free on Our Website
                              </>
                            ) : (
                              <>
                                지금 홈페이지 방문하면
                                <br />
                                <span className="text-[#F47521]">프리미엄 리포트가 무료</span>
                              </>
                            )}
                          </h2>

                          {/* 핵심 메시지 강조 영역 */}
                          <div className="bg-orange-50/50 rounded-2xl py-3 px-4 mb-6">
                            <p className="text-[#6D625B] text-sm leading-relaxed">
                              {language === 'en' ? (
                                <>
                                  No hidden fees.{' '}
                                  <span className="font-bold text-[#4A3428]">100% Free</span> ✨
                                  <br />
                                  Access all analyses at no extra cost.
                                </>
                              ) : (
                                <>
                                  결제 유도 없는{' '}
                                  <span className="font-bold text-[#4A3428]">0원 이벤트</span> ✨
                                  <br />
                                  추가 비용 없이 모든 분석을 확인하세요.
                                </>
                              )}
                            </p>
                          </div>

                          {/* 콜 투 액션 버튼 */}
                          <button
                            onClick={() => (window.location.href = '/pay')}
                            className="w-full h-[58px] bg-[#3A322F] hover:bg-[#2D2725] text-white rounded-[20px] font-semibold text-base shadow-lg shadow-stone-200 transition-all active:scale-[0.96] flex items-center justify-center gap-2"
                          >
                            <span>
                              {language === 'en' ? 'Get Free Report' : '무료로 리포트 받기'}
                            </span>
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 12H19M19 12L12 5M19 12L12 19"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {/* 하단 보조 문구 */}
                          <p className="mt-4 text-[12px] text-stone-400 font-medium">
                            {language === 'en'
                              ? '* Report generated instantly after login'
                              : '* 로그인 즉시 리포트가 생성됩니다'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. 하단 홈 인디케이터 (고정) */}
                  <div className="shrink-0 h-8 flex justify-center items-end pb-2 bg-gradient-to-t from-[#FCF9F6] to-transparent">
                    <div className="w-32 h-1.5 bg-black/10 rounded-full"></div>
                  </div>
                </div>

                {/* 추가 CSS (Global style이나 Tailwind 전용) */}
                <style>{`
  /* 1. 전체 컨테이너 설정 */
  .chat-format {
    display: flex !important;
    flex-direction: column !important;
    gap: 20px !important; /* 대화 간격 확보 */
    width: 100%;
    padding: 20px 0;
  }

  /* 2. 질문 (사용자): 오른쪽 정렬 */
  .chat-format b {
    display: block !important;
    width: fit-content !important;
    margin-left: auto !important;
    margin-right: 0 !important;
    background-color: #F47521; 
    color: white !important;
    padding: 12px 18px;
    border-radius: 20px 20px 4px 20px; /* 말풍선 꼬리 */
    font-size: 0.9rem;
    max-width: 75%;
    box-shadow: 0 4px 15px rgba(244, 117, 33, 0.15);
    font-weight: 700;
    line-height: 1.5;
  }

  /* 3. 답변 (사자): 왼쪽 정렬 + 아이콘 추가 */
  .chat-format p {
    display: block !important;
    position: relative !important; /* 아이콘 배치를 위한 기준 */
    width: fit-content !important;
    margin-left: 42px !important; /* 아이콘이 들어갈 공간 확보 (핵심) */
    margin-right: auto !important;
    margin-top: 10px !important;
    margin-bottom:10px !important;
    
    background-color: white; 
    color: #4A3428 !important;
    padding: 14px 18px;
    border-radius: 0 20px 20px 20px; /* 사자쪽 말풍선 꼬리 */
    font-size: 0.95rem;
    line-height: 1.6;
    max-width: 80%;
    border: 1px solid #E8DCCF;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  }

  /* 4. 사자 아이콘 (자동 생성) */
  .chat-format p::before {
    content: '🦁'; /* 아이콘 삽입 */
    position: absolute;
    left: -42px; /* p태그 margin-left만큼 왼쪽으로 보냄 */
    top: 0;
    width: 34px;
    height: 34px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 1px solid #FDF2E9;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  }

  /* 다크모드 대응 */
  .dark .chat-format p {
    background-color: #2D3748;
    color: #E2E8F0 !important;
    border: 1px solid #4A5568;
  }
`}</style>
              </div>
            </div>
            {/* 5. 하단 CTA 및 안내 섹션 */}
            <CopyUrlAd saju={saju} from="newyearadkr" />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewYearAdKr;
