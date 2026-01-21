import { useLoading } from '../context/useLoadingContext';
import { aiSajuStyle } from '../data/aiResultConstants';
import { useMemo } from 'react';

export default function ViewTarotResult({ cardPicked }) {
  const { loading, aiResult } = useLoading();

  const fortune = useMemo(() => {
    if (!aiResult) return null;
    try {
      const cleanedJson = aiResult.replace(/```json|```/gi, '').trim();
      return JSON.parse(cleanedJson);
    } catch (e) {
      console.error('데이터 파싱 실패:', e);
      return null;
    }
  }, [aiResult]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-48 space-y-6">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-purple-100 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-purple-900/60 font-medium animate-pulse tracking-widest text-sm">
          Reading your aura...
        </p>
      </div>
    );

  if (!fortune) return null;

  return (
    <div className="max-w-lg m-auto relative px-6 pb-40 font-sans antialiased text-stone-800 bg-[#fafaf9]">
      {/* 타로 카드 애니메이션 (기존 로직 그대로 유지) */}
      {!!cardPicked.id && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[10]">
          <div
            key={cardPicked.id}
            className="relative pointer-events-auto"
            style={{ animation: 'flyToCenterAndBack 2s cubic-bezier(0.19, 1, 0.22, 1) forwards' }}
          >
            <style>{`
              @keyframes flyToCenterAndBack {
                0% { transform: translate(30vw, 20vh) scale(5) rotate(15deg); opacity: 0; filter: blur(10px); }
                50% { transform: translate(0, 0) scale(1.2) rotate(0deg); opacity: 1; filter: blur(0px); }
                100% { transform: translate(0, 0) scale(1); opacity: 0.1; z-index: -1; }
              }
            `}</style>
            <img
              src={`/images/tarot/${cardPicked.id}.jpg`}
              alt={cardPicked.kor}
              className="w-48 md:w-64 rounded-3xl shadow-[0_30px_60px_-12px_rgba(88,28,135,0.25)] object-cover ring-1 ring-white/50"
            />
          </div>
        </div>
      )}

      {/* 리포트 레이아웃 시작 */}
      <div className="report-container space-y-14 mt-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        {/* 헤더 섹션 */}
        <header className="text-center space-y-4">
          <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-800 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm border border-purple-100/50 mb-2">
            Tarot Report
          </div>
          <h2 className="section-title-h2 text-[2.2rem] font-extrabold text-stone-900 leading-tight">
            {fortune.title}
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <span className="h-[1px] w-8 bg-stone-200"></span>
            <p className="report-text text-stone-500 italic font-medium px-2">
              "{fortune.subTitle}"
            </p>
            <span className="h-[1px] w-8 bg-stone-200"></span>
          </div>
        </header>
        {/* 1. 카드 메시지 섹션: 감성적인 화이트 무드 */}
        <section className="report-card active group p-3 sm:p-6 bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(167,139,250,0.1)] border border-purple-50/50 transition-all hover:shadow-[0_20px_50px_-12px_rgba(167,139,250,0.18)] relative overflow-hidden">
          {/* 신비로운 배경 빛 효과 */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-purple-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-32 h-32 bg-pink-50 rounded-full blur-2xl pointer-events-none opacity-40"></div>

          <div className="relative z-10">
            <h3 className="section-title-h3 text-xl font-bold text-stone-800 flex items-center gap-3 mb-6">
              <span className="w-10 h-10 flex items-center justify-center bg-purple-50 rounded-2xl shadow-inner text-2xl">
                🔮
              </span>
              <span className="tracking-tight">{fortune.cardName}</span>
            </h3>

            <div className="report-keyword flex flex-wrap gap-2 mb-8">
              {fortune.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-purple-50/50 text-purple-500 rounded-xl font-bold text-[11px] border border-purple-100/50 tracking-wider shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="report-text leading-[1.8] text-stone-600 text-[16px] whitespace-pre-wrap font-medium">
              {fortune.description}
            </p>
          </div>
        </section>

        {/* 2. 상세 분석 섹션: 깔끔하고 정돈된 에어리 무드 */}
        <section className="report-card active p-3 sm:p-6 bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.02)] border border-stone-100">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-50">
            <h3 className="section-title-h3 text-xl font-bold text-stone-800 flex items-center gap-3">
              <span className="w-10 h-10 flex items-center justify-center bg-stone-50 rounded-2xl text-2xl">
                📍
              </span>
              <span className="tracking-tight">{fortune.analysisTitle}</span>
            </h3>
          </div>

          <div className="space-y-5">
            {fortune.analysisList?.map((text, i) => (
              <div
                key={i}
                className="report-text p-6 bg-gradient-to-r from-stone-50/80 to-transparent rounded-[1.5rem] text-stone-700 leading-relaxed shadow-sm border border-stone-100/50 flex gap-4 transition-transform hover:translate-x-1 duration-300"
              >
                <span className="text-purple-300 font-serif italic text-xl mt-0.5">0{i + 1}</span>
                <span className="font-medium text-[15px]">{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 조언 및 실천 섹션: 깊이 있는 트와일라잇 퍼플 무드 */}
        <section className="report-card active p-3 sm:p-6 bg-gradient-to-br from-stone-900 via-purple-950 to-stone-950 text-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(88,28,135,0.4)] relative overflow-hidden">
          {/* 배경 그라데이션 광채 */}
          <div className="absolute top-[-20%] right-[-10%] w-72 h-72 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none"></div>

          <h3 className="section-title-h3 text-xl font-bold text-purple-200 mb-10 flex items-center gap-3 relative z-10">
            <span className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl text-2xl ring-1 ring-white/20">
              🌿
            </span>
            <span className="tracking-tight">{fortune.adviceTitle}</span>
          </h3>

          <ul className="info-list space-y-7 mb-12 relative z-10">
            {fortune.adviceList?.map((action, i) => (
              <li key={i} className="flex items-start gap-5 group">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-300 ring-1 ring-purple-400/40 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 mt-1 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <span className="text-[10px]">✦</span>
                </span>
                <span className="text-[16px] leading-relaxed text-purple-50/90 font-light tracking-wide">
                  {action}
                </span>
              </li>
            ))}
          </ul>

          {/* 글래스모피즘 태그 */}
          <div className="keyword-list flex flex-wrap gap-2.5 pt-8 border-t border-white/10 relative z-10">
            {fortune.footerTags?.map((tag, i) => (
              <span
                key={i}
                className="keyword-tag backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-[11px] text-purple-100 font-bold tracking-wider hover:bg-white/10 transition-all cursor-default shadow-sm ring-1 ring-white/5"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
