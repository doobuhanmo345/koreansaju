import { useState, useRef, useEffect, forwardRef } from 'react';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DateInput = forwardRef(
  ({ label, value, onChange, min, max, className = '', required = false, disabled = false, language = 'ko', color = 'rose' }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Color Variants Definition
    const variants = {
      rose: {
        text: 'text-rose-500',
        textHover: 'hover:text-rose-600',
        groupHoverText: 'group-hover:text-rose-400',
        border: 'border-rose-400',
        borderHover: 'hover:border-rose-300',
        ring: 'ring-rose-100 dark:ring-rose-900/30',
        bg: 'bg-rose-500',
      },
      emerald: {
        text: 'text-emerald-500',
        textHover: 'hover:text-emerald-600',
        groupHoverText: 'group-hover:text-emerald-400',
        border: 'border-emerald-400',
        borderHover: 'hover:border-emerald-300',
        ring: 'ring-emerald-100 dark:ring-emerald-900/30',
        bg: 'bg-emerald-500',
      },
      indigo: {
        text: 'text-indigo-500',
        textHover: 'hover:text-indigo-600',
        groupHoverText: 'group-hover:text-indigo-400',
        border: 'border-indigo-400',
        borderHover: 'hover:border-indigo-300',
        ring: 'ring-indigo-100 dark:ring-indigo-900/30',
        bg: 'bg-indigo-500',
      },
      blue: {
        text: 'text-blue-500',
        textHover: 'hover:text-blue-600',
        groupHoverText: 'group-hover:text-blue-400',
        border: 'border-blue-400',
        borderHover: 'hover:border-blue-300',
        ring: 'ring-blue-100 dark:ring-blue-900/30',
        bg: 'bg-blue-500',
      },
      purple: {
        text: 'text-purple-500',
        textHover: 'hover:text-purple-600',
        groupHoverText: 'group-hover:text-purple-400',
        border: 'border-purple-400',
        borderHover: 'hover:border-purple-300',
        ring: 'ring-purple-100 dark:ring-purple-900/30',
        bg: 'bg-purple-500',
      },
    };

    const theme = variants[color] || variants.rose;

    // Parse initial value or default to today
    const selectedDate = value ? new Date(value) : null;
    
    // View state for calendar (what month we are looking at)
    const [viewDate, setViewDate] = useState(selectedDate || new Date());
    
    // ... existing useState for viewDate is fine, but I need to make sure I don't break the existing code structure.
    // Actually, simply pasting the hook logic again might overwrite. 
    // I should only replace the component definition start and the return functionality, leaving the logic in between if possible, or rewrite logic block.
    // Given replace_file_content constraints, I'll rewrite the component body to be safe or target specific blocks.
    // But since I need 'theme' variable available throughout, I probably should wrap the whole function body or define it early.
    
    // Let's use the provided 'start line' and 'end line' to replace the top part and the return part?
    // No, that's disjointed.
    // I will replace the ENTIRE DateInput definition content to ensure 'theme' is defined at top and used everywhere correctly.
    // But I must include the truncated logic parts.
    // Wait, I can see the previous file content from step 481? No, that was SelDatePage.
    // Step 348 had the full content of DateInput.jsx.
    // The previous edit (485, 486) changed rose to emerald.
    // I will rewrite the whole component to be clean.
    
    // ... (logic for helper functions: getDaysInMonth, etc. - I will just copy them)

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
            {required && <span className={`${theme.text} ml-1`}>*</span>}
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
                ? `${theme.border} ring-2 ${theme.ring}` 
                : `border-slate-200 dark:border-slate-700 ${theme.borderHover} dark:hover:border-slate-500 hover:shadow-md`
              }
              ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}
            `}
          >
             <div className="flex items-center gap-3">
               <CalendarDaysIcon className={`h-5 w-5 transition-colors duration-300 ${
                 isOpen ? theme.text : `text-slate-400 ${theme.groupHoverText}`
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
                          ? `${theme.bg} text-white font-bold shadow-md` 
                          : isDisabledDay
                            ? 'text-slate-300 cursor-not-allowed'
                            : `text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 ${theme.textHover}`
                        }
                        ${!isSelected && isToday ? `ring-1 ring-slate-300 dark:ring-slate-500 font-bold ${theme.text}` : ''}
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
