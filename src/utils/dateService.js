export const DateService = {
  getTodayDate: async () => {
    try {
      // 백엔드 API 호출
      const response = await fetch('/api/getServerTime');
      const data = await response.json();
      return data.date;
    } catch (error) {
      console.warn('⚠️ 서버 시간을 가져올 수 없어 로컬 기기 시간을 사용합니다.');
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  },
 getTime: async () => {
    try {
      const response = await fetch('/api/getPreciseTime');
      const data = await response.json();
      return data.timestamp; // 숫자 형태의 밀리초 반환
    } catch (error) {
      return Date.now();
    }}
};
