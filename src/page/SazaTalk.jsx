import { useRef, useState, useEffect } from 'react';
import AnalysisStepContainer from '../component/AnalysisStepContainer';
import { useAuthContext } from '../context/useAuthContext';
import { useUsageLimit } from '../context/useUsageLimit';
import { db } from '../lib/firebase';
import { setDoc, doc, increment, arrayUnion } from 'firebase/firestore';
import { useLoading } from '../context/useLoadingContext';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import { classNames } from '../utils/helpers';
import { fetchGeminiAnalysis } from '../api/gemini';
import { ref, get, child } from 'firebase/database';
import { database } from '../lib/firebase';
import { PencilSquareIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { SajuAnalysisService, AnalysisPresets } from '../service/SajuAnalysisService';
import AnalyzeButton from '../component/AnalyzeButton';
import { langPrompt, hanja } from '../data/constants';
import EnergyBadge from '../ui/EnergyBadge';
import { useNavigate } from 'react-router-dom';
import ViewSazaResult from './ViewSazaResult';

export default function SazaTalk() {
  const navigate = useNavigate();
  const { setAiResult } = useLoading();
  const { userData, user } = useAuthContext();
  const { saju, gender, birthDate: inputDate } = userData || {};
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT, editCount, isLocked } = useUsageLimit();
  const [step, setStep] = useState('input'); // 'intro' | 'input' | 'selection'

  const [userQuestion, setUserQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const service = new SajuAnalysisService({
    user,
    userData,
    language,
    maxEditCount: MAX_EDIT_COUNT,
    uiText: UI_TEXT,
    langPrompt,
    hanja,
    setEditCount,
    setLoading,
    setAiResult,
    setStep,
  });

  const handleSazaTest = async (onstart) => {
    if (!inputDate) {
      alert(language === 'ko' ? '사주 정보를 먼저 등록해 주세요.' : 'Please register your Saju info first.');
      navigate('/');
      return;
    }
    setAiResult('');
    try {
      await service.analyze(
        AnalysisPresets.saza({
          saju: saju,
          gender: gender,
          inputDate: inputDate,
          question: userQuestion,
        }),
      );
      onstart();
    } catch (error) {
      console.error(error);
    }
  };

  const Loading = () => {
    return (
      // transform-gpu 클래스로 GPU 가속 활성화
      <div className="flex flex-col items-center justify-center min-h-[350px] overflow-hidden transform-gpu">
        <div className="relative flex items-center justify-center w-64 h-64">
          {/* 1. 배경 회전 링 - will-change-transform 추가 */}
          <div className="absolute w-40 h-40 rounded-full border border-indigo-100 dark:border-indigo-900/30 animate-[spin_3s_linear_infinite] opacity-50 will-change-transform"></div>

          {/* 2. 공전하는 이모지들 - 각각 will-change-transform과 backface-visibility 적용 */}
          {/* ✨ 반짝이 */}
          <div className="absolute w-48 h-48 animate-[spin_3s_linear_infinite] will-change-transform">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl">✨</span>
          </div>

          {/* ⭐ 별 */}
          <div className="absolute w-32 h-32 animate-[spin_5s_linear_infinite_reverse] will-change-transform">
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xl">⭐</span>
          </div>

          {/* 🌙 달 */}
          <div className="absolute w-56 h-56 animate-[spin_7s_linear_infinite] will-change-transform">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl">🌙</span>
          </div>

          {/* 3. 중앙 사자 캐릭터 */}
          <div className="relative flex flex-col items-center z-10">
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full"></div>
            <span className="text-7xl select-none drop-shadow-lg">🦁</span>
            <span className="text-sm font-bold text-indigo-500 mt-2 tracking-tighter animate-pulse">
              ANALYZING
            </span>
          </div>
        </div>

        {/* 텍스트 구역 (텍스트 렌더링 부하를 줄이기 위해 레이어 분리) */}
        <div className="mt-4 text-center px-4 transform-gpu">
          <h2 className="text-xl font-black text-slate-700 dark:text-white mb-2">
            {language === 'ko' ? '사자가 분석 중...' : 'Saza is Analyzing...'}
          </h2>
          <div className="flex flex-col items-center justify-center gap-1">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold break-keep">
              {language === 'ko'
                ? '사자와 27명의 명리학자가 함께 고민하고 있어요'
                : 'Saza and 27 Saju masters are analyzing together'}
            </p>
            <div className="flex items-center gap-1">
              <p className="text-xs text-slate-400 font-medium">
                {language === 'ko' ? '하늘의 흐름을 읽고 있어요' : 'Reading the celestial flow'}
              </p>
              <span className="flex text-indigo-500 font-bold">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce [animation-delay:0.2s]">.</span>
                <span className="animate-bounce [animation-delay:0.4s]">.</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderContent = (onStart) => {
    if (loading) return <Loading />;
    const isDisabled = false;

    if (step === 'intro') {
      return (
        <div className="max-w-lg mx-auto text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {/* ⬇️ 새로 추가된 AI 뱃지 부분 */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 shadow-sm">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </div>
              <span className="text-[10px] font-bold tracking-wider text-violet-600 dark:text-violet-400 uppercase">
                AI Intelligence Analysis
              </span>
            </div>
          </div>
          <h2 className=" text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
            {language === 'ko' ? '오행으로 물어보는' : 'Reading the Five Elements'}
            <br />
            <span className="relative text-violet-600 dark:text-violet-400">
              {language === 'ko' ? '사자와의 대화' : 'Conversation with Saza'}
              <div className="absolute inset-0 bg-violet-200/50 dark:bg-violet-900/30 blur-md rounded-full scale-100"></div>
            </span>
          </h2>
          {/* 설명문구 */}
          <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
            <p className="text-sm">
              {language === 'ko' ? (
                <>
                  <strong>사자</strong>에게 당신의 고민을 물어보세요.
                </>
              ) : (
                "Ask Saza what's in your mind"
              )}
            </p>

            <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
              {/* <img
                src="/images/introcard/sazatalk_1.webp"
                alt="sazatalk"
                className="w-full h-auto"
              /> */}
            </div>
          </div>

          <button
            onClick={() => setStep('input')}
            disabled={false}
            className={classNames(
              'w-full  px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
              isDisabled
                ? DISABLED_STYLE
                : 'bg-gradient-to-r from-violet-600 to-violet-600 hover:from-violet-500 hover:to-violet-500 text-white shadow-violet-200 hover:-translate-y-1',
            )}
          >
            {language === 'ko' ? '사자에게 물어보기' : 'Ask Saza'}
            {false ? (
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
              {/* 아이콘이 없다면 ⚠️ 이모지로 대체 가능 */}
              {language === 'ko' ? '크레딧이 부족합니다..' : 'not Enough credit'}
            </p>
          ) : (
            <p className="mt-4 text-[11px] text-slate-400">
              {language === 'ko'
                ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.'
                : 'Fortunes that have already been analyzed do not use credits.'}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto px-6 animate-in slide-in-from-bottom duration-500">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 shadow-sm">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </div>
              <span className="text-[10px] font-bold tracking-wider text-violet-600 dark:text-violet-400 uppercase">
                AI Intelligence Analysis
              </span>
            </div>
          </div>
          <h2 className=" text-2xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
            {language === 'ko' ? '무엇이든 물어보사자' : 'Clear Solutions for Any Concern'}
            <br />
            <span className="relative text-violet-600 dark:text-violet-400">
              {language === 'ko' ? '1:1 맞춤 사주 솔루션' : 'Personalized 1:1 Saju Solution'}
              <div className="absolute inset-0 bg-violet-200/50 dark:bg-violet-900/30 blur-md rounded-full scale-100"></div>
            </span>
          </h2>
          {/* 설명문구 */}
          <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
            <div className="text-sm">
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
            </div>
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
          className="w-full h-40 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:border-transparent outline-none resize-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
 <AnalyzeButton
       onClick={() => userQuestion.trim() && handleSazaTest(onStart)}
        disabled={!userQuestion.trim()}
        loading={loading}
        isDone={false}
        label= {language === 'ko' ? '사자에게 물어보기' : 'Ask Saza'}
        color='purple'
        cost={-1}
      />
     
      </div>
    );
  };

  // 추가: 로딩이 시작될 때도 상단으로 올리고 싶다면 (선택 사항)
  useEffect(() => {
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);
  return (
    <AnalysisStepContainer
      guideContent={renderContent}
      loadingContent={<Loading />}
      resultComponent={(p) => (
        <ViewSazaResult
          userQuestion={userQuestion}
          onReset={p.onReset} // <--- 기존의 부모 onReset 대신 p.onReset 사용
        />
      )}
      loadingTime={0}
    />
  );
}
