import React from 'react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-900">
      {/* 로고나 아이콘 (여기에 서비스 로고 이미지를 넣으세요) */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-bounce">
          <span className="text-4xl text-white font-black">🥠</span>
        </div>
        {/* 로고 뒤 후광 효과 */}
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
      </div>

      {/* 텍스트 로고 */}
      <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
        SAZA SAJU
      </h1>

      {/* 로딩 바 */}
      <div className="w-48 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 animate-loading-bar"></div>
      </div>

      <p className="mt-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">
        Finding your destiny...
      </p>
    </div>
  );
}
