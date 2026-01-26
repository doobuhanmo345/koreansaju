import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguageContext';
import { 
  CalendarDaysIcon, 
  SparklesIcon, 
  HeartIcon, 
  AcademicCapIcon 
} from '@heroicons/react/24/outline';

const SelIcons = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ko = language === 'ko';

  const navItems = [
    {
      label: `${ko ? '좋은 날짜 받기' : 'Auspicious Date'}`,
      path: '/seldate',
      desc: ko ? '이사, 계약 등 중요한 날을 위한 택일' : 'Select best dates for moving, contracts etc.',
      icon: <CalendarDaysIcon className="w-6 h-6" />,
    },
    {
      label: `${ko ? '출산 택일' : 'Birth Date'}`,
      path: '/selbirth',
      desc: ko ? '아이의 운명을 위한 최고의 선물' : 'Best gift for your child\'s destiny',
      icon: <SparklesIcon className="w-6 h-6" />,
    },
    {
      label: `${ko ? '특별한 만남' : 'First Date'}`,
      path: '/firstdate',
      desc: ko ? '설레는 첫 만남, 그 날의 기운은?' : 'Energy of the fluttering first meeting',
      icon: <HeartIcon className="w-6 h-6" />,
    },
    {
      label: `${ko ? '면접/시험' : 'Interview/Exam'}`,
      path: '/interview',
      desc: ko ? '합격을 부르는 전략과 날짜' : 'Strategy and dates for passing',
      icon: <AcademicCapIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-around gap-3 sm:gap-0 sm:px-0 py-4">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className="group relative flex flex-row sm:flex-col items-center gap-4 sm:gap-2 p-4 sm:p-0 
                     rounded-3xl bg-white sm:bg-transparent 
                     border border-slate-100 sm:border-none
                     shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] sm:shadow-none
                     transition-all active:scale-[0.97] outline-none"
        >
          {/* 아이콘 영역 */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 sm:bg-transparent text-slate-400 transition-colors group-hover:text-indigo-600">
             <div className="h-7 w-7 text-current">
               {item.icon}
             </div>
          </div>

          {/* 텍스트 영역 */}
          <div className="flex flex-col items-start sm:items-center overflow-hidden">
            <span className="text-[15px] sm:text-[12px] font-bold text-slate-800 transition-colors group-hover:text-indigo-600">
              {item.label}
            </span>
            {/* 모바일에서만 보이는 설명 */}
            <span className="sm:hidden text-[12px] text-slate-400 font-medium truncate w-full">
              {item.desc}
            </span>
          </div>

          {/* 모바일 전용: 우측 끝 화살표 */}
          <div className="sm:hidden ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 group-hover:bg-indigo-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3 h-3 text-slate-300 group-hover:text-indigo-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SelIcons;
