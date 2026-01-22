import { reportStyle } from '../data/aiResultConstants';
import { useLoading } from '../context/useLoadingContext';
import { useLanguage } from '../context/useLanguageContext';

const ReportTemplateToday = ({}) => {
  const { aiResult } = useLoading();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const parseAiResponse = (rawString) => {
    if (!rawString) return null;
    try {
      const cleaned = rawString
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleaned);
    } catch (error) {
      try {
        const jsonMatch = rawString.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        return null;
      }
    }
  };

  const data = parseAiResponse(aiResult);
// const data = {
//   today: {
//     date: '2026년 1월 22일 목요일 (형식 엄수)',
//     score: 85, // 사용자의 사주와 오늘의 일진을 대조하여 산출한 '오늘의 운세 종합 점수' (0~100 사이의 정수)
//     stars: '★★★★☆', // 위의 score 점수에 비례하는 시각적인 별점 표시
//     caution: ['오늘 특별히 주의해야 할 요소 3개를 명사형으로'],
//     action: ['오늘 운을 높이기 위해 실천할 행동 3개를 명사형으로'],
//     analysis:
//       '오늘의 전반적인 운의 흐름, 오행의 생극제화에 따른 길흉, 특히 유의해야 할 지점과 긍정적인 변화의 계기를 사주 명리학적으로 심층 분석하여 서술하세요. (500~700자)',
//     summary: '오늘의 운세를 관통하는 핵심 요약 메시지 한 문장',
//   },
//   lucky_elements: {
//     direction: {
//       title: '행운의 방향 (예: 남동쪽)',
//       desc: '해당 방향이 오늘 왜 전략적으로 중요한지 명리학적 근거를 들어 100~200자로 서술.',
//     },
//     color: {
//       title: '행운의 컬러 (예: 딥 퍼플)',
//       desc: '오늘 부족한 기운을 보강하거나 기운을 돕는 색상과 그 이유를 오행 관점에서 서술.',
//     },
//     keywords: {
//       tags: ['#키워드1', '#키워드2', '#키워드3', '#키워드4', '#키워드5'],
//       desc: '선정된 5개 키워드가 오늘 당신의 운에 어떤 긍정적 매개체가 되는지 상세 서술.',
//     },
//   },
//   categories: {
//     love: {
//       summary: '연애운 핵심 요약',
//       analysis:
//         '사용자의 사주와 오늘의 기운을 대조하여 애정운, 인연운, 관계의 흐름을 상세 분석. (300~500자)',
//     },
//     wealth: {
//       summary: '금전운 핵심 요약',
//       analysis:
//         '오늘의 재물 흐름, 투자 적기, 소비 주의점, 재운의 상승 요인을 명리학적으로 분석. (300~500자)',
//     },
//     career: {
//       summary: '직장/사업운 핵심 요약',
//       analysis:
//         '업무 성과, 조직 내 위치, 비즈니스 결정 및 새로운 프로젝트 추진의 유리함 분석. (300~500자)',
//     },
//     health: {
//       summary: '건강운 핵심 요약',
//       analysis:
//         '신체 기운의 강약, 특히 보강해야 할 장기나 주의할 질환을 오행의 조화 관점에서 분석. (300~500자)',
//     },
//     study: {
//       summary: '학업운 핵심 요약',
//       analysis: '집중력, 지적 탐구의 효율성, 시험이나 공부 성과에 미치는 에너지 분석. (300~500자)',
//     },
//   },
//   tomorrow: {
//     date: '2026년 1월 23일 금요일 (내일 날짜)',
//     score: 90, // 내일의 운세 점수
//     stars: '내일 점수에 맞는 별점',
//     caution: ['내일 주의할 것 3개'],
//     action: ['내일 활용할 것 3개'],
//     analysis:
//       '내일의 기운을 미리 진단하여, 오늘 밤부터 내일을 어떻게 준비하고 대비해야 할지 심층 분석. (500~700자)',
//     summary: '내일을 위한 핵심 가이드 한 문장',
//   },
// };

console.log(data,aiResult)
  // 데이터 없으면 아무것도 안 보여줌
  if (!data) return null;

  return (
    <div className="sjsj-report-container">
      {/* 헤더 */}
      <header className="sjsj-header">
        <h1 className="sjsj-main-title">{isEn ? 'Luck of the day' : '오늘의 운세'}</h1>
      </header>

      <div className="sjsj-content-inner">
        {/* 오늘의 운세 */}
        <section className="sjsj-section">
          <div className="sjsj-section-label">
            <h2 className="sjsj-subTitle"> {isEn ? "Today's Luck" : '오늘의 총운'}</h2>
          </div>
          <div className="sjsj-section-label">
            <p className="sjsj-label-main">{isEn ? "today's luck section" : '오늘의 총운'}</p>
          </div>
          <div className="sjsj-month-card">
            <div className="sjsj-month-header">
              <div className="sjsj-month-title">
                <h3>{data.today.date}</h3>
                <div className="sjsj-progress-bar">
                  <div
                    className="sjsj-progress-fill"
                    style={{ width: `${data.today.score}%` }}
                  ></div>
                  {data.today.score}점
                </div>
              </div>
              <div className="sjsj-star-rating">{data.today.stars}</div>
            </div>
            <div className="sjsj-month-summary-chips">
              <div>
                <span className="sjsj-check">✓</span> {isEn ? 'Caution: ' : '주의: '}
                {data.today.caution.join(', ')}
              </div>
              <div>
                ▷ {isEn ? 'Action: ' : '활용: '} {data.today.action.join(', ')}
              </div>
            </div>
            <p className="sjsj-long-text">{data.today.analysis}</p>
            <div className="sjsj-card-footer">
              <div className="sjsj-footer-msg">{data.today.summary}</div>
            </div>
          </div>

          <div className="sjsj-section-label">
            <p className="sjsj-label-main">{isEn ? 'Lucky Element' : '오늘의 행운의 요소'}</p>
          </div>
          <div className="sjsj-analysis-box">
            <div className="sjsj-keyword-grid">
              <div className="sjsj-keyword-col">
                <div className="sjsj-col-title text-fire">{isEn ? 'Direction' : '행운의 방향'}</div>
                <ul className="sjsj-list">
                  <li>
                    {data.lucky_elements.direction.title}: {data.lucky_elements.direction.desc}
                  </li>
                </ul>
              </div>
              <div className="sjsj-keyword-col">
                <div className="sjsj-col-title text-earth">
                  {isEn ? 'Lucky color' : '행운의 컬러'}
                </div>
                <ul className="sjsj-list">
                  <li>
                    <span className="sjsj-check">✓</span> {data.lucky_elements.color.title}:{' '}
                    {data.lucky_elements.color.desc}
                  </li>
                </ul>
              </div>
              <div className="sjsj-keyword-col">
                <div className="sjsj-col-title text-earth">{isEn ? 'Keywords' : '키워드'}</div>
                <ul className="sjsj-list">
                  <li>
                    <span className="sjsj-delta">△</span>
                    <div>
                     
                      <strong>{data.lucky_elements.keywords.tags.join(' ')}</strong>
                      <br />
                      {data.lucky_elements.keywords.desc}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 카테고리별 */}
        <section className="sjsj-section">
          <div className="sjsj-section-label">
            <h2 className="sjsj-subTitle">
              {isEn ? 'Category Deep Dive' : '카테고리별 상세 분석'}
            </h2>
          </div>

          <h3 className="sjsj-sub-section-title">{isEn ? 'Love Luck' : '연애운'}</h3>
          <div className="sjsj-long-text">
            <strong>[{data.categories.love.summary}]</strong>
            <p>{data.categories.love.analysis}</p>
          </div>

          <h3 className="sjsj-sub-section-title">{isEn ? 'Wealth Luck' : '금전운'}</h3>
          <div className="sjsj-long-text">
            <strong>[{data.categories.wealth.summary}]</strong>
            <p>{data.categories.wealth.analysis}</p>
          </div>

          <h3 className="sjsj-sub-section-title">{isEn ? 'Career Luck' : '직장/사업운'}</h3>
          <div className="sjsj-long-text">
            <strong>[{data.categories.career.summary}]</strong>
            <p>{data.categories.career.analysis}</p>
          </div>

          <h3 className="sjsj-sub-section-title">{isEn ? 'Health Luck' : '건강운'}</h3>
          <div className="sjsj-long-text">
            <strong>[{data.categories.health.summary}]</strong>
            <p>{data.categories.health.analysis}</p>
          </div>

          <h3 className="sjsj-sub-section-title">{isEn ? 'Study Luck' : '학업운'}</h3>
          <div className="sjsj-long-text">
            <strong>[{data.categories.study.summary}]</strong>
            <p>{data.categories.study.analysis}</p>
          </div>
        </section>

        {/* 내일의 운세 */}
        <section className="sjsj-section">
          <div className="sjsj-section-label">
            <h2 className="sjsj-subTitle">{isEn ? "Tomorrow's Luck" : '내일의 운세'}</h2>
          </div>
          <div className="sjsj-month-card">
            <div className="sjsj-month-header">
              <div className="sjsj-month-title">
                <h3>{data.tomorrow.date}</h3>
                <div className="sjsj-progress-bar">
                  <div
                    className="sjsj-progress-fill"
                    style={{ width: `${data.tomorrow.score}%` }}
                  ></div>
                  {data.tomorrow.score}점
                </div>
              </div>
              <div className="sjsj-star-rating">{data.tomorrow.stars}</div>
            </div>
            <div className="sjsj-month-summary-chips">
              <div>
                <span className="sjsj-check">✓</span> {isEn ? 'Caution: ' : '주의: '}
                {data.tomorrow.caution.join(', ')}
              </div>
              <div>
                ▷ {isEn ? 'Action: ' : '활용: '} {data.tomorrow.action.join(', ')}
              </div>
            </div>
            <p className="sjsj-long-text">{data.tomorrow.analysis}</p>
            <div className="sjsj-card-footer">
              <div className="sjsj-footer-msg">{data.tomorrow.summary}</div>
            </div>
          </div>
        </section>
      </div>
      <div dangerouslySetInnerHTML={{ __html: reportStyle }} />
    </div>
  );
};

export default ReportTemplateToday;
