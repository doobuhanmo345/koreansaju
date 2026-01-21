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

  // 로딩 디자인: 부드러운 퍼플 톤으로 변경
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-6 font-sans">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-500 border-r-purple-400 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-purple-800 font-medium text-lg animate-pulse tracking-wide">
          ✨ 카드의 목소리를 듣는 중...
        </p>
      </div>
    );

  if (!fortune) return null;

  return (
    <div className="max-w-lg m-auto relative px-6 pb-32 font-sans antialiased text-stone-800">
      {/* 타로 카드 애니메이션 (로직 유지, 그림자 부드럽게 변경) */}
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

      {/* 리포트 레이아웃 */}
      <div className="report-container space-y-14 mt-20 animate-in fade-in slide-in-from-bottom-10 duration-[1200ms]">
        {/* 헤더 섹션: 더 감성적이고 부드럽게 */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-800 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm border border-purple-100/50 mb-2">
            <span>✦</span> Your Reading
          </div>
          <h2 className="section-title-h2 text-[2.5rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-stone-800 to-purple-900 leading-tight">
            {fortune.title}
          </h2>
          <div className="flex items-center justify-center gap-3 text-purple-300/60">
            <span className="text-sm">⋆</span>
            <p className="report-text text-stone-500 font-medium text-base px-2 max-w-xs leading-relaxed">
              "{fortune.subTitle}"
            </p>
            <span className="text-sm">⋆</span>
          </div>
        </header>

        {/* 1. 카드 메시지 섹션: 따뜻한 웜톤 그라데이션과 드롭캡 포인트 */}
        <section className="report-card active group p-8 bg-gradient-to-br from-white via-white to-purple-50/80 rounded-[2.5rem] shadow-[0_20px_40px_-12px_rgba(167,139,250,0.15)] border border-white ring-1 ring-purple-50 transition-all hover:shadow-[0_25px_50px_-12px_rgba(167,139,250,0.25)] relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 mb-6">
            <h3 className="section-title-h3 text-xl font-bold text-purple-900 flex items-center gap-3">
              <span className="text-3xl filter drop-shadow-sm">🔮</span> {fortune.cardName}
            </h3>
          </div>
          <div className="relative z-10 report-keyword flex flex-wrap gap-2 mb-8">
            {fortune.tags?.map((tag, i) => (
              <span
                key={i}
                className="px-4 py-1.5 bg-white/80 text-purple-700 rounded-xl font-semibold text-xs border border-purple-100 shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          {/* 첫 글자 강조(Drop Cap)에 그라데이션 텍스트 적용 */}
          <p className="relative z-10 report-text leading-loose text-stone-700 text-[17px] whitespace-pre-wrap">
            <span className="float-left text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-500 mr-3 leading-[1.1] mt-1">
              {fortune.description.charAt(0)}
            </span>
            {fortune.description.slice(1)}
          </p>
        </section>

        {/* 2. 상세 분석 섹션: 답답한 박스 대신 부드러운 플로팅 카드 */}
        <section className="report-card active p-8 bg-white rounded-[2.5rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] border border-stone-50">
          <h3 className="section-title-h3 text-xl font-bold text-stone-800 mb-8 flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-sm">📍</span> {fortune.analysisTitle}
          </h3>
          <div className="space-y-5">
            {fortune.analysisList?.map((text, i) => (
              <div
                key={i}
                className="report-text p-6 bg-gradient-to-r from-purple-50/80 to-transparent rounded-3xl text-stone-700 leading-relaxed shadow-sm border border-purple-50/50 flex gap-4 items-start"
              >
                <span className="text-purple-400 mt-1 text-sm">✦</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 조언 및 실천 섹션: 깊이 있는 트와일라잇 그라데이션과 글래스모피즘 */}
        <section className="report-card active p-9 bg-gradient-to-br from-stone-900 via-purple-950 to-violet-900 text-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(88,28,135,0.5)] relative overflow-hidden isolation-auto">
          {/* 장식용 빛 효과 - 더 풍부하게 */}
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-pink-500/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>

          <h3 className="section-title-h3 text-xl font-bold text-purple-100 mb-8 flex items-center gap-3 relative z-10">
            <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">🌿</span>{' '}
            {fortune.adviceTitle}
          </h3>
          <ul className="info-list space-y-6 mb-12 relative z-10">
            {fortune.adviceList?.map((action, i) => (
              <li key={i} className="flex items-start gap-4 text-purple-50/90 group">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-purple-200 ring-1 ring-white/20 group-hover:bg-purple-400 group-hover:text-white group-hover:ring-purple-400 transition-all duration-300 mt-0.5">
                  <span className="text-xs">✓</span>
                </span>
                <span className="text-[16px] leading-relaxed font-medium">{action}</span>
              </li>
            ))}
          </ul>

          {/* 글래스모피즘(유리 질감) 태그 */}
          <div className="keyword-list flex flex-wrap gap-2.5 pt-8 border-t border-white/10 relative z-10">
            {fortune.footerTags?.map((tag, i) => (
              <span
                key={i}
                className="keyword-tag backdrop-blur-md bg-white/10 border border-white/20 px-4 py-2 rounded-2xl text-xs text-purple-100 font-bold tracking-wider hover:bg-white/20 hover:border-white/40 transition-all cursor-default shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* 기존 사주 스타일 유지 (필요한 경우에만 작동) */}
      {/* <div dangerouslySetInnerHTML={{ __html: aiSajuStyle }} /> */}
    </div>
  );
}
