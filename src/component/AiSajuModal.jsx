import { aiSajuStyle, IljuExp } from '../data/aiResultConstants';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ShareIcon, SparklesIcon, BoltIcon } from '@heroicons/react/24/outline';
import { doc, getDoc, setDoc, arrayUnion, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase'; // firebase db import 필요
import { fetchGeminiAnalysis } from '../api/gemini'; // API 호출 import 필요
import { UI_TEXT, langPrompt, hanja } from '../data/constants';
import { iljuNameList } from '../data/iljuNameList';
import { classNames, getIcon, getHanja, getEng, bgToBorder } from '../utils/helpers';
import { iconsViewStyle } from '../data/style';
import sajaProfile from '../assets/sajaProfile.png';
import { useLanguage } from '../context/useLanguageContext';
import { useAuthContext } from '../context/useAuthContext';
import { useShareActions } from '../hooks/useShareAction';
import BasicAna from './BasicAna';

export default function ResultModal({
  isOpen,
  onClose,
  isLocked,
  editCount,
  setEditCount, // 카운트 업데이트를 위해 필요
  maxEditCount,
  saju,
  inputDate, // 채팅 프롬프트용
  gender, // 채팅 프롬프트용
  processedData,
  isTimeUnknown,
  resultType,
  aiResult,
}) {
  // --- Local States (App에서 가져옴) ---
  const [viewMode, setViewMode] = useState('result');
  const [chatList, setChatList] = useState([]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [qLoading, setQLoading] = useState(false);
  const { isCopied, handleCopyResult, handleShare } = useShareActions(aiResult);
  const chatEndRef = useRef(null);
  const { language } = useLanguage();
  const { user } = useAuthContext();
  // --- Helpers ---
  const t = (char) => (language === 'en' ? getEng(char) : char);

  const handleShareResult = async (resultText) => {
    try {
      // 0. 내용 확인
      if (!resultText || resultText.trim() === '') {
        return alert('공유할 분석 결과가 없습니다.');
      }

      // --- 🎯 새로 추가된 Firestore 카운팅 로직 시작 🎯 ---

      // 현재 날짜를 YYYY-MM-DD 형식 (예: '2025-12-12')으로 가져옵니다.
      const today = new Date().toLocaleDateString('en-CA');

      // 데이터베이스 필드 경로를 동적으로 구성합니다. (예: '2025-12-12.premium_analysis')
      const fieldPath = `shared.${today}.${resultType}`;

      if (user && db && resultType) {
        try {
          const userRef = doc(db, 'users', user.uid);

          // updateDoc과 increment를 사용하여 원자적으로 카운트를 1 증가시킵니다.
          // 해당 필드가 없으면 자동으로 1로 생성됩니다.
          await updateDoc(userRef, {
            [fieldPath]: increment(1),
          });

          console.log(`[${today}] ${resultType} 공유 카운트 +1 성공`);
        } catch (e) {
          console.error('Firestore 카운트 업데이트 실패:', e);
          // 카운트 실패는 공유 흐름을 중단시키지 않습니다.
        }
      } else {
        console.warn('사용자 정보, DB 또는 resultType이 없어 카운트 업데이트를 건너뜜.');
      }

      // --- 🎯 새로 추가된 Firestore 카운팅 로직 끝 🎯 ---

      let plainText = resultText;

      // 1. HTML 태그 제거 로직 (안전장치 포함)
      const hasHtmlTags = /<[a-z][\s\S]*>/i.test(resultText);
      if (hasHtmlTags) {
        try {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = resultText;
          const extractedText = tempDiv.textContent || tempDiv.innerText || '';
          if (extractedText.trim().length > 0) {
            plainText = extractedText;
          }
        } catch (e) {
          console.error('HTML 파싱 에러, 원본 사용', e);
          plainText = resultText;
        }
      }

      // 2. 텍스트 정리
      plainText = plainText
        .replace(/(\s*\n\s*){2,}/g, '\n\n') // 2줄 이상 빈 줄을 한 줄로
        .replace(/ {2,}/g, ' ') // 2칸 이상 공백을 한 칸으로
        .trim(); // 앞뒤 공백 제거

      // 3. 🔗 주소를 텍스트 뒤에 아예 합쳐버림 (공유 텍스트 생성)
      const currentUrl = window.location.href;
      const shareTitle =
        language === 'ko'
          ? '🦁사자사주가 보는 천기누설 맞춤 사주해석🦁'
          : '🦁Saza Analysis Result🦁';
      const finalShareText = `${shareTitle}\n🔗${currentUrl}\n\n${plainText}`;

      // 4. 공유 실행
      if (navigator.share) {
        await navigator.share({
          title: language === 'ko' ? '사자(Saza) 사주 분석' : 'Saza Analysis Result',
          text: finalShareText, // url 속성 대신 text에 모두 합친 내용을 사용
        });
      } else {
        // PC 환경: 클립보드 복사
        await navigator.clipboard.writeText(finalShareText);
        alert(
          language === 'ko'
            ? '결과와 주소가 클립보드에 복사되었습니다.'
            : 'Result and link copied to clipboard!',
        );
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('공유 실패:', error);
        alert('공유하기를 실패했습니다.');
      }
    }
  };

  // 모달이 열릴 때마다 'result' 모드로 초기화
  useEffect(() => {
    if (isOpen) {
      setViewMode('result');
      setChatList([]); // 채팅 기록도 초기화 (선택사항, 안하면 이전 기록 남음)
    }
  }, [isOpen]);
  function extractPureHtml(apiResponse) {
    // 1. 문자열의 양쪽 끝에서 공백, 개행 문자를 제거합니다.
    let cleanedResponse = apiResponse.trim();

    // 2. 앞에 붙은 '```html' 또는 '```'와 뒤에 붙은 '```'를 제거합니다.
    // 이는 API가 어떤 형태의 코드 블록을 사용하든 처리합니다.
    const startMarker = /^\s*```html\s*|^\s*```\s*/i; // 앞에 붙은 ```html 또는 ``` 제거 (대소문자 무시)
    const endMarker = /\s*```\s*$/; // 뒤에 붙은 ``` 제거

    cleanedResponse = cleanedResponse.replace(startMarker, '');
    cleanedResponse = cleanedResponse.replace(endMarker, '');

    // 3. 다시 한 번 앞뒤 공백을 정리하고 반환합니다.
    return cleanedResponse.trim();
  }

  const pureHtml = extractPureHtml(aiResult);

  useEffect(() => {
    if (viewMode === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatList, qLoading, viewMode]);

  // 구조분해 할당
  const { sigan, ilgan, wolgan, yeongan, sijidata, iljidata, woljidata, yeonjidata } =
    processedData;

  // --- Logic Functions (Moved from App) ---

  const createSajuKey = (targetSaju) => {
    if (!targetSaju || !targetSaju.grd1) return null;
    return [
      targetSaju.sky0,
      targetSaju.grd0,
      targetSaju.sky1,
      targetSaju.grd1,
      targetSaju.sky2,
      targetSaju.grd2,
      targetSaju.sky3,
      targetSaju.grd3,
    ].join('-');
  };

  const getInitialGreeting = (lang, bDate, tSaju, tFunc) => {
    const formattedDate = bDate.replace('T', ' ');
    const sajuText = `${tFunc(tSaju.sky3)}${tFunc(tSaju.grd3)}년 ${tFunc(tSaju.sky2)}${tFunc(tSaju.grd2)}월 ${tFunc(tSaju.sky1)}${tFunc(tSaju.grd1)}일 ${tFunc(tSaju.sky0)}${tFunc(tSaju.grd0)}시`;
    const sajuTextEng = `Year:${tFunc(tSaju.sky3)}${tFunc(tSaju.grd3)} Month:${tFunc(tSaju.sky2)}${tFunc(tSaju.grd2)} Day:${tFunc(tSaju.sky1)}${tFunc(tSaju.grd1)} Time:${tFunc(tSaju.sky0)}${tFunc(tSaju.grd0)}`;

    if (lang === 'ko') {
      return `안녕하세요. 사자입니다.\n\n당신이 입력한 생년월일·시 [${formattedDate}]와\n만세력 데이터 [${sajuText}]를 기반으로 운세를 분석합니다.\n\n질문을 하시면 하루에 사용 가능한 토큰이 1개씩 차감됩니다.\n오늘 남은 토큰을 소중하게 사용해 주세요.\n\n준비되셨다면, 알고 싶은 것을 질문해 주세요.`;
    } else {
      return `Hello, I am your Saju Master.\n\nI analyze your fortune based on your birth data [${formattedDate}]\nand Four Pillars [${sajuTextEng}].\n\nEach time you ask a question, one token from your daily limit will be deducted.\nPlease use your remaining tokens wisely.\n\nWhen you’re ready, ask your first question.`;
    }
  };

  // 채팅 모드로 전환 및 기록 불러오기
  const handleSetViewMode = async (mode) => {
    setViewMode(mode);

    if (mode === 'chat' && user) {
      setQLoading(true);
      const currentSajuKey = createSajuKey(saju);
      const greetingMsg = getInitialGreeting(language, inputDate, saju, t);
      const greetingObj = { role: 'ai', text: greetingMsg };

      if (currentSajuKey) {
        try {
          // DB에서 사용자 데이터 가져오기 (userData가 props로 없으므로 직접 fetch or props로 받을 수도 있음)
          // 여기서는 최신 데이터를 위해 fetch 권장
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          const data = userSnap.exists() ? userSnap.data() : {};

          const sajuRecords = data.chat_records || {};
          let currentSajuHistory = sajuRecords[currentSajuKey] || [];
          currentSajuHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          let historyList = currentSajuHistory
            .map((item) => [
              { role: 'user', text: item.question },
              { role: 'ai', text: item.answer },
            ])
            .flat();

          setChatList([greetingObj, ...historyList]);
        } catch (error) {
          setChatList([greetingObj]);
        }
      } else {
        setChatList([greetingObj]);
      }
      setQLoading(false);
    }
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

    await setDoc(
      userDocRef,
      {
        chat_records: sajuRecords,
        updatedAt: new Date(),
        dailyUsage: {
          [new Date().toLocaleDateString('en-CA')]: editCount + 1, // 오늘 날짜 카운트 +1
        },
      },
      { merge: true },
    );
  };

  // 추가 질문하기 (API 호출)
  const handleAdditionalQuestion = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (editCount >= maxEditCount) return alert(UI_TEXT.limitReached[language]);
    if (!customQuestion.trim()) return alert('질문을 입력해주세요.');

    const myQuestion = customQuestion;
    setChatList((prev) => [...prev, { role: 'user', text: myQuestion }]);
    setCustomQuestion('');
    setQLoading(true);

    const currentSajuKey = createSajuKey(saju);

    try {
      const currentSajuJson = JSON.stringify(saju);
      const sajuInfo = `[사주정보] 성별:${gender}, 생년월일:${inputDate}, 팔자:${currentSajuJson}`;
      const todayInfo = `오늘 날짜가 ${new Date()}임을 고려해줘. 2025년은 을사년, 2026년은 병오년.`;
      const fullPrompt = `${myQuestion}\n${sajuInfo}\n${langPrompt(language)}\n${hanja(language)}\n${todayInfo}`;

      // API 호출
      const result = await fetchGeminiAnalysis(fullPrompt);
      const newCount = editCount + 1;

      const newQuestionLog = {
        question: myQuestion,
        sajuKey: currentSajuKey,
        timestamp: new Date().toISOString(),
        id: Date.now(),
      };

      // DB 업데이트 (카운트 + 질문로그)
      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: newCount,
          lastEditDate: new Date().toLocaleDateString('en-CA'),
          question_history: arrayUnion(newQuestionLog),
        },
        { merge: true },
      );

      // App 상태 업데이트
      setEditCount(newCount);

      // 채팅 기록 저장
      if (currentSajuKey) {
        await saveAndCapChatRecord(user.uid, currentSajuKey, myQuestion, result);
      }

      setChatList((prev) => [...prev, { role: 'ai', text: result }]);
    } catch (e) {
      setChatList((prev) => [...prev, { role: 'ai', text: 'Error: 분석에 실패했습니다.' }]);
    } finally {
      setQLoading(false);
    }
  };

  // 모달 렌더링 시작
  if (!isOpen) return null;

  const aiName = language === 'ko' ? '사자' : 'Master saza';
  const userName = user?.displayName || (language === 'ko' ? '나' : 'Me');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:text-gray-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-2">
            {viewMode === 'chat' && (
              <button
                onClick={() => setViewMode('result')}
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
                  <BoltIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-extrabold text-gray-700 dark:text-gray-200 font-mono tracking-tight">
                    {maxEditCount - editCount}
                    <span className="text-gray-300 dark:text-gray-600 mx-0.5 font-normal">/</span>
                    <span className="text-gray-400 dark:text-gray-500 font-medium">
                      {maxEditCount}
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
            <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-slate-700 rounded-full">
              ✕
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar (Saju Visualization) - 코드가 길어 생략하지 않고 그대로 둡니다 */}
          <div className="hidden md:flex md:w-[160px] flex-shrink-0 bg-gray-50 dark:bg-slate-900/50 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 overflow-y-auto custom-scrollbar p-4 flex md:flex-col flex-row items-center justify-center gap-2">
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
            {/* ... Other Pillars (Day, Month, Year) ... */}
            {/* ... (이전 코드의 Four Pillars 시각화 부분과 동일) ... */}
            {/* 생략 없이 필요한 경우 이전 답변의 코드를 그대로 사용하세요. 여기서는 핵심 로직 변경에 집중합니다. */}
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
            {/* Month */}
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
            {/* Year */}
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

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 h-full overflow-hidden">
            {/* VIEW MODE: RESULT */}
            {viewMode === 'result' && (
              <>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  {resultType === 'main' && (
                    <>
                      <div className="text-center mb-8 mt-2 animate-fade-in-up">
                        <p className="text-xs font-bold text-indigo-400 dark:text-indigo-400 tracking-[0.2em] uppercase mb-2">
                          Destiny Analysis
                        </p>
                        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-300 dark:via-violet-300 dark:to-indigo-300 drop-shadow-sm">
                          {language === 'ko' ? '사주 정밀 분석' : 'Life Path Decoding'}
                        </h1>
                        <div className="flex justify-center gap-2 mt-4 opacity-50">
                          <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                          <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                          <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                        </div>
                      </div>

                      <BasicAna
                        inputGender={gender}
                        inputDate={inputDate}
                        isTimeUnknown={isTimeUnknown}
                      />
                    </>
                  )}
                  {resultType === 'year' && (
                    <div>
                      <div className="text-center mb-8 mt-2 animate-fade-in-up">
                        <p className="text-xs font-bold text-indigo-400 dark:text-indigo-400 tracking-[0.2em] uppercase mb-2">
                          Prepare For Next Year
                        </p>
                        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-300 dark:via-violet-300 dark:to-indigo-300 drop-shadow-sm">
                          {language === 'ko' ? '2026년 신년운세' : '2026 Path Guide'}
                        </h1>
                        {/* Decoration dots */}
                        <div className="flex justify-center gap-2 mt-4 opacity-50">
                          <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                          <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                          <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                        </div>
                      </div>
                      <div>
                        <div dangerouslySetInnerHTML={{ __html: pureHtml }} />

                        <div
                          dangerouslySetInnerHTML={{
                            __html: aiSajuStyle,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {resultType === 'daily' && (
                    <div>
                      <div className="text-center mb-8 mt-2 animate-fade-in-up">
                        <p className="text-xs font-bold text-indigo-400 dark:text-indigo-400 tracking-[0.2em] uppercase mb-2">
                          Your Saju Daily
                        </p>
                        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-300 dark:via-violet-300 dark:to-indigo-300 drop-shadow-sm">
                          {language === 'ko' ? '오늘의 운세' : "Today's Luck"}
                        </h1>
                        {/* Decoration dots */}
                        <div className="flex justify-center gap-2 mt-4 opacity-50">
                          <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                          <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                          <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                        </div>
                      </div>
                      <div>
                        <div dangerouslySetInnerHTML={{ __html: pureHtml }} />

                        <div
                          dangerouslySetInnerHTML={{
                            __html: aiSajuStyle,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => handleShareResult(pureHtml)}
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
                  {/* Same Vibe List */}
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

                {/* Bottom Action Bar */}
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

            {/* VIEW MODE: CHAT */}
            {viewMode === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5 bg-gray-50 dark:bg-slate-900/20">
                  {chatList.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-[fadeIn_0.3s_ease-out]`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {isUser ? (
                            <img
                              src={user?.photoURL}
                              alt="User"
                              className="w-10 h-10 rounded-full shadow-sm border border-gray-200 dark:border-gray-600 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br dark:from-indigo-500 dark:to-purple-600 flex items-center justify-center dark:shadow-sm border dark:border-indigo-400/30 shadow-md">
                              <img
                                src={sajaProfile}
                                alt="Master"
                                className="w-10 h-10 rounded-full shadow-sm object-cover"
                              />
                            </div>
                          )}
                        </div>
                        <div
                          className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}
                        >
                          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1 mr-1">
                            {isUser ? userName : aiName}
                          </span>
                          <div
                            className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap break-words ${isUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none prose prose-sm dark:prose-invert max-w-none shadow-md'}`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {qLoading && (
                    <div className="flex items-start gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br dark:from-indigo-500 dark:to-purple-600 flex items-center justify-center dark:shadow-sm border dark:border-indigo-400/30 shadow-md">
                        <img
                          src={sajaProfile}
                          alt="Master"
                          className="w-10 h-10 rounded-full shadow-sm object-cover"
                        />
                      </div>
                      <div className="flex flex-col items-start max-w-[85%]">
                        <span className="text-[11px] font-bold text-gray-400 mb-1 ml-1">
                          {aiName}
                        </span>
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

                {/* Input Area */}
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
                        e.key === 'Enter' && !qLoading && !isLocked && handleAdditionalQuestion()
                      }
                      disabled={isLocked || qLoading}
                      className="w-full pl-5 pr-28 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white disabled:opacity-60 transition-all"
                    />
                    <button
                      onClick={handleAdditionalQuestion}
                      disabled={isLocked || !customQuestion.trim() || qLoading}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 h-9 px-3 rounded-xl transition-all flex items-center gap-2 ${isLocked || !customQuestion.trim() || qLoading ? 'text-gray-400 bg-gray-200 dark:bg-slate-700 cursor-not-allowed' : 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95'}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                      </svg>
                      <div
                        className={`flex items-center gap-1 pl-2 border-l ${!customQuestion.trim() ? 'border-gray-400/50' : 'border-indigo-400'}`}
                      >
                        <div
                          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${!customQuestion.trim() ? 'bg-transparent' : 'bg-black/20'}`}
                        >
                          <span
                            className={`text-[11px] font-black leading-none pt-[1px] font-mono ${!customQuestion.trim() ? 'text-gray-500' : 'text-amber-300 drop-shadow-sm'}`}
                          >
                            -1
                          </span>
                          <BoltIcon
                            className={`w-3.5 h-3.5 ${!customQuestion.trim() ? 'text-gray-400' : 'text-amber-400 fill-amber-400'}`}
                          />
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
