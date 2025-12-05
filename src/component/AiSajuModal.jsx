import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ShareIcon, SparklesIcon, BoltIcon } from '@heroicons/react/24/outline';
import { IljuExp, UI_TEXT } from '../data/constants';
import { getIcon, getHanja, bgToBorder } from '../utils/helpers';
import { useShareActions } from '../hooks/useShareAction';
export default function AiSajuModal({ saju, language, isLocked }) {
  const aiResult = 'd';
  const [qLoading, setQLoading] = useState(false);
  const [resultType, setResultType] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [viewMode, setViewMode] = useState('result');
  const { isCopied, handleCopyResult, handleShare } = useShareActions(aiResult);

  const handleAdditionalQuestion = async () => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (isLocked) return alert(UI_TEXT.limitReached[language]);
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
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatList, qLoading]);
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:text-gray-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => closeModal()} />
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
                    <span className="text-gray-300 dark:text-gray-600 mx-0.5 font-normal">/</span>
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
                        e.key === 'Enter' && !qLoading && !isLocked && handleAdditionalQuestion()
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
  );
}
