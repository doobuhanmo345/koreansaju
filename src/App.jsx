import { useState, useEffect, useCallback } from "react";
import { toPng } from "html-to-image";
import { BoltIcon, PlusCircleIcon, AdjustmentsHorizontalIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Solar } from "lunar-javascript";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { login, logout, onUserStateChange, db } from "./lib/firebase"; 
import { fetchGeminiAnalysis } from "./api/gemini";
import { 
  SAJU_DATA, UI_TEXT, HANJA_MAP, DEFAULT_INSTRUCTION, GONGMANG_DATA, CHUNEUL,
  SKY_CH_TEXT, GRD_CH_TEXT, BANGHAP_TEXT, HAP3_TEXT, HAP6_TEXT, GRD_BANHAP_TEXT, SKY_HAP_TEXT,
  BANGHAP_EXP, HAP3_EXP, HAP6_EXP, GRD_BANHAP_EXP, SKY_HAP_EXP
} from "./data/constants";
import { classNames, getIcon, getHanja, getEng, getLoadingText, getSymbol, bgToBorder } from "./utils/helpers";

export default function App() {
  // 1. State 정의
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.theme || "light");
  const [language, setLanguage] = useState("en");
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [gender, setGender] = useState("female");
  
  const [saju, setSaju] = useState({
    sky0: "", grd0: "", sky1: "", grd1: "", sky2: "", grd2: "", sky3: "", grd3: "",
  });

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
  const [containerWidth, setContainerWidth] = useState(411);
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userPrompt, setUserPrompt] = useState(DEFAULT_INSTRUCTION);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [showIcons, setShowIcons] = useState(true);
  const [charShow, setCharShow] = useState(true);
  const [bgShow, setBgShow] = useState(true);
  const error = false;

  // 2. Effects
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.theme = theme;
  }, [theme]);

  useEffect(() => {
    onUserStateChange(async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.birthDate) setInputDate(data.birthDate);
            if (data.gender) setGender(data.gender);
            if (data.isTimeUnknown !== undefined) setIsTimeUnknown(data.isTimeUnknown);
          }
        } catch (error) {
          console.error("정보 불러오기 실패:", error);
        }
      }
    });
  }, []);

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
    } catch (error) { console.warn(error); }
  }, [inputDate, isTimeUnknown]);

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99) return 99;
          const r = Math.random();
          let increment = 0;
          if (prev < 20) increment = r < 0.7 ? 1 : 2;
          else if (prev < 50) increment = r < 0.5 ? 1 : 0;
          else if (prev < 80) increment = r < 0.2 ? 1 : 0;
          else increment = r < 0.05 ? 1 : 0;
          return prev + increment;
        });
      }, 100);
    } else { setProgress(100); }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isModalOpen]);

  // 3. [핵심] 만세력 시각화 로직 (Js.jsx 로직 복원)
  const relationAd = SAJU_DATA.sky;
  
  let gongmangbool = [false, false, false];
  let chuneulbool = [false, false, false];
  let sky12ch = false, sky12hap = [false, {}];
  let sky23ch = false, sky23hap = [false, {}];
  let grd12ch = false, grd12banhap = [false, {}], grd126 = [false, {}];
  let grd23ch = false, grd23banhap = [false, {}], grd236 = [false, {}];
  let banghap = [false, {}], hap3 = [false, {}];
  let gongmang = [];
  
  let sigan, ilgan, wolgan, yeongan;
  let siji, ilji, wolji, yeonji;
  let sijidata, iljidata, woljidata, yeonjidata;
  let sijiji = [], iljiji = [], woljiji = [], yeonjiji = [];
  let insu = [], sik = [], jae = [], guan = [];

  if (relationAd) {
    sigan = relationAd.find((i) => i.sub.sky[0] === saju.sky0) || relationAd.find((i) => i.id === 0);
    ilgan = relationAd.find((i) => i.sub.sky[0] === saju.sky1) || relationAd.find((i) => i.id === 0);
    wolgan = relationAd.find((i) => i.sub.sky[0] === saju.sky2) || relationAd.find((i) => i.id === 0);
    yeongan = relationAd.find((i) => i.sub.sky[0] === saju.sky3) || relationAd.find((i) => i.id === 0);

    const jijiText = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

    // Time
    if (saju.grd0) {
      if (!jijiText.includes(saju.grd0)) {
        sijidata = relationAd.find((i) => i.id === 0);
        siji = sijidata.sub.grd[1];
        sijiji = [sijidata];
      } else {
        sijidata = relationAd.find((i) => i.sub.grd[0][0] === saju.grd0) || relationAd.find((i) => i.sub.grd[1][0] === saju.grd0);
        if (sijidata) {
          siji = sijidata.sub.grd[0][0] === saju.grd0 ? sijidata.sub.grd[0] : sijidata.sub.grd[1];
          for (let i = 0; i < siji[3].length; i++) sijiji.push(relationAd.find((item) => item.id === siji[3][i]));
        }
      }
    } else { sijidata = relationAd.find((i) => i.id === 0); }

    // Day
    if (saju.grd1) {
      if (!jijiText.includes(saju.grd1)) {
        iljidata = relationAd.find((i) => i.id === 0);
        ilji = iljidata.sub.grd[1];
        iljiji = [iljidata];
      } else {
        iljidata = relationAd.find((i) => i.sub.grd[0][0] === saju.grd1) || relationAd.find((i) => i.sub.grd[1][0] === saju.grd1);
        if (iljidata) {
          ilji = iljidata.sub.grd[0][0] === saju.grd1 ? iljidata.sub.grd[0] : iljidata.sub.grd[1];
          for (let i = 0; i < ilji[3].length; i++) iljiji.push(relationAd.find((item) => item.id === ilji[3][i]));
        }
      }
    } else { iljidata = relationAd.find((i) => i.id === 0); }

    // Month
    if (saju.grd2) {
      if (!jijiText.includes(saju.grd2)) {
        woljidata = relationAd.find((i) => i.id === 0);
        wolji = woljidata.sub.grd[1];
        woljiji = [woljidata];
      } else {
        woljidata = relationAd.find((i) => i.sub.grd[0][0] === saju.grd2) || relationAd.find((i) => i.sub.grd[1][0] === saju.grd2);
        if (woljidata) {
          wolji = woljidata.sub.grd[0][0] === saju.grd2 ? woljidata.sub.grd[0] : woljidata.sub.grd[1];
          for (let i = 0; i < wolji[3].length; i++) woljiji.push(relationAd.find((item) => item.id === wolji[3][i]));
        }
      }
    } else { woljidata = relationAd.find((i) => i.id === 0); }

    // Year
    if (saju.grd3) {
      if (!jijiText.includes(saju.grd3)) {
        yeonjidata = relationAd.find((i) => i.id === 0);
        yeonji = yeonjidata.sub.grd[1];
        yeonjiji = [yeonjidata];
      } else {
        yeonjidata = relationAd.find((i) => i.sub.grd[0][0] === saju.grd3) || relationAd.find((i) => i.sub.grd[1][0] === saju.grd3);
        if (yeonjidata) {
          yeonji = yeonjidata.sub.grd[0][0] === saju.grd3 ? yeonjidata.sub.grd[0] : yeonjidata.sub.grd[1];
          for (let i = 0; i < yeonji[3].length; i++) yeonjiji.push(relationAd.find((item) => item.id === yeonji[3][i]));
        }
      }
    } else { yeonjidata = relationAd.find((i) => i.id === 0); }

    // Sipseong
    if (saju.sky1 && ilgan.id !== 0) {
      ilgan?.relation["인수"].forEach((i) => insu.push(relationAd.find((item) => item.id === i)));
      ilgan?.relation["식상"].forEach((i) => sik.push(relationAd.find((item) => item.id === i)));
      ilgan?.relation["관성"].forEach((i) => guan.push(relationAd.find((item) => item.id === i)));
      ilgan?.relation["재성"].forEach((i) => jae.push(relationAd.find((item) => item.id === i)));
    } else {
      const empty = relationAd.find((i) => i.id === 0);
      insu = [empty]; sik = [empty]; guan = [empty]; jae = [empty];
    }

    // Logic
    if (saju.sky1 && saju.grd1) {
      const ilju = saju.sky1 + saju.grd1;
      for (let i = 0; i < GONGMANG_DATA.length; i++) {
        if (GONGMANG_DATA[i].includes(ilju)) {
          switch (i) {
            case 0: gongmang = ["술", "해"]; break;
            case 1: gongmang = ["신", "유"]; break;
            case 2: gongmang = ["오", "미"]; break;
            case 3: gongmang = ["진", "사"]; break;
            case 4: gongmang = ["인", "묘"]; break;
            case 5: gongmang = ["자", "축"]; break;
            default: break;
          }
        }
      }
      gongmangbool[0] = gongmang.includes(saju.grd1);
      gongmangbool[1] = gongmang.includes(saju.grd2);
      gongmangbool[2] = gongmang.includes(saju.grd3);
    }
    if (saju.sky1 && CHUNEUL[saju.sky1]) {
      chuneulbool = [
        CHUNEUL[saju.sky1].includes(saju.grd1),
        CHUNEUL[saju.sky1].includes(saju.grd2),
        CHUNEUL[saju.sky1].includes(saju.grd3),
      ];
    }
    // Hap/Chung Check
    if (saju.sky1 && saju.sky2) {
      if (SKY_HAP_TEXT.includes(saju.sky1 + saju.sky2)) sky12hap = [true, SKY_HAP_EXP[saju.sky1 + saju.sky2]];
      else if (SKY_HAP_TEXT.includes(saju.sky2 + saju.sky1)) sky12hap = [true, SKY_HAP_EXP[saju.sky2 + saju.sky1]];
      if (SKY_CH_TEXT.includes(saju.sky1 + saju.sky2) || SKY_CH_TEXT.includes(saju.sky2 + saju.sky1)) sky12ch = true;
    }
    if (saju.sky2 && saju.sky3) {
      if (SKY_HAP_TEXT.includes(saju.sky2 + saju.sky3)) sky23hap = [true, SKY_HAP_EXP[saju.sky2 + saju.sky3]];
      else if (SKY_HAP_TEXT.includes(saju.sky3 + saju.sky2)) sky23hap = [true, SKY_HAP_EXP[saju.sky3 + saju.sky2]];
      if (SKY_CH_TEXT.includes(saju.sky2 + saju.sky3) || SKY_CH_TEXT.includes(saju.sky3 + saju.sky2)) sky23ch = true;
    }
    if (saju.grd1 && saju.grd2) {
      if (GRD_CH_TEXT.includes(saju.grd1 + saju.grd2) || GRD_CH_TEXT.includes(saju.grd2 + saju.grd1)) grd12ch = true;
      const txt = saju.grd1 + saju.grd2;
      const rev = saju.grd2 + saju.grd1;
      if (GRD_BANHAP_TEXT.includes(txt)) grd12banhap = [true, GRD_BANHAP_EXP[txt]];
      else if (GRD_BANHAP_TEXT.includes(rev)) grd12banhap = [true, GRD_BANHAP_EXP[rev]];
      if (HAP6_TEXT.includes(txt)) grd126 = [true, HAP6_EXP[txt]];
      else if (HAP6_TEXT.includes(rev)) grd126 = [true, HAP6_EXP[rev]];
    }
    if (saju.grd2 && saju.grd3) {
      if (GRD_CH_TEXT.includes(saju.grd2 + saju.grd3) || GRD_CH_TEXT.includes(saju.grd3 + saju.grd2)) grd23ch = true;
      const txt = saju.grd2 + saju.grd3;
      const rev = saju.grd3 + saju.grd2;
      if (GRD_BANHAP_TEXT.includes(txt)) grd23banhap = [true, GRD_BANHAP_EXP[txt]];
      else if (GRD_BANHAP_TEXT.includes(rev)) grd23banhap = [true, GRD_BANHAP_EXP[rev]];
      if (HAP6_TEXT.includes(txt)) grd236 = [true, HAP6_EXP[txt]];
      else if (HAP6_TEXT.includes(rev)) grd236 = [true, HAP6_EXP[rev]];
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

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSaju((prev) => ({ ...prev, [name]: value }));
  };
  const focusInput = (e) => { e.target.value = ""; };
  const handleSaveMyInfo = async () => {
    if (!user) { alert("로그인이 필요합니다!"); login(); return; }
    try {
      await setDoc(doc(db, "users", user.uid), {
        birthDate: inputDate, gender, isTimeUnknown, updatedAt: new Date(),
      }, { merge: true });
      alert("내 기본 정보로 저장되었습니다! \n다음 로그인부터 이 정보가 자동으로 뜹니다.");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    }
  };
  const handleAiAnalysis = async () => {
    if (!saju.sky3) { alert("생년월일을 먼저 입력해주세요."); return; }
    setLoading(true); setAiResult("");
    try {
      const sajuInfo = `[사주 정보]\n- 성별: ${gender}\n- 생년월일: ${inputDate}\n- 만세력: ${JSON.stringify(saju)}`;
      const langInstruction = language === "ko" ? "답변은 한국어로" : "Response in English";
      const prompt = `${sajuInfo}\n${userPrompt}\n${langInstruction}`;
      const result = await fetchGeminiAnalysis(prompt);
      setAiResult(result); setIsSuccess(true); setIsModalOpen(true);
    } catch (error) { alert(error.message); } finally { setLoading(false); }
  };
  const handleCopyResult = async () => {
    if (!aiResult) return;
    await navigator.clipboard.writeText(aiResult);
    setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
  };
  const handleShare = async () => {
    const shareData = { title: "Sajucha", url: "[https://sajucha.netlify.app](https://sajucha.netlify.app)" };
    if (navigator.share) await navigator.share(shareData);
    else { await navigator.clipboard.writeText(shareData.url); alert("복사되었습니다."); }
  };
  const saveAsImageSaju = useCallback(async () => {
    const element = document.getElementById("saju-capture");
    if (!element) return;
    const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2, style: { margin: "0" }, backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff" });
    const link = document.createElement("a"); link.download = "saju.png"; link.href = dataUrl; link.click();
  }, [theme]);
  const saveAsImageIlju = useCallback(async () => {
    const element = document.getElementById("day-pillar-capture");
    if (!element) return;
    const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2, style: { margin: "0" }, backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff" });
    const link = document.createElement("a"); link.download = "ilju.png"; link.href = dataUrl; link.click();
  }, [theme]);

  // --- Render (100% from Js.jsx) ---
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

  return (
    <div className="relative px-3 py-6 dark:bg-slate-900">
      {/* 1. Top Auth Panel */}
      <div className="w-full flex flex-col gap-5 pt-4 animate-[fadeIn_0.3s_ease-out] max-w-lg m-auto my-2">
          <div className="flex items-center justify-between bg-indigo-50 dark:bg-slate-700/50 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/30">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-indigo-200" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{user.displayName}님</span>
                    <span className="text-[10px] text-gray-400">반갑습니다!</span>
                  </div>
                </div>
                <button onClick={logout} className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg font-bold transition-colors">로그아웃</button>
                <button onClick={handleSaveMyInfo} className="text-[10px] text-indigo-500 hover:text-indigo-700 underline font-semibold">현재 정보를 기본값으로 저장</button>
              </div>
            ) : (
              <div className="w-full">
                <button onClick={login} className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-bold transition-all shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  구글로 시작하기
                </button>
                <p className="text-[10px] text-center text-gray-400 mt-1">로그인하면 내 사주를 저장할 수 있어요!</p>
              </div>
            )}
          </div>
      </div>

      {/* 2. Main Config Panel */}
      <div className="w-full max-w-lg mb-8 p-5 dark:bg-slate-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl mx-auto">
        <div className="flex flex-col gap-5">
          
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{UI_TEXT.title[language]}</h3>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700">
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>
          <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
            <button onClick={() => setLanguage("en")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === "en" ? "bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-400 dark:text-gray-400 hover:text-gray-600"}`}>English</button>
            <button onClick={() => setLanguage("ko")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === "ko" ? "bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-400 dark:text-gray-400 hover:text-gray-600"}`}>한국어</button>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">{UI_TEXT.genderLabel[language]}</label>
            <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
              <button onClick={() => setGender("male")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === "male" ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm" : "text-gray-400 dark:text-gray-400 hover:text-gray-600"}`}>{UI_TEXT.male[language]}</button>
              <button onClick={() => setGender("female")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === "female" ? "bg-white dark:bg-slate-600 text-pink-500 shadow-sm" : "text-gray-400 dark:text-gray-400 hover:text-gray-600"}`}>{UI_TEXT.female[language]}</button>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">{UI_TEXT.birthLabel[language]}</label>
              <label className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                <input type="checkbox" checked={isTimeUnknown} onChange={(e) => setIsTimeUnknown(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-slate-700" />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{UI_TEXT.unknownTime[language]}</span>
              </label>
            </div>
            <input type={isTimeUnknown ? "date" : "datetime-local"} max="3000-12-31T23:59" value={isTimeUnknown ? inputDate.split("T")[0] : inputDate} onChange={(e) => { let val = e.target.value; const year = val.split("-")[0]; if (year.length > 4) return; if (isTimeUnknown) val = val + "T00:00"; setInputDate(val); }} className="w-full p-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 font-mono dark:[color-scheme:dark]" />
          </div>
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 text-center">
            <div className="text-lg font-extrabold text-indigo-900 dark:text-indigo-200 tracking-wider break-keep">
              {(() => {
                const t = (char) => language === "en" ? getEng(char) : char;
                return (
                  <>
                    {t(saju.sky3)}{t(saju.grd3)}<span className="text-xs font-normal text-indigo-400 mx-1">{UI_TEXT.year[language]}</span>
                    {t(saju.sky2)}{t(saju.grd2)}<span className="text-xs font-normal text-indigo-400 mx-1">{UI_TEXT.month[language]}</span>
                    {t(saju.sky1)}{t(saju.grd1)}<span className="text-xs font-normal text-indigo-400 mx-1">{UI_TEXT.day[language]}</span>
                    {!isTimeUnknown && <>{t(saju.sky0)}{t(saju.grd0)}<span className="text-xs font-normal text-indigo-400 mx-1">{UI_TEXT.hour[language]}</span></>}
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Saju Capture */}
      {!!showIcons && (
        <div id="saju-capture" style={{ width: `${containerWidth}px`, maxWidth: "100%" }} className="mt-2 relative rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden m-auto transition-[width] duration-100 ease-linear py-2">
          {bgShow && (
            <div className="absolute inset-0 z-0 flex flex-col pointer-events-none transition-all duration-500">
              <div className={`h-1/2 w-full relative bg-gradient-to-b overflow-hidden transition-colors duration-700 ease-in-out ${theme === "dark" ? "from-indigo-950/80 via-slate-900/70 to-blue-900/60" : "from-sky-400/40 via-sky-200/40 to-white/5"}`}>
                {theme === "dark" ? (
                  <>
                    <div className="absolute top-4 right-[3%] w-20 h-20 bg-blue-100 rounded-full blur-3xl opacity-20" />
                    {/* Stars SVG (Simplified for brevity, assume copied from original) */}
                  </>
                ) : (
                  <>
                     <div className="absolute top-2 right-[20%] w-24 h-24 bg-yellow-200 rounded-full blur-2xl opacity-60" />
                     {/* Sun/Cloud SVG (Simplified) */}
                  </>
                )}
              </div>
              <div className={`h-1/2 w-full relative bg-gradient-to-b transition-colors duration-700 ease-in-out border-t ${theme === "dark" ? "from-slate-800/50 to-gray-900/70 border-slate-700/30" : "from-stone-300/40 to-amber-100/60 border-stone-400/20"}`}>
                 <div className={`absolute top-0 left-0 w-full h-8 bg-gradient-to-b transition-colors duration-700 ${theme === "dark" ? "from-slate-900/20 to-transparent" : "from-stone-500/5 to-transparent"}`} />
                 <div className="w-full h-full opacity-10 bg-[radial-gradient(#a8a29e_1px,transparent_1px)] [background-size:16px_16px]"></div>
              </div>
            </div>
          )}

          <div className="relative z-10 flex justify-center bg-white/10 backdrop-blur-sm">
            {charShow && (
              <div className="flex flex-col items-end pt-[10px] animate-[fadeIn_0.5s_ease-out]">
                <div className="h-4" />
                <div className="h-[90px] flex items-center pr-2 border-r border-sky-700/30">
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-sky-700 uppercase tracking-widest opacity-80 dark:text-cyan-600">Heavenly</span>
                    <span className="block text-[10px] font-serif font-bold text-gray-700 drop-shadow-sm dark:text-gray-400">Stem</span>
                  </div>
                </div>
                <div className="h-[110px] flex items-center pr-2 border-r border-stone-400/20">
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest opacity-70 dark:text-yellow-600">Earthly</span>
                    <span className="block text-[10px] font-serif font-bold text-stone-700 drop-shadow-sm dark:text-gray-400">Branch</span>
                  </div>
                </div>
              </div>
            )}

            {!!saju.grd0 && (
              <div className={pillarStyle}>
                <div className={pillarLabelStyle}>Hour</div>
                <div className={classNames(iconsViewStyle, saju.sky0 ? bgToBorder(sigan.color) : "border-gray-200", "rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm")}>
                  <div className="text-3xl mb-1">{getIcon(saju.sky0, "sky")}</div>
                  {!!saju.sky0 && <><div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.sky0, "sky")}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{language == "en" ? getEng(saju.sky0) : saju.sky0}</div></>}
                </div>
                <div className={classNames(iconsViewStyle, saju.grd0 ? bgToBorder(sijidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                  <div className="text-3xl mb-1">{getIcon(saju.grd0, "grd")}</div>
                  {!!saju.grd0 && (
                    <>
                      <div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.grd0, "grd")}</div>
                      <div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{language == "en" ? getEng(saju.grd0) : saju.grd0}</div>
                      <div className="flex w-full opacity-50">{sijiji.map((i, idx) => (<div key={idx} className={[jiStyle, i.color, ""].join(" ")}><div>{i.sub.sky[1]}</div><div>{i.sub.sky[2]}</div></div>))}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className={classNames(pillarStyle, bgShow ? "bg-white/90 dark:bg-white/40 border-gray-600 border-[0.5px] border-dashed rounded-md " : "bg-yellow-100/50 border-yellow-500 dark:bg-white/40 dark:border-white/70 border-[0.5px] border-dashed rounded-md")}>
              <span className={classNames(pillarLabelStyle, "dark:!text-gray-700")}>Day</span>
              <div className={classNames(iconsViewStyle, saju.sky1 ? bgToBorder(ilgan.color) : "border-gray-200", "rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm")}>
                <div className="text-3xl mb-1">{getIcon(saju.sky1, "sky")}</div>
                {!!saju.sky1 && <><div className="text-[10px] font-bold text-gray-800">{getHanja(saju.sky1, "sky")}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600">{language == "en" ? getEng(saju.sky1) : saju.sky1}</div></>}
              </div>
              <div className={classNames(iconsViewStyle, saju.grd1 ? bgToBorder(iljidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                <div className="text-3xl mb-1">{getIcon(saju.grd1, "grd")}</div>
                {!!saju.grd1 && (
                  <>
                    <div className="text-[10px] font-bold text-gray-800">{getHanja(saju.grd1, "grd")}</div>
                    <div className="text-[8px] uppercase tracking-tighter text-gray-600">{language == "en" ? getEng(saju.grd1) : saju.grd1}</div>
                    <div className="flex w-full opacity-50">{iljiji.map((i, idx) => (<div key={idx} className={[jiStyle, i.color, ""].join(" ")}><div>{i.sub.sky[1]}</div><div>{i.sub.sky[2]}</div></div>))}</div>
                  </>
                )}
              </div>
            </div>

            <div className={pillarStyle}>
              <span className={pillarLabelStyle}>Month</span>
              <div className={classNames(iconsViewStyle, saju.sky2 ? bgToBorder(wolgan.color) : "border-gray-200", "rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm")}>
                <div className="text-3xl mb-1">{getIcon(saju.sky2, "sky")}</div>
                {!!saju.sky2 && <><div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.sky2, "sky")}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{language == "en" ? getEng(saju.sky2) : saju.sky2}</div></>}
              </div>
              <div className={classNames(iconsViewStyle, saju.grd2 ? bgToBorder(woljidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                <div className="text-3xl mb-1">{getIcon(saju.grd2, "grd")}</div>
                {!!saju.grd2 && (
                  <>
                    <div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.grd2, "grd")}</div>
                    <div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{language == "en" ? getEng(saju.grd2) : saju.grd2}</div>
                    <div className="flex w-full opacity-50">{woljiji.map((i, idx) => (<div key={idx} className={[jiStyle, i.color, ""].join(" ")}><div>{i.sub.sky[1]}</div><div>{i.sub.sky[2]}</div></div>))}</div>
                  </>
                )}
              </div>
            </div>

            <div className={pillarStyle}>
              <span className={pillarLabelStyle}>Year</span>
              <div className={classNames(iconsViewStyle, saju.sky3 ? bgToBorder(yeongan.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center py-2 shadow-sm")}>
                <div className="text-3xl mb-1">{getIcon(saju.sky3, "sky")}</div>
                {!!saju.sky3 && <><div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.sky3, "sky")}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{language == "en" ? getEng(saju.sky3) : saju.sky3}</div></>}
              </div>
              <div className={classNames(iconsViewStyle, saju.grd3 ? bgToBorder(yeonjidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                <div className="text-3xl mb-1">{getIcon(saju.grd3, "grd")}</div>
                {!!saju.grd3 && (
                  <>
                    <div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.grd3, "grd")}</div>
                    <div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{language == "en" ? getEng(saju.grd3) : saju.grd3}</div>
                    <div className="flex w-full opacity-50">{yeonjiji.map((i, idx) => (<div key={idx} className={[jiStyle, i.color, ""].join(" ")}><div>{i.sub.sky[1]}</div><div>{i.sub.sky[2]}</div></div>))}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!!showIcons && (
        <div className="flex flex-col items-center mt-2 sr-only">
          <div className="w-[75px]">
            <div id="day-pillar-capture" className={classNames(pillarStyle, bgShow ? "bg-white dark:bg-gray-400 border-gray-600 border-[0.5px] border-dashed rounded-md " : "bg-yellow-50 border-yellow-500 dark:bg-gray-400 dark:border-white/70 border-[0.5px] border-dashed rounded-md")}>
              <span className={classNames(pillarLabelStyle, "dark:!text-gray-500")}>Day</span>
              <div className={classNames(iconsViewStyle, saju.sky1 ? bgToBorder(ilgan.color) : "border-gray-200", "rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm")}>
                <div className="text-3xl mb-1">{getIcon(saju.sky1, "sky")}</div>
                {!!saju.sky1 && <><div className="text-[10px] font-bold text-gray-800 dark:!text-gray-300">{getHanja(saju.sky1, "sky")}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:!text-gray-400">{getEng(saju.sky1)}</div></>}
              </div>
              <div className={classNames(iconsViewStyle, saju.grd1 ? bgToBorder(iljidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                <div className="text-3xl mb-1">{getIcon(saju.grd1, "grd")}</div>
                {!!saju.grd1 && <><div className="text-[10px] font-bold text-gray-800 dark:!text-gray-300">{getHanja(saju.grd1, "grd")}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:!text-gray-400">{getEng(saju.grd1)}</div><div className="flex w-full opacity-50">{iljiji.map((i, idx) => (<div key={idx} className={[jiStyle, i.color, ""].join(" ")}><div className="text-[7px]">{i.sub.sky[1]}</div><div>{i.sub.sky[2]}</div></div>))}</div></>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Toggle Control Panel */}
      {showIcons && !!saju.sky1 && (
        <div className="flex flex-col items-center justify-center max-w-md m-auto my-4 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300">
          <button onClick={() => setIsControlPanelOpen(!isControlPanelOpen)} className="flex items-center justify-between w-full border-b border-gray-300 dark:border-gray-600 pb-2 mb-1 cursor-pointer hover:opacity-70 transition-opacity">
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Control Panel</span>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isControlPanelOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" /></svg>
          </button>

          {isControlPanelOpen && (
            <div className="w-full flex flex-col gap-5 pt-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex gap-2 align-middle justify-center">
                <div onClick={() => setBgShow(!bgShow)} className="flex items-center gap-2 cursor-pointer group"><span className={`text-xs font-bold transition-colors ${bgShow ? "text-sky-600" : "text-gray-400"}`}>배경</span><div className={`relative w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${bgShow ? "bg-sky-400" : "bg-gray-300"}`}><div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${bgShow ? "translate-x-5" : "translate-x-0"}`} /></div></div>
                <div onClick={() => setCharShow(!charShow)} className="flex items-center gap-2 cursor-pointer group"><span className={`text-xs font-bold transition-colors ${charShow ? "text-sky-600" : "text-gray-400"}`}>글자</span><div className={`relative w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${charShow ? "bg-sky-400" : "bg-gray-300"}`}><div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${charShow ? "translate-x-5" : "translate-x-0"}`} /></div></div>
                <div onClick={() => { const next = localStorage.theme === "dark" ? "light" : "dark"; setTheme(next); localStorage.theme = next; document.documentElement.classList.toggle("dark", next === "dark"); }} className="flex items-center gap-2 cursor-pointer group"><span className={`text-xs font-bold transition-colors ${localStorage.theme === "dark" ? "text-sky-600" : "text-gray-400"}`}>밤낮</span><div className={`relative w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${localStorage.theme === "dark" ? "bg-sky-400" : "bg-gray-300"}`}><div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${localStorage.theme === "dark" ? "translate-x-5" : "translate-x-0"}`} /></div></div>
              </div>

              <div className="flex gap-2 align-middle justify-center items-center">
                <div className="w-full px-3 py-2 bg-white/50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">너비</span>
                  <input type="range" min="320" max="800" value={containerWidth} onChange={(e) => setContainerWidth(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-sky-500" />
                  <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{containerWidth}</span>
                </div>
                <button className={upperButtonStyle + " text-xs px-2 py-2 h-full whitespace-nowrap"} onClick={() => setContainerWidth(410)}>초기화</button>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button onClick={saveAsImageSaju} className={upperButtonStyle + " w-full text-xs"}>📷 사주 저장</button>
                <button onClick={saveAsImageIlju} className={upperButtonStyle + " w-full text-xs"}>🖼️ 일주 저장</button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 my-1" />

              <div>
                <button onClick={() => setShowPromptInput(!showPromptInput)} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-full">
                  <svg className={`w-4 h-4 transition-transform ${showPromptInput ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  {UI_TEXT.promptLabel[language] || "AI 분석 프롬프트 직접 수정하기 (고급)"}
                </button>
                {showPromptInput && (
                  <div className="animate-[fadeIn_0.3s_ease-out] pt-3">
                    <textarea value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} className="w-full h-48 p-3 text-xs leading-relaxed bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-y custom-scrollbar dark:text-gray-200" placeholder="AI에게 지시할 내용을 자유롭게 적으세요..." />
                    <div className="flex justify-end mt-2">
                      <button onClick={() => setUserPrompt(DEFAULT_INSTRUCTION)} className="text-[10px] text-gray-400 hover:text-red-500 underline">{UI_TEXT.resetPrompt[language] || "기본값으로 초기화"}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. AI Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 max-w-xl m-auto px-4">
        <div className="relative">
          <button onClick={handleAiAnalysis} disabled={loading || !saju.sky3} className={`w-full h-12 rounded-xl font-bold shadow-lg transition-all duration-500 overflow-hidden relative group ${loading ? "bg-gray-100 dark:bg-slate-700 cursor-wait" : isSuccess ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-[1.02]" : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:scale-[1.02]"}`}>
            {loading && <div className="absolute top-0 left-0 h-full bg-indigo-200/50 dark:bg-indigo-500/30 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />}
            <span className={`relative z-10 flex justify-center items-center gap-2 ${loading ? "text-indigo-600 dark:text-indigo-300" : ""}`}>
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 min-w-[20px]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span className="text-xs sm:text-sm truncate px-1">{getLoadingText(progress, language)} ({progress}%)</span>
                </>
              ) : isSuccess ? (
                <div className="flex items-center gap-2 animate-[fadeIn_0.5s_ease-out]">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  <span>Analyze Complete!</span>
                </div>
              ) : (
                <span>{UI_TEXT.analyzeBtn[language]}</span>
              )}
            </span>
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out] flex flex-col max-h-[85vh] dark:text-white">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md sticky top-0 z-10">
                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">{UI_TEXT.modalTitle[language]}</h3>
                <div className="flex gap-2">
                  <button onClick={handleCopyResult} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isCopied ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300"}`}>{isCopied ? UI_TEXT.copiedBtn[language] : UI_TEXT.copyBtn[language]}</button>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full text-gray-500 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="prose prose-indigo dark:prose-invert max-w-none text-sm leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>{aiResult}</div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50 flex justify-end">
                <button onClick={handleShare} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  {UI_TEXT.shareBtn[language]}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}