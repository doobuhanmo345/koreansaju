import { useLoading } from '../context/useLoadingContext';
import { aiSajuStyle } from '../data/aiResultConstants';
import { useMemo, useEffect, useRef } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

export default function ViewSazaResult({ userQuestion, onReset }) {
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
    <div ref={scrollElRef} className="max-w-lg m-auto p-4 space-y-6">
      {/* 사용자의 질문 (오른쪽 정렬 말풍선) */}
      {userQuestion && (
        <div className="flex justify-end">
          <div className="max-w-[80%] bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md">
            <p className="text-sm font-bold">{userQuestion}</p>
          </div>
        </div>
      )}

      {/* AI의 사주 분석 답변 (왼쪽 정렬 말풍선) */}
      <div className="flex justify-start">
        <div className="leading-8 w-full bg-white dark:bg-slate-800 p-5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700">
          {/* 주입되는 HTML 스타일링 제어 */}
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: pureHtml }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-6">
        <button
          onClick={onReset} // 클릭 시 부모의 step을 'input'으로 변경
          className="w-full p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          다른 질문하기
        </button>

        <p className="text-[11px] text-slate-400 text-center font-medium">
          새로운 질문을 입력하면 사주 분석을 다시 시작합니다.
        </p>
      </div>
      {/* 스타일 주입 */}
      <div dangerouslySetInnerHTML={{ __html: aiSajuStyle }} />
    </div>
  );
}
