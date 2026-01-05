import { useLanguage } from '../context/useLanguageContext';
import { useNavigate } from 'react-router-dom';
export default function TodaysLuckBanner (){
const { language } = useLanguage();
  const navigate = useNavigate();
    return ( <div className="h-[150px] w-full max-w-lg bg-slate-900 rounded-xl overflow-hidden relative group mx-auto mb-2 shadow-lg border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 to-slate-900 opacity-100"></div>

          {/* 마스코트 이미지 */}
          <img
            src="/todaysluck.png"
            className="absolute bottom-[-20px] right-[-10px] h-[180px] sm:h-[180px] w-auto object-contain scale-125 transition-transform duration-500 pointer-events-none"
            alt="mascot"
          />

          {/* 콘텐츠 레이어 */}
          <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
            {/* 왼쪽: 점수 영역 */}
            <div className="flex flex-col items-start justify-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              <span className="text-[10px] text-white/60 uppercase tracking-[0.2em] font-bold mb-1">
                {language === 'ko' ? 'Daily Score' : 'Daily Score'}{' '}
                {/* 영어로 동일하더라도 구조 유지 */}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl sm:text-6xl font-black text-white">??</span>
                <span className="text-lg font-bold text-white/90">
                  {language === 'ko' ? '점' : 'pts'}
                </span>
              </div>
            </div>

            {/* 오른쪽: 버튼 영역 */}
            <div className="flex flex-col items-end gap-3 pointer-events-auto">
              <div className="text-right drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                <h3 className="text-white text-xl sm:text-2xl font-black leading-tight">
                  {language === 'ko' ? '오늘의 운세' : "Today's Luck"}
                </h3>
                <p className="text-white/70 text-[11px] mt-1">
                  {language === 'ko' ? '행운 리포트 확인' : 'Check Fortune Report'}
                </p>
              </div>

              <button
                className="bg-white hover:bg-indigo-50 text-black text-[11px] font-black px-6 py-2.5 rounded-full flex items-center gap-1 shadow-2xl transition-all active:scale-95"
                onClick={() => navigate('/todaysluck')}
              >
                {language === 'ko' ? '보러가기' : 'View More'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>)
}