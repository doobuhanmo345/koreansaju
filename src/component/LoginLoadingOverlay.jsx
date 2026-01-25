import React from 'react';
import splash from '../assets/splash.webp';

export default function LoginLoadingOverlay({ onCancel }) {
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative mb-8 flex justify-center items-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-optimize-bounce overflow-visible">
          <img
            src={splash}
            className="absolute w-36 h-36 max-w-none object-contain transform"
            alt="splash logo"
            style={{ pointerEvents: 'none' }}
          />
        </div>
        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 animate-pulse -z-10"></div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            로그인 진행 중
        </h2>
        <div className="w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-indigo-600 animate-loading-bar-fast"></div>
        </div>
        <p className="mt-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8">
          Verifying Destiny...
        </p>

        {/* 수동 취소 버튼 추가 */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 underline decoration-slate-300 hover:text-slate-600 transition-colors"
          >
            취소 / 닫기
          </button>
        )}
      </div>

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
