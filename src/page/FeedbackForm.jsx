import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguageContext';

export default function FeedbackForm({}) {
  const [formData, setFormData] = useState({
    email: '',
    disappointing: '',
    liked: '',
    newMenu: '',
    improvement: '',
    others: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { language } = useLanguage();
  const navigate = useNavigate();

  // 모든 필드가 채워졌는지 확인 (버튼 활성화 조건)
  const isFormValid = Object.values(formData).every((value) => value.trim() !== '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        ...formData,
        lang: language,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error adding document: ', error);
      alert(language === 'ko' ? '오류 발생. 다시 시도해주세요.' : 'Error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = 'block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300';
  const inputStyle =
    'w-full p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all';

  if (submitted) {
    return (
      <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-xl flex flex-col items-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
          {language === 'ko' ? '제출 완료!' : 'Submission Complete!'}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-[280px] mx-auto">
          {language === 'ko'
            ? '소중한 의견 감사합니다. 리포트는 기재하신 이메일로 발송됩니다.'
            : 'Thank you for your feedback. The report will be sent to your email.'}
        </p>

        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-black rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg"
        >
          {language === 'ko' ? '메인으로 돌아가기' : 'Back to Home'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          {language === 'ko' ? '서비스 피드백' : 'Service Feedback'}
        </h2>
        <p className="text-amber-600 dark:text-amber-400 font-bold text-sm mt-1">
          {language === 'ko'
            ? '모든 항목 작성 시 3만원 상당 리포트 증정'
            : 'Get a $25 report for completing all fields'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 이메일 */}
        <div>
          <label className={labelStyle}>
            {language === 'ko' ? '이메일 주소' : 'Email Address'}
          </label>
          <input
            type="email"
            name="email"
            className={inputStyle}
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            required
          />
        </div>

        {/* 아쉬운 점 */}
        <div>
          <label className={labelStyle}>
            {language === 'ko' ? '아쉬운 점' : 'What was disappointing?'}
          </label>
          <textarea
            name="disappointing"
            className={`${inputStyle} h-20 resize-none`}
            value={formData.disappointing}
            onChange={handleChange}
            required
          />
        </div>

        {/* 맘에 드는 점 */}
        <div>
          <label className={labelStyle}>
            {language === 'ko' ? '맘에 드는 점' : 'What did you like?'}
          </label>
          <textarea
            name="liked"
            className={`${inputStyle} h-20 resize-none`}
            value={formData.liked}
            onChange={handleChange}
            required
          />
        </div>

        {/* 추가해야 할 메뉴 */}
        <div>
          <label className={labelStyle}>
            {language === 'ko' ? '추가하고 싶은 메뉴' : 'Suggested new menus?'}
          </label>
          <input
            type="text"
            name="newMenu"
            className={inputStyle}
            value={formData.newMenu}
            onChange={handleChange}
            required
          />
        </div>

        {/* 추천 개선사항 */}
        <div>
          <label className={labelStyle}>
            {language === 'ko' ? '개선 제안' : 'Key improvements?'}
          </label>
          <textarea
            name="improvement"
            className={`${inputStyle} h-20 resize-none`}
            value={formData.improvement}
            onChange={handleChange}
            required
          />
        </div>

        {/* 기타 */}
        <div>
          <label className={labelStyle}>{language === 'ko' ? '기타 의견' : 'Other comments'}</label>
          <input
            type="text"
            name="others"
            className={inputStyle}
            value={formData.others}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-4 rounded-xl font-black transition-all active:scale-95 shadow-lg ${
            isFormValid && !isSubmitting
              ? 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          {isSubmitting
            ? language === 'ko'
              ? '제출 중...'
              : 'Submitting...'
            : language === 'ko'
              ? '3만원 상당 리포트 받기'
              : 'Get My $25 Report'}
        </button>
      </form>
    </div>
  );
}
