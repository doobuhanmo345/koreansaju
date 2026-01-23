import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';
import { calculateSajuData, createPromptForGemini } from '../utils/sajuLogic';
import {
  UI_TEXT,
  ENG_MAP,
  SHIP_SUNG_TABLE,
  SHIP_SUNG_MAP,
  PILLAR_DETAILS, // 🔴 여기서 불러옵니다
} from '../data/saju_data';
import { ILJU_DATA, ILJU_DATA_EN } from '../data/ilju_data';
import { fetchGeminiAnalysis } from '../api/gemini';
import FourPillarVis from '../component/FourPillarVis';
import { useLanguage } from '../context/useLanguageContext';
import { useAuthContext } from '../context/useAuthContext';
import { aiSajuStyle } from '../data/saju_data_prompt';

const SajuResult = ({ aiResult }) => {
  const { userData } = useAuthContext();
  const { language } = useLanguage();
  const activeTabRef = useRef(0);
  const scrollElRef = useRef(null);

  if (!userData) return <div className="p-10 text-center">유저 정보를 불러오는 중입니다...</div>;

  const { birthDate, gender, isTimeUnknown } = userData;
  const inputDate = birthDate && birthDate.includes('T') ? birthDate : `${birthDate}T00:00`;
  const inputGender = gender;

  const [sajuData, setSajuData] = useState(null);
  const [selectedDae, setSelectedDae] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(aiResult);
  const [loading, setLoading] = useState(false);
  const pureHtml = useMemo(() => {
    if (!aiAnalysis) return '';
    let cleanedResponse = aiAnalysis.trim();
    const startMarker = /^\s*```html\s*|^\s*```\s*/i;
    const endMarker = /\s*```\s*$/;
    cleanedResponse = cleanedResponse.replace(startMarker, '').replace(endMarker, '');
    return cleanedResponse.trim();
  }, [aiAnalysis]);
  // 1. 함수 정의를 하나로 통합 (useCallback을 써도 좋지만 간단하게 외부에 정의 가능)
  const handleSubTitleClick = (index) => {
    if (index === undefined) index = activeTabRef.current;
    activeTabRef.current = index;

    const container = scrollElRef.current;

    if (!container) return;

    const tiles = container.querySelectorAll('.subTitle-tile');
    const cards = container.querySelectorAll('.report-card');

    if (tiles.length === 0) return;

    tiles.forEach((t) => t.classList.remove('active'));
    cards.forEach((c) => {
      c.style.display = 'none';
      c.classList.remove('active');
    });

    if (tiles[index]) tiles[index].classList.add('active');
    if (cards[index]) {
      cards[index].style.display = 'block';
      cards[index].classList.add('active');
    }
  };

  const isEn = language === 'en';
  const t = (char) => (isEn ? ENG_MAP[char] || char : char);

  // ---------------------------------------------------------------------
  // [대운 상세 해석 함수] - 데이터 파일 활용 버전
  // ---------------------------------------------------------------------
  const getDaewoonStory = (selectedDae, language, pillars) => {
    const isEn = language === 'en';

    if (!selectedDae || !pillars || !pillars.day) {
      return isEn ? 'Loading luck cycle data...' : '대운 정보를 불러오는 중입니다...';
    }

    const userGan = pillars.day.charAt(0);
    const name = selectedDae.name || selectedDae.pillar || '';
    const startAge = selectedDae.startAge || selectedDae.age || 0;
    const endAge = selectedDae.endAge || Number(startAge) + 9;
    const dGanKor = selectedDae.ganKor || (name ? name.charAt(0) : '');
    const ganO = selectedDae.ganOhaeng || '';
    const zhiO = selectedDae.zhiOhaeng || '';

    // 1. 십성 계산 (saju_data.js에서 가져온 테이블 사용)
    const calculatedShipSung = SHIP_SUNG_TABLE[userGan]?.[dGanKor] || '대운';

    // 2. 십성 설명 (saju_data.js에서 가져옴)
    const shipSungDetail = SHIP_SUNG_MAP[calculatedShipSung]
      ? isEn
        ? SHIP_SUNG_MAP[calculatedShipSung].en
        : SHIP_SUNG_MAP[calculatedShipSung].ko
      : '개인적 성장';

    // 3. 오행 맵
    const ohaengMap = {
      wood: isEn ? 'Wood' : '나무(木)',
      fire: isEn ? 'Fire' : '불(火)',
      earth: isEn ? 'Earth' : '흙(土)',
      metal: isEn ? 'Metal' : '금(金)',
      water: isEn ? 'Water' : '물(水)',
    };

    // 4. 60갑자 해석 (saju_data.js에서 가져옴)
    const currentNuance = PILLAR_DETAILS[name]
      ? isEn
        ? PILLAR_DETAILS[name].en
        : PILLAR_DETAILS[name].ko
      : isEn
        ? 'Significant transition.'
        : '중요한 변화의 시기입니다.';

    // 5. 텍스트 조립
    const introText = isEn
      ? `<b>Luck Cycle: ${name} (Age ${startAge} - ${endAge})</b>`
      : `<b>${name} 대운 (약 ${startAge}세 ~ ${endAge}세)</b>`;

    const shipSungText = isEn
      ? `The energy of <b>${calculatedShipSung}</b> is the primary driver, focusing on <b>${shipSungDetail}</b>.`
      : `당신의 운명에서 이 구간은 <b>${calculatedShipSung}</b>의 작용력이 가장 크게 나타납니다. 이는 <b>${shipSungDetail}</b>의 흐름이 주도하게 됨을 의미합니다.`;

    // 6. 충 계산 로직
    const clashKey = `${ganO}_${zhiO}`;
    const clashMap = {
      water_wood: 1,
      wood_fire: 1,
      fire_earth: 1,
      earth_metal: 1,
      metal_water: 1,
      wood_water: 1,
      fire_wood: 1,
      earth_fire: 1,
      metal_earth: 1,
      water_metal: 1,
    };
    const isClash = !(clashMap[clashKey] || ganO === zhiO);

    const environmentText = isEn
      ? `The interaction between ${ohaengMap[ganO] || ganO} and ${ohaengMap[zhiO] || zhiO} creates a <b>${isClash ? 'dynamic and innovative' : 'steady and supportive'}</b> environment.`
      : `천간의 ${ohaengMap[ganO] || ganO} 기운과 지지의 ${ohaengMap[zhiO] || zhiO} 기운이 만나는 이 환경은, <b>${isClash ? '역동적인 변화와 혁신을' : '안정적인 성장과 기반을'}</b> 만들어내는 소중한 바탕이 됩니다.`;

    return `
    <div style="line-height: 1.8; color: inherit; text-align: left; font-size: 15px; font-family: sans-serif;">
      <p style="margin-bottom: 12px; font-size: 16px;">${introText}</p>
      <p style="margin-bottom: 20px; font-weight: 500;">${currentNuance}</p>
      <p style="margin-bottom: 16px;">${shipSungText}</p>
      <p style="margin-bottom: 16px;">${environmentText}</p>
      <p style="margin-bottom: 8px; opacity: 0.8; font-size: 14px; border-top: 1px solid #eee; padding-top: 10px;">
        ${isEn ? '※ Interpretation based on traditional Saju principles.' : '※ 이 분석은 전통 명리학의 대운 흐름 분석 원리를 바탕으로 구성되었습니다.'}
      </p>
    </div>
  `;
  };
  // 컴포넌트 내부
  useEffect(() => {
    // 함수를 전역(window)에 등록
    window.handleSubTitleClick = handleSubTitleClick;

    // 컴포넌트가 언마운트될 때 메모리 누수 방지를 위해 삭제
    return () => {
      delete window.handleSubTitleClick;
    };
  }, [handleSubTitleClick]); // handleSubTitleClick이 변경될 때마다 갱신
  useEffect(() => {
    if (inputDate) {
      const data = calculateSajuData(inputDate, inputGender, isTimeUnknown, language);
      if (data) {
        setSajuData(data);
        if (data.currentDaewoon) setSelectedDae(data.currentDaewoon);
      }
    }
  }, [inputDate, inputGender, isTimeUnknown, language]);

  const handleShare = async (id) => {
    const el = document.getElementById(id);
    if (!el) {
      alert('Card not found');
      return;
    }
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: null });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'saju-result.png';
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  if (!sajuData) return <div className="p-10 text-center animate-pulse">데이터 계산 중...</div>;

  const { saju, pillars, ohaengCount, relations, myShinsal, daewoonList, currentAge } = sajuData;
  const iljuKey = pillars.day;
  const iljuInfo = isEn ? ILJU_DATA_EN[iljuKey] || {} : ILJU_DATA[iljuKey] || {};
  const iljuTitle = iljuInfo?.title?.[inputGender]?.title || iljuKey;
  const iljuDescText = iljuInfo?.title?.[inputGender]?.desc || '';
  // console.log(daewoonList?.slice(1,10));

  const getBarColor = (type) =>
    ({
      wood: 'bg-green-500',
      fire: 'bg-red-500',
      earth: 'bg-yellow-500',
      metal: 'bg-slate-400',
      water: 'bg-blue-600',
    })[type];

  return (
    <div
      className="max-w-2xl mx-auto flex flex-col items-center transition-colors p-4"
      ref={scrollElRef}
    >
      {/* 1. 명식 카드 */}

      <div className="bg-white dark:bg-slate-800 w-full rounded-xl shadow-xl overflow-hidden mb-8 border border-slate-100 dark:border-slate-700">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="p-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>{inputDate.split('T')[0]}</span>
              <span>
                {inputGender === 'male' ? (isEn ? 'Male' : '남성') : isEn ? 'Female' : '여성'}
              </span>
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
        <div className="prose prose-stone dark:prose-invert leading-loose text-justify text-sm mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-indigo-500 font-bold animate-pulse">
                {isEn ? 'AI is analyzing...' : 'AI가 분석 중입니다...'}
              </p>
            </div>
          ) : (
            <div>
              
              <div dangerouslySetInnerHTML={{ __html: pureHtml }} />
              <div dangerouslySetInnerHTML={{ __html: aiSajuStyle }} />
            </div>
          )}
        </div>
      </div>

      {/* 
      <button
        onClick={() => handleShare('share-card')}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
      >
        {isEn ? 'Save Result as Image' : '결과 이미지로 저장하기'}
      </button> */}
    </div>
  );
};

export default SajuResult;
