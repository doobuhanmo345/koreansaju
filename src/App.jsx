import { useState, useEffect } from 'react';
import { getPillars } from './utils/sajuCalculator';
import Test from './Test';
import { useSajuCalculator } from './hooks/useSajuCalculator';
import FourPillarVis from './component/FourPillarVis';
import processSajuData from './sajuDataProcessor';
import { UserCircleIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { doc, setDoc } from 'firebase/firestore';
import { useModal } from './hooks/useModal';
import { db } from './lib/firebase';
import { useAuthContext } from './context/useAuthContext';
import { useTheme } from './context/useThemeContext';
import { useLanguage } from './context/useLanguageContext';
import { fetchGeminiAnalysis } from './api/gemini';
import { UI_TEXT, BD_EDIT_UI, langPrompt, hanja } from './data/constants';
import {
  STRICT_INSTRUCTION,
  DEFAULT_INSTRUCTION,
  DAILY_FORTUNE_PROMPT,
  NEW_YEAR_FORTUNE_PROMPT,
} from './data/aiResultConstants';
import AiSajuModal from './component/AiSajuModal';
import useContactModal from './hooks/useContactModal';
import AnalysisButton from './ui/AnalysisButton';
import NavBar from './component/Navbar';
import ContactModal from './component/ContactModal';
import ModifyBd from './ui/ModifyBd';
import LoadingBar from './ui/LoadingBar';
import LoginStatus from './component/LoginStatus';

export default function App() {
  // --- Context Hooks ---
  const { user, userData, login } = useAuthContext();
  const { theme } = useTheme();
  const { language } = useLanguage();

  // --- Local States ---
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [gender, setGender] = useState('female');

  // 저장/수정 상태
  const [isSaved, setIsSaved] = useState(false);
  const [editCount, setEditCount] = useState(0);
  const MAX_EDIT_COUNT = 10;

  // 결과 상태
  const [resultType, setResultType] = useState(null); // 'main', 'year', 'daily'
  const [aiResult, setAiResult] = useState('');
  const [cachedData, setCachedData] = useState(null);

  // 모달 상태
  const { isModalOpen, openModal, closeModal } = useModal();
  const { isContactModalOpen, handleShowContact, handleCloseContact } = useContactModal();

  const isLocked = editCount >= MAX_EDIT_COUNT;

  // 로딩 상태
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);
  const [isCachedLoading, setIsCachedLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 입력 데이터
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
  const processedData = processSajuData(saju);

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

  // --- Handlers ---

  // 🔹 [복구] 에너지 소모 애니메이션 훅
  const useConsumeEnergy = () => {
    const [isConsuming, setIsConsuming] = useState(false);
    const triggerConsume = async (actionFn) => {
      setIsConsuming(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await actionFn();
      setIsConsuming(false);
    };
    return { isConsuming, triggerConsume };
  };

  // 🔹 [복구] 공유용 텍스트 정제 함수

  const handleEditMode = () => {
    if (isLocked) {
      alert(UI_TEXT.limitReached[language]);
      return;
    }
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

  // --- API Handlers (Daily, Main, Year) ---

  const handleDailyFortune = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!isSaved) return alert(UI_TEXT.saveFirst[language]);

    setLoading(true);
    setLoadingType('daily');
    setResultType('daily');
    setAiResult('');

    const todayDate = new Date().toLocaleDateString('en-CA');
    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

    try {
      const data = userData || {};
      const currentCount = data.editCount || 0;

      // 1. 캐시 체크
      let isMatch = false;
      if (data.lastDaily) {
        const {
          date,
          language: savedLang,
          saju: savedSaju,
          gender: savedGender,
          result,
        } = data.lastDaily;
        const isDateMatch = date === todayDate;
        const isLangMatch = savedLang === language;
        const isSajuMatch = savedSaju && keys.every((k) => savedSaju[k] === saju[k]);
        const isGenderMatch = savedGender === gender;

        if (isDateMatch && isLangMatch && isSajuMatch && isGenderMatch && result) {
          isMatch = true;
          setAiResult(result);
        }
      }

      if (isMatch) {
        openModal(); // viewMode 설정은 ResultModal 내부에서 처리
        setLoading(false);
        setLoadingType(null);
        return;
      }

      // 2. 횟수 제한 체크
      if (currentCount >= MAX_EDIT_COUNT) {
        setLoading(false);
        setLoadingType(null);
        return alert(UI_TEXT.limitReached[language]);
      }

      // 3. API 호출
      const userSajuText = `${saju.sky3}${saju.grd3}년(Year) ${saju.sky2}${saju.grd2}월(Month) ${saju.sky1}${saju.grd1}일(Day) ${saju.sky0}${saju.grd0}시(Time)`;
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const todayPillars = getPillars(today);
      const tomorrowPillars = getPillars(tomorrow);

      if (!todayPillars || !tomorrowPillars) return;

      const todaySajuText = `${todayPillars.sky3}${todayPillars.grd3}년(Year) ${todayPillars.sky2}${todayPillars.grd2}월(Month) ${todayPillars.sky1}${todayPillars.grd1}일(Day)`;
      const tomorrowSajuText = `${tomorrowPillars.sky3}${tomorrowPillars.grd3}년(Year) ${tomorrowPillars.sky2}${tomorrowPillars.grd2}월(Month) ${tomorrowPillars.sky1}${tomorrowPillars.grd1}일(Day)`;

      const genderInfo = `[User Gender] ${gender}`;
      const sajuInfo = `[User Saju] ${userSajuText} / [Today: ${todayPillars.date}] ${todaySajuText} / [Tomorrow: ${tomorrowPillars.date}] ${tomorrowSajuText}`;
      const strictPrompt = STRICT_INSTRUCTION[language];
      const fullPrompt = `${strictPrompt}\n${DAILY_FORTUNE_PROMPT[language]}\n${genderInfo}\n${sajuInfo}\n${langPrompt(language)}\n${hanja(language)}`;

      const result = await fetchGeminiAnalysis(fullPrompt);
      const newCount = currentCount + 1;

      // 4. 저장
      const currentSajuKey = JSON.stringify(saju);
      const cacheKey = `daily_fortune.${currentSajuKey}.${gender}.${todayDate}.${language}`;
      let fortuneCache = data.fortune_cache || {};
      fortuneCache[cacheKey] = result;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: newCount,
          lastEditDate: todayDate,
          fortune_cache: fortuneCache,
          lastDaily: {
            result: result,
            date: todayDate,
            saju: saju,
            language: language,
            gender: gender,
          },
        },
        { merge: true },
      );

      setEditCount(newCount);
      setAiResult(result);
      openModal();
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleAiAnalysis = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!isSaved) return alert(UI_TEXT.saveFirst[language]);

    setLoadingType('main');
    setResultType('main');

    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];
    let isMatch = false;
    if (cachedData && cachedData.saju) {
      if (cachedData.language === language && cachedData.gender === gender) {
        const isSajuMatch = keys.every((key) => cachedData.saju[key] === saju[key]);
        if (isSajuMatch) isMatch = true;
      }
    }

    if (isMatch) {
      setAiResult(cachedData.result);
      openModal();
      setLoadingType(null);
      return;
    }

    if (editCount >= MAX_EDIT_COUNT) {
      alert(UI_TEXT.limitReached[language]);
      setLoading(false);
      setLoadingType(null);
      return;
    }

    setLoading(true);
    setAiResult('');
    setIsCachedLoading(false);

    try {
      const currentSajuKey = JSON.stringify(saju);
      const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${inputDate}, 팔자:${currentSajuKey}`;
      const strictPrompt = STRICT_INSTRUCTION[language];
      const fullPrompt = `${strictPrompt}\n${DEFAULT_INSTRUCTION[language]}\n${sajuInfo}\n${langPrompt(language)}\n${hanja(language)}`;

      const result = await fetchGeminiAnalysis(fullPrompt);
      const newCount = editCount + 1;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          lastAiResult: result,
          lastSaju: saju,
          lastPrompt: DEFAULT_INSTRUCTION,
          lastLanguage: language,
          lastGender: gender,
          editCount: newCount,
        },
        { merge: true },
      );

      setEditCount(newCount);
      setCachedData({
        saju: saju,
        result: result,
        prompt: DEFAULT_INSTRUCTION,
        language: language,
        gender: gender,
      });
      setAiResult(result);
      openModal();
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleNewYearFortune = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!isSaved) return alert(UI_TEXT.saveFirst[language]);

    setLoading(true);
    setLoadingType('year');
    setResultType('year');
    setAiResult('');

    const nextYear = new Date().getFullYear() + 1;
    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

    try {
      const data = userData || {};
      const currentCount = data.editCount || 0;

      let isMatch = false;
      if (data.lastNewYear) {
        const {
          year,
          language: savedLang,
          saju: savedSaju,
          result,
          gender: savedGender,
        } = data.lastNewYear;
        const isYearMatch = String(year) === String(nextYear);
        const isLangMatch = savedLang === language;
        const isGenderMatch = savedGender === gender;
        const isSajuMatch = savedSaju && keys.every((k) => savedSaju[k] === saju[k]);

        if (isYearMatch && isLangMatch && isSajuMatch && isGenderMatch && result) {
          setAiResult(result);
          openModal();
          setLoading(false);
          setLoadingType(null);
          return;
        }
      }

      if (currentCount >= MAX_EDIT_COUNT) {
        setLoading(false);
        setLoadingType(null);
        return alert(UI_TEXT.limitReached[language]);
      }

      const currentSajuJson = JSON.stringify(saju);
      const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${inputDate}, 팔자:${currentSajuJson}`;
      const strictPrompt = STRICT_INSTRUCTION[language];
      const fullPrompt = `${strictPrompt}\n${NEW_YEAR_FORTUNE_PROMPT[language]}\n${sajuInfo}\n${langPrompt(language)}\n${hanja(language)}`;

      const result = await fetchGeminiAnalysis(fullPrompt);
      const newCount = currentCount + 1;
      const cacheKey = `new_year_fortune.${currentSajuJson}.${nextYear}.${language}`;
      let fortuneCache = data.fortune_cache || {};
      fortuneCache[cacheKey] = result;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: newCount,
          lastEditDate: new Date().toLocaleDateString('en-CA'),
          fortune_cache: fortuneCache,
          lastNewYear: {
            result: result,
            year: nextYear,
            saju: saju,
            language: language,
            gender: gender,
          },
        },
        { merge: true },
      );

      setEditCount(newCount);
      setAiResult(result);
      openModal();
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
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

  const isMainDone =
    (cachedData &&
      checkSajuMatch(cachedData.saju) &&
      cachedData.language === language &&
      cachedData.gender === gender) ||
    (dbUser &&
      checkSajuMatch(dbUser.lastSaju) &&
      dbUser.lastLanguage === language &&
      dbUser.lastGender === gender);

  const isYearDone =
    dbUser?.lastNewYear &&
    String(dbUser.lastNewYear.year) === String(nextYear) &&
    dbUser.lastNewYear.language === language &&
    dbUser.lastNewYear.gender === gender &&
    checkSajuMatch(dbUser.lastNewYear.saju);

  const isDailyDone =
    dbUser?.lastDaily &&
    dbUser.lastDaily.date === todayStr &&
    dbUser.lastDaily.language === language &&
    dbUser.lastDaily.gender === gender &&
    checkSajuMatch(dbUser.lastDaily.saju);

  // 에너지 훅 인스턴스 생성
  const mainEnergy = useConsumeEnergy();
  const yearEnergy = useConsumeEnergy();
  const dailyEnergy = useConsumeEnergy();

  return (
    <div className="relative px-3 py-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Test />
      <NavBar onShowContact={handleShowContact} />
      {isContactModalOpen && (
        <ContactModal onClose={handleCloseContact} email="doobuhanmo3@gmail.com" />
      )}

      <LoginStatus MAX_EDIT_COUNT={MAX_EDIT_COUNT} />

      {/* 로그인 안되어 있을 시 블러 처리 및 유도 */}
      {!user && (
        <div className="absolute inset-x-0 h-[450px] z-10 backdrop-blur-sm flex justify-center items-center">
          <div className="relative w-[260px]">
            <div className="absolute -top-[180px] w-full p-4 bg-gray-300/15 dark:bg-white/15 backdrop-blur-lg rounded-xl shadow-2xl dark:shadow-black/20 shadow-black/40 flex flex-col items-center justify-center space-y-4 mx-auto border border-gray-300/30 dark:border-gray-700/40">
              {language === 'en' ? (
                <p className="text-md font-extrabold text-gray-900 dark:text-white drop-shadow-md">
                  Login to get <span className="text-amber-500">{MAX_EDIT_COUNT} daily ⚡️</span>
                </p>
              ) : (
                <p className="text-sm font-extrabold text-gray-900 dark:text-white drop-shadow-lg">
                  <span className="text-amber-500">매일 ⚡️{MAX_EDIT_COUNT}개 혜택</span>을 <br />{' '}
                  지금 바로 받으세요!
                </p>
              )}

              <button
                className="w-full py-3 bg-amber-400 text-gray-900 font-extrabold text-md rounded-xl hover:bg-amber-500 active:bg-yellow-500 transition-all duration-150 transform hover:scale-[1.03] shadow-xl shadow-amber-500/60 flex items-center justify-center space-x-2"
                onClick={login}
              >
                {language !== 'en' && (
                  <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
                  </svg>
                )}
                <span className="text-white">
                  {language === 'en' ? (
                    `FREE ACCESS UPON LOGIN`
                  ) : (
                    <>
                      <span className="text-md font-black">1초 로그인</span>으로 사주 보기
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 내 정보 및 사주 시각화 카드 */}
      <div className="w-full max-w-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl mx-auto my-4">
        <div className="flex flex-col m-2">
          <div className="mb-3 relative p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-sm backdrop-blur-sm">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-100 dark:bg-indigo-900 px-3 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-700">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 tracking-widest uppercase">
                <UserCircleIcon className="w-3 h-3" />
                <span>My Profile</span>
              </div>
            </div>

            <div className="absolute top-2 right-2">
              {isLocked ? (
                <span className="text-[10px] text-red-500 font-bold px-2">
                  {UI_TEXT.lockedMsg[language]}
                </span>
              ) : isSaved ? (
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
              saju={saju}
              handleSaveMyInfo={handleSaveMyInfo}
              setInputDate={setInputDate}
              isSaved={isSaved}
              setGender={setGender}
            />
          </div>

          {user && saju?.sky1 && <FourPillarVis isTimeUnknown={isTimeUnknown} saju={saju} />}
        </div>
      </div>

      {/* 분석 버튼 영역 */}
      <div className="my-4 pt-4 border-t border-gray-200 dark:border-gray-700 max-w-xl m-auto px-4">
        {loading && (
          <LoadingBar
            progress={progress}
            loadingType={loadingType}
            isCachedLoading={isCachedLoading}
          />
        )}

        <div className="flex justify-between gap-3 h-32">
          <AnalysisButton
            energy={mainEnergy}
            handleAnalysis={handleAiAnalysis}
            loading={loading}
            loadingType={loadingType}
            isSaved={isSaved}
            isLocked={isLocked}
            isAnalysisDone={isMainDone}
            icon={'🔮'}
            buttonType={'main'}
            textKo={'사주 분석'}
            TextEn={'Life Path Decoding'}
            subTextKo={'타고난 운명 파악'}
            subTextEn={'Discover your Fate'}
            colorType={'indigo'}
          />

          <AnalysisButton
            energy={yearEnergy}
            handleAnalysis={handleNewYearFortune}
            loading={loading}
            loadingType={loadingType}
            redBadge={true}
            isSaved={isSaved}
            isLocked={isLocked}
            isAnalysisDone={isYearDone}
            icon={'🐍'}
            buttonType={'year'}
            textKo={'2026 신년 운세'}
            TextEn={'2026 Path Guide'}
            subTextKo={'미리보는 1년 계획'}
            subTextEn={'Yearly Forecast'}
            colorType={'blue'}
          />

          <AnalysisButton
            energy={dailyEnergy}
            handleAnalysis={handleDailyFortune}
            loading={loading}
            loadingType={loadingType}
            isSaved={isSaved}
            isLocked={isLocked}
            isAnalysisDone={isDailyDone}
            icon={'🌞'}
            buttonType={'daily'}
            textKo={'오늘의 운세'}
            TextEn={"Today's Luck"}
            subTextKo={'하루의 흐름 확인'}
            subTextEn={'Daily Guide'}
            colorType={'sky'}
          />
        </div>
      </div>

      {/* 🟢 분리된 모달 컴포넌트 사용 */}
      <AiSajuModal
        isOpen={isModalOpen}
        onClose={closeModal}
        isLocked={isLocked}
        editCount={editCount}
        setEditCount={setEditCount} // 채팅에서 카운트 차감 시 필요
        maxEditCount={MAX_EDIT_COUNT}
        saju={saju}
        inputDate={inputDate}
        gender={gender}
        processedData={processedData}
        isTimeUnknown={isTimeUnknown}
        resultType={resultType}
        aiResult={aiResult}
      />
    </div>
  );
}
