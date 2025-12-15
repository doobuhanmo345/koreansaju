import { useState, useEffect } from 'react';
import { calculateSaju } from '../utils/sajuCalculator';
import { useLanguage } from '../context/useLanguageContext';

/**
 * 날짜 입력이 변경될 때마다 사주 팔자를 계산하여 상태를 관리하는 커스텀 훅입니다.
 * @param {string} inputDate - 날짜 문자열 (YYYY-MM-DDTHH:MM 형식)
 * @param {boolean} isTimeUnknown - 시간이 미상인지 여부
 * @param {string} language - 언어 설정 ('ko'일 경우 30분 보정 적용)
 * @returns {{saju: object, setSaju: function}} 계산된 사주 데이터와 세터 함수
 */
export function useSajuCalculator(inputDate, isTimeUnknown) {
  const [saju, setSaju] = useState({});
  const { language } = useLanguage();
  useEffect(() => {
    // 1. 입력 유효성 검사
    if (!inputDate) {
      setSaju({});
      return;
    }

    // 원본 Date 객체 생성
    const originalDate = new Date(inputDate);

    if (isNaN(originalDate.getTime())) {
      setSaju({});
      return;
    }

    const year = originalDate.getFullYear();
    if (isNaN(year) || year < 1000 || year > 3000) {
      setSaju({});
      return;
    }

    try {
      // 2. ⭐️ [핵심 변경] 시간 보정 로직 추가
      // 원본 날짜를 복사하여 조작 (불변성 유지 권장)
      let processingDate = new Date(originalDate);

      // 한국어 설정이고, 시간을 아는 경우에만 30분을 뺍니다.
      if (language === 'ko' && !isTimeUnknown) {
        // 기존 분에서 30분 차감 (Date 객체가 알아서 날짜/시간 변경 처리함)
        processingDate.setMinutes(processingDate.getMinutes() - 30);
      }

      // 3. 외부 유틸리티 함수 호출
      // 주의: calculateSaju가 Date 객체를 받도록 구현되어 있어야 합니다.
      // 만약 문자열만 받는다면 processingDate.toISOString() 등으로 변환이 필요할 수 있습니다.
      const calculatedSaju = calculateSaju(processingDate, isTimeUnknown);

      if (calculatedSaju) {
        setSaju(calculatedSaju);
      } else {
        setSaju({});
      }
    } catch (error) {
      console.warn('사주 계산 중 오류 발생:', error);
      setSaju({});
    }
  }, [inputDate, isTimeUnknown, language]); // ⭐️ language 의존성 추가

  return { saju, setSaju };
}
