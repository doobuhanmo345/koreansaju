import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { reportStyleSimple } from '../data/aiResultConstants';
import { useLanguage } from '../context/useLanguageContext';
import { useAuthContext } from '../context/useAuthContext';
import { toymdt, parseAiResponse } from '../utils/helpers';
import { useLoading } from '../context/useLoadingContext';
import AfterReport from './AfterReport';

export default function ReportTemplateSelDate() {
  const { aiResult } = useLoading();
  const { language } = useLanguage();
  const { userData } = useAuthContext();
  const { displayName, birthDate, saju, isTimeUnknown } = userData;
  const [data, setData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGuide, setShowGuide] = useState(false); // 인스타 가이드용
  const bd = toymdt(birthDate);

  useEffect(() => {
    if (aiResult) {
      const parsedData = parseAiResponse(aiResult);
      if (parsedData) {
        setData(parsedData);
      }
    }
  }, [aiResult]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);



  if (!data) return <div className="p-10 text-center text-stone-400">결과를 불러오는 중이거나 데이터가 없습니다.</div>;

  return (
    <div className={`rt-container ${isLoaded ? 'is-active' : ''}`}>
      <style>{reportStyleSimple}</style>

      {/* HEADER */}
      <header className="rt-header">
        <div className="rt-tag animate-up">AUSPICIOUS DATE REPORT</div>
        <h1 className="rt-main-title animate-up">
          {displayName}{language === 'en' ? "'s" : '님을 위한'}
          <br />
          <span className="text-highlight">
            {language === 'en' ? 'Best Date Selection' : '맞춤 택일 리포트'}
          </span>
        </h1>
        <p className="rt-desc animate-up">
          {language === 'en'
            ? 'Optimal dates selected based on your destiny energy.'
            : '당신의 사주 에너지 흐름에 가장 적합한 길일을 선별했습니다.'}
        </p>
      </header>

      {/* PROFILE SECTION */}
      <section className="rt-section rt-profile animate-up">
        <div className="rt-id-card">
          <div className="rt-id-card__header">
            <span className="rt-id-card__name">{displayName}</span>
            <span className="rt-id-card__label">PERSONAL ID</span>
          </div>
          <div className="rt-id-card__body">
            <div className="rt-info-row">
              <span className="rt-info-row__label">BIRTH</span>
              <span className="rt-info-row__value">
                {bd.year}.{bd.month}.{bd.day} {isTimeUnknown || <>/{bd.time}</>}
              </span>
            </div>
            <div className="rt-saju-grid">
              <div className="rt-saju-grid__item"><span>Year</span>{saju.sky3} {saju.grd3}</div>
              <div className="rt-saju-grid__item"><span>Month</span>{saju.sky2} {saju.grd2}</div>
              <div className="rt-saju-grid__item"><span>Day</span>{saju.sky1} {saju.grd1}</div>
              {saju.grd0 && <div className="rt-saju-grid__item"><span>Hour</span>{saju.sky0} {saju.grd0}</div>}
            </div>
          </div>
        </div>
      </section>

      <main className="rt-main-content">
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '01. Purpose & Flow' : '01. 택일 범위와 기운의 목적'}
          </h2>
          <div className="rt-ootd-wrapper mb-4">
            <div className="rt-ootd-item">
              <span className="rt-ootd-item__label">PURPOSE</span>
              <span className="rt-ootd-item__value">{data.purpose}</span>
            </div>
            <div className="rt-ootd-item">
              <span className="rt-ootd-item__label">KEYWORD</span>
              <span className="rt-ootd-item__value">{data.keyword}</span>
            </div>
          </div>
          <p className="rt-card__text">{data.overview}</p>
        </section>

        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '02. Top Recommendations' : '02. 최적의 날짜 추천'}
          </h2>
          <div className="space-y-4">
            {data.bestDates && data.bestDates.map((item, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex flex-col gap-2 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-rose-500">{item.date}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-white dark:bg-slate-700 rounded shadow-sm border border-slate-200 dark:border-slate-600">
                    Top {idx + 1}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-bold mr-2">Why?</span>{item.reason}</p>
                <p className="text-xs text-slate-500"><span className="font-bold mr-2">Tip</span>{item.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {data.caution && (
          <section className="rt-card animate-up">
            <h2 className="rt-card__title">{language === 'en' ? '03. Dates to Avoid' : '03. 피해야 할 시기'}</h2>
            <div className="rt-analysis-list__item is-warning"><p>{data.caution}</p></div>
          </section>
        )}

       <AfterReport/>
      </main>

    </div>
  );
}