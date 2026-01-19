/**
 * DateService: 사자사주 서비스의 날짜 및 시간 관련 공통 로직
 */
export const DateService = {
  /**
   * 서버 시간을 기반으로 오늘 날짜(YYYY-MM-DD)를 가져옵니다.
   * 외부 API 호출이 실패할 경우 로컬 시간을 폴백으로 사용합니다.
   */
  getTodayDate: async () => {
    try {
      // 1. 세계 시간 API 호출 (서울 기준)
      const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Seoul');

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      // 결과 예시: "2026-01-19T15:43:11..." -> "2026-01-19" 추출
      return data.datetime.split('T')[0];
    } catch (error) {
      // 2. API 호출 실패 시 로컬 시간을 반환 (최후의 수단)
      console.warn('⚠️ 서버 시간을 가져올 수 없어 로컬 기기 시간을 사용합니다.');
      return new Date().toLocaleDateString('en-CA');
    }
  },
};
