import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const API_KEY = process.env.GEMINI_KEY;
    const genAI = new GoogleGenerativeAI(API_KEY);
    // 사용자님이 확인하신 2.5 모델명 사용
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const { prompt } = req.body;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return res.status(200).json({ text: response.text() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}