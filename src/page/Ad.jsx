import React, { useState, useEffect, useMemo } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  SparklesIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  LanguageIcon,
} from '@heroicons/react/24/solid';
import { CakeIcon } from '@heroicons/react/24/outline';
import FourPillarVis from '../component/FourPillarVis';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import { useLanguage } from '../context/useLanguageContext';

export default function Ad() {
  const { language, setLanguage } = useLanguage();

  const [step, setStep] = useState(0);
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
  const [email, setEmail] = useState(localStorage.getItem('saved_email') || '');
  const memoizedBirthDate = useMemo(() => {
    const { year, month, day, hour, minute } = birthData;
    if (!year || !month || !day) return null;
    const pad = (n) => n?.toString().padStart(2, '0') || '00';
    const formatted = `${year}-${pad(month)}-${pad(day)}T${timeUnknown ? '12' : pad(hour)}:${timeUnknown ? '00' : pad(minute)}`;
    return new Date(formatted);
  }, [birthData, timeUnknown]);

  const { saju } = useSajuCalculator(memoizedBirthDate, timeUnknown);

  const isYearDone = birthData.year.length === 4;
  const isMonthDone = birthData.month.length >= 1;
  const isDayDone = birthData.day.length >= 1;
  const isHourDone = birthData.hour.length >= 1;
  const isMinuteDone = birthData.minute.length >= 1;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState('');
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
    if (!email.includes('@')) {
      alert(language === 'ko' ? '올바른 이메일을 입력해주세요.' : 'Please enter a valid email.');
      return;
    }
    try {
      // 문서 ID를 수동으로 지정하지 않고, Firebase가 알아서 생성하게 바꿉니다. (권한 에러 방지)
      await addDoc(collection(db, 'ad_leads'), {
        email,
        gender,
        birthData,
        timeUnknown,
        language,
        timestamp: serverTimestamp(),
        source: 'insta_ad',
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-2">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-5 border border-slate-100 dark:border-slate-800">
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
              <CakeIcon className="w-8 h-8 text-indigo-500 mx-auto mb-1" />
              <h2 className="text-xl font-black dark:text-white flex items-center justify-center gap-2">
                {language === 'ko' ? '사주 정보 입력' : 'Enter Your Info'}
                <span className="text-indigo-500 text-sm font-black bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
                  {getProgress()}%
                </span>
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

            {isFormValid && (
              <button
                onClick={handleNextStep}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg animate-in fade-in zoom-in-95 duration-300 active:scale-95 transition-all mt-4"
              >
                {language === 'ko' ? '무료 분석하기' : 'Get Free Analysis'}
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
              <p className="text-xs font-bold text-slate-500 mt-1">
                {language === 'ko'
                  ? '사주 풀이에 사용될 정보입니다.'
                  : 'This info will be used for your reading.'}
              </p>
            </div>

            {/* --- 정보 확인 카드 --- */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    Gender / 성별
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
                    Birth Date / 생년월일
                  </p>
                  <p className="text-sm font-black dark:text-white">
                    {birthData.year}.{birthData.month}.{birthData.day}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    Birth Time / 시분
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
            <div className="relative h-[340px] overflow-hidden rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-inner">
              {/* 사주 오행 그래프 컴포넌트 */}
              {saju && <FourPillarVis saju={saju} isTimeUnknown={timeUnknown} />}

              {/* 분석 실행 버튼 오버레이 (로딩 중이 아닐 때만 노출) */}
              {!isAnalyzing && (
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white dark:from-slate-900 via-white/80 dark:via-slate-900/80 to-transparent flex items-center justify-center px-6 pt-8">
                  <button
                    onClick={startAna}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <SparklesIcon className="w-5 h-5" />
                    {language === 'ko' ? '이 정보로 분석 시작' : 'Analyze My Destiny'}
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

            <div className="relative h-[400px] overflow-hidden rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              {/* 50줄 분량의 텍스트 영역 (70%만 보이게 설정) */}
              <div className="space-y-3 opacity-40 select-none">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <p className="text-sm font-black dark:text-white">
                    {language === 'ko' ? '종합 운세 분석 리포트' : 'Comprehensive Fortune Report'}
                  </p>
                </div>

                {/* 반복문을 사용하여 50줄 분량의 더미 텍스트 생성 */}
                {[...Array(50)].map((_, i) => (
                  <p key={i} className="text-[11px] leading-relaxed dark:text-slate-300">
                    {language === 'ko'
                      ? `당신의 사주에 흐르는 기운은 ${i % 3 === 0 ? '강한 생명력' : '지혜로운 흐름'}을 의미하며, 이는 장차 큰 성취를 이룰 발판이 됩니다. `
                      : `The energy flowing in your destiny signifies ${i % 3 === 0 ? 'strong vitality' : 'a wise flow'}, which will serve as a stepping stone.`}
                  </p>
                ))}
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
          <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500 text-center">
            <EnvelopeIcon className="w-10 h-10 text-indigo-500 mx-auto" />
            <h2 className="text-xl font-black dark:text-white">
              {language === 'ko' ? '결과 저장' : 'Save Results'}
            </h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center dark:text-white"
            />
            <button
              onClick={handleFinalSubmit}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-xl"
            >
              {language === 'ko' ? '지금 바로 확인' : 'Unlock Now'}
            </button>
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
              onClick={() => setStep(0)}
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
