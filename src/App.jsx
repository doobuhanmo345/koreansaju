import { useState, useEffect, useCallback } from "react";
import { toPng } from "html-to-image";
import { BoltIcon, PlusCircleIcon, AdjustmentsHorizontalIcon, LockClosedIcon, PencilSquareIcon } from "@heroicons/react/24/outline"; // 아이콘 추가
import { Solar } from "lunar-javascript";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Local Imports
import { login, logout, onUserStateChange, db } from "./lib/firebase";
import { fetchGeminiAnalysis } from "./api/gemini";
import { 
  SAJU_DATA, UI_TEXT, HANJA_MAP, DEFAULT_INSTRUCTION, GONGMANG_DATA, CHUNEUL,
  SKY_CH_TEXT, GRD_CH_TEXT, BANGHAP_TEXT, HAP3_TEXT, HAP6_TEXT, GRD_BANHAP_TEXT, SKY_HAP_TEXT,
  BANGHAP_EXP, HAP3_EXP, HAP6_EXP, GRD_BANHAP_EXP, SKY_HAP_EXP
} from "./data/constants";
import { classNames, getIcon, getHanja, getEng, getLoadingText, getSymbol, bgToBorder } from "./utils/helpers";

export default function App() {
  // --- States ---
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.theme || "light");
  const [language, setLanguage] = useState("en");
  
  // 🔒 [핵심 추가] 정보 저장 여부 (잠금 상태)
  const [hasSavedInfo, setHasSavedInfo] = useState(false);

  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [gender, setGender] = useState("female");
  
  const [saju, setSaju] = useState({
    sky0: "", grd0: "", sky1: "", grd1: "", sky2: "", grd2: "", sky3: "", grd3: "",
  });

  const getInitialDate = () => {
    try {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    } catch (e) { return "2000-01-01T00:00"; }
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
  
  // UI Toggles
  const [showIcons, setShowIcons] = useState(true);
  const [charShow, setCharShow] = useState(true);
  const [bgShow, setBgShow] = useState(true);

  // --- Effects ---

  // Theme Init
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.theme = theme;
  }, [theme]);

  // Auth & DB Fetch Logic (로그인 시 DB확인 및 잠금 설정)
  useEffect(() => {
    onUserStateChange(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.birthDate) {
                setInputDate(data.birthDate);
                setHasSavedInfo(true); // 🔒 데이터가 있으면 잠금!
            }
            if (data.gender) setGender(data.gender);
            if (data.isTimeUnknown !== undefined) setIsTimeUnknown(data.isTimeUnknown);
          } else {
            setHasSavedInfo(false); // 데이터 없으면 풀기
          }
        } catch (error) {
          console.error("DB Load Error:", error);
        }
      } else {
        // 로그아웃 시 초기화
        setHasSavedInfo(false);
        setInputDate(getInitialDate());
      }
    });
  }, []);

  // Saju Calculation
  useEffect(() => {
    if (!inputDate) return;
    const dateObj = new Date(inputDate);
    if (isNaN(dateObj.getTime())) return;

    const year = dateObj.getFullYear();
    if (isNaN(year) || year < 1000 || year > 3000) return;

    try {
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      const hour = dateObj.getHours();
      const minute = dateObj.getMinutes();

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
    } catch (error) {
      console.warn("Calculation Error:", error);
    }
  }, [inputDate, isTimeUnknown]);

  // Loading Animation
  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99) return 99;
          const r = Math.random();
          let inc = 0;
          if (prev < 20) inc = r < 0.7 ? 1 : 2;
          else if (prev < 50) inc = r < 0.5 ? 1 : 0;
          else if (prev < 80) inc = r < 0.2 ? 1 : 0;
          else inc = r < 0.05 ? 1 : 0;
          return prev + inc;
        });
      }, 100);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Modal Scroll Lock
  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isModalOpen]);

  // --- Logic for Rendering (Copied exactly) ---
  const relationAd = SAJU_DATA.sky;
  let gongmangbool = [false, false, false];
  let chuneulbool = [false, false, false];
  let sky12ch = false; let sky12hap = [false, {}]; let sky23ch = false; let sky23hap = [false, {}];
  let grd12ch = false; let grd12banhap = [false, {}]; let grd126 = [false, {}];
  let grd23ch = false; let grd23banhap = [false, {}]; let grd236 = [false, {}];
  let banghap = [false, {}]; let hap3 = [false, {}]; let gongmang = [];
  
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

    const getJijiData = (char) => {
       if (!char || !jijiText.includes(char)) {
           const empty = relationAd.find((i) => i.id === 0);
           return { data: empty, sub: empty.sub.grd[1], hidden: [empty] };
       }
       const found = relationAd.find(i => i.sub.grd[0][0] === char) || relationAd.find(i => i.sub.grd[1][0] === char);
       if(!found) {
           const empty = relationAd.find((i) => i.id === 0);
           return { data: empty, sub: empty.sub.grd[1], hidden: [empty] };
       }
       const subData = found.sub.grd[0][0] === char ? found.sub.grd[0] : found.sub.grd[1];
       const hidden = subData[3].map(id => relationAd.find(item => item.id === id));
       return { data: found, sub: subData, hidden };
    };

    const s = getJijiData(saju.grd0); sijidata=s.data; siji=s.sub; sijiji=s.hidden;
    const i = getJijiData(saju.grd1); iljidata=i.data; ilji=i.sub; iljiji=i.hidden;
    const w = getJijiData(saju.grd2); woljidata=w.data; wolji=w.sub; woljiji=w.hidden;
    const y = getJijiData(saju.grd3); yeonjidata=y.data; yeonji=y.sub; yeonjiji=y.hidden;

    if (saju.sky1 && ilgan.id !== 0) {
      ilgan?.relation["인수"].forEach(id => insu.push(relationAd.find(item => item.id === id)));
      ilgan?.relation["식상"].forEach(id => sik.push(relationAd.find(item => item.id === id)));
      ilgan?.relation["관성"].forEach(id => guan.push(relationAd.find(item => item.id === id)));
      ilgan?.relation["재성"].forEach(id => jae.push(relationAd.find(item => item.id === id)));
    } else {
      const empty = relationAd.find((i) => i.id === 0);
      insu=[empty]; sik=[empty]; guan=[empty]; jae=[empty];
    }

    if (saju.sky1 && saju.grd1) {
      const ilju = saju.sky1 + saju.grd1;
      for (let idx = 0; idx < GONGMANG_DATA.length; idx++) {
        if (GONGMANG_DATA[idx].includes(ilju)) {
             const gmMap = [["술", "해"], ["신", "유"], ["오", "미"], ["진", "사"], ["인", "묘"], ["자", "축"]];
             gongmang = gmMap[idx] || [];
             break;
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

    const checkHapChung = (t1, t2, type) => {
        const txt = t1 + t2;
        const rev = t2 + t1;
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
      const txt = saju.grd1 + saju.grd2 + saju.grd3;
      const rev = saju.grd3 + saju.grd2 + saju.grd1;
      if (BANGHAP_TEXT.includes(txt)) banghap = [true, BANGHAP_EXP[txt]];
      else if (BANGHAP_TEXT.includes(rev)) banghap = [true, BANGHAP_EXP[rev]];
      if (HAP3_TEXT.includes(txt)) hap3 = [true, HAP3_EXP[txt]];
      else if (HAP3_TEXT.includes(rev)) hap3 = [true, HAP3_EXP[rev]];
    }
  }

  // --- Handlers ---
  const handleChange = (e) => { const { name, value } = e.target; setSaju((prev) => ({ ...prev, [name]: value })); };
  const focusInput = (e) => { e.target.value = ""; };
  
  const handleSaveMyInfo = async () => {
    if (!user) { alert("로그인이 필요합니다!"); login(); return; }
    try {
      await setDoc(doc(db, "users", user.uid), { birthDate: inputDate, gender, isTimeUnknown, updatedAt: new Date() }, { merge: true });
      setHasSavedInfo(true); // 🔒 저장 성공 시 잠금
      alert("저장되었습니다! 이제 분석이 가능합니다.");
    } catch (error) { alert("저장 실패"); }
  };

  // 🔑 [수정] 수정하기 버튼 (잠금 해제용)
  const handleEditInfo = () => {
     if(window.confirm("정보를 수정하시겠습니까?")) {
         setHasSavedInfo(false); // 잠금 풀기
     }
  };

  const handleAiAnalysis = async () => {
    if (!user) { alert("로그인이 필요합니다."); return; }
    if (!hasSavedInfo) { alert("먼저 사주 정보를 저장해주세요."); return; }
    
    setLoading(true); setAiResult(""); setIsSuccess(false);
    try {
      const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${inputDate}, 팔자:${JSON.stringify(saju)}`;
      const langPrompt = language === "ko" ? "답변은 한국어로." : "Answer in English.";
      const fullPrompt = `${userPrompt}\n${sajuInfo}\n${langPrompt}`;
      const result = await fetchGeminiAnalysis(fullPrompt);
      setAiResult(result); setIsSuccess(true); setIsModalOpen(true);
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  };

  const handleCopyResult = async () => {
    if (!aiResult) return;
    await navigator.clipboard.writeText(aiResult);
    setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = { title: "Sajucha", text: "AI 사주 분석", url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else { await navigator.clipboard.writeText(shareData.url); alert("주소가 복사되었습니다!"); }
  };

  const saveAsImageSaju = useCallback(async () => {
    const el = document.getElementById("saju-capture");
    if (el) {
        const dataUrl = await toPng(el, { cacheBust: true, pixelRatio: 2, style: { margin: "0" }, backgroundColor: localStorage.theme === "dark" ? "#1e293b" : "#ffffff" });
        const link = document.createElement("a"); link.download = "saju.png"; link.href = dataUrl; link.click();
    }
  }, []);
  
  const saveAsImageIlju = useCallback(async () => {
    const el = document.getElementById("day-pillar-capture");
    if (el) {
        const dataUrl = await toPng(el, { cacheBust: true, pixelRatio: 2, style: { margin: "0" }, backgroundColor: localStorage.theme === "dark" ? "#1e293b" : "#ffffff" });
        const link = document.createElement("a"); link.download = "ilju.png"; link.href = dataUrl; link.click();
    }
  }, []);

  // --- CSS Classes ---
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

  // 헬퍼
  const t = (char) => language === "en" ? getEng(char) : char;

  return (
    <div className="relative px-3 py-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      
      {/* 1. 상단 패널 (로그인/설정/입력) */}
      <div className="w-full max-w-lg mb-8 p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl mx-auto">
        <div className="flex flex-col gap-5">
          
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{UI_TEXT.title[language]}</h3>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700">
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>

          {/* 언어 선택 */}
          <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
            <button onClick={() => setLanguage("en")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === "en" ? "bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-400 dark:text-gray-400 hover:text-gray-600"}`}>English</button>
            <button onClick={() => setLanguage("ko")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === "ko" ? "bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-400 dark:text-gray-400 hover:text-gray-600"}`}>한국어</button>
          </div>

          {/* 로그인 상태창 */}
          <div className="bg-indigo-50 dark:bg-slate-700/50 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/30">
             {user ? (
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {user.photoURL && <img src={user.photoURL} className="w-8 h-8 rounded-full border border-indigo-200" />}
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{user.displayName}님</span>
                            <span className="text-[10px] text-gray-400">반갑습니다!</span>
                        </div>
                    </div>
                    <button onClick={logout} className="text-xs px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 font-bold">로그아웃</button>
                 </div>
             ) : (
                 <button onClick={login} className="w-full flex items-center justify-center gap-2 py-2 bg-white rounded-lg border shadow-sm font-bold text-gray-700">
                    <span className="text-blue-500">G</span> 구글로 시작하기
                 </button>
             )}
          </div>

          {/* 성별 (저장 시 비활성화) */}
          <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">{UI_TEXT.genderLabel[language]}</label>
             <div className={`flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl ${hasSavedInfo ? 'opacity-50 pointer-events-none' : ''}`}>
               <button onClick={() => setGender("male")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender==="male" ? "bg-white text-blue-600 shadow-sm dark:bg-slate-600" : "text-gray-400"}`}>{UI_TEXT.male[language]}</button>
               <button onClick={() => setGender("female")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender==="female" ? "bg-white text-pink-500 shadow-sm dark:bg-slate-600" : "text-gray-400"}`}>{UI_TEXT.female[language]}</button>
             </div>
          </div>

          {/* 날짜 입력 (저장 시 비활성화) */}
          <div>
             <div className="flex justify-between items-end mb-2">
                <label className="text-xs font-bold text-gray-500">{UI_TEXT.birthLabel[language]}</label>
                <label className={`flex items-center gap-1 text-xs text-gray-500 cursor-pointer ${hasSavedInfo ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input type="checkbox" checked={isTimeUnknown} onChange={(e)=>setIsTimeUnknown(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-slate-700" /> 
                  {UI_TEXT.unknownTime[language]}
                </label>
             </div>
             <div className="relative">
               <input 
                 type={isTimeUnknown ? "date" : "datetime-local"}
                 value={isTimeUnknown ? inputDate.split("T")[0] : inputDate}
                 disabled={hasSavedInfo} // 🔒 잠금!
                 onChange={(e) => {
                    let val = e.target.value;
                    if(isTimeUnknown) val += "T00:00";
                    setInputDate(val);
                 }}
                 className={`w-full p-3 bg-gray-50 dark:bg-slate-900/50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white dark:[color-scheme:dark] ${hasSavedInfo ? 'opacity-50 cursor-not-allowed' : ''}`}
               />
               {hasSavedInfo && <LockClosedIcon className="w-5 h-5 absolute right-3 top-3 text-gray-400" />}
             </div>
          </div>

          {/* 저장/수정 버튼 */}
          {user && (
             <div className="flex justify-end">
                {hasSavedInfo ? (
                   <button onClick={handleEditInfo} className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-500 underline">
                     <PencilSquareIcon className="w-3 h-3"/> 수정하기
                   </button>
                ) : (
                   <button onClick={handleSaveMyInfo} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors text-sm">
                     이 정보로 저장하기 (분석 시작)
                   </button>
                )}
             </div>
          )}

          {/* 텍스트 결과 */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 text-center">
             <div className="text-lg font-extrabold text-indigo-900 dark:text-indigo-200 tracking-wider break-keep">
                {t(saju.sky3)}{t(saju.grd3)}<span className="text-xs font-normal text-indigo-400 mx-1">{UI_TEXT.year[language]}</span>
                {t(saju.sky2)}{t(saju.grd2)}<span className="text-xs font-normal text-indigo-400 mx-1">{UI_TEXT.month[language]}</span>
                {t(saju.sky1)}{t(saju.grd1)}<span className="text-xs font-normal text-indigo-400 mx-1">{UI_TEXT.day[language]}</span>
                {!isTimeUnknown && <>{t(saju.sky0)}{t(saju.grd0)}<span className="text-xs font-normal text-indigo-400 mx-1">{UI_TEXT.hour[language]}</span></>}
             </div>
          </div>

        </div>
      </div>

      {/* 2. 만세력 시각화 영역 (디자인 완벽 복원) */}
      {!!showIcons && (
        <div id="saju-capture" style={{ width: `${containerWidth}px`, maxWidth: '100%' }} className="mt-2 relative rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden m-auto transition-[width] duration-100 ease-linear py-2 bg-white dark:bg-slate-800">
           {/* 배경 레이어 (Js.jsx와 동일) */}
           {bgShow && (
             <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
                <div className={`h-1/2 w-full relative bg-gradient-to-b overflow-hidden ${theme==='dark' ? 'from-indigo-950/80 via-slate-900/70 to-blue-900/60' : 'from-sky-400/40 via-sky-200/40 to-white/5'}`}>
                   {theme==='dark' ? (
                      <>
                        <div className="absolute top-4 right-[3%] w-20 h-20 bg-blue-100 rounded-full blur-3xl opacity-20" />
                        <svg className="absolute top-6 right-[3%] w-12 h-12 text-blue-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] rotate-[-15deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        <div className="opacity-90">
                             <svg className="absolute top-10 left-10 w-4 h-4 text-white animate-pulse" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2L14.5,9.5L22,12L14.5,14.5L12,22L9.5,14.5L2,12L9.5,9.5L12,2Z" /></svg>
                             <svg className="absolute top-6 right-1/3 w-2 h-2 text-blue-200 animate-pulse delay-75" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2L14.5,9.5L22,12L14.5,14.5L12,22L9.5,14.5L2,12L9.5,9.5L12,2Z" /></svg>
                             <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse delay-300"></div>
                        </div>
                      </>
                   ) : (
                      <>
                        <div className="absolute top-2 right-[20%] w-24 h-24 bg-yellow-200 rounded-full blur-2xl opacity-60" />
                        <svg className="absolute top-2 right-[12%] w-14 h-14 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)] animate-[spin_12s_linear_infinite]" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        <svg className="absolute top-6 right-8 w-16 h-16 text-white opacity-95 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5,19c4.1,0,7.5-3.4,7.5-7.5c0-4.1-3.4-7.5-7.5-7.5c-0.4,0-0.7,0-1.1,0.1c-1-3-3.9-5.1-7.2-5.1C5.6,0,2.6,3.1,2,7.4C0.8,8,0,9.2,0,10.5C0,12.4,1.6,14,3.5,14h0.9c0.7,2.9,3.3,5,6.4,5h6.7" /></svg>
                      </>
                   )}
                </div>
                <div className={`h-1/2 w-full relative bg-gradient-to-b border-t ${theme==='dark' ? 'from-slate-800/50 to-gray-900/70 border-slate-700/30' : 'from-stone-300/40 to-amber-100/60 border-stone-400/20'}`}>
                    <div className="w-full h-full opacity-10 bg-[radial-gradient(#a8a29e_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>
             </div>
           )}

           <div className="relative z-10 flex justify-center bg-white/10 backdrop-blur-sm">
               {charShow && (
                 <div className="flex flex-col items-end pt-[10px] animate-[fadeIn_0.5s_ease-out]">
                    <div className="h-4" />
                    <div className="h-[90px] flex items-center pr-2 border-r border-sky-700/30">
                       <div className="text-right"><span className="block text-[10px] font-bold text-sky-700 opacity-80 dark:text-cyan-600">Heavenly</span><span className="block text-[10px] font-serif font-bold text-gray-700 dark:text-gray-400">Stem</span></div>
                    </div>
                    <div className="h-[110px] flex items-center pr-2 border-r border-stone-400/20">
                       <div className="text-right"><span className="block text-[10px] font-bold text-stone-500 opacity-70 dark:text-yellow-600">Earthly</span><span className="block text-[10px] font-serif font-bold text-stone-700 dark:text-gray-400">Branch</span></div>
                    </div>
                 </div>
               )}

               {/* 시주 */}
               {!isTimeUnknown && (
                <div className={pillarStyle}>
                   <div className={pillarLabelStyle}>{UI_TEXT.hour[language]}</div>
                   <div className={classNames(iconsViewStyle, saju.sky0 ? bgToBorder(sigan.color) : "border-gray-200", "rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm")}>
                      <div className="text-3xl mb-1">{getIcon(saju.sky0, 'sky')}</div>
                      {!!saju.sky0 && <><div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.sky0, 'sky')}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{t(saju.sky0)}</div></>}
                   </div>
                   <div className={classNames(iconsViewStyle, saju.grd0 ? bgToBorder(sijidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                      <div className="text-3xl mb-1">{getIcon(saju.grd0, 'grd')}</div>
                      {!!saju.grd0 && <><div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.grd0, 'grd')}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{t(saju.grd0)}</div></>}
                   </div>
                </div>
              )}

              {/* 일주 */}
              <div className={classNames(pillarStyle, bgShow ? "bg-white/90 dark:bg-white/40 border-gray-600 border-[0.5px] border-dashed rounded-md" : "bg-yellow-100/50 border-yellow-500 dark:bg-white/40 dark:border-white/70 border-[0.5px] border-dashed rounded-md")}>
                 <span className={classNames(pillarLabelStyle, "dark:!text-gray-700")}>Day</span>
                 <div className={classNames(iconsViewStyle, saju.sky1 ? bgToBorder(ilgan.color) : "border-gray-200", "rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm")}>
                    <div className="text-3xl mb-1">{getIcon(saju.sky1, 'sky')}</div>
                    {!!saju.sky1 && <><div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.sky1, 'sky')}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{t(saju.sky1)}</div></>}
                 </div>
                 <div className={classNames(iconsViewStyle, saju.grd1 ? bgToBorder(iljidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                    <div className="text-3xl mb-1">{getIcon(saju.grd1, 'grd')}</div>
                    {!!saju.grd1 && <><div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.grd1, 'grd')}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{t(saju.grd1)}</div></>}
                 </div>
              </div>

              {/* 월주 */}
              <div className={pillarStyle}>
                 <span className={pillarLabelStyle}>{UI_TEXT.month[language]}</span>
                 <div className={classNames(iconsViewStyle, saju.sky2 ? bgToBorder(wolgan.color) : "border-gray-200", "rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm")}>
                    <div className="text-3xl mb-1">{getIcon(saju.sky2, 'sky')}</div>
                    {!!saju.sky2 && <><div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.sky2, 'sky')}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{t(saju.sky2)}</div></>}
                 </div>
                 <div className={classNames(iconsViewStyle, saju.grd2 ? bgToBorder(woljidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                    <div className="text-3xl mb-1">{getIcon(saju.grd2, 'grd')}</div>
                    {!!saju.grd2 && <><div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.grd2, 'grd')}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{t(saju.grd2)}</div></>}
                 </div>
              </div>

              {/* 연주 */}
              <div className={pillarStyle}>
                 <span className={pillarLabelStyle}>{UI_TEXT.year[language]}</span>
                 <div className={classNames(iconsViewStyle, saju.sky3 ? bgToBorder(yeongan.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center py-2 shadow-sm")}>
                    <div className="text-3xl mb-1">{getIcon(saju.sky3, 'sky')}</div>
                    {!!saju.sky3 && <><div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.sky3, 'sky')}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{t(saju.sky3)}</div></>}
                 </div>
                 <div className={classNames(iconsViewStyle, saju.grd3 ? bgToBorder(yeonjidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                    <div className="text-3xl mb-1">{getIcon(saju.grd3, 'grd')}</div>
                    {!!saju.grd3 && <><div className="text-[10px] font-bold text-gray-800 dark:text-gray-300">{getHanja(saju.grd3, 'grd')}</div><div className="text-[8px] uppercase tracking-tighter text-gray-600 dark:text-gray-400">{t(saju.grd3)}</div></>}
                 </div>
              </div>
           </div>

           {/* 십성 및 신살 표시 */}
           {!!saju.sky1 && (
             <div className="flex gap-2 justify-around p-1 bg-gray-100 dark:bg-gray-400 rounded-b-md mt-2 relative z-10">
                {insu[0] && insu[0].color ? (
                   <>
                     <div className={[insu[0].color, relationStyle].join(" ")}>인수</div>
                     <div className={[sik[0].color, relationStyle].join(" ")}>식상</div>
                     <div className={[guan[0].color, relationStyle].join(" ")}>관성</div>
                     <div className={[jae[0].color, relationStyle].join(" ")}>재성</div>
                   </>
                ) : <div>-</div>}
                <div className={["border-l-4 border-red-500", relationStyle].join(" ")}>공망</div>
                <div className={["border-r-4 border-blue-500", relationStyle].join(" ")}>천을</div>
             </div>
           )}
        </div>
      )}

      {/* 2번째 캡처용 (일주만) */}
      {!!showIcons && (
          <div className="flex flex-col items-center mt-2 sr-only">
              <div id="day-pillar-capture" className={classNames(pillarStyle, bgShow ? "bg-white dark:bg-gray-400" : "bg-yellow-50 dark:bg-gray-400")}>
                  <span className={classNames(pillarLabelStyle, "dark:!text-gray-500")}>Day</span>
                  <div className={classNames(iconsViewStyle, saju.sky1 ? bgToBorder(ilgan.color) : "border-gray-200", "rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm")}>
                     <div className="text-3xl mb-1">{getIcon(saju.sky1, 'sky')}</div>
                  </div>
                  <div className={classNames(iconsViewStyle, saju.grd1 ? bgToBorder(iljidata.color) : "border-gray-200", "rounded-md w-16 flex flex-col items-center justify-center shadow-sm")}>
                     <div className="text-3xl mb-1">{getIcon(saju.grd1, 'grd')}</div>
                  </div>
              </div>
          </div>
      )}

      {/* 3. 하단 통합 컨트롤 패널 */}
      {false && !!saju.sky1 && (
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

      {/* 4. AI 분석 버튼 (잠금 상태에 따라 비활성화) */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 max-w-xl m-auto px-4">
         <div className="relative">
            <button onClick={handleAiAnalysis} 
               disabled={loading || !saju.sky3 || !hasSavedInfo} 
               className={`w-full h-12 rounded-xl font-bold shadow-lg transition-all duration-500 overflow-hidden relative group ${loading ? "bg-gray-100 dark:bg-slate-700 cursor-wait" : isSuccess ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-[1.02]" : (!user || !hasSavedInfo) ? "bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:scale-[1.02]"}`}>
               {loading && <div className="absolute top-0 left-0 h-full bg-indigo-200/50 dark:bg-indigo-500/30 transition-all duration-300 ease-out" style={{width:`${progress}%`}} />}
               <span className={`relative z-10 flex justify-center items-center gap-2 ${loading ? "text-indigo-600 dark:text-indigo-300" : ""}`}>
                  {loading ? (
                     <>
                       <svg className="animate-spin h-5 w-5 min-w-[20px]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       <span className="text-xs sm:text-sm truncate px-1">{getLoadingText(progress, language)} ({Math.round(progress)}%)</span>
                     </>
                  ) : isSuccess ? (
                     <div className="flex items-center gap-2 animate-[fadeIn_0.5s_ease-out]"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg><span>Analyze Complete!</span></div>
                  ) : !user ? (
                     <span>🔒 로그인 후 이용해주세요</span>
                  ) : !hasSavedInfo ? (
                     <span>⚠️ 사주 정보를 먼저 저장해주세요</span>
                  ) : (
                     <span>{UI_TEXT.analyzeBtn[language]}</span>
                  )}
               </span>
            </button>
         </div>

         {/* 5. 결과 모달 */}
         {isModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={()=>setIsModalOpen(false)} />
                 <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] dark:text-white">
                     <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md sticky top-0 z-10">
                        <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">{UI_TEXT.modalTitle[language]}</h3>
                        <div className="flex gap-2">
                           <button onClick={handleCopyResult} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isCopied ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300"}`}>{isCopied ? UI_TEXT.copiedBtn[language] : UI_TEXT.copyBtn[language]}</button>
                           <button onClick={()=>setIsModalOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full text-gray-500 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                     </div>
                     <div className="p-6 overflow-y-auto custom-scrollbar">
                        <div className="prose prose-indigo dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">{aiResult}</div>
                     </div>
                     <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50 flex justify-end">
                        <button onClick={handleShare} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>{UI_TEXT.shareBtn[language]}</button>
                     </div>
                 </div>
             </div>
         )}
      </div>

    </div>
  );
}