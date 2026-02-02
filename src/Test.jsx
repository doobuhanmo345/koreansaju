import { useLoading } from './context/useLoadingContext';
import { useLanguage } from './context/useLanguageContext';
import { useState, useEffect } from 'react';
import AfterReport from './component/AfterReport';
import { parseAiResponse } from './utils/helpers';

const Test = ({}) => {
  const { aiResult } = useLoading();
  const { language } = useLanguage();
  const isEn = language === 'en';
  // const [data, setData] = useState(null);
  const data = {
    today: {
      date: '2026년 2월 2일 (월요일)',
      score: 88,
      stars: '★★★★☆',
      caution: ['불필요한 논쟁', '과도한 자신감'],
      action: ['주변 정리정돈', '차 마시기'],
      analysis:
        '오늘은 기운이 매우 상승하는 날입니다. 평소 미뤄왔던 복잡한 업무나 고민거리를 해결하기에 최적의 시기입니다. 추진력이 좋아 계획한 대로 일이 풀리겠지만, 동료와의 의견 차이에서 오는 마찰은 피하는 것이 좋습니다. 유연한 태도가 행운을 더욱 불러옵니다.',
      summary: '강한 운세가 함께하니 계획한 대로 당당하게 밀어붙이세요.',
    },
    lucky_elements: {
      direction: {
        title: '북서쪽',
        desc: '귀인을 만나거나 예상치 못한 정보를 얻을 수 있는 행운의 방향입니다.',
      },
      color: {
        title: '딥 그린',
        desc: '정서적 안정감을 주며 판단력을 흐리지 않게 돕는 색상입니다.',
      },
      keywords: {
        tags: ['결단력', '협조', '새로운 만남'],
        desc: '확신을 가지고 행동하되 타인의 도움을 수용할 때 성과가 극대화됩니다.',
      },
    },
    categories: {
      love: {
        summary: '호감도가 상승하는 날',
        analysis:
          '상대방에게 나의 매력이 돋보이는 날입니다. 연인 사이라면 여행 계획을 세우기 좋고, 솔로라면 가까운 곳에서 인연이 나타날 수 있습니다.',
      },
      wealth: {
        summary: '뜻밖의 수익이 기대됨',
        analysis:
          '지갑이 두둑해질 수 있는 기운이 있습니다. 소액 투자에서 성과를 보거나 과거에 빌려준 돈을 돌려받는 등 금전 흐름이 원활합니다.',
      },
      career: {
        summary: '능력을 인정받는 시기',
        analysis:
          '상사나 동료들에게 본인의 실력을 증명할 기회가 생깁니다. 맡은 업무를 완벽하게 처리하여 리더십을 발휘하기 좋습니다.',
      },
      health: {
        summary: '에너지가 넘치는 상태',
        analysis:
          '컨디션이 매우 좋아 활기차게 활동할 수 있습니다. 가벼운 운동이나 산책을 통해 기운을 순환시키면 더욱 좋습니다.',
      },
      study: {
        summary: '집중력이 매우 높음',
        analysis:
          '어려운 과제도 평소보다 쉽게 해결할 수 있습니다. 암기 과목이나 창의적인 글쓰기 작업에서 좋은 결과가 나옵니다.',
      },
    },
    tomorrow: {
      date: '2026년 2월 3일 (화요일)',
      score: 75,
      stars: '★★★☆☆',
      caution: ['체력 소모'],
      action: ['충분한 수면'],
      analysis:
        '내일은 안정적인 흐름을 유지하는 것이 핵심입니다. 과한 욕심보다는 현재의 성과를 유지하며 차분하게 하루를 보내는 것이 유리합니다.',
      summary: '내실을 다지며 평온한 하루를 준비하세요.',
    },
  };

  useEffect(() => {
    if (aiResult) {
      const parsedData = parseAiResponse(aiResult);
      if (parsedData) setData(parsedData);
    }
  }, [aiResult]);

  if (!data) return '결과없음';

  return (
    <div className="fortune-container">
      <header className="fortune-header">
        <h1 className="fortune-main-title">{isEn ? 'Daily Fortune' : '오늘의 운세'}</h1>
        <p style={{ color: '#8e8e93', fontSize: '0.9rem' }}>{data.today.date}</p>
      </header>

      <section className="fortune-section">
        {/* 원형 점수 애니메이션 */}
        <div className="score-circle-gauge" style={{ '--p': data.today.score }}>
          <div className="score-number-wrap">
            <span className="score-value">{data.today.score}</span>
            <span style={{ fontSize: '1rem', fontWeight: '700', color: '#8e8e93' }}>점</span>
          </div>
        </div>

        <div style={{ marginTop: '16px', fontSize: '1.2rem' }}>{data.today.stars}</div>
        <p style={{ fontWeight: '700', fontSize: '1.1rem', marginTop: '12px' }}>
          "{data.today.summary}"
        </p>

        {/* 행운의 요소 (원본 타이틀/설명 모두 포함) */}
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
            <div className="detail-title" style={{ color: '#5856d6' }}>
              {key === 'love' && (isEn ? 'Love' : '연애운')}
              {key === 'wealth' && (isEn ? 'Wealth' : '금전운')}
              {key === 'career' && (isEn ? 'Career' : '사업운')}
              {key === 'health' && (isEn ? 'Health' : '건강운')}
              {key === 'study' && (isEn ? 'Study' : '학업운')}
            </div>
            <div className="detail-body">
              <strong>[{data.categories[key].summary}]</strong>
              <p style={{ marginTop: '4px' }}>{data.categories[key].analysis}</p>
            </div>
          </div>
        ))}

        {/* 내일의 운세 (원본 데이터 구조 유지) */}
        <div
          className="detail-item-box"
          style={{ background: '#f2f2f7', padding: '24px', borderRadius: '20px', border: 'none' }}
        >
          <div className="detail-title">{isEn ? "Tomorrow's Luck" : '내일의 운세'}</div>
          <div style={{ fontSize: '0.85rem', color: '#8e8e93', marginBottom: '8px' }}>
            {data.tomorrow.date}
          </div>
          <div className="detail-body">
            <strong>{data.tomorrow.summary}</strong>
            <p style={{ marginTop: '4px' }}>{data.tomorrow.analysis}</p>
          </div>
        </div>
      </div>

      <AfterReport />
      <style>{`/* --- 2030 Minimal Line Design --- */
@property --p {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

.fortune-container {
  max-width: 480px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #ffffff;
  color: #1a1a1a;
  font-family: 'Pretendard', -apple-system, sans-serif;
}

.fortune-header {
  text-align: center;
  margin-bottom: 32px;
}

.fortune-main-title {
  font-size: 1.25rem;
  font-weight: 800;
}

/* 원형 점수 게이지 */
.fortune-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.score-circle-gauge {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(#5856d6 calc(var(--p) * 1%), #f2f2f7 0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: --p 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.score-circle-gauge::after {
  content: "";
  position: absolute;
  width: 154px;
  height: 154px;
  background: #ffffff;
  border-radius: 50%;
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

/* 행운 요소 (원본 데이터 desc 포함 레이아웃) */
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

/* 상세 리스트 */
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

.detail-body {
  font-size: 0.95rem;
  line-height: 1.7;
}`}</style>
    </div>
  );
};

export default Test;
