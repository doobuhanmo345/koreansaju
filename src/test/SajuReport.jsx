import React from 'react';
import './SajuReport.css'; // 작성한 CSS 파일을 임포트합니다.

const SajuReport = () => {
  // SVG 아이콘 컴포넌트들
  const IconFire = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="sjsj-icon">
      <path
        d="M12 2C12 2 7 8 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 8 12 2 12 2Z"
        fill="#E65100"
      />
      <path
        d="M12 6C12 6 9 10 9 13C9 14.6569 10.3431 16 12 16C13.6569 16 15 14.6569 15 13C15 10 12 6 12 6Z"
        fill="#FFB74D"
      />
    </svg>
  );

  const IconScales = () => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8D6E63"
      strokeWidth="1.2"
      className="sjsj-icon"
    >
      <path d="M3 7h18M12 3v18M7 7l-2 10h4l-2-10zm12 0l-2 10h4l-2-10z" />
    </svg>
  );

  const IconCompass = () => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#BF360C"
      strokeWidth="1.2"
      className="sjsj-icon"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        d="M16.2426 7.75736L10.5858 10.5858L7.75736 16.2426L13.4142 13.4142L16.2426 7.75736Z"
        fill="#BF360C"
      />
    </svg>
  );

  return (
    <>
      <div className="sjsj-report-container">
        {/* 전체 운세 리포트 페이지 컨테이너 */}

        {/* 최상단 타이틀 구역 */}
        <header className="sjsj-header">
          <h1 className="sjsj-main-title">[연도 + 간지 + 운세 종합 리포트 제목]</h1>

          <p className="sjsj-header-sub">
            [해당 연도의 핵심 오행·기운을 기준으로 한 전체 리포트 설명 문장]
          </p>

          <div className="sjsj-badge-summary">
            [요약본을 읽는 데 걸리는 시간 또는 요약 성격 안내]
          </div>
        </header>

        <div className="sjsj-content-inner">
          {/* 주제 0: 해당 연도 요약 분석 */}
          <section className="sjsj-section">
            <div className="sjsj-section-label">
              <h2 className="sjsj-subTitle">[해당 연도의 한 줄 요약 분석 제목]</h2>
              <p className="sjsj-label-main">[올해 인생 흐름을 한 문장으로 요약한 핵심 문구]</p>
            </div>

            <div className="sjsj-grid sjsj-grid-3">
              <div className="sjsj-premium-card">
                <IconFire />
                <div className="sjsj-card-title">[올해의 핵심 키워드 1]</div>
                <div className="sjsj-card-desc">[해당 키워드가 의미하는 운의 방향 설명]</div>
              </div>

              <div className="sjsj-premium-card active">
                <IconScales />
                <div className="sjsj-card-title">[올해 가장 중요한 선택 테마]</div>
                <div className="sjsj-card-desc">[결정·정리·분기점에 대한 설명 문구]</div>
              </div>

              <div className="sjsj-premium-card">
                <IconCompass />
                <div className="sjsj-card-title">[방향성 키워드]</div>
                <div className="sjsj-card-desc">[스스로 기준을 세워야 하는 흐름 설명]</div>
              </div>
            </div>
          </section>

          {/* 주제 1: 연간 종합 분석 */}
          <section className="sjsj-section">
            <div className="sjsj-section-label">
              <h2 className="sjsj-subTitle">[연도 + 간지 + 종합 분석 제목]</h2>
            </div>

            <div className="sjsj-info-banner">
              [이 섹션에서 다루는 내용에 대한 안내 문구 – 빠르게 훑어보라는 메시지]
            </div>

            <div className="sjsj-analysis-box">
              <div className="sjsj-keyword-grid">
                {/* 성장 키워드 */}
                <div className="sjsj-keyword-col">
                  <div className="sjsj-col-title text-fire">🔥 성장의 키워드</div>
                  <ul className="sjsj-list">
                    <li>[올해를 대표하는 성장 키워드 1]</li>
                    <li>[올해를 대표하는 성장 키워드 2]</li>
                  </ul>
                </div>

                {/* 활용할 요소 */}
                <div className="sjsj-keyword-col">
                  <div className="sjsj-col-title text-earth">💡 활용할 요소</div>
                  <ul className="sjsj-list">
                    <li>
                      <span className="sjsj-check">✓</span>
                      [운을 끌어올리는 행동·태도]
                    </li>
                    <li>
                      <span className="sjsj-check">✓</span>
                      [기회를 살리는 핵심 포인트]
                    </li>
                  </ul>
                </div>

                {/* 주의할 요소 */}
                <div className="sjsj-keyword-col">
                  <div className="sjsj-col-title text-earth">⚠️ 주의할 요소</div>
                  <ul className="sjsj-list">
                    <li>
                      <span className="sjsj-delta">△</span>
                      [운이 꺾일 수 있는 패턴]
                    </li>
                    <li>
                      <span className="sjsj-delta">△</span>
                      [조절이 필요한 태도 또는 선택]
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 주제 2: 월별 분석 1월부터 12월까지 */}
          <section className="sjsj-section">
            <div className="sjsj-section-label">
              <h2 className="sjsj-subTitle">[월별 운세 상세 분석]</h2>
            </div>

            <div className="sjsj-month-card">
              <div className="sjsj-month-header">
                <div className="sjsj-month-title">
                  <h3>
                    [몇 월 운세]
                    <span className="sjsj-sub-month">[간지 표현 월 한국어 이름]</span>
                  </h3>
                  <div className="sjsj-progress-bar">
                    <div className="sjsj-progress-fill"></div>
                  </div>
                </div>

                <div className="sjsj-star-rating">[월별 점수 별점 5점 만점의 몇점인지 별로]</div>
              </div>

              <div className="sjsj-month-summary-chips">
                <div>
                  <span className="sjsj-check">✓</span>
                  방향: [이 달의 핵심 방향]
                </div>
                <div>
                  <span className="sjsj-check">✓</span>
                  주의: [이 달에 특히 조심할 점]
                </div>
                <div>▷ 활용: [이 달을 잘 쓰는 방법]</div>
              </div>

              <p className="sjsj-long-text">
                [해당 월에 대한 장문 분석 영역 – 성향 변화, 사건 흐름, 선택 포인트 등을 여러
                문장으로 상세히 설명하는 영역]
              </p>

              <div className="sjsj-card-footer">
                <div className="sjsj-footer-msg">[이 달의 핵심 조언을 한 문장으로 요약]</div>
              </div>
            </div>
          </section>

          {/* 주제 3: 주의·활용해야 할 달 */}
          <section className="sjsj-section">
            <div className="sjsj-section-label">
              <h2 className="sjsj-subTitle">[주의할 점]</h2>
              <p className="sjsj-label-main">[해당 연도에서 특별히 의미 있는 시기 설명]</p>
            </div>

            <div className="sjsj-grid sjsj-grid-2">
              <div className="sjsj-premium-card">
                <div className="sjsj-card-title">활용하면 좋은 달</div>
                <div className="sjsj-premium-card">
                  <ul>
                    <li>
                      <p>[월]</p>
                      <p>[이 달이 좋은 이유 한문장.][이 달의 활용 법 한문장]</p>
                    </li>
                    <li>
                      <p>[월]</p>
                      <p>[이 달이 좋은 이유 한문장.][이 달의 활용 법 한문장]</p>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="sjsj-premium-card active">
                <div className="sjsj-card-title">주의해야 할 달</div>
                <div className="sjsj-premium-card">
                  <ul>
                    <li>
                      <p>[월]</p>
                      <p>[이 달을 조심해야 하는 이유 한문장.][이 달의 활용 법 한문장]</p>
                    </li>
                    <li>
                      <p>[월]</p>
                      <p>[이 달을 조심해야 하는 이유 한문장.][이 달의 활용 법 한문장]</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      {' '}
      <div className="sjsj-report-container">
        {/* 최상단 타이틀 구역 */}
        <header className="sjsj-header">
          <h1 className="sjsj-main-title">2026년 병오년 운세 종합 리포트</h1>
          <p className="sjsj-header-sub">
            병오년의 화(火) 기운으로 당신의 운세를 분석한 상세 리포트입니다.
          </p>
          <div className="sjsj-badge-summary">
            요약본 보면 1분전 |{' '}
            <span className="sjsj-badge-highlight">필요할 때 더 자세히 읽으세요. 〉</span>
          </div>
        </header>

        <div className="sjsj-content-inner">
          {/* 주제 0: 병오년 요약 분석 */}
          <section className="sjsj-section">
            <div className="sjsj-section-label">
              <h2 className="sjsj-subTitle">병오년 요약 분석</h2>
              <p className="sjsj-label-main">
                2026년, 당신의 인생 그래프가 가장 가파르게 상승하는 해
              </p>
            </div>
            <div className="sjsj-grid sjsj-grid-3">
              <div className="sjsj-premium-card">
                <IconFire />
                <div className="sjsj-card-title">확장</div>
                <div className="sjsj-card-desc">역할과 영향력이 커지는 해</div>
              </div>
              <div className="sjsj-premium-card active">
                <IconScales />
                <div className="sjsj-card-title">선택</div>
                <div className="sjsj-card-desc">버릴 것과 가져갈 것을 정해야 하는 해 〉</div>
              </div>
              <div className="sjsj-premium-card">
                <IconCompass />
                <div className="sjsj-card-title">방향</div>
                <div className="sjsj-card-desc">스스로 기준이 되는 시기</div>
              </div>
            </div>
          </section>

          {/* 주제 1: 병오년 종합 분석 */}
          <section className="sjsj-section">
            <div className="sjsj-section-label">
              <h2 className="sjsj-subTitle">2026년 병오년 종합 분석</h2>
            </div>
            <div className="sjsj-info-banner">
              이 부분은 2026년 전체 방향을 설명합니다. 빠르게 훑고, 기억에 남는 문장을 체크하세요.
            </div>

            <div className="sjsj-analysis-box">
              <div className="sjsj-keyword-grid">
                {/* 키워드 */}
                <div className="sjsj-keyword-col">
                  <div className="sjsj-col-title text-fire">
                    <span style={{ marginRight: '4px' }}>🔥</span> 성장의 키워드
                  </div>
                  <ul className="sjsj-list" style={{ fontWeight: 500 }}>
                    <li># 성광</li>
                    <li># 장역</li>
                  </ul>
                </div>
                {/* 활용할 요소 */}
                <div className="sjsj-keyword-col">
                  <div className="sjsj-col-title text-earth">
                    <span style={{ marginRight: '4px' }}>💡</span> 활용할 요소
                  </div>
                  <ul className="sjsj-list">
                    <li>
                      <span className="sjsj-check">✓</span> 번창 운 도약점
                    </li>
                    <li>
                      <span className="sjsj-check">✓</span> 제물운 당당 향기
                    </li>
                  </ul>
                </div>
                {/* 주의할 요소 */}
                <div className="sjsj-keyword-col">
                  <div className="sjsj-col-title text-earth">
                    <span style={{ marginRight: '4px' }}>⚠️</span> 주의할 요소
                  </div>
                  <ul className="sjsj-list">
                    <li>
                      <span className="sjsj-delta">△</span> 창의적 하락 방지
                    </li>
                    <li>
                      <span className="sjsj-delta">△</span> 철저한 강약 조절
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 주제 2: 월별 분석 */}
          <section className="sjsj-section">
            <div className="sjsj-section-label">
              <h2 className="sjsj-subTitle">월별 운세 상세 분석</h2>
            </div>
            <div className="sjsj-month-card">
              <div className="sjsj-month-header">
                <div className="sjsj-month-title">
                  <h3>
                    1월 운세 <span className="sjsj-sub-month">(기축월)</span>
                  </h3>
                  <div className="sjsj-progress-bar">
                    <div className="sjsj-progress-fill"></div>
                  </div>
                </div>
                <div className="sjsj-star-rating">★★★★★ 12</div>
              </div>

              <div className="sjsj-month-summary-chips">
                <div>
                  <span className="sjsj-check">✓</span> 방향: 정리와 재배치
                </div>
                <div>
                  <span className="sjsj-check">✓</span> 주의: 감정적 판단
                </div>
                <div>
                  <span style={{ color: '#fdba74', marginRight: '4px' }}>▷</span> 활용: 존버 설계
                </div>
              </div>

              <p className="sjsj-long-text">
                이번 달은 '삶을 연결시킨 영감이 커지는 해. 비참하고 지지부진한 부분들을 정리하고
                치장할 넘기 힘든 기회를 맞이하는 시기입니다. 좋은 기회 체크 안하면 남에게 넘어갈 수
                있습니다. (사용자님의 기운에 맞춰 20문장 이상의 심층 분석 내용이 들어가는
                영역입니다...)
              </p>

              <div className="sjsj-card-footer">
                <div className="sjsj-footer-msg">
                  🔥 핵심을 합쳐서 운기 던지는 대외적으로 좋은 에너지로 내.
                </div>
                <div className="sjsj-more-link">상세 분석 읽기 〉</div>
              </div>
            </div>
          </section>
          {/* 주제3 :주의해야할 달 */}
          <section className="sjsj-section">
            <div className="sjsj-section-label">
              <h2 className="sjsj-subTitle">주의할 점</h2>
              <p className="sjsj-label-main">2026년, 올해 당신에게 의미있는 달</p>
            </div>
            <div className="sjsj-grid sjsj-grid-2">
              <div className="sjsj-premium-card">
                <div className="sjsj-card-title">활용하면 좋을 달</div>
                <div className="sjsj-premium-card ">
                  <ul>
                    <li>
                      <p>1월</p>
                      <p>1월은 운이 들어오는 달입니다. 밖으로 많이 나가보세요</p>
                    </li>
                    <li>
                      <p>7월</p>
                      <p>7월은 새로운 사람을 많이 만나면 좋은 기운을 얻을 수 있어요</p>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="sjsj-premium-card active">
                <div className="sjsj-card-title">주의해야 할 달</div>
                <div className="sjsj-premium-card ">
                  <ul>
                    <li>
                      <p>4월</p>
                      <p>재물이 많이 나갈 수 있어요. 주의하세요.</p>
                    </li>
                    <li>
                      <p>12월</p>
                      <p>피로감이 몰려올 수 있습니다. 건강에 유의하세요.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default SajuReport;
