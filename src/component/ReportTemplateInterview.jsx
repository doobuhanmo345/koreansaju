import React, { useEffect, useState } from 'react';

const ReportTemplateInterview = ({ data = {
  userName: '지수',
  birthDate: '1999년 10월 12일',
  sajuInfo: { year: '己卯', month: '甲戌', day: '癸酉', time: '未知' },
  interviewDate: '2026.02.10 (TUE)',
  interviewType: '기업 면접', // 기업 면접, 동아리/학회, 국가고시, 기타
  persona: '차분함/논리적', // 열정/적극적, 겸손/성실, 창의/개성
  concern: '말주변/긴장', // 직무/지식, 압박 면접
  passIndex: 88,
} }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`rt-container ${isLoaded ? 'is-active' : ''}`}>
      <style>{reusableStyle}</style>

      {/* [RT-HEADER] 메인 타이틀 */}
      <header className="rt-header">
        <div className="rt-tag animate-up">SUCCESS STRATEGY REPORT</div>
        <h1 className="rt-main-title animate-up">
          {data.userName}님의<br />
          <span className="text-highlight">면접 합격운 분석 리포트</span>
        </h1>
        <p className="rt-desc animate-up">면접 장소의 기운과 당신의 사주 흐름을 결합한 필승 전략입니다.</p>
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
              <div className="rt-saju-grid__item"><span>시</span>{data.sajuInfo.time}</div>
              <div className="rt-saju-grid__item"><span>일</span>{data.sajuInfo.day}</div>
              <div className="rt-saju-grid__item"><span>월</span>{data.sajuInfo.month}</div>
              <div className="rt-saju-grid__item"><span>년</span>{data.sajuInfo.year}</div>
            </div>
          </div>
        </div>
      </section>

      <main className="rt-main-content">
        
        {/* 01. 면접 무드 & 복장 가이드 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">01. 합격을 부르는 Vibe 전략</h2>
          <div className="rt-ootd-wrapper">
            <div className="rt-ootd-item">
              <span className="rt-ootd-item__label">MOOD</span>
              <span className="rt-ootd-item__value">"신뢰감 있는 네이비 무드"</span>
            </div>
            <div className="rt-ootd-item">
              <span className="rt-ootd-item__label">POINT</span>
              <span className="rt-ootd-item__value">깔끔한 자켓 & 실버 시계</span>
            </div>
          </div>
          <p className="rt-card__text">
            {data.userName}님, 이번 {data.interviewType}에서는 <strong>'{data.persona}'</strong> 모습이 가장 강력한 무기입니다. 
            논리적인 이미지를 강조하기 위해 <strong>딥 네이비</strong> 컬러를 메인으로 활용하세요. 
            화려한 장식보다는 <strong>실버 톤의 시계나 액세서리</strong>로 시간 관리에 철저한 전문성을 보여주는 것이 합격운을 높입니다.
          </p>
        </section>

        {/* 02. 합격운 및 면접 지수 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">02. 면접 합격 지수</h2>
          <div className="rt-score-box">
            <div className="rt-score-box__label">최종 합격 가능성</div>
            <div className="rt-score-box__val">{data.passIndex}<span>%</span></div>
            <div className="rt-progress">
              <div className="rt-progress__fill" style={{ width: isLoaded ? `${data.passIndex}%` : '0%' }}></div>
            </div>
          </div>
          <div className="rt-timing-grid">
            <div className="rt-timing-grid__item">
              <span>면접 골든 타임</span>
              <strong>오전 10시 - 11시</strong>
            </div>
            <div className="rt-timing-grid__item">
              <span>행운의 아이템</span>
              <strong>블루 계열의 손수건</strong>
            </div>
          </div>
        </section>

        {/* 03. 맞춤형 인사이트 (걱정 해결) */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">03. 필승 마인드셋 & 인사이트</h2>
          <div className="rt-analysis-list">
            <div className="rt-analysis-list__item">
              <span className="rt-analysis-list__sub-title">불안 요소 해결 ({data.concern})</span>
              <p>
                <strong>{data.concern}</strong>이 가장 걱정되시나요? 사주 흐름상 당일 말문이 트이는 기운이 강합니다. 
                첫 문장만 외운다는 생각으로 임하세요. 당신의 <strong>{data.persona}</strong> 성향은 긴장할수록 오히려 진가를 발휘할 것입니다.
              </p>
            </div>
            <div className="rt-analysis-list__item is-warning">
              <span className="rt-analysis-list__sub-title">면접관이 느낄 첫인상</span>
              <p>면접관들은 당신을 <strong>'조직에 빠르게 스며드는 안정적인 인재'</strong>로 평가할 확률이 높습니다. 본인의 강점을 겸손하지만 명확하게 어필하세요.</p>
            </div>
            <div className="rt-analysis-list__item is-success">
              <span className="rt-analysis-list__sub-title">예상 돌발 질문 대응</span>
              <p>압박 면접 시, 당황하지 말고 <strong>3초간 심호흡 후</strong> 결론부터 말하세요. 논리적인 기운이 당신의 편에 서 있습니다.</p>
            </div>
          </div>
        </section>

        {/* 04. 최종 행운 배지 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">04. 최종 합격 제언</h2>
          <div className="rt-tip-box">
            <span className="rt-tip-box__label">면접 후 행동 지침</span>
            <p>면접장을 나올 때의 마지막 인사와 미소가 합격을 결정짓는 한 방이 될 거예요. 끝까지 <strong>{data.persona}</strong> 이미지를 유지하세요.</p>
          </div>
          <div className="rt-final-badge">
             PASS SYMBOL: <span>CONFIDENCE</span>
          </div>
        </section>

      </main>

      <footer className="rt-footer animate-up">
        <button className="rt-btn-primary">합격 부적 저장하기</button>
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