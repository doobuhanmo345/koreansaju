import { useLoading } from '../context/useLoadingContext';
import { aiSajuStyle } from '../data/aiResultConstants';
import { useMemo, useEffect, useRef, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../context/useLanguageContext';
import { parseAiResponse } from '../utils/helpers';

export default function ViewSazaResult({ userQuestion, onReset }) {
  const { loading, aiResult } = useLoading();
  const scrollElRef = useRef(null); // 컨테이너 참조용
  const { language } = useLanguage();

  const [data, setData] = useState({}); // 파싱된 데이터를 담을 로컬 상태

  // [수정] 더 강력한 파싱 함수 및 에러 로그 추가

  useEffect(() => {
    if (aiResult) {
      const parsedData = parseAiResponse(aiResult);
      if (parsedData) {
        setData(parsedData); // 파싱 성공 시 데이터 세팅
      }
    }
  }, [aiResult]); // aiResult가 업데이트될 때마다 실행
  if (loading) return <>로딩중</>;
  console.log(data, aiResult);

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
          {data.contents?.map((i) => (
            <p>{i}</p>
          ))}
          <strong>사자의 조언: {data.saza}</strong>
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-6">
        <button
          onClick={onReset} // 클릭 시 부모의 step을 'input'으로 변경
          className="w-full p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          {language === 'en' ? 'Ask another question' : '다른 질문하기'}
        </button>

        <p className="text-[11px] text-slate-400 text-center font-medium">
          {language === 'en'
            ? 'Enter a new question to restart the Saju analysis.'
            : '새로운 질문을 입력하면 사주 분석을 다시 시작합니다.'}
        </p>
      </div>
      {/* 스타일 주입 */}
      <div dangerouslySetInnerHTML={{ __html: aiSajuStyle }} />
    </div>
  );
}
