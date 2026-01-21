import { useLoading } from '../context/useLoadingContext';
import { aiSajuStyle } from '../data/aiResultConstants';
import { useMemo, useEffect, useRef } from 'react';

export default function ViewTarotResult({ cardPicked }) {
  const { loading, aiResult } = useLoading();
  const scrollElRef = useRef(null); // 컨테이너 참조용
  const activeTabRef = useRef(0);

  const pureHtml = useMemo(() => {
    if (!aiResult) return '';
    let cleanedResponse = aiResult.trim();
    const startMarker = /^\s*```html\s*|^\s*```\s*/i;
    const endMarker = /\s*```\s*$/;
    cleanedResponse = cleanedResponse.replace(startMarker, '').replace(endMarker, '');
    return cleanedResponse.trim();
  }, [aiResult]);

  // 1. 함수 정의를 하나로 통합 (useCallback을 써도 좋지만 간단하게 외부에 정의 가능)
  const handleSubTitleClick = (index) => {
    if (index === undefined) index = activeTabRef.current;
    activeTabRef.current = index;

    const container = scrollElRef.current;
    if (!container) return;

    const tiles = container.querySelectorAll('.subTitle-tile');
    const cards = container.querySelectorAll('.report-card');

    if (tiles.length === 0) return;

    tiles.forEach((t) => t.classList.remove('active'));
    cards.forEach((c) => {
      c.style.display = 'none';
      c.classList.remove('active');
    });

    if (tiles[index]) tiles[index].classList.add('active');
    if (cards[index]) {
      cards[index].style.display = 'block';
      cards[index].classList.add('active');
    }
  };

  // 2. 전역 함수 등록 및 초기화
  useEffect(() => {
    window.handleSubTitleClick = handleSubTitleClick;

    // HTML이 주입된 후 실행되도록 함
    if (pureHtml) {
      const timer = setTimeout(() => {
        handleSubTitleClick(0);
      }, 100); // DOM 생성 대기 시간
      return () => clearTimeout(timer);
    }
  }, [pureHtml]); // pureHtml이 바뀔 때마다 실행

  if (loading) return <>로딩중</>;

  return (
    <>
      {/* 3. ref를 여기에 반드시 연결해야 querySelector가 작동합니다 */}
      <div ref={scrollElRef} className="max-w-lg m-auto relative">
        {!!cardPicked.id && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[10]">
            <div
              key={cardPicked.id} // 카드가 바뀔 때마다 애니메이션 초기화
              className="relative pointer-events-auto"
              style={{
                animation: 'flyToCenterAndBack 2s cubic-bezier(0.19, 1, 0.22, 1) forwards',
              }}
            >
              <style>{`
      @keyframes flyToCenterAndBack {
        0% {
          /* 1. 멀리서 시작 (화면 오른쪽 아래, 거대한 크기) */
          transform: translate(30vw, 20vh) scale(5) rotate(15deg);
          opacity: 0;
          filter: blur(10px);
          z-index: 9999;
        }
        50% {
          /* 2. 정중앙 도착 (약간 커진 상태로 강조) */
          transform: translate(0, 0) scale(1.2) rotate(0deg);
          opacity: 1;
          filter: blur(0px);
          z-index: 9999;
        }
        100% {
          /* 3. 배경으로 물러남 (작아지면서 흐릿해짐) */
          transform: translate(0, 0) scale(1);
          opacity: 0.1; /* 배경 느낌을 위해 투명도 낮춤 */
          z-index: -1;   /* 다른 UI 뒤로 보냄 */
        }
      }
    `}</style>

              <img
                src={`/images/tarot/${cardPicked.id}.jpg`}
                alt={cardPicked.kor}
                className="w-40 md:w-56 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] object-cover"
              />
            </div>
          </div>
        )}
   
        <div dangerouslySetInnerHTML={{ __html: pureHtml }} />
        
        <div dangerouslySetInnerHTML={{ __html: aiSajuStyle }} />
      </div>
    </>
  );
}
