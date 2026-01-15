import React from 'react';

export default function AdReviewEn() {
  const reviews = [
    {
      id: 1,
      stars: 5,
      user: 'min_k***',
      text: "Absolutely incredible! It pinpointed exactly when I struggled last year. I'll definitely be more careful during the months it warned about.",
      tag: '#SoAccurate',
    },
    {
      id: 2,
      stars: 5,
      user: 'joo_ya**',
      text: 'I was stressed about changing careers, and it recommended a field that perfectly matches my personality. The report is so beautiful I want to keep it forever!',
      tag: '#CareerClarity',
    },
    {
      id: 3,
      stars: 5,
      user: 'love_s2**',
      text: 'Came for the love forecast and it literally described my dating style to a T! Looking forward to meeting someone special in the second half of this year!',
      tag: '#LoveIsInTheAir',
    },
    {
      id: 4,
      stars: 5,
      user: 'money_rich*',
      text: 'The financial analysis is incredibly detailed. Knowing when money flows in and out month by month helps me plan my budget so much better.',
      tag: '#WealthWisdom',
    },
    {
      id: 5,
      stars: 4,
      user: 'hoya_98**',
      text: "I usually avoid astrology because it's too complicated, but this was so easy to understand. Perfect for beginners - I read the whole thing!",
      tag: '#EasyToRead',
    },
    {
      id: 6,
      stars: 5,
      user: 'dan_mi***',
      text: "My friends raved about this and now I get why. It identified what elements I'm missing and gave me practical ways to balance them. So helpful!",
      tag: '#CosmicBalance',
    },
    {
      id: 7,
      stars: 5,
      user: 'lucky_cat*',
      text: "Free analysis with premium quality content! The design is stunning and the insights are so rich. I'm getting readings for my whole family.",
      tag: '#BestValue',
    },
    {
      id: 8,
      stars: 5,
      user: 'choi_sw**',
      text: 'This really lifted my spirits. The advice on using my strengths gave me so much confidence. Thank you, Cosmic Insights!',
      tag: '#ConfidenceBoost',
    },
    {
      id: 9,
      stars: 5,
      user: 'bada_blue*',
      text: 'I was nervous about starting my business, but knowing which periods to be cautious about will help me navigate challenges successfully.',
      tag: '#BusinessGuidance',
    },
    {
      id: 10,
      stars: 5,
      user: 'star_light*',
      text: "Every word felt so thoughtful and caring. This wasn't just a forecast - it felt like a life coaching session.",
      tag: '#HealingEnergy',
    },
    {
      id: 11,
      stars: 5,
      user: 'kim_pro**',
      text: 'Being data-driven makes it feel so logical and precise. No vague generalizations here - it gets straight to the point.',
      tag: '#DataDriven',
    },
    {
      id: 12,
      stars: 4,
      user: 'lee_ss***',
      text: 'I was worried about my health this year, and it even gave me lifestyle advice. Starting my new habits today!',
      tag: '#WellnessFirst',
    },
  ];
  return (
    <div>
      {/* --- Infinite Review Section --- */}
      <section className="py-20 bg-gradient-to-b from-[#FFF9F5] to-[#FFF0EB] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-12 text-center">
          {/* Stats Badge: Emphasizing explosive growth */}
          <div className="inline-flex items-center gap-6 bg-white px-8 py-4 rounded-full shadow-[0_8px_30px_rgba(212,160,136,0.15)] border-2 border-[#F5E6DD] mb-8">
            <div className="text-center">
              <p
                className="text-[10px] text-[#C4B5A9] font-semibold tracking-widest uppercase mb-0.5"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Total Readings
              </p>
              <p
                className="text-xl font-bold text-[#7A5C52]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                4,832
              </p>
            </div>

            <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-[#F0DDD0] to-transparent"></div>

            <div className="text-center">
              <p
                className="text-[10px] text-[#C4B5A9] font-semibold tracking-widest uppercase mb-0.5"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Generated Today
              </p>
              <div className="flex items-center justify-center gap-1.5">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8B4A0] opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A088]"></span>
                </div>
                <p
                  className="text-xl font-bold text-[#D4A088]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  142
                </p>
              </div>
            </div>
          </div>

          {/* Headline: Emphasizing word-of-mouth and trend */}
          <h2
            className="text-3xl font-bold text-[#7A5C52] leading-tight break-keep"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Through word-of-mouth alone, <br />
            <span className="text-[#D4A088]">4,800+ souls</span> have discovered their cosmic path
          </h2>
          <p className="mt-4 text-[15px] text-[#9B8B82] font-light leading-relaxed">
            No advertising, just authentic experiences. <br className="sm:hidden" />
            See why so many trust their journey with us.
          </p>
        </div>

        {/* First Row (flowing left) */}
        <div className="flex gap-4 animate-marquee whitespace-nowrap mb-4">
          {[...reviews, ...reviews].map((review, i) => (
            <div
              key={`row1-${i}`}
              className="inline-block w-[320px] bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-3xl border-2 border-[#F5E6DD] shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex text-[#D4A088] text-[10px] mb-2">
                {'⭐'.repeat(review.stars)}
              </div>
              <p
                className="text-[14px] text-[#5C4B51] font-light whitespace-normal break-keep leading-relaxed"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                "{review.text}"
              </p>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-[11px] text-[#C4B5A9] font-semibold">{review.user}</p>
                <span className="text-[10px] font-semibold text-[#D4A088] bg-gradient-to-r from-[#FFE8DD] to-[#FFE0D0] px-2.5 py-1 rounded-full">
                  {review.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Second Row (flowing right) - Reversed order for variety */}
        <div className="flex gap-4 animate-marquee-reverse whitespace-nowrap">
          {[...reviews]
            .reverse()
            .concat([...reviews].reverse())
            .map((review, i) => (
              <div
                key={`row2-${i}`}
                className="inline-block w-[320px] bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-3xl border-2 border-[#F5E6DD] shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex text-[#D4A088] text-[10px] mb-2">
                  {'⭐'.repeat(review.stars)}
                </div>
                <p
                  className="text-[14px] text-[#5C4B51] font-light whitespace-normal break-keep leading-relaxed"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  "{review.text}"
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-[11px] text-[#C4B5A9] font-semibold">{review.user}</p>
                  <span className="text-[10px] font-semibold text-[#D4A088] bg-gradient-to-r from-[#FFE8DD] to-[#FFE0D0] px-2.5 py-1 rounded-full">
                    {review.tag}
                  </span>
                </div>
              </div>
            ))}
        </div>

        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          @keyframes marquee-reverse {
            0% {
              transform: translateX(-50%);
            }
            100% {
              transform: translateX(0);
            }
          }
          .animate-marquee {
            display: flex;
            width: fit-content;
            animation: marquee 60s linear infinite;
          }
          .animate-marquee-reverse {
            display: flex;
            width: fit-content;
            animation: marquee-reverse 60s linear infinite;
          }
        `}</style>
      </section>
    </div>
  );
}
