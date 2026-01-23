import React, { useEffect, useState } from 'react';
import { reportStyleSimple } from '../data/aiResultConstants';
import { useLanguage } from '../context/useLanguageContext';
const ReportTemplateInterview = ({

}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);
  const { language } = useLanguage();
  const data = {
    userName: '지민',
    birthDate: '1998.05.24',
    interviewType: '기업 면접',
    interviewDate: '2026.02.15',
    concern: '말주변/긴장',
    passIndex: 85,
    sajuInfo: { year: '戊辰', month: '丁巳', day: '庚申', time: '未知' },
    section01: {
      mood: 'Intellectual Navy Vibe',
      point: 'Blazer & Silver Accessories',
      description: '지민님, 이번 기업 면접에서는 차분하고 논리적인 모습이 가장...',
    },
    section02: {
      goldenTime: '10:00 AM - 11:30 AM',
      luckyItem: 'Blue Silk Tie/Scarf',
    },
    section03: {
      anxietySolution: '긴장이 느껴질 때는 첫 문장만 생각하세요. 사주상...',
      firstImpression: '면접관들은 당신의 안정감에 높은 점수를 줄 것입니다.',
      surpriseQuestionTip: '압박이 들어오면 결론부터 짧게 대답하는 것이 기운에 맞습니다.',
    },
    section04: {
      actionGuideline: '면접이 끝난 후 가벼운 목례가 합격의 쐐기를 박습니다.',
      passSymbol: 'LOGIC',
    },
  };

  return (
    <div className={`rt-container ${isLoaded ? 'is-active' : ''}`}>
      <style>{reusableStyle}</style>

      {/* [RT-HEADER] 메인 타이틀 */}
      <header className="rt-header">
        <div className="rt-tag animate-up">
          {language === 'en' ? 'SUCCESS STRATEGY REPORT' : 'SUCCESS STRATEGY REPORT'}
        </div>
        <h1 className="rt-main-title animate-up">
          {data.userName}
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
            <span className="rt-id-card__name">{data.userName}</span>
            <span className="rt-id-card__label">CANDIDATE ID</span>
          </div>
          <div className="rt-id-card__body">
            <div className="rt-info-row">
              <span className="rt-info-row__label">BIRTH</span>
              <span className="rt-info-row__value">{data.birthDate}</span>
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
              <div className="rt-saju-grid__item">
                <span>{language === 'en' ? 'Hour' : '시'}</span>
                {data.sajuInfo.time}
              </div>
              <div className="rt-saju-grid__item">
                <span>{language === 'en' ? 'Day' : '일'}</span>
                {data.sajuInfo.day}
              </div>
              <div className="rt-saju-grid__item">
                <span>{language === 'en' ? 'Month' : '월'}</span>
                {data.sajuInfo.month}
              </div>
              <div className="rt-saju-grid__item">
                <span>{language === 'en' ? 'Year' : '년'}</span>
                {data.sajuInfo.year}
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
