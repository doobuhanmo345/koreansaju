// [주의] 프로젝트 루트(최상단) /api/gemini.js 파일입니다!
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    // 1. 디버깅용: 현재 서버가 인식하는 모든 환경변수 키 목록을 로그에 찍습니다 (값은 숨김)
    console.log(
      '현재 인식 가능한 키 목록:',
      Object.keys(process.env).filter((k) => k.includes('KEY')),
    );

    // 2. 키를 함수 안에서 직접 가져옵니다.
    const apiKey = process.env.GEMINI_KEY;

    if (!apiKey) {
      // Vercel 로그에서 이 메시지가 보인다면 대시보드와 코드의 이름이 일치하지 않는 것입니다.
      return res
        .status(500)
        .json({ error: '서버가 GEMINI_KEY를 찾지 못함. 대시보드 이름을 확인하세요.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // 2.5 대신 안정적인 1.5로 우선 테스트

    const { prompt } = req.body;
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return res.status(200).json({ text: response.text() });
  } catch (error) {
    console.error('Gemini 호출 에러 상세:', error);
    return res.status(500).json({ error: error.message });
  }
}
