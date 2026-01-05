import { useLanguage } from '../context/useLanguageContext';
import { useNavigate } from 'react-router-dom';
export default function FeedbackBanner() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="h-[150px] w-full max-w-lg bg-slate-900 rounded-xl overflow-hidden relative group mx-auto mb-2 shadow-lg border border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 to-slate-900 opacity-100"></div>

      {/* 마스코트 이미지 */}
      <img
        src="/todaysluck.png"
        className="absolute bottom-[-20px] right-[-10px] h-[180px] sm:h-[180px] w-auto object-contain scale-125 transition-transform duration-500 pointer-events-none"
        alt="mascot"
      />

      {/* 콘텐츠 레이어 */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        {/* 왼쪽 영역: 혜택 강조 */}
        <div className="flex flex-col items-start justify-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <span className="text-[10px] text-amber-400 uppercase tracking-[0.2em] font-bold mb-1">
            {language === 'ko' ? 'SPECIAL GIFT' : 'SPECIAL GIFT'}
          </span>
          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {language === 'ko' ? '무료' : 'FREE'}
            </span>
            <span className="text-sm font-bold text-white/90">
              {language === 'ko' ? '70,000원 상당' : 'Worth $50'}
            </span>
          </div>
        </div>

        {/* 오른쪽 영역: 텍스트 및 버튼 */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <div className="text-right drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <h3 className="text-white text-lg sm:text-xl font-black leading-tight">
              {language === 'ko' ? '피드백 주고 리포트 받기' : 'Give Feedback, Get Report'}
            </h3>
            <p className="text-white/70 text-[11px] mt-1">
              {language === 'ko' ? '정성스러운 의견을 기다립니다' : 'Share your thoughts with us'}
            </p>
          </div>

          <button
            className="bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black px-6 py-2.5 rounded-full flex items-center gap-1 shadow-2xl transition-all active:scale-95"
            onClick={() => navigate('/feedback')}
          >
            {language === 'ko' ? '참여하기' : 'Feedback'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
