import { reportStyle } from '../data/aiResultConstants';
import { useLoading } from '../context/useLoadingContext';

const ReportTemplate = ({}) => {
  const { aiResult } = useLoading();
  if (!aiResult) return null;
  const parseAiResponse = (rawString) => {
    try {
      // 1. ```json 또는 ``` 태그를 제거하고 앞뒤 공백 제거
      const cleaned = rawString
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(cleaned);
    } catch (error) {
      console.error('1차 파싱 실패, 재시도합니다:', error);

      try {
        // 2. 만약 태그 제거 후에도 실패하면, 가장 바깥쪽 { } 괄호 안의 내용만 추출
        const jsonMatch = rawString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (innerError) {
        console.error('최종 파싱 실패:', innerError);
        return null;
      }
    }
  };

  const data = parseAiResponse(aiResult);
  console.log(aiResult, data);

  return (
    <>
      {' '}
      {aiResult && (
        <div className="sjsj-report-container">
          {/* 헤더 */}
          <header className="sjsj-header">
            <h1 className="sjsj-main-title">2026년 병오년 종합 리포트</h1>
            <p className="sjsj-header-sub">{data.year_info.header_sub}</p>
            <div className="sjsj-badge-summary">1분 핵심 요약</div>
          </header>

          <div className="sjsj-content-inner">
            {/* 요약 섹션 */}
            <section className="sjsj-section">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{data.year_info.one_line_title}</h2>
                <p className="sjsj-label-main">{data.year_info.one_line_label}</p>
              </div>
              <div className="sjsj-grid sjsj-grid-3">
                {data.year_info.three_keywords.map((kw, i) => (
                  <div key={i} className="sjsj-premium-card">
                    <div className="sjsj-card-title">{kw.title}</div>
                    <div className="sjsj-card-desc">{kw.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 종합 분석 */}
            <section className="sjsj-section">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">2026년 병오년 종합 분석</h2>
              </div>
              <div className="sjsj-info-banner">{data.total_analysis.summary_one_line}</div>
              <div className="sjsj-analysis-box">
                <div className="sjsj-keyword-grid">
                  <div className="sjsj-keyword-col">
                    <div className="sjsj-col-title text-fire">🔥 성장의 키워드</div>
                    <ul className="sjsj-list">
                      {data.total_analysis.growth_keywords.map((k, i) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="sjsj-keyword-col">
                    <div className="sjsj-col-title text-earth">💡 활용할 요소</div>
                    <ul className="sjsj-list">
                      {data.total_analysis.utilize_elements.map((el, i) => (
                        <li key={i}>
                          <span className="sjsj-check">✓</span> {el}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="sjsj-keyword-col">
                    <div className="sjsj-col-title text-earth">⚠️ 주의할 요소</div>
                    <ul className="sjsj-list">
                      {data.total_analysis.caution_elements.map((el, i) => (
                        <li key={i}>
                          <span className="sjsj-delta">△</span> {el}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <p className="sjsj-main-content">{data.total_analysis.main_content}</p>

              <h3 className="sjsj-sub-section-title">연애운</h3>
              <p className="sjsj-long-text">{data.total_analysis.luck_sections.love}</p>
              <h3 className="sjsj-sub-section-title">금전운</h3>
              <p className="sjsj-long-text">{data.total_analysis.luck_sections.money}</p>
              <h3 className="sjsj-sub-section-title">직장/사업운</h3>
              <p className="sjsj-long-text">{data.total_analysis.luck_sections.work}</p>
            </section>

            {/* 월별 분석 */}
            <section className="sjsj-section">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">월별 운세 상세 분석</h2>
              </div>
              {data.monthly_analysis.map((m) => (
                <div key={m.month} className="sjsj-month-card">
                  <div className="sjsj-month-header">
                    <div className="sjsj-month-title">
                      <h3>
                        {m.month}월 <span className="sjsj-sub-month">{m.ganji}월</span>
                      </h3>
                      <div className="sjsj-progress-bar">
                        <div className="sjsj-progress-fill" style={{ width: `${m.score}%` }}></div>
                      </div>
                    </div>
                    <div className="sjsj-star-rating">{m.stars}</div>
                  </div>
                  <div className="sjsj-month-summary-chips">
                    <div>
                      <span className="sjsj-check">✓</span> 방향: {m.direction}
                    </div>
                    <div>
                      <span className="sjsj-check">✓</span> 주의: {m.caution}
                    </div>
                    <div>▷ 활용: {m.utilize}</div>
                  </div>
                  <p className="sjsj-long-text">{m.content}</p>
                  <div className="sjsj-card-footer">
                    <div className="sjsj-footer-msg">{m.footer_msg}</div>
                  </div>
                </div>
              ))}
            </section>

            {/* 주의할 점 (마지막 섹션) */}
            <section className="sjsj-section">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">주의할 점</h2>
                <p className="sjsj-label-main">{data.special_periods.label_main}</p>
              </div>
              <div className="sjsj-grid sjsj-grid-2">
                <div className="sjsj-premium-card">
                  <div className="sjsj-card-title">활용하면 좋은 달</div>
                  <ul className="space-y-4 mt-4">
                    {data.special_periods.utilize_months.map((item, i) => (
                      <li key={i} className="sjsj-check">
                        <strong>{item.month}</strong>
                        <p className="sjsj-long-text">
                          {item.reason} {item.tip}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="sjsj-premium-card">
                  <div className="sjsj-card-title">주의해야 할 달</div>
                  <ul className="space-y-4 mt-4">
                    {data.special_periods.caution_months.map((item, i) => (
                      <li key={i} className="sjsj-check">
                        <strong>{item.month}</strong>
                        <p className="sjsj-long-text">
                          {item.reason} {item.tip}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
          <div dangerouslySetInnerHTML={{ __html: reportStyle }} />
        </div>
      )}
    </>
  );
};

export default ReportTemplate;
