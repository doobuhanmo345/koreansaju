import React, { useState, useRef, useEffect } from 'react';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const BdInput = ({ 
  label, 
  value, 
  onChange, 
  isTimeUnknown, 
  setIsTimeUnknown, 
  language = 'ko',
  color = 'indigo' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar', 'year', 'month'
  const containerRef = useRef(null);

  // value format: YYYY-MM-DDTHH:mm
  const [datePart, timePart] = value.split('T');
  const selectedDate = datePart ? new Date(datePart) : new Date();
  const [viewDate, setViewDate] = useState(selectedDate);

  const themeColors = {
    indigo: {
      accent: 'text-indigo-600',
      bg: 'bg-indigo-600',
      lightBg: 'bg-indigo-50 dark:bg-indigo-900/30',
      border: 'border-indigo-400',
      focusBorder: 'border-indigo-500',
      ring: 'ring-indigo-100 dark:ring-indigo-900/30',
    },
    emerald: {
      accent: 'text-emerald-600',
      bg: 'bg-emerald-600',
      lightBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      border: 'border-emerald-400',
      focusBorder: 'border-emerald-500',
      ring: 'ring-emerald-100 dark:ring-emerald-900/30',
    },
    rose: {
      accent: 'text-rose-600',
      bg: 'bg-rose-600',
      lightBg: 'bg-rose-50 dark:bg-rose-900/30',
      border: 'border-rose-400',
      focusBorder: 'border-rose-500',
      ring: 'ring-rose-100 dark:ring-rose-900/30',
    }
  };
  const theme = themeColors[color] || themeColors.indigo;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDateClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (newDate > today) return; 
    
    const y = newDate.getFullYear();
    const m = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(newDate.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}T${timePart || '00:00'}`);
    setIsOpen(false);
  };

  const formattedDisplayDate = selectedDate ? selectedDate.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }) : '';

  const years = [];
  const currentYear = today.getFullYear();
  for (let y = currentYear; y >= 1900; y--) {
    years.push(y);
  }

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="space-y-3" ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
          {label}
        </label>
      )}

      <div className={`overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border transition-all duration-300 shadow-sm hover:shadow-md ${isOpen ? `${theme.border} ring-4 ${theme.ring}` : 'border-slate-100 dark:border-slate-700'}`}>
        
        {/* Date Section */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            group relative flex items-center justify-between px-5 py-5
            cursor-pointer transition-colors
            ${isOpen ? 'bg-slate-50 dark:bg-slate-700/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-700/10'}
          `}
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl transition-colors ${isOpen ? theme.lightBg : 'bg-slate-100 dark:bg-slate-700'}`}>
              <CalendarDaysIcon className={`w-5 h-5 ${isOpen ? theme.accent : 'text-slate-400'}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-[15px] font-bold font-serif ${datePart ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {datePart ? formattedDisplayDate : (language === 'ko' ? '생년월일 선택' : 'Select Birth Date')}
              </span>
            </div>
          </div>
          <ChevronDownIcon className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Calendar Dropdown Inner */}
        {isOpen && (
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-50 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
             {/* Header / Mode Toggles */}
             <div className="flex items-center justify-between mb-4 px-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setViewMode(viewMode === 'year' ? 'calendar' : 'year'); }}
                className="text-sm font-black text-slate-800 dark:text-white hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                {viewDate.getFullYear()}{language === 'ko' ? '년' : ''}
                <ChevronDownIcon className="w-3 h-3" />
              </button>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); setViewMode(viewMode === 'month' ? 'calendar' : 'month'); }}
                  className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
                >
                  {viewDate.getMonth() + 1}{language === 'ko' ? '월' : ''}
                  <ChevronDownIcon className="w-3 h-3" />
                </button>
                {viewMode === 'calendar' && (
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                      <ChevronLeftIcon className="w-4 h-4 text-slate-400" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                      <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* View Modes */}
            {viewMode === 'calendar' && (
              <div className="animate-in fade-in duration-300">
                <div className="grid grid-cols-7 mb-2">
                  {(language === 'ko' ? DAYS_KO : DAYS_EN).map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
                    const day = i + 1;
                    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                    const isToday = d.getTime() === today.getTime();
                    const isSelected = selectedDate && d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === selectedDate.getMonth() && d.getDate() === selectedDate.getDate();
                    const isFuture = d > today;

                    return (
                      <button
                        key={day}
                        disabled={isFuture}
                        onClick={(e) => { e.stopPropagation(); handleDateClick(day); }}
                        className={`
                          h-9 w-9 rounded-xl flex items-center justify-center text-xs font-serif transition-all
                          ${isSelected ? `${theme.bg} text-white shadow-md scale-105` : isFuture ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}
                          ${isToday && !isSelected ? `ring-1 ${theme.border}` : ''}
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === 'year' && (
              <div className="h-64 overflow-y-auto grid grid-cols-3 gap-2 pr-2 custom-scrollbar">
                {years.map(y => (
                  <button
                    key={y}
                    onClick={(e) => { e.stopPropagation(); setViewDate(new Date(y, viewDate.getMonth(), 1)); setViewMode('calendar'); }}
                    className={`py-2 text-xs font-bold rounded-lg transition-colors ${viewDate.getFullYear() === y ? `${theme.bg} text-white` : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}

            {viewMode === 'month' && (
              <div className="grid grid-cols-3 gap-2">
                {months.map(m => (
                  <button
                    key={m}
                    onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), m, 1)); setViewMode('calendar'); }}
                    className={`py-4 text-xs font-bold rounded-lg transition-colors ${viewDate.getMonth() === m ? `${theme.bg} text-white` : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    {m + 1}{language === 'ko' ? '월' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Divider & Time Section */}
        <div className="bg-white dark:bg-slate-800 px-5 pt-3 pb-6 border-t border-slate-50 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ko' ? '태어난 시간 옵션' : 'Birth Time Options'}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isTimeUnknown} 
                onChange={(e) => setIsTimeUnknown(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-100 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:after:bg-slate-300 peer-checked:bg-indigo-500"></div>
              <span className="ml-3 text-[11px] font-black text-slate-500 uppercase tracking-tight">{language === 'ko' ? '모름' : 'Unknown'}</span>
            </label>
          </div>

          <div className={`overflow-hidden transition-all duration-500 ${isTimeUnknown ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
            <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <ClockIcon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{language === 'ko' ? '정확한 시간' : 'Exact Time'}</span>
                <input 
                  type="time" 
                  value={timePart || '12:00'} 
                  onChange={(e) => onChange(`${datePart}T${e.target.value}`)}
                  className="bg-transparent text-sm font-bold font-serif text-slate-800 dark:text-white outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
};

export default BdInput;
