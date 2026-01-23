import React, { useEffect, useState } from 'react';
import { reportStyleSimple } from '../data/aiResultConstants';
import { useLanguage } from '../context/useLanguageContext';
import { useAuthContext } from '../context/useAuthContext';
import { toymdt } from '../utils/helpers';
import { useLoading } from '../context/useLoadingContext';
  import { parseAiResponse } from '../utils/helpers';
const ReportTemplateDate = (
  {
    // data = {
    //   meetingDate: '2026.01.25',
    //   temperature: '연락 중',
    //   section01: {
    //     mood: 'Library Intellectual',
    //     point: 'Silver Accessories & Sky Blue',
    //     description:
    //       '민지님, 오늘은 다정한 느낌보다 차분하고 지적인 무드가 핵심입니다. 실버 액세서리로 세련미를 더해보세요.',
    //   },
    //   section02: {
    //     innerThoughts: '상대는 지금 예의를 차리면서도 당신의 예상치 못한 반전 매력을 기대 중입니다.',
    //     warning: '딱딱한 일 얘기는 금물! 최근 본 영화나 취미 같은 가벼운 일상 이야기가 열쇠입니다.',
    //     signal: '눈맞춤이 3초 이상 지속되거나 질문을 3개 이상 먼저 던진다면 확실한 그린라이트입니다.',
    //   },
    //   section03: {
    //     chemistryScore: 92,
    //     goldenTime: '만남 후 2시간',
    //     location: '힙한 에스프레소 바',
    //   },
    //   section04: {
    //     contactAdvice:
    //       "민지님이 먼저 '오늘 즐거웠어요'라고 묻는 것이 관계 발전에 2배 더 빠른 운을 가져옵니다.",
    //     possibility: 'VERY HIGH',
    //   },
    // },
  },
) => {
  const { aiResult } = useLoading();
  const { language } = useLanguage();
  const { userData } = useAuthContext();
  const { displayName, birthDate, saju, isTimeUnknown } = userData;
  const [data, setData] = useState(null); // 파싱된 데이터를 담을 로컬 상태
  const [isLoaded, setIsLoaded] = useState(false);
  const bd = toymdt(birthDate);




  useEffect(() => {
    if (aiResult) {
      const parsedData = parseAiResponse(aiResult);
      if (parsedData) {
        setData(parsedData); // 파싱 성공 시 데이터 세팅
      }
    }
  }, [aiResult]); // aiResult가 업데이트될 때마다 실행

  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!data) return '결과없음';
  return (
    <div className={`rt-container ${isLoaded ? 'is-active' : ''}`}>
      <style>{reportStyleSimple}</style>

      {/* [RT-HEADER] 메인 타이틀 영역 */}
      <header className="rt-header">
        <div className="rt-tag animate-up">
          {language === 'en' ? 'PREMIUM ROMANCE DOSSIER' : 'PREMIUM ROMANCE DOSSIER'}
        </div>
        <h1 className="rt-main-title animate-up">
          {displayName}
          {language === 'en' ? "'s" : '님을 위한'}
          <br />
          <span className="text-highlight">
            {language === 'en' ? 'First Encounter Destiny Report' : '첫만남 운명 리포트'}
          </span>
        </h1>
        <p className="rt-desc animate-up">
          {language === 'en'
            ? 'A custom analysis combining your destiny energy with meeting data.'
            : '사주 에너지와 현재의 만남 데이터를 결합한 커스텀 분석입니다.'}
        </p>
      </header>

      {/* [RT-PROFILE] 유저 정보 카드 섹션 */}
      <section className="rt-section rt-profile animate-up">
        <div className="rt-id-card">
          <div className="rt-id-card__header">
            <span className="rt-id-card__name">{displayName}</span>
            <span className="rt-id-card__label">PERSONAL ID</span>
          </div>
          <div className="rt-id-card__body">
            <div className="rt-info-row">
              <span className="rt-info-row__label">{language === 'en' ? 'BIRTH' : 'BIRTH'}</span>
              <span className="rt-info-row__value">
                {bd.year}.{bd.month}.{bd.day}
                {isTimeUnknown || <>/{bd.time}</>}
              </span>
            </div>
            <div className="rt-info-row">
              <span className="rt-info-row__label">{language === 'en' ? 'DATE' : 'DATE'}</span>
              <span className="rt-info-row__value">{data.meetingDate}</span>
            </div>
            <div className="rt-info-row">
              <span className="rt-info-row__label">{language === 'en' ? 'STATUS' : 'STATUS'}</span>
              <span className="rt-info-row__value">{data.temperature}</span>
            </div>
            <div className="rt-saju-grid">
              {saju.grd0 && (
                <div className="rt-saju-grid__item">
                  <span>{language === 'en' ? 'Hour' : '시'}</span>
                  {saju.sky0} {saju.grd0}
                </div>
              )}

              <div className="rt-saju-grid__item">
                <span>{language === 'en' ? 'Day' : '일'}</span>
                {saju.sky1} {saju.grd1}
              </div>
              <div className="rt-saju-grid__item">
                <span>{language === 'en' ? 'Month' : '월'}</span>
                {saju.sky2} {saju.grd2}
              </div>
              <div className="rt-saju-grid__item">
                <span>{language === 'en' ? 'Year' : '년'}</span>
                {saju.sky3} {saju.grd3}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="rt-main-content">
        {/* 01. OOTD 가이드 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '01. Vibe & OOTD Strategy' : '01. 상대에게 각인될 OOTD 전략'}
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

        {/* 02. 심리 분석 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '02. Psychological Insights' : '02. 관계 심리 인사이트'}
          </h2>
          <div className="rt-analysis-list">
            <div className="rt-analysis-list__item">
              <span className="rt-analysis-list__sub-title">
                {language === 'en' ? "Partner's Inner Thoughts" : '상대의 속마음'}
              </span>
              <p>{data.section02.innerThoughts}</p>
            </div>
            <div className="rt-analysis-list__item is-warning">
              <span className="rt-analysis-list__sub-title">
                {language === 'en' ? 'Conversation Warnings' : '대화 주의사항'}
              </span>
              <p>{data.section02.warning}</p>
            </div>
            <div className="rt-analysis-list__item is-success">
              <span className="rt-analysis-list__sub-title">
                {language === 'en' ? 'Green Light Signals' : '확실한 호감 신호'}
              </span>
              <p>{data.section02.signal}</p>
            </div>
          </div>
        </section>

        {/* 03. 케미 지수 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '03. Chemistry & Timing' : '03. 케미스트리 & 타이밍'}
          </h2>
          <div className="rt-score-box">
            <div className="rt-score-box__label">
              {language === 'en' ? 'Interaction Chemistry Score' : '대화 티키타카 지수'}
            </div>
            <div className="rt-score-box__val">
              {data.section03.chemistryScore}
              <span>{language === 'en' ? 'pt' : '점'}</span>
            </div>
            <div className="rt-progress">
              <div
                className="rt-progress__fill"
                style={{ width: isLoaded ? `${data.section03.chemistryScore}%` : '0%' }}
              ></div>
            </div>
          </div>
          <div className="rt-timing-grid">
            <div className="rt-timing-grid__item">
              <span>{language === 'en' ? 'Golden Time' : '골든 타임'}</span>
              <strong>{data.section03.goldenTime}</strong>
            </div>
            <div className="rt-timing-grid__item">
              <span>{language === 'en' ? 'Recommended Place' : '추천 장소'}</span>
              <strong>{data.section03.location}</strong>
            </div>
          </div>
        </section>

        {/* 04. 애프터 가이드 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '04. After Guide & Future' : '04. 애프터 가이드 & 미래'}
          </h2>
          <div className="rt-tip-box">
            <span className="rt-tip-box__label">
              {language === 'en' ? 'Who should reach out first?' : '누가 먼저 연락할까?'}
            </span>
            <p>{data.section04.contactAdvice}</p>
          </div>
          <div className="rt-final-badge">
            {language === 'en' ? 'Possibility of Romance' : '연인 발전 가능성'}{' '}
            <span>{data.section04.possibility}</span>
          </div>
        </section>
      </main>

      <footer className="rt-footer animate-up">
        <button className="rt-btn-primary">
          {language === 'en' ? 'Save Full Report' : '전체 리포트 저장하기'}
        </button>
      </footer>
    </div>
  );
};

export default ReportTemplateDate;
