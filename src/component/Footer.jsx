import React, { useState } from 'react';
import { useLanguage } from '../context/useLanguageContext';
import PolicyModal from './PolicyModal';
import { legalContents } from '../data/legalContents';

const Footer = () => {
  const { language } = useLanguage();
  const [modalState, setModalState] = useState({ isOpen: false, title: '', content: '' });

  const translations = {
    ko: {
      ceo: '대표이사: 고현준',
      bizNum: '사업자등록번호: 857-87-03030',
      mailOrder: '통신판매업 신고번호: 2024-경기시흥-0002',
      address: '주소: 서울특별시 성동구 자동차시장길 49 415호',
      companyName: '상호명: 에코이츠 주식회사',
      email: 'EMAIL: 300bill@ecoeats.co.kr',
      tel: 'TEL: 070 7954 9380',
      terms: '이용약관',
      privacy: '개인정보처리방침',
      close: '닫기',
      termsContent: legalContents.ko.terms,
      privacyContent: legalContents.ko.privacy
    },
    en: {
      ceo: 'CEO: Hyunjun Ko',
      bizNum: 'Business Registration Number: 857-87-03030',
      mailOrder: 'Mail-order Business Report: 2024-Gyeonggi Siheung-0002',
      address: 'Address: 415, 49 Jadongchasijang-gil, Seongdong-gu, Seoul, Korea',
      companyName: 'Company Name: EchoEats Co., Ltd',
      email: 'EMAIL: 300bill@ecoeats.co.kr',
      tel: 'TEL: +82 70 7954 9380',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      close: 'Close',
      termsContent: legalContents.en.terms,
      privacyContent: legalContents.en.privacy
    }
  };

  const t = translations[language === 'ko' ? 'ko' : 'en'];

  const openModal = (type) => {
    if (type === 'terms') {
      setModalState({ isOpen: true, title: t.terms, content: t.termsContent });
    } else {
      setModalState({ isOpen: true, title: t.privacy, content: t.privacyContent });
    }
  };

  return (
    <footer className="w-full bg-slate-50 dark:bg-slate-900/50 py-10 px-6 mt-10 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Logo/Title */}
        <div className="flex items-center space-x-1">
          <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {language === 'ko' ? '사자사주' : 'Saza Saju'}
          </span>
          <span className="w-1 h-1 bg-red-500 rounded-full mt-1"></span>
        </div>

        {/* Company Info */}
        <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 font-light">
          <div className="flex flex-wrap gap-x-2">
            <span>{t.ceo}</span>
            <span className="text-slate-200 dark:text-slate-700">|</span>
            <span>{t.bizNum}</span>
          </div>
          <div>{t.mailOrder}</div>
          <div>{t.address}</div>
          <div>{t.companyName}</div>
          <div>{t.email}</div>
          <div>{t.tel}</div>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <button 
            onClick={() => openModal('terms')}
            className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {t.terms}
          </button>
          <span className="text-slate-200 dark:text-slate-700 font-light">|</span>
          <button 
            onClick={() => openModal('privacy')}
            className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {t.privacy}
          </button>
        </div>

        {/* Copyright */}
        <div className="text-[10px] text-slate-300 dark:text-slate-600 font-light pt-2">
          © {new Date().getFullYear()} {language === 'ko' ? '사자사주' : 'Saza Saju'}. All rights reserved.
        </div>
      </div>

      <PolicyModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        content={modalState.content}
      />
    </footer>
  );
};

export default Footer;
