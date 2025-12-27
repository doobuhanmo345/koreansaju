import splash from '../assets/splash.png';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-900">
      <div className="relative mb-8 flex justify-center items-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-bounce overflow-visible">
          <img
            src={splash}
            className="absolute w-36 h-36 max-w-none object-contain transform"
            alt="splash logo"
          />
        </div>

        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse -z-10"></div>
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
