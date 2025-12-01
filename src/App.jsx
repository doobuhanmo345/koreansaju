import { useState, useEffect, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import {
  BoltIcon,
  PlusCircleIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  LockClosedIcon,
  ShareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import { Solar } from 'lunar-javascript';
import { doc, getDoc, setDoc, arrayUnion, increment } from 'firebase/firestore'; // increment 추가 확인

// Local Imports
import { login, logout, onUserStateChange, db } from './lib/firebase';
import { fetchGeminiAnalysis } from './api/gemini';
import {
  SAJU_DATA,
  UI_TEXT,
  HANJA_MAP,
  DEFAULT_INSTRUCTION,
  GONGMANG_DATA,
  CHUNEUL,
  SKY_CH_TEXT,
  GRD_CH_TEXT,
  BANGHAP_TEXT,
  HAP3_TEXT,
  HAP6_TEXT,
  GRD_BANHAP_TEXT,
  SKY_HAP_TEXT,
  BANGHAP_EXP,
  HAP3_EXP,
  HAP6_EXP,
  GRD_BANHAP_EXP,
  SKY_HAP_EXP,
  HANJA_ENG_MAP,
  DAILY_FORTUNE_PROMPT,
  NEW_YEAR_FORTUNE_PROMPT,
  BD_EDIT_UI,
  IljuExp,
} from './data/constants';
import { iljuNameList } from './data/iljuNameList';
import { classNames, getIcon, getHanja, getEng, getLoadingText, bgToBorder } from './utils/helpers';
import logoKorDark from './assets/Logo_Kor_DarkMode.png';
import logoEngDark from './assets/Logo_Eng_DarkMode.png';
import logoKor from './assets/Logo_Kor.png';
import logoEng from './assets/Logo_Eng.png';
import sajaProfile from './assets/sajaProfile.png';
// 💡 추가된 텍스트 상수

export default function App() {
  // --- States ---
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.theme || 'light');
  const [language, setLanguage] = useState('en');
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [gender, setGender] = useState('female');
  const [qLoading, setQLoading] = useState(false);

  // 🔒 저장 및 수정 횟수 관리
  const [isSaved, setIsSaved] = useState(false);
  const [editCount, setEditCount] = useState(0);
  const MAX_EDIT_COUNT = 30;
  const [resultType, setResultType] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [viewMode, setViewMode] = useState('result');
  const chatEndRef = useRef(null);

  const isLocked = editCount >= MAX_EDIT_COUNT;
  const isInputDisabled = isLocked || isSaved;

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

  const [saju, setSaju] = useState({
    sky0: '',
    grd0: '',
    sky1: '',
    grd1: '',
    sky2: '',
    grd2: '',
    sky3: '',
    grd3: '',
  });

  const [containerWidth, setContainerWidth] = useState(411);
  const [aiResult, setAiResult] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userPrompt, setUserPrompt] = useState(DEFAULT_INSTRUCTION);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [showIcons, setShowIcons] = useState(true);
  const [charShow, setCharShow] = useState(true);
  const [bgShow, setBgShow] = useState(true);

  // --- Effects ---
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.theme = theme;
  }, [theme]);

  // 로그인 & 데이터 불러오기
  useEffect(() => {
    onUserStateChange(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.birthDate) {
              setInputDate(data.birthDate);
              setIsSaved(true);
            }
            if (data.gender) setGender(data.gender);
            if (data.isTimeUnknown !== undefined) setIsTimeUnknown(data.isTimeUnknown);

            const todayStr = new Date().toLocaleDateString('en-CA');
            if (data.lastEditDate !== todayStr) setEditCount(0);
            else setEditCount(data.editCount || 0);

            if (data.lastAiResult && data.lastSaju) {
              setCachedData({
                saju: data.lastSaju,
                result: data.lastAiResult,
                prompt: data.lastPrompt || DEFAULT_INSTRUCTION,
                language: data.lastLanguage || 'en',
                gender: data.lastGender || data.gender,
              });
            }
          } else {
            setIsSaved(false);
            setEditCount(0);
            setCachedData(null);
          }
        } catch (error) {
          console.error('정보 불러오기 실패:', error);
        }
      } else {
        setIsSaved(false);
        setEditCount(0);
        setCachedData(null);
      }
    });
  }, []);

  // 만세력 계산
  useEffect(() => {
    if (!inputDate) return;
    const dateObj = new Date(inputDate);
    if (isNaN(dateObj.getTime())) return;

    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hour = dateObj.getHours();
    const minute = dateObj.getMinutes();

    if (isNaN(year) || year < 1000 || year > 3000) return;

    try {
      const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
      const lunar = solar.getLunar();
      const baZi = lunar.getBaZi();

      const parsePillar = (ganjiHanja) => {
        const skyHanja = ganjiHanja[0];
        const grdHanja = ganjiHanja[1];
        return {
          sky: HANJA_MAP[skyHanja] || skyHanja,
          grd: HANJA_MAP[grdHanja] || grdHanja,
        };
      };

      const yearP = parsePillar(baZi[0]);
      const monthP = parsePillar(baZi[1]);
      const dayP = parsePillar(baZi[2]);
      const hourP = parsePillar(baZi[3]);

      setSaju({
        sky3: yearP.sky,
        grd3: yearP.grd,
        sky2: monthP.sky,
        grd2: monthP.grd,
        sky1: dayP.sky,
        grd1: dayP.grd,
        sky0: isTimeUnknown ? '' : hourP.sky,
        grd0: isTimeUnknown ? '' : hourP.grd,
      });
    } catch (error) {
      console.warn('만세력 계산 보류:', error);
    }
  }, [inputDate, isTimeUnknown]);

  // 로딩 애니메이션
  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99) return 99;
          const r = Math.random();
          let increment = 0;
          if (isCachedLoading) {
            increment = 25;
          } else {
            if (prev < 20) increment = r < 0.7 ? 1 : 2;
            else if (prev < 50) increment = r < 0.5 ? 1 : 0;
            else if (prev < 80) increment = r < 0.2 ? 1 : 0;
            else increment = r < 0.05 ? 1 : 0;
          }
          return prev + increment;
        });
      }, 50);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading, isCachedLoading]);

  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatList, qLoading]);

  // --- Logic (Relation & Colors) ---
  const relationAd = SAJU_DATA.sky;
  const jijiText = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  let sigan,
    ilgan,
    wolgan,
    yeongan,
    siji,
    ilji,
    wolji,
    yeonji,
    sijidata,
    iljidata,
    woljidata,
    yeonjidata;
  let sijiji = [],
    iljiji = [],
    woljiji = [],
    yeonjiji = [],
    insu = [],
    sik = [],
    jae = [],
    guan = [];
  let gongmang = [],
    gongmangbool = [false, false, false],
    chuneulbool = [false, false, false];
  let sky12ch = false,
    sky12hap = [false, {}],
    sky23ch = false,
    sky23hap = [false, {}];
  let grd12ch = false,
    grd12banhap = [false, {}],
    grd126 = [false, {}];
  let grd23ch = false,
    grd23banhap = [false, {}],
    grd236 = [false, {}];
  let banghap = [false, {}],
    hap3 = [false, {}];

  if (relationAd) {
    sigan =
      relationAd.find((i) => i.sub.sky[0] === saju.sky0) || relationAd.find((i) => i.id === 0);
    ilgan =
      relationAd.find((i) => i.sub.sky[0] === saju.sky1) || relationAd.find((i) => i.id === 0);
    wolgan =
      relationAd.find((i) => i.sub.sky[0] === saju.sky2) || relationAd.find((i) => i.id === 0);
    yeongan =
      relationAd.find((i) => i.sub.sky[0] === saju.sky3) || relationAd.find((i) => i.id === 0);
    const findGrdData = (char) => {
      if (!char || !jijiText.includes(char)) {
        const empty = relationAd.find((i) => i.id === 0);
        return { data: empty, sub: empty.sub.grd[1], hidden: [] };
      }
      const found =
        relationAd.find((i) => i.sub.grd[0][0] === char) ||
        relationAd.find((i) => i.sub.grd[1][0] === char);
      if (!found) {
        const empty = relationAd.find((i) => i.id === 0);
        return { data: empty, sub: empty.sub.grd[1], hidden: [] };
      }
      const sub = found.sub.grd[0][0] === char ? found.sub.grd[0] : found.sub.grd[1];
      const hidden = sub[3].map((id) => relationAd.find((item) => item.id === id)).filter(Boolean);
      return { data: found, sub, hidden };
    };
    const s = findGrdData(saju.grd0);
    sijidata = s.data;
    siji = s.sub;
    sijiji = s.hidden;
    const i = findGrdData(saju.grd1);
    iljidata = i.data;
    ilji = i.sub;
    iljiji = i.hidden;
    const w = findGrdData(saju.grd2);
    woljidata = w.data;
    wolji = w.sub;
    woljiji = w.hidden;
    const y = findGrdData(saju.grd3);
    yeonjidata = y.data;
    yeonji = y.sub;
    yeonjiji = y.hidden;

    if (saju.sky1 && ilgan.id !== 0) {
      ilgan?.relation['인수'].forEach((id) => insu.push(relationAd.find((item) => item.id === id)));
      ilgan?.relation['식상'].forEach((id) => sik.push(relationAd.find((item) => item.id === id)));
      ilgan?.relation['관성'].forEach((id) => guan.push(relationAd.find((item) => item.id === id)));
      ilgan?.relation['재성'].forEach((id) => jae.push(relationAd.find((item) => item.id === id)));
    } else {
      const empty = relationAd.find((i) => i.id === 0);
      insu = [empty];
      sik = [empty];
      guan = [empty];
      jae = [empty];
    }

    if (saju.sky1 && saju.grd1) {
      const ilju = saju.sky1 + saju.grd1;
      for (let idx = 0; idx < GONGMANG_DATA.length; idx++) {
        if (GONGMANG_DATA[idx].includes(ilju)) {
          const gmMap = [
            ['술', '해'],
            ['신', '유'],
            ['오', '미'],
            ['진', '사'],
            ['인', '묘'],
            ['자', '축'],
          ];
          gongmang = gmMap[idx] || [];
          break;
        }
      }
      gongmangbool = [
        gongmang.includes(saju.grd1),
        gongmang.includes(saju.grd2),
        gongmang.includes(saju.grd3),
      ];
    }
    if (saju.sky1 && CHUNEUL[saju.sky1]) {
      chuneulbool = [
        CHUNEUL[saju.sky1].includes(saju.grd1),
        CHUNEUL[saju.sky1].includes(saju.grd2),
        CHUNEUL[saju.sky1].includes(saju.grd3),
      ];
    }
    const checkHapChung = (t1, t2, type) => {
      const txt = t1 + t2;
      const rev = t2 + t1;
      if (type === 'sky') {
        if (SKY_HAP_TEXT.includes(txt)) return { hap: [true, SKY_HAP_EXP[txt]], ch: false };
        if (SKY_HAP_TEXT.includes(rev)) return { hap: [true, SKY_HAP_EXP[rev]], ch: false };
        if (SKY_CH_TEXT.includes(txt) || SKY_CH_TEXT.includes(rev))
          return { hap: [false, {}], ch: true };
        return { hap: [false, {}], ch: false };
      }
      if (type === 'grd') {
        let res = { ch: false, banhap: [false, {}], hap6: [false, {}] };
        if (GRD_CH_TEXT.includes(txt) || GRD_CH_TEXT.includes(rev)) res.ch = true;
        if (GRD_BANHAP_TEXT.includes(txt)) res.banhap = [true, GRD_BANHAP_EXP[txt]];
        else if (GRD_BANHAP_TEXT.includes(rev)) res.banhap = [true, GRD_BANHAP_EXP[rev]];
        if (HAP6_TEXT.includes(txt)) res.hap6 = [true, HAP6_EXP[txt]];
        else if (HAP6_TEXT.includes(rev)) res.hap6 = [true, HAP6_EXP[rev]];
        return res;
      }
    };
    if (saju.sky1 && saju.sky2) {
      const r = checkHapChung(saju.sky1, saju.sky2, 'sky');
      sky12hap = r.hap;
      sky12ch = r.ch;
    }
    if (saju.sky2 && saju.sky3) {
      const r = checkHapChung(saju.sky2, saju.sky3, 'sky');
      sky23hap = r.hap;
      sky23ch = r.ch;
    }
    if (saju.grd1 && saju.grd2) {
      const r = checkHapChung(saju.grd1, saju.grd2, 'grd');
      grd12ch = r.ch;
      grd12banhap = r.banhap;
      grd126 = r.hap6;
    }
    if (saju.grd2 && saju.grd3) {
      const r = checkHapChung(saju.grd2, saju.grd3, 'grd');
      grd23ch = r.ch;
      grd23banhap = r.banhap;
      grd236 = r.hap6;
    }
    if (saju.grd1 && saju.grd2 && saju.grd3) {
      const txt = saju.grd1 + saju.grd2 + saju.grd3;
      const rev = saju.grd3 + saju.grd2 + saju.grd1;
      if (BANGHAP_TEXT.includes(txt)) banghap = [true, BANGHAP_EXP[txt]];
      else if (BANGHAP_TEXT.includes(rev)) banghap = [true, BANGHAP_EXP[rev]];
      if (HAP3_TEXT.includes(txt)) hap3 = [true, HAP3_EXP[txt]];
      else if (HAP3_TEXT.includes(rev)) hap3 = [true, HAP3_EXP[rev]];
    }
  }

  // --- Handlers ---
  const handleChange = (e) => {
    if (isInputDisabled && isSaved) return;
    const { name, value } = e.target;
    setSaju((prev) => ({ ...prev, [name]: value }));
  };
  const focusInput = (e) => {
    if (!isSaved) e.target.value = '';
  };
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
    if (!user) {
      alert(UI_TEXT.loginReq[language]);
      login();
      return;
    }
    if (editCount >= MAX_EDIT_COUNT) {
      alert(UI_TEXT.limitReached[language]);
      return;
    }
    if (window.confirm(UI_TEXT.saveConfirm[language])) {
      try {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const newCount = editCount + 1;
        await setDoc(
          doc(db, 'users', user.uid),
          {
            birthDate: inputDate,
            gender,
            isTimeUnknown,
            updatedAt: new Date(),
            lastEditDate: todayStr,
            editCount: newCount,
            email: user.email,
          },
          { merge: true },
        );
        setEditCount(newCount);
        setIsSaved(true);
        alert(UI_TEXT.saveSuccess[language]);
      } catch (error) {
        alert(UI_TEXT.saveFail[language]);
      }
    }
  };

  const isCached = (() => {
    if (!cachedData || !cachedData.saju) return false;
    const savedPrompt = cachedData.prompt || DEFAULT_INSTRUCTION;
    if (savedPrompt !== userPrompt) return false;
    if (cachedData.language !== language) return false;
    if (cachedData.gender !== gender) return false;
    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];
    for (const key of keys) {
      if (cachedData.saju[key] !== saju[key]) return false;
    }
    return true;
  })();

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
  // 💥 [수정] Solar 라이브러리를 사용하여 현재 날짜 및 사주 계산
  const getPillarsForNow = () => {
    const now = new Date();
    try {
      // Solar.fromYmdHms(year, month, day, hour, minute, second) 사용
      const solar = Solar.fromYmdHms(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
      );

      const lunar = solar.getLunar();
      const baZi = lunar.getBaZi(); // [년주, 월주, 일주, 시주]

      const parsePillar = (ganjiHanja) => {
        const skyHanja = ganjiHanja[0];
        const grdHanja = ganjiHanja[1];
        return { sky: HANJA_MAP[skyHanja] || skyHanja, grd: HANJA_MAP[grdHanja] || grdHanja };
      };

      const yearP = parsePillar(baZi[0]);
      const monthP = parsePillar(baZi[1]);
      const dayP = parsePillar(baZi[2]);
      const hourP = parsePillar(baZi[3]);

      return {
        sky3: yearP.sky,
        grd3: yearP.grd,
        sky2: monthP.sky,
        grd2: monthP.grd,
        sky1: dayP.sky,
        grd1: dayP.grd,
        sky0: hourP.sky,
        grd0: hourP.grd,
        date: now.toLocaleDateString('en-CA'),
      };
    } catch (error) {
      console.error('오늘 날짜 사주 계산 실패:', error);
      return null;
    }
  };

  // --- Main AI Analysis ---
  const handleAiAnalysis = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!isSaved) return alert(UI_TEXT.saveFirst[language]);

    // 로딩 타입 설정 (메인 분석)
    setLoadingType('main');
    setResultType('main');
    const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];
    let isMatch = false;
    if (cachedData && cachedData.saju) {
      const savedPrompt = cachedData.prompt || DEFAULT_INSTRUCTION;
      if (
        savedPrompt === userPrompt &&
        cachedData.language === language &&
        cachedData.gender === gender
      ) {
        const isSajuMatch = keys.every((key) => cachedData.saju[key] === saju[key]);
        if (isSajuMatch) isMatch = true;
      }
    }
    if (isMatch) {
      setAiResult(cachedData.result);
      setIsSuccess(true);
      setIsModalOpen(true);
      setViewMode('result');
      return;
    }
    setLoading(true);
    setAiResult('');
    setIsSuccess(false);
    setIsCachedLoading(false);
    setViewMode('result');
    try {
      const currentSajuKey = JSON.stringify(saju);
      const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${inputDate}, 팔자:${currentSajuKey}`;
      const langPrompt = language === 'ko' ? '답변은 한국어로.  ' : 'Answer in English.';

      const hantoeng = `[Terminology Reference]
When translating or referring to Saju terms (Heavenly Stems & Earthly Branches), strictly use **Korean Hanja** (Traditional Chinese characters as used in Korea). 
DO NOT use Simplified Chinese characters.
Refer to the following mapping for exact terms:
${HANJA_ENG_MAP}
`;
      const hantokor = `[Terminology Reference]
사주 용어를 해석할 때(천간과 지지), strictly use **한국한자** (Traditional Chinese characters as used in Korea). 
아래의 매핑을 참조:
${HANJA_MAP}
`;
      const hanja = language === 'ko' ? hantokor : hantoeng;
      const fullPrompt = `${userPrompt}\n${sajuInfo}\n${hanja}\n${langPrompt}`;
      const result = await fetchGeminiAnalysis(fullPrompt);
      await setDoc(
        doc(db, 'users', user.uid),
        {
          lastAiResult: result,
          lastSaju: saju,
          lastPrompt: userPrompt,
          lastLanguage: language,
          lastGender: gender,
        },
        { merge: true },
      );
      setCachedData({
        saju: saju,
        result: result,
        prompt: userPrompt,
        language: language,
        gender: gender,
      });
      setAiResult(result);
      setIsSuccess(true);
      setIsModalOpen(true);
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
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

  // --- 🔮 [오늘의 운세] (Alert X -> Modal O, 로딩 표시 O) ---
  const handleDailyFortune = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!isSaved) return alert(UI_TEXT.saveFirst[language]); // 로딩 시작 및 타입 설정

    setLoading(true);
    setLoadingType('daily');
    setAiResult(''); // 결과 초기화
    setResultType('daily');

    const currentSajuKey = createSajuKey(saju);
    const todayDate = new Date().toLocaleDateString('en-CA'); // 💥 [수정] 캐시 키는 변경하지 않았습니다. (기존 로직 유지)
    // 만약 "최근 3개 저장" 로직을 적용하려면 이전 답변의 배열 로직을 써야 합니다.
    // 여기서는 질문하신 "프롬프트 입력 값" 수정에 집중합니다.
    const cacheKey = `daily_fortune.${currentSajuKey}.${todayDate}`;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.exists() ? userSnap.data() : {}; // 1. 캐시 확인

      if (userData.fortune_cache && userData.fortune_cache[cacheKey]) {
        const cachedResult = userData.fortune_cache[cacheKey];
        setAiResult(cachedResult);
        setIsSuccess(true);
        setIsModalOpen(true);
        setViewMode('result');
        setLoading(false);
        setLoadingType(null);
        return;
      } // 2. 카운트 체크

      if (editCount >= MAX_EDIT_COUNT) {
        setLoading(false);
        setLoadingType(null);
        return alert(UI_TEXT.limitReached[language]);
      } // 3. API 호출 준비

      // 💥 [핵심 수정] 사주 JSON을 한글/영어 텍스트로 명확하게 변환
      const userSajuText = `${saju.sky3}${saju.grd3}년(Year) ${saju.sky2}${saju.grd2}월(Month) ${saju.sky1}${saju.grd1}일(Day) ${saju.sky0}${saju.grd0}시(Time)`;

      // 1. 날짜 객체 생성
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1); // 오늘 날짜에 하루 더함

      // 2. 사주 데이터 추출 (위에서 만든 getPillars 함수 사용)
      const todayPillars = getPillars(today);
      const tomorrowPillars = getPillars(tomorrow);

      if (!todayPillars || !tomorrowPillars) {
        // 에러 처리 (필요시 알림 등)
        return;
      }

      // 3. 텍스트 변환 (오늘)
      const todaySajuText = `${todayPillars.sky3}${todayPillars.grd3}년(Year) ${todayPillars.sky2}${todayPillars.grd2}월(Month) ${todayPillars.sky1}${todayPillars.grd1}일(Day)`;

      // 4. 텍스트 변환 (내일)
      const tomorrowSajuText = `${tomorrowPillars.sky3}${tomorrowPillars.grd3}년(Year) ${tomorrowPillars.sky2}${tomorrowPillars.grd2}월(Month) ${tomorrowPillars.sky1}${tomorrowPillars.grd1}일(Day)`;

      // 5. 최종 프롬프트 정보 구성 (User Saju / Today / Tomorrow)
      // userSajuText는 이미 상단에서 정의되어 있다고 가정
      const sajuInfo = `[User Saju] ${userSajuText} / [Today: ${todayPillars.date}] ${todaySajuText} / [Tomorrow: ${tomorrowPillars.date}] ${tomorrowSajuText}`;
      const langPrompt =
        language === 'ko' ? '답변은 한국어로. 500자 이내.' : 'Answer in English. Max 500 chars.';
      const hantoeng = `[Terminology Reference]
When translating or referring to Saju terms (Heavenly Stems & Earthly Branches), strictly use **Korean Hanja** (Traditional Chinese characters as used in Korea). 
DO NOT use Simplified Chinese characters.
Refer to the following mapping for exact terms:
${HANJA_ENG_MAP}
`;
      const hantokor = `[Terminology Reference]
사주 용어를 해석할 때(천간과 지지), strictly use **한국한자** (Traditional Chinese characters as used in Korea). 
아래의 매핑을 참조:
${HANJA_MAP}
`;
      const hanja = language === 'ko' ? hantokor : hantoeng;

      // 최종 프롬프트
      const fullPrompt = `${DAILY_FORTUNE_PROMPT[language]}\n${sajuInfo}\n${langPrompt}\n${hanja}`;

      const result = await fetchGeminiAnalysis(fullPrompt);
      const newCount = editCount + 1; // 4. DB 저장 (캐시 & 카운트)

      let fortuneCache = userData.fortune_cache || {};
      fortuneCache[cacheKey] = result;

      await setDoc(
        userDocRef,
        {
          editCount: newCount,
          lastEditDate: new Date().toLocaleDateString('en-CA'),
          fortune_cache: fortuneCache,
        },
        { merge: true },
      );

      setEditCount(newCount); // 5. 결과 모달 띄우기

      setAiResult(result);
      setIsSuccess(true);
      setIsModalOpen(true);
      setViewMode('result');
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };
  // --- 🎉 [신년 운세] (Alert X -> Modal O, 로딩 표시 O) ---
  const handleNewYearFortune = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!isSaved) return alert(UI_TEXT.saveFirst[language]);

    // 로딩 시작 및 타입 설정
    setLoading(true);
    setLoadingType('year');
    setAiResult('');
    setResultType('year');

    const currentSajuKey = createSajuKey(saju);
    const nextYear = new Date().getFullYear() + 1;
    const cacheKey = `new_year_fortune.${currentSajuKey}.${nextYear}`;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      // 1. 캐시 확인
      if (userData.fortune_cache && userData.fortune_cache[cacheKey]) {
        const cachedResult = userData.fortune_cache[cacheKey];
        // 캐시 있으면 바로 모달
        setAiResult(cachedResult);
        setIsSuccess(true);
        setIsModalOpen(true);
        setViewMode('result');
        setLoading(false);
        setLoadingType(null);
        return;
      }

      // 2. 카운트 체크
      if (editCount >= MAX_EDIT_COUNT) {
        setLoading(false);
        setLoadingType(null);
        return alert(UI_TEXT.limitReached[language]);
      }

      // 3. API 호출
      const currentSajuJson = JSON.stringify(saju);
      const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${inputDate}, 팔자:${currentSajuJson}`;
      const langPrompt =
        language === 'ko' ? '답변은 한국어로. 500자 이내.' : 'Answer in English. Max 500 chars.';
      const hantoeng = `[Terminology Reference]
When translating or referring to Saju terms (Heavenly Stems & Earthly Branches), strictly use **Korean Hanja** (Traditional Chinese characters as used in Korea). 
DO NOT use Simplified Chinese characters.
Refer to the following mapping for exact terms:
${HANJA_ENG_MAP}
`;
      const hantokor = `[Terminology Reference]
사주 용어를 해석할 때(천간과 지지), strictly use **한국한자** (Traditional Chinese characters as used in Korea). 
아래의 매핑을 참조:
${HANJA_MAP}
`;
      const hanja = language === 'ko' ? hantokor : hantoeng;
      const fullPrompt = `${NEW_YEAR_FORTUNE_PROMPT[language]}\n${sajuInfo}\n${langPrompt}\n${hanja}`;

      const result = await fetchGeminiAnalysis(fullPrompt);
      const newCount = editCount + 1;

      // 4. DB 저장
      let fortuneCache = userData.fortune_cache || {};
      fortuneCache[cacheKey] = result;

      await setDoc(
        userDocRef,
        {
          editCount: newCount,
          lastEditDate: new Date().toLocaleDateString('en-CA'),
          fortune_cache: fortuneCache,
        },
        { merge: true },
      );

      setEditCount(newCount);

      // 5. 결과 모달
      setAiResult(result);
      setIsSuccess(true);
      setIsModalOpen(true);
      setViewMode('result');
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

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
      const langPrompt =
        language === 'ko' ? '답변은 한국어로. 300단어 이내.' : 'Answer in English. 300 WORDS.';
      const hantoeng = `[Terminology Reference]
When translating or referring to Saju terms (Heavenly Stems & Earthly Branches), strictly use **Korean Hanja** (Traditional Chinese characters as used in Korea). 
DO NOT use Simplified Chinese characters.
Refer to the following mapping for exact terms:
${HANJA_ENG_MAP}
`;
      const hantokor = `[Terminology Reference]
사주 용어를 해석할 때(천간과 지지), strictly use **한국한자** (Traditional Chinese characters as used in Korea). 
아래의 매핑을 참조:
${HANJA_MAP}
`;
      const hanja = language === 'ko' ? hantokor : hantoeng;

      const fullPrompt = `${myQuestion}\n${sajuInfo}\n${langPrompt}\n${hanja}`;

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

  const handleCopyResult = async () => {
    if (aiResult) {
      await navigator.clipboard.writeText(aiResult);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  const handleShare = async () => {
    const shareData = { title: 'Sajucha', text: 'AI 사주 분석', url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(shareData.url);
      alert('주소 복사됨!');
    }
  };

  const saveAsImageSaju = useCallback(async () => {
    const el = document.getElementById('saju-capture');
    if (el) {
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        style: { margin: '0' },
        backgroundColor: localStorage.theme === 'dark' ? '#1e293b' : '#ffffff',
      });
      const link = document.createElement('a');
      link.download = 'saju.png';
      link.href = dataUrl;
      link.click();
    }
  }, []);
  const saveAsImageIlju = useCallback(async () => {
    const el = document.getElementById('day-pillar-capture');
    if (el) {
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        style: { margin: '0' },
        backgroundColor: localStorage.theme === 'dark' ? '#1e293b' : '#ffffff',
      });
      const link = document.createElement('a');
      link.download = 'ilju.png';
      link.href = dataUrl;
      link.click();
    }
  }, []);

  const jiStyle = ' w-1/2 text-center text-xs';
  const pillarLabelStyle =
    'text-sm font-extrabold text-slate-500 uppercase tracking-widest text-center dark:text-slate-400';
  const iconsViewStyle = 'bg-white bg-opacity-10 border-4';
  const pillarStyle = 'flex flex-col gap-[2px] rounded-lg p-1';
  const t = (char) => (language === 'en' ? getEng(char) : char);

  return (
    <div className="relative px-3 py-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* ▼▼▼▼▼▼ 헤더 영역 수정 시작 ▼▼▼▼▼▼ */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 max-w-xl m-auto">
        {/* ✅ 왼쪽: 로고 + 타이틀 그룹 */}
        {theme === 'dark' ? (
          <div className="flex items-center gap-3">
            {/* ✨ 언어에 따라 다른 로고 이미지 표시 */}
            <img
              src={language === 'ko' ? logoKorDark : logoEngDark}
              alt="Sajucha Logo"
              className="w-[300px] rounded-xl shadow-sm object-cover"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* ✨ 언어에 따라 다른 로고 이미지 표시 */}
            <img
              src={language === 'ko' ? logoKor : logoEng}
              alt="Sajucha Logo"
              className="w-[300px] rounded-xl shadow-sm object-cover"
            />
          </div>
        )}

        {/* ✅ 오른쪽: 버튼 그룹 (공유하기 + 테마 변경) */}
        <div className="flex items-center gap-2">
          {/* 🔗 공유하기 버튼 (기존 handleShare 함수 재사용) */}
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-indigo-50 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-600 transition-colors text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-gray-600/50"
            aria-label="Share"
          >
            <ShareIcon className="w-5 h-5" />
          </button>

          {/* 🌙 테마 토글 버튼 */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors border border-gray-200 dark:border-gray-600/50"
            aria-label="Toggle Theme"
          >
            <span className="text-lg leading-none">{theme === 'dark' ? '🌙' : '☀️'}</span>
          </button>
        </div>
      </div>
      {/* ▲▲▲▲▲▲ 헤더 영역 수정 끝 ▲▲▲▲▲▲ */}
      <div className="w-full max-w-lg  p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl mx-auto my-4">
        <div className="flex flex-col gap-2">
          <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === 'en' ? 'bg-white dark:bg-slate-600 text-indigo-600 shadow-sm' : 'text-gray-400'}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ko')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === 'ko' ? 'bg-white dark:bg-slate-600 text-indigo-600 shadow-sm' : 'text-gray-400'}`}
            >
              한국어
            </button>
          </div>
          <div className="flex items-center justify-between bg-indigo-50 dark:bg-slate-700/50 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/30">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-indigo-200"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                      {user.displayName}
                      {language == 'ko' && <>님</>}
                    </span>
                    <span className="text-[10px] text-gray-400">{UI_TEXT.welcome[language]}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={logout}
                    className="text-xs px-3 py-1.5 bg-gray-200 rounded-lg font-bold"
                  >
                    {UI_TEXT.logout[language]}
                  </button>
                  {isLocked ? (
                    <span className="text-[10px] text-red-500 font-bold">
                      {UI_TEXT.lockedMsg[language]}
                    </span>
                  ) : isSaved ? (
                    <button
                      onClick={handleEditMode}
                      className="text-[10px] text-gray-500 underline font-semibold hover:text-indigo-600"
                    >
                      {BD_EDIT_UI.edit[language]}
                      <span className="ml-1 font-extrabold text-indigo-600 dark:text-indigo-400">
                        {MAX_EDIT_COUNT - editCount}
                      </span>
                      <span className="text-gray-400">/{MAX_EDIT_COUNT}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelEdit}
                      className="text-[10px] text-red-500 underline font-extrabold hover:text-red-700"
                    >
                      {BD_EDIT_UI.cancel[language]}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full">
                <button
                  onClick={login}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-gray-50 text-gray-700 border rounded-lg font-bold shadow-sm"
                >
                  {/* SVG Icons omitted for brevity, they are same */}
                  <span className="text-sm">{UI_TEXT.googleLogin[language]}</span>
                </button>
                <p className="text-[10px] text-center text-gray-400 mt-1">
                  {UI_TEXT.loginMsg[language]}
                </p>
              </div>
            )}
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${isSaved ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}
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
                <div className="relative">
                  <input
                    type={isTimeUnknown ? 'date' : 'datetime-local'}
                    value={isTimeUnknown ? inputDate.split('T')[0] : inputDate}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (isTimeUnknown) val += 'T00:00';
                      setInputDate(val);
                    }}
                    className={`w-full p-3 bg-gray-50 dark:bg-slate-900/50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white dark:[color-scheme:dark]`}
                  />
                </div>
              </div>
              <button
                onClick={handleSaveMyInfo}
                className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                {BD_EDIT_UI.complete[language]}
                <span className="ml-2 text-sm font-extrabold text-white bg-indigo-500 px-2 py-0.5 rounded-lg shadow-sm">
                  {MAX_EDIT_COUNT - editCount}
                </span>
                <span className="text-indigo-200 text-xs">/{MAX_EDIT_COUNT}</span>
              </button>
            </div>
          </div>
          {user && (
            <div className="p-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 text-center flex flex-col gap-1">
              <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                {inputDate.replace('T', ' ')}
                {isTimeUnknown && (
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    ({UI_TEXT.unknownTime[language]})
                  </span>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-lg font-extrabold text-indigo-900 dark:text-indigo-200 tracking-wider">
                <span className="whitespace-nowrap">
                  {t(saju.sky3)}
                  {t(saju.grd3)}
                  <span className="text-xs font-normal text-indigo-400 ml-1">
                    {UI_TEXT.year[language]}
                  </span>
                </span>
                <span className="whitespace-nowrap">
                  {t(saju.sky2)}
                  {t(saju.grd2)}
                  <span className="text-xs font-normal text-indigo-400 ml-1">
                    {UI_TEXT.month[language]}
                  </span>
                </span>
                <span className="whitespace-nowrap">
                  {t(saju.sky1)}
                  {t(saju.grd1)}
                  <span className="text-xs font-normal text-indigo-400 ml-1">
                    {UI_TEXT.day[language]}
                  </span>
                </span>
                {!isTimeUnknown && (
                  <span className="whitespace-nowrap">
                    {t(saju.sky0)}
                    {t(saju.grd0)}
                    <span className="text-xs font-normal text-indigo-400 ml-1">
                      {UI_TEXT.hour[language]}
                    </span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {!!showIcons && user && (
        <div
          id="saju-capture"
          style={{ width: `${containerWidth}px`, maxWidth: '100%' }}
          className=" relative rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden m-auto transition-[width] duration-100 ease-linear py-2 bg-white dark:bg-slate-800 animate-[fadeIn_0.5s_ease-out]"
        >
          {bgShow && (
            <div className="absolute inset-0 z-0 flex flex-col pointer-events-none transition-all duration-500">
              <div
                className={`h-1/2 w-full relative bg-gradient-to-b overflow-hidden transition-colors duration-700 ease-in-out ${theme === 'dark' ? 'from-indigo-950/80 via-slate-900/70 to-blue-900/60' : 'from-sky-400/40 via-sky-200/40 to-white/5'}`}
              >
                {/* 배경 아이콘 유지 */}
              </div>
              <div
                className={`h-1/2 w-full relative bg-gradient-to-b transition-colors duration-700 ease-in-out border-t ${theme === 'dark' ? 'from-slate-800/50 to-gray-900/70 border-slate-700/30' : 'from-stone-300/40 to-amber-100/60 border-stone-400/20'}`}
              ></div>
            </div>
          )}
          <div className="relative z-10 flex justify-center bg-white/10 backdrop-blur-sm">
            {charShow && (
              <div className="flex flex-col items-end  pt-[10px] animate-[fadeIn_0.5s_ease-out]">
                <div className="h-4" />
                <div className="h-[90px] flex items-center pr-2 border-r border-sky-700/30">
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-sky-700 uppercase tracking-widest opacity-80 dark:text-cyan-600">
                      Heavenly
                    </span>
                    <span className="block text-[10px] font-serif font-bold text-gray-700 drop-shadow-sm dark:text-gray-400">
                      Stem
                    </span>
                  </div>
                </div>
                <div className="h-[110px] flex items-center pr-2 border-r border-stone-400/20">
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest opacity-70 dark:text-yellow-600">
                      Earthly
                    </span>
                    <span className="block text-[10px] font-serif font-bold text-stone-700 drop-shadow-sm dark:text-gray-400">
                      Branch
                    </span>
                  </div>
                </div>
              </div>
            )}
            {!isTimeUnknown && !!saju.grd0 && (
              <div className={pillarStyle}>
                <div className={pillarLabelStyle}>{UI_TEXT.hour[language]}</div>
                <div
                  className={classNames(
                    iconsViewStyle,
                    saju.sky0 ? bgToBorder(sigan.color) : 'border-gray-200',
                    'rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm',
                  )}
                >
                  <div className="text-3xl mb-1">{getIcon(saju.sky0, 'sky')}</div>
                  {!!saju.sky0 && (
                    <>
                      <div className="text-[10px] font-bold">{getHanja(saju.sky0, 'sky')}</div>
                      <div className="text-[8px] uppercase tracking-tighter">{t(saju.sky0)}</div>
                    </>
                  )}
                </div>
                <div
                  className={classNames(
                    iconsViewStyle,
                    saju.grd0 ? bgToBorder(sijidata.color) : 'border-gray-200',
                    'rounded-md w-16 flex flex-col items-center justify-center shadow-sm',
                  )}
                >
                  <div className="text-3xl mb-1">{getIcon(saju.grd0, 'grd')}</div>
                  {!!saju.grd0 && (
                    <>
                      <div className="text-[10px] font-bold">{getHanja(saju.grd0, 'grd')}</div>
                      <div className="text-[8px] uppercase tracking-tighter">{t(saju.grd0)}</div>
                    </>
                  )}
                  <div className="flex w-full opacity-50">
                    {sijiji.map((i, idx) => (
                      <div key={idx} className={[jiStyle, i.color, ''].join(' ')}>
                        <div className="text-[7px]">{i.sub.sky[1]}</div>
                        <div>{i.sub.sky[2]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div
              className={classNames(
                pillarStyle,
                bgShow
                  ? 'bg-white/90 dark:bg-white/40 border-gray-600 border-[0.5px] border-dashed'
                  : 'bg-yellow-100/50 border-yellow-500',
              )}
            >
              <span className={classNames(pillarLabelStyle, 'dark:!text-gray-700')}>
                {UI_TEXT.day[language]}
              </span>
              <div
                className={classNames(
                  iconsViewStyle,
                  saju.sky1 ? bgToBorder(ilgan.color) : 'border-gray-200',
                  'rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm',
                )}
              >
                <div className="text-3xl mb-1">{getIcon(saju.sky1, 'sky')}</div>
                {!!saju.sky1 && (
                  <>
                    <div className="text-[10px] font-bold">{getHanja(saju.sky1, 'sky')}</div>
                    <div className="text-[8px] uppercase tracking-tighter">{t(saju.sky1)}</div>
                  </>
                )}
              </div>
              <div
                className={classNames(
                  iconsViewStyle,
                  saju.grd1 ? bgToBorder(iljidata.color) : 'border-gray-200',
                  'rounded-md w-16 flex flex-col items-center justify-center shadow-sm',
                )}
              >
                <div className="text-3xl mb-1">{getIcon(saju.grd1, 'grd')}</div>
                {!!saju.grd1 && (
                  <>
                    <div className="text-[10px] font-bold">{getHanja(saju.grd1, 'grd')}</div>
                    <div className="text-[8px] uppercase tracking-tighter">{t(saju.grd1)}</div>
                  </>
                )}
                <div className="flex w-full opacity-50">
                  {iljiji.map((i, idx) => (
                    <div key={idx} className={[jiStyle, i.color, ''].join(' ')}>
                      <div className="text-[7px]">{i.sub.sky[1]}</div>
                      <div>{i.sub.sky[2]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={pillarStyle}>
              <span className={pillarLabelStyle}>{UI_TEXT.month[language]}</span>
              <div
                className={classNames(
                  iconsViewStyle,
                  saju.sky2 ? bgToBorder(wolgan.color) : 'border-gray-200',
                  'rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm',
                )}
              >
                <div className="text-3xl mb-1">{getIcon(saju.sky2, 'sky')}</div>
                {!!saju.sky2 && (
                  <>
                    <div className="text-[10px] font-bold">{getHanja(saju.sky2, 'sky')}</div>
                    <div className="text-[8px] uppercase tracking-tighter">{t(saju.sky2)}</div>
                  </>
                )}
              </div>
              <div
                className={classNames(
                  iconsViewStyle,
                  saju.grd2 ? bgToBorder(woljidata.color) : 'border-gray-200',
                  'rounded-md w-16 flex flex-col items-center justify-center shadow-sm',
                )}
              >
                <div className="text-3xl mb-1">{getIcon(saju.grd2, 'grd')}</div>
                {!!saju.grd2 && (
                  <>
                    <div className="text-[10px] font-bold">{getHanja(saju.grd2, 'grd')}</div>
                    <div className="text-[8px] uppercase tracking-tighter">{t(saju.grd2)}</div>
                  </>
                )}
                <div className="flex w-full opacity-50">
                  {woljiji.map((i, idx) => (
                    <div key={idx} className={[jiStyle, i.color, ''].join(' ')}>
                      <div className="text-[7px]">{i.sub.sky[1]}</div>
                      <div>{i.sub.sky[2]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={pillarStyle}>
              <span className={pillarLabelStyle}>{UI_TEXT.year[language]}</span>
              <div
                className={classNames(
                  iconsViewStyle,
                  saju.sky3 ? bgToBorder(yeongan.color) : 'border-gray-200',
                  'rounded-md w-16 flex flex-col items-center justify-center py-2 shadow-sm',
                )}
              >
                <div className="text-3xl mb-1">{getIcon(saju.sky3, 'sky')}</div>
                {!!saju.sky3 && (
                  <>
                    <div className="text-[10px] font-bold">{getHanja(saju.sky3, 'sky')}</div>
                    <div className="text-[8px] uppercase tracking-tighter">{t(saju.sky3)}</div>
                  </>
                )}
              </div>
              <div
                className={classNames(
                  iconsViewStyle,
                  saju.grd3 ? bgToBorder(yeonjidata.color) : 'border-gray-200',
                  'rounded-md w-16 flex flex-col items-center justify-center shadow-sm',
                )}
              >
                <div className="text-3xl mb-1">{getIcon(saju.grd3, 'grd')}</div>
                {!!saju.grd3 && (
                  <>
                    <div className="text-[10px] font-bold">{getHanja(saju.grd3, 'grd')}</div>
                    <div className="text-[8px] uppercase tracking-tighter">{t(saju.grd3)}</div>
                  </>
                )}
                <div className="flex w-full opacity-50">
                  {yeonjiji.map((i, idx) => (
                    <div key={idx} className={[jiStyle, i.color, ''].join(' ')}>
                      <div className="text-[7px]">{i.sub.sky[1]}</div>
                      <div>{i.sub.sky[2]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. AI 버튼 영역 (3분할) 및 로딩 상태창 */}
      <div className="my-4 pt-4 border-t border-gray-200 dark:border-gray-700 max-w-xl m-auto px-4">
        {/* A. 버튼 그룹 */}
        <div className="flex justify-between gap-3 h-24">
          {/* 1. 메인 분석 버튼 */}
          <button
            onClick={handleAiAnalysis}
            disabled={loading || !user || !isSaved}
            className={`flex-1 rounded-xl font-bold shadow-lg transition-all relative group flex flex-col items-center justify-center gap-1.5
              ${
                loading || !user || !isSaved
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : isCached
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:scale-[1.02] shadow-emerald-200/50'
                    : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:scale-[1.02] shadow-indigo-200/50'
              }`}
          >
            {/* 아이콘 및 텍스트 */}
            <span className="text-2xl drop-shadow-md">
              {/* 로딩 중이면 스피너, 캐시 있으면 체크, 아니면 수정구슬 */}
              {loading && loadingType === 'main' ? (
                <svg className="animate-spin h-7 w-7 text-indigo-500" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : isCached ? (
                '✅'
              ) : (
                '🔮'
              )}
            </span>
            <span className="text-sm sm:text-sm font-medium">
              {!user
                ? UI_TEXT.loginReq[language]
                : !isSaved
                  ? 'Save Info'
                  : isCached
                    ? language === 'ko'
                      ? '사주 분석 완료'
                      : 'Decoding Completed' // 여기를 수정했습니다
                    : UI_TEXT.analyzeBtn[language]}
            </span>
          </button>

          {/* 2. 신년 운세 버튼 */}
          <button
            onClick={handleNewYearFortune}
            disabled={loading || !user || !isSaved}
            className={`flex-1 rounded-xl font-bold shadow-lg transition-all relative overflow-hidden flex flex-col items-center justify-center gap-1.5
              ${
                loading || !user || !isSaved
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-gradient-to-br from-green-500 to-emerald-700 text-white hover:scale-[1.02] shadow-green-200/50'
              }`}
          >
            <span className="text-2xl drop-shadow-md">
              {loading && loadingType === 'year' ? (
                <svg className="animate-spin h-7 w-7 text-green-600" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                '🐲'
              )}
            </span>
            <span className="text-sm sm:text-sm font-medium">
              {language === 'ko' ? '신년 운세' : '2026 Path Guide'}
            </span>
          </button>

          {/* 3. 오늘의 운세 버튼 */}
          <button
            onClick={handleDailyFortune}
            disabled={loading || !user || !isSaved}
            className={`flex-1 rounded-xl font-bold shadow-lg transition-all relative overflow-hidden flex flex-col items-center justify-center gap-1.5
              ${
                loading || !user || !isSaved
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:scale-[1.02] shadow-orange-200/50'
              }`}
          >
            <span className="text-2xl drop-shadow-md">
              {loading && loadingType === 'daily' ? (
                <svg className="animate-spin h-7 w-7 text-orange-500" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                '🌞'
              )}
            </span>
            <span className="text-sm sm:text-sm font-medium">
              {language === 'ko' ? '오늘의 운세' : "Today's Luck"}
            </span>
          </button>
        </div>

        {/* B. ✨ [새로 추가] 독립된 로딩 상태 표시창 (버튼 아래 위치) */}
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
      </div>
      {/* 5. 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:text-gray-300">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
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
                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  {viewMode === 'chat'
                    ? language === 'ko'
                      ? '사자와 대화'
                      : 'Chat with the master'
                    : UI_TEXT.modalTitle[language]}
                </h3>
                <span
                  className={`text-[13px] font-bold ${isLocked ? 'text-red-500' : 'text-gray-400'}`}
                >
                  {isLocked ? (
                    language === 'ko' ? (
                      '일일 질문 제한 초과'
                    ) : (
                      'Daily Limit Reached'
                    )
                  ) : (
                    <>
                      {language === 'ko' ? '남은 질문' : 'Remaining'}:
                      <span className="ml-1 font-extrabold text-indigo-600 dark:text-indigo-400">
                        {MAX_EDIT_COUNT - editCount}
                      </span>
                      <span className="text-gray-400">/{MAX_EDIT_COUNT}</span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex gap-2">
                {viewMode === 'result' && (
                  <button
                    onClick={handleCopyResult}
                    className="px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs"
                  >
                    {isCopied ? UI_TEXT.copiedBtn[language] : UI_TEXT.copyBtn[language]}
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
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
                          <span>결과 공유하고 친구에게 추천하기</span>
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
                          <div className="flex-shrink-0 mt-1 w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-700"></div>
                          <div className="flex flex-col items-start max-w-[85%]">
                            <span className="text-[11px] font-bold text-gray-400 mb-1 ml-1">
                              {language === 'ko' ? '사자' : 'Master Saza'}...
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

                    {/* 2. 하단 입력창 영역 (기존 코드 유지) */}
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
                          className="w-full pl-5 pr-14 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white disabled:opacity-60 transition-all"
                        />
                        <button
                          onClick={handleAdditionalQuestion}
                          disabled={isLocked || !customQuestion.trim() || qLoading}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all flex items-center justify-center ${
                            isLocked || !customQuestion.trim() || qLoading
                              ? 'text-gray-400 bg-gray-100 dark:bg-slate-700 cursor-not-allowed'
                              : 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95'
                          }`}
                        >
                          {/* 전송 아이콘 (종이비행기 모양으로 변경 추천) */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5 relative left-[1px]"
                          >
                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                          </svg>
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
      {!!showIcons && (
        <div className="flex flex-col items-center mt-2 sr-only">
          <div
            id="day-pillar-capture"
            className={classNames(
              pillarStyle,
              bgShow ? 'bg-white dark:bg-gray-400' : 'bg-yellow-50 dark:bg-gray-400',
            )}
          >
            <span className={classNames(pillarLabelStyle, 'dark:!text-gray-500')}>Day</span>
            <div
              className={classNames(
                iconsViewStyle,
                saju.sky1 ? bgToBorder(ilgan.color) : 'border-gray-200',
                'rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm',
              )}
            >
              <div className="text-3xl mb-1">{getIcon(saju.sky1, 'sky')}</div>
              {!!saju.sky1 && (
                <>
                  <div className="text-[10px] font-bold">{getHanja(saju.sky1, 'sky')}</div>
                </>
              )}
            </div>
            <div
              className={classNames(
                iconsViewStyle,
                saju.grd1 ? bgToBorder(iljidata.color) : 'border-gray-200',
                'rounded-md w-16 flex flex-col items-center justify-center shadow-sm',
              )}
            >
              <div className="text-3xl mb-1">{getIcon(saju.grd1, 'grd')}</div>
              {!!saju.grd1 && (
                <>
                  <div className="text-[10px] font-bold">{getHanja(saju.grd1, 'grd')}</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
