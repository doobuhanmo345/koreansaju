import React, { useState, useRef } from 'react';
import {
  Zap,
  Brain,
  Cpu,
  ChevronRight,
  Check,
  Search,
  Database,
  Users,
  CheckCircle2,
} from 'lucide-react';
import AdReview from '../component/AdReview';

export default function AmaKr({ question, setQuestion, setStep }) {
  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (!question.trim()) {
      alert('질문을 넣어주세요');
      return;
    }

    setStep(1);
  };

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    inputRef.current?.focus();
  };

  return (
    <div
      className="relative min-h-screen bg-[#F9F3EE] text-[#4A3428] font-sans pb-20"
      style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        
        .amakr-container, .amakr-container * {
          font-family: 'Pretendard Variable', Pretendard, sans-serif !important;
          letter-spacing: -0.02em;
        }

        .amakr-container h1, .amakr-container p, .amakr-container span {
          word-break: keep-all;
        }
      `,
        }}
      />

      {/* 섹션 1: 히어로 */}
      <div className="w-full min-h-screen bg-[#FDF5F0] text-[#4A3428] flex flex-col items-center">
        {/* 로고 */}
        <div className="flex items-center gap-2 my-8 sm:my-10">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
            🦁
          </div>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#333]">
            사자사주
          </span>
        </div>

        {/* 메인 타이틀 */}
        <div className="text-center my-10 sm:my-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 break-keep">
            내 인생에서 지금 가장 궁금한 질문,
            <br />
            사주로 정확히 답해드립니다
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-medium leading-relaxed break-keep">
            27명의 명리학자가 측정한 해석 데이터를 기반으로
            <br />
            AI가 당신의 질문에 맞는 사주 답변을 구성합니다.
          </p>
        </div>

        {/* 메인 이미지 */}
        <div className="w-full max-w-2xl px-4">
          <img
            src="images/adImage/sazatalk/main.png"
            className="w-full object-cover [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
            alt="사자사주 메인"
          />
        </div>

        {/* 입력 폼 */}
        <div className="max-w-lg w-full px-6 py-10 sm:py-14 flex flex-col items-center">
          <div className="w-full space-y-4">
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="지금 가장 궁금한 질문은?"
                className="w-full bg-white border border-[#E8DCCF] py-5 sm:py-6 pl-6 sm:pl-7 pr-14 rounded-2xl text-[#4A3428] placeholder-[#C4B5A9] text-base sm:text-lg shadow-sm focus:outline-none focus:border-[#F47521] transition-colors"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight size={24} className="text-[#C4B5A9]" />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-[#F47521] text-white font-bold py-5 sm:py-6 rounded-full text-lg sm:text-xl shadow-[0_4px_15px_rgba(244,117,33,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-[#e0661a]"
            >
              사자에게 질문하기 <ChevronRight size={24} strokeWidth={3} />
            </button>
          </div>

          <div className="w-full flex items-center mt-12 px-2 py-4 border-t border-[#E8DCCF]">
            {/* 첫 번째 아이템 - flex-1 추가 */}
            <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
              <Users size={18} className="text-[#F47521]" />
              <span className="text-[10px] font-black text-gray-500 leading-tight text-center">
                27명 명리학자 참여
                <br />
                <span className="font-medium text-[9px]">직접 검증 데이터 기반</span>
              </span>
            </div>

            {/* 구분선 - shrink-0 추가해서 찌그러지지 않게 방지 */}
            <div className="h-8 w-[1px] bg-[#E8DCCF] shrink-0"></div>

            {/* 두 번째 아이템 - flex-1 추가 */}
            <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
              <Database size={18} className="text-[#F47521]" />
              <span className="text-[10px] font-black text-gray-500 leading-tight text-center">
                수만 건 해석 데이터 구조화
                <br />
                <span className="font-medium text-[9px]">방대한 DB 활용 분석</span>
              </span>
            </div>

            {/* 구분선 */}
            <div className="h-8 w-[1px] bg-[#E8DCCF] shrink-0"></div>

            {/* 세 번째 아이템 - flex-1 추가 */}
            <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
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

      {/* 섹션 2: 강점 비교 */}
      <div className="bg-[#FDF8F3] min-h-screen text-[#4A3427] py-12 sm:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* 타이틀 */}
          <div className="flex items-center justify-center gap-2 mb-10 sm:mb-12">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F37321] rounded-full flex items-center justify-center text-lg sm:text-xl">
              🦁
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">사자사주만의 강점</h2>
          </div>

          {/* 비교 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* 일반 사주 */}
            <div className="bg-white/40 p-6 sm:p-8 rounded-3xl border border-white/60">
              <h3 className="text-lg sm:text-xl font-bold text-gray-400 mb-5 text-center">
                일반 사주 서비스
              </h3>
              <ul className="space-y-4">
                {['다 들었는데 기억 안남', '학문적 설명 위주', '지금 고민에 대한 답이 부족'].map(
                  (text, i) => (
                    <li
                      key={i}
                      className="text-sm sm:text-base text-gray-400 flex items-start gap-2 leading-relaxed"
                    >
                      <span className="mt-0.5">✓</span> {text}
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* 사자사주 */}
            <div className="bg-[#FFF8F3] p-6 sm:p-8 rounded-3xl border border-[#F37321]/20">
              <h3 className="text-lg sm:text-xl font-bold text-[#F37321] mb-5 text-center">
                사자사주
              </h3>
              <ul className="space-y-4">
                {['질문 하나에 집중', '필요한 사주 요소만 분석', '해석 → 행동 지침까지 제시'].map(
                  (text, i) => (
                    <li
                      key={i}
                      className="text-sm sm:text-base font-bold text-[#4A3427] flex items-start gap-2 leading-relaxed"
                    >
                      <Check size={16} className="text-[#F37321] mt-1 flex-shrink-0" /> {text}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          {/* 강조 텍스트 */}
          <p className="text-center text-sm sm:text-base leading-relaxed text-[#4A3427] mb-16 sm:mb-20 px-2">
            맥락이 고려되지 않아 <span className="text-[#A17C6B] font-bold">'대강 다 맞는'</span>{' '}
            상황의 사주 해석보다는
            <br />
            <span className="text-[#F37321] font-bold">'지금 내 질문'</span>에 맞게 사주를 해석해야
            의미가 있습니다.
          </p>

          {/* 분석 프로세스 */}
          <div className="flex items-center justify-center gap-2 mb-10 sm:mb-14">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F37321] rounded-full flex items-center justify-center text-lg sm:text-xl">
              🦁
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">어떻게 사주를 분석할까요?</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-8 sm:gap-4 mb-12 sm:mb-16">
            {[
              {
                step: '1',
                title: '수만 명의 임상 데이터',
                desc: '수만건의 실제 사주 사례를 수집하여 정밀한 운세 패턴을 분석합니다.',
                icon: <Users size={28} />,
              },
              {
                step: '2',
                title: '27인의 명리학 전문가',
                desc: '다수의 명리학 선생님들과 함께 데이터를 검증하고 깊이 있게 연구합니다.',
                icon: <Search size={28} />,
              },
              {
                step: '3',
                title: '질문 맞춤형 AI 모델',
                desc: '학습된 방대한 데이터를 바탕으로 당신의 고민에 최적화된 답변을 구성합니다.',
                icon: <Cpu size={28} />,
              },
            ].map((item, idx, array) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center flex-1 w-full max-w-sm">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 border border-orange-50">
                    <span className="absolute -top-2 -left-2 bg-gray-500 text-white text-sm font-bold w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md">
                      {item.step}
                    </span>
                    <span className="text-[#F47521]">{item.icon}</span>
                  </div>
                  <p className="text-base sm:text-lg text-gray-800 font-bold leading-tight text-center mb-2">
                    {item.title}
                  </p>
                  <p className="text-sm sm:text-base text-gray-400 text-center">{item.desc}</p>
                </div>

                {idx < array.length - 1 && (
                  <div className="flex items-center justify-center text-gray-300 py-2 sm:py-0 sm:pt-12">
                    <div className="block sm:hidden">
                      <ChevronRight size={24} className="rotate-90" strokeWidth={3} />
                    </div>
                    <div className="hidden sm:block">
                      <ChevronRight size={24} strokeWidth={3} />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-[#FAF4EF] p-7 sm:p-10 rounded-3xl text-center border border-[#EADDD0] mb-16 sm:mb-20">
            <p className="text-sm sm:text-base leading-relaxed text-[#4A3427]">
              사자사주는 근거 없는 막연한 풀이를 하지 않습니다.
              <br />
              <span className="font-bold">
                수만 건의 실제 임상 사례와 명리학의 정통 원칙을 결합해
                <br />
                지금 당신의 상황에 가장 확실한 행동 지침을 제시합니다.
              </span>
            </p>
          </div>

          {/* 질문 제안 */}
          <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F37321] rounded-full flex items-center justify-center text-lg sm:text-xl">
              🦁
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              궁금한건 아무거나 물어보세요!
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              '이직해도 될까?',
              '이 사람과 결혼해도 될까?',
              '지금 사업 방향이 맞을까?',
              '올해 재물에서 조심할 부분은?',
              '그 사람을 다시 만날 수 있을까?',
            ].map((chip, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 px-5 py-3 rounded-full text-sm sm:text-base font-medium text-gray-500 shadow-sm hover:border-[#F37321] hover:text-[#F37321] transition-all cursor-pointer"
              >
                {chip}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 섹션 3: 답변 예시 */}
      <header className="pt-12 sm:pt-20 pb-8 sm:pb-12 text-center px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
          사자사주는 이렇게 답을 줍니다
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-gray-700">
          당신의 사주를 분석한 후 당신의{' '}
          <span className="text-orange-600 font-bold"> 질문에 대해 </span>
          <br />
          심층적으로 답변합니다.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-5 space-y-6">
        {/* 분석 카드 */}
        <div className="w-full mx-auto p-4 sm:p-6 bg-[#FFF5EE] rounded-[32px] sm:rounded-[40px]">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-7 sm:p-10 md:p-12 border border-orange-100 shadow-[0_10px_40px_-15px_rgba(255,165,0,0.15)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200" />

            <div className="relative z-10 mb-8">
              <div className="inline-block px-4 py-1.5 bg-orange-50 text-orange-500 text-xs sm:text-sm font-black rounded-lg border border-orange-100 mb-3">
                CAREER ANALYSIS
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#A0522D] flex items-center gap-2">
                지금 이직해도 될까요? 🦁
              </h2>
            </div>

            <div className="space-y-5 relative z-10">
              <div className="flex gap-4 p-4 rounded-2xl transition-colors hover:bg-orange-50/30">
                <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700">
                  <span className="font-extrabold text-[#A0522D] block mb-1">분석</span>
                  당신의 사주와{' '}
                  <span className="text-orange-600 font-bold underline underline-offset-4 decoration-orange-200">
                    병오년
                  </span>
                  의 기운을 직업적으로 정밀하게 분석합니다.
                </p>
              </div>

              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700">
                  <span className="font-extrabold text-orange-700 block mb-1">
                    좋은 시기인 이유
                  </span>
                  올해는 새로운 변화를 통해 본인의 능력을 증명하기에 가장 적합한 시기입니다.
                </p>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl transition-colors hover:bg-orange-50/30">
                <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700">
                  <span className="font-extrabold text-[#A0522D] block mb-1">추천 행동 방향</span>
                  5월이 되기 전 이직 준비를 구체화하고 포트폴리오를 다듬어보세요.
                </p>
              </div>

              <div className="flex gap-4 p-4 sm:p-5">
                <CheckCircle2 className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-red-900/80 font-medium">
                  <span className="font-extrabold text-red-700 block mb-1">주의할 점</span>
                  단, 금의 기운이 강하니 자존심을 내세우기보다{' '}
                  <span className="font-bold underline underline-offset-4 decoration-red-200">
                    유연한 관계 형성
                  </span>
                  에 집중하세요.
                </p>
              </div>
            </div>

            <div className="absolute -bottom-10 -right-10 opacity-[0.12] group-hover:opacity-[0.18] transition-opacity duration-500 pointer-events-none">
              <img
                src="images/adImage/sazatalk/saza.png"
                alt="saza mascot"
                className="w-56 h-56 sm:w-72 sm:h-72 rotate-[-15deg] grayscale-[20%]"
              />
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="space-y-5">
          <div className="bg-white rounded-full py-5 flex items-center justify-center gap-2 shadow-sm border border-orange-50">
            <span className="text-2xl sm:text-3xl font-black">무료 </span>
            <Zap className="w-7 h-7 text-orange-400 fill-orange-400" />
          </div>

          <div className="space-y-4 px-4 py-2">
            {[
              '질문에 답하는 정밀 분석',
              '답변 후 다른 주제 재질문 가능',
              '나의 기운과 올해 환경을 고려한 맞춤 답변',
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm sm:text-base md:text-lg font-medium text-orange-900/70"
              >
                <Check className="w-5 h-5" /> {text}
              </div>
            ))}
          </div>

          <button
            onClick={scrollToInput}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-5 sm:py-6 rounded-full text-lg sm:text-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            지금 가장 궁금한 질문, 사주로 받아보세요
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <AdReview />

        {/* 푸터 */}
        <footer className="pt-14 sm:pt-20 text-center space-y-5 pb-10">
          <div className="inline-block w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-full border-2 border-orange-100 p-1">
            <div className="w-full h-full bg-orange-100 rounded-full flex items-center justify-center text-3xl sm:text-4xl">
              🦁
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-medium leading-relaxed px-6">
            사자사주는 단순히 운을 읽어주는 데 그치지 않습니다.
            <br />
            <span className="text-orange-600 font-bold">
              당신의 고민이 확신으로 바뀌는 명확한 해답을 제시합니다.
            </span>
          </p>
        </footer>
      </main>
    </div>
  );
}
