import { useState, useRef, useEffect, forwardRef } from 'react';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DateInput = forwardRef(
  ({ label, value, onChange, min, max, className = '', required = false, disabled = false, language = 'ko' }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Parse initial value or default to today
    const selectedDate = value ? new Date(value) : null;
    
    // View state for calendar (what month we are looking at)
    const [viewDate, setViewDate] = useState(selectedDate || new Date());

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calendar logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const handlePrevMonth = (e) => {
      e.stopPropagation();
      setViewDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = (e) => {
       e.stopPropagation();
      setViewDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const handleDateClick = (day) => {
      const newDate = new Date(currentYear, currentMonth, day);
      // Adjust to YYYY-MM-DD string with local timezone handling
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const dateDay = String(newDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${dateDay}`;

      if (onChange) {
        onChange({ target: { value: dateString } });
      }
      setIsOpen(false);
    };

    const isDateDisabled = (day) => {
      const checkDate = new Date(currentYear, currentMonth, day);
      checkDate.setHours(0, 0, 0, 0);
      
      if (min) {
        const minDate = new Date(min);
        minDate.setHours(0, 0, 0, 0);
        if (checkDate < minDate) return true;
      }
      if (max) {
        const maxDate = new Date(max);
        maxDate.setHours(0, 0, 0, 0);
        if (checkDate > maxDate) return true;
      }
      return false;
    };

    const isSameDate = (d1, d2) => {
      if (!d1 || !d2) return false;
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    };

    // Format display value
    const formattedValue = value ? (() => {
      const date = new Date(value);
      if (language === 'ko') {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' });
        return `${year}년 ${month}월 ${day}일 (${weekday})`;
      } else {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          weekday: 'short' 
        });
      }
    })() : '';

    const days = language === 'ko' ? DAYS_KO : DAYS_EN;
    const monthYearLabel = viewDate.toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US', { month: 'long', year: 'numeric' });

    return (
      <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
        {label && (
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative group">
          <div 
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={`
              relative flex items-center justify-between w-full px-5 py-3.5
              bg-white dark:bg-slate-800 
              border rounded-xl shadow-sm
              transition-all duration-300
              ${isOpen 
                ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-900/30' 
                : 'border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-slate-500 hover:shadow-md'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}
            `}
          >
             <div className="flex items-center gap-3">
               <CalendarDaysIcon className={`h-5 w-5 transition-colors duration-300 ${
                 isOpen ? 'text-rose-500' : 'text-slate-400 group-hover:text-rose-400'
               }`} />
               <span className={`text-[15px] ${
                 value 
                   ? 'text-slate-800 dark:text-slate-100 font-serif font-bold tracking-tight' 
                   : 'text-slate-400 font-light'
               }`}>
                 {formattedValue || (language === 'ko' ? '날짜 선택' : 'Select Date')}
               </span>
             </div>
             
             {/* Dropdown Indicator */}
             <div className={`text-xs text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
               ▼
             </div>
          </div>

          {/* Calendar Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 z-50 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-serif">
                  {monthYearLabel}
                </span>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 mb-2">
                {days.map(day => (
                  <div key={day} className="text-center text-xs font-bold text-slate-400 py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isDisabledDay = isDateDisabled(day);
                  const isSelected = selectedDate && isSameDate(selectedDate, new Date(currentYear, currentMonth, day));
                  const isToday = isSameDate(new Date(), new Date(currentYear, currentMonth, day));

                  return (
                    <button
                      key={day}
                      onClick={() => !isDisabledDay && handleDateClick(day)}
                      disabled={isDisabledDay}
                      className={`
                        h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all font-serif
                        ${isSelected 
                          ? 'bg-rose-500 text-white font-bold shadow-md' 
                          : isDisabledDay
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-rose-600'
                        }
                        ${!isSelected && isToday ? 'ring-1 ring-slate-300 dark:ring-slate-500 font-bold text-rose-500' : ''}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';

export default DateInput;
