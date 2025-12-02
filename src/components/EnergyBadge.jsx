// src/components/EnergyBadge.jsx (또는 해당 파일 위치)
import React from 'react';
import { BoltIcon } from '@heroicons/react/24/solid'; // 💥 아이콘 import 필수!

const EnergyBadge = ({ active = true, consuming = false, loading = false, cost = -1 }) => {
  return (
    <div
      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md transition-all duration-300 ease-out transform ${
        !active
          ? 'bg-transparent scale-100 opacity-100' // 비활성
          : consuming
            ? 'bg-amber-400 scale-125 shadow-[0_0_15px_rgba(251,191,36,1)]' // 💥 소비 중
            : loading
              ? 'bg-transparent scale-0 opacity-0' // 🌀 로딩 중 (사라짐)
              : 'bg-black/20 scale-100 opacity-100' // 평소 활성
      }`}
    >
      {/* 숫자 */}
      <span
        className={`text-[11px] font-black leading-none pt-[1px] font-mono transition-colors ${
          !active ? 'text-gray-500' : consuming ? 'text-white' : 'text-amber-300 drop-shadow-sm'
        }`}
      >
        {cost}
      </span>

      {/* 번개 아이콘 */}
      <BoltIcon
        className={`w-3.5 h-3.5 transition-colors ${
          !active
            ? 'text-gray-400'
            : consuming
              ? 'text-white fill-white'
              : 'text-amber-400 fill-amber-400'
        }`}
      />
    </div>
  );
};

export default EnergyBadge;
