import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Response } from 'express'; // ⭐ 이 줄 추가

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function streamGemini(prompt: string, res: Response) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });

  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    res.write(chunk.text());
  }
}
