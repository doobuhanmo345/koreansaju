import { useState, useCallback } from 'react';

/**
 * AI 분석 결과 복사 및 공유 기능을 제공하는 커스텀 훅입니다.
 * @param {string} aiResult - 복사하거나 공유할 텍스트 내용
 * @returns {{isCopied: boolean, handleCopyResult: function, handleShare: function}}
 */
export function useShareActions(aiResult) {
  const [isCopied, setIsCopied] = useState(false);

  // 1. 복사 핸들러
  const handleCopyResult = useCallback(async () => {
    if (!aiResult) return;

    // navigator.clipboard.writeText를 사용하여 복사
    try {
      // 🚨 주의: 브라우저 환경에 따라 navigator.clipboard가 iframe 내에서 제한될 수 있습니다.
      await navigator.clipboard.writeText(aiResult);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      // 대체 복사 로직 (Canvas 환경을 위해 document.execCommand를 사용하기도 합니다)
      // alert('복사 실패!');
    }
  }, [aiResult]); // aiResult가 변경될 때만 함수 재생성

  // 2. 공유 핸들러
  const handleShare = useCallback(async () => {
    const shareData = {
      title: 'Sajucha',
      text: 'AI 사주 분석',
      url: window.location.href,
    };

    if (navigator.share) {
      // Web Share API 지원 시
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('공유 실패:', err);
      }
    } else {
      // Web Share API 미지원 시: URL을 클립보드에 복사
      try {
        await navigator.clipboard.writeText(shareData.url);
        // alert 대신 상태 변화를 통해 사용자에게 알림을 주는 것이 좋습니다.
        console.log('URL 복사됨: ' + shareData.url);
        // 팝업/모달 대신 UI에 '주소가 복사되었습니다' 메시지 표시 로직을 추가해야 함.
      } catch (err) {
        console.error('URL 복사 실패:', err);
      }
    }
  }, []); // 의존성 배열 없음 (window.location.href와 navigator에만 의존)

  return { isCopied, handleCopyResult, handleShare };
}
