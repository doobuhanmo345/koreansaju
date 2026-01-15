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
  Lock,
} from 'lucide-react';
import AdHid from '../component/AdHid';
import AdReviewEn from '../component/AdReviewEn';

export default function NewYearEn({ setStep }) {
  const handleSubmit = (e) => {
    setStep(1);
  };
  const [activeMonth, setActiveMonth] = useState(1);
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F3] via-[#FFF0E8] to-[#FFE8E0] text-[#5C4B51] font-serif pb-20">
      <>
        <div className="w-full min-h-screen bg-gradient-to-br from-[#FFFAF7] to-[#FFF0EB] text-[#5C4B51] font-serif flex flex-col items-center">
          <div className=" w-full py-12 flex flex-col items-center">
            {/* 1. 상단 로고 */}
            <div className="flex items-center gap-2 mb-10">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFD4B8] to-[#FFC4A3] rounded-full flex items-center justify-center text-2xl shadow-lg shadow-orange-200/50">
                ✨
              </div>
              <span className="text-2xl font-bold tracking-wide text-[#8B6F5C] italic">
                Cosmic Insights
              </span>
            </div>
            {/* 2. 메인 타이틀 */}
            <div className="text-center mb-12 px-6">
              <h1
                className="text-[32px] font-bold leading-tight mb-6 break-keep text-[#7A5C52]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Your 2026
                <br />
                Year of Transformation
              </h1>
              <p className="text-[16px] text-[#A08B82] font-light leading-relaxed break-keep">
                Discover what the stars have aligned
                <br />
                for your journey ahead ✨
              </p>
            </div>
            <div className="w-full px-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8F3] via-transparent to-[#FFF8F3] z-10 pointer-events-none"></div>
                <img
                  src="images/adImage/newyear/main.png"
                  className="w-full my-8 object-cover rounded-3xl shadow-2xl shadow-orange-200/30"
                  alt="Mystical imagery"
                />
              </div>
            </div>
            <div className="w-full px-6 mt-4">
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-[#E8B4A0] to-[#D4A088] text-white font-semibold py-6 rounded-full text-[17px] shadow-xl shadow-orange-200/40 flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:shadow-2xl hover:shadow-orange-200/50"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Unlock Your 2026 Reading <Heart size={20} className="fill-white" />
              </button>
            </div>
            {/* 5. 하단 3단 정보 바 */}
            <div className="w-full flex items-center mt-16 px-6 py-6 border-t border-[#F5E6DD] bg-gradient-to-r from-[#FFF9F5] to-[#FFF5F0]">
              {/* 첫 번째 아이템 - flex-1 추가 */}
              <div className="flex-1 flex flex-col items-center gap-2 opacity-80">
                <Users size={20} className="text-[#D4A088]" strokeWidth={1.5} />
                <span className="text-[11px] font-medium text-[#8B7B73] leading-tight text-center">
                  Expert Astrologers
                  <br />
                  <span className="font-light text-[10px] text-[#A69188]">Verified insights</span>
                </span>
              </div>

              {/* 구분선 - shrink-0 추가해서 찌그러지지 않게 방지 */}
              <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-[#F0DDD0] to-transparent shrink-0"></div>

              {/* 두 번째 아이템 - flex-1 추가 */}
              <div className="flex-1 flex flex-col items-center gap-2 opacity-80">
                <Database size={20} className="text-[#D4A088]" strokeWidth={1.5} />
                <span className="text-[11px] font-medium text-[#8B7B73] leading-tight text-center">
                  Thousands of Readings
                  <br />
                  <span className="font-light text-[10px] text-[#A69188]">
                    Data-backed analysis
                  </span>
                </span>
              </div>

              {/* 구분선 */}
              <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-[#F0DDD0] to-transparent shrink-0"></div>

              {/* 세 번째 아이템 - flex-1 추가 */}
              <div className="flex-1 flex flex-col items-center gap-2 opacity-80">
                <Sparkles size={20} className="text-[#D4A088]" strokeWidth={1.5} />
                <span className="text-[11px] font-medium text-[#8B7B73] leading-tight text-center">
                  Personalized
                  <br />
                  <span className="font-semibold text-[#7A5C52]">AI Insights</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </>

      {/* 더미포멧 */}
      <div className="mx-6">
        {/* 세련된 안내 배너 디자인 */}
        <div className="mx-4 my-12 flex flex-col items-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#F5D4C4] bg-gradient-to-r from-[#FFF5F0] to-[#FFEEE5] mb-4 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8B4A0] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4A088]"></span>
            </span>
            <span
              className="text-[12px] font-semibold text-[#C49B87] tracking-wide uppercase"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Preview Edition
            </span>
          </div>

          <div className="text-center">
            <h3
              className="text-xl font-bold text-[#7A5C52] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              A Glimpse Into Your 2026
            </h3>

            <div className="space-y-4">
              <p className="text-sm text-[#9B8B82] leading-relaxed font-light">
                Explore the cosmic energies that will shape <br />
                your path in the year ahead
              </p>

              {/* 현재 페이지 상태를 알려주는 디바이더 겸 안내 */}
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-[#E8D4C8]"></div>
                <p className="text-[13px] font-light text-[#9B8B82] bg-gradient-to-r from-[#FFF9F5] to-[#FFF5F0] px-4 py-2 rounded-xl border border-[#F5E6DD]">
                  This is a sample reading. <br />
                  For your complete monthly insights & personalized details,
                  <br />
                  <span className="text-[#7A5C52] font-semibold italic">visit our full portal</span>
                </p>
                <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-[#E8D4C8]"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="sjsj-report-container">
          <div></div>
          <header className="sjsj-header bg-gradient-to-br from-[#FFF9F5] to-[#FFF0EB] rounded-3xl p-8 mb-8 shadow-lg border border-[#F5E6DD]">
            <h1
              className="text-3xl font-bold text-[#7A5C52] mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              2026 Cosmic Report
            </h1>

            <p className="text-[15px] text-[#9B8B82] leading-relaxed font-light">
              2026 brings powerful transformative energy, where choices and timing shape your
              destiny. This preview offers a taste of what your personalized reading reveals.
            </p>

            <div className="inline-block mt-6 px-4 py-2 bg-gradient-to-r from-[#FFE8DD] to-[#FFE0D0] rounded-full text-[#C49B87] text-sm font-semibold shadow-sm">
              ✨ 1-Minute Overview
            </div>
          </header>
          <section className="relative sjsj-section">
            <div className="sjsj-section-label bg-gradient-to-r from-[#FFF5F0] to-transparent p-6 rounded-2xl mb-6">
              <h2
                className="text-2xl font-bold text-[#7A5C52] mb-3"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Growth Through Challenge & Beautiful Change
              </h2>
              <p className="text-[15px] text-[#9B8B82] font-light leading-relaxed">
                Passionate energy will refine you, creating new value and meaning throughout this
                transformative year.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 mb-8">
              <div className="bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-2xl shadow-lg border border-[#F5E6DD]">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FFD4B8] to-[#FFC4A3] rounded-full flex items-center justify-center shadow-md">
                    <Zap className="text-white" size={24} />
                  </div>
                  <div
                    className="text-xl font-bold text-[#7A5C52]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Momentum
                  </div>
                </div>
                <div className="text-sm text-[#9B8B82] leading-relaxed font-light">
                  Opportunities move quickly this year — hesitation equals loss in this energetic
                  flow.
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-2xl shadow-lg border border-[#F5E6DD]">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E8C4B8] to-[#D4B4A8] rounded-full flex items-center justify-center shadow-md">
                    <Heart className="text-white" size={24} />
                  </div>
                  <div
                    className="text-xl font-bold text-[#7A5C52]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Choices
                  </div>
                </div>
                <div className="text-sm text-[#9B8B82] leading-relaxed font-light">
                  Multiple paths will open simultaneously, but you can't walk them all at once.
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-2xl shadow-lg border border-[#F5E6DD]">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4A8A0] to-[#C49890] rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <div
                    className="text-xl font-bold text-[#7A5C52]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Direction
                  </div>
                </div>
                <div className="text-sm text-[#9B8B82] leading-relaxed font-light">
                  This year's essence isn't about effort, but about "where you're headed."
                </div>
              </div>
            </div>
            <AdHid
              title={
                <>
                  Three Guiding <span className="text-[#D4A088]">Keywords</span> for 2026
                </>
              }
              des={
                <>
                  Powerful cosmic energy will shape your year ahead. <br />
                  We've distilled your forecast into three essential keywords.
                </>
              }
              badge={['1', 'Keywords']}
            />
          </section>

          <div className="sjsj-content-inner">
            <section className="relative sjsj-section">
              <div className="sjsj-section-label bg-gradient-to-r from-[#FFF5F0] to-transparent p-6 rounded-2xl mb-6">
                <h2
                  className="text-2xl font-bold text-[#7A5C52]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  2026 Comprehensive Analysis
                </h2>
              </div>

              <div className="bg-gradient-to-r from-[#FFE8DD] to-[#FFE0D0] p-5 rounded-2xl mb-6 border border-[#F5D4C4]">
                <p className="text-sm text-[#8B7066] text-center font-light italic">
                  Fiery energy creates opportunities, but also brings intensity and the need for
                  balance.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-2xl shadow-lg border border-[#F5E6DD] mb-6">
                <div className="">
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="text-lg font-bold text-[#D4A088]"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        🌟 Growth Keywords
                      </div>
                    </div>
                    <ul className="space-y-2">
                      <li className="text-[#9B8B82] text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#D4A088] rounded-full"></span>
                        Decisiveness
                      </li>
                      <li className="text-[#9B8B82] text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#D4A088] rounded-full"></span>
                        Swift action
                      </li>
                    </ul>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="text-lg font-bold text-[#B89B88]"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        💫 Elements to Embrace
                      </div>
                    </div>
                    <ul className="space-y-2">
                      <li className="text-[#9B8B82] text-sm flex items-center gap-2">
                        <span className="text-[#D4A088]">✓</span> Quick judgment
                      </li>
                      <li className="text-[#9B8B82] text-sm flex items-center gap-2">
                        <span className="text-[#D4A088]">✓</span> Priority setting
                      </li>
                    </ul>
                  </div>

                  <div className="">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="text-lg font-bold text-[#A88B7A]"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        ⚠️ Gentle Cautions
                      </div>
                    </div>
                    <ul className="space-y-2">
                      <li className="text-[#9B8B82] text-sm flex items-center gap-2">
                        <span className="text-[#C49B87]">△</span> Over-expansion
                      </li>
                      <li className="text-[#9B8B82] text-sm flex items-center gap-2">
                        <span className="text-[#C49B87]">△</span> Emotional decisions
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[15px] text-[#9B8B82] leading-relaxed font-light p-6 bg-gradient-to-br from-[#FFF9F5] to-white rounded-2xl border border-[#F5E6DD]">
                  This overview captures the general atmosphere and flow of 2026. In your complete
                  reading, timing and intensity vary based on your unique chart. If you're sensing a
                  particular energy now, that's your key signal for the year.
                </p>
              </div>
              <AdHid
                title={
                  <>
                    Annual Forecast with
                    <span className="text-[#D4A088]"> Complete Analysis</span>
                  </>
                }
                des={
                  <>
                    Your year's keywords, how to work with cosmic energy, cautions, and overall
                    fortune compiled comprehensively. Explore detailed insights into love, finances,
                    and career paths.
                  </>
                }
                badge={['2', 'Full Analysis']}
              />
            </section>
            <section className="relative sjsj-section">
              <div className="sjsj-section-label bg-gradient-to-r from-[#FFF5F0] to-transparent p-6 rounded-2xl mb-6">
                <h2
                  className="text-2xl font-bold text-[#7A5C52]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Monthly Insights
                </h2>
              </div>

              <div className="bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-3xl shadow-xl border border-[#F5E6DD] mb-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <h3
                      className="text-xl font-bold text-[#7A5C52] mb-2"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      January{' '}
                      <span className="text-base font-light text-[#9B8B82] ml-2">
                        Foundation Month
                      </span>
                    </h3>
                    <div className="w-full bg-gradient-to-r from-[#F5E6DD] to-[#FFEEE5] rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-[#D4A088] to-[#E8B4A0] h-full rounded-full shadow-sm"
                        style={{ width: '62%' }}
                      />
                    </div>
                  </div>
                  <div className="text-2xl ml-4">✨✨✨☆☆</div>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  <div className="px-3 py-1.5 bg-gradient-to-r from-[#FFE8DD] to-[#FFE0D0] rounded-full text-xs text-[#9B8B82] font-light">
                    <span className="text-[#D4A088] font-semibold">✓</span> Focus: Grounding
                  </div>
                  <div className="px-3 py-1.5 bg-gradient-to-r from-[#FFE8DD] to-[#FFE0D0] rounded-full text-xs text-[#9B8B82] font-light">
                    <span className="text-[#D4A088] font-semibold">✓</span> Caution: Overdoing
                  </div>
                  <div className="px-3 py-1.5 bg-gradient-to-r from-[#FFF5F0] to-[#FFEEE5] rounded-full text-xs text-[#9B8B82] font-light border border-[#F5E6DD]">
                    ▷ Approach: Observe flow
                  </div>
                </div>

                <p className="text-sm text-[#9B8B82] leading-relaxed font-light mb-5">
                  January marks a beautiful beginning—perfect for establishing stability and inner
                  strength. In the gentle rhythm of the new year, take time to craft your plans
                  thoughtfully and nurture what needs attention. This month's energy brings peace to
                  your heart and sharpens your practical wisdom. Build your future on past
                  experiences, and allow yourself to release what no longer serves you. In matters
                  of money, maintain a conservative approach—resist impulsive spending or
                  investments. In relationships, fulfill your role quietly but don't hesitate to
                  express yourself when needed. Stay flexible in your thinking and avoid getting too
                  caught up in your own perspective. Health-wise, prioritize regular rhythms and
                  adequate rest. Rather than starting something brand new, focus on reviewing and
                  strengthening what already exists. Deepen bonds with longtime friends and family
                  rather than seeking new connections—this brings psychological comfort. This period
                  prepares you for more active times ahead, so move calmly and thoughtfully as you
                  discover your path. Professionally, concentrate on completing existing work rather
                  than launching new projects. Create opportunities for inner reflection and
                  personal growth.
                </p>

                <div className="pt-4 border-t border-[#F5E6DD]">
                  <div className="text-sm text-[#C49B87] text-center font-light italic">
                    Focus on laying a solid foundation and creating thoughtful plans.
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-3xl shadow-xl border border-[#F5E6DD] mb-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <h3
                      className="text-xl font-bold text-[#7A5C52] mb-2"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      February{' '}
                      <span className="text-base font-light text-[#9B8B82] ml-2">
                        Momentum Month
                      </span>
                    </h3>
                    <div className="w-full bg-gradient-to-r from-[#F5E6DD] to-[#FFEEE5] rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-[#D4A088] to-[#E8B4A0] h-full rounded-full shadow-sm"
                        style={{ width: '70%' }}
                      />
                    </div>
                  </div>
                  <div className="text-2xl ml-4">✨✨✨☆☆</div>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  <div className="px-3 py-1.5 bg-gradient-to-r from-[#FFE8DD] to-[#FFE0D0] rounded-full text-xs text-[#9B8B82] font-light">
                    <span className="text-[#D4A088] font-semibold">✓</span> Focus: Ignition
                  </div>
                  <div className="px-3 py-1.5 bg-gradient-to-r from-[#FFE8DD] to-[#FFE0D0] rounded-full text-xs text-[#9B8B82] font-light">
                    <span className="text-[#D4A088] font-semibold">✓</span> Caution: Rushing
                  </div>
                  <div className="px-3 py-1.5 bg-gradient-to-r from-[#FFF5F0] to-[#FFEEE5] rounded-full text-xs text-[#9B8B82] font-light border border-[#F5E6DD]">
                    ▷ Approach: Delay decisions
                  </div>
                </div>

                <p className="text-sm text-[#9B8B82] leading-relaxed font-light mb-5">
                  New opportunities begin to appear, but this isn't confirmation time yet. You can
                  move forward, but there's not enough information for certainty. Better to compare
                  possibilities than to commit to a direction. In your complete reading, timing
                  varies for each individual.
                </p>

                <div className="pt-4 border-t border-[#F5E6DD]">
                  <div className="text-sm text-[#C49B87] text-center font-light italic">
                    Still in exploration mode
                  </div>
                </div>
              </div>
              <AdHid
                title={
                  <>
                    <span className="text-[#D4A088]">Blueprint</span> for Planning Your Month Ahead
                  </>
                }
                des={
                  <>
                    Based on monthly forecasts, we reveal detailed insights into love, money, and
                    business fortune. <br />
                    Receive comprehensive analysis to prepare for each month ahead.
                  </>
                }
                badge={['3', 'Monthly Forecast']}
              />
            </section>
            <section className="relative sjsj-section">
              <div className="sjsj-section-label bg-gradient-to-r from-[#FFF5F0] to-transparent p-6 rounded-2xl mb-6">
                <h2
                  className="text-2xl font-bold text-[#7A5C52]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Gentle Guidance
                </h2>
                <p className="text-[15px] text-[#9B8B82] font-light mt-2">
                  With 2026's swift energy, certain periods require mindful pacing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-3xl shadow-lg border border-[#F5E6DD]">
                  <div
                    className="text-lg font-bold text-[#7A5C52] mb-4 flex items-center gap-2"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    <Sparkles size={20} className="text-[#D4A088]" />
                    Favorable Months
                  </div>
                  <div className="space-y-5">
                    <div>
                      <div className="font-semibold text-[#7A5C52] mb-2">June</div>
                      <p className="text-sm text-[#9B8B82] leading-relaxed font-light">
                        Your leadership and drive reach their peak this month, enabling significant
                        achievements. Launch new projects boldly and bring your ideas to life.
                      </p>
                    </div>
                    <div>
                      <div className="font-semibold text-[#7A5C52] mb-2">February</div>
                      <p className="text-sm text-[#9B8B82] leading-relaxed font-light">
                        Vibrant activity and fresh opportunities arrive as your energy overflows.
                        Move actively to capture new chances and fully express your capabilities.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-3xl shadow-lg border border-[#F5E6DD]">
                  <div
                    className="text-lg font-bold text-[#7A5C52] mb-4 flex items-center gap-2"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    <Heart size={20} className="text-[#D4A088]" />
                    Months for Care
                  </div>
                  <div className="space-y-5">
                    <div>
                      <div className="font-semibold text-[#7A5C52] mb-2">September</div>
                      <p className="text-sm text-[#9B8B82] leading-relaxed font-light">
                        Judgment may waver during this time. Postponing major decisions proves
                        advantageous.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <AdHid
                title={
                  <>
                    <span className="text-[#D4A088]">Favorable</span> Months and{' '}
                    <span className="text-[#D4A088]">Mindful</span> Periods
                  </>
                }
                des={
                  <>
                    We outline advantageous timing and periods requiring extra awareness throughout
                    your year, with guidance tailored to each phase.
                  </>
                }
                badge={['4', 'Guidance']}
              />
            </section>
          </div>
        </div>
      </div>
      <AdReviewEn />
      {/* 전송 버튼 */}
      <div className="w-full px-6 mt-8">
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-[#E8B4A0] to-[#D4A088] text-white font-semibold py-6 rounded-full text-[17px] shadow-xl shadow-orange-200/40 flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:shadow-2xl hover:shadow-orange-200/50"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Discover Your Complete 2026 Journey <Heart size={20} className="fill-white" />
        </button>
      </div>
    </div>
  );
}
