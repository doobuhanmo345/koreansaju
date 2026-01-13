import React, { useState, useRef } from 'react';
import { Zap, Brain, Cpu, ChevronRight, Check, Search, Database, Users } from 'lucide-react';

export default function AmaKr({ question, setQuestion, setStep }) {
  const handleSubmit = (e) => {
    setStep();
  };
  const inputRef = useRef(null); // 2. 입력창을 가리킬 레퍼런스 생성
  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    inputRef.current?.focus(); // 스크롤 후 바로 입력할 수 있게 포커스
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
        
        /* 이 컴포넌트 내의 모든 요소에 폰트 강제 적용 */
        .amakr-container, .amakr-container * {
          font-family: 'Pretendard Variable', Pretendard, sans-serif !important;
          letter-spacing: -0.02em; /* 한국어는 자간을 살짝 줄여야 예쁩니다 */
        }

        /* 줄바꿈 가독성 개선 */
        .amakr-container h1, .amakr-container p, .amakr-container span {
          word-break: keep-all;
        }
      `,
        }}
      />
      <>
        <div className="w-full min-h-screen bg-[#FDF5F0] text-[#4A3428] font-sans flex flex-col items-center">
          <div className="flex items-center gap-1.5 my-8">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xl">
              🦁
            </div>
            <span className="text-xl font-bold tracking-tight text-[#333]">사자사주</span>
          </div>
          <div className="text-center my-10 relative">
            <h1 className="text-[28px] font-black leading-tight mb-4 break-keep">
              내 인생에서 지금 가장 궁금한 질문,
              <br />
              사주로 정확히 답해드립니다
            </h1>
            <p className="text-[15px] text-gray-500 font-medium leading-relaxed break-keep px-4">
              27명의 명리학자가 측정한 해석 데이터를 기반으로
              <br />
              AI가 당신의 질문에 맞는 사주 답변을 구성합니다.
            </p>
          </div>
          <div>
            <img
              src="images/adImage/sazatalk/main.png"
              className="w-full object-cover [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
            />
          </div>
          <div className="max-w-[500px] w-full px-6 py-10 flex flex-col items-center">
            {/* 1. 상단 로고 */}

            {/* 2. 메인 타이틀 */}

            {/* <div className="w-full relative aspect-[4/3] bg-gradient-to-b from-[#F3E9E0] to-transparent rounded-3xl mb-10 overflow-hidden flex items-center justify-center border border-[#E8DCCF]/50 shadow-sm">
          
              <div className="text-center">
                <div className="flex flex-col gap-2">
                  <img src="images/adImage/sazatalk/main_result.png" />
                </div>
              </div>
            </div> */}

            {/* 4. 입력창 및 버튼 */}
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* 인풋창 */}
              <div className="relative w-full">
                <input
                  ref={inputRef}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="지금 가장 궁금한 질문은?"
                  className="w-full bg-white border border-[#E8DCCF] py-5 pl-6 pr-12 rounded-2xl text-[#4A3428] placeholder-[#C4B5A9] text-[16px] shadow-sm focus:outline-none focus:border-[#F47521] transition-colors"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight size={20} className="text-[#C4B5A9]" />
                </div>
              </div>

              {/* 전송 버튼 */}
              <button
                type="submit"
                className="w-full bg-[#F47521] text-white font-bold py-5 rounded-full text-[18px] shadow-[0_4px_15px_rgba(244,117,33,0.3)] flex items-center justify-center gap-1 active:scale-[0.98] transition-all hover:bg-[#e0661a]"
              >
                사자에게 질문하기 <ChevronRight size={22} strokeWidth={3} />
              </button>
            </form>

            {/* 5. 하단 3단 정보 바 */}
            <div className="w-full flex justify-between items-center mt-12 px-2 py-4 border-t border-[#E8DCCF]">
              <div className="flex flex-col items-center gap-1.5 opacity-70">
                <Users size={18} className="text-[#F47521]" />
                <span className="text-[13px] font-black text-gray-500 leading-tight text-center">
                  27명 명리학자 참여
                  <br />
                  <span className="font-medium text-[9px]">직접 검증 데이터 기반</span>
                </span>
              </div>

              <div className="h-8 w-[1px] bg-[#E8DCCF]"></div>

              <div className="flex flex-col items-center gap-1.5 opacity-70">
                <Database size={18} className="text-[#F47521]" />
                <span className="text-[13px] font-black text-gray-500 leading-tight text-center">
                  수만 건 해석 데이터 구조화
                  <br />
                  <span className="font-medium text-[9px]">방대한 DB 활용 분석</span>
                </span>
              </div>

              <div className="h-8 w-[1px] bg-[#E8DCCF]"></div>

              <div className="flex flex-col items-center gap-1.5 opacity-70">
                <Brain size={18} className="text-[#F47521]" />
                <span className="text-[13px] font-black text-gray-500 leading-tight text-center">
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
        <div className="bg-[#FDF8F3] min-h-screen text-[#4A3427] font-sans py-12 px-6 overflow-x-hidden">
          <div className="max-w-md mx-auto">
            {/* --- 타이틀 --- */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-6 h-6 bg-[#F37321] rounded-full flex items-center justify-center text-[10px]">
                🦁
              </div>
              <h2 className="text-lg font-bold">사자사주만의 강점</h2>
            </div>

            {/* --- 강점 비교 카드 --- */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* 일반 사주 서비스 */}
              <div className="bg-white/40 p-5 rounded-[2rem] border border-white/60">
                <h3 className="text-md font-bold text-gray-400 mb-4 text-center">
                  일반 사주 서비스
                </h3>
                <ul className="space-y-4">
                  {['다 들었는데 기억 안남', '학문적 설명 위주', '지금 고민에 대한 답이 부족'].map(
                    (text, i) => (
                      <li
                        key={i}
                        className="text-[12px] text-gray-400 flex items-start gap-1 leading-tight"
                      >
                        <span className="mt-0.5">✓</span> {text}
                      </li>
                    ),
                  )}
                </ul>
              </div>

              {/* 사자사주 */}
              <div className="bg-[#FFF8F3] p-5 rounded-[2rem] border border-[#F37321]/20">
                <h3 className="text-md font-bold text-[#F37321] mb-4 text-center">사자사주</h3>
                <ul className="space-y-4">
                  {['질문 하나에 집중', '필요한 사주 요소만 분석', '해석 → 행동 지침까지 제시'].map(
                    (text, i) => (
                      <li
                        key={i}
                        className="text-[12px] font-bold text-[#4A3427] flex items-start gap-1 leading-tight"
                      >
                        <Check size={12} className="text-[#F37321] mt-0.5 flex-shrink-0" /> {text}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>

            {/* --- 중간 강조 텍스트 --- */}
            <p className="text-center text-[12px] leading-relaxed text-[#4A3427] mb-16 px-2">
              맥락이 고려되지 않아 <span className="text-[#A17C6B] font-bold">'대강 다 맞는'</span>{' '}
              상황의 사주 해석보다는
              <br />
              <span className="text-[#F37321] font-bold">'지금 내 질문'</span>에 맞게 사주를
              해석해야 의미가 있습니다.
            </p>

            {/* --- 명리학자 데이터 섹션 --- */}
            <div className="flex items-center justify-center gap-2 mb-10">
              <div className="w-6 h-6 bg-[#F37321] rounded-full flex items-center justify-center text-[10px]">
                🦁
              </div>
              <h2 className="text-lg font-bold">어떻게 사주를 분석할까요?</h2>
            </div>

            {/* 프로세스 3단계 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-4 sm:gap-2 mb-10 px-2">
              {[
                {
                  step: '1',
                  title: '수만 명의 임상 데이터',
                  desc: '수만건의 실제 사주 사례를 수집하여 정밀한 운세 패턴을 분석합니다.',
                  icon: <Users size={24} />,
                },
                {
                  step: '2',
                  title: '27인의 명리학 전문가',
                  desc: '다수의 명리학 선생님들과 함께 데이터를 검증하고 깊이 있게 연구합니다.',
                  icon: <Search size={24} />,
                },
                {
                  step: '3',
                  title: '질문 맞춤형 AI 모델',
                  desc: '학습된 방대한 데이터를 바탕으로 당신의 고민에 최적화된 답변을 구성합니다.',
                  icon: <Cpu size={24} />,
                },
              ].map((item, idx, array) => (
                <React.Fragment key={idx}>
                  {/* 스텝 아이템 */}
                  <div className="flex flex-col items-center flex-1 w-full">
                    <div className="relative w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-3 border border-orange-50">
                      {/* 숫자 배지 */}
                      <span className="absolute -top-1.5 -left-1.5 bg-gray-500 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                        {item.step}
                      </span>
                      <span className="text-[#F47521]">{item.icon}</span>
                    </div>
                    <p className="text-[15px] text-gray-800 font-bold leading-tight">
                      {item.title}
                    </p>
                    <p className="text-[12px] text-gray-400 mt-1">{item.desc}</p>
                  </div>

                  {/* 다음 단계가 있을 때만 화살표 표시 */}
                  {idx < array.length - 1 && (
                    <div className="flex items-center justify-center text-gray-300 py-2 sm:py-0 sm:pt-8">
                      {/* 모바일(기본): 아래 화살표 / 태블릿 이상(sm): 오른쪽 화살표 */}
                      <div className="block sm:hidden">
                        <ChevronRight size={20} className="rotate-90" strokeWidth={3} />
                      </div>
                      <div className="hidden sm:block">
                        <ChevronRight size={20} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* --- 하단 둥근 박스 강조 --- */}
            <div className="bg-[#FAF4EF] p-6 rounded-[2rem] text-center border border-[#EADDD0] mb-16">
              <p className="text-[12px] leading-relaxed text-[#4A3427]">
                사자사주는 근거 없는 막연한 풀이를 하지 않습니다.
                <br />
                <span className="font-bold">
                  수만 건의 실제 임상 사례와 명리학의 정통 원칙을 결합해
                  <br />
                  지금 당신의 상황에 가장 확실한 행동 지침을 제시합니다.
                </span>
              </p>
            </div>

            {/* --- 질문 제안 섹션 --- */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-6 h-6 bg-[#F37321] rounded-full flex items-center justify-center text-[10px]">
                🦁
              </div>
              <h2 className="text-lg font-bold">궁금한건 아무거나 물어보세요!</h2>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {[
                '이직해도 될까?',
                '이 사람과 결혼해도 될까?',
                '지금 사업 방향이 맞을까?',
                '올해 재물에서 조심할 부분은?',
                '그 사람을 다시 만날 수 있을까?',
              ].map((chip, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 px-4 py-2 rounded-full text-[12px] font-medium text-gray-500 shadow-sm hover:border-[#F37321] hover:text-[#F37321] transition-all"
                >
                  {chip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>

      {/* 3. 상단 타이틀 */}

      <header className="pt-12 pb-8 text-center px-6">
        <h1 className="text-2xl font-bold mb-4 leading-tight">사자사주는 이렇게 답을 줍니다</h1>
        <p className="text-[15px] leading-relaxed text-gray-700">
          당신의 사주를 분석한 후 당신의{' '}
          <span className="text-orange-600 font-bold"> 질문에 대해 </span>
          <br />
          심층적으로 답변합니다.
        </p>
      </header>

      <main className="max-w-md mx-auto px-5 space-y-6">
        {/* 2. 메인 분석 카드 */}
        <div className="bg-white/70 rounded-[32px] p-6 border border-orange-100 shadow-sm relative overflow-hidden">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-1">지금 이직해도 될까요?</h2>

          <div className="space-y-5 relative z-10">
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[14px] leading-snug">
                <span className="font-bold">분석</span> 당신의 사주와 병오년의 기운을 직업적으로
                분석합니다.
              </p>
            </div>
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[14px] leading-snug">
                <span className="font-bold text-orange-700">좋은 시기인 이유</span> 올해는 ㅇㅇㅇ 한
                이유로 새로운 도전을 하기 좋은 시기입니다.
              </p>
            </div>
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[14px] leading-snug">
                <span className="font-bold">추천 행동 방향</span> 5월이 되기 전 이직을 구체화해
                보세요.
              </p>
            </div>
            <div className="flex gap-3 text-red-800">
              <Check className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[14px] leading-snug font-medium">
                <span className="font-bold">주의할 점</span> 단, 이 시기에는 금의 기운이 강하니
                자존심보다 인간관계를 우선하는 결정을 추천해요.
              </p>
            </div>
          </div>

          {/* 사자 캐릭터 아이콘 (대체용) */}
          <div className="absolute -bottom-4 -right-4 opacity-10">
            <img src="images/adImage/sazatalk/saza.png" className="w-60 h-60" />
          </div>
        </div>

        {/* 3. 크레딧 정보 및 버튼 */}
        <div className="space-y-4">
          <div className="bg-white rounded-full py-4 flex items-center justify-center gap-2 shadow-sm border border-orange-50">
            <span className="text-2xl font-black">무료 </span>
            <Zap className="w-6 h-6 text-orange-400 fill-orange-400" />
          </div>

          <div className="space-y-3 px-4 py-2">
            {[
              '질문에 답하는 정밀 분석',
              '답변 후 다른 주제 재질문 가능',
              '나의 기운과 올해 환경을 고려한 맞춤 답변',
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[14px] font-medium text-orange-900/70"
              >
                <Check className="w-4 h-4" /> {text}
              </div>
            ))}
          </div>

          <button
            onClick={scrollToInput}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-5 rounded-full text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            지금 가장 궁금한 질문, 사주로 받아보세요
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 5. 푸터 메시지 */}
        <footer className="pt-12 text-center space-y-4">
          <div className="inline-block w-14 h-14 bg-white rounded-full border-2 border-orange-100 p-1">
            <div className="w-full h-full bg-orange-100 rounded-full flex items-center justify-center text-2xl">
              🦁
            </div>
          </div>
          <p className="text-sm font-medium leading-relaxed px-6">
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
