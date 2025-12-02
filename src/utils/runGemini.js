// src/utils/runGemini.js

import { GoogleGenerativeAI } from '@google/genai';

// 💥 [필수] API 키 확인 (키가 없으면 여기서 에러 발생)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('FATAL: GEMINI_API_KEY environment variable not set.');
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Gemini API를 호출하거나 개발 모드에서 가짜 응답을 반환합니다.
 * @param {string} prompt - Gemini에게 전달할 전체 프롬프트 텍스트
 * @param {string} modelName - 사용할 모델 (기본값: gemini-1.5-pro)
 * @returns {Promise<string>} AI 분석 결과 텍스트
 */
export const runGeminiAnalysis = async (prompt, modelName = 'gemini-1.5-pro') => {
  // 💥 [DEV MODE MOCKING] 비용 절감을 위한 가짜 응답 체크
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true') {
    console.log('⚡ [DEV MODE] Returning Mock Data');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 개발 모드에 맞춰 응답 포맷을 미리 지정해두면 UI 테스트에 용이합니다.
    return `[개발 모드 응답 - ${modelName}]
    안녕하세요, 저는 AI 사주 분석가 Gemini입니다.
    요청하신 '${prompt.substring(0, 30)}...'에 대한 분석 결과입니다. 
    이 결과는 가짜 데이터이며, 비용이 청구되지 않았습니다.
    
    **🔮 운명 분석:** 당신의 운명 코드는 완벽한 균형을 이루고 있으며, 오늘은 중요한 결정을 내리기에 최적의 날입니다.`;
  }

  // 💥 [PRODUCTION LOGIC] 실제 API 호출
  if (!genAI) {
    throw new Error('AI Client is not initialized due to missing API Key.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({ contents: [prompt] });

    return result.text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('AI 분석 중 오류가 발생했습니다. (API 통신 실패)');
  }
};
// --- Main AI Analysis ---
const handleAiAnalysis = async () => {
  if (!user) return alert(UI_TEXT.loginReq[language]);
  if (!isSaved) return alert(UI_TEXT.saveFirst[language]);

  // 로딩 타입 설정 (메인 분석)
  setLoadingType('main');
  setResultType('main');

  // 1. 캐시(이전 결과) 확인 로직
  const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];
  let isMatch = false;
  if (cachedData && cachedData.saju) {
    const savedPrompt = cachedData.prompt || DEFAULT_INSTRUCTION;
    if (
      savedPrompt === userPrompt &&
      cachedData.language === language &&
      cachedData.gender === gender
    ) {
      const isSajuMatch = keys.every((key) => cachedData.saju[key] === saju[key]);
      if (isSajuMatch) isMatch = true;
    }
  }

  // 2. 캐시가 있으면 횟수 차감 없이 결과만 보여줌 (Free)
  if (isMatch) {
    setAiResult(cachedData.result);
    setIsSuccess(true);
    setIsModalOpen(true);
    setViewMode('result');
    setLoadingType(null); // 로딩 해제
    return;
  }

  // 💥 [추가] 캐시가 없으면 횟수(행동력) 체크
  if (editCount >= MAX_EDIT_COUNT) {
    alert(UI_TEXT.limitReached[language]); // "횟수 제한에 도달했습니다" 등의 메시지
    setLoading(false);
    setLoadingType(null);
    return;
  }

  // 3. AI 분석 시작
  setLoading(true);
  setAiResult('');
  setIsSuccess(false);
  setIsCachedLoading(false);
  setViewMode('result');

  try {
    const currentSajuKey = JSON.stringify(saju);
    const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${inputDate}, 팔자:${currentSajuKey}`;
    const langPrompt = language === 'ko' ? '답변은 한국어로.  ' : 'Answer in English.';

    const hantoeng = `[Terminology Reference]
When translating or referring to Saju terms (Heavenly Stems & Earthly Branches), strictly use **Korean Hanja** (Traditional Chinese characters as used in Korea). 
DO NOT use Simplified Chinese characters.
Refer to the following mapping for exact terms:
${HANJA_ENG_MAP}
`;
    const hantokor = `[Terminology Reference]
사주 용어를 해석할 때(천간과 지지), strictly use **한국한자** (Traditional Chinese characters as used in Korea). 
아래의 매핑을 참조:
${HANJA_MAP}
`;
    const hanja = language === 'ko' ? hantokor : hantoeng;
    const fullPrompt = `${userPrompt}\n${sajuInfo}\n${hanja}\n${langPrompt}`;

    // API 호출
    const result = await fetchGeminiAnalysis(fullPrompt);

    // 💥 [추가] 행동력(Count) 증가
    const newCount = editCount + 1;

    // DB 업데이트 (결과 저장 + 카운트 증가)
    await setDoc(
      doc(db, 'users', user.uid),
      {
        lastAiResult: result,
        lastSaju: saju,
        lastPrompt: userPrompt,
        lastLanguage: language,
        lastGender: gender,
        editCount: newCount, // 여기서 카운트 업데이트
      },
      { merge: true },
    );

    // 로컬 상태 업데이트
    setEditCount(newCount);

    setCachedData({
      saju: saju,
      result: result,
      prompt: userPrompt,
      language: language,
      gender: gender,
    });
    setAiResult(result);
    setIsSuccess(true);
    setIsModalOpen(true);
  } catch (e) {
    alert(`Error: ${e.message}`);
  } finally {
    setLoading(false);
    setLoadingType(null);
  }
};
