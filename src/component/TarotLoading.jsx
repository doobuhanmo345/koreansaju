import { SparklesIcon } from '@heroicons/react/24/outline';
export default function TarotLoading({ cardPicked }) {
  return (
    <div className="flex flex-col items-center  px-6 overflow-hidden min-h-screen bg-white dark:bg-slate-950">
      {/* 1. 수직 축 회전 컨테이너 */}
      <div className="pt-10 [perspective:1000px] animate-[vertical-spin_4s_infinite_linear] [transform-style:preserve-3d]">
        {/* 2. 30도 기울기 유지 레이어 */}
        <div className="w-32 h-48 -rotate-[30deg] [transform-style:preserve-3d] relative">
          {/* 3. 실제 카드 본체 (앞/뒤를 감싸는 3D 박스) */}
          <div className="w-full h-full relative [transform-style:preserve-3d]">
            {/* [카드 뒷면 - 평소 보이는 부분] */}
            <div
              className="absolute inset-0 w-full h-full z-20 rounded-md overflow-hidden border border-white/20"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <img
                src="/images/tarot/cardback.png"
                alt="tarot card back"
                className="w-full h-full object-cover"
              />
            </div>

            {/* [카드 앞면 - 타로 이미지] */}
            <div
              className="absolute inset-0 w-full h-full z-10 bg-white dark:bg-slate-800 flex flex-col items-center justify-center rounded-md shadow-2xl overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)', // 뒷면 배치
              }}
            >
              {cardPicked ? (
                <img
                  src={`/images/tarot/${cardPicked.id}.jpg`}
                  alt={cardPicked.kor}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-20 text-amber-600 font-serif italic text-sm animate-pulse">
        카드를 해석중입니다...
      </p>

      <style
        dangerouslySetInnerHTML={{
          __html: `
    @keyframes vertical-spin {
      from { transform: rotateY(0deg); }
      to { transform: rotateY(360deg); }
    }
  `,
        }}
      />
    </div>
  );
}
