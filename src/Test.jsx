import { useState, useRef } from 'react';
import dayStem from '../src/data/dayStem.json';
import dayBranch from '../src/data/dayBranch.json';
import { useLanguage } from './context/useLanguageContext';

export default function Test() {

  const [saju, setSaju] = useState({ sky: '', ground: '' });
  const groundRef = useRef(null);

  const handleChange = (e, part) => {
    const value = e.target.value.slice(-1); // 마지막 한 글자만 허용
    setSaju((prev) => ({ ...prev, [part]: value }));

    // 천간(sky) 입력 시 지지(ground)로 자동 포커스 이동
    // if (part === 'sky' && value) {
    //   groundRef.current.focus();
    // }
  };
  const me_exp = dayStem.find((i) => i.name_kr === saju.sky);
  const me_exp_b = dayBranch.find((i) => i.name_kr === saju.ground);
  const { language } = useLanguage();
  return (
    <>
      <div className="flex flex-col items-center gap-4 py-6">
        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
          Input Your Saju (일주 입력)
        </label>

        <div className="flex items-center gap-3">
          {/* 천간 입력 (Sky) */}
          <div className="relative">
            <input
              type="text"
              value={saju.sky}
              onChange={(e) => handleChange(e, 'sky')}
              placeholder="甲"
              className="w-16 h-20 text-3xl font-black text-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
            />
            <span className="absolute -top-2 -right-2 bg-indigo-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
              天
            </span>
          </div>

          <span className="text-slate-300 font-light text-2xl">+</span>

          {/* 지지 입력 (Ground) */}
          <div className="relative">
            <input
              type="text"
              ref={groundRef}
              value={saju.ground}
              onChange={(e) => handleChange(e, 'ground')}
              placeholder="戌"
              className="w-16 h-20 text-3xl font-black text-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
            />
            <span className="absolute -top-2 -right-2 bg-emerald-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
              地
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          {saju.sky && saju.ground
            ? `${saju.sky}${saju.ground}일주를 분석합니다.`
            : '한 글자씩 입력해주세요.'}
        </p>
      </div>
      <div className="text-[15px] leading-relaxed dark:text-slate-300 ">
        {(language === 'ko' ? me_exp?.full_text_kr : me_exp?.full_text_en)
          ?.split('\n')
          ?.filter((text) => text.trim() !== '')
          .map((sentence, index) => (
            <p
              key={index}
              style={{
                fontWeight: index === 0 ? 'bold' : 'normal',
                fontSize: index === 0 ? '1.1rem' : '1rem', // 첫 줄만 살짝 키울 수도 있습니다
                marginBottom: '0.8rem',
              }}
            >
              {sentence}
            </p>
          ))}
      </div>
      <div className="text-[15px] leading-relaxed dark:text-slate-300 ">
        {(language === 'ko' ? me_exp_b?.full_text_kr : me_exp_b?.full_text_en)
          ?.split('\n')
          ?.filter((text) => text.trim() !== '')
          .map((sentence, index) => (
            <p
              key={index}
              style={{
                fontWeight: index === 0 ? 'bold' : 'normal',
                fontSize: index === 0 ? '1.1rem' : '1rem', // 첫 줄만 살짝 키울 수도 있습니다
                marginBottom: '0.8rem',
              }}
            >
              {sentence}
            </p>
          ))}
      </div>
    </>
  );
}
