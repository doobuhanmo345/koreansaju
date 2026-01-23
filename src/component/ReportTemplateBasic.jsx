import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

import { calculateSajuData, createPromptForGemini } from '../utils/sajuLogic';
import { reportStyleBlue, reportStyleSimple } from '../data/aiResultConstants';
import { toymdt } from '../utils/helpers';
import { UI_TEXT, ENG_MAP } from '../data/saju_data';
import { ILJU_DATA, ILJU_DATA_EN } from '../data/ilju_data';
import { fetchGeminiAnalysis } from '../api/gemini';
import FourPillarVis from '../component/FourPillarVis';
import { useLanguage } from '../context/useLanguageContext';
import { useAuthContext } from '../context/useAuthContext';
import { aiSajuStyle } from '../data/saju_data_prompt';
import { useLoading } from '../context/useLoadingContext';
import AfterReport from './AfterReport';

const ReportTemplateBasic = ({}) => {
  const { aiResult } = useLoading();
  const { language } = useLanguage();
  const { userData } = useAuthContext();
  const { displayName, birthDate, isTimeUnknown, gender } = userData;
  const [data, setData] = useState(null); // 파싱된 데이터를 담을 로컬 상태
  const bd = toymdt(birthDate);
  const scrollElRef = useRef(null);

  if (!userData) return <div className="p-10 text-center">유저 정보를 불러오는 중입니다...</div>;

  const inputDate = birthDate && birthDate.includes('T') ? birthDate : `${birthDate}T00:00`;

  const [sajuData, setSajuData] = useState(null);

  const parseAiResponse = (rawString) => {
    if (!rawString) return null;

    console.log('🛠️ 파싱 시도할 원본 문자열:', rawString);

    try {
      // 1. 마크다운 코드 블록 제거 및 불필요한 공백 제거
      const cleaned = rawString
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 눈에 안 보이는 제어 문자 제거
        .trim();

      return JSON.parse(cleaned);
    } catch (error) {
      console.error('❌ 1차 파싱 실패 (cleaned):', error.message);

      try {
        // 2. 정규식으로 { } 내용만 추출해서 다시 시도
        const jsonMatch = rawString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log('🧐 정규식 추출 성공, 2차 파싱 시도...');
          return JSON.parse(jsonMatch[0]);
        }
      } catch (innerError) {
        console.error('❌ 2차 파싱 실패 (regex):', innerError.message);
        return null;
      }
      return null;
    }
  };

  useEffect(() => {
    if (aiResult) {
      const parsedData = parseAiResponse(aiResult);
      if (parsedData) {
        setData(parsedData); // 파싱 성공 시 데이터 세팅
      }
    }
  }, [aiResult]); // aiResult가 업데이트될 때마다 실행

  // 1. 함수 정의를 하나로 통합 (useCallback을 써도 좋지만 간단하게 외부에 정의 가능)

  const isEn = language === 'en';
  const t = (char) => (isEn ? ENG_MAP[char] || char : char);

  useEffect(() => {
    if (inputDate) {
      const data = calculateSajuData(inputDate, gender, isTimeUnknown, language);
      setSajuData(data);
    }
  }, [inputDate, gender, isTimeUnknown, language]);

  if (!sajuData) return <div className="p-10 text-center animate-pulse">데이터 계산 중...</div>;

  const { saju, pillars, ohaengCount } = sajuData;
  const iljuKey = pillars.day;
  const iljuInfo = isEn ? ILJU_DATA_EN[iljuKey] || {} : ILJU_DATA[iljuKey] || {};
  const iljuTitle = iljuInfo?.title?.[gender]?.title || iljuKey;
  const iljuDescText = iljuInfo?.title?.[gender]?.desc || '';
  // console.log(daewoonList?.slice(1,10));

  const getBarColor = (type) =>
    ({
      wood: 'bg-green-500',
      fire: 'bg-red-500',
      earth: 'bg-yellow-500',
      metal: 'bg-slate-400',
      water: 'bg-blue-600',
    })[type];
  // const data = {
  //   summary: {
  //     title: '사주를 한 줄로 요약하는 강렬한 제목',
  //     desc: '당신의 타고난 본질과 기운의 흐름에 대한 심층 요약 설명',
  //   },
  //   keywords: ['핵심키워드1', '핵심키워드2', '핵심키워드3'],
  //   overview: {
  //     desc: '인생 전반의 에너지 흐름과 당신이 가진 잠재력에 대한 개요',
  //   },
  //   wealth: {
  //     summary: '재물운에 대한 한 줄 요약',
  //     desc: '타고난 재복과 돈을 모으는 전략, 투자 성향 분석',
  //   },
  //   job: {
  //     summary: '직업/성공운에 대한 한 줄 요약',
  //     desc: '어울리는 직업군, 조직 내에서의 위치, 사회적 성취의 시기',
  //   },
  //   love: {
  //     summary: '애정/인연운에 대한 한 줄 요약',
  //     desc: '이상적인 배우자상, 연애 스타일, 관계를 유지하는 팁',
  //   },
  //   health: {
  //     summary: '건강/에너지에 대한 한 줄 요약',
  //     desc: '주의해야 할 신체 부위와 오행의 불균형을 맞추는 건강 관리법',
  //   },
  //   daewoon: [
  //     { name: '현재 대운/시기 명칭', interpretation: '해당 시기의 주요 변화와 마음가짐' },
  //     { name: '다음 대운/시기 명칭', interpretation: '앞으로 다가올 변화의 파도와 준비할 점' },
  //     { name: '이후 대운 명칭', interpretation: '인생의 중후반기 흐름 분석' },
  //     { name: '이후 대운 명칭', interpretation: '인생의 흐름 분석' },
  //     { name: '이후 대운 명칭', interpretation: '인생의 흐름 분석' },
  //     { name: '이후 대운 명칭', interpretation: '인생의 흐름 분석' },
  //     { name: '이후 대운 명칭', interpretation: '인생의 흐름 분석' },
  //   ],
  //   finalConclusion: {
  //     title: '당신을 위한 마스터의 최종 제언',
  //     desc: '리포트를 마무리하며 당신이 지금 즉시 실천해야 할 삶의 태도',
  //   },
  // };

  return (
    <div
      className="max-w-2xl rt-container mx-auto flex flex-col items-center transition-colors p-4"
      ref={scrollElRef}
    >
      {/* 1. 명식 카드 */}
      <style>{reportStyleSimple}</style>
      <div className="bg-white dark:bg-slate-800 w-full rounded-xl shadow-xl overflow-hidden mb-8 border border-slate-100 dark:border-slate-700">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="p-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>{inputDate.split('T')[0]}</span>
              <span>{gender === 'male' ? (isEn ? 'Male' : '남성') : isEn ? 'Female' : '여성'}</span>
            </div>
            <div className="border-t border-dashed border-indigo-100 dark:border-slate-600 w-full my-2"></div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                { label: UI_TEXT.year[language], gan: saju.sky3, zhi: saju.grd3 },
                { label: UI_TEXT.month[language], gan: saju.sky2, zhi: saju.grd2 },
                { label: UI_TEXT.day[language], gan: saju.sky1, zhi: saju.grd1, highlight: true },
                {
                  label: UI_TEXT.hour[language],
                  gan: saju.sky0,
                  zhi: saju.grd0,
                  unknown: isTimeUnknown,
                },
              ].map(
                (item, i) =>
                  !item.unknown && (
                    <div
                      key={i}
                      className={`flex flex-col items-center ${item.highlight ? 'relative' : ''}`}
                    >
                      {item.highlight && (
                        <div className="absolute inset-0 bg-indigo-100/50 dark:bg-indigo-500/30 blur-md rounded-full scale-150"></div>
                      )}
                      <span className="text-xs text-indigo-300 dark:text-indigo-400 uppercase mb-0.5 relative z-10">
                        {item.label}
                      </span>
                      <span
                        className={`text-lg font-extrabold tracking-widest leading-none relative z-10 ${item.highlight ? 'text-indigo-600 dark:text-indigo-300 text-xl' : 'text-indigo-900 dark:text-indigo-100'}`}
                      >
                        {t(item.gan)}
                        {t(item.zhi)}
                      </span>
                    </div>
                  ),
              )}
            </div>
            <div className="mt-4 flex justify-center">
              <FourPillarVis isTimeUnknown={isTimeUnknown} saju={saju} />
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
            {Object.entries(ohaengCount).map(([type, count]) => (
              <div
                key={type}
                style={{ width: `${(count / (isTimeUnknown ? 6 : 8)) * 100}%` }}
                className={getBarColor(type)}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
            {Object.keys(ohaengCount).map((k) => (
              <span key={k}>
                {ohaengCount[k] !== 0 && (
                  <>
                    {k.toUpperCase()} {ohaengCount[k]}
                  </>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. AI 분석 결과 */}
      <div
        id="share-card"
        className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6 text-center border border-indigo-50 dark:border-slate-700"
      >
        <div className="mb-4">
          <span className="text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase">
            WHO AM I?
          </span>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
            {iljuTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{iljuDescText}</p>
        </div>
        <div className="">
          {/* 내용시작 */}
          <div class="report-container">
            <section className="my-9">
              <h2 className="rt-card__title">
                {isEn ? 'Client Information' : <>{displayName}님의 정보</>}
              </h2>
              <div class="rt-id-card__body">
                <div class="rt-info-row">
                  <span class="rt-info-row__label">BIRTH</span>
                  <span class="rt-info-row__value">
                    {bd.year}.{bd.month}.{bd.day} {isTimeUnknown || <>/{bd.time}</>}
                  </span>
                </div>
                <div class="rt-info-row">
                  <span class="rt-info-row__label">GENDER</span>
                  <span class="rt-info-row__value">
                    {' '}
                    {isEn ? (
                      <span> {gender} </span>
                    ) : (
                      <span>{gender === ' male' ? ' 남성' : ' 여성'}</span>
                    )}
                  </span>
                </div>

                <div class="rt-saju-grid">
                  {isTimeUnknown || (
                    <div class="rt-saju-grid__item">
                      <span>시</span>
                      {saju.sky0}
                      {saju.grd0}
                    </div>
                  )}

                  <div class="rt-saju-grid__item">
                    <span>일</span>
                    {saju.sky1}
                    {saju.grd1}
                  </div>
                  <div class="rt-saju-grid__item">
                    <span>월</span>
                    {saju.sky2}
                    {saju.grd2}
                  </div>
                  <div class="rt-saju-grid__item">
                    <span>년</span>
                    {saju.sky3}
                    {saju.grd3}
                  </div>
                </div>
              </div>
            </section>
            <section className="my-9">
              <h2 className="rt-card__title">
                {isEn ? 'Saju Identity Summary' : '사주 정체성 요약'}
              </h2>

              <div class="rt-card__text text-left">{data.summary.desc}</div>
              <div className="my-3">
                <p class="rt-timing-grid__item">{data.summary.title}</p>
                <div className="gap-3 flex justify-center">
                  {data.keywords.map((keyword, idx) => (
                    <div key={idx} className="rt-id-card__label">
                      #{keyword}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="my-9">
              <h2 class="rt-card__title">
                {isEn ? 'Overview of Destiny by Topic' : '주제별 개요'}
              </h2>
              <p class="rt-card__text text-left">{data.overview.desc}</p>
            </section>

            <section className="my-9">
              <h2 class="rt-card__title">{isEn ? 'Detailed Interpretation' : '상세 해석 섹션'}</h2>

              <div className="rt-card">
                <div class="rt-ootd-item">
                  <h3 className="rt-ootd-item__value">{isEn ? 'Wealth & Finance' : '재물운'}</h3>
                  <p className="rt-ootd-item__label">{data.wealth.summary}</p>
                </div>
                <p class="rt-card__text text-left">{data.wealth.desc}</p>
              </div>
              <div className="rt-card">
                <div class="rt-ootd-item">
                  <h3 className="rt-ootd-item__value">{isEn ? 'Career & Success' : '직업운'}</h3>
                  <p className="rt-ootd-item__label">{data.job.summary}</p>
                </div>
                <p class="rt-card__text text-left">{data.job.desc}</p>
              </div>
              <div className="rt-card">
                <div class="rt-ootd-item">
                  <h3 className="rt-ootd-item__value">{isEn ? 'Love & Romance' : '애정운'}</h3>
                  <p className="rt-ootd-item__label">{data.love.summary}</p>
                </div>
                <p class="rt-card__text text-left">{data.love.desc}</p>
              </div>
              <div className="rt-card">
                <div class="rt-ootd-item">
                  <h3 className="rt-ootd-item__value">{isEn ? 'Health & Wellness' : '건강운'}</h3>
                  <p className="rt-ootd-item__label">{data.health.summary}</p>
                </div>
                <p class="rt-card__text text-left">{data.health.desc}</p>
              </div>
            </section>
            <section className="my-9">
              <h2 class="rt-card__title">{isEn ? 'Major Life Cycles' : '대운 해설'}</h2>
              <div class="rt-analysis-list__item gap-3">
                {data.daewoon.map((item, idx) => (
                  <div key={idx} className="rt-gap2">
                    <span className="rt-analysis-list__sub-title">{item.name}</span>
                    <p className="rt-card__text text-left">{item.interpretation}</p>
                  </div>
                ))}
              </div>
            </section>

            <section class="rt-card">
              <h2 class="rt-card__title">Final Conclusion</h2>
              <div class="rt-tip-box">
                <span class="rt-tip-box__label">{data.finalConclusion.title}</span>
                <p className="rt-card__text text-left">{data.finalConclusion.desc}</p>
              </div>
            </section>
          </div>
          {/* 내용끝 */}
        </div>
      </div>
      <AfterReport />
    </div>
  );
};

export default ReportTemplateBasic;
