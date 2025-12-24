import React, { useState, useEffect } from 'react';
import AnalysisStepContainer from '../component/AnalysisStepContainer';
import BasicAna from './BasicAna';
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
export default function SajuAnalysisPage() {
  const energy = useConsumeEnergy();
  const { loading, setLoading, loadingType, setLoadingType } = useLoading();
  const { userData, user, isMainDone, isYearDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender } = userData || {};
  const { saju } = useSajuCalculator(inputDate, isTimeUnknown);
  const { language } = useLanguage();
  // useUsageLimit에서 editCount와 setEditCount 가져오기
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const sajuKeys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

  // 1️⃣ 사주 정보 일치 확인 헬퍼 함수 (필드별 직접 비교)
  // 1️⃣ [헬퍼 함수] 인자 두 개를 명확히 비교하도록 수정
  const checkSajuMatch = (prevSaju, targetSaju) => {
    if (!prevSaju || !targetSaju) return false;
    const sajuKeys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];
    // 인자로 받은 두 객체의 값을 직접 비교
    return sajuKeys.every((k) => prevSaju[k] === targetSaju[k]);
  };

  // 버튼 클릭 시 실행될 중간 로직
  const handleStartClick = async (onStart) => {
    // 1. 기본 방어 로직
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!userData.birthDate) return alert(UI_TEXT.saveFirst[language]);
    if (loading || energy.isConsuming) return;

    setLoading(true);

    try {
      const data = userData || {};
      const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

      // 2. 기존 분석 데이터와 일치하는지 확인 (중복 소모 방지)
      if (data.ZApiAnalysis) {
        const { language: savedLang, saju: savedSaju, gender: savedGender } = data.ZApiAnalysis;
        const isLangMatch = savedLang === language;
        const isGenderMatch = savedGender === gender;
        const isSajuMatch = savedSaju && keys.every((k) => savedSaju[k] === saju[k]);

        if (isLangMatch && isSajuMatch && isGenderMatch) {
          // 일치하면 로딩 단계를 건너뛰고 바로 결과로 진입 (onStart를 바로 실행하거나 스테이지 이동)
          onStart();
          return;
        }
      }

      // 3. 한도 초과 체크

      if ((data.editCount || 0) >= MAX_EDIT_COUNT) {
        return alert(UI_TEXT.limitReached[language]);
      }

      // 4. 새로운 분석 시작 - DB 업데이트 및 에너지 소모
      const newCount = editCount + 1;
      const today = new Date().toLocaleDateString('en-CA');

      await setDoc(
        doc(db, 'users', user.uid),
        {
          saju: saju,
          editCount: newCount,
          lastEditDate: today,
          dailyUsage: {
            [today]: increment(1),
          },
          ZApiAnalysis: {
            saju: saju,
            language: language,
            gender: gender,
          },
        },
        { merge: true },
      );

      // 5. 로컬 상태 업데이트 및 로딩 시작
      setEditCount(newCount);
      onStart(); // 여기서 AnalysisStepContainer가 Loading으로 넘어감
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  // 안내 디자인 정의
  const sajuGuide = (onStart) => {
    // 기존 분석 여부 확인 (editCount가 0보다 크면 분석한 적이 있음)
    const isAlreadyAnalyzed = editCount > 0;

    return (
      <div className="max-w-md mx-auto pt-20 text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="relative inline-block mb-8">
          <div className="text-6xl relative z-10">🔮</div>
          <div className="absolute inset-0 bg-indigo-200 dark:bg-indigo-900/40 blur-2xl rounded-full scale-150"></div>
        </div>

        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
          당신의 운명을 구성하는
          <br />
          <span className="text-indigo-600 dark:text-indigo-400">여덟 글자</span>의 비밀
        </h2>

        <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-12 leading-relaxed break-keep">
          <p>
            전통 명리학의 <strong>만세력 엔진</strong>을 통해 당신의 타고난 기운과 성향, 그리고
            평생의 흐름을 정밀하게 추출합니다.
          </p>
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 text-sm text-left inline-block w-full border border-slate-200 dark:border-slate-700">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">✔</span> <strong>나의 핵심 오행</strong>과 에너지
                균형 분석
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">✔</span> 삶의 터닝포인트,{' '}
                <strong>대운의 흐름</strong> 확인
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">✔</span> 숨겨진 잠재력과{' '}
                <strong>신살 상세 해석</strong>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => handleStartClick(onStart)} // 중간 함수 호출
          disabled={energy.isConsuming}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          운명 분석 시작하기
          {isMainDone && !loading && (
            <div
              className={classNames(
                'mt-1 flex items-center gap-1 backdrop-blur-sm px-2 py-0.5 rounded-full border shadow-sm relative z-10',
                isLocked
                  ? 'border-gray-500/50 bg-gray-400/40' // 잠겼을 때 (어둡고 회색)
                  : 'border-white/30 bg-white/20', // 열렸을 때 (밝고 투명)
              )}
            >
              <span className="text-[9px] font-bold text-white tracking-wide uppercase">Free</span>
              <TicketIcon className="w-3 h-3 text-white" />
            </div>
          )}
          {!isMainDone && !user && (
            <div className="mt-1 relative z-10">
              <LockClosedIcon className="w-4 h-4 text-amber-500" />
            </div>
          )}
          {!isMainDone && !!user && (
            <div className="mt-1 relative">
              <EnergyBadge
                active={userData?.inputDate}
                consuming={energy.isConsuming}
                loading={loading && !energy.isConsuming}
                cost={-1}
              />
            </div>
          )}
        </button>
      </div>
    );
  };

  return (
    <AnalysisStepContainer
      guideContent={sajuGuide}
      loadingContent={<SajuLoading />}
      resultComponent={BasicAna}
      loadingTime={3000}
    />
  );
}
