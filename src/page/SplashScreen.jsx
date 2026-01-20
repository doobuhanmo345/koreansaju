import React from 'react';
import splash from '../assets/splash.webp';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-900">
      <div className="relative mb-8 flex justify-center items-center">
        {/* [최적화 1] 
            w-16 h-16의 작은 박스가 bounce될 때 내부 이미지가 함께 레이아웃을 흔들지 않도록 
            will-change: transform을 부여하여 GPU 계층으로 분리했습니다.
        */}
        <div className="w-16 h-16 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-lg animate-optimize-bounce overflow-visible">
          <img
            src={splash}
            className="absolute w-36 h-36 max-w-none object-contain transform"
            alt="splash logo"
            style={{ pointerEvents: 'none' }}
          />
        </div>

        {/* [최적화 2] 
            성능 저하의 가장 큰 원인인 'blur-3xl + animate-pulse' 조합을 제거했습니다.
            대신 정적인 glow 효과를 주어 CPU 부하를 0에 가깝게 줄였습니다.
        */}
        <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full scale-125 -z-10"></div>
      </div>

      {/* 텍스트 로고 */}
      <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
        SAZA SAJU
      </h1>

      {/* 로딩 바: layout 속성이 아닌 transform을 사용하는 애니메이션 권장 */}
      <div className="w-48 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 animate-loading-bar-fast"></div>
      </div>

      <p className="mt-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">
        Finding your destiny...
      </p>

      {/* 사파리 전용 고성능 애니메이션 정의 */}
      <style>{`
        @keyframes optimize-bounce {
          0%, 100% { 
            transform: translateY(0); 
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% { 
            transform: translateY(-15%); 
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        .animate-optimize-bounce {
          animation: optimize-bounce 1s infinite;
          will-change: transform;
        }

        @keyframes loading-bar-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar-fast {
          width: 100%;
          animation: loading-bar-fast 1.5s infinite linear;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
