import React, { useEffect, useState } from 'react';
import { reportStyleSimple } from '../data/aiResultConstants';
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
      <style>{reportStyleSimple}</style>

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



export default ReportTemplateDate;
