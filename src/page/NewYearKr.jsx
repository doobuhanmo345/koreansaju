import React, { useState } from 'react';
import {
  Zap,
  Brain,
  ChevronRight,
  Search,
  Database,
  Users,
  Calendar,
  AlertTriangle,
  Coins,
  Briefcase,
  GraduationCap,
  Heart,
  Sparkles,
  AlertCircle,

  Flame,
  Puzzle,
} from 'lucide-react';

export default function NewYearKr({ setStep }) {
  const handleSubmit = (e) => {
    setStep(1);
  };
  const [activeMonth, setActiveMonth] = useState(1);
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
      <>
        <div className="max-w-2xl mx-auto bg-[#FDF8F5] min-h-screen p-6 font-sans text-[#4A3428]">
          {/* 헤더 섹션 */}
          <header className="text-center mb-10">
            <h1 className="text-2xl font-black mb-2">2026년 병오년 한 해 요약</h1>
            <p className="text-sm text-[#4A3428]/80 leading-relaxed">
              사자가 요약하는 올해 운세
              <br />
              키워드와 활용/조심할 요소를 한 눈에
            </p>
          </header>

          {/* 3단 요약 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* 올해의 키워드 */}
            <div className="bg-white/60 p-5 rounded-[24px] border border-[#E8DCCF] shadow-sm relative overflow-hidden">
              <Calendar className="w-10 h-10 text-[#F47521]/20 absolute -top-1 -right-1" />
              <h3 className="font-bold mb-4 flex items-center gap-2">올해의 키워드</h3>
              <ul className="text-sm space-y-2 font-medium">
                <li>#키워드1</li>
                <li>#키워드2</li>
                <li>#키워드3</li>
              </ul>
            </div>

            {/* 활용할 요소 */}
            <div className="bg-white/60 p-5 rounded-[24px] border border-[#E8DCCF] shadow-sm relative overflow-hidden">
              <Search className="w-10 h-10 text-[#F47521]/20 absolute -top-1 -right-1" />
              <h3 className="font-bold mb-4 flex items-center gap-2">활용할 요소</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">✔️ 요소1</li>
                <li className="flex items-center gap-2">✔️ 요소2</li>
                <li className="flex items-center gap-2">✔️ 요소3</li>
              </ul>
            </div>

            {/* 주의할 요소 */}
            <div className="bg-white/60 p-5 rounded-[24px] border border-[#E8DCCF] shadow-sm relative overflow-hidden">
              <AlertTriangle className="w-10 h-10 text-[#F47521]/20 absolute -top-1 -right-1" />
              <h3 className="font-bold mb-4 flex items-center gap-2">주의할 요소</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2 text-orange-600">✔️ 요소1</li>
                <li className="flex items-center gap-2 text-orange-600">✔️ 요소2</li>
                <li className="flex items-center gap-2 text-orange-600">✔️ 요소3</li>
              </ul>
            </div>
          </div>

          {/* 한 줄 요약 박스 */}
          <div className="bg-[#F47521]/5 py-6 px-4 rounded-2xl text-center mb-12 border border-[#F47521]/10">
            <p className="font-bold text-lg">
              "당신은 올해 <span className="text-[#F47521]">변화의 파도</span>를 타야 합니다."
            </p>
          </div>

          {/* 월별 상세 운세 섹션 */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-xl font-black mb-2">월별 상세 운세</h2>
              <p className="text-xs text-[#4A3428]/70">
                사주로 알아보는 월별 재물, 건강, 직업, 애정운 상세 분석!
              </p>
            </div>

            {/* 운세 아이콘 그룹 */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#F47521]">
                  <Coins size={20} />
                </div>
                <span className="text-[10px] font-bold">재물운</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#F47521]">
                  <Briefcase size={20} />
                </div>
                <span className="text-[10px] font-bold">직업운</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#F47521]">
                  <GraduationCap size={20} />
                </div>
                <span className="text-[10px] font-bold">학업운</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#F47521]">
                  <Heart size={20} />
                </div>
                <span className="text-[10px] font-bold">애정운</span>
              </div>
            </div>

            {/* 월 선택 슬라이더 (간이 구현) */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">
              {[...Array(12)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMonth(i + 1)}
                  className={`flex-shrink-0 w-10 h-10 rounded-full font-bold text-sm transition-all ${
                    activeMonth === i + 1 ? 'bg-[#F47521] text-white' : 'bg-white text-[#4A3428]/40'
                  }`}
                >
                  {i + 1}월
                </button>
              ))}
            </div>

            {/* 운세 상세 내역 */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-[#E8DCCF]/50 space-y-6 relative">
              <div className="flex items-start gap-4">
                <span className="text-[#F47521] font-bold text-sm whitespace-nowrap mt-1">
                  ✦ 재물운 |
                </span>
                <p className="text-sm leading-relaxed font-medium">
                  유입보다 지출 관리 중요. 계획적인 소비가 필요한 시기입니다.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[#F47521] font-bold text-sm whitespace-nowrap mt-1">
                  ✦ 직업운 |
                </span>
                <p className="text-sm leading-relaxed font-medium">
                  큰 투자보다는 내실을 다질 때. 현재 구조를 점검해 보세요.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[#F47521] font-bold text-sm whitespace-nowrap mt-1">
                  ✦ 학업운 |
                </span>
                <p className="text-sm leading-relaxed font-medium">
                  기초 업무 재정비가 성과로 이어집니다.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[#F47521] font-bold text-sm whitespace-nowrap mt-1">
                  ✦ 애정운 |
                </span>
                <p className="text-sm leading-relaxed font-medium">
                  단기적인 관계보다 깊은 신뢰를 쌓는 것에 집중하세요.
                </p>
              </div>

              {/* 하단 유도 (앞서 말씀하신 블러 처리 응용 가능) */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FDF8F5] to-transparent flex items-end justify-center pb-4 pointer-events-none">
                {/* 필요 시 여기에 '더 보기' 버튼 추가 */}
              </div>
            </div>
          </section>
        </div>
      </>
      <>
        <div className="max-w-2xl mx-auto bg-[#FDF8F5] p-6 font-sans text-[#4A3428]">
          {/* 1. 활용, 조심할 달 섹션 (잠금 처리된 영역) */}
          <section className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-xl font-black mb-2">활용, 조심할 달</h2>
              <p className="text-sm text-[#4A3428]/70 leading-relaxed">
                일년 내내 좋을 수도, 나쁠 수도 없습니다.
                <br />
                사자사주는 흐름에 따라 활용 가능한 달을 추천합니다.
              </p>
            </div>

            <div className="relative p-6 bg-white/40 rounded-[32px] border border-[#E8DCCF] overflow-hidden">
              {/* 블러 처리된 컨텐츠 */}
              <div className="select-none pointer-events-none space-y-8">
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                    ✨ 활용하면 좋은 달
                  </h3>
                  <div className="flex gap-2">
                    <div className="bg-white px-4 py-2 rounded-full border border-[#E8DCCF] text-xs font-bold flex items-center gap-2">
                      5월 <span className="text-[#F47521] text-[10px]">⚠️ 부딪힘 주의</span>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-full border border-[#E8DCCF] text-xs font-bold">
                      8월
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                    ⚠️ 조심해야 하는 달
                  </h3>
                  <div className="flex gap-2">
                    <div className="bg-white px-4 py-2 rounded-full border border-[#E8DCCF] text-xs font-bold flex items-center gap-2">
                      5월 <span className="text-[#F47521] text-[10px]">⚠️ 부딪힘 주의</span>
                    </div>
                  </div>
                </div>
              </div>

             
              
            </div>
          </section>

          {/* 2. 사자사주 해석 방식 안내 */}
          <section className="bg-white/60 p-8 rounded-[32px] border border-[#E8DCCF] text-center mb-10">
            <h2 className="text-lg font-black mb-3">사자사주의 신년운세는 이렇게 해석합니다</h2>
            <p className="text-xs text-[#4A3428]/80 leading-relaxed mb-8">
              27명의 명리학자가 미리 제공한 데이터를 기반으로
              <br />
              의뢰자에 맞게 맞춤 구성합니다.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-[#FDF8F5] rounded-2xl flex items-center justify-center border border-[#E8DCCF]">
                  <Database className="text-[#F47521]" size={24} />
                </div>
                <span className="text-[10px] font-bold leading-tight">대운·세운 흐름</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-[#FDF8F5] rounded-2xl flex items-center justify-center border border-[#E8DCCF]">
                  <Flame className="text-[#F47521]" size={24} />
                </div>
                <span className="text-[10px] font-bold leading-tight">병오년 화(火)의 작용</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-[#FDF8F5] rounded-2xl flex items-center justify-center border border-[#E8DCCF]">
                  <Puzzle className="text-[#F47521]" size={24} />
                </div>
                <span className="text-[10px] font-bold leading-tight">
                  개인 사주와의
                  <br />
                  맞춤/조화
                </span>
              </div>
            </div>
          </section>

          {/* 3. 하단 최종 CTA 버튼 */}
          <footer className="text-center space-y-4">
            <p className="text-sm font-medium text-[#4A3428]/80">
              2026년, 감으로 보내지 마세요.
              <br />
              사주로 정리해보세요.
            </p>
            <button className="w-full bg-[#F47521] text-white py-4 rounded-full font-black text-lg shadow-lg shadow-[#F47521]/20 hover:bg-[#E0651B] transition-all active:scale-[0.98]">
              2026년 전체 흐름 무료로 보기
            </button>
          </footer>
        </div>
      </>
    </div>
  );
}
