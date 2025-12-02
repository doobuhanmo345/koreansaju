// useTimer.js

import { useState, useEffect } from 'react';

/**
 * 현재 시간부터 다음날 자정(00:00:00)까지 남은 시간을 'HH:MM:SS' 형식의 문자열로 계산합니다.
 * 이 함수는 훅 내부에서만 사용되므로 별도 export는 필요 없습니다.
 */
const calculateTimeLeft = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;

  if (diff <= 0) return '00:00:00';

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * 다음날 자정까지 남은 시간을 계산하고 1초마다 업데이트하는 커스텀 훅입니다.
 * @param {number} editCount - 타이머 작동 여부를 결정하는 조건 값 (0보다 커야 작동)
 * @returns {string} 남은 시간 문자열 (예: '05:03:01') 또는 빈 문자열
 */
export function useTimer(editCount) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // 💡 요청하신 로직: 크레딧이 꽉 찼으면 타이머 돌릴 필요 없음
    if (editCount <= 0) {
      setTimeLeft(''); // 남은 시간을 빈 문자열로 설정
      return; // useEffect 실행을 중단
    }

    // 조건 충족 시: 타이머 초기값 설정
    setTimeLeft(calculateTimeLeft());

    // 1초마다 갱신하는 로직
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // 클린업 함수: 컴포넌트 unmount 또는 editCount 변경 시 타이머 정리
    return () => clearInterval(timer);
  }, [editCount]); // editCount에 의존하여 조건이 바뀔 때마다 재실행

  return timeLeft;
}
