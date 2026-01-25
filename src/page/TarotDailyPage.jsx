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
import StartButton from '../component/StartButton';

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
당신은 통찰력 있는 삶의 가이드를 제시하는 타로 마스터입니다. 
사용자의 하루를 조망하는 정밀 타로 리포트를 반드시 아래의 **JSON 구조**로만 응답하세요.

### [데이터]
- 카드: ${pickedCard.kor} (${pickedCard.name})
- 키워드: ${pickedCard.keyword}

### [JSON 구조 (필수)]
{
  "title": "${language === 'ko' ? '오늘의 운세' : 'Tarot Luck of the day'}",
  "subTitle": "오늘 당신의 삶을 채울 에너지 흐름",
  "cardName": "${pickedCard.kor} (${pickedCard.name})",
  "tags": ["#오늘의에너지", "#행운의흐름", "#타로가이드"],
  "description": "이 카드(${pickedCard.kor})가 오늘 당신의 삶에 가져올 본질적인 에너지와 그 의미를 상세히 설명하세요. (오늘의 에너지 섹션)",
  "analysisTitle": "상황별 운세 흐름 (General Fortune)",
  "analysisList": [
    "대인관계: 주위 사람들과의 관계 및 소통의 흐름",
    "업무 및 학업: 추진 중인 일이나 공부에서의 성과와 주의점",
    "심리적 상태: 오늘 하루 유지하면 좋을 마음가짐"
  ],
  "adviceTitle": "오늘을 위한 조언 (Action Plan)",
  "adviceList": [
    "오늘 실천하면 좋은 구체적인 행동 지침 1",
    "오늘 실천하면 좋은 구체적인 행동 지침 2",
    "오늘 실천하면 좋은 구체적인 행동 지침 3"
  ],
  "footerTags": ["#긍정", "#행운", "#조화", "#성장", "#타이밍"]
}

### [절대 규칙]
1. 마크다운(\`\`\`) 없이 순수 JSON 텍스트만 출력할 것.
2. 한자(Hanja) 사용 금지.
3. 답변 언어: ${language === 'ko' ? '한국어' : 'English'}. (JSON 키값은 영문 유지)
4. 어조: 차분하고 신비로우면서도 명확한 가이드를 주는 어조 유지.
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
              <img src="/images/introcard/tarot_1.webp" alt="sazatalk" className="w-full h-auto" />
            </div>
          </div>
          <StartButton onClick={() => setStep('selection')} color='indigo'/>
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
