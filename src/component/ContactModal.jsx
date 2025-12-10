import React, { useState } from 'react'; // useState 임포트
import { useLanguage } from '../context/useLanguageContext';
export default function ContactModal({ onClose, email }) {
  // 1. 복사 상태 관리를 위한 State 추가
  const [isCopied, setIsCopied] = useState(false);
  const { language } = useLanguage();
  // 2. 클립보드 복사 핸들러 함수
  const handleCopyEmail = async (e) => {
    e.preventDefault(); // 기본 링크(href) 동작 방지

    try {
      // 클립보드 API를 사용하여 이메일 주소 복사
      await navigator.clipboard.writeText(email);

      // 복사 성공 피드백 설정
      setIsCopied(true);

      // 2초 후에 상태를 초기화하여 메시지를 사라지게 함
      setTimeout(() => {
        setIsCopied(false);
        onClose(); // 복사 후 모달 닫기 (선택 사항)
      }, 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      // 복사 실패 시 메일 앱 열기 (대체 기능)
      window.location.href = `mailto:${email}?subject=${language === 'ko' ? '[문의사항]' : '[Inquiry]'}`;
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl max-w-sm w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {language === 'ko' ? '도움말 및 문의' : 'Help & Contact'}
        </h3>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          {language === 'ko'
            ? '궁금한 점이나 버그 신고는 아래 메일을 클릭하여 복사한 후 이용해주세요.'
            : 'Click the email below to copy it for inquiries or bug reports.'}
        </p>

        {/* 3. 복사 버튼 UI 및 로직 변경 */}
        <a
          // href 속성 제거 (또는 #으로 변경)
          href="#"
          onClick={handleCopyEmail} // 새로 만든 복사 함수 연결
          className={`block w-full text-center py-3 font-bold rounded-lg transition-colors 
            ${
              isCopied
                ? 'bg-green-500 text-white hover:bg-green-600' // 복사 완료 시 초록색 피드백
                : 'bg-indigo-500 text-white hover:bg-indigo-600' // 기본 색상
            }`}
        >
          {isCopied
            ? // 복사 완료 피드백 텍스트
              language === 'ko'
              ? '✅ 복사 완료!'
              : '✅ Copied!'
            : // 이메일 주소 표시
              email}
        </a>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          {language === 'ko' ? '닫기' : 'Close'}
        </button>
      </div>
    </div>
  );
}
