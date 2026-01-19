// 1. React Core
import { useState, useEffect } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { FaDownload } from 'react-icons/fa';

import { useAuthContext } from './context/useAuthContext';
import { useTheme } from './context/useThemeContext';
import { useLanguage } from './context/useLanguageContext';
import { useUsageLimit } from './context/useUsageLimit';

// 5. Custom Hooks
import { useSajuCalculator } from './hooks/useSajuCalculator';

// 7. Data & Constants
import { ILJU_DATA, ILJU_DATA_EN } from './data/ilju_data';
// 8. Components (UI & Features)
import SajuBlur from './component/SajuBlur';

import BeforeLogin from './page/BeforeLogin';
import { useNavigate } from 'react-router-dom';
import MainIcons from './component/MainIcons';
import SubIcons from './component/SubIcons';
import SazaTalkBanner from './ui/SazaTalkBanner';
import NewYearBanner from './ui/NewYearBanner';
import MyInfoBar from './component/MyInfoBar';
import ImageBanner from './component/ImageBanner';
export default function App() {
  // --- Context Hooks ---
  const { user, userData, login, iljuImagePath } = useAuthContext();
  const { language } = useLanguage();
  const {
    setEditCount, // 필요시 수동 조작용 (모달 등에서 사용)
    MAX_EDIT_COUNT,
  } = useUsageLimit(user, userData, language);
  const { theme } = useTheme();

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
  const saju = useSajuCalculator(inputDate, isTimeUnknown).saju;

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

  // --- 2. 테마 적용 Effect ---
  useEffect(() => {
    if (theme === 'darkd') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const handleShareImg = async (id) => {
    const html2canvas = (await import('html2canvas')).default;
    const el = document.getElementById(id);
    if (!el) {
      alert('share-card를 찾을 수 없습니다.');
      return;
    }

    // 1️⃣ 현재 스타일 저장 (복구를 위해)
    const originalStyle = {
      position: el.style.position,
      left: el.style.left,
      top: el.style.top,
      visibility: el.style.visibility,
    };

    try {
      // 2️⃣ 화면 밖으로 보내버린 후 보이게 설정 (핵심!)
      // fixed로 설정하여 스크롤 위치와 상관없이 화면 밖(-9999px)으로 보냅니다.
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.top = '-9999px';
      el.style.visibility = 'visible'; // 이제 보여도 사용자는 볼 수 없습니다.

      // 3️⃣ 이미지 / 폰트 로딩 대기
      const imgs = Array.from(el.querySelectorAll('img'));
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
        ),
      );

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // 4️⃣ 캡쳐 (html2canvas)
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null, // 투명 배경이 필요하면 null, 아니면 '#ffffff'
        logging: false,
        // x, y, scrollX, scrollY 옵션은 기본적으로 요소를 따라가므로
        // 화면 밖에 있어도 html2canvas가 알아서 찾아가서 찍습니다.
      });

      // 5️⃣ 이미지 저장
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));

      if (!blob) throw new Error('canvas toBlob 실패');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'share-card.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('캡쳐 실패: 이미지 CORS 또는 렌더링 문제');
    } finally {
      // 6️⃣ 원래 스타일로 완벽 복구
      el.style.position = originalStyle.position;
      el.style.left = originalStyle.left;
      el.style.top = originalStyle.top;
      el.style.visibility = originalStyle.visibility || 'hidden';
    }
  };

  if (!userData?.birthDate) return <BeforeLogin />;
  return (
    <div>
      {/* sronly처리할 것 */}
      <div className=" flex absolute justify-center w-full py-4" style={{ visibility: 'hidden' }}>
        <div
          id="share-card"
          style={{
            width: '350px',
            padding: '25px 20px',
            textAlign: 'center',
            borderRadius: '16px',
            border: '2px solid #6366f1',
            backgroundColor: '#edf0ff',
            boxSizing: 'border-box',
            position: 'relative', // 위치 고정
          }}
        >
          {/* 상단 라인 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <div style={{ height: '1px', width: '24px', backgroundColor: '#818cf8' }}></div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                letterSpacing: '0.3em',
                color: '#6366f1',
              }}
            >
              WHO AM I?
            </span>
            <div style={{ height: '1px', width: '24px', backgroundColor: '#818cf8' }}></div>
          </div>

          {/* 이미지: 이 방식이 안 짤리고 제일 잘 나옵니다 */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <img
              src={iljuImagePath}
              alt="signature"
              crossOrigin="anonymous"
              style={{ width: '160px', height: 'auto', display: 'block' }}
            />
          </div>

          <div
            style={{
              color: '#6366f1',
              fontSize: '10px',
              fontWeight: '900',
              letterSpacing: '0.2em',
              marginBottom: '12px',
            }}
          >
            SIGNATURE{' '}
          </div>

          {/* 텍스트 영역 */}
          <div
            style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}
          >
            {language === 'ko'
              ? ILJU_DATA?.[saju.sky1 + saju.grd1]?.title[gender]?.title
              : ILJU_DATA_EN?.[saju.sky1 + saju.grd1]?.title[gender]?.title}
          </div>

          <div
            style={{
              fontSize: '13px',
              color: '#374151',
              fontWeight: '500',
              lineHeight: '1.6',
              padding: '0 4px',
              wordBreak: 'keep-all',
            }}
          >
            {language === 'ko'
              ? ILJU_DATA?.[saju.sky1 + saju.grd1]?.title[gender]?.desc
              : ILJU_DATA_EN?.[saju.sky1 + saju.grd1]?.title[gender]?.desc}
          </div>
        </div>
      </div>
      <div className="w-full max-w-lg bg-white/70 dark:bg-slate-800/60 rounded-lg border border-indigo-50 dark:border-indigo-500/30 shadow-sm backdrop-blur-md mx-auto mb-2 p-2 px-4 dark:text-white flex items-center justify-between">
        {userData?.birthDate ? (
          <MyInfoBar />
        ) : (
          <span className="text-xs text-slate-400 mx-auto">데이터가 없습니다.</span>
        )}
      </div>
      {/* 배너 */}
      {/* <ImageBanner/> */}
      <SazaTalkBanner />
      <NewYearBanner />
      {/* 로그인 안되어 있을 시 블러 처리 및 유도 */}
      {!user && <SajuBlur MAX_EDIT_COUNT={MAX_EDIT_COUNT} />}
      {/* 내 정보 및 사주 시각화 카드 */}

      <div className="w-full max-w-lg bg-white/70 dark:bg-slate-800/60 rounded-2xl border border-indigo-50 dark:border-indigo-500/30 shadow-sm backdrop-blur-md mx-auto my-2">
        <div className="flex items-center justify-between  p-3 ">
          {userData?.birthDate && (
            <div className="mx-auto max-w-lg p-3 relative overflow-hidden group">
              {/* 다운로드 버튼 */}
              <button
                onClick={() => handleShareImg('share-card')}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all shadow-sm"
              >
                <FaDownload className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-300" />
              </button>

              {/* 상단 헤더 */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[15px] font-black tracking-[0.3em] text-indigo-400 dark:text-indigo-400/60 uppercase">
                  Who Am I
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-indigo-500/40 to-transparent"></div>
              </div>

              {/* 메인 콘텐츠 */}
              <div className="flex items-center gap-5">
                {/* 왼쪽: 일주 이미지 */}
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-400/10 blur-2xl rounded-full scale-150"></div>
                  <img
                    src={iljuImagePath}
                    className="relative w-28 h-28 sm:w-32 sm:h-32 object-contain transition-transform group-hover:scale-105 duration-500"
                    alt="ilju"
                  />
                </div>

                {/* 오른쪽: 텍스트 정보 */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="space-y-1 mb-3">
                    <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                      {language === 'ko'
                        ? ILJU_DATA?.[saju.sky1 + saju.grd1]?.title[gender]?.title
                        : ILJU_DATA_EN?.[saju.sky1 + saju.grd1]?.title[gender]?.title}
                    </div>
                    <p className="text-[12px] sm:text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 break-keep font-medium">
                      {language === 'ko'
                        ? ILJU_DATA?.[saju.sky1 + saju.grd1]?.title[gender]?.desc
                        : ILJU_DATA_EN?.[saju.sky1 + saju.grd1]?.title[gender]?.desc}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate('/basic')} // 👈 이동할 경로에 맞춰 수정하세요
                      className="flex items-center justify-center gap-1.5 w-fit px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all active:scale-95 shadow-md shadow-indigo-200 dark:shadow-none"
                    >
                      <span className="text-[11px] font-black tracking-tight">
                        {language === 'ko' ? '평생 운세 보기' : 'Analysis My Saju'}
                      </span>
                      <ArrowRightIcon className="w-3 h-3 stroke-[3px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 mb-3">
        <div className="mb-6 ml-1 text-left">
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {language === 'ko'
              ? '타고난 기운을 분석한 1:1 정밀 리포트'
              : 'Report based on my innate energy '}
          </p>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            {language === 'ko'
              ? '당신의 명식으로 풀어낸 맞춤 운세'
              : 'Personlised Korean Saju report'}
          </h2>
        </div>
        {/* 아이콘 */}
        <MainIcons />
      </div>
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 mb-3">
        <div className="mb-6 ml-1 text-left">
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {language === 'ko'
              ? '내 마음의 소리에 귀 기울이는 시간'
              : 'Time to listen to my inner sound'}
          </p>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            {language === 'ko' ? '감성 운세' : 'Emotional Fortune'}
          </h2>
        </div>
        {/* 아이콘 */}
        <SubIcons />
      </div>
    </div>
  );
}
