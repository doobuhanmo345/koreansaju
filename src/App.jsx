import { useState, useEffect, useRef } from 'react';
import { onSnapshot, updateDoc } from 'firebase/firestore'; // 상단 import 확인
import EnergyBadge from './ui/EnergyBadge';
import { useShareActions } from './hooks/useShareAction';
import { useTimer } from './hooks/useTimer';
import { getPillars } from './utils/sajuCalculator';
import { useSajuCalculator } from './hooks/useSajuCalculator';
import { jiStyle, pillarLabelStyle, iconsViewStyle, pillarStyle } from './data/style';
import FourPillarVis from './component/FourPillarVis';
import processSajuData from './sajuDataProcessor';
import {
  GlobeAltIcon,
  ChevronLeftIcon,
  TicketIcon,
  ShareIcon,
  SparklesIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  ArrowRightStartOnRectangleIcon, // 로그아웃용
  PencilSquareIcon, // 수정용
  XMarkIcon, // 취소용
  BoltIcon,
} from '@heroicons/react/24/outline';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { useModal } from './hooks/useModal';
// Local Imports
import { login, logout, onUserStateChange, db } from './lib/firebase';
import { fetchGeminiAnalysis } from './api/gemini';
import {
  UI_TEXT,
  STRICT_INSTRUCTION,
  DEFAULT_INSTRUCTION,
  DAILY_FORTUNE_PROMPT,
  NEW_YEAR_FORTUNE_PROMPT,
  BD_EDIT_UI,
  IljuExp,
  langPrompt,
  hanja,
  jijiText,
} from './data/constants';
import { iljuNameList } from './data/iljuNameList';
import { classNames, getIcon, getHanja, getEng, getLoadingText, bgToBorder } from './utils/helpers';
import sajaProfile from './assets/sajaProfile.png';
import useLocalStorage from './hooks/useLocalStorage';
import useContactModal from './hooks/useContactModal';
import AnalysisButton from './ui/AnalysisButton';
import NavBar from './component/Navbar';
import ContactModal from './component/ContactModal';
// 💡 추가된 텍스트 상수

export default function App() {
  // --- States ---
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.theme || 'light');
  const [language, setLanguage] = useLocalStorage('userLanguage', 'en');
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [gender, setGender] = useState('female');
  const [qLoading, setQLoading] = useState(false);

  // 🔒 저장 및 수정 횟수 관리
  const [isSaved, setIsSaved] = useState(false);
  const [editCount, setEditCount] = useState(0);
  const MAX_EDIT_COUNT = 10;
  const [resultType, setResultType] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [viewMode, setViewMode] = useState('result');
  const chatEndRef = useRef(null);
  const { isModalOpen, openModal, closeModal } = useModal();
  const isLocked = editCount >= MAX_EDIT_COUNT;
  const isInputDisabled = isLocked || isSaved;
  // 팝업/모달 상태를 관리합니다.
  const { isContactModalOpen, handleShowContact, handleCloseContact } = useContactModal();
  // 💾 캐싱 데이터
  const [cachedData, setCachedData] = useState(null);

  // 🔄 로딩 상태 관리 (어떤 버튼이 로딩 중인지 구분)
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null); // 'main', 'year', 'daily'
  const [isCachedLoading, setIsCachedLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [inputDate, setInputDate] = useState(() => {
    try {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    } catch (e) {
      return '2024-01-01T00:00';
    }
  });

  const [containerWidth, setContainerWidth] = useState(470);
  const [aiResult, setAiResult] = useState('');
  const { isCopied, handleCopyResult, handleShare } = useShareActions(aiResult);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userPrompt, setUserPrompt] = useState(DEFAULT_INSTRUCTION);
  const [customQuestion, setCustomQuestion] = useState('');

  const [dbUser, setDbUser] = useState(null);
  // [상단] useState, useEffect 추가 필요
  const timeLeft = useTimer(editCount);
  const saju = useSajuCalculator(inputDate, isTimeUnknown).saju;
  const processedData = processSajuData(saju);
  const {
    sigan,
    ilgan,
    wolgan,
    yeongan,
    sijidata,
    siji,
    sijiji,
    iljidata,
    ilji,
    iljiji,
    woljidata,
    wolji,
    woljiji,
    yeonjidata,
    yeonji,
    yeonjiji,
  } = processedData;
  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setDbUser(doc.data()); // DB가 변경될 때마다 dbUser를 최신으로 업데이트
        }
      });
      return () => unsubscribe();
    } else {
      setDbUser(null);
    }
  }, [user]);
  // --- Effects ---
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.theme = theme;
  }, [theme]);

  // 로그인 & 데이터 불러오기
  useEffect(() => {
    let unsubscribe; // onUserStateChange의 구독 해제 함수를 저장할 변수

    // onUserStateChange는 Firebase Auth의 onAuthStateChanged 역할을 가정합니다.
    unsubscribe = onUserStateChange(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // 1. 로그인 상태: Firestore에서 사용자 데이터 로드
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();

            // 1-1. 기본 사용자 정보 로드
            if (data.birthDate) {
              setInputDate(data.birthDate);
              setIsSaved(true);
            }
            if (data.gender) setGender(data.gender);
            if (data.isTimeUnknown !== undefined) setIsTimeUnknown(data.isTimeUnknown);

            // 1-2. ⭐ EditCount 리셋 및 lastLoginDate 처리 핵심 로직 ⭐
            // ⚠️ new Date().toLocaleDateString('en-CA') 구문 오류 수정 완료
            const todayStr = new Date().toLocaleDateString('en-CA');
            const lastLoginDate = data.lastLoginDate;

            // lastLoginDate가 없거나 (기존 사용자), 오늘 날짜와 다를 경우 (다음 날)
            if (!lastLoginDate || lastLoginDate !== todayStr) {
              // EditCount를 0으로 리셋 (UI 상태)
              setEditCount(0);

              // DB 업데이트: lastLoginDate와 editCount를 동시에 갱신/생성
              try {
                // userDocRef와 db가 상위 스코프에서 유효하다고 가정합니다.
                await updateDoc(userDocRef, {
                  lastLoginDate: todayStr, // 오늘 날짜 기록
                  editCount: 0, // DB의 카운트도 0으로 리셋
                });
              } catch (e) {
                console.error('EditCount/LoginDate DB 업데이트 실패:', e);
              }
            } else {
              // lastLoginDate가 오늘 날짜와 같을 경우: DB 값 사용
              setEditCount(data.editCount || 0);
            }
            // ⭐ 핵심 로직 끝 ⭐

            // 1-3. 캐시된 AI 결과 로드
            if (data.lastAiResult && data.lastSaju) {
              setCachedData({
                saju: data.lastSaju,
                result: data.lastAiResult,
                prompt: data.lastPrompt,
                language: data.lastLanguage || 'en',
                gender: data.lastGender || data.gender,
              });
            }
          } else {
            // DB에 문서가 없는 경우: 초기 상태 설정
            setIsSaved(false);
            setEditCount(0);
            setCachedData(null);
            // ⚠️ 신규 사용자 문서 생성 로직이 이 else 블록 내에 필요할 수 있습니다.
          }
        } catch (error) {
          console.error('정보 불러오기 실패:', error);
          // 에러 발생 시 초기 상태 설정
          setIsSaved(false);
          setEditCount(0);
          setCachedData(null);
        }
      } else {
        // 2. 로그아웃 상태: 모든 상태 초기화
        setIsSaved(false);
        setEditCount(0);
        setCachedData(null);
        // 추가적인 상태 초기화 필요 (setInputDate, setGender 등)
      }
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe && unsubscribe();
  }, []); // 의존성 배열이 비어 있어 마운트 시 한 번만 실행됨
  // 만세력 계산

  // 로딩 애니메이션

  useEffect(() => {
    let interval;

    if (loading) {
      setProgress(0);

      // ⭐ 23초에 맞추기 위한 간격 계산: 232ms 사용
      const intervalDuration = 232;

      interval = setInterval(
        () => {
          setProgress((prev) => {
            if (prev >= 99) return 99;

            let increment = 0;
            if (isCachedLoading) {
              // 캐시 로딩: 빠르게 25씩 증가
              increment = 25;
            } else {
              // 일반 로딩: 매 232ms마다 1%씩 증가
              increment = 1;
            }

            return prev + increment;
          });
        },
        isCachedLoading ? 50 : intervalDuration,
      ); // 간격 동적 변경
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading, isCachedLoading]);
  // 이 블록만 남아있어야 합니다.

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatList, qLoading]);

  // --- Handlers ---

  const handleEditMode = () => {
    if (isLocked) {
      alert(UI_TEXT.limitReached[language]);
      return;
    }
    setIsSaved(false);
  };

  const handleCancelEdit = async () => {
    setIsSaved(true);
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.birthDate) setInputDate(data.birthDate);
          if (data.gender) setGender(data.gender);
          if (data.isTimeUnknown !== undefined) setIsTimeUnknown(data.isTimeUnknown);
        }
      } catch (error) {
        console.error('원상복구 실패:', error);
      }
    }
  };

  const handleSaveMyInfo = async () => {
    // 1. 로그인 체크는 유지
    if (!user) {
      alert(UI_TEXT.loginReq[language]);
      login();
      return;
    }

    // [삭제됨] 횟수 제한 체크 로직 (if (editCount >= MAX_EDIT_COUNT)...)

    if (window.confirm(UI_TEXT.saveConfirm[language])) {
      try {
        const todayStr = new Date().toLocaleDateString('en-CA');

        // [삭제됨] 새 카운트 계산 (const newCount = editCount + 1;)

        await setDoc(
          doc(db, 'users', user.uid),
          {
            birthDate: inputDate,
            gender,
            isTimeUnknown,
            updatedAt: new Date(),
            lastEditDate: todayStr,
            // [삭제됨] editCount: newCount 필드 업데이트 제외
            email: user.email,
          },
          { merge: true },
        );

        // [삭제됨] UI 카운트 업데이트 (setEditCount(newCount);)

        setIsSaved(true);
        alert(UI_TEXT.saveSuccess[language]);
      } catch (error) {
        console.error(error);
        alert(UI_TEXT.saveFail[language]);
      }
    }
  };

  // 컴포넌트 상단이나 별도 파일에 정의
  const useConsumeEnergy = () => {
    const [isConsuming, setIsConsuming] = useState(false);

    const triggerConsume = async (actionFn) => {
      // 1. 애니메이션 시작 (반짝!)
      setIsConsuming(true);

      // 2. 애니메이션 시간만큼 대기 (0.3초)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 3. 실제 기능 실행 (API 호출 등)
      await actionFn();

      // 4. 상태 초기화
      setIsConsuming(false);
    };

    return { isConsuming, triggerConsume };
  };

  const handleShareResult = async () => {
    // 1. 공유할 전체 텍스트를 미리 만듭니다. (결과 + 링크)
    const shareTitle = '내 사주 분석 결과';
    const shareText = `${aiResult}\n\n👇 나도 분석하러 가기 👇\n${window.location.href}`;

    // 2. 모바일 네이티브 공유하기
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          // 💥 중요: url 필드를 넣지 마세요!
          // url: window.location.href  <-- 이걸 넣으면 텍스트가 씹히는 경우가 많음
        });
      } catch (err) {
        console.log('공유 취소됨');
      }
    } else {
      // 3. PC 등 지원 안 하는 경우 -> 클립보드 복사
      try {
        await navigator.clipboard.writeText(shareText);
        alert('결과와 링크가 복사되었습니다! 친구에게 붙여넣기(Ctrl+V) 해보세요.');
      } catch (err) {
        alert('복사에 실패했습니다.');
      }
    }
  };
  // 💡 [추가] 초기 인사말 생성 함수
  const getInitialGreeting = (lang, birthDate, saju, tFunc) => {
    const formattedDate = birthDate.replace('T', ' ');
    // 사주 텍스트 (예: 갑자년 을축월 병인일 정묘시)
    const sajuText = `${tFunc(saju.sky3)}${tFunc(saju.grd3)}년 ${tFunc(saju.sky2)}${tFunc(saju.grd2)}월 ${tFunc(saju.sky1)}${tFunc(saju.grd1)}일 ${tFunc(saju.sky0)}${tFunc(saju.grd0)}시`;
    const sajuTextEng = `Year:${tFunc(saju.sky3)}${tFunc(saju.grd3)} Month:${tFunc(saju.sky2)}${tFunc(saju.grd2)} Day:${tFunc(saju.sky1)}${tFunc(saju.grd1)} Time:${tFunc(saju.sky0)}${tFunc(saju.grd0)}`;
    if (lang === 'ko') {
      return `안녕하세요. 사자입니다.\n\n당신이 입력한 생년월일·시 [${formattedDate}]와\n만세력 데이터 [${sajuText}]를 기반으로 운세를 분석합니다.\n\n질문을 하시면 하루에 사용 가능한 토큰이 1개씩 차감됩니다.\n오늘 남은 토큰을 소중하게 사용해 주세요.\n\n준비되셨다면, 알고 싶은 것을 질문해 주세요.`;
    } else {
      return `Hello, I am your Saju Master.\n\nI analyze your fortune based on your birth data [${formattedDate}]\nand Four Pillars [${sajuTextEng}].\n\nEach time you ask a question, one token from your daily limit will be deducted.\nPlease use your remaining tokens wisely.\n\nWhen you’re ready, ask your first question.`;
    }
  };
  // [수정] setViewMode 함수 (항상 초기 인사말이 맨 위에 뜨도록 변경)
  const handleSetViewMode = async (mode) => {
    setViewMode(mode);

    if (mode === 'chat' && user) {
      setQLoading(true); // 로딩 시작
      const currentSajuKey = createSajuKey(saju);

      // 1. 기본 인사말 생성 (조건 없이 항상 생성)
      const greetingMsg = getInitialGreeting(language, inputDate, saju, t);
      const greetingObj = { role: 'ai', text: greetingMsg };

      if (currentSajuKey) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          const data = userSnap.exists() ? userSnap.data() : {};

          // 해당 사주 키의 기록만 가져옴
          const sajuRecords = data.chat_records || {};
          let currentSajuHistory = sajuRecords[currentSajuKey] || [];

          // 시간 순으로 정렬
          currentSajuHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          // 채팅 리스트 형식으로 변환
          let historyList = currentSajuHistory
            .map((item) => [
              { role: 'user', text: item.question },
              { role: 'ai', text: item.answer },
            ])
            .flat();

          // ✨ [핵심 수정] 기록 유무와 상관없이 인사말을 맨 앞에 결합
          setChatList([greetingObj, ...historyList]);
        } catch (error) {
          console.error('채팅 이력 불러오기 오류:', error);
          // 오류 나도 인사말은 보여줌
          setChatList([greetingObj]);
        }
      } else {
        // 사주 키가 없는 경우에도 인사말은 보여줌
        setChatList([greetingObj]);
      }
      setQLoading(false); // 로딩 종료
    }
  };
  const createSajuKey = (saju) => {
    if (!saju || !saju.grd1) return null;
    return [
      saju.sky0,
      saju.grd0,
      saju.sky1,
      saju.grd1,
      saju.sky2,
      saju.grd2,
      saju.sky3,
      saju.grd3,
    ].join('-');
  };

  const saveAndCapChatRecord = async (userId, sajuKey, question, answer) => {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    let data = userSnap.exists() ? userSnap.data() : {};
    let sajuRecords = data.chat_records || {};
    let currentSajuHistory = sajuRecords[sajuKey] || [];
    const newRecord = { question, answer, timestamp: new Date().toISOString(), id: Date.now() };
    currentSajuHistory.push(newRecord);
    currentSajuHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    if (currentSajuHistory.length > 5) {
      currentSajuHistory = currentSajuHistory.slice(currentSajuHistory.length - 5);
    }
    sajuRecords[sajuKey] = currentSajuHistory;
    await setDoc(userDocRef, { chat_records: sajuRecords, updatedAt: new Date() }, { merge: true });
  };

  const handleDailyFortune = async () => {
    // 1. 기본 체크
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!isSaved) return alert(UI_TEXT.saveFirst[language]);

    setLoading(true);

    setLoadingType('daily');
    setResultType('daily');
    setAiResult(''); // 비교를 위한 기준 데이터 준비

    const todayDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.exists() ? userSnap.data() : {}; // 현재 DB에 저장된 행동력(크레딧) 가져오기

      const currentCount = userData.editCount || 0; // 💥 [Step 1] 저장된 최신 결과(lastDaily)와 현재 조건 4가지 비교 (성별 추가)

      let isMatch = false;
      if (userData.lastDaily) {
        const {
          date,
          language: savedLang,
          saju: savedSaju,
          gender: savedGender,
          result,
        } = userData.lastDaily; // 👈 gender 추가
        // ① 날짜가 오늘인가?

        const isDateMatch = date === todayDate; // ② 언어 설정이 같은가?
        const isLangMatch = savedLang === language; // ③ 사주 팔자(8글자)가 완전히 같은가?
        const isSajuMatch = savedSaju && keys.every((k) => savedSaju[k] === saju[k]);
        // ④ 성별 설정이 같은가?
        const isGenderMatch = savedGender === gender; // 👈 성별 비교 추가
        // 넷 다 맞을 때만 '일치'로 판정

        if (isDateMatch && isLangMatch && isSajuMatch && isGenderMatch && result) {
          // 👈 조건 변경
          isMatch = true;
          setAiResult(result); // 저장된 결과 사용
        }
      } // 💥 [Step 2] 일치하면 -> 크레딧 차감 없이 바로 보여줌 (무료)

      if (isMatch) {
        setIsSuccess(true);
        openModal();
        setViewMode('result');
        setLoading(false);
        setLoadingType(null);
        return; // 여기서 함수 종료!
      } // 💥 [Step 3] 불일치하면 -> 여기서부터 유료 (크레딧 체크 & 차감)
      // (1) 크레딧 부족한지 확인

      if (currentCount >= MAX_EDIT_COUNT) {
        setLoading(false);
        setLoadingType(null);
        return alert(UI_TEXT.limitReached[language]);
      } // (2) API 호출을 위한 프롬프트 구성 (성별 정보 추가)

      const userSajuText = `${saju.sky3}${saju.grd3}년(Year) ${saju.sky2}${saju.grd2}월(Month) ${saju.sky1}${saju.grd1}일(Day) ${saju.sky0}${saju.grd0}시(Time)`;

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const todayPillars = getPillars(today);
      const tomorrowPillars = getPillars(tomorrow);

      if (!todayPillars || !tomorrowPillars) return;

      const todaySajuText = `${todayPillars.sky3}${todayPillars.grd3}년(Year) ${todayPillars.sky2}${todayPillars.grd2}월(Month) ${todayPillars.sky1}${todayPillars.grd1}일(Day)`;
      const tomorrowSajuText = `${tomorrowPillars.sky3}${tomorrowPillars.grd3}년(Year) ${tomorrowPillars.sky2}${tomorrowPillars.grd2}월(Month) ${tomorrowPillars.sky1}${tomorrowPillars.grd1}일(Day)`; // 프롬프트에 성별 정보 명시 (해석의 정확도 향상)

      const genderInfo = `[User Gender] ${gender}`;
      const sajuInfo = `[User Saju] ${userSajuText} / [Today: ${todayPillars.date}] ${todaySajuText} / [Tomorrow: ${tomorrowPillars.date}] ${tomorrowSajuText}`;
      const strictPrompt = STRICT_INSTRUCTION[language];
      const fullPrompt = `${strictPrompt}\n${DAILY_FORTUNE_PROMPT[language]}\n${genderInfo}\n${sajuInfo}\n${langPrompt(language)}\n${hanja(language)}`; // 👈 genderInfo 추가
      // (3) 실제 AI 호출

      const result = await fetchGeminiAnalysis(fullPrompt); // (4) 크레딧 1 차감 (DB값 + 1)

      const newCount = currentCount + 1; // (5) DB 저장 (결과 + 날짜/언어/사주/성별 정보 + 크레딧)
      // 히스토리용 캐시 키 생성 (gender 포함)

      const currentSajuKey = JSON.stringify(saju);
      const cacheKey = `daily_fortune.${currentSajuKey}.${gender}.${todayDate}.${language}`; // 👈 gender 추가
      let fortuneCache = userData.fortune_cache || {};
      fortuneCache[cacheKey] = result;

      await setDoc(
        userDocRef,
        {
          editCount: newCount, // 횟수 증가 저장
          lastEditDate: todayDate,
          fortune_cache: fortuneCache, // 👇 다음에 비교할 '최신 상태' 저장
          lastDaily: {
            result: result,
            date: todayDate, // 오늘 날짜
            saju: saju, // 지금 사주
            language: language, // 지금 언어
            gender: gender, // 👈 성별 정보 추가
          },
        },
        { merge: true },
      ); // UI 반영

      setEditCount(newCount);
      setAiResult(result);
      setIsSuccess(true);
      openModal();
      setViewMode('result');
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };
  // --- Main AI Analysis ---
  const handleAiAnalysis = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!isSaved) return alert(UI_TEXT.saveFirst[language]);

    // 로딩 타입 설정 (메인 분석)
    setLoadingType('main');
    setResultType('main');

    // 1. 캐시(이전 결과) 확인 로직
    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];
    let isMatch = false;
    if (cachedData && cachedData.saju) {
      const savedPrompt = cachedData.prompt;
      if (cachedData.language === language && cachedData.gender === gender) {
        const isSajuMatch = keys.every((key) => cachedData.saju[key] === saju[key]);
        if (isSajuMatch) isMatch = true;
      }
    }

    // 2. 캐시가 있으면 횟수 차감 없이 결과만 보여줌 (Free)
    if (isMatch) {
      setAiResult(cachedData.result);
      setIsSuccess(true);
      openModal();
      setViewMode('result');
      setLoadingType(null); // 로딩 해제
      return;
    }

    // 💥 [추가] 캐시가 없으면 횟수(행동력) 체크
    if (editCount >= MAX_EDIT_COUNT) {
      alert(UI_TEXT.limitReached[language]); // "횟수 제한에 도달했습니다" 등의 메시지
      setLoading(false);
      setLoadingType(null);
      return;
    }

    // 3. AI 분석 시작
    setLoading(true);
    setAiResult('');
    setIsSuccess(false);
    setIsCachedLoading(false);
    setViewMode('result');

    try {
      const currentSajuKey = JSON.stringify(saju);
      const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${inputDate}, 팔자:${currentSajuKey}`;
      const strictPrompt = STRICT_INSTRUCTION[language];
      const fullPrompt = `${strictPrompt}\n${DEFAULT_INSTRUCTION[language]}\n${sajuInfo}\n${langPrompt(language)}\n${hanja(language)}`;

      // API 호출
      const result = await fetchGeminiAnalysis(fullPrompt);

      // 💥 [추가] 행동력(Count) 증가
      const newCount = editCount + 1;

      // DB 업데이트 (결과 저장 + 카운트 증가)
      await setDoc(
        doc(db, 'users', user.uid),
        {
          lastAiResult: result,
          lastSaju: saju,
          lastPrompt: userPrompt,
          lastLanguage: language,
          lastGender: gender,
          editCount: newCount, // 여기서 카운트 업데이트
        },
        { merge: true },
      );

      // 로컬 상태 업데이트
      setEditCount(newCount);

      setCachedData({
        saju: saju,
        result: result,
        prompt: userPrompt,
        language: language,
        gender: gender,
      });
      setAiResult(result);
      setIsSuccess(true);
      openModal();
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };
  // 🎉 [신년 운세] (캐시 확인 + 로직 개선)
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
      // 1. DB에서 최신 데이터 가져오기
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      // 💥 현재 카운트 확보
      const currentCount = userData.editCount || 0;

      // [캐시 체크] 이미 본 결과면 무료
      let isMatch = false;
      if (userData.lastNewYear) {
        const { year, language: savedLang, saju: savedSaju, result } = userData.lastNewYear;
        const isYearMatch = String(year) === String(nextYear);
        const isLangMatch = savedLang === language;
        const isSajuMatch = savedSaju && keys.every((k) => savedSaju[k] === saju[k]);

        if (isYearMatch && isLangMatch && isSajuMatch && result) {
          setAiResult(result);
          setIsSuccess(true);
          openModal();
          setViewMode('result');
          setLoading(false);
          setLoadingType(null);
          return;
        }
      }

      // [횟수 제한 체크]
      if (currentCount >= MAX_EDIT_COUNT) {
        setLoading(false);
        setLoadingType(null);
        return alert(UI_TEXT.limitReached[language]);
      }

      // --- API 호출 준비 ---
      const currentSajuJson = JSON.stringify(saju);
      const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${inputDate}, 팔자:${currentSajuJson}`;
      const strictPrompt = STRICT_INSTRUCTION[language];
      const fullPrompt = `${strictPrompt}\n${NEW_YEAR_FORTUNE_PROMPT[language]}\n${sajuInfo}\n${langPrompt(language)}\n${hanja(language)}`;

      // 💥 API 호출 (AI 분석)
      const result = await fetchGeminiAnalysis(fullPrompt);

      // 💥 [핵심] 크레딧 차감
      const newCount = currentCount + 1;

      // DB 저장
      const cacheKey = `new_year_fortune.${currentSajuJson}.${nextYear}.${language}`;
      let fortuneCache = userData.fortune_cache || {};
      fortuneCache[cacheKey] = result;

      await setDoc(
        userDocRef,
        {
          editCount: newCount, // 저장
          lastEditDate: new Date().toLocaleDateString('en-CA'),
          fortune_cache: fortuneCache,
          lastNewYear: {
            result: result,
            year: nextYear,
            saju: saju,
            language: language,
          },
        },
        { merge: true },
      );

      // UI 반영
      setEditCount(newCount);
      setAiResult(result);
      setIsSuccess(true);
      openModal();
      setViewMode('result');
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };
  // [변수 설정] 체크 표시 로직 (안전한 비교)
  const todayStr = new Date().toLocaleDateString('en-CA');
  const nextYear = new Date().getFullYear() + 1;
  const sajuKeys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

  // 공통 비교 함수 (사주 8글자가 같은지 확인)
  const checkSajuMatch = (targetSaju) => {
    if (!targetSaju) return false;
    return sajuKeys.every((key) => targetSaju[key] === saju[key]);
  };

  // 현재 분석하려는 사주 데이터에 포함된 성별 변수라고 가정합니다.
  // 예시: const gender = 'M'; // 또는 'F'

  // 1. 메인 분석 완료 여부 (로컬 캐시 OR DB의 lastSaju 확인)
  const isMainDone =
    (cachedData &&
      checkSajuMatch(cachedData.saju) &&
      cachedData.language === language &&
      cachedData.gender === gender) || // 👈 cachedData에 gender 추가
    (dbUser &&
      checkSajuMatch(dbUser.lastSaju) &&
      dbUser.lastLanguage === language &&
      dbUser.lastGender === gender); // 👈 dbUser에 lastGender 추가

  // 2. 신년운세 완료 여부 (DB 확인)
  const isYearDone =
    dbUser?.lastNewYear &&
    String(dbUser.lastNewYear.year) === String(nextYear) &&
    dbUser.lastNewYear.language === language &&
    dbUser.lastNewYear.gender === gender && // 👈 lastNewYear에 gender 추가
    checkSajuMatch(dbUser.lastNewYear.saju);

  // 3. 오늘의 운세 완료 여부 (DB 확인)
  const isDailyDone =
    dbUser?.lastDaily &&
    dbUser.lastDaily.date === todayStr &&
    dbUser.lastDaily.language === language &&
    dbUser.lastDaily.gender === gender && // 👈 lastDaily에 gender 추가
    checkSajuMatch(dbUser.lastDaily.saju);

  const handleAdditionalQuestion = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (editCount >= MAX_EDIT_COUNT) return alert(UI_TEXT.limitReached[language]);
    if (!customQuestion.trim()) return alert('질문을 입력해주세요.');

    const myQuestion = customQuestion;
    setChatList((prev) => [...prev, { role: 'user', text: myQuestion }]);
    setCustomQuestion('');
    setQLoading(true);
    const currentSajuKey = createSajuKey(saju);

    try {
      const currentSajuJson = JSON.stringify(saju);
      const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${inputDate}, 팔자:${currentSajuJson}`;
      const todayInfo = `오늘 날짜가 ${new Date()}임을 고려해줘. 그리고 2025년은 을사년이고 2026년은 병오년이야. 2027년은 정미년.`;
      const fullPrompt = `${myQuestion}\n${sajuInfo}\n${langPrompt(language)}\n${hanja(language)}\n${todayInfo}`;

      const result = await fetchGeminiAnalysis(fullPrompt);
      const newCount = editCount + 1;

      const newQuestionLog = {
        question: myQuestion,
        sajuKey: currentSajuKey,
        timestamp: new Date().toISOString(),
        id: Date.now(),
      };

      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: newCount,
          lastEditDate: new Date().toLocaleDateString('en-CA'),
          question_history: arrayUnion(newQuestionLog),
        },
        { merge: true },
      );

      if (currentSajuKey) {
        await saveAndCapChatRecord(user.uid, currentSajuKey, myQuestion, result);
      }

      setEditCount(newCount);
      setChatList((prev) => [...prev, { role: 'ai', text: result }]);
    } catch (e) {
      setChatList((prev) => [...prev, { role: 'ai', text: 'Error: 분석에 실패했습니다.' }]);
    } finally {
      setQLoading(false);
    }
  };

  const t = (char) => (language === 'en' ? getEng(char) : char);
  const mainEnergy = useConsumeEnergy();
  const yearEnergy = useConsumeEnergy();
  const dailyEnergy = useConsumeEnergy();
  const chatEnergy = useConsumeEnergy();

  return (
    <div className="relative px-3 py-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* 헤더시작 */}

      <NavBar
        language={language} // ⭐ NavBar.language로 'ko' 또는 'en' 값이 전달됨
        setLanguage={setLanguage} // ⭐ NavBar.setLanguage로 함수가 전달됨
        theme={theme} // ⭐ NavBar.theme로 'dark' 또는 'light' 값이 전달됨
        setTheme={setTheme} // ⭐ NavBar.setTheme로 함수가 전달됨
        onShowContact={handleShowContact}
      />
      {isContactModalOpen && (
        <ContactModal
          onClose={handleCloseContact}
          language={language}
          email="doobuhanmo3@gmail.com"
        />
      )}
      {/* 헤더끝 */}
      {/* 로그인 스테이터스 */}
      <div className="bg-white/70 dark:bg-slate-800/60 p-3 my-2 rounded-2xl border border-indigo-50 dark:border-indigo-500/30 shadow-sm backdrop-blur-md max-w-lg m-auto">
        {user ? (
          <div className="flex items-center justify-between">
            {/* 1. 왼쪽: 심플한 프로필 영역 */}
            <div className="flex items-center gap-3">
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-12 h-12 rounded-full border border-indigo-100 dark:border-slate-600"
              />
              <div className="flex flex-col justify-center">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none mb-0.5">
                  {user.displayName}
                  {language === 'ko' && (
                    <span className="font-normal text-xs ml-0.5 text-gray-500">님</span>
                  )}
                </span>
                <span className="text-[12px] text-gray-400">{UI_TEXT.welcome[language]}</span>
              </div>
            </div>

            {/* 2. 오른쪽: 통합 컨트롤 바 (한 줄 배치) */}

            <div className="flex items-center">
              {/* 행동력 */}
              <div className="flex items-center gap-2 mr-3 pr-3 border-r border-gray-200 dark:border-gray-700 h-14">
                {/* h-12로 높이 고정하여 흔들림 방지 */}
                {/* 아이콘: 중앙 정렬 */}
                <div>
                  {' '}
                  <div className="flex items-center justify-end leading-none">
                    <BoltIcon className="w-6 h-6 text-amber-500 fill-amber-500/20" />
                    {/* 텍스트 영역: 오른쪽 정렬 */}
                    <div className="flex flex-col items-end justify-center leading-none">
                      {/* 1. 라벨 (CREDIT) */}
                      <span className="text-[12px] font-bold text-amber-600/70 dark:text-amber-500 uppercase tracking-tighter mb-[1px]">
                        Daily Credit
                      </span>

                      {/* 2. 숫자 (3/5) */}
                      <span className="text-md font-black text-gray-700 dark:text-gray-200 font-mono">
                        {MAX_EDIT_COUNT - editCount}
                        <span className="mx-0.5">/</span>
                        {MAX_EDIT_COUNT}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div>
                      {/* 꽉 차지 않았을 때만 타이머 표시 */}
                      {MAX_EDIT_COUNT - editCount < MAX_EDIT_COUNT && timeLeft ? (
                        <span className="text-[12px]  font-medium text-gray-400 dark:text-gray-500 tracking-tight mt-[1px]">
                          {language === 'en'
                            ? `refill in ${timeLeft}`
                            : `${timeLeft}후에 자동 충전`}
                        </span>
                      ) : (
                        /* 꽉 찼을 때는 빈 공간 유지 or FULL 표시 (깔끔함을 위해 빈 공간 추천) */
                        <span className="h-[0px]"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* (B) 액션 버튼 (Actions) - 아이콘 위주 */}
              <div className="flex items-center gap-1">
                {/* 로그아웃 버튼 */}
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-all"
                  title={UI_TEXT.logout[language]}
                >
                  <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // 비로그인 상태 (기존 유지)
          <div className="w-full text-center">
            <button
              onClick={login}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold shadow-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"
                />
              </svg>
              <span className="text-sm">{UI_TEXT.googleLogin[language]}</span>
            </button>
            <p className="text-[10px] text-gray-400 mt-2">{UI_TEXT.loginMsg[language]}</p>
          </div>
        )}
      </div>
      {/* 로그인 되지 않았을 시 블러처리 */}
      {!user && (
        <div
          className="absolute inset-x-0 h-[450px] z-10 
                    backdrop-blur-sm flex justify-center items-center"
        >
          <div className="relative w-[260px]">
            <div
              // 🔹 배경 투명도를 더 낮추고 (20% -> 15%) 블러를 유지하여 유리판 질감 강화
              className="absolute -top-[180px] w-full p-4 
             bg-gray-300/15 dark:bg-white/15 backdrop-blur-lg rounded-xl 
             shadow-2xl dark:shadow-black/20 shadow-black/40
             flex flex-col items-center justify-center space-y-4 mx-auto 
             border border-gray-300/30 dark:border-gray-700/40"
            >
              {/* A. 강조 문구: 혜택을 상단에 명확하게 배치 */}
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

              {/* B. 콜투액션(CTA) 버튼: 가장 중요한 요소 */}
              <button
                className="w-full py-3 bg-amber-400 text-gray-900 font-extrabold text-md rounded-xl 
             hover:bg-amber-500 active:bg-yellow-500 
             transition-all duration-150 transform hover:scale-[1.03] 
             shadow-xl shadow-amber-500/60 flex items-center justify-center space-x-2" // 👈 flex로 아이콘과 텍스트 분리
                onClick={login}
              >
                {/* 1. Google 아이콘 (한국어 모드에서만 사용) */}
                {language !== 'en' && (
                  <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
                  </svg>
                )}

                {/* 2. 텍스트 강조 (핵심 메시지 전달) */}
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

              {/* C. 보조 정보는 제거하거나, 필요한 경우 버튼 아래에 간결하게 유지 */}
              {/* <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
    {language === 'en'
      ? `Daily Gift: ${MAX_EDIT_COUNT} ⚡️ inside`
      : `매일 ${MAX_EDIT_COUNT}개⚡️ 선물 증정`}
  </p> */}
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-lg  bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl mx-auto my-4">
        <div className="flex flex-col m-2">
          {/* 정보수정 */}
          <div
            className={`m-3 mt-1 transition-all duration-300 overflow-hidden ${isSaved ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}
          >
            <div className={`${!user ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                  {UI_TEXT.genderLabel[language]}
                </label>
                <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
                  <button
                    onClick={() => setGender('male')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === 'male' ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-600' : 'text-gray-400'}`}
                  >
                    {UI_TEXT.male[language]}
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === 'female' ? 'bg-white text-pink-500 shadow-sm dark:bg-slate-600' : 'text-gray-400'}`}
                  >
                    {UI_TEXT.female[language]}
                  </button>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {UI_TEXT.birthLabel[language]}
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                    <input
                      type="checkbox"
                      checked={isTimeUnknown}
                      onChange={(e) => setIsTimeUnknown(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 dark:bg-slate-700"
                    />
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {UI_TEXT.unknownTime[language]}
                    </span>
                  </label>
                </div>
                <div className="relative w-full p-1">
                  <input
                    type={isTimeUnknown ? 'date' : 'datetime-local'}
                    value={isTimeUnknown ? inputDate.split('T')[0] : inputDate}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (isTimeUnknown) val += 'T00:00';
                      setInputDate(val);
                    }}
                    className="w-full p-2 bg-gray-50 dark:bg-slate-900/50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white dark:[color-scheme:dark]"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveMyInfo}
                className="w-full  py-3 mt-3 mb-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                {BD_EDIT_UI.complete[language]}
              </button>
            </div>
          </div>
          {/* 저장된 유저정보 */}
          {user && (
            <div className="mb-3 relative p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-sm backdrop-blur-sm">
              {/* 1. 상단 라벨 (여기가 내 정보임을 알리는 핵심) */}

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
                  // 수정 버튼 (심플한 아이콘 버튼)
                  <button
                    onClick={handleEditMode}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-full transition-all"
                    title={BD_EDIT_UI.edit[language]}
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                ) : (
                  // 취소 버튼
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-1">
                {/* 2. 양력 생일 정보 (입력값) */}
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <CalendarDaysIcon className="w-4 h-4 text-indigo-400" />
                  <span className="font-mono tracking-wide">{inputDate.replace('T', ' ')}</span>
                  {isTimeUnknown && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 rounded text-gray-400">
                      {UI_TEXT.unknownTime[language]}
                    </span>
                  )}
                </div>

                {/* 구분선 */}
                <div className="border-t border-dashed border-indigo-100 dark:border-indigo-800 w-full"></div>

                {/* 3. 사주 명식 (변환값) - 가장 중요하게 강조 */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                  {/* 년주 */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
                      {UI_TEXT.year[language]}
                    </span>
                    <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
                      {t(saju.sky3)}
                      {t(saju.grd3)}
                    </span>
                  </div>

                  {/* 월주 */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
                      {UI_TEXT.month[language]}
                    </span>
                    <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
                      {t(saju.sky2)}
                      {t(saju.grd2)}
                    </span>
                  </div>

                  {/* 일주 (강조) */}
                  <div className="flex flex-col items-center relative">
                    {/* 일주 강조용 배경 점 */}
                    <div className="absolute inset-0 bg-indigo-100/50 dark:bg-indigo-500/20 blur-md rounded-full transform scale-150"></div>
                    <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase mb-0.5 relative z-10">
                      {UI_TEXT.day[language]}
                    </span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-200 tracking-widest leading-none relative z-10 drop-shadow-sm">
                      {t(saju.sky1)}
                      {t(saju.grd1)}
                    </span>
                  </div>

                  {/* 시주 */}
                  {!isTimeUnknown && (
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
                        {UI_TEXT.hour[language]}
                      </span>
                      <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
                        {t(saju.sky0)}
                        {t(saju.grd0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* 만세력 시각화 */}
          {user && (
            <FourPillarVis
              containerWidth={containerWidth}
              isTimeUnknown={isTimeUnknown}
              saju={saju}
              theme={theme}
            />
          )}
        </div>
      </div>
      {/* 4. AI 버튼 영역 (3분할) 및 로딩 상태창 */}
      <div className="my-4 pt-4 border-t border-gray-200 dark:border-gray-700 max-w-xl m-auto px-4">
        {/* B. ✨ 독립된 로딩 상태 표시창 (기존 디자인 유지) */}
        {loading && (
          <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-gray-700 shadow-xl animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-col gap-2">
              {/* 로딩 멘트 */}
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
                  {isCachedLoading
                    ? UI_TEXT.loadingCached[language]
                    : getLoadingText(progress, language, loadingType)}
                </span>
                <span className="text-sm font-black text-gray-700 dark:text-gray-200">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* 프로그레스 바 (독립형) */}
              <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out 
                    ${
                      loadingType === 'main'
                        ? 'bg-gradient-to-r from-violet-500 to-indigo-600'
                        : loadingType === 'year'
                          ? 'bg-gradient-to-r from-green-400 to-emerald-600'
                          : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
        {/* A. 버튼 그룹 */}
        <div className="flex justify-between gap-3 h-32">
          {/* 1. 메인 분석 버튼 */}
          <AnalysisButton
            energy={mainEnergy}
            handleAnalysis={handleAiAnalysis}
            loading={loading}
            loadingType={loadingType}
            user={user}
            isSaved={isSaved}
            isLocked={isLocked}
            isAnalysisDone={isMainDone}
            language={language}
            icon={'🔮'}
            buttonType={'main'}
            textKo={'사주 분석'}
            TextEn={'Life Path Decoding'}
            subTextKo={'타고난 운명 파악'}
            subTextEn={'Discover your Fate'}
            colorType={'indigo'}
          />

          {/* 신년운세버튼 */}
          <AnalysisButton
            energy={yearEnergy}
            handleAnalysis={handleNewYearFortune}
            loading={loading}
            loadingType={loadingType}
            user={user}
            redBadge={true}
            isSaved={isSaved}
            isLocked={isLocked}
            isAnalysisDone={isYearDone}
            language={language}
            icon={'🐍'}
            buttonType={'year'}
            textKo={'2026 신년 운세'}
            TextEn={'2026 Path Guide'}
            subTextKo={'미리보는 1년 계획'}
            subTextEn={'Yearly Forecast'}
            colorType={'blue'}
          />

          {/* 3. 오늘의 운세 버튼 */}
          <AnalysisButton
            energy={dailyEnergy}
            handleAnalysis={handleDailyFortune}
            loading={loading}
            loadingType={loadingType}
            user={user}
            isSaved={isSaved}
            isLocked={isLocked}
            isAnalysisDone={isDailyDone}
            language={language}
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
      {/* 5. 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:text-gray-300">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => closeModal()}
          />
          <div className="relative w-full max-w-5xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2">
                {viewMode === 'chat' && (
                  <button
                    onClick={() => handleSetViewMode('result')}
                    className="mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 text-center">
                  {viewMode === 'chat'
                    ? language === 'ko'
                      ? '사자와 대화'
                      : 'Chat with the master'
                    : UI_TEXT.modalTitle[language]}
                </h3>
                <span
                  className={`px-2 text-[13px] font-bold ${isLocked ? 'text-red-500' : 'text-gray-400'}`}
                >
                  {isLocked ? (
                    language === 'ko' ? (
                      '일일 질문 제한 초과'
                    ) : (
                      'Daily Limit Reached'
                    )
                  ) : (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-full shadow-sm">
                      {/* 번개 아이콘 (에너지 느낌) */}
                      <BoltIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />

                      {/* 숫자 표시 (현재/최대) */}
                      <span className="text-xs font-extrabold text-gray-700 dark:text-gray-200 font-mono tracking-tight">
                        {MAX_EDIT_COUNT - editCount}
                        <span className="text-gray-300 dark:text-gray-600 mx-0.5 font-normal">
                          /
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 font-medium">
                          {MAX_EDIT_COUNT}
                        </span>
                      </span>
                    </div>
                  )}
                </span>
              </div>
              <div className="flex gap-2">
                {viewMode === 'result' && (
                  <button
                    onClick={handleCopyResult}
                    className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs"
                  >
                    {isCopied ? UI_TEXT.copiedBtn[language] : UI_TEXT.copyBtn[language]}
                  </button>
                )}
                <button
                  onClick={() => closeModal()}
                  className="p-2 bg-gray-100 dark:bg-slate-700 rounded-full"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              <div className="hidden md:flex md:w-[160px] flex-shrink-0 bg-gray-50 dark:bg-slate-900/50 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 overflow-y-auto custom-scrollbar p-4 flex md:flex-col flex-row items-center justify-center gap-2">
                {/* ... 모달 좌측 만세력 패널 (내용 동일) ... */}
                {!isTimeUnknown && !!saju.grd0 && (
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">
                      {UI_TEXT.hour[language]}
                    </span>
                    <div
                      className={classNames(
                        iconsViewStyle,
                        saju.sky0 ? bgToBorder(sigan.color) : 'border-gray-200',
                        'w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800',
                      )}
                    >
                      <div className="text-2xl">{getIcon(saju.sky0, 'sky')}</div>
                      <div className="text-[8px] font-bold">{getHanja(saju.sky0, 'sky')}</div>
                    </div>
                    <div
                      className={classNames(
                        iconsViewStyle,
                        saju.grd0 ? bgToBorder(sijidata.color) : 'border-gray-200',
                        'w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800',
                      )}
                    >
                      <div className="text-2xl">{getIcon(saju.grd0, 'grd')}</div>
                      <div className="text-[8px] font-bold">{getHanja(saju.grd0, 'grd')}</div>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-1 items-center p-1 bg-yellow-100/30 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700/30">
                  <span className="text-[10px] uppercase font-bold text-indigo-500">
                    {UI_TEXT.day[language]}
                  </span>
                  <div
                    className={classNames(
                      iconsViewStyle,
                      saju.sky1 ? bgToBorder(ilgan.color) : 'border-gray-200',
                      'w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800',
                    )}
                  >
                    <div className="text-2xl">{getIcon(saju.sky1, 'sky')}</div>
                    <div className="text-[8px] font-bold">{getHanja(saju.sky1, 'sky')}</div>
                  </div>
                  <div
                    className={classNames(
                      iconsViewStyle,
                      saju.grd1 ? bgToBorder(iljidata.color) : 'border-gray-200',
                      'w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800',
                    )}
                  >
                    <div className="text-2xl">{getIcon(saju.grd1, 'grd')}</div>
                    <div className="text-[8px] font-bold">{getHanja(saju.grd1, 'grd')}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    {UI_TEXT.month[language]}
                  </span>
                  <div
                    className={classNames(
                      iconsViewStyle,
                      saju.sky2 ? bgToBorder(wolgan.color) : 'border-gray-200',
                      'w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800',
                    )}
                  >
                    <div className="text-2xl">{getIcon(saju.sky2, 'sky')}</div>
                    <div className="text-[8px] font-bold">{getHanja(saju.sky2, 'sky')}</div>
                  </div>
                  <div
                    className={classNames(
                      iconsViewStyle,
                      saju.grd2 ? bgToBorder(woljidata.color) : 'border-gray-200',
                      'w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800',
                    )}
                  >
                    <div className="text-2xl">{getIcon(saju.grd2, 'grd')}</div>
                    <div className="text-[8px] font-bold">{getHanja(saju.grd2, 'grd')}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    {UI_TEXT.year[language]}
                  </span>
                  <div
                    className={classNames(
                      iconsViewStyle,
                      saju.sky3 ? bgToBorder(yeongan.color) : 'border-gray-200',
                      'w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800',
                    )}
                  >
                    <div className="text-2xl">{getIcon(saju.sky3, 'sky')}</div>
                    <div className="text-[8px] font-bold">{getHanja(saju.sky3, 'sky')}</div>
                  </div>
                  <div
                    className={classNames(
                      iconsViewStyle,
                      saju.grd3 ? bgToBorder(yeonjidata.color) : 'border-gray-200',
                      'w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800',
                    )}
                  >
                    <div className="text-2xl">{getIcon(saju.grd3, 'grd')}</div>
                    <div className="text-[8px] font-bold">{getHanja(saju.grd3, 'grd')}</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 h-full overflow-hidden">
                {viewMode === 'result' && (
                  <>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                      {resultType === 'main' && (
                        <>
                          {/* [NEW] 메인 대형 타이틀 영역 */}
                          <div className="text-center mb-8 mt-2 animate-fade-in-up">
                            {/* 작은 소제목 (영문) */}
                            <p className="text-xs font-bold text-indigo-400 dark:text-indigo-400 tracking-[0.2em] uppercase mb-2">
                              Destiny Analysis
                            </p>

                            {/* 메인 대형 텍스트 (그라데이션 효과) */}
                            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-300 dark:via-violet-300 dark:to-indigo-300 drop-shadow-sm">
                              {language === 'ko' ? '사주 정밀 분석' : 'Life Path Decoding'}
                            </h1>

                            {/* 장식용 밑줄 점 */}
                            <div className="flex justify-center gap-2 mt-4 opacity-50">
                              <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                              <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                              <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                            </div>
                          </div>
                          <div className="mb-6 mx-auto max-w-md bg-indigo-50/50 dark:bg-slate-700/50 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-5 text-center shadow-sm backdrop-blur-sm">
                            {/* [추가된 부분] WHO AM I 헤더 영역 */}
                            <div className="flex items-center justify-center gap-2 mb-2 opacity-80">
                              {/* 왼쪽 장식 선 (그라데이션으로 자연스럽게 사라짐) */}
                              <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-indigo-300 dark:to-indigo-600"></div>

                              {/* 텍스트: 기존 디자인과 어울리는 인디고 컬러 + 넓은 자간 */}
                              <span className="text-[12px] font-black tracking-[0.3em] text-indigo-400 dark:text-indigo-400 uppercase drop-shadow-sm">
                                Who Am I?
                              </span>

                              {/* 오른쪽 장식 선 */}
                              <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-indigo-300 dark:to-indigo-600"></div>
                            </div>
                            {/* 상단 장식 아이콘 (선택사항) */}
                            <div className="text-indigo-400 dark:text-indigo-500 text-xs font-bold uppercase tracking-widest mb-1">
                              <div className="flex-cols items-center justify-center gap-1 text-indigo-400 dark:text-indigo-500 text-xs font-bold uppercase tracking-widest mb-1">
                                <div className="flex items-center jusify-center">
                                  <SparklesIcon className="w-24 h-24 m-auto" />
                                </div>

                                <div>Signature</div>
                              </div>
                            </div>

                            {/* 제목 */}
                            <div className="text-lg sm:text-xl font-extrabold text-gray-800 dark:text-gray-100 font-serif mb-2">
                              {IljuExp[language]?.[`${saju?.sky1}${saju?.grd1}`]?.[gender]?.title}
                            </div>

                            {/* 설명 */}
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-keep">
                              {IljuExp[language]?.[`${saju?.sky1}${saju?.grd1}`]?.[gender]?.desc}
                            </div>
                          </div>
                        </>
                      )}
                      {resultType === 'year' && (
                        <>
                          {/* [NEW] 메인 대형 타이틀 영역 */}
                          <div className="text-center mb-8 mt-2 animate-fade-in-up">
                            {/* 작은 소제목 (영문) */}
                            <p className="text-xs font-bold text-indigo-400 dark:text-indigo-400 tracking-[0.2em] uppercase mb-2">
                              Prepare For Next Year
                            </p>

                            {/* 메인 대형 텍스트 (그라데이션 효과) */}
                            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-300 dark:via-violet-300 dark:to-indigo-300 drop-shadow-sm">
                              {language === 'ko' ? '2026년 신년운세' : '2026 Path Guide'}
                            </h1>

                            {/* 장식용 밑줄 점 */}
                            <div className="flex justify-center gap-2 mt-4 opacity-50">
                              <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                              <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                              <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                            </div>
                          </div>
                        </>
                      )}
                      {resultType === 'daily' && (
                        <>
                          {/* [NEW] 메인 대형 타이틀 영역 */}
                          <div className="text-center mb-8 mt-2 animate-fade-in-up">
                            {/* 작은 소제목 (영문) */}
                            <p className="text-xs font-bold text-indigo-400 dark:text-indigo-400 tracking-[0.2em] uppercase mb-2">
                              Your Saju Daily
                            </p>

                            {/* 메인 대형 텍스트 (그라데이션 효과) */}
                            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-300 dark:via-violet-300 dark:to-indigo-300 drop-shadow-sm">
                              {language === 'ko' ? '오늘의 운세' : "Today's Luck"}
                            </h1>

                            {/* 장식용 밑줄 점 */}
                            <div className="flex justify-center gap-2 mt-4 opacity-50">
                              <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                              <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                              <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="prose prose-indigo dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap dark:text-gray-200 pb-10">
                        {aiResult}
                      </div>
                      <div className="mt-8 flex justify-center">
                        <button
                          onClick={handleShareResult}
                          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg transition-all hover:scale-105"
                        >
                          <ShareIcon className="w-5 h-5" />
                          <span>
                            {language === 'en'
                              ? 'Share & Invite Friends'
                              : '결과 공유하고 친구에게 추천하기'}
                          </span>
                        </button>
                      </div>

                      {/* [추가] 동일 일주 유명인 리스트 (뱃지 스타일) */}
                      {resultType === 'main' &&
                        iljuNameList?.[`${saju?.sky1}${saju?.grd1}`] &&
                        language === 'ko' && (
                          <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/30">
                            <div className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-wider mb-2">
                              Same Vibe
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                              {iljuNameList[`${saju?.sky1}${saju?.grd1}`].map((name, index) => (
                                <span
                                  key={index}
                                  className="px-2.5 py-1 text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-white/60 dark:bg-indigo-900/40 rounded-full shadow-sm border border-indigo-50 dark:border-indigo-800/50"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                    <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center flex-shrink-0">
                      <button
                        onClick={handleShare}
                        className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm text-sm font-bold text-gray-600 dark:text-gray-200 hover:bg-gray-50 flex gap-2"
                      >
                        <ShareIcon className="w-5 h-5" />
                        {UI_TEXT.shareBtn[language]}
                      </button>
                      <button
                        onClick={() => handleSetViewMode('chat')}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
                      >
                        <span>💬</span> {language === 'ko' ? '추가 질문하기' : 'Ask a Question'}
                      </button>
                    </div>
                  </>
                )}

                {/* ▼▼▼▼▼▼ 채팅 모드 전체 코드 교체 시작 ▼▼▼▼▼▼ */}
                {viewMode === 'chat' && (
                  <>
                    {/* 1. 채팅 메시지 리스트 영역 */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5 bg-gray-50 dark:bg-slate-900/20">
                      {chatList.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        // AI 이름 설정 (언어별)
                        const aiName = language === 'ko' ? '사자' : 'Master saza';
                        // 사용자 이름 설정 (없으면 기본값)
                        const userName = user?.displayName || (language === 'ko' ? '나' : 'Me');

                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-[fadeIn_0.3s_ease-out]`}
                          >
                            {/* A. 프로필 이미지 영역 */}
                            <div className="flex-shrink-0 mt-1">
                              {isUser ? (
                                // 사용자 프로필 (구글 사진)
                                <img
                                  src={user?.photoURL}
                                  alt="User Profile"
                                  className="w-10 h-10 rounded-full shadow-sm border border-gray-200 dark:border-gray-600 object-cover"
                                />
                              ) : (
                                // 사자 프로필 (아이콘)
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br dark:from-indigo-500 dark:to-purple-600 flex items-center justify-center dark:shadow-sm border dark:border-indigo-400/30 shadow-md">
                                  <img
                                    src={sajaProfile}
                                    alt="Sajucha Logo"
                                    className="w-10 h-10 rounded-full shadow-sm object-cover"
                                  />
                                </div>
                              )}
                            </div>

                            {/* B. 메시지 내용 영역 (이름 + 말풍선) */}
                            <div
                              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}
                            >
                              {/* 이름표 */}
                              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1 mr-1">
                                {isUser ? userName : aiName}
                              </span>

                              {/* 말풍선 */}
                              <div
                                className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap break-words
                ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none' // 사용자 말풍선 스타일
                    : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none prose prose-sm dark:prose-invert max-w-none shadow-md' // AI 말풍선 스타일
                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* 로딩 중 스켈레톤 (AI 프로필 + 로딩 말풍선) */}
                      {qLoading && (
                        <div className="flex items-start gap-3 animate-pulse">
                          {/* 사자 프로필 스켈레톤 */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br dark:from-indigo-500 dark:to-purple-600 flex items-center justify-center dark:shadow-sm border dark:border-indigo-400/30 shadow-md">
                            <img
                              src={sajaProfile}
                              alt="Sajucha Logo"
                              className="w-10 h-10 rounded-full shadow-sm object-cover"
                            />
                          </div>
                          <div className="flex flex-col items-start max-w-[85%]">
                            <span className="text-[11px] font-bold text-gray-400 mb-1 ml-1">
                              {language === 'ko' ? '사자' : 'Master Saza'}
                            </span>
                            {/* 로딩 점 3개 말풍선 */}
                            <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 px-5 py-4 rounded-2xl rounded-tl-none shadow-md flex gap-1.5">
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* 2. 하단 입력창 영역 */}
                    <div className="p-3 border-t dark:border-gray-700 bg-white dark:bg-slate-800 flex flex-col gap-2 flex-shrink-0 relative z-10">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={customQuestion}
                          onChange={(e) => setCustomQuestion(e.target.value)}
                          placeholder={
                            language === 'ko'
                              ? '사자에게 궁금한 점을 물어보세요...'
                              : 'Ask the Master anything...'
                          }
                          onKeyDown={(e) =>
                            e.key === 'Enter' &&
                            !qLoading &&
                            !isLocked &&
                            handleAdditionalQuestion()
                          }
                          disabled={isLocked || qLoading}
                          // 💥 [수정] pr-14 -> pr-28 (버튼이 길어져서 여백을 더 줌)
                          className="w-full pl-5 pr-28 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white disabled:opacity-60 transition-all"
                        />

                        <button
                          onClick={handleAdditionalQuestion}
                          disabled={isLocked || !customQuestion.trim() || qLoading}
                          // 💥 [수정] 버튼 스타일 변경 (가로로 길게, 내부 flex 정렬)
                          className={`absolute right-2 top-1/2 -translate-y-1/2 h-9 px-3 rounded-xl transition-all flex items-center gap-2 ${
                            isLocked || !customQuestion.trim() || qLoading
                              ? 'text-gray-400 bg-gray-200 dark:bg-slate-700 cursor-not-allowed'
                              : 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95'
                          }`}
                        >
                          {/* 1. 전송 아이콘 (기존 유지) */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                          </svg>

                          {/* 2. 구분선 및 비용 표시 (디자인 개선) */}
                          <div
                            className={`flex items-center gap-1 pl-2 border-l ${
                              !customQuestion.trim() ? 'border-gray-400/50' : 'border-indigo-400'
                            }`}
                          >
                            {/* 비용을 감싸는 뱃지 */}
                            <div
                              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${
                                !customQuestion.trim()
                                  ? 'bg-transparent' // 비활성 상태
                                  : 'bg-black/20' // 활성 상태: 어두운 배경을 깔아서 노란색을 돋보이게 함
                              }`}
                            >
                              {/* 숫자: 앰버색 + 그림자 */}
                              <span
                                className={`text-[11px] font-black leading-none pt-[1px] font-mono ${
                                  !customQuestion.trim()
                                    ? 'text-gray-500'
                                    : 'text-amber-300 drop-shadow-sm'
                                }`}
                              >
                                -1
                              </span>

                              {/* 아이콘: 앰버색 + 채우기 */}
                              <BoltIcon
                                className={`w-3.5 h-3.5 ${
                                  !customQuestion.trim()
                                    ? 'text-gray-400'
                                    : 'text-amber-400 fill-amber-400'
                                }`}
                              />
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {/* ▲▲▲▲▲▲ 채팅 모드 전체 코드 교체 끝 ▲▲▲▲▲▲ */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
