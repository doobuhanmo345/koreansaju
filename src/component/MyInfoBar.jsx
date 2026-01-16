import React from 'react';
import { useAuthContext } from '../context/useAuthContext';
import { useLanguage } from '../context/useLanguageContext';
export default function MyInfoBar() {
  const { userData } = useAuthContext();
  const { language } = useLanguage();
  return (
    <>
      <div className="flex items-center gap-3 text-sm tracking-tight">
        {/* 날짜와 시간 세트 */}
        <div className="flex items-center gap-1.5">
          <span className="text-indigo-500 dark:text-indigo-400 font-bold text-[10px] uppercase">
            Birth
          </span>
          <span className="font-medium">{userData.birthDate.split('T')[0].replace(/-/g, '.')}</span>
          <span className="text-slate-400 dark:text-slate-600 text-xs font-light">
            {userData?.isTimeUnknown
              ? language === 'en'
                ? 'Time Unknown'
                : '시간 모름'
              : userData.birthDate.split('T')[1]}
          </span>
        </div>
        {/* 성별 배지 */}
        <div
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
            userData.gender === 'male'
              ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/30'
              : 'bg-rose-50 text-rose-500 dark:bg-rose-900/30'
          }`}
        >
          {userData.gender === 'male' ? 'M' : 'F'}
        </div>
      </div>

      {/* 수정하기 버튼 */}
      <button
        onClick={() => {
          navigate('/editprofile');
        }}
        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4"
      >
        {language === 'ko' ? '수정하기' : 'Edit'}
      </button>
    </>
  );
}
