// 1. React Core
import { useState, useEffect } from 'react';

import { useAuthContext } from './context/useAuthContext';
import { useLanguage } from './context/useLanguageContext';
import { useUsageLimit } from './context/useUsageLimit';

import { useNavigate } from 'react-router-dom';
import MainIcons from './component/MainIcons';
import SubIcons from './component/SubIcons';
import SelIcons from './component/SelIcons';
import SazaTalkBanner from './ui/SazaTalkBanner';
import NewYearBanner from './ui/NewYearBanner';
import MyInfoBar from './component/MyInfoBar';
import ImageBanner from './component/ImageBanner';
import BasicAnaBanner from './component/BasicAnaBanner';
import IconWrapper from './ui/IconWrapper';
import Footer from './component/Footer';
export default function App() {
  // --- Context Hooks ---
  const { user, userData, login, iljuImagePath } = useAuthContext();
  const { language } = useLanguage();
  const {
    setEditCount, // 필요시 수동 조작용 (모달 등에서 사용)
  } = useUsageLimit(user, userData, language);

  // --- Local States ---
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [gender, setGender] = useState('female');

  // 저장/수정 상태
  const [isSaved, setIsSaved] = useState(false);

  // 입력 데이터
  const navigate = useNavigate();
  const [inputDate, setInputDate] = useState(() => {
    try {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    } catch (e) {
      return '2024-01-01T00:00';
    }
  });

  // 사주 계산 훅

  // --- 1. 데이터 동기화 Effect ---
  useEffect(() => {
    if (user && userData) {
      if (userData.birthDate) {
        setInputDate(userData.birthDate);
        setIsSaved(true);
      } else {
        setIsSaved(false);
      }

      if (userData.gender) setGender(userData.gender);
      if (userData.isTimeUnknown !== undefined) setIsTimeUnknown(userData.isTimeUnknown);

      setEditCount(userData.editCount || 0);
    } else if (!user) {
      setIsSaved(false);
      setEditCount(0);
    }
  }, [user, userData]);


  return (
    <div>
      {/* sronly처리할 것 */}
{!!user && <div className="w-full max-w-lg bg-white/70 dark:bg-slate-800/60 rounded-lg border border-indigo-50 dark:border-indigo-500/30 shadow-sm backdrop-blur-md mx-auto mb-2 p-2 px-4 dark:text-white flex items-center justify-between">
        {userData?.birthDate ? (
          <MyInfoBar />
        ) : (
          <span className="text-xs text-slate-400 mx-auto">데이터가 없습니다.</span>
        )}
      </div>}
      
      {/* 배너 */}
      <ImageBanner />

      <SazaTalkBanner />
      <NewYearBanner />
      
      <BasicAnaBanner inputDate={inputDate} isTimeUnknown={isTimeUnknown} gender={gender} />
      <IconWrapper
        title={
          <>
            {' '}
            {language === 'ko'
              ? '당신의 명식으로 풀어낸 맞춤 운세'
              : 'Personlised Korean Saju report'}
          </>
        }
        subTitle={
          <>
            {' '}
            {language === 'ko'
              ? '타고난 기운을 분석한 1:1 정밀 리포트'
              : 'Report based on my innate energy '}
          </>
        }
      >
        <MainIcons />
      </IconWrapper>

      {/* New Selection Icons Section */}
      <IconWrapper
        title={
          <>
            {language === 'ko' ? '중요한 날을 위한 분석' : 'Analysis for Important Days'}
          </>
        }
        subTitle={
          <>
            {language === 'ko'
              ? '면접, 만남, 출산... 그 날의 기운을 미리 확인하세요'
              : 'Interview, Date, Birth... Check the energy of the day in advance'}
          </>
        }
      >
        <SelIcons />
      </IconWrapper>

      <IconWrapper
        title={<>{language === 'ko' ? '감성 운세' : 'Emotional Fortune'}</>}
        subTitle={
          <>
            {language === 'ko'
              ? '내 마음의 소리에 귀 기울이는 시간'
              : 'Time to listen to my inner sound'}
          </>
        }
      >
        <SubIcons />
      </IconWrapper>
      <Footer />
    </div>
  );
}
