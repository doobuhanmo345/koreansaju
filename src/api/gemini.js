// import { GoogleGenerativeAI } from '@google/generative-ai';

// const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(API_KEY);

// export const fetchGeminiAnalysis = async (prompt) => {
//   try {
//     // 1. 모델 목록 조회 및 자동 선택
//     const modelListRes = await fetch(
//       `https://generativelanguage.googleapis.com/v1abeta/models?key=${API_KEY}`,
//     );
//     const modelData = await modelListRes.json();

//     // 1.5-flash -> pro 순으로 찾기
//     let targetModel =
//       modelData.models?.find((m) => m.name.includes('1.5-flash')) ||
//       modelData.models?.find((m) => m.name.includes('gemini-pro')) ||
//       modelData.models?.[0];

//     if (!targetModel) throw new Error('사용 가능한 모델을 찾을 수 없습니다.');

//     // 2. 선택된 모델로 요청
//     const model = genAI.getGenerativeModel({ model: targetModel.name.replace('models/', '') });
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     return response.text();
//   } catch (error) {
//     console.error('Gemini API Error:', error);
//     throw new Error(error.message || 'AI 분석 중 오류가 발생했습니다.');
//   }
// };
//-------------
// import { GoogleGenerativeAI } from '@google/generative-ai';

// const API_KEY = import.meta.env.VITE_GEMINI_KEY;
// const genAI = new GoogleGenerativeAI(API_KEY);

// export const fetchGeminiAnalysis = async (prompt) => {
//   try {
//     // 고객님 대시보드에 있는 'gemini-2.5-flash' 모델 사용
//     const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     return response.text();
//   } catch (error) {
//     console.error('Error:', error);
//     throw new Error(`오류가 발생하였습니다. 잠시후에 다시 시도해 주세요.`);
//   }
// };
//-----
// /src/api/gemini.js (기존 파일 수정)

// src/api/gemini.js
export const fetchGeminiAnalysis = async (prompt) => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '서버 응답 오류');
    }

    return data.text;
  } catch (error) {
    console.error('프론트엔드 통신 에러:', error);
    throw error;
  }
};