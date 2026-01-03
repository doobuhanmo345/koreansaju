import React from 'react';

const CreditModal = ({ isOpen, onClose, onWatchAd, language = 'ko' }) => {
  // 다국어 데이터
  const content = {
    ko: {
      title: '앗! 오늘의 무료 크레딧을 다 썼어요',
      body: '매일밤 12시에 무료 크레딧 3개가 자동으로 충전됩니다. 내일 아침에 다시 만나요!',
      btnConfirm: '확인(내일 다시 오기)',
      btnAd: '광고보고 1개 충전하기',
    },
    en: {
      title: 'Oops! Out of Free Credits',
      body: '3 free credits are automatically recharged every midnight. See you tomorrow morning!',
      btnConfirm: 'OK (See you tomorrow)',
      btnAd: 'Watch Ad for +1 Credit',
    },
  };

  // 현재 언어에 맞는 텍스트 선택 (기본값 ko)
  const t = content[language] || content.ko;

  // isOpen이 false면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* 배경 클릭 시 닫기 (선택 사항) */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* 모달 카드 */}
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 text-center">
          {/* 아이콘/이미지 영역 */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-3xl">
              ⚠️
            </div>
          </div>

          {/* 제목 */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 break-keep">
            {t.title}
          </h3>

          {/* 내용 */}
          <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed mb-8 break-keep">
            {t.body}
          </p>

          {/* 버튼 세로 배열 */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onClose}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
            >
              {t.btnConfirm}
            </button>

            {/* <button
              onClick={onWatchAd}
              className="w-full py-4 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl transition-all"
            >
              {t.btnAd}
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditModal;
