import { useState, useEffect, useCallback, useRef } from "react";
import { toPng } from "html-to-image";
import { BoltIcon, PlusCircleIcon, AdjustmentsHorizontalIcon, ChevronLeftIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Solar } from "lunar-javascript";
import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";

// Local Imports
import { login, logout, onUserStateChange, db } from "./lib/firebase"; 
import { fetchGeminiAnalysis } from "./api/gemini";
import { 
  SAJU_DATA, UI_TEXT, HANJA_MAP, DEFAULT_INSTRUCTION, GONGMANG_DATA, CHUNEUL,
  SKY_CH_TEXT, GRD_CH_TEXT, BANGHAP_TEXT, HAP3_TEXT, HAP6_TEXT, GRD_BANHAP_TEXT, SKY_HAP_TEXT,
  BANGHAP_EXP, HAP3_EXP, HAP6_EXP, GRD_BANHAP_EXP, SKY_HAP_EXP,ENG_MAP,HANJA_ENG_MAP, DAILY_FORTUNE_PROMPT
} from "./data/constants";
import { classNames, getIcon, getHanja, getEng, getLoadingText, bgToBorder } from "./utils/helpers";

// 💡 추가된 텍스트 상수 (파일을 직접 수정하지 않고 컴포넌트 내부에서 사용)
const LOCAL_UI = {
  cancel: { en: "Cancel Edit Birthday", ko: "생일 수정 취소" },
  complete: { en: "Complete Edit Birthday", ko: "생일 수정 완료" },
edit :{ en: "Edit Birthday", ko: "생일 수정하기" }
};


export default function App() {
  // --- States ---
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.theme || "light");
  const [language, setLanguage] = useState("en");
  
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [gender, setGender] = useState("female");
  const [qLoading, setQLoading] = useState(false);
  // 🔒 저장 및 수정 횟수 관리
  const [isSaved, setIsSaved] = useState(false);
  const [editCount, setEditCount] = useState(0); 
  const MAX_EDIT_COUNT = 20;
 
  const [chatList, setChatList] = useState([]); 
  const [viewMode, setViewMode] = useState("result"); // 'result' or 'chat'
  const chatEndRef = useRef(null);
  
  // 💥 [핵심 변경] 저장되었거나(isSaved) 횟수 제한(MAX)에 걸리면 잠금
  const isLocked = editCount >= MAX_EDIT_COUNT;
  // 입력 필드를 비활성화할 조건: 횟수 초과로 잠겼거나(isLocked) OR 이미 저장된 경우(isSaved)
  const isInputDisabled = isLocked || isSaved; 

  // 💾 [핵심] 캐싱 데이터 (이미 분석한 결과 저장소)
  const [cachedData, setCachedData] = useState(null); 

  const getInitialDate = () => {
    try {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      if (isNaN(now.getTime())) throw new Error("Invalid Time");
      return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    } catch (e) {
      return "2024-01-01T00:00";
    }
  };
  const [inputDate, setInputDate] = useState(getInitialDate);

  const [saju, setSaju] = useState({
    sky0: "", grd0: "", sky1: "", grd1: "", sky2: "", grd2: "", sky3: "", grd3: "",
  });

  const [containerWidth, setContainerWidth] = useState(411);
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCachedLoading, setIsCachedLoading] = useState(false); // 캐시 로딩 상태
  const [progress, setProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userPrompt, setUserPrompt] = useState(DEFAULT_INSTRUCTION);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [showIcons, setShowIcons] = useState(true);
  const [charShow, setCharShow] = useState(true);
  const [bgShow, setBgShow] = useState(true);
  const error = false; 

  // --- Effects ---
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.theme = theme;
  }, [theme]);

  // 로그인 & 데이터 불러오기
// 로그인 & 데이터 불러오기
  useEffect(() => {
    onUserStateChange(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            
            // 1. 기본 정보 불러오기
            if (data.birthDate) { 
                setInputDate(data.birthDate); 
                setIsSaved(true); 
            }
            if (data.gender) setGender(data.gender);
            if (data.isTimeUnknown !== undefined) setIsTimeUnknown(data.isTimeUnknown);
            
            // 2. 수정 횟수 동기화
            const todayStr = new Date().toLocaleDateString('en-CA');
            if (data.lastEditDate !== todayStr) setEditCount(0);
            else setEditCount(data.editCount || 0);

            // 💥 [핵심] 저장된 AI 결과가 있다면, '모든 조건'을 캐시에 완벽하게 복구
            if (data.lastAiResult && data.lastSaju) {
                console.log("📥 DB에서 지난 분석 결과 불러옴");
                setCachedData({
                    saju: data.lastSaju,      
                    result: data.lastAiResult, // 👈 결과값(AI Result) 복구
                    prompt: data.lastPrompt || DEFAULT_INSTRUCTION, // 👈 질문 복구
                    language: data.lastLanguage || "en", // 👈 언어 복구 (없으면 기본값 en)
                    gender: data.lastGender || data.gender // 👈 성별 복구
                });
            }
          } else { 
            setIsSaved(false); 
            setEditCount(0); 
            setCachedData(null);
          }
        } catch (error) { console.error("정보 불러오기 실패:", error); }
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
        sky3: yearP.sky, grd3: yearP.grd,
        sky2: monthP.sky, grd2: monthP.grd,
        sky1: dayP.sky, grd1: dayP.grd,
        sky0: isTimeUnknown ? "" : hourP.sky,
        grd0: isTimeUnknown ? "" : hourP.grd,
      });
    } catch (error) { console.warn("만세력 계산 보류:", error); }
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
          // 캐시 로딩이면 광속으로 진행
          if (isCachedLoading) {
            increment = 25; 
          } else {
            // 실제 로딩이면 천천히
            if (prev < 20) increment = r < 0.7 ? 1 : 2;
            else if (prev < 50) increment = r < 0.5 ? 1 : 0;
            else if (prev < 80) increment = r < 0.2 ? 1 : 0;
            else increment = r < 0.05 ? 1 : 0;
          }
          return prev + increment;
        });
      }, 50); // 체크 주기도 빠르게
    } else { setProgress(100); }
    return () => clearInterval(interval);
  }, [loading, isCachedLoading]);

  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isModalOpen]);

  // 💥 [추가] 채팅 스크롤 자동 이동 (채팅 리스트 변경 시)
  useEffect(() => {
    if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatList, qLoading]);

  // --- Logic (Relation & Colors) ---
  const relationAd = SAJU_DATA.sky;
  const jijiText = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  let sigan, ilgan, wolgan, yeongan, siji, ilji, wolji, yeonji, sijidata, iljidata, woljidata, yeonjidata;
  let sijiji=[], iljiji=[], woljiji=[], yeonjiji=[], insu=[], sik=[], jae=[], guan=[];
  let gongmang=[], gongmangbool=[false,false,false], chuneulbool=[false,false,false];
  let sky12ch=false, sky12hap=[false,{}], sky23ch=false, sky23hap=[false,{}];
  let grd12ch=false, grd12banhap=[false,{}], grd126=[false,{}];
  let grd23ch=false, grd23banhap=[false,{}], grd236=[false,{}];
  let banghap=[false,{}], hap3=[false,{}];

  if (relationAd) {
    sigan = relationAd.find(i => i.sub.sky[0] === saju.sky0) || relationAd.find(i => i.id === 0);
    ilgan = relationAd.find(i => i.sub.sky[0] === saju.sky1) || relationAd.find(i => i.id === 0);
    wolgan = relationAd.find(i => i.sub.sky[0] === saju.sky2) || relationAd.find(i => i.id === 0);
    yeongan = relationAd.find(i => i.sub.sky[0] === saju.sky3) || relationAd.find(i => i.id === 0);
    
    const findGrdData = (char) => {
        if (!char || !jijiText.includes(char)) { const empty = relationAd.find(i => i.id === 0); return { data: empty, sub: empty.sub.grd[1], hidden: [] }; }
        const found = relationAd.find(i => i.sub.grd[0][0] === char) || relationAd.find(i => i.sub.grd[1][0] === char);
        if(!found) { const empty = relationAd.find(i => i.id === 0); return { data: empty, sub: empty.sub.grd[1], hidden: [] }; }
        const sub = found.sub.grd[0][0] === char ? found.sub.grd[0] : found.sub.grd[1];
        const hidden = sub[3].map(id => relationAd.find(item => item.id === id)).filter(Boolean);
        return { data: found, sub, hidden };
    };
    const s=findGrdData(saju.grd0); sijidata=s.data; siji=s.sub; sijiji=s.hidden;
    const i=findGrdData(saju.grd1); iljidata=i.data; ilji=i.sub; iljiji=i.hidden;
    const w=findGrdData(saju.grd2); woljidata=w.data; wolji=w.sub; woljiji=w.hidden;
    const y=findGrdData(saju.grd3); yeonjidata=y.data; yeonji=y.sub; yeonjiji=y.hidden;

    if (saju.sky1 && ilgan.id !== 0) {
      ilgan?.relation["인수"].forEach(id => insu.push(relationAd.find(item => item.id === id)));
      ilgan?.relation["식상"].forEach(id => sik.push(relationAd.find(item => item.id === id)));
      ilgan?.relation["관성"].forEach(id => guan.push(relationAd.find(item => item.id === id)));
      ilgan?.relation["재성"].forEach(id => jae.push(relationAd.find(item => item.id === id)));
    } else { const empty = relationAd.find(i => i.id === 0); insu=[empty]; sik=[empty]; guan=[empty]; jae=[empty]; }

    if (saju.sky1 && saju.grd1) {
      const ilju = saju.sky1 + saju.grd1;
      for (let idx = 0; idx < GONGMANG_DATA.length; idx++) {
        if (GONGMANG_DATA[idx].includes(ilju)) { const gmMap = [["술", "해"], ["신", "유"], ["오", "미"], ["진", "사"], ["인", "묘"], ["자", "축"]]; gongmang = gmMap[idx] || []; break; }
      }
      gongmangbool = [gongmang.includes(saju.grd1), gongmang.includes(saju.grd2), gongmang.includes(saju.grd3)];
    }
    if (saju.sky1 && CHUNEUL[saju.sky1]) { chuneulbool = [CHUNEUL[saju.sky1].includes(saju.grd1), CHUNEUL[saju.sky1].includes(saju.grd2), CHUNEUL[saju.sky1].includes(saju.grd3)]; }
    
    const checkHapChung = (t1, t2, type) => {
        const txt = t1 + t2; const rev = t2 + t1;
        if (type === 'sky') {
            if (SKY_HAP_TEXT.includes(txt)) return { hap: [true, SKY_HAP_EXP[txt]], ch: false };
            if (SKY_HAP_TEXT.includes(rev)) return { hap: [true, SKY_HAP_EXP[rev]], ch: false };
            if (SKY_CH_TEXT.includes(txt) || SKY_CH_TEXT.includes(rev)) return { hap: [false, {}], ch: true };
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
    if (saju.sky1 && saju.sky2) { const r = checkHapChung(saju.sky1, saju.sky2, 'sky'); sky12hap=r.hap; sky12ch=r.ch; }
    if (saju.sky2 && saju.sky3) { const r = checkHapChung(saju.sky2, saju.sky3, 'sky'); sky23hap=r.hap; sky23ch=r.ch; }
    if (saju.grd1 && saju.grd2) { const r = checkHapChung(saju.grd1, saju.grd2, 'grd'); grd12ch=r.ch; grd12banhap=r.banhap; grd126=r.hap6; }
    if (saju.grd2 && saju.grd3) { const r = checkHapChung(saju.grd2, saju.grd3, 'grd'); grd23ch=r.ch; grd23banhap=r.banhap; grd236=r.hap6; }
    if (saju.grd1 && saju.grd2 && saju.grd3) {
        const txt = saju.grd1 + saju.grd2 + saju.grd3; const rev = saju.grd3 + saju.grd2 + saju.grd1;
        if (BANGHAP_TEXT.includes(txt)) banghap = [true, BANGHAP_EXP[txt]]; else if (BANGHAP_TEXT.includes(rev)) banghap = [true, BANGHAP_EXP[rev]];
        if (HAP3_TEXT.includes(txt)) hap3 = [true, HAP3_EXP[txt]]; else if (HAP3_TEXT.includes(rev)) hap3 = [true, HAP3_EXP[rev]];
    }
  }

  // --- Handlers ---
  const handleChange = (e) => { 
      if(isInputDisabled && isSaved) return; // 저장된 상태면 입력 불가, 수정모드(isSaved=false)면 가능
      const { name, value } = e.target; 
      setSaju((prev) => ({ ...prev, [name]: value })); 
  };
  const focusInput = (e) => { if(!isSaved) e.target.value = ""; };
  
  // 수정 모드 진입
  const handleEditMode = () => {
    if (isLocked) { alert(UI_TEXT.limitReached[language]); return; }
    setIsSaved(false); // 저장 해제 -> 입력창 활성화
  };

// 💥 [수정] 취소 버튼 핸들러: DB에서 기존 값을 다시 불러와서 입력창을 초기화
  const handleCancelEdit = async () => {
    setIsSaved(true); // 1. 일단 잠금

    if (user) {
      try {
        // 2. DB에서 저장된 최신 데이터 다시 가져오기
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          // 3. 기존 값으로 상태 원상복구 (Revert)
          if (data.birthDate) setInputDate(data.birthDate);
          if (data.gender) setGender(data.gender);
          if (data.isTimeUnknown !== undefined) setIsTimeUnknown(data.isTimeUnknown);
        }
      } catch (error) {
        console.error("원상복구 실패:", error);
      }
    }
  };
const handleSaveMyInfo = async () => {
    if (!user) { alert(UI_TEXT.loginReq[language]); login(); return; }
    if (editCount >= MAX_EDIT_COUNT) { alert(UI_TEXT.limitReached[language]); return; }

    if (window.confirm(UI_TEXT.saveConfirm[language])) {
        try {
            const todayStr = new Date().toLocaleDateString('en-CA');
            const newCount = editCount + 1;

            await setDoc(doc(db, "users", user.uid), { 
                birthDate: inputDate, 
                gender, 
                isTimeUnknown, 
                updatedAt: new Date(),
                lastEditDate: todayStr, 
                editCount: newCount,
                email: user.email // 💥 [추가] 이메일 주소도 함께 저장
            }, { merge: true });
            
            setEditCount(newCount);
            setIsSaved(true); // 저장됨 -> 입력창 비활성화
            alert(UI_TEXT.saveSuccess[language]);
        } catch (error) { alert(UI_TEXT.saveFail[language]); }
    }
  };
// 💥 [수정] 성별, 언어까지 꼼꼼하게 비교
  const isCached = (() => {
    if (!cachedData || !cachedData.saju) return false;
    
    // 1. 프롬프트, 언어, 성별 비교
    const savedPrompt = cachedData.prompt || DEFAULT_INSTRUCTION;
    if (savedPrompt !== userPrompt) return false;
    if (cachedData.language !== language) return false; // 언어 다르면 재분석
    if (cachedData.gender !== gender) return false;     // 성별 다르면 재분석

    // 2. 사주 팔자 글자 비교
    const keys = ["sky0", "grd0", "sky1", "grd1", "sky2", "grd2", "sky3", "grd3"];
    for (const key of keys) {
       if (cachedData.saju[key] !== saju[key]) return false;
    }
    
    return true; 
  })();
// ... (handleAiAnalysis 함수 이전에 추가)

// [추가] 현재 날짜의 사주를 계산하는 함수
// ... (App 컴포넌트 내부의 핸들러 정의 영역에 위치)

// [수정] 현재 날짜의 사주를 정확히 계산하는 함수
const getPillarsForNow = () => {
    // 1. 로컬 시간 기준의 Date 객체 생성
    const now = new Date();
    
    // 2. Solar.fromYmdHms가 요구하는 형식(년, 월, 일, 시, 분) 추출
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();

    try {
        // Solar.fromYmdHms는 로컬 시간을 기반으로 만세력을 계산합니다.
        // 예를 들어, 한국(KST)에서 실행되면 KST 기준의 사주가 계산됩니다.
        const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
        const lunar = solar.getLunar();
        const baZi = lunar.getBaZi(); // [년주, 월주, 일주, 시주]

        const parsePillar = (ganjiHanja) => {
            const skyHanja = ganjiHanja[0];
            const grdHanja = ganjiHanja[1];
            // HANJA_MAP은 이미 정의되어 있다고 가정합니다.
            return {
                sky: HANJA_MAP[skyHanja] || skyHanja,
                grd: HANJA_MAP[grdHanja] || grdHanja,
            };
        };

        const yearP = parsePillar(baZi[0]);
        const monthP = parsePillar(baZi[1]);
        const dayP = parsePillar(baZi[2]);
        const hourP = parsePillar(baZi[3]);

        // 현재 날짜의 사주 8글자를 반환
        return {
            sky3: yearP.sky, grd3: yearP.grd, // 년
            sky2: monthP.sky, grd2: monthP.grd, // 월
            sky1: dayP.sky, grd1: dayP.grd, // 일
            sky0: hourP.sky, grd0: hourP.grd, // 시
            date: now.toLocaleDateString('en-CA') // YYYY-MM-DD 형식으로 오늘 날짜
        };
    } catch (error) {
        console.error("오늘 날짜 사주 계산 실패:", error);
        return null;
    }
};

// ...
  // 💥 [핵심] 캐싱 적용된 AI 분석 함수

  const handleAiAnalysis = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (!isSaved) return alert(UI_TEXT.saveFirst[language]);
    
    // 1. 현재 화면의 사주 글자(Key)들을 배열로 준비
    const keys = ["sky0", "grd0", "sky1", "grd1", "sky2", "grd2", "sky3", "grd3"];
    
    // 2. 캐시 일치 여부 검사 (버튼의 isCached 로직과 100% 동일하게 맞춤)
    let isMatch = false;
    if (cachedData && cachedData.saju) {
        const savedPrompt = cachedData.prompt || DEFAULT_INSTRUCTION;
        // 질문, 언어, 성별, 그리고 사주 8글자가 모두 같은지 확인
        if (savedPrompt === userPrompt && 
            cachedData.language === language && 
            cachedData.gender === gender) {
            
            // 사주 글자 비교 (순서 상관없이 값만 비교)
            const isSajuMatch = keys.every(key => cachedData.saju[key] === saju[key]);
            if (isSajuMatch) isMatch = true;
        }
    }

    // ✅ 일치하면 로딩 없이 바로 결과 보여줌
    if (isMatch) {
        console.log("✅ 저장된 결과 즉시 로드 (API 호출 X)");
        setAiResult(cachedData.result);
        setIsSuccess(true);
        setIsModalOpen(true);
        // [추가] 캐시 로드 후에도 모드를 'result'로 유지 (기본 동작)
        setViewMode('result');
        return; 
    }

    // ---------------------------------------------
    // 3. 불일치 시 API 호출 (기존 로직)
    setLoading(true); setAiResult(""); setIsSuccess(false); setIsCachedLoading(false);
    setViewMode('result'); // 새로운 분석은 항상 결과 모드부터 시작

    try {
      console.log("🚀 새로운 분석 요청! API 호출 시작");
      const currentSajuKey = JSON.stringify(saju); // 저장용 문자열
      const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${inputDate}, 팔자:${currentSajuKey}`;
      const langPrompt = language === "ko" ? "답변은 한국어로. " : "Answer in English.";
      const hantoeng = `[Terminology Reference]
When translating Saju terms (Heavenly Stems & Earthly Branches) into English when using Hanja, strictly refer to the following mappings:
REFER
    ${HANJA_ENG_MAP}
`;
      const fullPrompt = `${userPrompt}\n${sajuInfo}\n${hantoeng}\n${langPrompt}`;
      
      const result = await fetchGeminiAnalysis(fullPrompt);
      
      await setDoc(doc(db, "users", user.uid), {
         lastAiResult: result,
         lastSaju: saju,
         lastPrompt: userPrompt,
         lastLanguage: language, 
         lastGender: gender      
      }, { merge: true });

      setCachedData({ 
          saju: saju, 
          result: result, 
          prompt: userPrompt,
          language: language, 
          gender: gender 
      }); 
      
      setAiResult(result); 
      setIsSuccess(true); 
      setIsModalOpen(true);

    } catch (e) { 
        alert(`Error: ${e.message}`); 
    } finally { 
        setLoading(false); 
    }
  };

// =================================================================
// 💥 [새로운 채팅 로직] 5개 기록 제한 및 불러오기 핸들러
// =================================================================

// [새로 추가] Saju Key 생성 함수 (sky0, grd0, ... , sky3, grd3를 하이픈으로 연결)
const createSajuKey = (saju) => {
    if (!saju || !saju.grd1) return null;
    return [
        saju.sky0, saju.grd0, 
        saju.sky1, saju.grd1, 
        saju.sky2, saju.grd2, 
        saju.sky3, saju.grd3
    ].join('-');
};

// [새로 추가] 채팅 기록 저장 및 5개 제한 로직
const saveAndCapChatRecord = async (userId, sajuKey, question, answer) => {
    const userDocRef = doc(db, "users", userId);
    const userSnap = await getDoc(userDocRef);
    let data = userSnap.exists() ? userSnap.data() : {};
    
    // 사주 키별 기록을 관리하는 구조 (chat_records 안에 사주키별 배열)
    let sajuRecords = data.chat_records || {};
    let currentSajuHistory = sajuRecords[sajuKey] || [];
    
    // 1. 새 기록 추가
    const newRecord = {
        question,
        answer,
        timestamp: new Date().toISOString(),
        id: Date.now(), // 단순 Unique ID
    };

    currentSajuHistory.push(newRecord);

    // 2. 시간 순으로 정렬 (가장 오래된 기록을 찾기 위함)
    currentSajuHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // 3. 5개 초과 시 가장 오래된 것 삭제 (Capping)
    if (currentSajuHistory.length > 5) {
        // 가장 오래된 (timestamp가 낮은) 기록을 삭제하고 최근 5개만 남김
        currentSajuHistory = currentSajuHistory.slice(currentSajuHistory.length - 5);
        console.log(`[DB Capped] Saju ${sajuKey}: Oldest record removed. New length: 5`);
    }

    // 4. DB에 업데이트된 기록 저장
    sajuRecords[sajuKey] = currentSajuHistory;

    await setDoc(userDocRef, {
        chat_records: sajuRecords,
        updatedAt: new Date(),
    }, { merge: true });
};

// [새로 정의] setViewMode 함수 (채팅 기록 불러오기 로직 포함)
const handleSetViewMode = async (mode) => {
    setViewMode(mode);

    if (mode === 'chat' && user) {
        setQLoading(true); // 로딩 시작
        const currentSajuKey = createSajuKey(saju);
        
        if (currentSajuKey) {
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userDocRef);
                const data = userSnap.exists() ? userSnap.data() : {};
                
                // 해당 사주 키의 기록만 가져옴
                const sajuRecords = data.chat_records || {};
                let currentSajuHistory = sajuRecords[currentSajuKey] || [];
                
                // 시간 순으로 정렬
                currentSajuHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                // 채팅 리스트 형식으로 변환 (user/ai 역할 구분)
                const newChatList = currentSajuHistory.map(item => [
                    { role: 'user', text: item.question },
                    { role: 'ai', text: item.answer }
                ]).flat(); // [user, ai, user, ai...] 형태로 평탄화

                setChatList(newChatList);

            } catch (error) {
                console.error("채팅 이력 불러오기 오류:", error);
                setChatList([]); // 오류 시 빈 목록
            }
        } else {
             setChatList([]); // 사주 키가 없으면 빈 목록
        }
        setQLoading(false); // 로딩 종료
    }
};
// ... (handleAdditionalQuestion 함수 이전에 추가)

// [새로 추가] 오늘의 운세 분석 요청 핸들러
const handleDailyFortuneQuestion = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (editCount >= MAX_EDIT_COUNT) return alert(UI_TEXT.limitReached[language]);
    
    // 1. 현재 사주 정보가 저장되어 있어야 함
    if (!isSaved) return alert(UI_TEXT.saveFirst[language]);

    // 2. 오늘의 운세 프롬프트 설정 및 채팅창에 표시
    const fortunePromptText = language === "ko" ? "오늘의 운세를 알려주세요." : "Tell me today's fortune.";
    
    // 3. 현재 사주 키와 질문 설정 (handleAdditionalQuestion과 동일)
    const myQuestion = fortunePromptText;
    setChatList(prev => [...prev, { role: "user", text: myQuestion }]);
    setQLoading(true);
    
    const currentSajuKey = createSajuKey(saju); // 기존 저장된 사주
    const currentSajuJson = JSON.stringify(saju);
    
    // 4. 오늘의 날짜 사주 정보 계산
    const todayPillars = getPillarsForNow();
    if (!todayPillars) {
        setQLoading(false);
        return setChatList(prev => [...prev, { role: "ai", text: "Error: 현재 날짜 정보를 불러올 수 없습니다." }]);
    }

    // 5. API 호출용 최종 프롬프트 구성
    const todayPillarsJson = JSON.stringify(todayPillars);
    
    const sajuInfo = `[사용자 사주] 성별:${gender}, 팔자:${currentSajuJson} / [오늘 날짜 사주] 날짜:${todayPillars.date}, 팔자:${todayPillarsJson}`;
    const langPrompt = language === "ko" ? "답변은 한국어로. 500자 이내로 " : "Answer in English. Max 500 chars.";
    const hantoeng = `[Terminology Reference]
When translating Saju terms (Heavenly Stems & Earthly Branches) into English when using Hanja, strictly refer to the following mappings:
REFER
    ${HANJA_ENG_MAP}
`;
    
    const fullPrompt = `${DAILY_FORTUNE_PROMPT[language]}\n${sajuInfo}\n${langPrompt}\n${hantoeng}`;
    
    try {
        const result = await fetchGeminiAnalysis(fullPrompt);
        const newCount = editCount + 1;

        // DB 저장 및 Capping (handleAdditionalQuestion과 동일 로직)
        await setDoc(doc(db, "users", user.uid), {
            editCount: newCount,
            lastEditDate: new Date().toLocaleDateString('en-CA'),
            question_history: arrayUnion({ question: myQuestion, sajuKey: currentSajuKey, timestamp: new Date().toISOString(), id: Date.now() })
        }, { merge: true });

        if (currentSajuKey) {
            await saveAndCapChatRecord(user.uid, currentSajuKey, myQuestion, result);
        }

        setEditCount(newCount);
        setChatList(prev => [...prev, { role: "ai", text: result }]);

    } catch (e) {
        setChatList(prev => [...prev, { role: "ai", text: "Error: 운세 분석에 실패했습니다." }]);
    } finally {
        setQLoading(false);
    }
};

// 💥 [수정] handleAdditionalQuestion 함수 (DB 로직 변경 및 사주 키 추가)
  const handleAdditionalQuestion = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (editCount >= MAX_EDIT_COUNT) return alert(UI_TEXT.limitReached[language]);
    if (!customQuestion.trim()) return alert("질문을 입력해주세요.");

    // 1. 내 질문을 먼저 채팅창에 추가
    const myQuestion = customQuestion; 
    setChatList(prev => [...prev, { role: "user", text: myQuestion }]);
    setCustomQuestion(""); // 입력창 비우기
    setQLoading(true); 
    
    // [추가] 사주 키 생성
    const currentSajuKey = createSajuKey(saju);

    try {
      const currentSajuJson = JSON.stringify(saju);
      const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${inputDate}, 팔자:${currentSajuJson}`;
      const langPrompt = language === "ko" ? "답변은 한국어로. 100단어 이내로 " : "Answer in English.IN 100 WORDS.";
      // 이전 대화 맥락 없이 단발성 질문으로 처리 (S토큰 절약 및 속도)
      const hantoeng = `[Terminology Reference]
When translating Saju terms (Heavenly Stems & Earthly Branches) into English when using Hanja, strictly refer to the following mappings:
REFER
    ${HANJA_ENG_MAP}
`;
      const fullPrompt = `${myQuestion}\n${sajuInfo}\n${langPrompt}\n${hantoeng}`;

      const result = await fetchGeminiAnalysis(fullPrompt);
      
      const newCount = editCount + 1;

      // 2. DB 업데이트 (수정 횟수 및 ✨전체 질문 로그✨ 저장)
      const newQuestionLog = {
          question: myQuestion,
          sajuKey: currentSajuKey, // 어떤 사주에 대한 질문인지 기록
          timestamp: new Date().toISOString(),
          id: Date.now(),
      };
      
      await setDoc(doc(db, "users", user.uid), {
         editCount: newCount,       
         lastEditDate: new Date().toLocaleDateString('en-CA'),
          // 📊 [새로 추가] 데이터 분석을 위한 모든 질문 기록
          question_history: arrayUnion(newQuestionLog) 
      }, { merge: true });

      // 3. ✨ [핵심 추가] 질문/답변 저장 및 5개 제한 로직 실행 (채팅 시각화용)
      if (currentSajuKey) {
          await saveAndCapChatRecord(user.uid, currentSajuKey, myQuestion, result);
      }

      // 4. 상태 업데이트 & AI 답변을 채팅창에 추가
      setEditCount(newCount);
      setChatList(prev => [...prev, { role: "ai", text: result }]);
      
    } catch (e) { 
        setChatList(prev => [...prev, { role: "ai", text: "Error: 분석에 실패했습니다." }]);
    } finally { 
        setQLoading(false); 
    }
  };
// =================================================================
// 핸들러 종료
// =================================================================


  // ... (나머지 핸들러 함수들) ...
  const handleCopyResult = async () => { if (aiResult) { await navigator.clipboard.writeText(aiResult); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }};
  const handleShare = async () => { const shareData = { title: "Sajucha", text: "AI 사주 분석", url: window.location.href }; if (navigator.share) await navigator.share(shareData); else { await navigator.clipboard.writeText(shareData.url); alert("주소 복사됨!"); }};

  const saveAsImageSaju = useCallback(async () => { const el = document.getElementById("saju-capture"); if (el) { const dataUrl = await toPng(el, { cacheBust: true, pixelRatio: 2, style: { margin: "0" }, backgroundColor: localStorage.theme === "dark" ? "#1e293b" : "#ffffff" }); const link = document.createElement("a"); link.download = "saju.png"; link.href = dataUrl; link.click(); } }, []);
  const saveAsImageIlju = useCallback(async () => { const el = document.getElementById("day-pillar-capture"); if (el) { const dataUrl = await toPng(el, { cacheBust: true, pixelRatio: 2, style: { margin: "0" }, backgroundColor: localStorage.theme === "dark" ? "#1e293b" : "#ffffff" }); const link = document.createElement("a"); link.download = "ilju.png"; link.href = dataUrl; link.click(); } }, []);

  const jiStyle = " w-1/2 text-center text-xs";
  const ganStyle = "text-center text-sm font-bold";
  const relationStyle = "px-0.5 text-xs font-semibold text-gray-700 rounded-md";
  const blankBoxGrdStyle = "bg-gray-200 dark:bg-gray-400 h-[5rem]";
  const blankBoxSkyStyle = "bg-gray-200 dark:bg-gray-400 h-[4.3rem]";
  const banhapTextStyle = "absolute bg-red-200 rounded-full opacity-70 -top-4 font-bold left-1 text-red-600 text-center h-6 w-6 text-lg";
  const pillarLabelStyle = "text-sm font-extrabold text-slate-500 uppercase tracking-widest text-center dark:text-slate-400";
  const iconsViewStyle = "bg-white bg-opacity-10 border-4";
  const pillarStyle = "flex flex-col gap-[2px] rounded-lg p-1";
  const upperButtonStyle = " px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors shadow-sm my-auto";
  const t = (char) => language === "en" ? getEng(char) : char;

  return (
    <div className="relative px-3 py-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* 1. 상단 패널 */}
      <div className="w-full max-w-lg mb-8 p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl mx-auto">
        <div className="flex flex-col gap-5">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{UI_TEXT.title[language]}</h3>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700">{theme === "dark" ? "🌙" : "☀️"}</button>
          </div>
          {/* 언어 */}
          <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
            <button onClick={() => setLanguage("en")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === "en" ? "bg-white dark:bg-slate-600 text-indigo-600 shadow-sm" : "text-gray-400"}`}>English</button>
            <button onClick={() => setLanguage("ko")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === "ko" ? "bg-white dark:bg-slate-600 text-indigo-600 shadow-sm" : "text-gray-400"}`}>한국어</button>
          </div>
          {/* 로그인 & 저장/수정 버튼 */}
          <div className="flex items-center justify-between bg-indigo-50 dark:bg-slate-700/50 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/30">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                   <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-indigo-200" />
                   <div className="flex flex-col"><span className="text-xs font-bold text-gray-700 dark:text-gray-200">{user.displayName}{language=="ko" &&<>님</>}</span><span className="text-[10px] text-gray-400">{UI_TEXT.welcome[language]}</span></div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <button onClick={logout} className="text-xs px-3 py-1.5 bg-gray-200 rounded-lg font-bold">{UI_TEXT.logout[language]}</button>
                    {/* 💥 버튼 로직 변경: 잠김 -> 수정 -> 취소 */}
                    {isLocked ? (
                        <span className="text-[10px] text-red-500 font-bold">{UI_TEXT.lockedMsg[language]}</span>
                    ) : isSaved ? (
                        // 저장됨(isSaved=true) -> 수정 버튼 보이기
                        <button onClick={handleEditMode} className="text-[10px] text-gray-500 underline font-semibold hover:text-indigo-600">
                          {LOCAL_UI.edit[language]}
                      <span className="ml-1 font-extrabold text-indigo-600 dark:text-indigo-400">
                      {MAX_EDIT_COUNT - editCount}
                      </span>
                        <span className="text-gray-400">/{MAX_EDIT_COUNT}</span>
                      </button>
                       
                    ) : (
                        // 저장 안됨(수정모드 isSaved=false) -> 취소 버튼 보이기
                        <button onClick={handleCancelEdit} className="text-[10px] text-red-500 underline font-extrabold hover:text-red-700">
                             {LOCAL_UI.cancel[language]}
                        </button>
                    )}
                </div>
              </div>
            ) : (
              <div className="w-full"><button onClick={login} className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-gray-50 text-gray-700 border rounded-lg font-bold shadow-sm"><svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> {UI_TEXT.googleLogin[language]}</button><p className="text-[10px] text-center text-gray-400 mt-1">{UI_TEXT.loginMsg[language]}</p></div>
            )}
          </div>
          
          {/* 💥 성별 & 날짜 입력 패널 (저장되지 않았을 때만 표시) */}
          <div className={`transition-all duration-300 overflow-hidden ${isSaved ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"}`}>
             <div className={`${!user ? "opacity-50 pointer-events-none grayscale" : ""}`}>
              <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">{UI_TEXT.genderLabel[language]}</label>
                  <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
                      <button 
                        onClick={() => setGender("male")} 
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender==="male" ? "bg-white text-blue-600 shadow-sm dark:bg-slate-600" : "text-gray-400"}`}
                      >
                        {UI_TEXT.male[language]}
                      </button>
                      <button 
                        onClick={() => setGender("female")} 
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender==="female" ? "bg-white text-pink-500 shadow-sm dark:bg-slate-600" : "text-gray-400"}`}
                      >
                        {UI_TEXT.female[language]}
                      </button>
                  </div>
              </div>
              <div>
                  <div className="flex justify-between items-end mb-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400">{UI_TEXT.birthLabel[language]}</label>
                      <label className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                          <input 
                            type="checkbox" 
                            checked={isTimeUnknown} 
                            onChange={(e)=> setIsTimeUnknown(e.target.checked)} 
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 dark:bg-slate-700" 
                          />
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{UI_TEXT.unknownTime[language]}</span>
                      </label>
                  </div>
                  <div className="relative">
                      <input 
                        type={isTimeUnknown ? "date" : "datetime-local"} 
                        value={isTimeUnknown ? inputDate.split("T")[0] : inputDate} 
                        onChange={(e) => { let val = e.target.value; if(isTimeUnknown) val += "T00:00"; setInputDate(val); }} 
                        className={`w-full p-3 bg-gray-50 dark:bg-slate-900/50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white dark:[color-scheme:dark]`} 
                      />
                  </div>
              </div>

              {/* 💥 [추가] 수정 완료 버튼 (입력창 하단) */}
              <button 
                onClick={handleSaveMyInfo} 
                className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                 {LOCAL_UI.complete[language]}
                  {/* ✨ 디자인 개선: 남은 횟수 강조 */}
                  <span className="ml-2 text-sm font-extrabold text-white bg-indigo-500 px-2 py-0.5 rounded-lg shadow-sm">
                      {MAX_EDIT_COUNT - editCount}
                  </span>
                  <span className="text-indigo-200 text-xs">/{MAX_EDIT_COUNT}</span>
              </button>
             </div>
          </div>

{/* 텍스트 결과 (만세력 값 + 생년월일시 표시 추가) */}
          {user && (
            <div className="p-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 text-center flex flex-col gap-1">
              {/* 1. 생년월일시 표시 (추가됨) */}
              <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                {inputDate.replace("T", " ")}
                {isTimeUnknown && <span className="ml-1 text-xs font-normal text-gray-400">({UI_TEXT.unknownTime[language]})</span>}
              </div>

              {/* 2. 만세력 글자 (Flex Wrap 적용: 길어지면 줄바꿈) */}
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-lg font-extrabold text-indigo-900 dark:text-indigo-200 tracking-wider">
                <span className="whitespace-nowrap">
                  {t(saju.sky3)}{t(saju.grd3)}
                  <span className="text-xs font-normal text-indigo-400 ml-1">{UI_TEXT.year[language]}</span>
                </span>
                <span className="whitespace-nowrap">
                  {t(saju.sky2)}{t(saju.grd2)}
                  <span className="text-xs font-normal text-indigo-400 ml-1">{UI_TEXT.month[language]}</span>
                </span>
                <span className="whitespace-nowrap">
                  {t(saju.sky1)}{t(saju.grd1)}
                  <span className="text-xs font-normal text-indigo-400 ml-1">{UI_TEXT.day[language]}</span>
                </span>
                {!isTimeUnknown && (
                  <span className="whitespace-nowrap">
                    {t(saju.sky0)}{t(saju.grd0)}
                    <span className="text-xs font-normal text-indigo-400 ml-1">{UI_TEXT.hour[language]}</span>
                  </span>
                )}
              </div>
            </div>
          )}        </div>
      </div>

      {/* 2. 만세력 시각화 (복구: 시주 및 지장간 완벽 표시) */}
      {!!showIcons && user && (
        <div id="saju-capture" style={{ width: `${containerWidth}px`, maxWidth: '100%' }} className="mt-2 relative rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden m-auto transition-[width] duration-100 ease-linear py-2 bg-white dark:bg-slate-800 animate-[fadeIn_0.5s_ease-out]">
 {/* 1. 배경 레이어 (Background Layer) */}
          {bgShow && (
            <div className="absolute inset-0 z-0 flex flex-col pointer-events-none transition-all duration-500">
              {/* 1. 하늘 (Sky) 영역 */}
              <div
                className={`h-1/2 w-full relative bg-gradient-to-b overflow-hidden transition-colors duration-700 ease-in-out
                ${
                  theme === "dark"
                    ? "from-indigo-950/80 via-slate-900/70 to-blue-900/60" // 🌙 밤 배경
                    : "from-sky-400/40 via-sky-200/40 to-white/5" // ☀️ 낮 배경
                }`}
              >
                {theme === "dark" ? (
                  // ================= [ 🌙 밤 디자인 ] =================
                  <>
                    <div className="absolute top-4 right-[3%] w-20 h-20 bg-blue-100 rounded-full blur-3xl opacity-20" />
                    <svg
                      className="absolute top-6 right-[3%] w-12 h-12 text-blue-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] rotate-[-15deg]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>

                    {/* 별 (Stars) */}
                    <div className="opacity-90">
                      <svg
                        className="absolute top-10 left-10 w-4 h-4 text-white animate-pulse"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M12,2L14.5,9.5L22,12L14.5,14.5L12,22L9.5,14.5L2,12L9.5,9.5L12,2Z"
                        />
                      </svg>
                      <svg
                        className="absolute top-6 right-1/3 w-2 h-2 text-blue-200 animate-pulse delay-75"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M12,2L14.5,9.5L22,12L14.5,14.5L12,22L9.5,14.5L2,12L9.5,9.5L12,2Z"
                        />
                      </svg>
                      <svg
                        className="absolute top-20 right-10 w-3 h-3 text-white animate-pulse delay-150"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M12,2L14.5,9.5L22,12L14.5,14.5L12,22L9.5,14.5L2,12L9.5,9.5L12,2Z"
                        />
                      </svg>
                      <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse delay-300"></div>
                      <div className="absolute top-8 left-1/2 w-1 h-1 bg-white rounded-full opacity-80 animate-pulse delay-500"></div>
                    </div>
                  </>
                ) : (
                  // ================= [ ☀️ 낮 디자인 ] =================
                  <>
                    {/* 태양 (Sun) */}
                    <div className="absolute top-2 right-[20%] w-24 h-24 bg-yellow-200 rounded-full blur-2xl opacity-60" />
                    <svg
                      className="absolute top-2 right-[12%] w-14 h-14 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)] animate-[spin_12s_linear_infinite]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <path
                        d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* 구름들 (Clouds) */}
                    <svg
                      className="absolute top-3 left-4 w-20 h-20 text-white opacity-100 drop-shadow-md"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.5,19c4.1,0,7.5-3.4,7.5-7.5c0-4.1-3.4-7.5-7.5-7.5c-0.4,0-0.7,0-1.1,0.1c-1-3-3.9-5.1-7.2-5.1C5.6,0,2.6,3.1,2,7.4C0.8,8,0,9.2,0,10.5C0,12.4,1.6,14,3.5,14h0.9c0.7,2.9,3.3,5,6.4,5h6.7" />
                    </svg>
                    <svg
                      className="absolute top-6 right-8 w-16 h-16 text-white opacity-95 drop-shadow-md"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.5,19c4.1,0,7.5-3.4,7.5-7.5c0-4.1-3.4-7.5-7.5-7.5c-0.4,0-0.7,0-1.1,0.1c-1-3-3.9-5.1-7.2-5.1C5.6,0,2.6,3.1,2,7.4C0.8,8,0,9.2,0,10.5C0,12.4,1.6,14,3.5,14h0.9c0.7,2.9,3.3,5,6.4,5h6.7" />
                    </svg>
                    <svg
                      className="absolute top-2 left-1/2 w-10 h-10 text-white opacity-90 drop-shadow-sm transform -translate-x-1/2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.5,19c4.1,0,7.5-3.4,7.5-7.5c0-4.1-3.4-7.5-7.5-7.5c-0.4,0-0.7,0-1.1,0.1c-1-3-3.9-5.1-7.2-5.1C5.6,0,2.6,3.1,2,7.4C0.8,8,0,9.2,0,10.5C0,12.4,1.6,14,3.5,14h0.9c0.7,2.9,3.3,5,6.4,5h6.7" />
                    </svg>
                    <svg
                      className="absolute -top-2 -right-7 w-24 h-24 text-white opacity-80 drop-shadow-sm"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.5,19c4.1,0,7.5-3.4,7.5-7.5c0-4.1-3.4-7.5-7.5-7.5c-0.4,0-0.7,0-1.1,0.1c-1-3-3.9-5.1-7.2-5.1C5.6,0,2.6,3.1,2,7.4C0.8,8,0,9.2,0,10.5C0,12.4,1.6,14,3.5,14h0.9c0.7,2.9,3.3,5,6.4,5h6.7" />
                    </svg>
                  </>
                )}
              </div>

              {/* 2. 땅 (Earth) 영역 */}
              <div
                className={`h-1/2 w-full relative bg-gradient-to-b transition-colors duration-700 ease-in-out border-t
                ${
                theme === "dark"
                    ? "from-slate-800/50 to-gray-900/70 border-slate-700/30" // 🌙 밤 땅
                    : "from-stone-300/40 to-amber-100/60 border-stone-400/20" // ☀️ 낮 땅
                }`}
              >
                {/* 지평선 그림자 */}
                <div
                  className={`absolute top-0 left-0 w-full h-8 bg-gradient-to-b transition-colors duration-700
                  ${
                    theme === "dark"
                      ? "from-slate-900/20 to-transparent"
                      : "from-stone-500/5 to-transparent"
                  }`}
                />
                {/* 바닥 질감 패턴 */}
                <div className="w-full h-full opacity-10 bg-[radial-gradient(#a8a29e_1px,transparent_1px)] [background-size:16px_16px]"></div>
              </div>
            </div>
          )}

           <div className="relative z-10 flex justify-center bg-white/10 backdrop-blur-sm">
  {charShow && (
              <div className="flex flex-col items-end  pt-[10px] animate-[fadeIn_0.5s_ease-out]">
                {/* 빈 공간 (헤더 높이 맞춤용) */}
                <div className="h-4" />

                {/* 천간 라벨 (하늘 높이 h-24에 중앙 정렬) */}
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

                {/* 지지 라벨 (땅 높이 h-28에 중앙 정렬) */}
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
              {/* 0. 시주 */}
              {!isTimeUnknown && !!saju.grd0 && (
                <div className={pillarStyle}>
                   <div className={pillarLabelStyle}>{UI_TEXT.hour[language]}</div>
                   <div className={classNames(iconsViewStyle, saju.sky0 ? bgToBorder(sigan.color) : "border-gray-200", "rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm")}>
                      <div className="text-3xl mb-1">{getIcon(saju.sky0, 'sky')}</div>
                      {!!saju.sky0 && <><div className="text-[10px] font-bold">{getHanja(saju.sky0, 'sky')}</div><div className="text-[8px] uppercase tracking-tighter">{t(saju.sky0)}</div></>}
                   </div>
                   <div className={classNames(iconsViewStyle, saju.grd0 ? bgToBorder(sijidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                      <div className="text-3xl mb-1">{getIcon(saju.grd0, 'grd')}</div>
                      {!!saju.grd0 && <><div className="text-[10px] font-bold">{getHanja(saju.grd0, 'grd')}</div><div className="text-[8px] uppercase tracking-tighter">{t(saju.grd0)}</div></>}
                      {/* 지장간 */}
                      <div className="flex w-full opacity-50">{sijiji.map((i, idx) => <div key={idx} className={[jiStyle, i.color, ""].join(" ")}><div className="text-[7px]">{i.sub.sky[1]}</div><div>{i.sub.sky[2]}</div></div>)}</div>
                   </div>
                </div>
              )}

              {/* 1. 일주 */}
              <div className={classNames(pillarStyle, bgShow ? "bg-white/90 dark:bg-white/40 border-gray-600 border-[0.5px] border-dashed" : "bg-yellow-100/50 border-yellow-500")}>
                 <span className={classNames(pillarLabelStyle, "dark:!text-gray-700")}>{UI_TEXT.day[language]}</span>
                 <div className={classNames(iconsViewStyle, saju.sky1 ? bgToBorder(ilgan.color) : "border-gray-200", "rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm")}>
                    <div className="text-3xl mb-1">{getIcon(saju.sky1, 'sky')}</div>
                    {!!saju.sky1 && <><div className="text-[10px] font-bold">{getHanja(saju.sky1, 'sky')}</div><div className="text-[8px] uppercase tracking-tighter">{t(saju.sky1)}</div></>}
                 </div>
                 <div className={classNames(iconsViewStyle, saju.grd1 ? bgToBorder(iljidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                    <div className="text-3xl mb-1">{getIcon(saju.grd1, 'grd')}</div>
                    {!!saju.grd1 && <><div className="text-[10px] font-bold">{getHanja(saju.grd1, 'grd')}</div><div className="text-[8px] uppercase tracking-tighter">{t(saju.grd1)}</div></>}
                    <div className="flex w-full opacity-50">{iljiji.map((i, idx) => <div key={idx} className={[jiStyle, i.color, ""].join(" ")}><div className="text-[7px]">{i.sub.sky[1]}</div><div>{i.sub.sky[2]}</div></div>)}</div>
                 </div>
              </div>

              {/* 2. 월주 */}
              <div className={pillarStyle}>
                 <span className={pillarLabelStyle}>{UI_TEXT.month[language]}</span>
                 <div className={classNames(iconsViewStyle, saju.sky2 ? bgToBorder(wolgan.color) : "border-gray-200", "rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm")}>
                    <div className="text-3xl mb-1">{getIcon(saju.sky2, 'sky')}</div>
                    {!!saju.sky2 && <><div className="text-[10px] font-bold">{getHanja(saju.sky2, 'sky')}</div><div className="text-[8px] uppercase tracking-tighter">{t(saju.sky2)}</div></>}
                 </div>
                 <div className={classNames(iconsViewStyle, saju.grd2 ? bgToBorder(woljidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                    <div className="text-3xl mb-1">{getIcon(saju.grd2, 'grd')}</div>
                    {!!saju.grd2 && <><div className="text-[10px] font-bold">{getHanja(saju.grd2, 'grd')}</div><div className="text-[8px] uppercase tracking-tighter">{t(saju.grd2)}</div></>}
                    <div className="flex w-full opacity-50">{woljiji.map((i, idx) => <div key={idx} className={[jiStyle, i.color, ""].join(" ")}><div className="text-[7px]">{i.sub.sky[1]}</div><div>{i.sub.sky[2]}</div></div>)}</div>
                 </div>
              </div>

              {/* 3. 연주 */}
              <div className={pillarStyle}>
                 <span className={pillarLabelStyle}>{UI_TEXT.year[language]}</span>
                 <div className={classNames(iconsViewStyle, saju.sky3 ? bgToBorder(yeongan.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center py-2 shadow-sm")}>
                    <div className="text-3xl mb-1">{getIcon(saju.sky3, 'sky')}</div>
                    {!!saju.sky3 && <><div className="text-[10px] font-bold">{getHanja(saju.sky3, 'sky')}</div><div className="text-[8px] uppercase tracking-tighter">{t(saju.sky3)}</div></>}
                 </div>
                 <div className={classNames(iconsViewStyle, saju.grd3 ? bgToBorder(yeonjidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                    <div className="text-3xl mb-1">{getIcon(saju.grd3, 'grd')}</div>
                    {!!saju.grd3 && <><div className="text-[10px] font-bold">{getHanja(saju.grd3, 'grd')}</div><div className="text-[8px] uppercase tracking-tighter">{t(saju.grd3)}</div></>}
                    <div className="flex w-full opacity-50">{yeonjiji.map((i, idx) => <div key={idx} className={[jiStyle, i.color, ""].join(" ")}><div className="text-[7px]">{i.sub.sky[1]}</div><div>{i.sub.sky[2]}</div></div>)}</div>
                 </div>
              </div>
           </div>
        </div>
      )}

{/* 4. AI 버튼 */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 max-w-xl m-auto px-4">
         {/* 메인 분석 버튼 (기존 유지) */}
         <button 
           onClick={handleAiAnalysis} 
           disabled={loading || !user || !isSaved} 
           className={`w-full h-12 rounded-xl font-bold shadow-lg transition-all overflow-hidden relative group ${loading || !user || !isSaved ? "bg-gray-200 text-gray-400 cursor-not-allowed" : isCached ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-[1.02]" : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:scale-[1.02]"}`}
         >
            {loading && <div className="absolute top-0 left-0 h-full bg-indigo-200/50" style={{width:`${progress}%`}} />}
            <span className="relative z-10 flex justify-center items-center gap-2">
               {loading ? (
                 <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="text-xs">{isCachedLoading ? UI_TEXT.loadingCached[language] : getLoadingText(progress, language)} ({Math.round(progress)}%)</span>
                 </>
               ) : !user ? (
                   UI_TEXT.loginReq[language]
               ) : !isSaved ? (
                   UI_TEXT.saveFirst[language]
               ) : isCached ? (
                   "Analyze Complete! (Click to View)"
               ) : (
                   UI_TEXT.analyzeBtn[language]
               )}
            </span>
         </button>

      
      </div>
{/* 5. 모달 (결과 보기 <-> 채팅 하기 전환 방식) */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:text-gray-300">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setIsModalOpen(false)} />
              <div className="relative w-full max-w-5xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
                  
                  {/* 모달 헤더 */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-slate-800">
                      <div className="flex items-center gap-2">
                          {/* 채팅 모드일 때만 보이는 '뒤로가기' 버튼 */}
                          {viewMode === 'chat' && (
                              <button 
                                onClick={() => handleSetViewMode('result')}
                                className="mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                              >
                                  <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                              </button>
                          )}
                          <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                              {viewMode === 'chat' ? (language === "ko" ? "도사와 대화" : "Chat with the master") : UI_TEXT.modalTitle[language]}
                          </h3>
                                  <span className={`text-[13px] font-bold ${isLocked ? "text-red-500" : "text-gray-400"}`}>
                                              {isLocked ? (language === "ko" ? "일일 횟수 초과" : "Limit Reached") : 
                                              `${language === "ko" ? "남은 질문" : "Remaining"}: ${MAX_EDIT_COUNT - editCount}`}
                                          </span>
                      </div>
                      <div className="flex gap-2">
                          {viewMode === 'result' && (
                              <button onClick={handleCopyResult} className="px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs">{isCopied ? UI_TEXT.copiedBtn[language] : UI_TEXT.copyBtn[language]}</button>
                          )}
                          <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 dark:bg-slate-700 rounded-full">✕</button>
                      </div>
                  </div>

                  <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                      {/* 1. 만세력 패널 (좌측 고정 - 언제나 보임) */}
                      <div className="hidden md:flex md:w-[160px] flex-shrink-0 bg-gray-50 dark:bg-slate-900/50 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 overflow-y-auto custom-scrollbar p-4 flex md:flex-col flex-row items-center justify-center gap-2">
                           {!isTimeUnknown && !!saju.grd0 && (
                            <div className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] uppercase font-bold text-gray-400">{UI_TEXT.hour[language]}</span>
                                <div className={classNames(iconsViewStyle, saju.sky0 ? bgToBorder(sigan.color) : "border-gray-200", "w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800")}>
                                    <div className="text-2xl">{getIcon(saju.sky0, 'sky')}</div>
                                    <div className="text-[8px] font-bold">{getHanja(saju.sky0, 'sky')}</div>
                                </div>
                                <div className={classNames(iconsViewStyle, saju.grd0 ? bgToBorder(sijidata.color) : "border-gray-200", "w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800")}>
                                    <div className="text-2xl">{getIcon(saju.grd0, 'grd')}</div>
                                    <div className="text-[8px] font-bold">{getHanja(saju.grd0, 'grd')}</div>
                                </div>
                            </div>
                           )}
                           <div className="flex flex-col gap-1 items-center p-1 bg-yellow-100/30 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700/30">
                                <span className="text-[10px] uppercase font-bold text-indigo-500">{UI_TEXT.day[language]}</span>
                                <div className={classNames(iconsViewStyle, saju.sky1 ? bgToBorder(ilgan.color) : "border-gray-200", "w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800")}>
                                    <div className="text-2xl">{getIcon(saju.sky1, 'sky')}</div>
                                    <div className="text-[8px] font-bold">{getHanja(saju.sky1, 'sky')}</div>
                                </div>
                                <div className={classNames(iconsViewStyle, saju.grd1 ? bgToBorder(iljidata.color) : "border-gray-200", "w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800")}>
                                    <div className="text-2xl">{getIcon(saju.grd1, 'grd')}</div>
                                    <div className="text-[8px] font-bold">{getHanja(saju.grd1, 'grd')}</div>
                                </div>
                           </div>
                           <div className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] uppercase font-bold text-gray-400">{UI_TEXT.month[language]}</span>
                                <div className={classNames(iconsViewStyle, saju.sky2 ? bgToBorder(wolgan.color) : "border-gray-200", "w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800")}>
                                    <div className="text-2xl">{getIcon(saju.sky2, 'sky')}</div>
                                    <div className="text-[8px] font-bold">{getHanja(saju.sky2, 'sky')}</div>
                                </div>
                                <div className={classNames(iconsViewStyle, saju.grd2 ? bgToBorder(woljidata.color) : "border-gray-200", "w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800")}>
                                    <div className="text-2xl">{getIcon(saju.grd2, 'grd')}</div>
                                    <div className="text-[8px] font-bold">{getHanja(saju.grd2, 'grd')}</div>
                                </div>
                           </div>
                           <div className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] uppercase font-bold text-gray-400">{UI_TEXT.year[language]}</span>
                                <div className={classNames(iconsViewStyle, saju.sky3 ? bgToBorder(yeongan.color) : "border-gray-200", "w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800")}>
                                    <div className="text-2xl">{getIcon(saju.sky3, 'sky')}</div>
                                    <div className="text-[8px] font-bold">{getHanja(saju.sky3, 'sky')}</div>
                                </div>
                                <div className={classNames(iconsViewStyle, saju.grd3 ? bgToBorder(yeonjidata.color) : "border-gray-200", "w-14 h-14 rounded-md flex flex-col items-center justify-center shadow-sm bg-white dark:bg-slate-800")}>
                                    <div className="text-2xl">{getIcon(saju.grd3, 'grd')}</div>
                                    <div className="text-[8px] font-bold">{getHanja(saju.grd3, 'grd')}</div>
                                </div>
                           </div>
                      </div>

                      {/* 2. 오른쪽 콘텐츠 영역 (조건부 렌더링) */}
                      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 h-full overflow-hidden">
                          
                          {/* ==================== A. 결과 보기 모드 ==================== */}
                          {viewMode === 'result' && (
                              <>
                                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                      <div className="prose prose-indigo dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap dark:text-gray-200 pb-10">
                                          {aiResult}
                                      </div>
                                  </div>
                                  
                                  {/* 결과 모드 Footer: 질문하기 버튼 */}
                                  <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center flex-shrink-0">
                                      <button onClick={handleShare} className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm text-sm font-bold text-gray-600 dark:text-gray-200 hover:bg-gray-50 flex gap-2">
                                          {UI_TEXT.shareBtn[language]}
                                      </button>
                                      
                                      <button 
                                          onClick={() => handleSetViewMode('chat')}
                                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
                                      >
                                          <span>💬</span> {language === "ko" ? "추가 질문하기" : "Ask a Question"}
                                      </button>
                                  </div>
                              </>
                          )}

                          {/* ==================== B. 채팅 모드 ==================== */}
                          {viewMode === 'chat' && (
                              <>
                                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                                      {chatList.map((msg, idx) => (
                                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                              <div 
                                                className={`max-w-[90%] md:max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap 
                                                ${msg.role === 'user' 
                                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-tl-none prose prose-indigo dark:prose-invert max-w-none'}`}
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

                                

                                  {/* 채팅 입력창 */}
                                  <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-slate-900/50 flex flex-col gap-2 flex-shrink-0">
{/* 🔮 [새로 추가] 오늘의 운세 버튼 영역 */}
                                <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-slate-900/50 flex flex-shrink-0">
                                    <button 
                                        onClick={handleDailyFortuneQuestion}
                                        disabled={isLocked || qLoading || !isSaved}
                                        className={`w-full py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 
                                            ${(isLocked || qLoading || !isSaved) ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-yellow-500 text-white hover:bg-yellow-600"}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {language === "ko" ? "🔮 오늘의 운세 보기" : "🔮 View Daily Fortune"}
                                    </button>
                                </div>
                                      <div className="relative flex items-center">
                                          <input 
                                              type="text" 
                                              value={customQuestion}
                                              onChange={(e) => setCustomQuestion(e.target.value)}
                                              placeholder={language === "ko" ? "궁금한 점을 물어보세요..." : "Ask your question..."}
                                              onKeyDown={(e) => e.key === 'Enter' && !qLoading && !isLocked && handleAdditionalQuestion()}
                                              disabled={isLocked || qLoading}
                                              className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white disabled:opacity-60"
                                          />
                                          <button 
                                              onClick={handleAdditionalQuestion}
                                              disabled={isLocked || !customQuestion.trim() || qLoading}
                                              className={`absolute right-2 p-1.5 rounded-lg transition-all ${isLocked || !customQuestion.trim() || qLoading ? "text-gray-400" : "text-indigo-600 hover:bg-indigo-50"}`}
                                          >
                                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
      
      {/* 2번째 캡처용 (일주만) */}
      {!!showIcons && (<div className="flex flex-col items-center mt-2 sr-only"><div id="day-pillar-capture" className={classNames(pillarStyle, bgShow ? "bg-white dark:bg-gray-400" : "bg-yellow-50 dark:bg-gray-400")}><span className={classNames(pillarLabelStyle, "dark:!text-gray-500")}>Day</span><div className={classNames(iconsViewStyle, saju.sky1 ? bgToBorder(ilgan.color) : "border-gray-200", "rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm")}><div className="text-3xl mb-1">{getIcon(saju.sky1, 'sky')}</div>{!!saju.sky1 && <><div className="text-[10px] font-bold">{getHanja(saju.sky1, 'sky')}</div></>}</div><div className={classNames(iconsViewStyle, saju.grd1 ? bgToBorder(iljidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}><div className="text-3xl mb-1">{getIcon(saju.grd1, 'grd')}</div>{!!saju.grd1 && <><div className="text-[10px] font-bold">{getHanja(saju.grd1, 'grd')}</div></>}</div></div></div>)}
    </div>
  );
}