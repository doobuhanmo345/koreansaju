// api/gemini.js (루트 폴더 위치)
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;

    // Vercel 환경변수 GEMINI_KEY 확인
    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
      console.error('환경 변수 GEMINI_KEY가 설정되지 않았습니다.');
      return res.status(500).json({ error: 'API 키 설정 누락' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // 사용자님이 성공하셨던 모델명 사용 (만약 에러가 계속되면 "gemini-1.5-flash"로 시도해 보세요)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 성공 응답
    return res.status(200).json({ text });
  } catch (error) {
    // Vercel 로그에 에러 원인 출력
    console.error('Gemini API 호출 중 서버 에러:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
