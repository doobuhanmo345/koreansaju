import React, { useState } from 'react';
import { Zap, Brain, Cpu, ChevronRight, Check, Search, Database, Users } from 'lucide-react';

export default function NewYearKr({ setStep }) {
  const handleSubmit = (e) => {
    setStep();
  };
  return (
    <div className="min-h-screen bg-[#F9F3EE] text-[#4A3428] font-sans pb-20">
      <>
        <div className="w-full min-h-screen bg-[#FDF5F0] text-[#4A3428] font-sans flex flex-col items-center">
          <div className="max-w-[500px] w-full px-6 py-10 flex flex-col items-center">
            {/* 1. 상단 로고 */}
            <div className="flex items-center gap-1.5 mb-8">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xl">
                🦁
              </div>
              <span className="text-xl font-bold tracking-tight text-[#333]">사자사주</span>
            </div>

            {/* 2. 메인 타이틀 */}
            <div className="text-center mb-10">
              <h1 className="text-[28px] font-black leading-tight mb-4 break-keep">
                2026년 병오년
                <br />
                당신의 한 해를 분석해 드립니다.
              </h1>
              <p className="text-[15px] text-gray-500 font-medium leading-relaxed break-keep px-4">
                2026년 당신의 운세를
                <br />
                사자사주에서 무료로 봐드려요!
              </p>
            </div>

            {/* 3. 메인 일러스트 영역 */}
            <div className="w-full relative aspect-[4/3] bg-gradient-to-b from-[#F3E9E0] to-transparent rounded-3xl mb-10 overflow-hidden flex items-center justify-center border border-[#E8DCCF]/50 shadow-sm">
              {/* 일러스트 자리 (이미지 파일이 있다면 <img> 태그로 교체) */}
              <div className="text-center">
                <div className="text-6xl mb-4">👫</div>
                <div className="flex flex-col gap-2">
                  <span className="bg-white/80 px-3 py-1 rounded-full text-xs text-orange-700 shadow-sm font-bold animate-bounce">
                    "올해는 무엇에 집중할까?"
                  </span>
                  <span className="bg-white/80 px-3 py-1 rounded-full text-xs text-orange-700 shadow-sm font-bold">
                    "언제 움직이고 기다려야 할까"
                  </span>
                </div>
              </div>
            </div>

            {/* 4. 입력창 및 버튼 */}
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* 전송 버튼 */}
              <button
                type="submit"
                className="w-full bg-[#F47521] text-white font-bold py-5 rounded-full text-[18px] shadow-[0_4px_15px_rgba(244,117,33,0.3)] flex items-center justify-center gap-1 active:scale-[0.98] transition-all hover:bg-[#e0661a]"
              >
                2026년 전체 흐름 보기 <ChevronRight size={22} strokeWidth={3} />
              </button>
            </form>

            {/* 5. 하단 3단 정보 바 */}
            <div className="w-full flex justify-between items-center mt-12 px-2 py-4 border-t border-[#E8DCCF]">
              <div className="flex flex-col items-center gap-1.5 opacity-70">
                <Users size={18} className="text-[#F47521]" />
                <span className="text-[10px] font-black text-gray-500 leading-tight text-center">
                  27명 명리학자 참여
                  <br />
                  <span className="font-medium text-[9px]">직접 검증 데이터 기반</span>
                </span>
              </div>

              <div className="h-8 w-[1px] bg-[#E8DCCF]"></div>

              <div className="flex flex-col items-center gap-1.5 opacity-70">
                <Database size={18} className="text-[#F47521]" />
                <span className="text-[10px] font-black text-gray-500 leading-tight text-center">
                  수만 건 해석 데이터 구조화
                  <br />
                  <span className="font-medium text-[9px]">방대한 DB 활용 분석</span>
                </span>
              </div>

              <div className="h-8 w-[1px] bg-[#E8DCCF]"></div>

              <div className="flex flex-col items-center gap-1.5 opacity-70">
                <Brain size={18} className="text-[#F47521]" />
                <span className="text-[10px] font-black text-gray-500 leading-tight text-center">
                  질문 맞춤
                  <br />
                  <span className="font-bold">AI 분석</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    </div>
  );
}
