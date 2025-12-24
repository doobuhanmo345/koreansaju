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
import { STRICT_INSTRUCTION, NEW_YEAR_FORTUNE_PROMPT } from '../data/aiResultConstants';
import { langPrompt, hanja } from '../data/constants';
import { fetchGeminiAnalysis } from '../api/gemini';
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
export default function YearlyLuckPage() {
  const energy = useConsumeEnergy();
  const { loading, setLoading, loadingType, setLoadingType, setAiResult } = useLoading();
  const { userData, user, isYearDone } = useAuthContext();
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

    setLoading(true);
    setLoadingType('year');
    setAiResult('');

    const todayDate = new Date().toLocaleDateString('en-CA');
    const nextYear = new Date().getFullYear() + 1;
    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

    try {
      const data = userData || {};
      const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

      // 2. 신년 운세 캐시 체크 (연도 + 사주 + 언어 + 성별 일치 확인)
      if (data.ZLastNewYear) {
        const {
          year: savedYear,
          language: savedLang,
          saju: savedSaju,
          gender: savedGender,
          result: savedResult,
        } = data.ZLastNewYear;

        const isYearMatch = String(savedYear) === String(nextYear);
        const isLangMatch = savedLang === language;
        const isGenderMatch = savedGender === gender;
        const isSajuMatch = savedSaju && keys.every((k) => savedSaju[k] === saju[k]);

        if (isYearMatch && isLangMatch && isGenderMatch && isSajuMatch && savedResult) {
          setAiResult(savedResult);
          setLoading(false);
          setLoadingType(null);
          onStart();
          return;
        }
      }

      // 3. 한도 초과 체크
      const currentCount = data.editCount || 0;
      if (currentCount >= MAX_EDIT_COUNT) {
        return alert(UI_TEXT.limitReached[language]);
      }

      // 4. 프롬프트 생성 (요청하신 호칭 및 사주 텍스트 반영)
      const currentSajuJson = JSON.stringify(saju);
      const displayName = userData?.displayName || (language === 'ko' ? '선생님' : 'User');

      const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${userData.birthDate}, 팔자:${currentSajuJson} sky3+grd3 는 연주, sky2+grd2는 월주, sky1+grd1은 일주, sky0+grd0는 시주야. 나를 선생님이 아닌 ${displayName}님 이라고 불러줘. 영어로는 ${displayName}. undefined시는 그냥 선생님이라고 해..`;

      const fullPrompt = `${STRICT_INSTRUCTION[language]}\n${NEW_YEAR_FORTUNE_PROMPT[language]}\n${sajuInfo}\n${langPrompt(language)}\n${hanja(language)}`;

      // 5. API 호출 및 DB 업데이트 (ZLastNewYear 필드 사용)

      const result = await fetchGeminiAnalysis(fullPrompt);
      const newCount = currentCount + 1;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: newCount,
          lastEditDate: todayDate,
          ZLastNewYear: {
            result: result,
            year: nextYear,
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
      setLoadingType(null);
    }
  };

  // 안내 디자인 정의
  const sajuGuide = (onStart) => {
    return (
      <div className="max-w-md mx-auto pt-10 text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* 상단 비주얼: 새로운 시작을 상징하는 태양이나 용 아이콘 */}
        <div className="relative inline-block mb-6">
          <div className="text-6xl relative z-10">🌅</div>
          <div className="absolute inset-0 bg-emerald-200 dark:bg-emerald-900/30 blur-2xl rounded-full scale-150"></div>
        </div>

        {/* 타이틀: 1년의 대계 강조 */}
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
          2026년 당신의 삶을 바꿀
          <br />
          <span className="text-emerald-600 dark:text-emerald-400">거대한 운명의 흐름</span>
        </h2>

        {/* 설명문구 */}
        <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
          <p className="text-sm">
            단순한 예측을 넘어, <strong>2026년 병오년</strong>의 천간과 지지가 당신의 사주와
            충돌하고 화합하는 모든 과정을 정밀 분석합니다.
          </p>

          {/* 요약 리스트: 연간 분석만의 깊이감 강조 */}
          <div className="bg-white/50 dark:bg-slate-800/40 rounded-2xl p-5 text-sm text-left inline-block w-full border border-emerald-100 dark:border-emerald-900/30">
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center text-[10px]">
                  📈
                </span>
                <span>
                  한 해의 <strong>월별 길흉화복</strong> 그래프 분석
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center text-[10px]">
                  💰
                </span>
                <span>
                  재물, 사업, 애정운의 <strong>전성기 확인</strong>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center text-[10px]">
                  🧭
                </span>
                <span>
                  최선의 결과를 위한 <strong>월별 맞춤 전략</strong>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 시작 버튼: handleYearlyStartClick (가칭) 연결 */}
        <button
          onClick={() => handleStartClick(onStart)}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 dark:shadow-none active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? '신년 대운 추출 중...' : '2026 신년 운세 시작하기'}

          {/* 연간 운세 완료 상태(isYearDone) 체크 */}
          {isYearDone ? (
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
          이미 분석된 신년 운세는 에너지를 재소모하지 않습니다.
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
