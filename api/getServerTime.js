export default async function handler(req, res) {
  try {
    const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Seoul');

    if (!response.ok) {
      throw new Error('API error');
    }

    const data = await response.json();
    const todayDate = data.datetime.split('T')[0];

    res.status(200).json({ date: todayDate });
  } catch (error) {
    console.error('Server time error:', error);
    // 폴백: 서버의 시간 사용
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    res.status(200).json({ date: `${year}-${month}-${day}` });
  }
}
