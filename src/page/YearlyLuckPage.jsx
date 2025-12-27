import { useState, useEffect } from 'react';
import AnalysisStepContainer from '../component/AnalysisStepContainer';
import ViewResult from './ViewResult';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import EnergyBadge from '../ui/EnergyBadge';
import { useAuthContext } from '../context/useAuthContext';
import { useUsageLimit } from '../context/useUsageLimit';
import { db } from '../lib/firebase';
import { setDoc, doc, increment } from 'firebase/firestore';
import { useLoading } from '../context/useLoadingContext';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import { TicketIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { STRICT_INSTRUCTION, NEW_YEAR_FORTUNE_PROMPT } from '../data/aiResultConstants';
import { langPrompt, hanja } from '../data/constants';
import { fetchGeminiAnalysis } from '../api/gemini';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { classNames } from '../utils/helpers';
import { BoltIcon } from '@heroicons/react/24/outline';
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
  const { loading, setLoading, setLoadingType, aiResult, setAiResult } = useLoading();

  const { userData, user, isYearDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender } = userData || {};
  const { saju } = useSajuCalculator(inputDate, isTimeUnknown);
  const { language } = useLanguage();
  // useUsageLimit에서 editCount와 setEditCount 가져오기
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading;
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
          saju: saju,
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
    if (loading) {
      return <SajuLoading />;
    }

    return (
      <div className="max-w-md mx-auto pt-10 text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <h2 className=" text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
          오행으로 읽는
          <br />
          <span className="relative text-red-600 dark:text-red-400">
            평생운세 & 10년 대운
            <div className="absolute inset-0 bg-red-200/50 dark:bg-red-900/30 blur-md rounded-full scale-100"></div>
          </span>
        </h2>
        {/* 설명문구 */}
        <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
          <p className="text-sm">
            <strong>붉은 말의 해</strong>, 사주에 숨겨진 월별 건강운, 재물운, 연애운.
          </p>

          <div>
            <span
              className="
    inline-flex items-center gap-1.5 
    /* 라이트 모드 디자인 */
    bg-amber-50 text-amber-700 border border-amber-200 
    /* 다크 모드 디자인 (어두운 배경에 대비되게) */
    dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50 
    /* 공통 스타일: 둥글게, 글자 크기, 여백, 그림자 */
    py-1 px-3.5 rounded-md text-[13px] font-bold shadow-sm
    transition-all duration-300
  "
            >
              {/* 아이콘 부분: 살짝 애니메이션을 줘서 생동감 있게 */}
              <BoltIcon className="h-4 w-4 fill-amber-500 dark:fill-amber-400 animate-pulse" />

              <span className="tracking-tight">
                -1 <span className="text-[11px] opacity-80 ml-0.5 font-medium">크레딧</span>
              </span>
            </span>
          </div>

          <img src="/images/introcard/newyear_1.png" />
        </div>
        {/* 시작 버튼: handleYearlyStartClick (가칭) 연결 */}
        <button
          onClick={() => handleStartClick(onStart)}
          disabled={isDisabled && !isYearDone}
          className={classNames(
            'w-full  px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
            isDisabled
              ? DISABLED_STYLE
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-200 hover:-translate-y-1',
          )}
        >
          {loading ? '신년 대운 추출 중...' : '2026 신년 운세 시작하기'}

          {isYearDone ? (
            <div className="flex items-center gap-1 backdrop-blur-md bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
              <span className="text-[9px] font-bold text-white uppercase">Free</span>
              <TicketIcon className="w-3 h-3 text-white" />
            </div>
          ) : isLocked ? (
            <>
              <div
                className="mt-1 flex items-center gap-1 backdrop-blur-sm px-2 py-0.5 rounded-full border shadow-sm relative z-10 border-gray-500/50 bg-gray-400/40" // 잠겼을 때
              >
                <span className="text-[9px] font-bold text-white tracking-wide uppercase">
                  <LockClosedIcon className="w-4 h-4 text-amber-500" />
                </span>
              </div>
            </>
          ) : (
            user && (
              <div className="relative scale-90">
                <EnergyBadge active={userData?.birthDate} consuming={loading} cost={-1} />
              </div>
            )
          )}
        </button>
        {isLocked ? (
          <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
            <ExclamationTriangleIcon className="w-4 h-4" />{' '}
            {/* 아이콘이 없다면 ⚠️ 이모지로 대체 가능 */}
            크레딧이 부족합니다.
          </p>
        ) : (
          <p className="mt-4 text-[11px] text-slate-400">
            이미 분석된 운세는 크래딧을 재소모하지 않습니다.
          </p>
        )}
      </div>
    );
  };
  // 1. 결과가 나왔을 때 스크롤을 위로 올리는 로직
  useEffect(() => {
    // aiResult가 유효한 문자열인지 확인
    if (typeof aiResult === 'string' && aiResult.trim().length > 0) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [aiResult]); // <--- aiResult를 반드시 넣어줘야 합니다!

  // 2. 로딩이 시작될 때 스크롤 상단 이동
  useEffect(() => {
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);
  return (
    <AnalysisStepContainer
      guideContent={sajuGuide}
      loadingContent={<SajuLoading />}
      resultComponent={ViewResult }
      loadingTime={0}
    />
  );
}
