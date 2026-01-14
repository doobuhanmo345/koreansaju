import React from 'react';

export default function AdHid({ badge, title, des }) {
  return (
    <div>
      A{/* --- 가림막 및 섹션 설명 시작 --- */}
      <div className="relative w-full h-[500px] mt-[-400px] z-10 flex flex-col justify-end">
        {/* 1. 배경 가림막: 위는 투명하고 아래로 갈수록 진해지는 화이트/베이지 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F4] via-[#FAF7F4]/95 to-transparent pointer-events-none"></div>

        {/* 2. 중앙 설명 카드 영역 */}
        <div className="relative z-20 px-6 pb-16 text-center">
          <div className="max-w-md mx-auto">
            {/* 아이콘 및 상단 배지 */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#F47521]/30 rounded-full shadow-sm mb-4">
              {!!badge && (
                <>
                  <span className="text-xs font-bold text-[#F47521]">{badge[0]}</span>
                  <div className="w-1 h-1 rounded-full bg-[#F47521]"></div>
                  <span className="text-xs font-bold text-[#4A3428]">{badge[1]}</span>
                </>
              )}
            </div>

            {/* 메인 타이틀 */}
            <h3 className="text-[22px] font-black text-[#4A3428] mb-3 break-keep leading-tight">
              {title}
            </h3>

            {/* 설명 문구 */}
            <p className="text-[14px] text-[#7A665A] mb-8 leading-relaxed break-keep font-medium">
              {des}
            </p>

            {/* 장식용 구분선 (허전함 방지) */}
            <div className="flex justify-center items-center gap-2 opacity-30">
              <div className="w-8 h-[1px] bg-[#4A3428]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#4A3428]"></div>
              <div className="w-8 h-[1px] bg-[#4A3428]"></div>
            </div>
          </div>
        </div>
      </div>
      {/* --- 가림막 및 섹션 설명 끝 --- */}
    </div>
  );
}
