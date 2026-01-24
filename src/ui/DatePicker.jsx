import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

export default function DatePicker({ value, onChange, label, min, max }) {
  return (
    <div className="w-full relative group">
      {label && (
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <CalendarDaysIcon className="h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors duration-300" />
        </div>
        <input
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-300 shadow-sm font-medium"
        />
      </div>
    </div>
  );
}
