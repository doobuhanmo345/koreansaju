import { BoltIcon } from '@heroicons/react/24/outline';
export default function CreditIcon({num}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 
    dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50 py-1 px-3.5 rounded-md text-[13px] font-bold shadow-sm transition-all duration-300"
    >
      {/* 아이콘 부분: 살짝 애니메이션을 줘서 생동감 있게 */}
      <BoltIcon className="h-4 w-4 fill-amber-500 dark:fill-amber-400 animate-pulse" />

      <span className="tracking-tight">
        {num}
        <span className="text-[11px] opacity-80 ml-0.5 font-medium">크레딧</span>
      </span>
    </span>
  );
}
