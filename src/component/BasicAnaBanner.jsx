import React ,{useMemo} from 'react';
import html2canvas from 'html2canvas';
import { ILJU_DATA, ILJU_DATA_EN } from '../data/ilju_data';
import { useAuthContext } from '../context/useAuthContext';
import { useLanguage } from '../context/useLanguageContext';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { FaDownload } from 'react-icons/fa';
import { ENG_MAP } from '../data/constants';

export default function BasicAnaBanner({ inputDate, isTimeUnknown, gender }) {
  const { user, userData, iljuImagePath } = useAuthContext();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const saju = useSajuCalculator(inputDate, isTimeUnknown).saju;

  const isKo = language === 'ko';
  const currentTitle = isKo
    ? ILJU_DATA?.[saju.sky1 + saju.grd1]?.title[gender]?.title
    : ILJU_DATA_EN?.[saju.sky1 + saju.grd1]?.title[gender]?.title;
  const currentDesc = isKo
    ? ILJU_DATA?.[saju.sky1 + saju.grd1]?.title[gender]?.desc
    : ILJU_DATA_EN?.[saju.sky1 + saju.grd1]?.title[gender]?.desc;

  const handleShareImg = async (id) => {
    const html2canvas = (await import('html2canvas')).default;
    const el = document.getElementById(id);
    if (!el) return;

    const originalStyle = {
      position: el.style.position,
      left: el.style.left,
      top: el.style.top,
      visibility: el.style.visibility,
    };

    try {
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.top = '-9999px';
      el.style.visibility = 'visible';

      const imgs = Array.from(el.querySelectorAll('img'));
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) return resolve();
              img.onload = resolve;
              img.onerror = resolve;
            }),
        ),
      );

      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my_saju_card.png`;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      el.style.position = originalStyle.position;
      el.style.left = originalStyle.left;
      el.style.top = originalStyle.top;
      el.style.visibility = originalStyle.visibility || 'hidden';
    }
  };
  
const processedTitle = useMemo(() => {
  if (!currentTitle) return { first: '', second: '' };

  const words = currentTitle.split(' ');
  const articles = ['a', 'an', 'the'];

  // 첫 단어가 관사(a, an, the)이고, 뒤에 단어가 더 있다면 두 단어를 첫 줄로 묶음
  let splitIndex = 1;
  if (words.length > 1 && articles.includes(words[0].toLowerCase())) {
    splitIndex = 2;
  }

  return {
    first: words.slice(0, splitIndex).join(' '),
    second: words.slice(splitIndex).join(' '),
  };
}, [currentTitle]);
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 1. 이미지 저장용 카드 (숨김) */}
      <div className="absolute" style={{ visibility: 'hidden' }}>
        <div
          id="share-card"
          style={{
            width: '360px',
            padding: '40px 30px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '32px',
            border: '2px solid #6366f1',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: '900',
              color: '#6366f1',
              letterSpacing: '0.4em',
              marginBottom: '20px',
            }}
          >
            IDENTITY SIGNATURE
          </div>
          <img
            src={iljuImagePath}
            crossOrigin="anonymous"
            style={{ width: '150px', marginBottom: '20px' }}
            alt="share"
          />
          <div
            style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '10px' }}
          >
            {currentTitle}
          </div>
          <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>{currentDesc}</div>
        </div>
      </div>

      {/* 2. 실제 배너: 색상 농도를 높인 버전 */}
      {userData?.birthDate && (
        <div
          onClick={() => navigate('/basic')}
          className="cursor-pointer relative w-full h-[200px] rounded-[2rem] border border-gray-100 shadow-md overflow-hidden group transition-all duration-300  mx-auto"
          // 농도가 확실한 인디고 파스텔
        >
          {/* 배경 대형 텍스트 (한자 일주) */}
          <div className="absolute left-[30%] top-[10%] text-[90px] font-black opacity-[0.05] italic select-none pointer-events-none text-gray-900 whitespace-nowrap">
            {language === 'en' ? (
              <>
                {ENG_MAP[saju.sky1]?.toUpperCase()}
                {ENG_MAP[saju.grd1]?.toUpperCase()}
              </>
            ) : (
              <> {saju.sky1 + saju.grd1}</>
            )}
          </div>

          {/* 상단 캡션 및 다운로드 버튼 영역 */}
          <div className="absolute top-6 left-10 right-8 flex justify-between items-start z-10">
            <span className="text-sm  text-gray-500/80 uppercase tracking-wider">
              {isKo ? '오행으로 보는 나는 누구?' : 'WHO AM I?'}
            </span>
            <div></div>
            {/* <button
              onClick={(e) => {
                e.stopPropagation();
                handleShareImg('share-card');
              }}
              className="p-2.5 rounded-full bg-white/60 hover:bg-gray-600 hover:text-white text-gray-500 transition-all active:scale-90 shadow-sm"
            >
              <FaDownload className="h-3 w-3" />
            </button> */}
          </div>

          <div className="relative h-full flex flex-col justify-center px-10 z-10 pt-4">
            <div className="flex items-center gap-4">
              {/* 텍스트 정보 */}
              <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-5 duration-1000">
                <h2 className="text-2xl sm:text-3xl font-light text-slate-900 leading-tight tracking-tight mb-2">
                  {processedTitle.first} <br />
                  <span className="font-serif italic font-medium text-indigo-700">
                    {processedTitle.second}
                  </span>
                </h2>
                {/* 하단 행동 유도 텍스트 -> 강조된 가이드 버튼 스타일로 변경 */}
                <div className="mt-3">
                  <span className="inline-flex items-center text-[10px] font-bold py-1 px-3 bg-gray-300  rounded-full text-gray-600 uppercase tracking-tighter group-hover:bg-gray-600 group-hover:text-white transition-all duration-300">
                    {isKo ? '상세 분석 확인하기' : 'View Full Report'}
                    <span className="ml-1 text-[12px] leading-none">→</span>
                  </span>
                </div>
              </div>

              {/* 일주 이미지 */}
              <div className="relative shrink-0 animate-in fade-in zoom-in duration-1000">
                <div className="absolute inset-0 bg-white/40 blur-2xl rounded-full scale-110"></div>
                <img
                  src={iljuImagePath}
                  className="relative w-28 h-28 sm:w-32 sm:h-32 object-contain transition-transform group-hover:scale-110 duration-700"
                  alt="ilju"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
