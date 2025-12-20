import { useUsageLimit } from '../context/useUsageLimit';
import { useAuthContext } from '../context/useAuthContext';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useState } from 'react';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import './FortuneCookie.css';
const FORTUNE_DB = {
  // 대박 (-5 감소): 6/200 확률
  super: [
    '🎉 [대박] 믿을 수 없는 행운! 오늘 하루는 당신의 것입니다.',
    '🌟 [대박] 귀인이 찾아옵니다. 크레딧 대폭 할인!',
    '💎 [대박] 생각지도 못한 기회가 문을 두드립니다.',
    // ... 더 추가하여 총 6개 이상의 문구 준비
  ],
  // 중박 (-3 감소): 14/200 확률
  lucky: [
    '🍀 [행운] 기분 좋은 소식이 들려올 거예요.',
    '✨ [행운] 작은 노력으로 큰 성과를 얻을 날입니다.',
    '🌈 [행운] 고민하던 일이 술술 풀릴 징조입니다.',
    // ... 더 추가
  ],
  // 일반 (-1 감소): 180/200 확률
  normal: [
    '☕ 잠시 휴식을 취하면 더 멀리 갈 수 있습니다.',
    '📚 배움에는 끝이 없습니다. 오늘도 성장하세요.',
    '🏃‍♂️ 천리길도 한 걸음부터. 꾸준함이 답입니다.',
    '🌞 긍정적인 마음이 행운을 불러옵니다.',
    '🧹 주변을 정리해보세요. 마음도 맑아집니다.',
    // ... 나머지는 일반적인 명언으로 채움
  ],
};
const getLuckyResult = () => {
  const rand = Math.floor(Math.random() * 200) + 1; // 1 ~ 200 사이 랜덤 숫자

  if (rand <= 6) {
    // 1~6 (6개): 대박 (-5)
    return {
      reduction: 5,
      msg: FORTUNE_DB.super[Math.floor(Math.random() * FORTUNE_DB.super.length)],
      type: 'SUPER',
    };
  } else if (rand <= 20) {
    // 7~20 (14개): 중박 (-3)
    return {
      reduction: 3,
      msg: FORTUNE_DB.lucky[Math.floor(Math.random() * FORTUNE_DB.lucky.length)],
      type: 'LUCKY',
    };
  } else {
    // 21~200 (180개): 일반 (-1)
    return {
      reduction: 1,
      msg: FORTUNE_DB.normal[Math.floor(Math.random() * FORTUNE_DB.normal.length)],
      type: 'NORMAL',
    };
  }
};
export default function FortuneCookie({ setAiResult }) {
  const { editCount, setEditCount, MAX_EDIT_COUNT, incrementUsage, checkLimit } = useUsageLimit();
  const { language } = useLanguage();
  const { user, userData } = useAuthContext();
  const [loading, setLoading] = useState(false);

  // 상태 관리 추가
  const [selectedId, setSelectedId] = useState(null); // 사용자가 선택한 쿠키 번호 (0, 1, 2)
  const [fortuneMessage, setFortuneMessage] = useState(''); // 뽑힌 문구
  const [rewardAmount, setRewardAmount] = useState(0); // 감소된 카운트 양
  const [showCoin, setShowCoin] = useState(false); // 코인 날아가는 애니메이션 추가

  const todayStr = new Date().toLocaleDateString('en-CA');

  const handleFortuneCookie = async (index) => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (loading) return; // 이미 진행 중이면 클릭 방지

    setAiResult('');
    setSelectedId(index); // 선택한 쿠키 표시
    setLoading(true);

    try {
      const data = userData || {};
      const currentCount = data.editCount || 0;
      const { today: today } = data.ZCookie || {};

      // 1. 이미 오늘 뽑았는지 체크
      if (today === todayStr) {
        setLoading(false);
        setSelectedId(null);
        return alert(
          language === 'en'
            ? 'Already claimed! See you tomorrow.'
            : '오늘의 보너스 수령완료! 내일 다시 찾아주세요.',
        );
      }

      // 2. 확률 로직 실행 (보상과 문구 결정)
      const result = getLuckyResult();
      const reductionAmount = result.reduction; // 1, 3, 5 중 하나
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

      // 4. 애니메이션 시간 (흔들리는 시간 1.5초)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setEditCount(newCount);
      setFortuneMessage(resultMsg);
      setRewardAmount(reductionAmount);
      setShowCoin(true); // 코인 애니메이션 트리거
      // 코인이 날아가서 상단 숫자가 바뀌는 느낌을 주기 위해 약간의 지연 후 숫자 업데이트
      setTimeout(() => {
        setEditCount(newCount);
      }, 600);
    } catch (e) {
      alert(`Error: ${e.message}`);
      setSelectedId(null); // 에러 시 초기화
    } finally {
      setLoading(false);
      // 결과 확인 후에는 selectedId를 유지하거나, 별도의 모달을 띄우는 처리가 필요할 수 있습니다.
      // 여기서는 loading만 풉니다.
    }
  };
  return (
    <>
      <div className="flex items-center justify-center">
        {/* 결과가 나왔으면 결과창 표시 */}
        {!loading && !fortuneMessage && userData?.ZCookie?.today === todayStr ? (
          <div className=" animate-in fade-in duration-700 flex flex-col items-center my-6">
            {/* 라벨: 작은 태그 느낌 */}
            <div className="fortune-label mb-2 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full shadow-sm border border-amber-200">
              오늘의 메시지
            </div>
            <div className="fortune-paper relative bg-[#fffdf5] px-8 py-10 rounded-sm shadow-[0_4px_10px_rgba(0,0,0,0.1)] border-t-4 border-amber-400 max-w-sm w-full text-center overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
              <span className="absolute top-4 left-4 text-4xl text-amber-200 font-serif leading-none select-none">
                “
              </span>
              <p className="relative z-10 text-gray-700 text-lg font-medium leading-relaxed break-keep">
                {userData.ZCookie.msg}
              </p>
              <span className="absolute bottom-2 right-4 text-4xl text-amber-200 font-serif leading-none select-none">
                ”
              </span>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[radial-gradient(circle,theme(colors.amber.200)_1px,transparent_1px)] bg-[length:8px_8px]"></div>
            </div>
          </div>
        ) : (
          <>
            {fortuneMessage ? (
              <div className="fortune-result-wrapper fade-in">
                {/* 날아가는 코인 요소 */}
                {showCoin && <div className="flying-coin-animation">⚡</div>}
                <div
                  className="
  /* 카드 컨테이너 */
  bg-[#fff9e7] border-2 border-[#ffedad] 
  px-[30px] py-[40px] rounded-[32px] max-w-[380px] 
  shadow-[0_20px_50px_rgba(108,71,255,0.15)] 
  relative flex flex-col items-center text-center
  animate-in fade-in zoom-in duration-500"
                >
                  {/* 상단 장식 아이콘 */}
                  <div className="text-[54px] mb-6 drop-shadow-md">
                    🥠<span className="animate-pulse">✨</span>
                  </div>

                  {/* 메인 메시지 */}
                  <p className="text-[#5d4037] text-xl font-bold leading-relaxed mb-8 break-keep">
                    {fortuneMessage}
                  </p>

                  {/* 보상 정보 박스 */}
                  <div className="w-full bg-white/60 rounded-2xl py-4 px-6 border border-[#ffedad]">
                    <div className="text-sm text-[#8d6e63] mb-1 font-medium">상금 획득!</div>
                    <div className="text-lg text-gray-800">
                      크레딧{' '}
                      <span className="font-black text-[#6c47ff] text-xl">{rewardAmount}</span>개
                      세이브!
                    </div>
                  </div>

                  {/* 장식용 작은 요소 (선택 사항) */}
                  <div className="absolute top-4 right-6 text-2xl opacity-20 select-none">🍀</div>
                </div>

                {/* 내일 다시 하라는 문구 등을 원하면 여기에 추가 */}
              </div>
            ) : (
              /* 결과가 없으면 쿠키 3개 선택 화면 */
              <div className="">
                <p className="">운명을 확인할 쿠키 하나를 선택하세요!</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      onClick={() => handleFortuneCookie(idx)}
                      className={`
    flex flex-col items-center cursor-pointer transition-all duration-300 ease-in-out
    ${selectedId === idx && loading ? 'animate-shake' : 'hover:scale-105'}
    ${selectedId !== null && selectedId !== idx ? 'opacity-40 grayscale blur-[1px]' : 'opacity-100'}
  `}
                    >
                      <div className="scale-[1.1] -translate-y-[10px] text-[64px] transition-transform duration-20">
                        🥠
                      </div>
                      <div className="w-[40px] h-[8px] bg-black/5 rounded-[50%] -mt-[5px]"></div>
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
