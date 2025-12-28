import { useUsageLimit } from '../context/useUsageLimit';
import { useAuthContext } from '../context/useAuthContext';
import { setDoc, doc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useState } from 'react';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import './FortuneCookie.css';
import { FORTUNE_DB, FORTUNE_DB_KR } from '../data/fortuneCookie';
import { BoltIcon } from '@heroicons/react/24/outline';
import CreditIcon from '../ui/CreditIcon';
const getLuckyResult = (lang) => {
  const rand = Math.floor(Math.random() * 200) + 1;
  const db = lang === 'en' ? FORTUNE_DB : FORTUNE_DB_KR;

  if (rand <= 6) {
    return {
      reduction: 5,
      msg: db.super[Math.floor(Math.random() * db.super.length)],
      type: 'SUPER',
    };
  } else if (rand <= 20) {
    return {
      reduction: 3,
      msg: db.lucky[Math.floor(Math.random() * db.lucky.length)],
      type: 'LUCKY',
    };
  } else {
    return {
      reduction: 1,
      msg: db.normal[Math.floor(Math.random() * db.normal.length)],
      type: 'NORMAL',
    };
  }
};

export default function FortuneCookie({}) {
  const { editCount, setEditCount, MAX_EDIT_COUNT, incrementUsage, checkLimit } = useUsageLimit();
  const { language } = useLanguage();
  const { user, userData } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [fortuneMessage, setFortuneMessage] = useState('');
  const [rewardAmount, setRewardAmount] = useState(0);
  const [showCoin, setShowCoin] = useState(false);
  // 초기 상태를 체크해서 이미 받았으면 바로 'selection'으로 보냅니다.
  const todayStr = new Date().toLocaleDateString('en-CA');

  const [step, setStep] = useState(() => {
    // 진입 시점에 이미 오늘 날짜의 쿠키 데이터가 있다면 'selection' 단계로 시작
    return userData?.usageHistory?.ZCookie?.today === todayStr ? 'selection' : 'intro';
  });

  // 인트로에서 시작하기 버튼 클릭 시
  const handleStart = () => {
    setStep('selection');
  };

  const handleFortuneCookie = async (index) => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (loading) return;

    setSelectedId(index);
    setLoading(true);

    try {
      const data = userData.usageHistory || {};
      const currentCount = data.editCount || 0;
      const { today: today } = data.ZCookie || {};

      if (today === todayStr) {
        setLoading(false);
        setSelectedId(null);
        return alert(
          language === 'en'
            ? 'Already claimed! See you tomorrow.'
            : '오늘의 보너스 수령완료! 내일 다시 찾아주세요.',
        );
      }

      const result = getLuckyResult(language);
      const reductionAmount = result.reduction;
      const resultMsg = result.msg;
      const newCount = currentCount - reductionAmount;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: newCount,
          lastEditDate: new Date().toLocaleDateString('en-CA'),
          usageHistory: { ZCookie: { today: todayStr, msg: resultMsg } },
          dailyUsage: { [new Date().toLocaleDateString('en-CA')]: increment(1) },
        },
        { merge: true },
      );

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setEditCount(newCount);
      setFortuneMessage(resultMsg);
      setRewardAmount(reductionAmount);
      setShowCoin(true);

      setTimeout(() => {
        setEditCount(newCount);
      }, 600);
    } catch (e) {
      alert(`Error: ${e.message}`);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-2 mt-2 animate-fade-in-up">
        <p className="text-xs font-bold text-indigo-400 dark:text-indigo-400 tracking-[0.2em] uppercase mb-2">
          get Extra Credit
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-300 dark:via-violet-300 dark:to-indigo-300 drop-shadow-sm">
          {language === 'ko' ? '포춘쿠키' : 'Fortune Cookie'}
        </h1>

        <div className="flex justify-center gap-2 mt-4 opacity-50">
          <div className="w-1 h-1 rounded-full bg-indigo-400"></div> 
          <div className="w-1 h-1 rounded-full bg-indigo-400"></div>     
          <div className="w-1 h-1 rounded-full bg-indigo-400"></div>               
        </div>
      </div>
      {step === 'intro' ? (
        <div className="flex flex-col items-center text-center px-6 animate-in fade-in zoom-in-95 duration-700">
          <p className="mb-2 text-slate-800 dark:text-white mb-space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed break-keep">
            포춘쿠키로 운세 보고 최대 5 크레딧 추가 획득!
          </p>
          <div>
            <CreditIcon num={`최대 +5`} />
          </div>
          <div className="m-auto max-w-sm rounded-2xl overflow-hidden ">
            <img
              src="/images/introcard/cookie_2.png"
              alt="cookie started"
              className="w-full h-auto"
            />
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform active:scale-95"
          >
            {language === 'ko' ? '쿠키 고르러 가기' : 'Pick a Cookie'}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {!loading && !fortuneMessage && userData?.usageHistory?.ZCookie?.today === todayStr ? (
            <div className="animate-in fade-in duration-700 flex flex-col items-center my-6">
              <div className="fortune-label mb-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs font-bold rounded-full shadow-sm border border-amber-200 dark:border-amber-800">
                {language === 'en' ? "Today's Message" : '오늘의 메시지'}
              </div>
              <div className="fortune-paper relative bg-[#fffdf5] dark:bg-gray-800 px-8 py-10 rounded-sm shadow-[0_4px_10px_rgba(0,0,0,0.1)] border-t-4 border-amber-400 max-w-sm w-full text-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] dark:invert"></div>
                <span className="absolute top-4 left-4 text-4xl text-amber-200 dark:text-amber-900/50 font-serif leading-none select-none">
                  “
                </span>
                <p className="relative z-10 text-gray-700 dark:text-gray-200 text-lg font-medium leading-relaxed break-keep">
                  {userData.usageHistory.ZCookie.msg}
                </p>
                <span className="absolute bottom-2 right-4 text-4xl text-amber-200 dark:text-amber-900/50 font-serif leading-none select-none">
                  ”
                </span>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[radial-gradient(circle,theme(colors.amber.200)_1px,transparent_1px)] dark:bg-[radial-gradient(circle,theme(colors.amber.900)_1px,transparent_1px)] bg-[length:8px_8px]"></div>
              </div>
            </div>
          ) : (
            <>
              {fortuneMessage ? (
                <div className="fortune-result-wrapper fade-in max-w-lg m-auto">
                  {showCoin && <div className="flying-coin-animation">⚡</div>}
                  <div className="text-center">
                    <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                      <img
                        src="/images/introcard/cookie_result.png"
                        alt="cookie result"
                        className="w-full h-auto"
                      />
                    </div>
                    <p className="text-[#5d4037] dark:text-amber-100 text-xl font-bold leading-relaxed mb-3 break-keep">
                      {fortuneMessage}
                    </p>
                    <div className="text-lg text-gray-800 dark:text-gray-100 text-center">
                      {language === 'en' ? (
                        <>
                          <div>
                            <span
                              className="
    inline-flex items-center gap-1.5 
    /* 라이트 모드 디자인 */
    bg-amber-50 text-amber-700 border border-amber-200 
    /* 다크 모드 디자인 (어두운 배경에 대비되게) */
    dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50 
    /* 공통 스타일: 둥글게, 글자 크기, 여백, 그림자 */
    py-1 px-3.5 rounded-md text-[13px] font-bold shadow-sm
    transition-all duration-300
  "
                            >
                              {/* 아이콘 부분: 살짝 애니메이션을 줘서 생동감 있게 */}
                              <BoltIcon className="h-4 w-4 fill-amber-500 dark:fill-amber-400 animate-pulse" />

                              <span className="tracking-tight">
                                + {rewardAmount}{' '}
                                <span className="text-[11px] opacity-80 ml-0.5 font-medium">
                                  Credit saved
                                </span>
                              </span>
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <CreditIcon num={-1} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className=" text-gray-600 dark:text-gray-400 font-medium">
                    {language === 'en' ? (
                      'Choose a cookie to check your fortune!'
                    ) : (
                      <>
                        <p>오늘의 격언을 담은</p>
                        <p>
                          포춘 쿠키 <strong>하나를 골라주세요</strong>
                        </p>
                      </>
                    )}
                  </p>
                  <div className="m-auto max-w-sm rounded-2xl overflow-hidden">
                    <img
                      src="/images/introcard/cookie_1.png"
                      alt="select cookie"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="flex gap-8 items-center justify-center ">
                    {[0, 1, 2].map((idx) => (
                      <div
                        key={idx}
                        onClick={() => handleFortuneCookie(idx)}
                        className={`
                        flex flex-col items-center cursor-pointer transition-all duration-300
                        ${selectedId === idx && loading ? 'animate-bounce' : 'hover:scale-110'}
                        ${selectedId !== null && selectedId !== idx ? 'opacity-40 grayscale blur-[1px]' : 'opacity-100'}
                      `}
                      >
                        <div
                          className={`scale-[1.1] text-[72px] drop-shadow-lg ${selectedId === idx && loading ? 'animate-pulse' : ''}`}
                        >
                          🥠
                        </div>
                        <div className="w-[40px] h-[8px] bg-black/5 dark:bg-white/10 rounded-[50%] mt-2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
