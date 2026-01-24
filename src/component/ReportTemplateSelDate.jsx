import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { reportStyleSimple } from '../data/aiResultConstants';
import { useLanguage } from '../context/useLanguageContext';
import { useAuthContext } from '../context/useAuthContext';
import { toymdt, parseAiResponse } from '../utils/helpers';
import { useLoading } from '../context/useLoadingContext';

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

  // --- 인앱 브라우저 대응 로직 ---
  const handleAction = async (sajuStr, from) => {
    const targetUrl = window.location.origin;
    const ua = navigator.userAgent.toLowerCase();

    // 1. 로그 저장 (백그라운드)
    const logId = `${new Date().getTime()}_${Math.random().toString(36).substr(2, 5)}`;
    setDoc(doc(db, 'copy_url_logs', logId), {
      saju: sajuStr || 'unknown',
      language: language,
      origin: from,
      createdAt: serverTimestamp(),
    }).catch(e => console.error('Log error:', e));

    // 2. 환경별 이동
    if (ua.includes('kakaotalk')) {
      window.location.href = `kakaotalk://web/openExternalApp?url=${encodeURIComponent(targetUrl)}`;
      return;
    }

    if (ua.includes('instagram') || ua.includes('fbav')) {
      try {
        await navigator.clipboard.writeText(targetUrl);
      } catch (e) {
        const t = document.createElement("input");
        t.value = targetUrl;
        document.body.appendChild(t);
        t.select();
        document.execCommand("copy");
        document.body.removeChild(t);
      }
      setShowGuide(true);
      return;
    }

    window.location.href = '/';
  };

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

        {/* --- 결제/공유 유도 섹션 추가 --- */}
        <section className="mt-12 mb-8 px-2 animate-up">
          <div className="bg-[#FEFAF7] rounded-[32px] border border-orange-100 p-8 text-center shadow-sm">
            <h3 className="text-[#3A322F] text-lg font-bold mb-2">
              {language === 'en' ? 'Get Premium Version' : '더 자세한 프리미엄 분석'}
            </h3>
            <p className="text-[#6D625B] text-sm mb-6 leading-relaxed">
              {language === 'en' 
                ? 'Check out all auspicious dates for the year.' 
                : '올해의 모든 길일과 상세 시간대 분석을\n무료 이벤트로 확인해보세요.'}
            </p>
            <button
              onClick={() => handleAction(`${saju.sky1}${saju.grd1}`, 'report_bottom')}
              className="w-full h-[56px] bg-[#3A322F] text-white rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              {language === 'en' ? 'View Full Report' : '전체 리포트 무료로 받기'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" /></svg>
            </button>
          </div>
        </section>
      </main>

      {/* 가이드 오버레이 */}
      {showGuide && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex flex-col items-end pt-4 pr-6" onClick={() => setShowGuide(false)}>
          <div className="text-white text-right animate-bounce mb-4">
            <p className="text-lg font-bold">여기 버튼을 클릭!</p>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="ml-auto transform rotate-[270deg]"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="w-full px-6 mt-20 text-center">
            <div className="bg-white rounded-[32px] p-8">
              <p className="font-bold text-xl mb-2 text-stone-900">주소 복사 완료!</p>
              <p className="text-sm text-stone-500 mb-6 leading-relaxed">인스타그램에서는 결제가 원활하지 않을 수 있습니다.<br/>복사된 주소를 <b>Safari</b>나 <b>Chrome</b>에 붙여넣어 주세요.</p>
              <button className="w-full py-4 bg-[#3A322F] text-white rounded-2xl font-bold">알겠습니다</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}