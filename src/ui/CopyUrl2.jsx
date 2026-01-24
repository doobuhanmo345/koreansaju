import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, setDoc, doc, serverTimestamp } from 'firebase/firestore';
const CopyUrl2 = ({ saju, from }) => {
  const [showGuide, setShowGuide] = useState(false);
  const language = 'ko';
  const handleAction = async (saju, from) => {
    // 이동할 최종 목적지 URL
    const targetUrl = window.location.origin;
    const ua = navigator.userAgent.toLowerCase();

    // 2. 로그 저장 (addDoc으로 간단하게)
    try {
      await setDoc(doc(db, 'copy_url_logs', new Date().toISOString()), {
        saju: saju,
        language: language,
        origin: from,
        createdAt: serverTimestamp(), // 서버 시간 기준 저장
      });
    } catch (e) {
      console.error('로그 저장 실패:', e);
    }

    // 1. 카카오톡: 외부 브라우저 강제 호출
    if (ua.includes('kakaotalk')) {
      window.location.href = `kakaotalk://web/openExternalApp?url=${encodeURIComponent(targetUrl)}`;
      return;
    }

    // 2. 인스타그램 / 페이스북: 강제 이동 불가 -> 가이드 표시 + 주소 복사
    if (ua.includes('instagram') || ua.includes('fbav')) {
      navigator.clipboard.writeText(targetUrl);
      setShowGuide(true);
      return;
    }

    // 3. 기타 일반 브라우저: 즉시 이동
    window.location.href = '/';
  };

  const handleCopy = async (saju, from) => {
    // 이동할 최종 목적지 URL
    navigator.clipboard.writeText(window.location.origin + '/');
    alert(language === 'en' ? 'Link copied!' : '주소가 복사되었습니다!');
    // 2. 로그 저장 (addDoc으로 간단하게)
    const ua = navigator.userAgent.toLowerCase();
    try {
      await setDoc(doc(db, 'copy_url_logs', new Date().toISOString()), {
        saju: saju,
        language: language,
        origin: from,
        createdAt: serverTimestamp(), // 서버 시간 기준 저장
      });
    } catch (e) {
      console.error('로그 저장 실패:', e);
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* (D) 결제 유도 카드 */}
      <div className="relative w-full max-w-[360px] mx-auto overflow-hidden bg-[#FEFAF7] rounded-[38px] border border-[#F1E9E4] shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
        {/* 상단 포인트 라인 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200"></div>

        <div className="px-7 pt-9 pb-8 text-center">
          {/* 배지 */}
          <div className="inline-flex items-center px-3 py-1 bg-white border border-orange-100 rounded-full mb-5 shadow-sm">
            <span className="text-[10px] font-bold text-orange-500 tracking-tighter uppercase">
              {language === 'en' ? 'Limited Offer' : '한정 이벤트'}
            </span>
            <span className="w-[1px] h-2 bg-orange-200 mx-2"></span>
            <span className="text-[10px] font-medium text-stone-400">Premium</span>
          </div>

          {/* 메인 타이틀 */}
          <h2 className="text-[#3A322F] text-[22px] font-bold leading-tight mb-3 tracking-tight">
            {language === 'en' ? (
              <>
                Get Your <span className="text-[#F47521]">Premium Report</span>
                <br />
                Free on Our Website
              </>
            ) : (
              <>
                지금 홈페이지 방문하면
                <br />
                <span className="text-[#F47521]">프리미엄 리포트가 무료</span>
              </>
            )}
          </h2>

          {/* 주소 복사 영역 (인앱 대응용) */}
          <div
            onClick={() => handleCopy(saju, from)}
            className="group cursor-pointer bg-orange-50/50 border border-dashed border-orange-200 rounded-2xl py-3 px-4 mb-6 hover:bg-orange-50 transition-colors"
          >
            <p className="text-[10px] text-orange-400 font-bold mb-1 tracking-widest uppercase">
              Click to copy link
            </p>
            <p className="text-[#6D625B] text-sm font-medium truncate">
              {window.location.hostname}
            </p>
          </div>

          {/* 콜 투 액션 버튼 */}
          <button
            onClick={() => handleAction(saju, from)}
            className="w-full h-[58px] bg-[#3A322F] hover:bg-[#2D2725] text-white rounded-[20px] font-semibold text-base shadow-lg shadow-stone-200 transition-all active:scale-[0.96] flex items-center justify-center gap-2"
          >
            <span>{language === 'en' ? 'Get Free Report' : '무료로 리포트 받기'}</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </button>

          {/* 하단 보조 문구 */}
          <p className="mt-4 text-[12px] text-stone-400 font-medium">
            {language === 'en'
              ? '* Safe connection via default browser'
              : '* 안전한 결제를 위해 외부 브라우저를 연결합니다'}
          </p>
        </div>
      </div>

      {/* 인스타그램/페이스북 전용 가이드 오버레이 */}
      {showGuide && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex flex-col items-end pt-4 pr-6 touch-none"
          onClick={() => setShowGuide(false)}
        >
          {/* 우측 상단 점세개 유도 아이콘 */}
          <div className="text-white text-right animate-bounce mb-4">
            <p className="text-lg font-bold mb-2">여기 버튼을 눌러보세요!</p>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              className="ml-auto transform rotate-[270deg]"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="w-full text-center mt-20 px-6">
            <div className="bg-white rounded-[32px] p-8 shadow-2xl">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F47521"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </div>
              <p className="text-[#3A322F] font-bold text-xl mb-3">주소가 복사되었습니다!</p>
              <p className="text-[#6D625B] text-sm mb-8 leading-relaxed">
                인스타그램 환경에서는 결제가 어려울 수 있어요.
                <br />
                상단 <b>[더보기]</b> 버튼을 누르고
                <br />
                <b>[Safari / Chrome으로 열기]</b>를 선택해 주세요!
              </p>
              <button
                className="w-full py-4 bg-[#3A322F] text-white rounded-2xl font-bold transition-transform active:scale-95"
                onClick={() => setShowGuide(false)}
              >
                알겠습니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyUrl2;
