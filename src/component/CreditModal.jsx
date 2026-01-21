import React,{useState,useEffect} from 'react';
import { useAuthContext } from '../context/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../hooks/useTimer';
import { useUsageLimit } from '../context/useUsageLimit';

const CreditModal = ({ isOpen, onClose, onWatchAd, language = 'ko' }) => {
  const { isCookieDone } = useAuthContext();
  const { editCount } = useUsageLimit();
  const navigate = useNavigate();

  const content = {
    ko: {
      title: '잠시 마음을 채울 시간이 필요해요',
      body: '오늘의 무료 크레딧을 모두 사용하셨네요.\n매일 밤 12시, 새로운 기운이 3개씩 충전됩니다.',
      btnConfirm: '내일 다시 올게요',
      fortunecookie: '포춘쿠키 열고 크레딧 충전하기',
      refillText: '충전까지 남은 시간',
    },
    en: {
      title: 'Time to Refill Your Energy',
      body: 'You’ve used all your free credits for today.\n3 new credits will be recharged at midnight.',
      btnConfirm: 'See you tomorrow',
      fortunecookie: 'Open a Fortune Cookie for credits',
      refillText: 'Refill in',
    },
  };

  const t = content[language] || content.ko;
// 1. 로컬 상태로 남은 시간 관리
  const [localTimeLeft, setLocalTimeLeft] = useState("");

  // 2. 타이머 로직: API 데이터에 의존하지 않고 브라우저 시계를 기준으로 계산
  useEffect(() => {
    if (!isOpen) return;

    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      // 내일 00:00:00 설정
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diff = midnight - now; // 밀리초 차이

      const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

      return `${hours}:${minutes}:${seconds}`;
    };

    // 처음 렌더링될 때 즉시 한 번 계산
    setLocalTimeLeft(calculateTimeUntilMidnight());

    // 1초마다 로컬에서 직접 갱신 (API 호출 없음)
    const timer = setInterval(() => {
      setLocalTimeLeft(calculateTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      {/* 배경 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* 모달 카드 */}
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        {/* 상단 장식 그라데이션 */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"></div>

        <div className="p-8 sm:p-10 text-center">
          {/* 감성 아이콘 영역 */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-200 blur-2xl rounded-full opacity-50 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-full flex items-center justify-center text-4xl shadow-inner border border-white">
                ✨
              </div>
            </div>
          </div>

          {/* 제목 */}
          <h3 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight break-keep">
            {t.title}
          </h3>

          {/* 내용 */}
          <p className="text-slate-500 text-[15px] leading-relaxed mb-6 break-keep font-medium">
            {t.body}
          </p>

          {/* 타이머 섹션 (선택 사항) */}
          <div className="mb-8 px-4 py-2 inline-flex items-center gap-2 bg-slate-50 rounded-full border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.refillText}
            </span>
            <span className="text-sm font-black text-indigo-500 font-mono">{localTimeLeft}</span>
          </div>

          {/* 버튼 세로 배열 */}
          <div className="flex flex-col gap-3">
            {/* 메인 확인 버튼 */}
            <button
              onClick={onClose}
              className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
            >
              {t.btnConfirm}
            </button>

            {/* 포춘쿠키 버튼 (조건부 렌더링) */}
            {!isCookieDone && (
              <button
                onClick={() => {
                  navigate('/fortunecookie');
                  onClose();
                }}
                className="w-full py-3 px-6 bg-white border-2 border-purple-100 hover:border-purple-200 hover:bg-purple-50 text-purple-600 font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="text-lg">🥠</span>
                {t.fortunecookie}
              </button>
            )}
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default CreditModal;
