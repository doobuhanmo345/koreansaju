import React, { useState, useEffect } from 'react';

export default function LoadingPage() {
  const [dots, setDots] = useState('');

  // 점 애니메이션 (...)
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[999] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* 1. 배경용 은하계 배경 (움직이는 그라데이션) */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* 2. 메인 애니메이션: 회전하는 마법진/데이터 서클 */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* 바깥쪽 점선 원 (시계방향 회전) */}
        <div className="absolute inset-0 border-4 border-dashed border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite]" />

        {/* 중간 실선 원 (반시계방향 회전) */}
        <div className="absolute inset-4 border-2 border-purple-500/50 rounded-full animate-[spin_6s_linear_infinite_reverse]">
          {/* 원 위의 포인트 점들 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_#a855f7]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_#a855f7]" />
        </div>

        {/* 안쪽 빛나는 구체 */}
        <div className="relative w-32 h-32 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full shadow-[0_0_50px_rgba(99,102,241,0.5)] flex items-center justify-center animate-bounce">
          <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
            {/* 구체 내부의 스캐닝 효과 */}
            <div className="w-full h-1 bg-indigo-400 shadow-[0_0_15px_#818cf8] animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>

      {/* 3. 텍스트 영역 */}
      <div className="mt-12 text-center z-10">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 tracking-tighter mb-2">
          운명의 지도를 그리는 중
        </h2>
        <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">
          Calculating Destiny{dots}
        </p>
      </div>

      {/* 4. 하단 팁 (랜덤 문구 노출하면 더 좋음) */}
      <div className="absolute bottom-12 px-8 text-center">
        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
          "사주는 정해진 결론이 아니라, <br />
          당신이 나아갈 길을 비춰주는 등불입니다."
        </p>
      </div>

      {/* Tailwind에 없는 사용자 정의 애니메이션 주입 */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-50px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(50px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
