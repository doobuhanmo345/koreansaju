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
import {
  HeartIcon,
  SparklesIcon,
  ChevronRightIcon,
  UserGroupIcon,
  UserMinusIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import CreditIcon from '../ui/CreditIcon';
import TarotLoading from '../component/TarotLoading';
import { DateService } from '../utils/dateService';

export default function TarotLovePage() {
  const { loading, setLoading, setLoadingType, setAiResult } = useLoading();
  const { userData, user } = useAuthContext();
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT } = useUsageLimit();
  const [cardPicked, setCardPicked] = useState();
  // 1. 선택한 특정 카드만 뒤집기 위한 상태 (null이면 아무것도 안뒤집힘)
  const [flippedIdx, setFlippedIdx] = useState(null);
  const [step, setStep] = useState('intro'); // 'intro' | 'type_select' | 'selection'
  const [loveType, setLoveType] = useState(''); // 'solo' | 'couple' | 'reunion'

  const loveTypes =
    language === 'ko'
      ? [
          {
            id: 'solo',
            label: '새로운 인연 (솔로)',
            icon: <UserMinusIcon className="w-6 h-6" />,
            desc: '앞으로 다가올 인연과 나의 매력',
          },
          {
            id: 'couple',
            label: '현재 관계 (커플)',
            icon: <UserGroupIcon className="w-6 h-6" />,
            desc: '상대방의 속마음과 우리의 미래',
          },
          {
            id: 'reunion',
            label: '과거의 인연 (재회)',
            icon: <ArrowsRightLeftIcon className="w-6 h-6" />,
            desc: '그 사람의 소식과 다시 만날 가능성',
          },
        ]
      : [
          {
            id: 'solo',
            label: 'New relationship',
            icon: <UserMinusIcon className="w-6 h-6" />,
            desc: 'upcoming fate connection and my charm',
          },
          {
            id: 'couple',
            label: 'Current relationship',
            icon: <UserGroupIcon className="w-6 h-6" />,
            desc: ' opponent’s inner thoughts and our future',
          },
          {
            id: 'reunion',
            label: 'Past relationship',
            icon: <ArrowsRightLeftIcon className="w-6 h-6" />,
            desc: 'Possibility of meeting again',
          },
        ];

  const handleCardPick = async (onStart, index) => {
    if (!user) return alert(UI_TEXT.loginReq[language]);

    const currentCount = userData?.editCount || 0;
    if (currentCount >= MAX_EDIT_COUNT) return alert(UI_TEXT.limitReached[language]);

    // [로직] 카드 데이터 먼저 뽑기
    const pickedCard = TARO_CARDS[Math.floor(Math.random() * TARO_CARDS.length)];
    const typeLabel = loveTypes.find((t) => t.id === loveType)?.label;

    // [작동 1, 2] 선택한 카드 인덱스를 저장하여 해당 카드만 뒤집히게 함
    setCardPicked(pickedCard);
    setFlippedIdx(index);

    // [작동 3] 1초간 뒤집힌 카드를 보여준 후 로딩으로 전환
    setTimeout(async () => {
      setLoading(true);
      setLoadingType('tarot_love');
      setFlippedIdx(null); // 초기화

      try {
        const lovePrompt = `
당신은 연애 심리 전문 타로 마스터입니다. 제공된 CSS 클래스를 사용하여 한눈에 읽기 좋은 정밀 타로 리포트를 작성하세요. 
이 리포트는 클릭이나 탭 이동 없이 모든 내용을 한 페이지에 순차적으로 보여주는 '전체 보기' 방식입니다.

### 🏗️ 리포트 구조 (필수)
1. 전체를 <div class="report-container">로 감싸세요.

2. **인트로 영역**:
   - <h2 class="section-title-h2">${language === 'ko' ? '연애운 분석' : 'Tarot Love'}-${typeLabel}</h2>
3. **섹션 1: 카드 해석 (Symbolism)**
   - <div class="report-card active"> 내부에 작성.
   - <h3 class="section-title-h3">선택 카드 : ${pickedCard.kor} (${pickedCard.name})</h3>
   - <div class="report-keyword"> 핵심 키워드 3개를 #해시태그 형식으로 나열.
   - <p class="report-text">카드의 본질적 의미와 현재 상황에서의 상징적 해석을 상세히 설명하세요.</p>

4. **섹션 2: 정밀 운세 (Love Fortune)**
   - <div class="report-card active"> 내부에 작성.
   - <h3 class="section-title-h3">${typeLabel} 맞춤 운세</h3>
   - <div class="report-text"> 내부에 상황별 분석 내용을 작성하세요.
     - (솔로: 인연의 특징 / 커플: 속마음 / 재회: 연락운 등 상황에 맞게 3-4개 항목 작성)

5. **섹션 3: 조언 및 키워드 (Action Plan)**
   - <div class="report-card active"> 내부에 작성.
   - <h3 class="section-title-h3">조언</h3>
   - <ul class="info-list">를 사용하여 구체적인 행동 지침 3가지를 리스트로 작성하세요.
   - 리스트 하단에 <div class="keyword-list">를 만들고 5개의 행운 키워드를 <span class="keyword-tag">#키워드</span>로 넣으세요.


### 🚫 절대 규칙
1. 모든 마크다운(**, # 등) 사용 금지. 오직 순수 HTML 태그만 출력.
2. 한자(Hanja) 사용 금지.
3. 답변 언어: ${language === 'ko' ? '한국어' : 'English'}.섹션 제목도 영어로 작성해줘.
4. 탭 이동 기능 없이 모든 .report-card에 .active 클래스를 부여하고 display: block으로 출력하세요.

[데이터]
상황: ${typeLabel} / 카드: ${pickedCard.kor} / 키워드: ${pickedCard.keyword}
`;
        const result = await fetchGeminiAnalysis(lovePrompt);
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
              tarotLove: {
                [todayDate]: { [typeLabel]: increment(1) },
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
            <HeartIcon className="w-10 h-10 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">
            {language === 'ko' ? '타로 연애운' : 'Love Fortune'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm">
            {language === 'ko' ? (
              <>
                새로운 인연에서 부터 현재 인연, 그리고 과거의 인연
                <br />
                궁합이나 관계에 대해서 알려드립니다.
              </>
            ) : (
              <>From the past to future, Check out the love and relationship status</>
            )}
          </p>
          <div className="m-auto my-3 max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img src="/images/introcard/tarot_1.jpg" alt="sazatalk" className="w-full h-auto" />
          </div>

          <button
            onClick={() => setStep('type_select')}
            className="w-full py-4 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-100 dark:shadow-none"
          >
            {language === 'ko' ? '사랑의 해답 찾기' : 'Finding the answer to love'}
          </button>
        </div>
      );
    }

    if (step === 'type_select') {
      return (
        <div className="max-w-lg mx-auto  px-6 animate-in slide-in-from-right duration-500">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
            {language === 'ko' ? '현재 당신의 상황은?' : 'What is your current situation?'}
          </h3>
          <div className="space-y-4">
            {loveTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setLoveType(t.id);
                  setStep('selection');
                }}
                className="w-full p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-4 hover:border-rose-400 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition-all text-left group"
              >
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-rose-500 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                  {t.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 dark:text-slate-100">{t.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{t.desc}</div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-rose-500" />
              </button>
            ))}
          </div>
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
