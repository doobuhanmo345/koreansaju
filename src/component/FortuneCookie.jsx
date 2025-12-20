import { useUsageLimit } from '../context/useUsageLimit';
import { useAuthContext } from '../context/useAuthContext';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useState } from 'react';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import './FortuneCookie.css';
import { FORTUNE_DB, FORTUNE_DB_KR } from '../data/fortuneCookie';

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

export default function FortuneCookie({ setAiResult }) {
  const { editCount, setEditCount, MAX_EDIT_COUNT, incrementUsage, checkLimit } = useUsageLimit();
  const { language } = useLanguage();
  const { user, userData } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [fortuneMessage, setFortuneMessage] = useState('');
  const [rewardAmount, setRewardAmount] = useState(0);
  const [showCoin, setShowCoin] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-CA');

  const handleFortuneCookie = async (index) => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (loading) return;

    setAiResult('');
    setSelectedId(index);
    setLoading(true);

    try {
      const data = userData || {};
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
          ZCookie: { today: todayStr, msg: resultMsg },
          dailyUsage: { [new Date().toLocaleDateString('en-CA').fCookie]: 1 },
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
      <div className="flex items-center justify-center">
        {!loading && !fortuneMessage && userData?.ZCookie?.today === todayStr ? (
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
                {userData.ZCookie.msg}
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
              <div className="fortune-result-wrapper fade-in">
                {showCoin && <div className="flying-coin-animation">⚡</div>}
                <div className="bg-[#fff9e7] dark:bg-gray-800 border-2 border-[#ffedad] dark:border-amber-900/30 px-[30px] py-[40px] rounded-[32px] max-w-[380px] shadow-[0_20px_50px_rgba(108,71,255,0.15)] relative flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                  <div className="text-[54px] mb-6 drop-shadow-md">
                    🥠<span className="animate-pulse">✨</span>
                  </div>
                  <p className="text-[#5d4037] dark:text-amber-100 text-xl font-bold leading-relaxed mb-8 break-keep">
                    {fortuneMessage}
                  </p>
                  <div className="w-full bg-white/60 dark:bg-gray-700/50 rounded-2xl py-4 px-6 border border-[#ffedad] dark:border-amber-900/30">
                    <div className="text-sm text-[#8d6e63] dark:text-amber-200/70 mb-1 font-medium">
                      {language === 'en' ? 'Reward Earned!' : '상금 획득!'}
                    </div>
                    <div className="text-lg text-gray-800 dark:text-gray-100">
                      {language === 'en' ? (
                        <>
                          Saved{' '}
                          <span className="font-black text-[#6c47ff] dark:text-indigo-400 text-xl">
                            {rewardAmount}
                          </span>{' '}
                          credits!
                        </>
                      ) : (
                        <>
                          크레딧{' '}
                          <span className="font-black text-[#6c47ff] dark:text-indigo-400 text-xl">
                            {rewardAmount}
                          </span>
                          개 세이브!
                        </>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-4 right-6 text-2xl opacity-20 select-none">🍀</div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-6 text-gray-600 dark:text-gray-400 font-medium">
                  {language === 'en'
                    ? 'Choose a cookie to check your fortune!'
                    : '운명을 확인할 쿠키 하나를 선택하세요!'}
                </p>
                <div className="flex flex-col sm:flex-row gap-8 items-center justify-center">
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
    </>
  );
}
