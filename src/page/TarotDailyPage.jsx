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
import { TARO_CARDS } from '../data/tarotConstants';
import { SparklesIcon } from '@heroicons/react/24/outline';
import CreditIcon from '../ui/CreditIcon';
import TarotLoading from '../component/TarotLoading';
import { DateService } from '../utils/dateService';

// [2] 메인 페이지 컴포넌트
export default function TarotDailyPage() {
  const { loading, setLoading, setLoadingType, setAiResult } = useLoading();
  const { userData, user } = useAuthContext();
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT } = useUsageLimit();
  const [flippedIdx, setFlippedIdx] = useState(null);
  const [step, setStep] = useState('intro');
  const [cardPicked, setCardPicked] = useState();
  const handleCardPick = async (onStart, index) => {
    if (!user) return alert(UI_TEXT.loginReq[language]);

    const currentCount = userData?.editCount || 0;
    if (currentCount >= MAX_EDIT_COUNT) {
      return alert(UI_TEXT.limitReached[language]);
    }
    const majorOnly = TARO_CARDS.filter((card) => card.type === 'major');
    const pickedCard = majorOnly[Math.floor(Math.random() * majorOnly.length)];
    setCardPicked(pickedCard);
    setFlippedIdx(index);

    //고민상담
    //   const allCards = TARO_CARDS;
    //   const pickedCard = allCards[Math.floor(Math.random() * allCards.length)];
    //금전 펜타클만 사용
    //const moneyCards = TARO_CARDS.filter(card => card.suite === 'Pentacles' || card.name === 'The Sun');

    // setLoading(true);
    // setLoadingType('tarot');
    setTimeout(async () => {
      setLoading(true);
      setLoadingType('tarot');
      setFlippedIdx(null); // 초기화

      try {
        const tarotPrompt = `
당신은 통찰력 있는 삶의 가이드를 제시하는 타로 마스터입니다. 제공된 CSS 클래스를 사용하여 사용자의 하루를 조망하는 정밀 타로 리포트를 작성하세요. 
이 리포트는 클릭이나 탭 이동 없이 모든 내용을 한 페이지에 순차적으로 보여주는 '전체 보기' 방식입니다.

### 🏗️ 리포트 구조 (필수)
1. 전체를 <div class="report-container">로 감싸세요.

2. **인트로 영역**:
   - <h2 class="section-title-h2"> ${language === 'ko' ? '오늘의 운세' : 'Tarot Luck of the day'}</h2>

3. **섹션 1: 오늘의 에너지 (Card Symbolism)**
   - <div class="report-card active"> 내부에 작성.
   - <h3 class="section-title-h3">선택 카드 : ${pickedCard.kor} (${pickedCard.name})</h3>
   - <div class="report-keyword"> 핵심 키워드 3개를 #해시태그 형식으로 나열.
   - <p class="report-text">이 카드가 오늘 당신의 삶에 가져올 본질적인 에너지와 그 의미를 상세히 설명하세요.</p>

4. **섹션 2: 오늘의 흐름 (General Fortune)**
   - <div class="report-card active"> 내부에 작성.
   - <h3 class="section-title-h3">상황별 운세 흐름</h3>
   - <div class="report-text"> 내부에 오늘의 주요 흐름을 작성하세요.
     - (대인관계, 업무/학업, 심리적 상태 등 3-4개 항목으로 구분하여 작성)

5. **섹션 3: 행운의 가이드 (Action Plan)**
   - <div class="report-card active"> 내부에 작성.
   - <h3 class="section-title-h3">오늘을 위한 조언</h3>
   - <ul class="info-list">를 사용하여 오늘 실천하면 좋은 행동 지침 3가지를 리스트로 작성하세요.
   - 리스트 하단에 <div class="keyword-list">를 만들고 5개의 행운 키워드를 <span class="keyword-tag">#키워드</span>로 넣으세요. (설명글 없이 키워드만 출력)

### 🚫 절대 규칙
1. 모든 마크다운(**, # 등) 사용 금지. 오직 순수 HTML 태그만 출력.
2. 한자(Hanja) 사용 금지.
3. 답변 언어: ${language === 'ko' ? '한국어' : 'English'}. 섹션 제목도 영어로 작성해줘.
4. 탭 이동 기능 없이 모든 .report-card에 .active 클래스를 부여하고 display: block으로 출력하세요.
5. 어조: 차분하고 신비로우면서도 명확한 가이드를 주는 어조 유지.

[데이터]
카드: ${pickedCard.kor} / 원문명: ${pickedCard.name} / 키워드: ${pickedCard.keyword}
`;
        const result = await fetchGeminiAnalysis(tarotPrompt);

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
              tarotDaily: {
                [todayDate]: increment(1),
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

  const tarotContent = (onStart) => {
    if (loading) return <TarotLoading cardPicked={cardPicked} />;

    if (step === 'intro') {
      return (
        <div className="max-w-lg mx-auto text-center px-6 animate-in fade-in duration-700">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">
            {language === 'ko' ? (
              <>
                오늘의 <span className="text-indigo-600">타로 운명</span>
              </>
            ) : (
              <>
                Tarot <span className="text-indigo-600">Luck of the day</span>
              </>
            )}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm break-keep">
            {language === 'ko'
              ? '무의식이 이끄는 오늘의 조언을 확인해보세요.'
              : 'Follow your unconsciousness to check out the advice of the day.'}
          </p>
          <div className="mb-10 flex justify-center">
            <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
              <img src="/images/introcard/tarot_1.jpg" alt="sazatalk" className="w-full h-auto" />
            </div>
          </div>
          <button
            onClick={() => setStep('selection')}
            className="w-full py-4 font-bold rounded-xl shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:-translate-y-1 transition-all"
          >
            {language === 'ko' ? '시작하기' : 'Get Started'}
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

        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10">
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
                  className="absolute bg-white inset-0 w-full h-full z-20 bg-white dark:bg-slate-800 flex items-center justify-center rounded-md overflow-hidden"
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
        <div className="flex flex-col items-center gap-2"></div>
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
      guideContent={tarotContent}
      loadingContent={<TarotLoading />}
      resultComponent={() => <ResultComponent />}
      loadingTime={0}
    />
  );
}
