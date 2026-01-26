import React from 'react';

export default function ReportHid({ 
  badge, 
  title, 
  des, 
  gradientColor = '#FAF7F4', 
  themeColor = '#F47521',
  hClass = 'h-[800px]',
  mClass = 'mt-[-400px]'
}) {
  return (
    <div>
      {/* --- 가림막 및 섹션 설명 시작 (높이 커스터마이징 가능) --- */}
      <div className={`relative w-full z-10 flex flex-col justify-end ${hClass} ${mClass}`}>
        {/* 1. 배경 가림막: 위/아래 광폭 투명 그라데이션 (Ultra-Wide Transition) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            background: `linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.95) 15%, rgba(255, 255, 255, 0.7) 40%, ${gradientColor} 70%, ${gradientColor} 90%, transparent 100%)` 
          }}
        ></div>

        {/* 2. 중앙 설명 카드 영역 */}
        <div className="relative z-20 px-6 pb-16 text-center">
          <div className="max-w-md mx-auto">
            {/* 아이콘 및 상단 배지 */}
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 border rounded-full shadow-sm mb-4"
              style={{ 
                borderColor: `${themeColor}4D`,
                backgroundColor: `${themeColor}0D` // ~5% opacity for a subtle tint
              }}
            >
              {!!badge && (
                <>
                  <span className="text-xs font-bold" style={{ color: themeColor }}>{badge[0]}</span>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }}></div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{badge[1]}</span>
                </>
              )}
            </div>

            {/* 메인 타이틀 */}
            <h3 className="text-[22px] font-black text-slate-800 dark:text-white mb-3 break-keep leading-tight">
              {title}
            </h3>

            {/* 설명 문구 */}
            <p className="text-[14px] text-slate-600 dark:text-slate-400 mb-8 leading-relaxed break-keep font-medium">
              {des}
            </p>

            {/* 장식용 구분선 (허전함 방지) */}
            <div className="flex justify-center items-center gap-2 opacity-40">
              <div className="w-8 h-[1px]" style={{ backgroundColor: themeColor }}></div>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }}></div>
              <div className="w-8 h-[1px]" style={{ backgroundColor: themeColor }}></div>
            </div>
          </div>
        </div>
      </div>
      {/* --- 가림막 및 섹션 설명 끝 --- */}
    </div>
  );
}
