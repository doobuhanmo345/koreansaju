import { useState, useEffect, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import {
  BoltIcon,
  PlusCircleIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  LockClosedIcon,
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
  ENG_MAP,
  HANJA_ENG_MAP,
  DAILY_FORTUNE_PROMPT,
} from './data/constants';
import { classNames, getIcon, getHanja, getEng, getLoadingText, bgToBorder } from './utils/helpers';

// 💡 추가된 텍스트 상수
const LOCAL_UI = {
  cancel: { en: 'Cancel Edit Birthday', ko: '생일 수정 취소' },
  complete: { en: 'Complete Edit Birthday', ko: '생일 수정 완료' },
  edit: { en: 'Edit Birthday', ko: '생일 수정하기' },
};

// 💡 [추가] 신년 운세 프롬프트
const NEW_YEAR_FORTUNE_PROMPT = {
  ko: `다음 사주 정보를 바탕으로, 해당 사주를 가진 사람의 2026년(병오년) 운세를 종합적으로 분석해 주세요. 500자 이내로 핵심만 요약해 주세요. 
  그 후, 
  1. 1월 운세 : 을사년 기축월의 운세 100자 이내
  2. 2월 운세 : 을사년 경인월의 운세 100자 이내
  3. 3월 운세 : 을사년 신묘월의 운세 100자 이내
  4. 4월 운세 : 을사년 임진월의 운세 100자 이내
  5. 5월 운세 : 을사년 계사월의 운세 100자 이내
  6. 6월 운세 : 을사년 갑오월의 운세 100자 이내
  7. 7월 운세 : 을사년 을미월의 운세 100자 이내
  8. 8월 운세 : 을사년 병신월의 운세 100자 이내
  9. 9월 운세 : 을사년 정유월의 운세 100자 이내
  10. 10월 운세 : 을사년 무술월의 운세 100자 이내
  11. 11월 운세 : 을사년 기해월의 운세 100자 이내
  12. 12월 운세 : 을사년 경자월의 운세 100자 이내
`,
  en: `Based on the provided Saju information, please provide a comprehensive analysis of the fortune for the year 2026 (Byeong-o Year). Summarize the key points within 500 characters.

Then, please provide the fortune for each month as follows (keep each under 100 characters):
1. January Fortune: Fortune for Gichuk Month of Eulsa Year
2. February Fortune: Fortune for Gyeongin Month of Eulsa Year
3. March Fortune: Fortune for Sinmyo Month of Eulsa Year
4. April Fortune: Fortune for Imjin Month of Eulsa Year
5. May Fortune: Fortune for Gyesa Month of Eulsa Year
6. June Fortune: Fortune for Gabo Month of Eulsa Year
7. July Fortune: Fortune for Eulmi Month of Eulsa Year
8. August Fortune: Fortune for Byeongshin Month of Eulsa Year
9. September Fortune: Fortune for Jeongyu Month of Eulsa Year
10. October Fortune: Fortune for Musul Month of Eulsa Year
11. November Fortune: Fortune for Gihae Month of Eulsa Year
12. December Fortune: Fortune for Gyeongja Month of Eulsa Year
`,
};

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
      const langPrompt = language === 'ko' ? '답변은 한국어로. ' : 'Answer in English.';
      const hantoeng = `[Terminology Reference]
When translating or referring to Saju terms (Heavenly Stems & Earthly Branches), strictly use **Korean Hanja** (Traditional Chinese characters as used in Korea). 
DO NOT use Simplified Chinese characters.
Refer to the following mapping for exact terms:
${HANJA_ENG_MAP}
`;
      const fullPrompt = `${userPrompt}\n${sajuInfo}\n${hantoeng}\n${langPrompt}`;
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

  const handleSetViewMode = async (mode) => {
    setViewMode(mode);
    if (mode === 'chat' && user) {
      setQLoading(true);
      const currentSajuKey = createSajuKey(saju);
      if (currentSajuKey) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          const data = userSnap.exists() ? userSnap.data() : {};
          const sajuRecords = data.chat_records || {};
          let currentSajuHistory = sajuRecords[currentSajuKey] || [];
          currentSajuHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          const newChatList = currentSajuHistory
            .map((item) => [
              { role: 'user', text: item.question },
              { role: 'ai', text: item.answer },
            ])
            .flat();
          setChatList(newChatList);
        } catch (error) {
          setChatList([]);
        }
      } else {
        setChatList([]);
      }
      setQLoading(false);
    }
  };

  // --- 🔮 [오늘의 운세] (Alert X -> Modal O, 로딩 표시 O) ---
  const handleDailyFortune = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!isSaved) return alert(UI_TEXT.saveFirst[language]); // 로딩 시작 및 타입 설정

    setLoading(true);
    setLoadingType('daily');
    setAiResult(''); // 결과 초기화

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

      const todayPillars = getPillarsForNow();
      if (!todayPillars) {
        setLoading(false);
        setLoadingType(null);
        return alert('Error: 현재 날짜 정보를 불러올 수 없습니다.');
      }

      // 💥 [핵심 수정] 사주 JSON을 한글/영어 텍스트로 명확하게 변환
      const userSajuText = `${saju.sky3}${saju.grd3}년(Year) ${saju.sky2}${saju.grd2}월(Month) ${saju.sky1}${saju.grd1}일(Day) ${saju.sky0}${saju.grd0}시(Time)`;

      // 💥 [핵심 수정] 오늘 날짜 사주도 텍스트로 변환
      const todaySajuText = `${todayPillars.sky3}${todayPillars.grd3}년(Year) ${todayPillars.sky2}${todayPillars.grd2}월(Month) ${todayPillars.sky1}${todayPillars.grd1}일(Day)`;

      // 프롬프트 정보 구성 (JSON 대신 변환된 텍스트 사용)
      const sajuInfo = `[User Saju] ${userSajuText} / [Today's Date Saju] ${todayDate}, ${todaySajuText}`;
      const langPrompt =
        language === 'ko' ? '답변은 한국어로. 500자 이내.' : 'Answer in English. Max 500 chars.';
      const hantoeng = `[Terminology Reference]
When translating or referring to Saju terms (Heavenly Stems & Earthly Branches), strictly use **Korean Hanja** (Traditional Chinese characters as used in Korea). 
DO NOT use Simplified Chinese characters.
Refer to the following mapping for exact terms:
${HANJA_ENG_MAP}
`;

      // 최종 프롬프트
      const fullPrompt = `${DAILY_FORTUNE_PROMPT[language]}\n${sajuInfo}\n${langPrompt}\n${hantoeng}`;

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
      const fullPrompt = `${NEW_YEAR_FORTUNE_PROMPT[language]}\n${sajuInfo}\n${langPrompt}\n${hantoeng}`;

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
      const fullPrompt = `${myQuestion}\n${sajuInfo}\n${langPrompt}\n${hantoeng}`;

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
      <div className="w-full max-w-lg mb-8 p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl mx-auto">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
              {UI_TEXT.title[language]}
            </h3>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
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
                      {LOCAL_UI.edit[language]}
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
                      {LOCAL_UI.cancel[language]}
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
                {LOCAL_UI.complete[language]}
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
          className="mt-2 relative rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden m-auto transition-[width] duration-100 ease-linear py-2 bg-white dark:bg-slate-800 animate-[fadeIn_0.5s_ease-out]"
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

      {/* 4. AI 버튼 영역 (3분할) */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 max-w-xl m-auto px-4">
        <div className="flex justify-between gap-3">
          {/* 1. 메인 분석 버튼 */}
          <button
            onClick={handleAiAnalysis}
            disabled={loading || !user || !isSaved}
            className={`flex-1 h-12 rounded-xl font-bold shadow-lg transition-all overflow-hidden relative group ${loading || !user || !isSaved ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : isCached ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-[1.02]' : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:scale-[1.02]'}`}
          >
            {loading && loadingType === 'main' && (
              <div
                className="absolute top-0 left-0 h-full bg-indigo-200/50"
                style={{ width: `${progress}%` }}
              />
            )}
            <span className="relative z-10 flex justify-center items-center gap-2 text-sm">
              {loading && loadingType === 'main' ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                  {isCachedLoading
                    ? UI_TEXT.loadingCached[language]
                    : getLoadingText(progress, language)}{' '}
                  ({Math.round(progress)}%)
                </>
              ) : !user ? (
                UI_TEXT.loginReq[language]
              ) : !isSaved ? (
                'Save Info'
              ) : isCached ? (
                'Result'
              ) : (
                UI_TEXT.analyzeBtn[language]
              )}
            </span>
          </button>

          {/* 2. 신년 운세 버튼 */}
          <button
            onClick={handleNewYearFortune}
            disabled={loading || !user || !isSaved}
            className={`flex-1 h-12 rounded-xl font-bold shadow-lg text-sm transition-all relative overflow-hidden ${loading || !user || !isSaved ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02]'}`}
          >
            {loading && loadingType === 'year' && (
              <div
                className="absolute top-0 left-0 h-full bg-green-200/50"
                style={{ width: `${progress}%` }}
              />
            )}
            <span className="relative z-10 flex justify-center items-center gap-2">
              {loading && loadingType === 'year' ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                  {isCachedLoading
                    ? UI_TEXT.loadingCached[language]
                    : getLoadingText(progress, language)}{' '}
                  ({Math.round(progress)}%)
                </>
              ) : language === 'ko' ? (
                '신년 운세'
              ) : (
                'New Year'
              )}
            </span>
          </button>

          {/* 3. 오늘의 운세 버튼 */}
          <button
            onClick={handleDailyFortune}
            disabled={loading || !user || !isSaved}
            className={`flex-1 h-12 rounded-xl font-bold shadow-lg text-sm transition-all relative overflow-hidden ${loading || !user || !isSaved ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600 hover:scale-[1.02]'}`}
          >
            {loading && loadingType === 'daily' && (
              <div
                className="absolute top-0 left-0 h-full bg-yellow-200/50"
                style={{ width: `${progress}%` }}
              />
            )}
            <span className="relative z-10 flex justify-center items-center gap-2">
              {loading && loadingType === 'daily' ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                  {isCachedLoading
                    ? UI_TEXT.loadingCached[language]
                    : getLoadingText(progress, language)}{' '}
                  ({Math.round(progress)}%)
                </>
              ) : language === 'ko' ? (
                '오늘의 운세'
              ) : (
                'Today'
              )}
            </span>
          </button>
        </div>
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
                      ? '도사와 대화'
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
                      <div className="prose prose-indigo dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap dark:text-gray-200 pb-10">
                        {aiResult}
                      </div>
                    </div>
                    <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center flex-shrink-0">
                      <button
                        onClick={handleShare}
                        className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm text-sm font-bold text-gray-600 dark:text-gray-200 hover:bg-gray-50 flex gap-2"
                      >
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

                {viewMode === 'chat' && (
                  <>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                      {chatList.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[90%] md:max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-tl-none prose prose-indigo dark:prose-invert max-w-none'}`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {qLoading && (
                        <div className="flex justify-start animate-pulse">
                          <div className="bg-gray-100 dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-tl-none">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-slate-900/50 flex flex-col gap-2 flex-shrink-0">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={customQuestion}
                          onChange={(e) => setCustomQuestion(e.target.value)}
                          placeholder={
                            language === 'ko' ? '궁금한 점을 물어보세요...' : 'Ask your question...'
                          }
                          onKeyDown={(e) =>
                            e.key === 'Enter' &&
                            !qLoading &&
                            !isLocked &&
                            handleAdditionalQuestion()
                          }
                          disabled={isLocked || qLoading}
                          className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white disabled:opacity-60"
                        />
                        <button
                          onClick={handleAdditionalQuestion}
                          disabled={isLocked || !customQuestion.trim() || qLoading}
                          className={`absolute right-2 p-1.5 rounded-lg transition-all ${isLocked || !customQuestion.trim() || qLoading ? 'text-gray-400' : 'text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
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
