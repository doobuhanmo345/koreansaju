import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PolicyModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden transform animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
            {content || "내용을 입력해 주세요."}
          </div>
        </div>

        {/* Footer/Close Button */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full text-sm font-bold active:scale-95 transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
