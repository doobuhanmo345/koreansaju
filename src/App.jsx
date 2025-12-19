// 1. React Core
import { useState, useEffect } from 'react';

// 2. External Libraries (Firebase, Icons)
import { doc, setDoc } from 'firebase/firestore';
import {
  UserCircleIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { SunIcon, HeartIcon } from '@heroicons/react/24/solid';
import { FaHorseHead } from 'react-icons/fa';
import { GiCrystalBall } from 'react-icons/gi';

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
import processSajuData from './sajuDataProcessor';

// 7. Data & Constants
import { ILJU_DATA, ILJU_DATA_EN } from './data/ilju_data';
import { getRomanizedIlju } from './data/sajuInt';
import { UI_TEXT, BD_EDIT_UI, langPrompt, hanja } from './data/constants';
import {
  STRICT_INSTRUCTION,
  DEFAULT_INSTRUCTION,
  DAILY_FORTUNE_PROMPT,
  NEW_YEAR_FORTUNE_PROMPT,
} from './data/aiResultConstants';

// 8. Components (UI & Features)
import NavBar from './component/Navbar';
import LoginStatus from './component/LoginStatus';
import FourPillarVis from './component/FourPillarVis';
import AiSajuModal from './component/AiSajuModal';
import SajuBlur from './component/SajuBlur';
import AnalysisButton from './ui/AnalysisButton';
import ModifyBd from './ui/ModifyBd';
import LoadingBar from './ui/LoadingBar';
export default function App() {
  // --- Context Hooks ---
  const { user, userData, login } = useAuthContext();
  const {
    editCount,
    setEditCount, // 필요시 수동 조작용 (모달 등에서 사용)
    MAX_EDIT_COUNT,
    isLocked,
    incrementUsage,
    checkLimit,
  } = useUsageLimit();
  const { theme } = useTheme();
  const { language } = useLanguage();

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

  // 🔹 [복구] 공유용 텍스트 정제 함수

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
      if (data.ZLastDaily) {
        const {
          date,
          language: savedLang,
          saju: savedSaju,
          gender: savedGender,
          result,
        } = data.ZLastDaily;
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
      // const currentSajuKey = JSON.stringify(saju);
      // const cacheKey = `daily_fortune.${currentSajuKey}.${gender}.${todayDate}.${language}`;
      // let fortuneCache = data.fortune_cache || {};
      // fortuneCache[cacheKey] = result;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: newCount,
          lastEditDate: todayDate,
          // fortune_cache: fortuneCache,
          ZLastDaily: {
            result: result,
            date: todayDate,
            saju: saju,
            language: language,
            gender: gender,
          },
          dailyUsage: {
            [new Date().toLocaleDateString('en-CA')]: editCount + 1,
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
  const handleCompaAnalysis = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!isSaved) return alert(UI_TEXT.saveFirst[language]);
    setLoading(true);
    setLoadingType('compati');
    setResultType('compati');

    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];
    let isMatch = false;

    try {
      openModal();
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };
  const handleAiAnalysis = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!isSaved) return alert(UI_TEXT.saveFirst[language]);
    setLoading(true);
    setLoadingType('main');
    setResultType('main');

    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];
    let isMatch = false;

    try {
      const data = userData || {};
      const currentCount = data.editCount || 0;

      let isMatch = false;
      if (data.ZApiAnalysis) {
        const { language: savedLang, saju: savedSaju, gender: savedGender } = data.ZApiAnalysis;
        const isLangMatch = savedLang === language;
        const isGenderMatch = savedGender === gender;
        const isSajuMatch = savedSaju && keys.every((k) => savedSaju[k] === saju[k]);

        if (isLangMatch && isSajuMatch && isGenderMatch) {
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
      const newCount = editCount + 1;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: newCount,
          lastEditDate: new Date().toLocaleDateString('en-CA'),
          dailyUsage: {
            [new Date().toLocaleDateString('en-CA')]: editCount + 1,
          },
          ZApiAnalysis: {
            saju: saju,
            language: language,
            gender: gender,
          },
        },
        { merge: true },
      );

      setEditCount(newCount);
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
      if (data.ZLastNewYear) {
        const {
          year,
          language: savedLang,
          saju: savedSaju,
          result,
          gender: savedGender,
        } = data.ZLastNewYear;
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
      // const cacheKey = `new_year_fortune.${currentSajuJson}.${nextYear}.${language}`;
      // let fortuneCache = data.fortune_cache || {};
      // fortuneCache[cacheKey] = result;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: newCount,
          lastEditDate: new Date().toLocaleDateString('en-CA'),
          // fortune_cache: fortuneCache,
          ZLastNewYear: {
            result: result,
            year: nextYear,
            saju: saju,
            language: language,
            gender: gender,
          },
          dailyUsage: {
            [new Date().toLocaleDateString('en-CA')]: editCount + 1,
          },
        },
        { merge: true },
      );

      setEditCount(newCount);
      setAiResult(result);
      openModal();
    } catch (e) {
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
    dbUser?.ZApiAnalysis &&
    dbUser.ZApiAnalysis.language === language &&
    dbUser.ZApiAnalysis.gender === gender &&
    checkSajuMatch(dbUser.ZApiAnalysis.saju);

  const isYearDone =
    dbUser?.ZLastNewYear &&
    String(dbUser.ZLastNewYear.year) === String(nextYear) &&
    dbUser.ZLastNewYear.language === language &&
    dbUser.ZLastNewYear.gender === gender &&
    checkSajuMatch(dbUser.ZLastNewYear.saju);

  const isDailyDone =
    dbUser?.ZLastDaily &&
    dbUser.ZLastDaily.date === todayStr &&
    dbUser.ZLastDaily.language === language &&
    dbUser.ZLastDaily.gender === gender &&
    checkSajuMatch(dbUser.ZLastDaily.saju);

  // 에너지 훅 인스턴스 생성
  const mainEnergy = useConsumeEnergy();
  const yearEnergy = useConsumeEnergy();
  const dailyEnergy = useConsumeEnergy();
  const compaEnergy = useConsumeEnergy();
  // functions/index.js (부분 예시)
  // 한글 일주 이름('갑자')을 영어('gabja')로 변환

  const safeIlju = saju.sky1 ? getRomanizedIlju(saju.sky1 + saju.grd1) : 'gapja'; // 일주가 없으면 갑자로 대체
  const safeGender = gender ? gender.toLowerCase() : 'male'; // 성별 없으면 male로 대체

  // 최종 경로 생성
  const iljuImagePath = `/images/ilju/${safeIlju}_${safeGender}.png`;

  const iljuData = ILJU_DATA[saju.sky1 + saju.grd1] || {
    title: '갑자',
    desc: '데이터 없음',
    keywords: [],
  };

  return (
    <div className="relative px-3 py-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* <Test inputDate={inputDate} inputGender={gender} /> */}
      <NavBar />
      {/* 로그인이 안되어 있을 때는 LOGIN STATUS보이지 않음 */}
      {!!user && <LoginStatus MAX_EDIT_COUNT={MAX_EDIT_COUNT} />}

      {/* 로그인 안되어 있을 시 블러 처리 및 유도 */}
      {!user && <SajuBlur MAX_EDIT_COUNT={MAX_EDIT_COUNT} />}

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
          {isSaved && (
            <div className="mb-6 mx-auto max-w-md bg-indigo-50/50 dark:bg-slate-700/50 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-5 text-center shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-2 opacity-80">
                <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-indigo-300 dark:to-indigo-600"></div>
                <span className="text-[12px] font-black tracking-[0.3em] text-indigo-400 dark:text-indigo-400 uppercase drop-shadow-sm">
                  Who Am I?
                </span>
                <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-indigo-300 dark:to-indigo-600"></div>
              </div>
              <div className="text-indigo-400 dark:text-indigo-500 text-xs font-bold uppercase tracking-widest mb-1">
                <div className="flex-cols items-center justify-center gap-1 text-indigo-400 dark:text-indigo-500 text-xs font-bold uppercase tracking-widest mb-1">
                  <div className="flex items-center justify-center mx-auto">
                    <img src={iljuImagePath} className="w-1/2 h-1/2" />
                  </div>
                  <div>Signature</div>
                </div>
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-gray-800 dark:text-gray-100 font-serif mb-2">
                {language === 'ko' ? (
                  <>{ILJU_DATA?.[saju.sky1 + saju.grd1]?.title[gender]?.title}</>
                ) : (
                  <>{ILJU_DATA_EN?.[saju.sky1 + saju.grd1]?.title[gender]?.title}</>
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-keep">
                {language === 'ko' ? (
                  <>{ILJU_DATA?.[saju.sky1 + saju.grd1]?.title[gender]?.desc}</>
                ) : (
                  <>{ILJU_DATA_EN?.[saju.sky1 + saju.grd1]?.title[gender]?.desc}</>
                )}
              </div>
            </div>
          )}
          {!isSaved && user && saju?.sky1 && (
            <FourPillarVis isTimeUnknown={isTimeUnknown} saju={saju} />
          )}
        </div>
      </div>

      {/* 분석 버튼 영역 */}
      <div className="mt-4 mb-8  pt-4 border-t border-gray-200 dark:border-gray-700 max-w-xl m-auto px-4">
        {loading && (
          <LoadingBar
            progress={progress}
            loadingType={loadingType}
            isCachedLoading={isCachedLoading}
          />
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-[250px] md:h-[130px]">
          <AnalysisButton
            energy={mainEnergy}
            handleAnalysis={handleAiAnalysis}
            loading={loading}
            loadingType={loadingType}
            isSaved={isSaved}
            isLocked={isLocked}
            isAnalysisDone={isMainDone}
            icon={<GiCrystalBall className="w-8 h-8 text-violet-800  " />}
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
            icon={<FaHorseHead className="w-8 h-8 text-amber-800 opacity-70" />}
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
            icon={<SunIcon className="w-8 h-8 text-amber-500 opacity-80" />}
            buttonType={'daily'}
            textKo={'오늘의 운세'}
            TextEn={"Today's Luck"}
            subTextKo={'하루의 흐름 확인'}
            subTextEn={'Daily Guide'}
            colorType={'sky'}
          />
          <AnalysisButton
            energy={compaEnergy}
            handleAnalysis={handleCompaAnalysis}
            loading={loading}
            loadingType={loadingType}
            isSaved={isSaved}
            isLocked={isLocked}
            isAnalysisDone={false} // 개발용
            icon={<HeartIcon className="w-8 h-8 text-pink-800  " />}
            buttonType={'Compati'}
            textKo="궁합"
            TextEn="Compatibility"
            subTextKo="두 사람의 인연과 조화"
            subTextEn="Your Connection & Harmony"
            colorType={'pink'}
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
        setAiResult={setAiResult}
      />
    </div>
  );
}
