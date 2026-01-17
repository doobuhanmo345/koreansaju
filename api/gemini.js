// api/gemini.js (루트 폴더)
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    // 사용자님이 확인하신 모델명을 그대로 사용합니다.
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const { prompt } = req.body;
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return res.status(200).json({ text: response.text() });
  } catch (error) {
    console.error('Server Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
