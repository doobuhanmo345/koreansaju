import React, { useEffect, useState } from 'react';
import { reportStyleSimple } from '../data/aiResultConstants';
import { useLanguage } from '../context/useLanguageContext';
import { useAuthContext } from '../context/useAuthContext';
import { toymdt, parseAiResponse } from '../utils/helpers';
import { useLoading } from '../context/useLoadingContext';
import AfterReport from './AfterReport';
import { calculateSaju } from '../utils/sajuCalculator';

export default function ReportTemplateSelBirth() {
  const { aiResult, lastParams } = useLoading();
  const { language } = useLanguage();
  const { userData } = useAuthContext();
  const { displayName, birthDate, saju } = userData;
  const [data, setData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
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

  if (!data) return <div className="p-10 text-center text-stone-400">{language === 'ko' ? '운명의 지도를 그리는 중...' : 'Charting the destiny map...'}</div>;

  // AI 응답(data)에 정보가 없거나 'unknown'일 경우를 대비해 저장된 메타데이터나 현재 세션 파라미터에서 가져옴
  const savedHistory = userData?.usageHistory?.ZSelBirth;
  
  // 1순위: 현재 세션 파라미터(lastParams), 2순위: AI 응답, 3순위: 히스토리 메타데이터
  const partnerBirthRaw = (lastParams?.partnerBirthDate) || (data.partnerBirthDate && data.partnerBirthDate !== 'unknown' ? data.partnerBirthDate : (savedHistory?.partnerBirthDate || ''));
  
  const partnerTimeUnknown = lastParams?.partnerTimeUnknown !== undefined 
    ? lastParams.partnerTimeUnknown 
    : (data.partnerTimeUnknown !== undefined ? data.partnerTimeUnknown : (savedHistory?.partnerTimeUnknown || false));

  const partnerSaju = partnerBirthRaw 
    ? calculateSaju(partnerBirthRaw, partnerTimeUnknown) 
    : null;

  const partnerBirth = partnerBirthRaw.split('T')[0];

  // 부모 정보 분류
  const userGender = userData?.gender?.toLowerCase();
  const isFemaleUser = userGender === 'female';

  const motherBirth = (isFemaleUser ? birthDate : partnerBirth)?.split('T')[0];
  const fatherBirth = (isFemaleUser ? partnerBirth : birthDate)?.split('T')[0];

  console.log('👶 SelBirth Profile:', { userGender, isFemaleUser, motherBirth, fatherBirth, savedPartnerBirth: savedHistory?.partnerBirthDate });

  return (
    <div className={`rt-container ${isLoaded ? 'is-active' : ''}`}>
      <style>{reportStyleSimple}</style>

      {/* HEADER */}
      <header className="rt-header">
        <div className="rt-tag animate-up">BIRTH DATE SELECTION</div>
        <h1 className="rt-main-title animate-up">
           {language === 'en' ? 'Gift of Destiny for' : '아기를 위한 최고의 선물'}
          <br />
          <span className="text-highlight">
            {language === 'en' ? 'Baby Birth Selection' : '명품 출산 택일'}
          </span>
        </h1>
        <p className="rt-desc animate-up">
          {language === 'en'
            ? 'Selecting the most auspicious birth dates for a bright future.'
            : '소중한 아이가 세상의 축복을 안고 태어날 수 있는 최고의 날짜를 선별했습니다.'}
        </p>
      </header>

      {/* PROFILE SECTION - Unified Design */}
      <section className="rt-section rt-profile animate-up">
        <div className="rt-id-card border-emerald-500/20 shadow-xl shadow-emerald-900/5">
          <div className="rt-id-card__header !bg-emerald-600/5 py-4">
             <span className="rt-id-card__name flex items-center gap-2">
                <span className="text-xl">👶</span>
                {language === 'ko' ? '출산 분석 대상' : 'Analysis Target'}
             </span>
             <span className="rt-id-card__label !bg-emerald-600 !text-white !opacity-100">PREMIUM</span>
          </div>
          
          <div className="rt-id-card__body p-6 space-y-5">
            {/* 1. 출산 예정일 & 성별 */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-50 dark:border-white/5">
                <div className="rt-info-row !flex-col !items-start gap-1">
                  <span className="rt-info-row__label !mb-0">{language === 'ko' ? '출산 예정일' : 'DUE DATE'}</span>
                  <span className="rt-info-row__value font-black text-emerald-600 text-lg">
                    {data.dueDate || '-'}
                  </span>
                </div>
                <div className="rt-info-row !flex-col !items-start gap-1 text-right">
                  <span className="rt-info-row__label !mb-0 self-end">{language === 'ko' ? '아이 성별' : "BABY'S GENDER"}</span>
                  <span className="rt-info-row__value font-black text-slate-800 dark:text-slate-200 text-lg self-end uppercase">
                    {data.babyGender || (language === 'ko' ? '성별모름' : 'Unknown')}
                  </span>
                </div>
            </div>
            

            {/* 2. 부모 정보 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <div className="flex flex-col">
                   <span className="rt-info-row__label !mb-0">{language === 'ko' ? '어머니' :  'MOTHER'}</span>

                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{motherBirth || '-'}</span>
                 </div>
                 <div className="flex flex-col text-right">
                   <span className="rt-info-row__label !mb-0">{language === 'ko' ? '아버지' : 'FATHER'}</span>
                  
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{fatherBirth || '-'}</span>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <main className="rt-main-content">
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '01. Destiny Overview' : '01. 아이의 운명 개요'}
          </h2>
          <div className="rt-ootd-wrapper mb-4">
             <div className="rt-ootd-item">
              <span className="rt-ootd-item__label">FOCUS</span>
              <span className="rt-ootd-item__value">{data.keyword || (language === 'ko' ? '건강/재물/명예' : 'Health/Wealth/Honor')}</span>
            </div>
          </div>
          <p className="rt-card__text">{data.overview}</p>
        </section>

        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '02. Recommended Birth Dates' : '02. 추천 출산일 Best'}
          </h2>
          <div className="space-y-6">
            {data.bestDates && data.bestDates.map((item, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                   <span className="text-4xl">👶</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{item.date}</span>
                  <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded shadow-sm">
                    TOP {idx + 1}
                  </span>
                </div>
                 <div className="flex gap-2 mb-3">
                    {/* 가상의 사주 팔자 예시가 있다면 보여주거나, 등급 표시 */}
                    {item.grade && <span className="text-xs font-bold text-amber-500">★ {item.grade}</span>}
                 </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                    <span className="font-bold mr-2 text-slate-900 dark:text-white block mb-1">{language === 'en' ? 'Destiny Analysis' : '사주 분석'}</span>
                    {item.reason}
                </p>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700 mt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-bold mr-2 text-emerald-500">Future</span>
                        {item.tip}
                    </p>
                </div>
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
