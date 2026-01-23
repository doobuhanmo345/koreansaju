const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { defineSecret } = require('firebase-functions/params');

// 보안을 위해 Secret Manager에 저장된 API 키를 가져옵니다.
const GEMINI_API_KEY = defineSecret('NEW_GEMINI_KEY');

exports.fetchGeminiAnalysis = onCall(
  {
    // 한국 사용자들을 위해 서울 리전으로 설정 (속도 향상)
    region: 'asia-northeast3',
    secrets: [GEMINI_API_KEY],
    timeoutSeconds: 300, // 타임아웃 명시
    memory: '1024', // 메모리 증가
  },
  async (request) => {
    try {
      const { prompt } = request.data;

      // 프롬프트가 없는 경우 에러 처리
      if (!prompt) {
        throw new HttpsError('invalid-argument', '프롬프트 내용이 없습니다.');
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
      // 최신 성능이 좋은 gemini-1.5-flash 모델 사용
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          // 구조가 바뀌더라도 "출력 형식"은 무조건 JSON으로 고정
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return { text };
    } catch (error) {
      console.error('Gemini 서버 에러:', error);
      throw new HttpsError('internal', 'AI 분석 중 오류가 발생했습니다.');
    }
  },
);
