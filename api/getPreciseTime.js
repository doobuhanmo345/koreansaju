// api/getPreciseTime.js
export default async function handler(req, res) {
  try {
    const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Seoul');
    if (!response.ok) throw new Error('API error');

    const data = await response.json();
    // 타이머용으로 가공 없이 찐 밀리초(unixtime * 1000)를 던져줍니다.
    res.status(200).json({ timestamp: data.unixtime * 1000 });
  } catch (error) {
    // 서버 에러 시 폴백
    res.status(200).json({ timestamp: Date.now() });
  }
}
