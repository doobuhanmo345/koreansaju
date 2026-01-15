import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
export default function CopyUrlAd() {
  const { language } = useLanguage();
  return (
    <div className="mt-10 p-8 bg-white/60 border-2 border-dashed border-[#E8DCCF] rounded-[32px] text-center">
      <p className="text-[#4A3428] font-bold mb-6 break-keep">
        {language === 'ko'
          ? '맞춤 고민 상담, 신년운세, 재물운, 연애운을 무료로 더 보고싶다면? 사자사주에서 확인하세요!'
          : 'For a deeper analysis, visit Saza Saju!'}
      </p>

      <div className="flex flex-col gap-4">
        <div
          onClick={() => {
            navigator.clipboard.writeText('https://koreansaju.vercel.app');
            alert(language === 'ko' ? '주소가 복사되었습니다!' : 'Link copied to clipboard!');
          }}
          className="block sm:flex  items-center justify-between bg-white p-4 rounded-2xl border border-[#E8DCCF] cursor-pointer hover:border-[#F47521] transition-all group active:scale-[0.98]"
        >
          <div className="text-[#F47521] font-mono text-sm font-bold">koreansaju.vercel.app</div>
          <div className="text-[13px] bg-[#F47521] text-white px-3 py-1.5 sm:my-0 my-2 rounded-full font-black shadow-sm group-hover:bg-orange-800 transition-colors">
            {language === 'ko' ? '링크 복사하기' : 'Copy Url'}
          </div>
        </div>

        <div className="flex items-start space-x-2 text-left bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
          <span className="text-[#F47521] text-sm mt-0.5">💡</span>
          <p className="text-[12px] text-orange-800/80 font-medium leading-normal break-keep">
            {language === 'ko'
              ? '위 주소를 복사한 뒤, 브라우저 주소창에 붙여넣어 접속해주세요.'
              : 'Please copy the link above and paste it into your browser to continue.'}
          </p>
        </div>
      </div>
    </div>
  );
}
