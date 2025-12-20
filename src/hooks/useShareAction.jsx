import { useState, useCallback } from 'react';

/**
 * AI 분석 결과 복사 및 공유 기능을 제공하는 커스텀 훅
 */
export function useShareActions(aiResult) {
  const [isCopied, setIsCopied] = useState(false);

  // ✅ 핵심: HTML 태그를 벗겨내고 순수 텍스트만 뽑는 함수 (내부용)
  const getCleanText = (html) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    // innerText는 태그를 줄바꿈(\n)으로 변환해줍니다.
    return tempDiv.innerText || tempDiv.textContent || '';
  };

  // 1. 복사 핸들러
  const handleCopyResult = useCallback(async () => {
    if (!aiResult) return;

    try {
      // 🚨 수정됨: 그냥 aiResult(HTML)가 아니라, 청소된 텍스트를 복사
      const cleanText = getCleanText(aiResult);

      await navigator.clipboard.writeText(cleanText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  }, [aiResult]);

  // 2. 공유 핸들러
  const handleShare = useCallback(async () => {
    // 🚨 수정됨: 공유할 때도 태그 없는 깔끔한 텍스트 사용
    const cleanText = getCleanText(aiResult);

    const shareData = {
      title: 'Saza Saju',
      // text: `[AI 사주 분석]\n\n${cleanText}`, // 제목 + 내용
      url: window.location.href,
    };

    if (navigator.share) {
      // 모바일 공유
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('공유 실패:', err);
      }
    } else {
      // PC 등 미지원 시 클립보드 복사
      try {
        const copyText = `${shareData.text}\n\n🔗 바로가기: ${shareData.url}`;
        await navigator.clipboard.writeText(copyText);
        alert('결과 내용이 복사되었습니다.');
      } catch (err) {
        console.error('URL 복사 실패:', err);
      }
    }
  }, [aiResult]);
  const handleShareLink = useCallback(async () => {
    // 🚨 수정됨: 공유할 때도 태그 없는 깔끔한 텍스트 사용

    const shareData = {
      title: 'Saza Saju',
      text: `[AI 사주 분석]`, // 제목 + 내용
      url: window.location.href,
    };

    if (navigator.share) {
      // 모바일 공유
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('공유 실패:', err);
      }
    } else {
      // PC 등 미지원 시 클립보드 복사
      try {
        const copyText = `${shareData.text}\n\n🔗 바로가기: ${shareData.url}`;
        await navigator.clipboard.writeText(copyText);
        alert('결과 내용이 복사되었습니다.');
      } catch (err) {
        console.error('URL 복사 실패:', err);
      }
    }
  }, [aiResult]);

  // 리턴값 구조 유지
  return { isCopied, handleCopyResult, handleShare, handleShareLink };
}
