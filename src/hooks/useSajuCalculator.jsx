import { useState, useEffect } from 'react';
// calculateSaju 유틸리티 함수를 임포트 (경로에 맞게 수정 필요)
import { calculateSaju } from '../utils/sajuCalculator';

/**
 * 날짜 입력이 변경될 때마다 사주 팔자를 계산하여 상태를 관리하는 커스텀 훅입니다.
 * @param {string} inputDate - 날짜 문자열 (YYYY-MM-DDTHH:MM 형식)
 * @param {boolean} isTimeUnknown - 시간이 미상인지 여부
 * @returns {{saju: object, setSaju: function}} 계산된 사주 데이터와 세터 함수
 */
export function useSajuCalculator(inputDate, isTimeUnknown) {
  // 컴포넌트에서 관리하던 사주 상태를 훅 내부로 이동
  const [saju, setSaju] = useState({});

  useEffect(() => {
    // 1. 입력 유효성 검사 (기존 로직 유지)
    if (!inputDate) {
      setSaju({});
      return;
    }
    const dateObj = new Date(inputDate);
    if (isNaN(dateObj.getTime())) {
      setSaju({});
      return;
    }

    const year = dateObj.getFullYear();
    // 연도 범위 유효성 검사 (기존 로직 유지)
    if (isNaN(year) || year < 1000 || year > 3000) {
      setSaju({});
      return;
    }

    try {
      // 2. 외부 유틸리티 함수 calculateSaju를 호출하여 사주 데이터 계산
      // (이전에는 useEffect 내에서 Solar, lunar 등을 직접 사용했음)
      const calculatedSaju = calculateSaju(inputDate, isTimeUnknown);

      if (calculatedSaju) {
        // 3. 계산된 결과를 상태에 설정 (setSaju 호출)
        setSaju(calculatedSaju);
      } else {
        // 계산 실패 시 상태 초기화
        setSaju({});
      }
    } catch (error) {
      // lunar-javascript 내부 오류 처리
      console.warn('사주 계산 중 오류 발생:', error);
      setSaju({});
    }
  }, [inputDate, isTimeUnknown]); // 의존성 배열 유지

  return { saju, setSaju };
}
