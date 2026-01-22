import React, { useEffect, useState } from 'react';

const ReportTemplateDate = ({
  data = {
    userName: '민지',
    birthDate: '1998년 05월 24일',
    sajuInfo: { year: '戊辰', month: '丁巳', day: '庚申', time: '未知' },
    meetingDate: '2026.01.25 (SUN)',
    meetingMethod: '지인 소개',
    temperature: '연락 중',
    impression: '지적이고 차분함',
    chemistryScore: 92,
  },
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`rt-container ${isLoaded ? 'is-active' : ''}`}>
      <style>{reusableStyle}</style>

      {/* [RT-HEADER] 메인 타이틀 영역 */}
      <header className="rt-header">
        <div className="rt-tag animate-up">PREMIUM ROMANCE DOSSIER</div>
        <h1 className="rt-main-title animate-up">
          {data.userName}님을 위한
          <br />
          <span className="text-highlight">첫만남 운명 리포트</span>
        </h1>
        <p className="rt-desc animate-up">
          사주 에너지와 현재의 만남 데이터를 결합한 커스텀 분석입니다.
        </p>
      </header>

      {/* [RT-PROFILE] 유저 정보 카드 섹션 */}
      <section className="rt-section rt-profile animate-up">
        <div className="rt-id-card">
          <div className="rt-id-card__header">
            <span className="rt-id-card__name">{data.userName}</span>
            <span className="rt-id-card__label">PERSONAL ID</span>
          </div>
          <div className="rt-id-card__body">
            <div className="rt-info-row">
              <span className="rt-info-row__label">BIRTH</span>
              <span className="rt-info-row__value">{data.birthDate}</span>
            </div>
            <div className="rt-info-row">
              <span className="rt-info-row__label">DATE</span>
              <span className="rt-info-row__value">{data.meetingDate}</span>
            </div>
            <div className="rt-info-row">
              <span className="rt-info-row__label">STATUS</span>
              <span className="rt-info-row__value">{data.temperature}</span>
            </div>
            {/* 사주 간지 그리드 (다른 운세 서비스에서도 재사용 가능) */}
            <div className="rt-saju-grid">
              <div className="rt-saju-grid__item">
                <span>시</span>
                {data.sajuInfo.time}
              </div>
              <div className="rt-saju-grid__item">
                <span>일</span>
                {data.sajuInfo.day}
              </div>
              <div className="rt-saju-grid__item">
                <span>월</span>
                {data.sajuInfo.month}
              </div>
              <div className="rt-saju-grid__item">
                <span>년</span>
                {data.sajuInfo.year}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="rt-main-content">
        {/* 01. OOTD 가이드 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">01. 상대에게 각인될 OOTD 전략</h2>
          <div className="rt-ootd-wrapper">
            <div className="rt-ootd-item">
              <span className="rt-ootd-item__label">MOOD</span>
              <span className="rt-ootd-item__value">"안경 쓴 도서관 무드"</span>
            </div>
            <div className="rt-ootd-item">
              <span className="rt-ootd-item__label">COLOR</span>
              <span className="rt-ootd-item__value">실버 & 스카이블루</span>
            </div>
          </div>
          <p className="rt-card__text">
            오늘은 다정한 느낌보다 <strong>차분하고 지적인 무드</strong>가 핵심입니다. 상대의 차가운
            인상을 녹여줄 <strong>실버 액세서리</strong>로 대화 운을 틔워보세요.
            <strong>메이크업 포인트:</strong> 아이라인을 일자로 순하게 빼고, 립은{' '}
            <strong>채도 낮은 컬러</strong>로 신뢰감을 높이세요.
          </p>
        </section>

        {/* 02. 심리 분석 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">02. 관계 심리 인사이트</h2>
          <div className="rt-analysis-list">
            <div className="rt-analysis-list__item">
              <span className="rt-analysis-list__sub-title">상대의 속마음</span>
              <p>
                <strong>{data.meetingMethod}</strong>로 만난 {data.userName}님에게 상대는 지금
                예의를 차리면서도 당신의 <strong>예상치 못한 반전 매력</strong>을 기대 중입니다.
              </p>
            </div>
            <div className="rt-analysis-list__item is-warning">
              <span className="rt-analysis-list__sub-title">대화 주의사항</span>
              <p>
                딱딱한 일 얘기는 금물! <strong>최근 본 영화나 취미</strong> 같은 가벼운 일상
                이야기가 상대의 마음을 여는 열쇠입니다.
              </p>
            </div>
            <div className="rt-analysis-list__item is-success">
              <span className="rt-analysis-list__sub-title">확실한 호감 신호</span>
              <p>
                눈맞춤이 <strong>3초 이상</strong> 지속되거나 질문을 <strong>3개 이상</strong> 먼저
                던진다면 확실한 그린라이트입니다.
              </p>
            </div>
          </div>
        </section>

        {/* 03. 케미 지수 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">03. 케미스트리 & 타이밍</h2>
          <div className="rt-score-box">
            <div className="rt-score-box__label">대화 티키타카 지수</div>
            <div className="rt-score-box__val">
              {data.chemistryScore}
              <span>점</span>
            </div>
            <div className="rt-progress">
              <div
                className="rt-progress__fill"
                style={{ width: isLoaded ? `${data.chemistryScore}%` : '0%' }}
              ></div>
            </div>
          </div>
          <div className="rt-timing-grid">
            <div className="rt-timing-grid__item">
              <span>골든 타임</span>
              <strong>만남 후 2시간</strong>
            </div>
            <div className="rt-timing-grid__item">
              <span>추천 장소</span>
              <strong>힙한 에스프레소 바</strong>
            </div>
          </div>
        </section>

        {/* 04. 애프터 가이드 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">04. 애프터 가이드 & 미래</h2>
          <div className="rt-tip-box">
            <span className="rt-tip-box__label">누가 먼저 연락할까?</span>
            <p>
              {data.userName}님이 먼저 <strong>"오늘 즐거웠어요"</strong>라고 묻는 것이 관계 발전에{' '}
              <strong>2배 더 빠른 운</strong>을 가져옵니다.
            </p>
          </div>
          <div className="rt-final-badge">
            연인 발전 가능성 <span>VERY HIGH</span>
          </div>
        </section>
      </main>

      <footer className="rt-footer animate-up">
        <button className="rt-btn-primary">전체 리포트 저장하기</button>
      </footer>
    </div>
  );
};

/* [Reusable Style System] */
const reusableStyle = `
  /* 1. Animations */
  @keyframes rtSlideUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes rtPulse {
    0% { transform: scale(1); box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2); }
    50% { transform: scale(1.03); box-shadow: 0 15px 30px rgba(37, 99, 235, 0.3); }
    100% { transform: scale(1); box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2); }
  }

  /* 2. Base Container */
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
  
  /* 3. Header */
  .rt-header { padding: 80px 20px 40px; text-align: center; }
  .rt-tag { font-size: 0.75rem; font-weight: 800; color: #3b82f6; letter-spacing: 0.25em; margin-bottom: 12px; }
  .rt-main-title { font-size: 2.2rem; font-weight: 950; line-height: 1.25; color: #0f172a; }
  .rt-main-title .text-highlight { color: #2563eb; }
  .rt-desc { font-size: 0.9rem; color: #64748b; margin-top: 16px; font-weight: 500; }

  /* 4. ID Card Component (Reusable) */
  .rt-id-card {
    background: #fff; border-radius: 28px; padding: 30px;
    box-shadow: 0 20px 45px rgba(37, 99, 235, 0.1);
    border: 1px solid rgba(37, 99, 235, 0.1);
    max-width: 400px;  margin: 24px auto;
    background-image: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  }
  .rt-id-card__header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 14px; }
  .rt-id-card__name { font-size: 1.6rem; font-weight: 900; color: #0f172a; }
  .rt-id-card__label { font-size: 0.7rem; color: #fff; background: #2563eb; padding: 4px 14px; border-radius: 100px; font-weight: 800; }
  
  .rt-info-row { display: flex; margin-bottom: 10px; font-size: 0.85rem; }
  .rt-info-row__label { width: 70px; color: #94a3b8; font-weight: 600; }
  .rt-info-row__value { color: #334155; font-weight: 700; }

  .rt-saju-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 24px; }
  .rt-saju-grid__item { background: #0f172a; color: #fff; border-radius: 16px; padding: 12px 5px; text-align: center; font-size: 0.95rem; font-weight: 700; }
  .rt-saju-grid__item span { display: block; font-size: 0.65rem; color: #94a3b8; margin-bottom: 4px; }

  /* 5. Main Content & Cards */
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

  /* 6. Utility Components (Reusable) */
  .rt-ootd-wrapper { display: flex; gap: 12px; margin-bottom: 24px; }
  .rt-ootd-item { flex: 1; background: #f8fbff; padding: 18px; border-radius: 20px; text-align: center; border: 1px solid #eff6ff; }
  .rt-ootd-item__label { font-size: 0.7rem; font-weight: 700; color: #3b82f6; display: block; margin-bottom: 6px; }
  .rt-ootd-item__value { font-size: 0.95rem; font-weight: 900; }

  .rt-analysis-list__item { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
  .rt-analysis-list__item:last-child { border: none; margin: 0; }
  .rt-analysis-list__sub-title { font-size: 0.9rem; font-weight: 900; color: #2563eb; margin-bottom: 8px; display: block; }
  
  .rt-score-box { text-align: center; margin-bottom: 28px; }
  .rt-score-box__val { font-size: 3.2rem; font-weight: 950; color: #2563eb; letter-spacing: -2px; }
  .rt-progress { background: #f1f5f9; height: 12px; border-radius: 100px; margin-top: 10px; overflow: hidden; }
  .rt-progress__fill { height: 100%; background: #2563eb; transition: width 1.8s cubic-bezier(0.34, 1.56, 0.64, 1); }

  .rt-timing-grid { display: flex; gap: 12px; margin-top: 24px; }
  .rt-timing-grid__item { flex: 1; border: 1.5px solid #e0e7ff; padding: 16px; border-radius: 20px; text-align: center; }
  .rt-timing-grid__item span { display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px; }
  .rt-timing-grid__item strong { font-size: 0.95rem; font-weight: 800; }

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
    cursor: pointer; transition: background 0.2s;
  }
  .rt-btn-primary:active { background: #1e293b; }

  /* Delay Classes for Sequence Animation */
  .rt-container.is-active .animate-up:nth-child(1) { animation-delay: 0.2s; }
  .rt-container.is-active .animate-up:nth-child(2) { animation-delay: 0.4s; }
  .rt-container.is-active .rt-card:nth-of-type(1) { animation-delay: 0.6s; }
  .rt-container.is-active .rt-card:nth-of-type(2) { animation-delay: 0.8s; }
  .rt-container.is-active .rt-card:nth-of-type(3) { animation-delay: 1.0s; }
`;

export default ReportTemplateDate;
