import { useRef, useState, useEffect, useCallback } from 'react';
import AnalysisStepContainer from '../component/AnalysisStepContainer';
import ViewTarotResult from '../component/ViewTarotResult';
import { useAuthContext } from '../context/useAuthContext';
import { useUsageLimit } from '../context/useUsageLimit';
import { db } from '../lib/firebase';
import { setDoc, doc, increment } from 'firebase/firestore';
import { useLoading } from '../context/useLoadingContext';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import { classNames } from '../utils/helpers';
import { fetchGeminiAnalysis } from '../api/gemini';
import CreditIcon from '../ui/CreditIcon';
import { TARO_CARDS } from '../data/tarotConstants';
import { DateService } from '../utils/dateService';
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
당신은 공감 능력이 뛰어난 심리 상담가이자 타로 마스터입니다. 
다음 데이터를 바탕으로 사용자의 마음을 어루만지는 심리 리포트를 작성하세요.
반드시 아래의 **JSON 구조**로만 응답하세요.

### [데이터]
- 고민내용: ${userQuestion}
- 카드: ${pickedCard.kor} (${pickedCard.name})
- 키워드: ${pickedCard.keyword}

### [JSON 구조 (필수)]
{
  "title": "${language === 'ko' ? '마음 상담 리포트' : 'Psychological Report'}",
  "subTitle": "${userQuestion}",
  "cardName": "${pickedCard.kor} (${pickedCard.name})",
  "tags": ["#힐링", "#공감", "#마음챙김"],
  "description": "선택된 카드(${pickedCard.kor})가 현재 사용자의 내면 상태에 대해 들려주는 따뜻한 메시지를 작성하세요. (선택된 카드 해석 섹션)",
  "analysisTitle": "현재 상황 분석 (Deep Counseling)",
  "analysisList": [
    "사용자의 고민 상황에 깊이 공감하는 내용",
    "카드의 상징을 통해 본 현재 심리적 어려움 분석",
    "변화를 위해 내면에서 찾아야 할 긍정적인 통찰"
  ],
  "adviceTitle": "마음을 위한 실천 지침 (Healing Plan)",
  "adviceList": [
    "오늘 바로 실천할 수 있는 마음 회복 행동 1",
    "오늘 바로 실천할 수 있는 마음 회복 행동 2",
    "오늘 바로 실천할 수 있는 마음 회복 행동 3"
  ],
  "footerTags": ["#자존감", "#회복", "#안정", "#위로", "#희망"]
}

### [규칙]
1. 마크다운(\`\`\`) 없이 순수 JSON 텍스트만 출력.
2. 한자 사용 금지, 어조는 매우 다정하고 전문적이어야 함.
3. 답변 언어: ${language === 'ko' ? '한국어' : 'English'}.
`;
        const result = await fetchGeminiAnalysis(counselingPrompt);
        const todayDate = await DateService.getTodayDate();
        await setDoc(
          doc(db, 'users', user.uid),
          {
            editCount: increment(1),
            lastEditDate: todayDate,
            dailyUsage: {
              [todayDate]: increment(1),
            },
            usageHistory: {
              tarotCounseling: {
                [todayDate]: { [userQuestion]: increment(1) },
              },
            },
          },
          { merge: true },
        );

        setEditCount((prev) => prev + 1);
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
        <div className="max-w-lg mx-auto text-center px-6 animate-in fade-in duration-700">
          <div className="opacity-40 absolute left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChatBubbleLeftRightIcon className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">
            {language === 'ko' ? '심층 고민 상담' : 'In-depth tarot counselling'}
          </h2>
          <p className="text-slate-500 mb-10 text-sm break-keep">
            {language === 'ko' ? (
              <>
                말 못 할 고민이 있나요? 78장의 카드가
                <br />
                당신의 마음을 읽고 해답을 찾아드립니다.
              </>
            ) : (
              'Is there any unspoken concerns? 78 Tarot card will rad your mind and provide answers'
            )}
          </p>
          <div className="m-auto my-3 max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img src="/images/introcard/tarot_1.webp" alt="sazatalk" className="w-full h-auto" />
          </div>
          <button
            onClick={() => setStep('input')}
            className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg"
          >
            {language === 'ko' ? '상담 시작하기' : 'Get Started'}
          </button>
        </div>
      );
    }

    if (step === 'input') {
      return (
        <div className="max-w-lg mx-auto px-6 animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-2 mb-4 text-purple-600">
            <PencilSquareIcon className="w-5 h-5" />
            <h3 className="font-bold">
              {language === 'ko' ? '당신의 고민을 들려주세요' : 'Tell us what is on your mind'}
            </h3>
          </div>
          <textarea
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder={
              language === 'ko'
                ? '예: 요즘 대인관계 때문에 너무 힘들어요. 어떻게 하면 좋을까요?'
                : 'Ex: I am struggling with relationships lately. What should I do?'
            }
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
            {language === 'ko' ? '카드로 해답 찾기' : 'Find answers through cards'}
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto text-center px-6 animate-in zoom-in-95 duration-500">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          {language === 'ko' ? '카드를 골라 주세요.' : 'Choose your Card'}
        </h3>
        <p className="text-sm text-slate-500 ">
          {language === 'ko'
            ? '가장 마음이 가는 한 장을 클릭하세요.'
            : ' Follow your heart, pick one of six cards'}
        </p>
        <div className="my-3">
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
                className="w-full h-full transition-transform duration-700 shadow-xl rounded-md relative"
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
                    className="w-full h-full object-cover rounded-md border border-white/10"
                  />
                </div>

                {/* --- 카드 앞면 (뒤집혔을 때 보이는 곳) --- */}
                <div
                  className="absolute inset-0 w-full h-full z-20 bg-white dark:bg-slate-800 flex items-center justify-center rounded-md overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)', // 뒷면에 배치
                  }}
                >
                  {cardPicked && (
                    <img
                      src={`/images/tarot/${cardPicked.id}.jpg`}
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

  // 추가: 로딩이 시작될 때도 상단으로 올리고 싶다면 (선택 사항)
  useEffect(() => {
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);
  const ResultComponent = useCallback(() => {
    return <ViewTarotResult cardPicked={cardPicked} />;
  }, [cardPicked]); // cardPicked가 바뀔 때만 참조가 변경됨

  return (
    <AnalysisStepContainer
      guideContent={renderContent}
      loadingContent={<TarotLoading />}
      resultComponent={() => <ResultComponent />}
      loadingTime={0}
    />
  );
}