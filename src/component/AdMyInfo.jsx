import React, { useState } from 'react';
import FourPillarVis from './FourPillarVis';
import { useLanguage } from '../context/useLanguageContext';

const AdMyInfo = ({ birthData, isTimeUnknown, gender, saju }) => {
  const { language } = useLanguage();
  const { year, month, day, hour, minute } = birthData;
  const [openFourPillar, setOpenFourPillar] = useState(false);

  const texts = {
    ko: {
      title: '사주 분석 기준 정보',
      birthDate: '생년월일',
      birthTime: '출생시간',
      genderLabel: '성별',
      unknown: '알 수 없음',
      female: '여성',
      male: '남성',
      fold: '만세력 접기',
      view: '만세력 보기',
      pillarTitle: '나의 사주 원국',
      year: '년',
      month: '월',
      day: '일'
    },
    en: {
      title: 'Saju Analysis Reference Info',
      birthDate: 'Birth Date',
      birthTime: 'Birth Time',
      genderLabel: 'Gender',
      unknown: 'Unknown',
      female: 'Female',
      male: 'Male',
      fold: 'Hide Chart',
      view: 'View Chart',
      pillarTitle: 'My Saju Pillars',
      year: '-',
      month: '-',
      day: ''
    }
  };

  const t = texts[language] || texts.ko;

  return (
    <div className="w-full mx-auto p-4 bg-[#FFF5EE] rounded-3xl">
      <div className="bg-white border border-orange-100 rounded-[2rem] shadow-sm p-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">🦁</span>
          <h3 className="text-sm font-bold text-[#A0522D] tracking-tight">{t.title}</h3>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
          <ul className="space-y-3 w-full sm:w-auto">
            <li className="flex items-center gap-3 text-[15px] font-medium text-[#6F4E37]">
              <span className="w-1 h-1 bg-orange-300 rounded-full" />
              <span className="w-16 text-orange-400 text-[13px] font-bold">{t.birthDate}</span>
              <span className="font-bold">
                {language === 'ko' 
                  ? `${year}년 ${month}월 ${day}일`
                  : `${month}/${day}/${year}`
                }
              </span>
            </li>

            <li className="flex items-center gap-3 text-[15px] font-medium text-[#6F4E37]">
              <span className="w-1 h-1 bg-orange-300 rounded-full" />
              <span className="w-16 text-orange-400 text-[13px] font-bold">{t.birthTime}</span>
              <span className="font-bold">
                {isTimeUnknown ? t.unknown : `${hour}:${minute}`}
              </span>
            </li>

            <li className="flex items-center gap-3 text-[15px] font-medium text-[#6F4E37]">
              <span className="w-1 h-1 bg-orange-300 rounded-full" />
              <span className="w-16 text-orange-400 text-[13px] font-bold">{t.genderLabel}</span>
              <span className="font-bold">{gender === 'female' ? t.female : t.male}</span>
            </li>
          </ul>

          <button
            onClick={() => setOpenFourPillar(!openFourPillar)}
            className={`
              flex items-center gap-1 transition-all duration-200 px-4 py-2 rounded-full text-[13px] font-bold shadow-sm border w-full sm:w-auto justify-center
              ${
                openFourPillar
                  ? 'bg-[#FF7F50] text-white border-[#FF7F50]'
                  : 'bg-[#FFF0E0] text-[#FF7F50] border-orange-100 hover:bg-[#FFE4C4]'
              }
            `}
          >
            {openFourPillar ? t.fold : t.view}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform duration-200 ${
                openFourPillar ? 'rotate-180' : 'rotate-0'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {openFourPillar && (
        <div className="mt-4 bg-white border border-orange-100 rounded-[2rem] shadow-[0_10px_30px_-15px_rgba(255,165,0,0.1)] p-8 relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none">
            <span className="text-8xl">🦁</span>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-1 bg-orange-100 rounded-full mb-4" />
            <div className="flex items-center gap-2">
              <h4 className="text-[15px] font-black text-[#A0522D]">{t.pillarTitle}</h4>
              <span className="px-2 py-0.5 bg-orange-50 text-orange-400 text-[10px] font-bold rounded-md border border-orange-100">
                EIGHT CHARACTERS
              </span>
            </div>
          </div>

          <div className="relative z-10">
            <FourPillarVis saju={saju} isTimeUnknown={isTimeUnknown} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdMyInfo;
