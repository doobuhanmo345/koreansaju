import { useRef, useState, useEffect } from 'react';
import AnalysisStepContainer from '../component/AnalysisStepContainer';
import ViewResult from './ViewResult';
import { useAuthContext } from '../context/useAuthContext';
import { useUsageLimit } from '../context/useUsageLimit';
import { db } from '../lib/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useLoading } from '../context/useLoadingContext';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import { classNames } from '../utils/helpers';
import { fetchGeminiAnalysis } from '../api/gemini';
import CreditIcon from '../ui/CreditIcon';
import { TARO_CARDS } from '../data/tarotConstants';
import {
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import TarotLoading from '../component/TarotLoading';

export default function TarotCounselingPage() {
  const { loading, setLoading, setLoadingType, setAiResult } = useLoading();
  const { userData, user } = useAuthContext();
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT } = useUsageLimit();
  const [cardPicked, setCardPicked] = useState();
  const [step, setStep] = useState('intro'); // 'intro' | 'input' | 'selection'
  const [flippedIdx, setFlippedIdx] = useState(null);

  const [userQuestion, setUserQuestion] = useState('');

  // 78장 전체 데크 사용
  const allCards = TARO_CARDS;

  const handleCardPick = async (onStart, index) => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!userQuestion.trim()) return alert('고민 내용을 입력해주세요.');

    const currentCount = userData?.editCount || 0;
    if (currentCount >= MAX_EDIT_COUNT) return alert(UI_TEXT.limitReached[language]);
    const pickedCard = allCards[Math.floor(Math.random() * allCards.length)];
    setCardPicked(pickedCard);
    setFlippedIdx(index);
    setTimeout(async () => {
      setLoading(true);
      setLoadingType('tarot_counseling');
      setFlippedIdx(null); // 초기화

      try {
        const counselingPrompt = `
당신은 공감 능력이 뛰어난 심리 상담가이자 타로 마스터입니다. 제공된 CSS 클래스를 사용하여 사용자의 지친 마음을 어루만지는 따뜻한 심리 리포트를 작성하세요. 
이 리포트는 모든 내용을 한 페이지에 순차적으로 보여주는 '전체 보기' 방식입니다.

### 🏗️ 리포트 구조 (필수)
1. 전체를 <div class="report-container">로 감싸세요.

2. **인트로 영역**:
   - <h2 class="section-title-h2">고민상담 </h2>
   - <p class="report-text">"${userQuestion}"</p>

3. **섹션 1: 마음의 거울 (Card Message)**
   - <div class="report-card active"> 내부에 작성.
   - <h3 class="section-title-h3">선택된 : ${pickedCard.kor} (${pickedCard.name})</h3>
   - <div class="report-keyword"> 힐링 키워드 3개를 #해시태그 형식으로 나열.
   - <p class="report-text">현재 고민 상황에서 이 카드가 당신의 내면(심리상태)에 대해 어떤 이야기를 들려주는지 따뜻하게 설명하세요.</p>

4. **섹션 2: 당신의 상황 (Deep Counseling)**
   - <div class="report-card active"> 내부에 작성.
   - <h3 class="section-title-h3">현재 상황</h3>
   - <div class="report-text"> 내부에 사용자의 고민 상황에 깊이 공감하는 내용과 카드의 상징을 연결한 정밀 분석을 작성하세요.
     - 사용자의 아픔을 먼저 보듬고, 변화를 위한 긍정적인 통찰을 3-4개 문단으로 나누어 제시하세요.

5. **섹션 3: 해결 방안 (Healing Plan)**
   - <div class="report-card active"> 내부에 작성.
   - <h3 class="section-title-h3">마음을 위한 실천 지침</h3>
   - <ul class="info-list">를 사용하여 마음의 회복을 위한 구체적인 행동 지침 3가지를 작성하세요.
   - 리스트 하단에 <div class="keyword-list">를 만들고 5개의 마음 위로 키워드를 <span class="keyword-tag">#키워드</span>로 넣으세요. (설명 문구 절대 금지)

### 🚫 절대 규칙
1. 모든 마크다운(**, # 등) 사용 금지. 오직 순수 HTML 태그만 출력.
2. 한자(Hanja) 사용 금지.
3. 답변 언어: ${language === 'ko' ? '한국어' : 'English'}.
4. 탭 이동 기능 없이 모든 .report-card에 .active 클래스를 부여하고 display: block으로 출력하세요.
5. 어조: 매우 따뜻하고 다정하며, 내담자를 존중하는 전문 상담사의 어조 유지.

[데이터]
고민내용: ${userQuestion} / 카드: ${pickedCard.kor} / 키워드: ${pickedCard.keyword}
`;
        const result = await fetchGeminiAnalysis(counselingPrompt);
        const newCount = currentCount + 1;
        await setDoc(
          doc(db, 'users', user.uid),
          {
            editCount: newCount,
            lastCounseling: {
              question: userQuestion,
              result: result,
              date: new Date().toISOString(),
              card: pickedCard.kor,
            },
          },
          { merge: true },
        );

        setEditCount(newCount);
        setAiResult(result);
        onStart();
      } catch (e) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const renderContent = (onStart) => {
    if (loading) return <TarotLoading cardPicked={cardPicked} />;

    if (step === 'intro') {
      return (
        <div className="max-w-lg mx-auto pt-10 text-center px-6 animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChatBubbleLeftRightIcon className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">
            심층 고민 상담
          </h2>
          <p className="text-slate-500 mb-10 text-sm break-keep">
            말 못 할 고민이 있나요? 78장의 카드가
            <br />
            당신의 마음을 읽고 해답을 찾아드립니다.
          </p>
          <button
            onClick={() => setStep('input')}
            className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg"
          >
            상담 시작하기
          </button>
        </div>
      );
    }

    if (step === 'input') {
      return (
        <div className="max-w-lg mx-auto pt-10 px-6 animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-2 mb-4 text-purple-600">
            <PencilSquareIcon className="w-5 h-5" />
            <h3 className="font-bold">당신의 고민을 들려주세요</h3>
          </div>
          <textarea
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="예: 요즘 대인관계 때문에 너무 힘들어요. 어떻게 하면 좋을까요?"
            className="w-full h-40 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:border-transparent outline-none resize-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            onClick={() => userQuestion.trim() && setStep('selection')}
            disabled={!userQuestion.trim()}
            className={classNames(
              'w-full py-4 mt-6 rounded-xl font-bold transition-all',
              userQuestion.trim()
                ? 'bg-purple-600 dark:bg-purple-700 text-white shadow-lg shadow-purple-100 dark:shadow-none'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed',
            )}
          >
            카드로 해답 찾기
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto pt-10 text-center px-6 animate-in zoom-in-95 duration-500">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          진심을 담아 카드를 선택하세요
        </h3>
        <p className="text-sm text-slate-500 mb-8">당신의 무의식이 해답을 알고 있습니다.</p>
        <div>
          <CreditIcon num={-1} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              onClick={() => flippedIdx === null && handleCardPick(onStart, i)}
              className={classNames(
                'relative aspect-[2/3] cursor-pointer group',
                'transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
                flippedIdx === null
                  ? 'hover:-translate-y-10 hover:scale-110 hover:-rotate-3 hover:z-50'
                  : 'pointer-events-none',
              )}
              style={{ transformStyle: 'preserve-3d' }} // 1. 최상위 부모 3D 설정
            >
              <div
                className="w-full h-full transition-transform duration-700 shadow-xl rounded-2xl relative"
                style={{
                  transformStyle: 'preserve-3d', // 2. 회전 레이어 3D 설정
                  transform: flippedIdx === i ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* --- 카드 뒷면 (평소 보이는 곳) --- */}
                <div
                  className="absolute inset-0 w-full h-full z-10 [backface-visibility:hidden]"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <img
                    src="/images/tarot/cardback.png"
                    alt="tarot card"
                    className="w-full h-full object-cover rounded-2xl border border-white/10"
                  />
                </div>

                {/* --- 카드 앞면 (뒤집혔을 때 보이는 곳) --- */}
                <div
                  className="absolute inset-0 w-full h-full z-20 bg-white dark:bg-slate-800 flex items-center justify-center rounded-2xl border-4 border-rose-500 overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)', // 뒷면에 배치
                  }}
                >
                  {cardPicked && (
                    <img
                      src={`/images/tarot/${cardPicked.id}.png`}
                      alt={cardPicked.kor}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* 바닥 그림자 */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-black/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnalysisStepContainer
      guideContent={renderContent}
      loadingContent={<TarotLoading />}
      resultComponent={ViewResult}
      loadingTime={0}
    />
  );
}
