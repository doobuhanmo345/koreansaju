import React, { useState, useEffect } from 'react';

const ImageBanner = () => {
  const bannerData = [
    {
      id: 0,
      menuTitle: '오늘의 운세',
      mainTitle: '오늘은 \n과연 몇점',
      discount: '50',
      bgColor: '#FFFCEB',
      badgeColor: '#4ADE80',
      imgUrl: 'https://via.placeholder.com/400x300?text=Food+Image',
      link: '/',
    },
    {
      id: 1,
      menuTitle: '오늘의 모임',
      mainTitle: '알코올 \n생존지수',
      discount: '30',
      bgColor: '#FDF2F2',
      badgeColor: '#F87171',
      imgUrl: 'https://via.placeholder.com/400x300?text=Beauty+Image',
      link: '/',
    },
    {
      id: 2,
      menuTitle: '소개팅 지수',
      mainTitle: '몇 없는\n귀한 소개팅날',
      discount: '45',
      bgColor: '#F0F9FF',
      badgeColor: '#38BDF8',
      imgUrl: 'https://via.placeholder.com/400x300?text=Shaver+Image',
      link: '/',
    },
    {
      id: 3,
      menuTitle: '면접 지수',
      mainTitle: '동아리, 직장\n어느 면접이든',
      discount: '15',
      bgColor: '#F5F5F5',
      badgeColor: '#ffffff',
      imgUrl: 'https://via.placeholder.com/400x300?text=Lux+Image',
      link: '/',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // 마우스 오버 시 일시정지를 위한 상태

  // --- 자동 슬라이드 로직 추가 ---
  useEffect(() => {
    let timer;
    if (!isPaused) {
      timer = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex === bannerData.length - 1 ? 0 : prevIndex + 1));
      }, 3000); // 3초마다 다음 배너로 이동
    }

    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 제거
  }, [isPaused, bannerData.length]);
  // ----------------------------

  const currentBanner = bannerData[activeIndex];

  return (
    <div
      className="relative w-full max-w-lg h-[220px] mx-auto flex overflow-hidden font-sans transition-colors duration-700 my-2"
      style={{ backgroundColor: currentBanner.bgColor }}
      onMouseEnter={() => setIsPaused(true)} // 마우스 올리면 자동재생 멈춤
      onMouseLeave={() => setIsPaused(false)} // 마우스 떼면 다시 시작
    >
      {/* 메인 배너 영역 */}
      <div
        className="flex-1 relative flex items-center justify-center cursor-pointer group"
        onClick={() => (window.location.href = currentBanner.link)}
      >
        {/* 배경 상품 이미지 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:scale-105 transition-transform duration-1000">
          <img src={currentBanner.imgUrl} alt="bg" className="w-[60%] object-contain" />
        </div>

        {/* 중앙 블랙 배지 */}
        <div className="relative z-10 w-72 h-72 bg-black rounded-full flex flex-col items-center justify-center text-white shadow-2xl animate-fadeIn">
          <span className="text-lg font-medium mb-1 whitespace-pre-line text-center">
            {currentBanner.mainTitle.split('\n')[0]}
          </span>
          <h2 className="text-3xl font-black mb-1 tracking-tight">
            {currentBanner.mainTitle.split('\n')[1]}
          </h2>
          <div className="flex items-baseline leading-none">
            <span className="text-[90px] font-black" style={{ color: currentBanner.badgeColor }}>
              {currentBanner.discount}
            </span>
            <div className="flex flex-col ml-1">
              <span className="text-2xl font-black" style={{ color: currentBanner.badgeColor }}>
                %
              </span>
              <span className="text-[10px] font-bold" style={{ color: currentBanner.badgeColor }}>
                UP TO
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 우측 메뉴바 */}
      <div className="hidden sm:block w-24 bg-white/80 backdrop-blur-md border-l border-gray-100 flex flex-col ">
        {bannerData.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setActiveIndex(index)}
            className={`flex-1 flex items-center justify-between p-4 cursor-pointer border-b border-gray-100 transition-all duration-300 ${
              activeIndex === index
                ? 'bg-white ring-2 ring-inset ring-blue-500 z-10 shadow-lg'
                : 'hover:bg-gray-50 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex flex-col h-full justify-center">
              {/* 진행 바 (현재 활성화된 메뉴 하단에 표시하면 더 예쁩니다) */}
              <span
                className={`text-[11px] leading-tight font-bold whitespace-pre-line ${
                  activeIndex === index ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {item.menuTitle}
              </span>
              {activeIndex === index && (
                <div className="w-full h-0.5 bg-gray-100 mt-1 overflow-hidden">
                  <div className="h-full bg-blue-500 animate-progress"></div>
                </div>
              )}
            </div>
            {/* <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0 ml-2">
              <img src={item.imgUrl} alt="thumb" className="w-full h-full object-cover" />
            </div> */}
          </div>
        ))}
      </div>

      {/* Tailwind 기본 애니메이션 외에 필요한 경우를 위한 간단한 스타일 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 3s linear;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `,
        }}
      />
    </div>
  );
};

export default ImageBanner;
