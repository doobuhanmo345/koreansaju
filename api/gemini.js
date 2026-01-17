// api/gemini.js (루트 폴더)
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  try {
    const API_KEY = process.env.GEMINI_KEY; // .env에 GEMINI_KEY가 있어야 함
    const genAI = new GoogleGenerativeAI(API_KEY);

    // 이 부분이 'gemini-1.5-flash'여야만 정상 작동합니다.
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const { prompt } = req.body;
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return res.status(200).json({ text: response.text() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
