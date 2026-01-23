import { useRef, useState, useEffect, useCallback } from 'react';
import TarotLoading from '../component/TarotLoading';
import AnalysisStepContainer from '../component/AnalysisStepContainer';
import { useAuthContext } from '../context/useAuthContext';
import { useUsageLimit } from '../context/useUsageLimit';
import { db } from '../lib/firebase';
import { setDoc, doc, increment } from 'firebase/firestore';
import { useLoading } from '../context/useLoadingContext';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import { classNames } from '../utils/helpers';
import { fetchGeminiAnalysis } from '../api/gemini';
import { TARO_CARDS } from '../data/tarotConstants';
import { BanknotesIcon, SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import CreditIcon from '../ui/CreditIcon';
import ViewTarotResult from '../component/ViewTarotResult';
import { DateService } from '../utils/dateService';
export default function TarotMoneyPage() {
  const { loading, setLoading, setLoadingType, setAiResult } = useLoading();
  const { userData, user } = useAuthContext();
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT } = useUsageLimit();
  const [cardPicked, setCardPicked] = useState();
  const [flippedIdx, setFlippedIdx] = useState(null);
  const [step, setStep] = useState('intro'); // 'intro' | 'category' | 'selection'
  const [selectedCategory, setSelectedCategory] = useState('');

  const moneyCategories =
    language === 'ko'
      ? [
          { id: 'business', label: '사업 및 장사운', icon: '💼' },
          { id: 'investment', label: '주식 및 재테크', icon: '📈' },
          { id: 'job', label: '취업 및 승진', icon: '🏆' },
          { id: 'unexpected', label: '뜻밖의 횡재수', icon: '🎁' },
          { id: 'general', label: '전반적인 흐름', icon: '💰' },
        ]
      : [
          { id: 'business', label: 'Business Fortune', icon: '💼' },
          { id: 'investment', label: 'Financial Management Fortune', icon: '📈' },
          { id: 'job', label: 'Career Fortune', icon: '🏆' },
          { id: 'unexpected', label: 'Unexpected windful', icon: '🎁' },
          { id: 'general', label: 'General wealth flow', icon: '💰' },
        ];

  const getMoneyDeck = () => {
    const pentacles = TARO_CARDS.filter((c) => c.suite === 'Pentacles');
    const majorMoney = TARO_CARDS.filter((c) =>
      ['The Sun', 'Wheel of Fortune', 'The Empress', 'The Emperor', 'The Magician'].includes(
        c.name,
      ),
    );
    return [...pentacles, ...majorMoney];
  };

  const handleCardPick = async (onStart, index) => {
    if (!user) return alert(UI_TEXT.loginReq[language]);

    const currentCount = userData?.editCount || 0;
    if (currentCount >= MAX_EDIT_COUNT) return alert(UI_TEXT.limitReached[language]);
    const moneyDeck = getMoneyDeck();
    const pickedCard = moneyDeck[Math.floor(Math.random() * moneyDeck.length)];
    const categoryLabel = moneyCategories.find((c) => c.id === selectedCategory)?.label;
    setCardPicked(pickedCard);
    setFlippedIdx(index);

    setTimeout(async () => {
      setLoading(true);
      setLoadingType('tarot_money');
      setFlippedIdx(null); // 초기화

      try {
        const moneyPrompt = `
당신은 자산 관리 및 비즈니스 전문 타로 마스터입니다. 
제공된 데이터를 바탕으로 경제적 통찰력이 담긴 정밀 재무 리포트를 작성하세요.
반드시 아래의 **JSON 구조**로만 응답해야 합니다.

### [데이터]
- 분야: ${categoryLabel}
- 카드: ${pickedCard.kor} (${pickedCard.name})
- 키워드: ${pickedCard.keyword}

### [JSON 구조 (필수)]
{
  "title": "${language === 'ko' ? '타로 금전운 리포트' : 'Financial Tarot Report'} - ${categoryLabel}",
  "subTitle": "${categoryLabel} 분야 자금 흐름 분석",
  "cardName": "${pickedCard.kor} (${pickedCard.name})",
  "tags": ["#자금흐름", "#재무기회", "#리스크관리"],
  "description": "이 카드가 암시하는 현재의 자금 흐름과 경제적 상황에 대한 본질적 의미를 분석하세요. (경제적 상징 섹션)",
  "analysisTitle": "${categoryLabel} 맞춤 재무 전망",
  "analysisList": [
    "현재 분야(${categoryLabel})에서의 구체적인 재무 상황 진단",
    "투자/지출/수입 등 타이밍에 대한 냉철한 분석",
    "가장 주의해야 할 경제적 변수와 대응 방향"
  ],
  "adviceTitle": "자산 관리 전략 (Action Plan)",
  "adviceList": [
    "당장 실천해야 할 구체적인 경제적 행동 지침 1",
    "당장 실천해야 할 구체적인 경제적 행동 지침 2",
    "당장 실천해야 할 구체적인 경제적 행동 지침 3"
  ],
  "footerTags": ["#수익창출", "#지출통제", "#자산증식", "#재테크", "#안정권"]
}

### [절대 규칙]
1. 마크다운(\`\`\`) 없이 순수 JSON 텍스트만 출력할 것.
2. 한자(Hanja) 사용 금지.
3. 답변 언어: ${language === 'ko' ? '한국어' : 'English'}. (JSON 키값은 영문 유지)
4. 어조: 냉철하고 전문적인 자산 관리사의 어조를 유지하면서도 희망적인 포인트를 짚어줄 것.
`;
        const result = await fetchGeminiAnalysis(moneyPrompt);
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
              tarotMoney: {
                [todayDate]: { [categoryLabel]: increment(1) },
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
          <h2 className="relative text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">
            <div className="opacity-40 absolute left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <BanknotesIcon className="w-10 h-10 text-amber-600" />
            </div>
            {language === 'ko' ? '황금빛 금전운 분석' : 'Tarot Wealth luck'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm">
            {language === 'ko' ? (
              <>
                당신의 재물 흐름과 부의 기회를
                <br />
                타로 카드로 정밀하게 진단해 드립니다.
              </>
            ) : (
              ' Diagnose my wealth flow and opportunities'
            )}
          </p>
          <div className="m-auto my-3 max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img src="/images/introcard/tarot_1.webp" alt="sazatalk" className="w-full h-auto" />
          </div>
          <button
            onClick={() => setStep('category')}
            className="w-full py-4 bg-amber-500 text-white rounded-md font-bold shadow-lg shadow-amber-200 dark:shadow-none"
          >
            {language === 'ko' ? '나의 재물운 확인하기' : 'Check my wealth luck'}
          </button>
        </div>
      );
    }

    if (step === 'category') {
      return (
        <div className="max-w-lg mx-auto  px-6 animate-in slide-in-from-right duration-500">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
            {language === 'ko'
              ? '어떤 금전운이 궁금하신가요?'
              : 'What would you like to know about your wealth luck?'}
          </h3>
          <div className="space-y-3">
            {moneyCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setStep('selection');
                }}
                className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md flex items-center justify-between hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-slate-700 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {cat.label}
                  </span>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-amber-500" />
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto  text-center px-6 animate-in zoom-in-95 duration-500">
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
                  className="absolute inset-0 w-full h-full z-20 bg-white dark:bg-slate-800 flex items-center justify-center rounded-2xl  overflow-hidden"
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
