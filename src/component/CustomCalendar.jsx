import React, { useMemo } from 'react';
import { COLOR_THEMES } from '../data/theme.js';

const CustomCalendar = ({ selectedDate, setSelectedDate, theme = 'rose' }) => {
  const activeTheme = COLOR_THEMES[theme] || COLOR_THEMES.rose;

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dateList = useMemo(() => {
    const dates = [];
    const startPoint = new Date(today);
    // 이번 주 일요일부터 시작
    startPoint.setDate(today.getDate() - today.getDay());

    // 5주(35일) 분량의 날짜 생성
    for (let i = 0; i < 35; i++) {
      const date = new Date(startPoint);
      date.setDate(startPoint.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [today]);

  // 수정된 부분: 선택된 날짜가 있으면 그 날짜를, 없으면 '오늘'을 기준으로 헤더 표시
  const displayDate = selectedDate || today;

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="w-full max-w-sm mx-auto p-8 bg-[#ffffff] dark:bg-slate-900 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-slate-50 dark:border-slate-800">
      {/* Header */}
      <div className="mb-10 flex justify-between items-baseline px-1">
        <h2 className="text-2xl font-light text-slate-900 dark:text-white tracking-tight transition-all duration-500">
          <span className="font-semibold">
            {displayDate.toLocaleString('en-US', { month: 'long' })}
          </span>
          <span className="text-slate-300 font-extralight ml-2">{displayDate.getFullYear()}</span>
        </h2>
        <div className={`h-2 w-2 rounded-full ${activeTheme.light} animate-pulse`} />
      </div>

      {/* 요일 표시 */}
      <div className="grid grid-cols-7 mb-6">
        {days.map((day, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-5">
        {dateList.map((date, idx) => {
          const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
          const isToday = today.toDateString() === date.toDateString();
          const isFirstDayOfMonth = date.getDate() === 1;
          const isPast = date < today;

          return (
            <div key={idx} className="relative flex justify-center items-center">
              {/* 월이 바뀌는 지점 (1일) 강조 표시 */}
              {isFirstDayOfMonth && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className={`w-[1px] h-2 ${activeTheme.light} mb-1`} />
                  <span
                    className={`text-[10px] font-black ${activeTheme.text} tracking-tighter uppercase whitespace-nowrap bg-white dark:bg-slate-900 px-1`}
                  >
                    {date.toLocaleString('en-US', { month: 'short' })}
                  </span>
                </div>
              )}

              <button
                type="button"
                disabled={isPast}
                onClick={() => setSelectedDate(date)}
                className={`
                  relative z-10 w-10 h-10 text-[13px] flex items-center justify-center rounded-full transition-all duration-300
                  ${
                    isSelected
                      ? `${activeTheme.point} text-white dark:text-slate-900 shadow-xl scale-110`
                      : isPast
                        ? 'text-slate-100 dark:text-slate-800 opacity-40 cursor-default'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }
                `}
              >
                <span className={isSelected ? 'font-bold' : 'font-medium'}>{date.getDate()}</span>
                {isToday && !isSelected && (
                  <span
                    className={`absolute bottom-1 w-3 h-[1.5px] ${activeTheme.light} rounded-full`}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendar;
