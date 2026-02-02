import { reportStyle, reportStyleBlue } from '../data/aiResultConstants';
import { useLoading } from '../context/useLoadingContext';
import { useLanguage } from '../context/useLanguageContext';
import { useState, useEffect } from 'react';
import AfterReport from './AfterReport';
import { parseAiResponse } from '../utils/helpers';
const ReportTemplateToday = ({}) => {
  const { aiResult } = useLoading();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [gaugeScore, setGaugeScore] = useState(0);

  const [data, setData] = useState(null); // 파싱된 데이터를 담을 로컬 상태

  useEffect(() => {
    if (aiResult) {
      const parsedData = parseAiResponse(aiResult);
      if (parsedData) {
        setData(parsedData); // 파싱 성공 시 데이터 세팅
      }
    }
  }, [aiResult]); // aiResult가 업데이트될 때마다 실행
  useEffect(() => {
    if (data?.today?.score) {
      // 렌더링 직후 0인 상태에서 점수값으로 변경하여 애니메이션 유도
      const timer = setTimeout(() => {
        setGaugeScore(data.today.score);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data]);
  // 데이터 없으면 아무것도 안 보여줌
  if (!data) return '결과없음';

  return (
    <div className="fortune-container">
      {/* 헤더 */}
      <header className="fortune-header">
        <h1 className="fortune-main-title">{isEn ? 'Daily Fortune' : '오늘의 운세 리포트'}</h1>
        <p className="fortune-date-text">{data.today.date}</p>
      </header>

      {/* 메인 총운 및 점수 바 */}
      <section className="fortune-section">
        <div
          className="score-circle-gauge"
          style={{ '--p': gaugeScore }} // 여기서 --p 값을 제어합니다.
        >
          <div className="score-number-wrap">
            <span className="score-value">{data.today.score}</span>
            <span className="score-unit-text">점</span>
          </div>
        </div>

        <div className="score-star-rating">{data.today.stars}</div>
        <p className="score-summary-quote">"{data.today.summary}"</p>

        {/* 행운 요소 */}
        <div className="luck-element-list">
          <div className="luck-element-item">
            <div className="luck-item-title">{isEn ? 'Direction' : '행운의 방향'}</div>
            <div className="luck-item-content">{data.lucky_elements.direction.title}</div>
            <div className="luck-item-desc">{data.lucky_elements.direction.desc}</div>
          </div>
          <div className="luck-element-item">
            <div className="luck-item-title">{isEn ? 'Lucky Color' : '행운의 컬러'}</div>
            <div className="luck-item-content">{data.lucky_elements.color.title}</div>
            <div className="luck-item-desc">{data.lucky_elements.color.desc}</div>
          </div>
          <div className="luck-element-item">
            <div className="luck-item-title">{isEn ? 'Keywords' : '키워드'}</div>
            <div className="luck-item-content">{data.lucky_elements.keywords.tags.join(', ')}</div>
            <div className="luck-item-desc">{data.lucky_elements.keywords.desc}</div>
          </div>
        </div>
      </section>

      {/* 상세 분석 섹션 */}
      <div className="detail-list-wrap">
        <div className="detail-item-box">
          <div className="detail-title">{isEn ? 'Total Analysis' : '오늘의 총운'}</div>
          <div className="detail-body">{data.today.analysis}</div>
        </div>

        {Object.keys(data.categories).map((key) => (
          <div key={key} className="detail-item-box">
            <div className="detail-title category-title">
              {key === 'love' && (isEn ? 'Love' : '연애운')}
              {key === 'wealth' && (isEn ? 'Wealth' : '금전운')}
              {key === 'career' && (isEn ? 'Career' : '사업운')}
              {key === 'health' && (isEn ? 'Health' : '건강운')}
              {key === 'study' && (isEn ? 'Study' : '학업운')}
            </div>
            <div className="detail-body">
              <strong>[{data.categories[key].summary}]</strong>
              <p>{data.categories[key].analysis}</p>
            </div>
          </div>
        ))}

        {/* 내일의 운세 */}
        <div className="detail-item-box tomorrow-box">
          <div className="detail-title">{isEn ? "Tomorrow's Luck" : '내일의 운세'}</div>
          <div className="fortune-date-text">{data.tomorrow.date}</div>
          <div className="detail-body">
            <strong>{data.tomorrow.summary}</strong>
            <p>{data.tomorrow.analysis}</p>
          </div>
        </div>
      </div>

      <AfterReport />
      <style>{`/* --- 2030 Minimal Line Design System --- */

.fortune-container {
  max-width: 480px;
  margin: 0 auto;
  padding: 48px 20px;
  background-color: #ffffff;
  color: #1a1a1a;
  font-family: 'Pretendard', -apple-system, sans-serif;
}

/* 헤더 영역 */
.fortune-header {
  text-align: center;
  margin-bottom: 40px;
}

.fortune-main-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.fortune-date-text {
  color: #8e8e93;
  font-size: 0.85rem;
}

/* 점수 섹션 및 원형 게이지 */
.fortune-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48px;
}
/* CSS 변수가 숫자임을 브라우저에 등록 (애니메이션 필수) */
@property --p {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

.score-circle-gauge {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  /* conic-gradient 내에서 var(--p)를 사용 */
  background: conic-gradient(#5856d6 calc(var(--p) * 1%), #f2f2f7 0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  /* 클래스가 추가되면 1.5초간 애니메이션 실행 */
  transition: --p 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.score-circle-gauge::after {
  content: "";
  position: absolute;
  width: 154px;
  height: 154px;
  background: #ffffff;
  border-radius: 50%;
  z-index: 1;
}
/* 점수 차오르는 애니메이션 */
@keyframes fill-gauge {
  from {
    background: conic-gradient(#5856d6 0%, #f2f2f7 0%);
  }
  to {
    /* --target-p 변수는 리액트에서 전달받음 */
    background: conic-gradient(#5856d6 calc(var(--target-p) * 1%), #f2f2f7 0%);
  }
}

.score-number-wrap {
  position: relative;
  z-index: 10;
  text-align: center;
}

.score-value {
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -2px;
}

.score-unit-text {
  font-size: 1rem;
  font-weight: 700;
  color: #8e8e93;
}

.score-star-rating {
  margin-top: 16px;
  font-size: 1.2rem;
}

.score-summary-quote {
  font-weight: 700;
  font-size: 1.15rem;
  margin-top: 16px;
  text-align: center;
}

/* 행운 요소 리스트 */
.luck-element-list {
  width: 100%;
  margin-top: 32px;
  border-top: 1px solid #f2f2f7;
}

.luck-element-item {
  padding: 16px 0;
  border-bottom: 1px solid #f2f2f7;
}

.luck-item-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #5856d6;
  margin-bottom: 4px;
}

.luck-item-content {
  font-size: 0.95rem;
  font-weight: 600;
}

.luck-item-desc {
  font-size: 0.85rem;
  color: #8e8e93;
  margin-top: 2px;
}

/* 상세 분석 섹션 */
.detail-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.detail-item-box {
  padding-bottom: 24px;
  border-bottom: 1px solid #f2f2f7;
}

.detail-title {
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.category-title {
  color: #5856d6;
}

.detail-body {
  font-size: 0.95rem;
  line-height: 1.7;
}

/* 내일 운세 전용 박스 */
.tomorrow-box {
  background-color: #f2f2f7;
  padding: 24px;
  border-radius: 20px;
  margin-top: 16px;
}`}</style>
    </div>
  );
};

export default ReportTemplateToday;
