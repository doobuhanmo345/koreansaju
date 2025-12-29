import { useRef, useState, useEffect } from 'react';
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

export default function TarotMoneyPage() {
  const { loading, setLoading, setLoadingType, setAiResult } = useLoading();
  const { userData, user } = useAuthContext();
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT } = useUsageLimit();
  const [cardPicked, setCardPicked] = useState();
  const [flippedIdx, setFlippedIdx] = useState(null);
  const [step, setStep] = useState('intro'); // 'intro' | 'category' | 'selection'
  const [selectedCategory, setSelectedCategory] = useState('');

  const moneyCategories = [
    { id: 'business', label: '사업 및 장사운', icon: '💼' },
    { id: 'investment', label: '주식 및 재테크', icon: '📈' },
    { id: 'job', label: '취업 및 승진', icon: '🏆' },
    { id: 'unexpected', label: '뜻밖의 횡재수', icon: '🎁' },
    { id: 'general', label: '전반적인 흐름', icon: '💰' },
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
당신은 자산 관리 및 비즈니스 전문 타로 마스터입니다. 제공된 CSS 클래스를 사용하여 경제적 통찰력이 담긴 정밀 재무 리포트를 작성하세요. 
이 리포트는 모든 내용을 한 페이지에 순차적으로 보여주는 '전체 보기' 방식입니다.

### 🏗️ 리포트 구조 (필수)
1. 전체를 <div class="report-container">로 감싸세요.

2. **인트로 영역**:
   - <h2 class="section-title-h2">${language === 'ko' ? '타로 금전운' : 'Tarot wealth lcuk'} - ${categoryLabel}</h2>

3. **섹션 1: 경제적 상징 (Financial Symbolism)**
   - <div class="report-card active"> 내부에 작성.
   - <h3 class="section-title-h3">분석 카드 : ${pickedCard.kor} (${pickedCard.name})</h3>
   - <div class="report-keyword"> 금전 핵심 키워드 3개를 #해시태그 형식으로 나열.
   - <p class="report-text">이 카드가 암시하는 현재의 자금 흐름과 경제적 상황에 대한 본질적 의미를 분석하세요.</p>

4. **섹션 2: 금전적 향방 (Wealth Forecast)**
   - <div class="report-card active"> 내부에 작성.
   - <h3 class="section-title-h3">${categoryLabel} 맞춤 재무 전망</h3>
   - <div class="report-text"> 내부에 구체적인 경제 상황 분석을 작성하세요.
     - (투자: 매수/매도 타이밍, 소비: 지출 주의점, 수입: 예상되는 이익 등 분야에 맞게 3-4개 항목으로 구체화)
     - 예: "지금은 투자를 멈출 때", "예상치 못한 부가 수입 기대" 등 실질적인 조언 포함.

5. **섹션 3: 자산 관리 전략 (Action Plan)**
   - <div class="report-card active"> 내부에 작성.
   - <h3 class="section-title-h3">자산 관리 전략</h3>
   - <ul class="info-list">를 사용하여 당장 실천해야 할 경제적 행동 지침 3가지를 리스트로 작성하세요.
   - 리스트 하단에 <div class="keyword-list">를 만들고 5개의 금전운 상승 키워드를 <span class="keyword-tag">#키워드</span>로 넣으세요.

### 🚫 절대 규칙
1. 모든 마크다운(**, # 등) 사용 금지. 오직 순수 HTML 태그만 출력.
2. 한자(Hanja) 사용 금지.
3. 답변 언어: ${language === 'ko' ? '한국어' : 'English'}. 섹션 제목도 영어로 작성해줘.
4. 어조: 냉철하고 전문적인 자산 관리사의 어조를 유지하면서도 희망적인 포인트를 짚어줄 것.

[데이터]
분야: ${categoryLabel} / 카드: ${pickedCard.kor} / 키워드: ${pickedCard.keyword}
`;
        const result = await fetchGeminiAnalysis(moneyPrompt);
        const newCount = currentCount + 1;

        await setDoc(
          doc(db, 'users', user.uid),
          {
            editCount: newCount,
            lastEditDate: new Date().toLocaleDateString('en-CA'),
            dailyUsage: {
              [new Date().toLocaleDateString('en-CA')]: increment(1),
            },

            usageHistory: {
              tarotMoney: {
                [new Date().toLocaleDateString('en-CA')]: { [categoryLabel]: increment(1) },
              },
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
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <BanknotesIcon className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">
            황금빛 금전운 분석
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm">
            당신의 재물 흐름과 부의 기회를
            <br />
            타로 카드로 정밀하게 진단해 드립니다.
          </p>
          <button
            onClick={() => setStep('category')}
            className="w-full py-4 bg-amber-500 text-white rounded-md font-bold shadow-lg shadow-amber-200 dark:shadow-none"
          >
            나의 재물운 확인하기
          </button>
        </div>
      );
    }

    if (step === 'category') {
      return (
        <div className="max-w-lg mx-auto pt-10 px-6 animate-in slide-in-from-right duration-500">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
            어떤 금전운이 궁금하신가요?
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
      <div className="max-w-lg mx-auto pt-10 text-center px-6 animate-in zoom-in-95 duration-500">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          카드를 골라주세요
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          가장 마음이 가는 한 장을 클릭하세요.
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
  return (
    <AnalysisStepContainer
      guideContent={renderContent}
      loadingContent={<TarotLoading cardPicked={cardPicked} />}
      resultComponent={() => <ViewTarotResult cardPicked={cardPicked} />}
      loadingTime={0}
    />
  );
}
