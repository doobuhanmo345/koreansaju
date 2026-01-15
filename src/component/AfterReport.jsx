import React from 'react';
import { MessageCircle, Sparkles, Heart, Star } from 'lucide-react';
import { useLanguage } from '../context/useLanguageContext';
import { useNavigate } from 'react-router-dom';
export default function AfterReport() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="w-full py-16 px-6 bg-gradient-to-b from-[#FFF9F5] to-[#FFF0EB]">
      <div className="max-w-2xl mx-auto">
        {/* Decorative top element */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#E8D4C8]"></div>
            <Sparkles size={16} className="text-[#D4A088]" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#E8D4C8]"></div>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-gradient-to-br from-white to-[#FFF9F5] rounded-3xl shadow-xl border-2 border-[#F5E6DD] p-8 sm:p-10 relative overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFE8DD]/30 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#FFE0D0]/20 to-transparent rounded-tr-full"></div>

          {/* Content */}
          <div className="relative z-10">
            {/* Icon with floating animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E8B4A0] to-[#D4A088] rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-[#E8B4A0] to-[#D4A088] rounded-full flex items-center justify-center shadow-lg">
                  <MessageCircle size={28} className="text-white" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-2xl sm:text-3xl font-bold text-center text-[#7A5C52] mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {language === 'en' ? 'Have More Questions?' : '추가 질문이 있으신가요?'}
            </h3>

            {/* Subtitle */}
            <p className="text-center text-[#9B8B82] text-base sm:text-lg font-light leading-relaxed mb-8">
              {language === 'en' ? (
                <>
                  Your cosmic journey doesn't end here. <br className="hidden sm:block" />
                  Let our mystical guide illuminate your path further.
                </>
              ) : (
                <>추가적인 질문이 있으신가요? 사자에게 물어보기를 활용해보세요. </>
              )}
            </p>

            {/* CTA Button */}
            <div className="flex justify-center" onClick={() => navigate('/sazatalk')}>
              <button className="group relative px-8 py-4 bg-gradient-to-r from-[#E8B4A0] to-[#D4A088] text-white rounded-full font-semibold text-lg shadow-xl shadow-orange-200/40 hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300 active:scale-95 flex items-center gap-3">
                <span style={{ fontFamily: 'Georgia, serif' }}>
                  {language === 'en' ? 'Ask Saza' : '사자에게 물어보기'}
                </span>
                <MessageCircle
                  size={20}
                  className="group-hover:rotate-12 transition-transform duration-300"
                />
              </button>
            </div>

            {/* Feature list */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFE8DD] to-[#FFE0D0] rounded-full flex items-center justify-center mb-3">
                  <Heart size={18} className="text-[#D4A088]" />
                </div>
                <p
                  className="text-xs font-semibold text-[#9B8B82]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Personalized Insights
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFE8DD] to-[#FFE0D0] rounded-full flex items-center justify-center mb-3">
                  <Sparkles size={18} className="text-[#D4A088]" />
                </div>
                <p
                  className="text-xs font-semibold text-[#9B8B82]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  AI-Powered Wisdom
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFE8DD] to-[#FFE0D0] rounded-full flex items-center justify-center mb-3">
                  <Star size={18} className="text-[#D4A088]" />
                </div>
                <p
                  className="text-xs font-semibold text-[#9B8B82]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Instant Guidance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#C4B5A9] font-light italic">
            ✨ Your questions deserve cosmic answers ✨
          </p>
        </div>
      </div>
    </div>
  );
}
