import { onRequest } from 'firebase-functions/v2/https';
import { streamGemini } from './gemini';


export const chat = onRequest({ region: 'asia-northeast3', cors: true }, async (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  await streamGemini(req.body.prompt, res);

  res.end();
});
