import React from 'react';
import { useLanguage } from '../context/useLanguageContext';

// 2. 매개변수 이름을 children으로 수정하고 중괄호 { }로 감싸야 합니다.
export default function IconWrapper({ title, subTitle, children }) {
  const { language } = useLanguage(); // 3. 언어 상태 가져오기

  return (
    <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 my-3">
      <div className="mb-6 ml-1 text-left">
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{subTitle}</p>
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>
      {/* 4. 넘겨받은 자식 컴포넌트 렌더링 */}
      {children}
    </div>
  );
}
