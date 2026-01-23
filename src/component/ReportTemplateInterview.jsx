import React, { useEffect, useState } from 'react';
import { reportStyleSimple } from '../data/aiResultConstants';
import { useLanguage } from '../context/useLanguageContext';
import { toymdt } from '../utils/helpers';
import { useAuthContext } from '../context/useAuthContext';
import { useLoading } from '../context/useLoadingContext';
const ReportTemplateInterview = ({}) => {
  const { aiResult } = useLoading();
  const { language } = useLanguage();
  const { userData } = useAuthContext();
  const { displayName, birthDate, saju, isTimeUnknown } = userData;
  const [isLoaded, setIsLoaded] = useState(false);
  const bd = toymdt(birthDate);
  const [data, setData] = useState(null); // 파싱된 데이터를 담을 로컬 상태
  // [수정] 더 강력한 파싱 함수 및 에러 로그 추가
  const parseAiResponse = (rawString) => {
    if (!rawString) return null;

    console.log('🛠️ 파싱 시도할 원본 문자열:', rawString);

    try {
      // 1. 마크다운 코드 블록 제거 및 불필요한 공백 제거
      const cleaned = rawString
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 눈에 안 보이는 제어 문자 제거
        .trim();

      return JSON.parse(cleaned);
    } catch (error) {
      console.error('❌ 1차 파싱 실패 (cleaned):', error.message);

      try {
        // 2. 정규식으로 { } 내용만 추출해서 다시 시도
        const jsonMatch = rawString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log('🧐 정규식 추출 성공, 2차 파싱 시도...');
          return JSON.parse(jsonMatch[0]);
        }
      } catch (innerError) {
        console.error('❌ 2차 파싱 실패 (regex):', innerError.message);
        return null;
      }
      return null;
    }
  };

  useEffect(() => {
    if (aiResult) {
      const parsedData = parseAiResponse(aiResult);
      if (parsedData) {
        setData(parsedData); // 파싱 성공 시 데이터 세팅
      }
    }
  }, [aiResult]); // aiResult가 업데이트될 때마다 실행

  // 데이터 없으면 아무것도 안 보여줌

  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!data) return '결과없음';

  return (
    <div className={`rt-container ${isLoaded ? 'is-active' : ''}`}>
      <style>{reusableStyle}</style>

      {/* [RT-HEADER] 메인 타이틀 */}
      <header className="rt-header">
        <div className="rt-tag animate-up">
          {language === 'en' ? 'SUCCESS STRATEGY REPORT' : 'SUCCESS STRATEGY REPORT'}
        </div>
        <h1 className="rt-main-title animate-up">
          {displayName}
          {language === 'en' ? "'s" : '님의'}
          <br />
          <span className="text-highlight">
            {language === 'en' ? 'Interview Success Analysis' : '면접 합격운 분석 리포트'}
          </span>
        </h1>
        <p className="rt-desc animate-up">
          {language === 'en'
            ? "A winning strategy combining the venue's energy with your destiny flow."
            : '면접 장소의 기운과 당신의 사주 흐름을 결합한 필승 전략입니다.'}
        </p>
      </header>

      {/* [RT-PROFILE] 응시자 정보 카드 */}
      <section className="rt-section rt-profile animate-up">
        <div className="rt-id-card">
          <div className="rt-id-card__header">
            <span className="rt-id-card__name">{displayName}</span>
            <span className="rt-id-card__label">CANDIDATE ID</span>
          </div>
          <div className="rt-id-card__body">
            <div className="rt-info-row">
              <span className="rt-info-row__label">BIRTH</span>
              <span className="rt-info-row__value">
                {bd.year}.{bd.month}.{bd.day} {isTimeUnknown || <>/{bd.time}</>}
              </span>
            </div>
            <div className="rt-info-row">
              <span className="rt-info-row__label">TARGET</span>
              <span className="rt-info-row__value">{data.interviewType}</span>
            </div>
            <div className="rt-info-row">
              <span className="rt-info-row__label">DATE</span>
              <span className="rt-info-row__value">{data.interviewDate}</span>
            </div>
            <div className="rt-saju-grid">
              {saju.grd0 && (
                <div className="rt-saju-grid__item">
                  <span>{language === 'en' ? 'Hour' : '시'}</span>
                  {saju.sky0} {saju.grd0}
                </div>
              )}

              <div className="rt-saju-grid__item">
                <span>{language === 'en' ? 'Day' : '일'}</span>
                {saju.sky1} {saju.grd1}
              </div>
              <div className="rt-saju-grid__item">
                <span>{language === 'en' ? 'Month' : '월'}</span>
                {saju.sky2} {saju.grd2}
              </div>
              <div className="rt-saju-grid__item">
                <span>{language === 'en' ? 'Year' : '년'}</span>
                {saju.sky3} {saju.grd3}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="rt-main-content">
        {/* 01. 면접 무드 & 복장 가이드 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '01. Vibe Strategy for Success' : '01. 합격을 부르는 Vibe 전략'}
          </h2>
          <div className="rt-ootd-wrapper">
            <div className="rt-ootd-item">
              <span className="rt-ootd-item__label">MOOD</span>
              <span className="rt-ootd-item__value">"{data.section01.mood}"</span>
            </div>
            <div className="rt-ootd-item">
              <span className="rt-ootd-item__label">POINT</span>
              <span className="rt-ootd-item__value">{data.section01.point}</span>
            </div>
          </div>
          <p className="rt-card__text">{data.section01.description}</p>
        </section>

        {/* 02. 합격운 및 면접 지수 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '02. Interview Success Index' : '02. 면접 합격 지수'}
          </h2>
          <div className="rt-score-box">
            <div className="rt-score-box__label">
              {language === 'en' ? 'Final Pass Probability' : '최종 합격 가능성'}
            </div>
            <div className="rt-score-box__val">
              {data.passIndex}
              <span>%</span>
            </div>
            <div className="rt-progress">
              <div
                className="rt-progress__fill"
                style={{ width: isLoaded ? `${data.passIndex}%` : '0%' }}
              ></div>
            </div>
          </div>
          <div className="rt-timing-grid">
            <div className="rt-timing-grid__item">
              <span>{language === 'en' ? 'Golden Time' : '면접 골든 타임'}</span>
              <strong>{data.section02.goldenTime}</strong>
            </div>
            <div className="rt-timing-grid__item">
              <span>{language === 'en' ? 'Lucky Item' : '행운의 아이템'}</span>
              <strong>{data.section02.luckyItem}</strong>
            </div>
          </div>
        </section>

        {/* 03. 맞춤형 인사이트 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '03. Winning Mindset & Insights' : '03. 필승 마인드셋 & 인사이트'}
          </h2>
          <div className="rt-analysis-list">
            <div className="rt-analysis-list__item">
              <span className="rt-analysis-list__sub-title">
                {language === 'en' ? `Resolving Anxiety` : `불안 요소 해결`} ({data.concern})
              </span>
              <p>{data.section03.anxietySolution}</p>
            </div>
            <div className="rt-analysis-list__item is-warning">
              <span className="rt-analysis-list__sub-title">
                {language === 'en' ? 'Impression on Interviewers' : '면접관이 느낄 첫인상'}
              </span>
              <p>{data.section03.firstImpression}</p>
            </div>
            <div className="rt-analysis-list__item is-success">
              <span className="rt-analysis-list__sub-title">
                {language === 'en' ? 'Handling Surprise Questions' : '예상 돌발 질문 대응'}
              </span>
              <p>{data.section03.surpriseQuestionTip}</p>
            </div>
          </div>
        </section>

        {/* 04. 최종 합격 제언 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '04. Final Recommendation' : '04. 최종 합격 제언'}
          </h2>
          <div className="rt-tip-box">
            <span className="rt-tip-box__label">
              {language === 'en' ? 'Post-Interview Guidelines' : '면접 후 행동 지침'}
            </span>
            <p>{data.section04.actionGuideline}</p>
          </div>
          <div className="rt-final-badge">
            PASS SYMBOL: <span>{data.section04.passSymbol}</span>
          </div>
        </section>
      </main>

      <footer className="rt-footer animate-up">
        <button className="rt-btn-primary">
          {language === 'en' ? 'Save Success Amulet' : '합격 부적 저장하기'}
        </button>
      </footer>
    </div>
  );
};

/* [Reusable Style System - 기존 스타일 그대로 사용] */
const reusableStyle = `
  @keyframes rtSlideUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes rtPulse {
    0% { transform: scale(1); box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2); }
    50% { transform: scale(1.03); box-shadow: 0 15px 30px rgba(37, 99, 235, 0.3); }
    100% { transform: scale(1); box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2); }
  }

  .rt-container {
    background: #f8fbff;
    min-height: 100vh;
    padding-bottom: 60px;
    font-family: 'Pretendard', -apple-system, sans-serif;
    color: #1e293b;
    overflow-x: hidden;
  }
  .animate-up { opacity: 0; }
  .rt-container.is-active .animate-up { animation: rtSlideUp 0.8s ease-out forwards; }
  
  .rt-header { padding: 80px 20px 40px; text-align: center; }
  .rt-tag { font-size: 0.75rem; font-weight: 800; color: #3b82f6; letter-spacing: 0.25em; margin-bottom: 12px; }
  .rt-main-title { font-size: 2.2rem; font-weight: 950; line-height: 1.25; color: #0f172a; }
  .rt-main-title .text-highlight { color: #2563eb; }
  .rt-desc { font-size: 0.9rem; color: #64748b; margin-top: 16px; font-weight: 500; }

  .rt-id-card {
    background: #fff; border-radius: 28px; padding: 30px;
    box-shadow: 0 20px 45px rgba(37, 99, 235, 0.1);
    border: 1px solid rgba(37, 99, 235, 0.1);
    max-width: 400px; margin: 24px auto;
    background-image: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  }
  .rt-id-card__header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 14px; }
  .rt-id-card__name { font-size: 1.6rem; font-weight: 900; color: #0f172a; }
  .rt-id-card__label { font-size: 0.7rem; color: #fff; background: #0f172a; padding: 4px 14px; border-radius: 100px; font-weight: 800; }
  
  .rt-info-row { display: flex; margin-bottom: 10px; font-size: 0.85rem; }
  .rt-info-row__label { width: 70px; color: #94a3b8; font-weight: 600; }
  .rt-info-row__value { color: #334155; font-weight: 700; }

  .rt-saju-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 24px; }
  .rt-saju-grid__item { background: #0f172a; color: #fff; border-radius: 16px; padding: 12px 5px; text-align: center; font-size: 0.95rem; font-weight: 700; }
  .rt-saju-grid__item span { display: block; font-size: 0.65rem; color: #94a3b8; margin-bottom: 4px; }

  .rt-main-content { max-width: 440px; margin: 0 auto; padding: 0 20px; }
  .rt-card {
    background: #fff; border-radius: 32px; padding: 32px; margin-bottom: 24px;
    box-shadow: 0 10px 30px rgba(37, 99, 235, 0.04);
    border: 1px solid rgba(37, 99, 235, 0.08);
  }
  .rt-card__title { font-size: 1.15rem; font-weight: 850; margin-bottom: 24px; color: #0f172a; display: inline-block; position: relative; }
  .rt-card__title::after { content: ''; position: absolute; left: 0; bottom: 0; width: 110%; height: 8px; background: #dbeafe; z-index: -1; border-radius: 4px; }
  .rt-card__text { font-size: 0.95rem; line-height: 1.8; color: #475569; }
  .rt-card__text strong { color: #2563eb; font-weight: 800; }

  .rt-ootd-wrapper { display: flex; gap: 12px; margin-bottom: 24px; }
  .rt-ootd-item { flex: 1; background: #f8fbff; padding: 18px; border-radius: 20px; text-align: center; border: 1px solid #eff6ff; }
  .rt-ootd-item__label { font-size: 0.7rem; font-weight: 700; color: #3b82f6; display: block; margin-bottom: 6px; }
  .rt-ootd-item__value { font-size: 0.95rem; font-weight: 900; }

  .rt-analysis-list__item { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
  .rt-analysis-list__sub-title { font-size: 0.9rem; font-weight: 900; color: #2563eb; margin-bottom: 8px; display: block; }
  
  .rt-score-box { text-align: center; margin-bottom: 28px; }
  .rt-score-box__val { font-size: 3.2rem; font-weight: 950; color: #2563eb; letter-spacing: -2px; }
  .rt-progress { background: #f1f5f9; height: 12px; border-radius: 100px; margin-top: 10px; overflow: hidden; }
  .rt-progress__fill { height: 100%; background: #2563eb; transition: width 1.8s cubic-bezier(0.34, 1.56, 0.64, 1); }

  .rt-timing-grid { display: flex; gap: 12px; margin-top: 24px; }
  .rt-timing-grid__item { flex: 1; border: 1.5px solid #e0e7ff; padding: 16px; border-radius: 20px; text-align: center; }
  .rt-timing-grid__item span { display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px; }
  .rt-timing-grid__item strong { font-size: 0.85rem; font-weight: 800; }

  .rt-tip-box { background: #f8faff; padding: 20px; border-radius: 20px; border: 1px solid #eff6ff; }
  .rt-tip-box__label { font-size: 0.9rem; font-weight: 900; color: #2563eb; display: block; margin-bottom: 8px; }

  .rt-final-badge { 
    margin-top: 32px; background: #2563eb; color: #fff; padding: 20px; 
    border-radius: 100px; text-align: center; font-weight: 900; 
    animation: rtPulse 2.5s infinite;
  }

  .rt-footer { padding: 40px 20px; text-align: center; }
  .rt-btn-primary { 
    background: #0f172a; color: #fff; border: none; padding: 22px; 
    border-radius: 100px; font-weight: 900; width: 100%; font-size: 1.1rem;
    cursor: pointer;
  }

  .rt-container.is-active .animate-up:nth-child(1) { animation-delay: 0.2s; }
  .rt-container.is-active .animate-up:nth-child(2) { animation-delay: 0.4s; }
  .rt-container.is-active .rt-card:nth-of-type(1) { animation-delay: 0.6s; }
  .rt-container.is-active .rt-card:nth-of-type(2) { animation-delay: 0.8s; }
  .rt-container.is-active .rt-card:nth-of-type(3) { animation-delay: 1.0s; }
`;

export default ReportTemplateInterview;
