import React, { useState, useEffect } from 'react';
import { GlobeAmericasIcon } from '@heroicons/react/24/outline';

const COUNTRIES = [
  '대한민국 (South Korea)',
  '미국 (USA)',
  '일본 (Japan)',
  '중국 (China)',
  '캐나다 (Canada)',
  '베트남 (Vietnam)',
  '필리핀 (Philippines)',
  '태국 (Thailand)',
  '영국 (UK)',
  '프랑스 (France)',
  '독일 (Germany)',
  '호주 (Australia)',
  '직접 입력 (Direct Input)',
];

export default function CityInput({ value, onChange, language = 'ko', className = '', name = 'birthCity' }) {
  const [selected, setSelected] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [isDirect, setIsDirect] = useState(false);

  // 초기값 파싱
  useEffect(() => {
    if (value) {
      if (COUNTRIES.includes(value)) {
        setSelected(value);
        setIsDirect(false);
      } else {
        setSelected('직접 입력 (Direct Input)');
        setCustomInput(value);
        setIsDirect(true);
      }
    }
  }, [value]);

  const handleSelect = (e) => {
    const val = e.target.value;
    setSelected(val);
    if (val === '직접 입력 (Direct Input)') {
      setIsDirect(true);
      setCustomInput('');
      onChange({ target: { name, value: '' } });
    } else {
      setIsDirect(false);
      onChange({ target: { name, value: val } });
    }
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomInput(val);
    onChange({ target: { name, value: val } });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <GlobeAmericasIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <select
          value={selected}
          onChange={handleSelect}
          className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-10 py-3.5 text-gray-800 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
        >
          <option value="" disabled>
            {language === 'ko' ? '태어난 국가 선택' : 'Select Birth Country'}
          </option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
          ▼
        </div>
      </div>

      {isDirect && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-300">
          <input
            type="text"
            value={customInput}
            onChange={handleCustomChange}
            placeholder={language === 'ko' ? '국가/도시 입력 (예: 뉴욕)' : 'Country/City (e.g. New York)'}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
