// src/hooks/useConsumeEnergy.js
import { useState, useCallback } from 'react';

export const useConsumeEnergy = () => {
  const [isConsuming, setIsConsuming] = useState(false);

  // useCallback을 감싸면 이 함수가 불필요하게 재생성되는 것을 막아줍니다.
  const triggerConsume = useCallback(async (actionFn) => {
    setIsConsuming(true);

    // 1. 연출을 위한 딜레이 (0.3초)
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // 2. 실제 전달받은 함수 실행
      if (actionFn) {
        await actionFn();
      }
    } catch (error) {
      console.error('에너지 소모 중 에러 발생:', error);
    } finally {
      // 3. 성공하든 실패하든 로딩 상태는 반드시 끈다 (안전장치)
      setIsConsuming(false);
    }
  }, []);

  return { isConsuming, triggerConsume };
};
