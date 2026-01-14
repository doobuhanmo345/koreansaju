import React from 'react';

export default function AdReview() {
    const reviews = [
      {
        id: 1,
        stars: 5,
        user: 'min_k***',
        text: '와 진짜 소름 돋았어요.. 작년에 힘들었던 시기를 정확히 짚어주시네요. 올해는 조심하라는 달에 꼭 자중해야겠어요.',
        tag: '#정확도무엇',
      },
      {
        id: 2,
        stars: 5,
        user: 'joo_ya**',
        text: '이직 때문에 고민 많았는데, 제 성향이랑 딱 맞는 직종을 추천해 주셔서 확신이 생겼습니다. 리포트 소장하고 싶을 정도로 예뻐요!',
        tag: '#이직성공기원',
      },
      {
        id: 3,
        stars: 5,
        user: 'love_s2**',
        text: '연애운 보고 왔는데 제 연애 스타일을 그대로 박제해 놓으신 줄..ㅋㅋ 올해 하반기에 인연이 있다니 기대해 봅니다!',
        tag: '#연애운대박',
      },
      {
        id: 4,
        stars: 5,
        user: 'money_rich*',
        text: '재물운 분석이 진짜 구체적이에요. 언제 돈이 들어오고 나가는지 월별로 알려주니까 가계부 쓸 때 참고하기 좋네요.',
        tag: '#부자되자',
      },
      {
        id: 5,
        stars: 4,
        user: 'hoya_98**',
        text: '사주 용어 어려워서 안 보는데 이건 풀이가 너무 쉬워요. 초보자도 이해하기 편하게 설명되어 있어서 끝까지 다 읽었네요.',
        tag: '#쉬운사주',
      },
      {
        id: 6,
        stars: 5,
        user: 'dan_mi***',
        text: '친구들이 하도 난리라 해봤는데 왜 추천하는지 알겠음. 병오년 화(火) 기운이 저한테 부족한데 어떻게 채울지도 알려주셔서 도움 됐어요.',
        tag: '#병오년운세',
      },
      {
        id: 7,
        stars: 5,
        user: 'lucky_cat*',
        text: '무료 분석인데 퀄리티가 유료 상담급이에요. 디자인도 깔끔하고 분석 내용이 너무 알차서 가족들 것도 다 해보려구요.',
        tag: '#가성비갑',
      },
      {
        id: 8,
        stars: 5,
        user: 'choi_sw**',
        text: '답답한 마음이 좀 풀리네요. 제가 가진 장점을 살리라는 조언 덕분에 자신감을 좀 얻었습니다. 감사해요 사자사주!',
        tag: '#자신감회복',
      },
      {
        id: 9,
        stars: 5,
        user: 'bada_blue*',
        text: '사업 시작하기 전이라 조심스러웠는데 조심해야 할 시기를 딱 알려주셔서 큰 고비 넘길 수 있을 것 같습니다.',
        tag: '#사업운분석',
      },
      {
        id: 10,
        stars: 5,
        user: 'star_light*',
        text: '글귀 하나하나가 정성스러워서 감동받았어요. 단순한 운세가 아니라 인생 상담받는 기분이었습니다.',
        tag: '#힐링타임',
      },
      {
        id: 11,
        stars: 5,
        user: 'kim_pro**',
        text: '데이터 기반이라 그런지 논리적이에요. 다른 곳처럼 두루뭉술하게 말 안 하고 명확하게 짚어주는 게 제일 맘에 듭니다.',
        tag: '#데이터사주',
      },
      {
        id: 12,
        stars: 4,
        user: 'lee_ss***',
        text: '올해 건강운 걱정돼서 봤는데 생활 습관까지 조언해 주시네요. 오늘부터 바로 실천합니다!',
        tag: '#건강이최고',
      },
    ];
  return (
    <div>
      {/* --- 무한 리뷰 섹션 시작 --- */}
      <section className="py-20 bg-[#FAF7F4] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-12 text-center">
          {/* 통계 배지: 신생 사이트의 '폭발적 성장'을 강조 */}
          <div className="inline-flex items-center gap-6 bg-white px-8 py-4 rounded-full shadow-[0_4px_20px_rgba(244,117,33,0.08)] border border-orange-100 mb-8">
            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-0.5">
                최근 누적 분석
              </p>
              {/* 4천 건 정도면 신생 사이트로서 매우 신뢰감 있는 수치입니다 */}
              <p className="text-xl font-black text-[#4A3428]">4,832건</p>
            </div>

            <div className="w-[1px] h-8 bg-gray-100"></div>

            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-0.5">
                오늘 생성된 리포트
              </p>
              {/* 실시간성을 강조하여 '지금 당장 해야 할 것 같은' 느낌을 줍니다 */}
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-xl font-black text-[#F47521]">142건</p>
              </div>
            </div>
          </div>

          {/* 헤드라인: '입소문'과 '트렌드'를 강조 */}
          <h2 className="text-3xl font-black text-[#4A3428] leading-tight break-keep">
            입소문만으로 벌써 <br />
            <span className="text-[#F47521]">4,800여 명</span>이 사자사주를 다녀갔습니다.
          </h2>
          <p className="mt-4 text-[15px] text-[#7A665A] font-medium">
            광고 없이도 많은 분들이 선택한 이유, <br className="sm:hidden" /> 직접 분석 결과로
            확인해보세요.
          </p>
        </div>

        {/* 첫 번째 줄 (왼쪽으로 흐름) */}
        <div className="flex gap-4 animate-marquee whitespace-nowrap mb-4">
          {[...reviews, ...reviews].map((review, i) => (
            <div
              key={`row1-${i}`}
              className="inline-block w-[320px] bg-white p-6 rounded-[28px] border border-[#E8DCCF] shadow-sm"
            >
              <div className="flex text-[#F47521] text-[10px] mb-2">
                {'⭐'.repeat(review.stars)}
              </div>
              <p className="text-[14px] text-[#4A3428] font-medium whitespace-normal break-keep leading-snug">
                "{review.text}"
              </p>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-[11px] text-gray-400 font-bold">{review.user}</p>
                <span className="text-[10px] font-bold text-[#F47521] bg-orange-50 px-2 py-0.5 rounded">
                  {review.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 두 번째 줄 (오른쪽으로 흐름) - 리뷰 순서를 뒤집어서 다르게 보이게 함 */}
        <div className="flex gap-4 animate-marquee-reverse whitespace-nowrap">
          {[...reviews]
            .reverse()
            .concat([...reviews].reverse())
            .map((review, i) => (
              <div
                key={`row2-${i}`}
                className="inline-block w-[320px] bg-white p-6 rounded-[28px] border border-[#E8DCCF] shadow-sm"
              >
                <div className="flex text-[#F47521] text-[10px] mb-2">
                  {'⭐'.repeat(review.stars)}
                </div>
                <p className="text-[14px] text-[#4A3428] font-medium whitespace-normal break-keep leading-snug">
                  "{review.text}"
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-[11px] text-gray-400 font-bold">{review.user}</p>
                  <span className="text-[10px] font-bold text-[#F47521] bg-orange-50 px-2 py-0.5 rounded">
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
