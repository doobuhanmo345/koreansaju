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
  const [showReward, setShowReward] = useState(false); // +1 애니메이션 트리거 상태

  // 상태 관리 추가
  const [selectedId, setSelectedId] = useState(null); // 사용자가 선택한 쿠키 번호 (0, 1, 2)
  const [fortuneMessage, setFortuneMessage] = useState(''); // 뽑힌 문구
  const [rewardAmount, setRewardAmount] = useState(0); // 감소된 카운트 양
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

      // 3. Firebase 업데이트 (currentCount - reductionAmount)
      // * editCount가 0보다 작아지지 않게 하려면 Math.max(0, ...) 사용 권장
      const newCount = currentCount - reductionAmount;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: newCount,
          lastEditDate: new Date().toLocaleDateString('en-CA'),
          ZCookie: { today: todayStr, msg: resultMsg },
          dailyUsage: { [new Date().toLocaleDateString('en-CA')]: editCount + 1 }, // 사용량 기록은 +1
        },
        { merge: true },
      );

      // 4. 애니메이션 시간 (흔들리는 시간 1.5초)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setEditCount(newCount);
      setFortuneMessage(resultMsg);
      setRewardAmount(reductionAmount);
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
      <div className="fortune-container">
        {/* 결과가 나왔으면 결과창 표시 */}
        {!fortuneMessage && userData?.ZCookie?.today === todayStr ? (
          <div className="saved-fortune-container">
            <div className="fortune-label">오늘의 메시지</div>
            <div className="fortune-paper">
              <span className="quote-mark">“</span>
              {userData.ZCookie.msg}
              <span className="quote-mark">”</span>
            </div>
          </div>
        ) : (
          <>
            {fortuneMessage ? (
              <div className="fortune-result fade-in">
                <div className="opened-cookie">🥠✨</div>
                <p className="fortune-msg">{fortuneMessage}</p>
                <p className="fortune-reward">
                  크레딧 <strong>{rewardAmount}</strong>개 세이브!
                </p>
                {/* 내일 다시 하라는 문구 등을 원하면 여기에 추가 */}
              </div>
            ) : (
              /* 결과가 없으면 쿠키 3개 선택 화면 */
              <div className="cookies-wrapper">
                <p className="instruction">운명을 확인할 쿠키 하나를 선택하세요!</p>
                <div className="cookies-row">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      onClick={() => handleFortuneCookie(idx)}
                      className={`cookie-item ${selectedId === idx && loading ? 'shaking' : ''} ${selectedId !== null && selectedId !== idx ? 'disabled' : ''}`}
                    >
                      🥠
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
