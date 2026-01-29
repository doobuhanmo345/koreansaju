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
import AdReviewEn from '../component/AdReviewEn';

export default function AmaEn({ question, setQuestion, setStep }) {
  const inputRef = useRef(null);

  const handleSubmit = () => {
    const currentVal = inputRef.current?.value || '';
    if (currentVal.trim()) {
      setQuestion(currentVal);
      setStep(1);
    } else if (!currentVal.trim()) {
      alert('Please enter your question');
      return;
    } else {
      setStep(1);
    }
  };
console.log(question);
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

      {/* Section 1: Hero */}
      <div className="w-full min-h-screen bg-[#FDF5F0] text-[#4A3428] flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 my-8 sm:my-10">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
            🦁
          </div>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#333]">
            Saza Saju
          </span>
        </div>

        {/* Main Title */}
        <div className="text-center my-10 sm:my-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 break-keep">
            Your most burning life question,
            <br />
            answered accurately through Saju
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-medium leading-relaxed break-keep">
            Based on data from 27 Saju masters,
            <br />
            AI constructs personalized answers for your questions.
          </p>
        </div>

        {/* Main Image */}
        <div className="w-full max-w-2xl px-4">
          <img
            src="images/adImage/sazatalk/main.png"
            className="w-full object-cover [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
            alt="Saza Saju Main"
          />
        </div>

        {/* Input Form */}
        <div className="max-w-lg w-full px-6 py-10 sm:py-14 flex flex-col items-center">
          <div className="w-full space-y-4">
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
             
                placeholder="What are you most curious about?"
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
              Ask Saza <ChevronRight size={24} strokeWidth={3} />
            </button>
          </div>

          <div className="w-full flex items-center mt-12 px-2 py-4 border-t border-[#E8DCCF]">
            <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
              <Users size={18} className="text-[#F47521]" />
              <span className="text-[10px] font-black text-gray-500 leading-tight text-center">
                27 Saju Masters
                <br />
                <span className="font-medium text-[9px]">Verified Data Base</span>
              </span>
            </div>

            <div className="h-8 w-[1px] bg-[#E8DCCF] shrink-0"></div>

            <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
              <Database size={18} className="text-[#F47521]" />
              <span className="text-[10px] font-black text-gray-500 leading-tight text-center">
                Thousands of Cases
                <br />
                <span className="font-medium text-[9px]">Vast DB Analysis</span>
              </span>
            </div>

            <div className="h-8 w-[1px] bg-[#E8DCCF] shrink-0"></div>

            <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
              <Brain size={18} className="text-[#F47521]" />
              <span className="text-[10px] font-black text-gray-500 leading-tight text-center">
                Customized
                <br />
                <span className="font-bold">AI Analysis</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Comparison */}
      <div className="bg-[#FDF8F3] min-h-screen text-[#4A3427] py-12 sm:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="flex items-center justify-center gap-2 mb-10 sm:mb-12">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F37321] rounded-full flex items-center justify-center text-lg sm:text-xl">
              🦁
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Why Saza Saju?</h2>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Standard Saju */}
            <div className="bg-white/40 p-6 sm:p-8 rounded-3xl border border-white/60">
              <h3 className="text-lg sm:text-xl font-bold text-gray-400 mb-5 text-center">
                Standard Services
              </h3>
              <ul className="space-y-4">
                {['Forget everything instantly', 'Academic focus', 'Lack of practical answers'].map(
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

            {/* Saza Saju */}
            <div className="bg-[#FFF8F3] p-6 sm:p-8 rounded-3xl border border-[#F37321]/20">
              <h3 className="text-lg sm:text-xl font-bold text-[#F37321] mb-5 text-center">
                Saza Saju
              </h3>
              <ul className="space-y-4">
                {['Focus on one question', 'Key Saju elements only', 'Actionable guides provided'].map(
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

          <p className="text-center text-sm sm:text-base leading-relaxed text-[#4A3427] mb-16 sm:mb-20 px-2">
            Instead of vague <span className="text-[#A17C6B] font-bold">'one-size-fits-all'</span> interpretations,
            <br />
            analyzing Saju specifically for <span className="text-[#F37321] font-bold">'your current question'</span> is what truly matters.
          </p>

          <div className="flex items-center justify-center gap-2 mb-10 sm:mb-14">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F37321] rounded-full flex items-center justify-center text-lg sm:text-xl">
              🦁
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">How we analyze Saju</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-8 sm:gap-4 mb-12 sm:mb-16">
            {[
              {
                step: '1',
                title: 'Thousands of Clinical Data',
                desc: 'We analyze precise patterns by collecting thousands of real Saju cases.',
                icon: <Users size={28} />,
              },
              {
                step: '2',
                title: '27 Saju Experts',
                desc: 'We verify data and conduct in-depth research with numerous Saju masters.',
                icon: <Search size={28} />,
              },
              {
                step: '3',
                title: 'Question-specific AI',
                desc: 'Constructs optimized answers based on vast clinical data.',
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
              Saza Saju does not provide vague, groundless interpretations.
              <br />
              <span className="font-bold">
                Combining thousands of real clinical cases with authentic principles,
                <br />
                we provide clear action guides for your current situation.
              </span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F37321] rounded-full flex items-center justify-center text-lg sm:text-xl">
              🦁
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Ask anything you're curious about!
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Should I change jobs?',
              'Should I marry this person?',
              'Is my business direction right?',
              'What should I watch out for this year?',
              'Can I meet that person again?',
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

      {/* Section 3: Answer Example */}
      <header className="pt-12 sm:pt-20 pb-8 sm:pb-12 text-center px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
          How Saza Saju Answers
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-gray-700">
          After analyzing your Saju, we provide
          <span className="text-orange-600 font-bold"> in-depth answers </span>
          <br />
          to your specific questions.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-5 space-y-6">
        {/* Example Card */}
        <div className="w-full mx-auto p-4 sm:p-6 bg-[#FFF5EE] rounded-[32px] sm:rounded-[40px]">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-7 sm:p-10 md:p-12 border border-orange-100 shadow-[0_10px_40px_-15px_rgba(255,165,0,0.15)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200" />

            <div className="relative z-10 mb-8">
              <div className="inline-block px-4 py-1.5 bg-orange-50 text-orange-500 text-xs sm:text-sm font-black rounded-lg border border-orange-100 mb-3">
                CAREER ANALYSIS
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#A0522D] flex items-center gap-2">
                Should I switch jobs now? 🦁
              </h2>
            </div>

            <div className="space-y-5 relative z-10">
              <div className="flex gap-4 p-4 rounded-2xl transition-colors hover:bg-orange-50/30">
                <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700">
                  <span className="font-extrabold text-[#A0522D] block mb-1">Analysis</span>
                  Precisely analyze your Saju and 2026's energy professionally.
                </p>
              </div>

              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700">
                  <span className="font-extrabold text-orange-700 block mb-1">
                    Why it's a good time
                  </span>
                  This year is perfect to prove your abilities through new changes.
                </p>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl transition-colors hover:bg-orange-50/30">
                <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700">
                  <span className="font-extrabold text-[#A0522D] block mb-1">Recommended Action</span>
                  Refine your portfolio and solidify plans before May.
                </p>
              </div>

              <div className="flex gap-4 p-4 sm:p-5">
                <CheckCircle2 className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-red-900/80 font-medium">
                  <span className="font-extrabold text-red-700 block mb-1">Points to Consider</span>
                  Metal energy is strong; focus on flexibile relationships over pride.
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

        {/* CTA Section */}
        <div className="space-y-5">
          <div className="bg-white rounded-full py-5 flex items-center justify-center gap-2 shadow-sm border border-orange-50">
            <span className="text-2xl sm:text-3xl font-black">FREE </span>
            <Zap className="w-7 h-7 text-orange-400 fill-orange-400" />
          </div>

          <div className="space-y-4 px-4 py-2">
            {[
              'Precision analysis answering your question',
              'Follow-up questions on other topics available',
              'Tailored to your energy and current environment',
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
            Get your burning question answered now
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <AdReviewEn />

        <footer className="pt-14 sm:pt-20 text-center space-y-5 pb-10">
          <div className="inline-block w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-full border-2 border-orange-100 p-1">
            <div className="w-full h-full bg-orange-100 rounded-full flex items-center justify-center text-3xl sm:text-4xl">
              🦁
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-medium leading-relaxed px-6">
            Saza Saju does not stop at just reading your fortune.
            <br />
            <span className="text-orange-600 font-bold">
              We provide clear answers that turn your concerns into certainty.
            </span>
          </p>
        </footer>
      </main>
    </div>
  );
}
