import React from 'react';
import { MessageCircle, Sparkles, Heart, Star } from 'lucide-react';
import { useLanguage } from '../context/useLanguageContext';
import { useNavigate } from 'react-router-dom';

export default function AfterReport() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="w-full py-16 px-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Decorative top element - Blue theme */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-blue-200"></div>
            <Sparkles size={16} className="text-blue-400" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-blue-200"></div>
          </div>
        </div>

        {/* Main card - Pinterest style: Clean white, subtle shadow, blue accents */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-blue-50 p-8 sm:p-10 relative overflow-hidden">
          {/* Content */}
          <div className="relative z-10">
            {/* Icon with floating animation - Blue gradient */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <MessageCircle size={28} className="text-white" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Title - Darker text for clean look */}
            <h3
              className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4"
              style={{ fontFamily: language === 'en' ? 'Georgia, serif' : 'inherit' }}
            >
              {language === 'en' ? 'Have More Questions?' : '궁금한 점이 더 남으셨나요?'}
            </h3>

            {/* Subtitle - Neutral gray */}
            <p className="text-center text-gray-600 text-base sm:text-lg font-light leading-relaxed mb-8">
              {language === 'en' ? (
                <>
                  Your journey doesn't end here. <br className="hidden sm:block" />
                  Let our guide illuminate your path further.
                </>
              ) : (
                <>
                  추가적으로 궁금한 것은 <br className="hidden sm:block" />
                  사자(SAZA)가 더 명확하게 알려드릴게요.
                </>
              )}
            </p>

            {/* CTA Button - Blue gradient */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/sazatalk')}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 active:scale-95 flex items-center gap-3"
              >
                <span style={{ fontFamily: language === 'en' ? 'Georgia, serif' : 'inherit' }}>
                  {language === 'en' ? 'Ask Saza' : '사자에게 물어보기'}
                </span>
                <MessageCircle
                  size={20}
                  className="group-hover:rotate-12 transition-transform duration-300"
                />
              </button>
            </div>

            {/* Feature list - Light blue background icons */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-blue-50/50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Heart size={18} className="text-blue-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {language === 'en' ? 'Personalized Insights' : '사주별 최적화'}
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-blue-50/50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Sparkles size={18} className="text-blue-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {language === 'en' ? 'AI-Powered Wisdom' : 'AI 최적화'}
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-blue-50/50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Star size={18} className="text-blue-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {language === 'en' ? 'Instant Guidance' : '실시간 운세 상담'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative text - Subtle gray */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 font-light italic">
            {language === 'en'
              ? '✨ Your questions deserve clear answers ✨'
              : '✨ 궁금한 것을 물어보세요 ✨'}
          </p>
        </div>
      </div>
    </div>
  );
}
