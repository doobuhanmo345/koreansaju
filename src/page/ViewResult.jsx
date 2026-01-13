import { useLoading } from '../context/useLoadingContext';
import { aiSajuStyle, reportStyle } from '../data/aiResultConstants';
import react, { useMemo, useEffect, useRef } from 'react';

export default function ViewResult({}) {
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
      <div ref={scrollElRef} className="max-w-lg m-auto">
        <div dangerouslySetInnerHTML={{ __html: pureHtml }} />
        {/* <div dangerouslySetInnerHTML={{ __html: reportStyle }} /> */}
        <div dangerouslySetInnerHTML={{ __html: aiSajuStyle }} />
      </div>
    </>
  );
}
