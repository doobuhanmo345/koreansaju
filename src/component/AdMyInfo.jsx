import React, { useState } from 'react';
import FourPillarVis from './FourPillarVis';

const AdMyInfo = ({ birthData, isTimeUnknown, gender, saju }) => {
  // 데이터가 들어올 것을 대비해 임시로 하드코딩된 값을 유지합니다.
  // 실제 사용 시에는 props로 전달받은 birthData 등을 활용하세요.

  const { year, month, day, hour, minute } = birthData;
  const [openFourPillar, setOpenFourPillar] = useState(false);

  return (
    <div className="w-full mx-auto p-4 bg-[#FFF5EE] rounded-3xl">
      {/* 메인 카드 컨테이너: 그림자를 줄이고 깔끔한 화이트 톤 강조 */}
      <div className="bg-white border border-orange-100 rounded-[2rem] shadow-sm p-6 relative overflow-hidden">
        {/* 헤더 섹션: 작고 간결하게 변경 */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">🦁</span>
          <h3 className="text-sm font-bold text-[#A0522D] tracking-tight">사주 분석 기준 정보</h3>
        </div>

        {/* 본문 및 하단 버튼 섹션: 카드 분할 대신 깔끔한 리스트로 환원 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
          {/* 정보 리스트: 개별 카드를 없애고 간결한 구분선과 텍스트 위주로 구성 */}
          <ul className="space-y-3 w-full sm:w-auto">
            <li className="flex items-center gap-3 text-[15px] font-medium text-[#6F4E37]">
              <span className="w-1 h-1 bg-orange-300 rounded-full" />
              <span className="w-16 text-orange-400 text-[13px] font-bold">생년월일</span>
              <span className="font-bold">
                {year}년 {month}월 {day}일
              </span>
            </li>

            <li className="flex items-center gap-3 text-[15px] font-medium text-[#6F4E37]">
              <span className="w-1 h-1 bg-orange-300 rounded-full" />
              <span className="w-16 text-orange-400 text-[13px] font-bold">출생시간</span>
              <span className="font-bold">
                {isTimeUnknown ? '알 수 없음' : `${hour}:${minute}`}
              </span>
            </li>

            <li className="flex items-center gap-3 text-[15px] font-medium text-[#6F4E37]">
              <span className="w-1 h-1 bg-orange-300 rounded-full" />
              <span className="w-16 text-orange-400 text-[13px] font-bold">성별</span>
              <span className="font-bold">{gender === 'female' ? '여성' : '남성'}</span>
            </li>
          </ul>

          {/* 만세력 보기 버튼: 다시 작고 깔끔한 캡슐 스타일로 변경 */}
          <button
            onClick={() => setOpenFourPillar(!openFourPillar)}
            className={`
          flex items-center gap-1 transition-all duration-200 px-4 py-2 rounded-full text-[13px] font-bold shadow-sm border w-full sm:w-auto justify-center
          ${
            openFourPillar
              ? 'bg-[#FF7F50] text-white border-[#FF7F50]'
              : 'bg-[#FFF0E0] text-[#FF7F50] border-orange-100 hover:bg-[#FFE4C4]'
          }
        `}
          >
            {openFourPillar ? '만세력 접기' : '만세력 보기'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform duration-200 ${
                openFourPillar ? 'rotate-180' : 'rotate-0'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 결과 섹션 */}
      {openFourPillar && (
        <div className="mt-4 bg-white border border-orange-100 rounded-[2rem] shadow-[0_10px_30px_-15px_rgba(255,165,0,0.1)] p-8 relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-500">
          {/* 배경 장식: 허전함을 달래줄 아주 연한 패턴/아이콘 */}
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none">
            <span className="text-8xl">🦁</span>
          </div>

          {/* 상단 구분선 및 타이틀 */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-1 bg-orange-100 rounded-full mb-4" />
            <div className="flex items-center gap-2">
              <h4 className="text-[15px] font-black text-[#A0522D]">나의 사주 원국</h4>
              <span className="px-2 py-0.5 bg-orange-50 text-orange-400 text-[10px] font-bold rounded-md border border-orange-100">
                EIGHT CHARACTERS
              </span>
            </div>
          </div>

          {/* 실제 만세력 컴포넌트 */}
          <div className="relative z-10">
            <FourPillarVis saju={saju} isTimeUnknown={isTimeUnknown} />
          </div>

        </div>
      )}
    </div>
  );
};

export default AdMyInfo;
