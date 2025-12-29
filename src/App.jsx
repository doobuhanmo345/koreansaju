// 1. React Core
import { useState, useEffect } from 'react';

// 2. External Libraries (Firebase, Icons)
import { doc, setDoc, increment } from 'firebase/firestore';
import { UserCircleIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SunIcon, HeartIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { FaHorseHead, FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';

// 3. Internal Config & API
import { db } from './lib/firebase';
import { fetchGeminiAnalysis } from './api/gemini';

// 4. Contexts
import { useAuthContext } from './context/useAuthContext';
import { useTheme } from './context/useThemeContext';
import { useLanguage } from './context/useLanguageContext';
import { useUsageLimit } from './context/useUsageLimit';

// 5. Custom Hooks
import { useConsumeEnergy } from './hooks/useConsumingEnergy';
import { useSajuCalculator } from './hooks/useSajuCalculator';
import { useModal } from './hooks/useModal';

// 6. Utils & Helpers
import { getPillars } from './utils/sajuCalculator';

// 7. Data & Constants
import { ILJU_DATA, ILJU_DATA_EN } from './data/ilju_data';
import { UI_TEXT, BD_EDIT_UI, langPrompt, hanja } from './data/constants';
import {
  STRICT_INSTRUCTION,
  DEFAULT_INSTRUCTION,
  DAILY_FORTUNE_PROMPT,
  NEW_YEAR_FORTUNE_PROMPT,
} from './data/aiResultConstants';
import { useLoading } from './context/useLoadingContext';
// 8. Components (UI & Features)
import SajuBlur from './component/SajuBlur';
import ModifyBd from './ui/ModifyBd';
import BeforeLogin from './page/BeforeLogin';
import { useNavigate } from 'react-router-dom';
import MainIcons from './component/MainIcons';
import SubIcons from './component/SubIcons';
export default function App() {
  // --- Context Hooks ---
  const { user, userData, login, iljuImagePath } = useAuthContext();
  const { language } = useLanguage();
  const {
    editCount,
    setEditCount, // 필요시 수동 조작용 (모달 등에서 사용)
    MAX_EDIT_COUNT,
    isLocked,
    incrementUsage,
    checkLimit,
  } = useUsageLimit(user, userData, language);
  const { theme } = useTheme();

  // --- Local States ---
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [gender, setGender] = useState('female');

  // 저장/수정 상태
  const [isSaved, setIsSaved] = useState(false);

  // 결과 상태
  const [resultType, setResultType] = useState(null); // 'main', 'year', 'daily'
  const [aiResult, setAiResult] = useState('');
  const [cachedData, setCachedData] = useState(null);

  // 모달 상태
  const { isModalOpen, openModal, closeModal } = useModal();

  // 로딩 상태
  // 어떤 파일이든 상단에서 이렇게 한 줄 쓰면 끝
  const {
    loading,
    setLoading,
    loadingType,
    setLoadingType,
    isCachedLoading,
    setIsCachedLoading,
    progress,
    setProgress,
  } = useLoading();
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

      if (userData.lastAiResult && userData.lastSaju) {
        setCachedData({
          saju: userData.lastSaju,
          result: userData.lastAiResult,
          prompt: userData.lastPrompt,
          language: userData.lastLanguage || 'en',
          gender: userData.lastGender || userData.gender,
        });
      }
    } else if (!user) {
      setIsSaved(false);
      setEditCount(0);
      setCachedData(null);
    }
  }, [user, userData]);

  // --- 2. 테마 적용 Effect ---
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // --- 3. 로딩바 Effect ---
  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(
        () => {
          setProgress((prev) => {
            if (prev >= 99) return 99;
            return prev + (isCachedLoading ? 25 : 1);
          });
        },
        isCachedLoading ? 50 : 232,
      );
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading, isCachedLoading]);

  const handleEditMode = () => {
    setIsSaved(false);
  };

  const handleCancelEdit = async () => {
    setIsSaved(true);
    if (user && userData) {
      if (userData.birthDate) setInputDate(userData.birthDate);
      if (userData.gender) setGender(userData.gender);
      if (userData.isTimeUnknown !== undefined) setIsTimeUnknown(userData.isTimeUnknown);
    }
  };

  const handleSaveMyInfo = async () => {
    if (!user) {
      alert(UI_TEXT.loginReq[language]);
      login();
      return;
    }

    if (window.confirm(UI_TEXT.saveConfirm[language])) {
      try {
        const todayStr = new Date().toLocaleDateString('en-CA');
        await setDoc(
          doc(db, 'users', user.uid),
          {
            birthDate: inputDate,
            gender,
            isTimeUnknown,
            updatedAt: new Date(),
            lastEditDate: todayStr,
            email: user.email,
          },
          { merge: true },
        );
        setIsSaved(true);
        alert(UI_TEXT.saveSuccess[language]);
      } catch (error) {
        console.error(error);
        alert(UI_TEXT.saveFail[language]);
      }
    }
  };

  // 분석 완료 여부 체크 (버튼 상태용)
  const todayStr = new Date().toLocaleDateString('en-CA');
  const nextYear = new Date().getFullYear() + 1;
  const sajuKeys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

  const checkSajuMatch = (targetSaju) => {
    if (!targetSaju) return false;
    return sajuKeys.every((key) => targetSaju[key] === saju[key]);
  };

  const dbUser = userData;

  const handleShareImg = async (id) => {
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
          <>
            <div className="flex items-center gap-3 text-sm tracking-tight">
              {/* 날짜와 시간 세트 */}
              <div className="flex items-center gap-1.5">
                <span className="text-indigo-500 dark:text-indigo-400 font-bold text-[10px] uppercase">
                  Birth
                </span>
                <span className="font-medium">
                  {userData.birthDate.split('T')[0].replace(/-/g, '.')}
                </span>
                <span className="text-slate-400 dark:text-slate-600 text-xs font-light">
                  {userData?.isTimeUnknown ? '시간 모름' : userData.birthDate.split('T')[1]}
                </span>
              </div>

              {/* 성별 배지 */}
              <div
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  userData.gender === 'male'
                    ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/30'
                    : 'bg-rose-50 text-rose-500 dark:bg-rose-900/30'
                }`}
              >
                {userData.gender === 'male' ? 'M' : 'F'}
              </div>
            </div>

            {/* 수정하기 버튼 */}
            <button
              onClick={() => {
                navigate('/editprofile');
              }}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4"
            >
              {language === 'ko' ? '수정하기' : 'Edit'}
            </button>
          </>
        ) : (
          <span className="text-xs text-slate-400 mx-auto">데이터가 없습니다.</span>
        )}
      </div>
      {/* 오늘의 운세 */}

      {language === 'en' ? (
        <div className="h-[150px] w-full max-w-lg bg-slate-900 rounded-xl overflow-hidden relative group mx-auto mb-2 shadow-lg border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 to-slate-900 opacity-100"></div>

          {/* 마스코트 이미지 */}
          <img
            src="/todaysluck.png"
            className="absolute bottom-[-20px] right-[-10px] h-[180px] sm:h-[180px] w-auto object-contain scale-125 transition-transform duration-500 pointer-events-none"
            alt="mascot"
          />

          {/* 콘텐츠 레이어 */}
          <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
            {/* 왼쪽 영역: 혜택 강조 */}
            <div className="flex flex-col items-start justify-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              <span className="text-[10px] text-amber-400 uppercase tracking-[0.2em] font-bold mb-1">
                {language === 'ko' ? 'SPECIAL GIFT' : 'SPECIAL GIFT'}
              </span>
              <div className="flex flex-col">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {language === 'ko' ? '무료' : 'FREE'}
                </span>
                <span className="text-sm font-bold text-white/90">
                  {language === 'ko' ? '30,000원 상당' : 'Worth $25'}
                </span>
              </div>
            </div>

            {/* 오른쪽 영역: 텍스트 및 버튼 */}
            <div className="flex flex-col items-end gap-3 pointer-events-auto">
              <div className="text-right drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                <h3 className="text-white text-lg sm:text-xl font-black leading-tight">
                  {language === 'ko' ? '피드백 주고 리포트 받기' : 'Give Feedback, Get Report'}
                </h3>
                <p className="text-white/70 text-[11px] mt-1">
                  {language === 'ko'
                    ? '정성스러운 의견을 기다립니다'
                    : 'Share your thoughts with us'}
                </p>
              </div>

              <button
                className="bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black px-6 py-2.5 rounded-full flex items-center gap-1 shadow-2xl transition-all active:scale-95"
                onClick={() => navigate('/feedback')}
              >
                {language === 'ko' ? '참여하기' : 'Feedback'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[150px] w-full max-w-lg bg-slate-900 rounded-xl overflow-hidden relative group mx-auto mb-2 shadow-lg border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 to-slate-900 opacity-100"></div>

          {/* 마스코트 이미지 */}
          <img
            src="/todaysluck.png"
            className="absolute bottom-[-20px] right-[-10px] h-[180px] sm:h-[180px] w-auto object-contain scale-125 transition-transform duration-500 pointer-events-none"
            alt="mascot"
          />

          {/* 콘텐츠 레이어 */}
          <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
            {/* 왼쪽: 점수 영역 */}
            <div className="flex flex-col items-start justify-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              <span className="text-[10px] text-white/60 uppercase tracking-[0.2em] font-bold mb-1">
                {language === 'ko' ? 'Daily Score' : 'Daily Score'}{' '}
                {/* 영어로 동일하더라도 구조 유지 */}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl sm:text-6xl font-black text-white">??</span>
                <span className="text-lg font-bold text-white/90">
                  {language === 'ko' ? '점' : 'pts'}
                </span>
              </div>
            </div>

            {/* 오른쪽: 버튼 영역 */}
            <div className="flex flex-col items-end gap-3 pointer-events-auto">
              <div className="text-right drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                <h3 className="text-white text-xl sm:text-2xl font-black leading-tight">
                  {language === 'ko' ? '오늘의 운세' : "Today's Luck"}
                </h3>
                <p className="text-white/70 text-[11px] mt-1">
                  {language === 'ko' ? '행운 리포트 확인' : 'Check Fortune Report'}
                </p>
              </div>

              <button
                className="bg-white hover:bg-indigo-50 text-black text-[11px] font-black px-6 py-2.5 rounded-full flex items-center gap-1 shadow-2xl transition-all active:scale-95"
                onClick={() => navigate('/todaysluck')}
              >
                {language === 'ko' ? '보러가기' : 'View More'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 로그인 안되어 있을 시 블러 처리 및 유도 */}
      {!user && <SajuBlur MAX_EDIT_COUNT={MAX_EDIT_COUNT} />}
      {/* 내 정보 및 사주 시각화 카드 */}
      <div className="w-full max-w-lg bg-white/70 dark:bg-slate-800/60 rounded-2xl border border-indigo-50 dark:border-indigo-500/30 shadow-sm backdrop-blur-md mx-auto my-2">
        {!userData?.birthDate && (
          <div className="mb-3 relative p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-sm backdrop-blur-sm">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-100 dark:bg-indigo-900 px-3 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-700">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 tracking-widest uppercase">
                <UserCircleIcon className="w-3 h-3" />
                <span>My Profile</span>
              </div>
            </div>

            <div className="absolute top-2 right-2">
              {isSaved ? (
                <button
                  onClick={handleEditMode}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-full transition-all"
                  title={BD_EDIT_UI.edit[language]}
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleCancelEdit}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            <ModifyBd
              gender={gender}
              inputDate={inputDate}
              isTimeUnknown={isTimeUnknown}
              setIsTimeUnknown={setIsTimeUnknown}
              saju={saju}
              handleSaveMyInfo={handleSaveMyInfo}
              setInputDate={setInputDate}
              isSaved={isSaved}
              setGender={setGender}
            />
          </div>
        )}
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
          {/* {!isSaved && user && saju?.sky1 && (
            <FourPillarVis isTimeUnknown={isTimeUnknown} saju={saju} />
          )} */}
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
      <div class="mx-auto w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 mb-3">
        <div class="mb-6 ml-1 text-left">
          <p class="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {language === 'ko'
              ? '내 마음의 소리에 귀 기울이는 시간'
              : 'Time to listen to my inner sound'}
          </p>
          <h2 class="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            {language === 'ko' ? '감성 운세' : 'Emotional Fortune'}
          </h2>
        </div>
        {/* 아이콘 */}
        <SubIcons />
      </div>
    </div>
  );
}
