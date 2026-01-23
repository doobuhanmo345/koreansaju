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


  const [data, setData] = useState(null); // 파싱된 데이터를 담을 로컬 상태
  console.log(data);
  useEffect(() => {
    if (aiResult) {
      const parsedData = parseAiResponse(aiResult);
      if (parsedData) {
        setData(parsedData); // 파싱 성공 시 데이터 세팅
      }
    }
  }, [aiResult]); // aiResult가 업데이트될 때마다 실행

  // 데이터 없으면 아무것도 안 보여줌
  if (!data) return '결과없음';

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
      <div dangerouslySetInnerHTML={{ __html: reportStyleBlue }} />
      <AfterReport />
    </div>
  );
};

export default ReportTemplateToday;
