import React, { useState, useEffect } from 'react';
import AnalysisStepContainer from '../component/AnalysisStepContainer';
import ViewResult from './ViewResult';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import EnergyBadge from '../ui/EnergyBadge';
import { useConsumeEnergy } from '../hooks/useConsumingEnergy';
import { useAuthContext } from '../context/useAuthContext';
import { useUsageLimit } from '../context/useUsageLimit';
import { db } from '../lib/firebase';
import { setDoc, doc, increment } from 'firebase/firestore';
import { useLoading } from '../context/useLoadingContext';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import { classNames } from '../utils/helpers';
import { TicketIcon } from '@heroicons/react/24/outline';
import { STRICT_INSTRUCTION, DAILY_FORTUNE_PROMPT } from '../data/aiResultConstants';
import { langPrompt, hanja } from '../data/constants';
import { getPillars } from '../utils/sajuCalculator';
import { fetchGeminiAnalysis } from '../api/gemini';
import LoadingPage from './LoadingPage';
// 1. 로딩 컴포넌트
function SajuLoading() {
  const [textIndex, setTextIndex] = useState(0);
  const loadingTexts = [
    '태어난 날의 천간과 지지를 조합하는 중...',
    '오행의 균형과 기운을 분석하는 중...',
    '당신의 인생을 바꿀 대운의 흐름을 계산 중...',
    '사주 명식의 신살과 합충을 풀이하는 중...',
    '운명의 지도를 완성하고 있습니다...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 800);
    return () => clearInterval(interval);
  }, [loadingTexts.length]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-slate-900 px-6">
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 border-4 border-indigo-100 dark:border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-4 border-2 border-purple-400 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-pulse"></div>
        </div>
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
          운명의 실타래를 푸는 중
        </h3>
        <p className="text-indigo-600 dark:text-indigo-400 font-medium min-h-[1.5rem] transition-all duration-300">
          {loadingTexts[textIndex]}
        </p>
      </div>
    </div>
  );
}

// 2. 메인 페이지 컴포넌트
export default function TodaysLuckPage() {
  const energy = useConsumeEnergy();
  const { loading, setLoading, loadingType, setLoadingType, setAiResult, aiResult } = useLoading();
  const { userData, user, isDailyDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender } = userData || {};
  const { saju } = useSajuCalculator(inputDate, isTimeUnknown);
  const { language } = useLanguage();
  // useUsageLimit에서 editCount와 setEditCount 가져오기
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();

  // 버튼 클릭 시 실행될 중간 로직
  const handleStartClick = async (onStart) => {
    // 1. 기본 방어 로직
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!userData?.birthDate) return alert(UI_TEXT.saveFirst[language]);
    if (loading) return;

    setLoading(true);

    const todayDate = new Date().toLocaleDateString('en-CA');
    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

    try {
      const data = userData || {};

      // 2. 일일 운세 캐시 체크 (오늘 날짜 + 사주 + 언어 + 성별 일치 확인)
      if (data.ZLastDaily) {
        const {
          date: savedDate,
          language: savedLang,
          saju: savedSaju,
          gender: savedGender,
          result: savedResult,
        } = data.ZLastDaily;

        const isDateMatch = savedDate === todayDate;
        const isLangMatch = savedLang === language;
        const isGenderMatch = savedGender === gender;
        const isSajuMatch = savedSaju && keys.every((k) => savedSaju[k] === saju[k]);

        // 모든 조건이 맞고 결과값이 이미 있다면 바로 결과 모달/스텝으로 이동
        if (isDateMatch && isLangMatch && isGenderMatch && isSajuMatch && savedResult) {
          setAiResult(savedResult); // 기존 결과 세팅
          onStart(); // Loading 스킵하고 바로 결과 진입 (컴포넌트 로직에 따라)
          return;
        }
      }

      // 3. 한도 초과 체크 (새로 뽑아야 하는 경우에만 체크)
      const currentCount = data.editCount || 0;
      if (currentCount >= MAX_EDIT_COUNT) {
        return alert(UI_TEXT.limitReached[language]);
      }

      // 4. 새로운 분석 데이터 준비 (API 프롬프트 생성용)
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const todayPillars = getPillars(today);
      const tomorrowPillars = getPillars(tomorrow);

      if (!todayPillars || !tomorrowPillars) return;

      const userSajuText = `${saju.sky3}${saju.grd3}년 ${saju.sky2}${saju.grd2}월 ${saju.sky1}${saju.grd1}일 ${saju.sky0}${saju.grd0}시`;
      const todaySajuText = `${todayPillars.sky3}${todayPillars.grd3}년 ${todayPillars.sky2}${todayPillars.grd2}월 ${todayPillars.sky1}${todayPillars.grd1}일`;
      const tomorrowSajuText = `${tomorrowPillars.sky3}${tomorrowPillars.grd3}년 ${tomorrowPillars.sky2}${tomorrowPillars.grd2}월 ${tomorrowPillars.sky1}${tomorrowPillars.grd1}일`;

      const fullPrompt = `${STRICT_INSTRUCTION[language]}\n${DAILY_FORTUNE_PROMPT[language]}\n[User Gender] ${gender}\n[User Saju] ${userSajuText}\n[Today: ${todayPillars.date}] ${todaySajuText}\n[Tomorrow: ${tomorrowPillars.date}] ${tomorrowSajuText}\n${langPrompt(language)}\n${hanja(language)}`;

      // 5. API 호출 및 DB 업데이트

      const result = await fetchGeminiAnalysis(fullPrompt);
      const newCount = currentCount + 1;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: newCount,
          lastEditDate: todayDate,
          ZLastDaily: {
            result: result,
            date: todayDate,
            saju: saju,
            language: language,
            gender: gender,
          },
          dailyUsage: {
            [todayDate]: increment(1),
          },
        },
        { merge: true },
      );

      // 6. 결과 반영 및 이동
      setEditCount(newCount);
      setAiResult(result);
      onStart();
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  console.log(isDailyDone);
  if (loading) return <LoadingPage />;
  // 안내 디자인 정의
  const sajuGuide = (onStart) => {
    return (
      <div className="max-w-md mx-auto pt-10 text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* 상단 비주얼: 🔮 대신 오늘을 상징하는 해/달 또는 달력 이모지 */}
        <div className="relative inline-block mb-6">
          <div className="text-6xl relative z-10">🗓️</div>
          <div className="absolute inset-0 bg-amber-200 dark:bg-amber-900/30 blur-2xl rounded-full scale-150"></div>
        </div>

        {/* 타이틀: 매일의 흐름을 강조 */}
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
          오늘 당신을 기다리는
          <br />
          <span className="text-amber-600 dark:text-amber-500">행운의 타이밍</span>
        </h2>

        {/* 설명문구: 줄줄이 쓰지 않고 핵심만 */}
        <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
          <p className="text-sm">
            매일 변화하는 하늘의 기운과 당신의 사주가 만나는 지점을 분석하여{' '}
            <strong>오늘과 내일의 맞춤 가이드</strong>를 전해드립니다.
          </p>

          {/* 요약 리스트: 사용자가 얻을 이득을 명확히 함 */}
          <div className="bg-white/50 dark:bg-slate-800/40 rounded-2xl p-5 text-sm text-left inline-block w-full border border-amber-100 dark:border-amber-900/30">
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center text-[10px]">
                  ⭐
                </span>
                <span>
                  <strong>오늘의 점수</strong>와 핵심 집중 키워드
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center text-[10px]">
                  🛡️
                </span>
                <span>
                  미리 대비하는 <strong>시간대별 유의사항</strong>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center text-[10px]">
                  🍀
                </span>
                <span>
                  기운을 북돋아 줄 <strong>행운의 아이템 & 컬러</strong>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 시작 버튼: handleDailyStartClick 연결 */}
        <button
          onClick={() => handleStartClick(onStart)} // 일일 운세용 함수 호출
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-200 dark:shadow-none active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? '기운 분석 중...' : '오늘의 운세 확인하기'}

          {/* 캐시 완료 상태면 티켓 표시, 아니면 에너지 소모 표시 */}
          {isDailyDone ? (
            <div className="flex items-center gap-1 backdrop-blur-md bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
              <span className="text-[9px] font-bold text-white uppercase">Free</span>
              <TicketIcon className="w-3 h-3 text-white" />
            </div>
          ) : (
            user && (
              <div className="relative scale-90">
                <EnergyBadge active={userData?.birthDate} consuming={loading} cost={-1} />
              </div>
            )
          )}
        </button>

        <p className="mt-4 text-[11px] text-slate-400">
          이미 확인한 운세는 에너지가 소모되지 않습니다.
        </p>
      </div>
    );
  };

  return (
    <AnalysisStepContainer
      guideContent={sajuGuide}
      loadingContent={<SajuLoading />}
      resultComponent={ViewResult}
      loadingTime={3000}
    />
  );
}
