import React, { useEffect, useState, useMemo } from 'react';
import { useAuthContext } from '../context/useAuthContext';
import { SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { CakeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../context/useLanguageContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import { calculateSajuData } from '../utils/sajuLogic';
import { getEng } from '../utils/helpers';

export default function BeforeLogin() {
  const { user, userData, login } = useAuthContext();
  const { language, setLanguage } = useLanguage();
  const [sajuData, setSajuData] = useState();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('male');
  const [birthData, setBirthData] = useState({
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
  });
  const [timeUnknown, setTimeUnknown] = useState(false);
  const pad = (n) => n?.toString().padStart(2, '0') || '00';
  const memoizedBirthDate = useMemo(() => {
    const { year, month, day, hour, minute } = birthData;
    if (!year || !month || !day) return null;
    const pad = (n) => n?.toString().padStart(2, '0') || '00';
    const formatted = `${year}-${pad(month)}-${pad(day)}T${timeUnknown ? '12' : pad(hour)}:${timeUnknown ? '00' : pad(minute)}`;
    return new Date(formatted);
  }, [birthData, timeUnknown]);

  const { saju } = useSajuCalculator(memoizedBirthDate, timeUnknown);

  const handleNextStep = () => {
    const { year, month, day, hour, minute } = birthData;
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = parseInt(hour);
    const min = parseInt(minute);

    // 1. 연도 체크 (1900-2030)
    if (!y || y < 1900 || y > 2030) {
      alert(
        language === 'ko'
          ? '연도를 1900~2030년 사이로 입력해주세요.'
          : 'Please enter a year between 1900-2030.',
      );
      return;
    }

    // 2. 월 체크 (1-12)
    if (!m || m < 1 || m > 12) {
      alert(
        language === 'ko'
          ? '월을 1~12월 사이로 입력해주세요.'
          : 'Please enter a month between 1-12.',
      );
      return;
    }

    // 3. 일 체크 (해당 월의 실제 마지막 날짜 계산)
    // JavaScript의 Date 객체는 day에 0을 넣으면 '이전 달의 마지막 날'을 반환하는 특성을 이용
    const lastDayOfMonth = new Date(y, m, 0).getDate();
    if (!d || d < 1 || d > lastDayOfMonth) {
      alert(
        language === 'ko'
          ? `${m}월은 ${lastDayOfMonth}일까지 있습니다. 다시 확인해주세요.`
          : `${month}/${m} only has ${lastDayOfMonth} days. Please check again.`,
      );
      return;
    }

    // 4. 시간 체크 (0-23)
    if (isNaN(h) || h < 0 || h > 23) {
      alert(
        language === 'ko'
          ? ' 시간을 0~23시 사이로 입력해주세요.'
          : 'Please enter hours between 0-23.',
      );
      return;
    }

    // 5. 분 체크 (0-59)
    if (isNaN(min) || min < 0 || min > 59) {
      alert(
        language === 'ko'
          ? '분을 0~59분 사이로 입력해주세요.'
          : 'Please enter minutes between 0-59.',
      );
      return;
    }

    // 모든 검증 통과
    setStep(3);
  };
  // [데이터 무결성: 요구하신 Z 필드명 정확히 반영]
  const [tryLogin, setTryLogin] = useState(false);
  // 1. 로그인 시도 함수 수정
  const hasId = async () => {
    // 상태값 대신 로컬 스토리지를 사용해 기록을 남깁니다.
    setTryLogin(true);
    login();
  };
useEffect(() => {
  // 1. 로그인 시도 중이 아니거나 인증 정보가 없으면 아예 실행 안 함
  if (!tryLogin || !user) return;

  // 2. [가장 중요] 데이터가 실제로 로드되었는지 확인
  // 만약 userData가 초기값(null)이라면, 잠시 대기해야 합니다.
  // 이 문제를 피하기 위해 'userData'가 확실히 들어오거나,
  // 혹은 서버에서 '데이터 없음'이 확정될 때까지 기다리는 조건이 필요합니다.

  const checkUser = async () => {
    // userData가 아직 없는 경우(null 또는 undefined) 0.5초~1초 정도 짧게 대기하며 재확인
    if (!userData) {
      // 만약 훅에서 loading 상태를 제공한다면 그것을 쓰는게 베스트입니다.
      // 예: if (loading) return;
      return;
    }

    if (userData.birthDate) {
      // CASE 1: 기존 회원
      window.location.replace('/');
    } else {
      // CASE 2: 아이디는 있는데 생일만 없는 회원
      alert(language === 'ko' ? '사주 정보를 입력해주세요.' : 'Please enter info.');
      setStep(2);
      setTryLogin(false);
    }
  };

  checkUser();
}, [user, userData, tryLogin]);
  useEffect(() => {
    const saveAndRedirect = async () => {
      if (user?.uid && step === 4) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const pad = (n) => n.toString().padStart(2, '0');
          const birthDate = `${birthData.year}-${pad(birthData.month)}-${pad(birthData.day)}T${timeUnknown ? '12' : pad(birthData.hour)}:${timeUnknown ? '00' : pad(birthData.minute)}`;

          await setDoc(
            userRef,
            {
              saju: saju,
              birthDate: birthDate,
              gender: gender,
              isTimeUnknown: timeUnknown,
              createdAt: userData?.createdAt || new Date(),
              updatedAt: new Date(),
              status: 'active',
              role: userData?.role || 'user',
              editCount: userData?.editCount || 0,
              lastLoginDate: new Date().toISOString().split('T')[0],
              displayName: user.displayName || '',
              email: userData?.email || user.email || '',
              // 요구하신 Z 필드명으로 수정
              usageHistory: userData?.usageHistory || {
                ZLastDaily: null,
                ZLastNewYear: null,
                ZApiAnalysis: null,
                ZWealthAnalysis: null,
                ZMatchAnalysis: null,
                ZCookie: null,
              },
              question_history: userData?.question_history || [],
            },
            { merge: true },
          );

          window.location.replace('/');
        } catch (err) {
          console.error('저장 오류:', err);
        }
      }
    };
    saveAndRedirect();
  }, [user, step]);

  const t = {
    ko: {
      step1: '언어를 선택해주세요',
      step2: '정보를 입력해주세요',
      step3: '분석 완료!',
      step3_desc: '로그인하시면 결과를 저장하고 리포트를 확인합니다.',
      gender_m: '남성',
      gender_f: '여성',
      google: '구글로 로그인하고 결과 저장하기',
      complete: '사주 분석하기',
      time_unknown: '태어난 시간을 몰라요',
      // 추가된 문구
      already_member: '이미 계정이 있으신가요?',
      login_now: '로그인하기',
    },
    en: {
      step1: 'Select Language',
      step2: 'Enter Information',
      step3: 'Analysis Ready!',
      step3_desc: 'Login to save your data.',
      gender_m: 'Male',
      gender_f: 'Female',
      google: 'Continue with Google',
      complete: 'Analyze',
      time_unknown: 'Unknown Time',
      // 추가된 문구
      already_member: 'Already have an account?',
      login_now: 'Log in',
    },
  }[language];
  const isInvalid =
    !birthData.year ||
    !birthData.month ||
    !birthData.day ||
    (!timeUnknown && (!birthData.hour || !birthData.minute));
  useEffect(() => {
    if (!!memoizedBirthDate) {
      const date = `${birthData.year}-${pad(birthData.month)}-${pad(birthData.day)}T${timeUnknown ? '12' : pad(birthData.hour)}:${timeUnknown ? '00' : pad(birthData.minute)}`;
      const data = calculateSajuData(date, gender, timeUnknown, language) || '';
      if (data) {
        setSajuData(data);
        //   if (data.currentDaewoon) setSelectedDae(data.currentDaewoon);
      }
    }
  }, [step]);

  const sajuDict = {
    // 1. 오행 특성 (Dominant Element)
    ohaeng: {
      wood: {
        ko: '성장과 시작, 곧게 뻗어 나가는 추진력',
        en: 'growth, beginnings, and forward momentum',
      },
      fire: {
        ko: '열정과 확산, 세상을 밝히는 화려한 에너지',
        en: 'passion, expansion, and brilliant energy',
      },
      earth: {
        ko: '중재와 신뢰, 모든 것을 포용하는 묵직함',
        en: 'mediation, trust, and heavy inclusiveness',
      },
      metal: {
        ko: '결단과 숙살, 날카로운 분석력과 강한 의지',
        en: 'decision, sharp analysis, and strong will',
      },
      water: {
        ko: '지혜와 유연함, 깊은 통찰력과 적응력',
        en: 'wisdom, flexibility, and deep insight',
      },
    },
    // 2. 천간 (Heavenly Stems)
    sky: {
      갑: { ko: '추진력과 리더십', en: 'drive and leadership' },
      을: { ko: '끈질긴 생명력', en: 'persistent vitality' },
      병: { ko: '열정과 화려함', en: 'passion and brilliance' },
      정: { ko: '따뜻한 배려심', en: 'warm consideration' },
      무: { ko: '듬직한 신뢰감', en: 'reliable trust' },
      기: { ko: '섬세한 정성', en: 'delicate sincerity' },
      경: { ko: '단호한 결단력', en: 'firm determination' },
      신: { ko: '예리한 통찰력', en: 'sharp insight' },
      임: { ko: '깊은 지혜', en: 'profound wisdom' },
      계: { ko: '유연한 감수성', en: 'flexible sensitivity' },
    },
    // 3. 지지 (Earthly Branches)
    grd: {
      자: { ko: '높은 집중력', en: 'high concentration' },
      축: { ko: '성실한 끈기', en: 'sincere persistence' },
      인: { ko: '용맹한 기상', en: 'brave spirit' },
      묘: { ko: '창의적인 감각', en: 'creative talent' },
      진: { ko: '변화무쌍한 이상', en: 'versatile ideals' },
      사: { ko: '빠른 행동력', en: 'fast action' },
      오: { ko: '정열적인 태도', en: 'passionate attitude' },
      미: { ko: '흔들리지 않는 고집', en: 'unwavering persistence' },
      신: { ko: '임기응변', en: 'adaptability' },
      유: { ko: '철저한 완벽주의', en: 'thorough perfectionism' },
      술: { ko: '책임감 있는 태도', en: 'responsible attitude' },
      해: { ko: '깊은 이해심', en: 'deep understanding' },
    },
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-slate-100 dark:border-slate-800">
        {/* Progress Bar */}
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-black text-center dark:text-white">{t.step1}</h2>
            <div className={tryLogin ? 'bg-blue-500' : 'bg-red-500'}>언어선택</div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setLanguage('ko');
                  setStep(2);
                }}
                className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-bold dark:text-white hover:border-indigo-500 transition-all"
              >
                한국어
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  setStep(2);
                }}
                className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-bold dark:text-white hover:border-indigo-500 transition-all"
              >
                English
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="text-center">
              <CakeIcon className="w-12 h-12 text-amber-500 mx-auto mb-2" />
              <h2 className="text-2xl font-black dark:text-white">{t.step2}</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 p-3 rounded-xl border-2 font-bold transition-all ${gender === g ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 dark:border-slate-800 dark:text-white'}`}
                  >
                    {g === 'male' ? t.gender_m : t.gender_f}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="YYYY"
                  min="1900"
                  max="2030"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                  onChange={(e) => setBirthData({ ...birthData, year: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="MM"
                  min="1"
                  max="12"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                  onChange={(e) => setBirthData({ ...birthData, month: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="DD"
                  min="1"
                  max="31"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                  onChange={(e) => setBirthData({ ...birthData, day: e.target.value })}
                />
              </div>

              {!timeUnknown && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="시"
                    min="0"
                    max="12"
                    className="flex-1 min-w-0 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                    onChange={(e) => setBirthData({ ...birthData, hour: e.target.value })}
                  />
                  <span className="font-bold dark:text-white">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="분"
                    className="flex-1 min-w-0 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                    onChange={(e) => setBirthData({ ...birthData, minute: e.target.value })}
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer w-fit group">
                <input
                  type="checkbox"
                  checked={timeUnknown}
                  onChange={(e) => setTimeUnknown(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500"
                />
                <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-500 transition-colors">
                  {t.time_unknown}
                </span>
              </label>
            </div>

            <button
              disabled={isInvalid}
              onClick={handleNextStep}
              className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg disabled:opacity-50 active:scale-95 transition-all"
            >
              {t.complete}
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-5 text-center animate-in `slide-in-from-right-4">
            <div className="space-y-1">
              <SparklesIcon className="w-10 h-10 text-yellow-400 mx-auto animate-bounce" />
              <h2 className="text-xl font-black dark:text-white">{t.step3}</h2>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-indigo-200 dark:border-indigo-900">
              {/* 8글자 간지 표시 (콤팩트하게 변경) */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {saju?.kanji?.map((k, i) => (
                  <div
                    key={i}
                    className={`flex flex-col p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm border ${i === 1 ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-100 dark:border-slate-600'}`}
                  >
                    <span className="text-[9px] text-slate-400 font-bold">
                      {['시', '일', '월', '년'][3 - i]}
                    </span>
                    <span
                      className={`text-base font-black ${i === 1 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {k}
                    </span>
                  </div>
                ))}
              </div>

              {/* 일주 분석 텍스트 박스 (5줄 분량) */}
              <div className="">
                {/* <div onClick={() => setLanguage('en')}>영어</div>
                <div onClick={() => setLanguage('ko')}>한국</div> */}

                {!!sajuData && (
                  <>
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 font-medium text-left">
                      {/* 1. 오행 상세 분석 */}
                      <p>
                        •
                        {language === 'ko' ? (
                          <>
                            가장 강한
                            {sajuData.maxOhaeng[0] === 'fire'
                              ? '불(火)'
                              : sajuData.maxOhaeng[0] === 'water'
                                ? '물(水)'
                                : sajuData.maxOhaeng[0] === 'wood'
                                  ? '나무(木)'
                                  : sajuData.maxOhaeng[0] === 'metal'
                                    ? '금(金)'
                                    : '흙(土)'}
                            의 기운을 타고나 {sajuDict.ohaeng[sajuData.maxOhaeng[0]]?.ko}이(가) 매우
                            돋보입니다.
                          </>
                        ) : (
                          <>
                            Your dominant element is {sajuData.maxOhaeng[0].toUpperCase()},
                            characterized by {sajuDict.ohaeng[sajuData.maxOhaeng[0]]?.en}.
                          </>
                        )}
                      </p>
                      {/* 2. 일주 상세 분석 */}
                      <p>
                        •{' '}
                        {language === 'ko' ? (
                          <>
                            {sajuData.saju?.sky1}
                            {sajuData.saju?.grd1}일주로서, {sajuDict.sky[sajuData.saju?.sky1]?.ko}와{' '}
                            {sajuDict.grd[sajuData.saju?.grd1]?.ko}의 조화를 갖춘 성격을 가지고
                            있습니다.
                          </>
                        ) : (
                          <>
                            As a {getEng(saju?.sky1)}
                            {getEng(saju?.grd1)} person, you possess a mix of
                            {sajuDict.sky[sajuData.saju?.sky1]?.en} and
                            {sajuDict.grd[sajuData.saju?.grd1]?.en}.
                          </>
                        )}
                      </p>
                      {/* 3. 대운/신살/관계 (기존과 동일) */}
                      <p>
                        •{' '}
                        {language === 'ko' ? (
                          <>
                            현재 {sajuData.currentDaewoon?.name} 대운의 흐름 속에 있으며, 사주에
                            깃든 {sajuData.myShinsal?.map((s) => s.name).join(', ')}의 기운이 특별한
                            능력을 발휘하게 돕습니다.
                          </>
                        ) : (
                          <>
                            Currently in the {getEng(sajuData.currentDaewoon?.name?.[0])}
                            {getEng(sajuData.currentDaewoon?.name?.[1])} Luck Cycle.
                          </>
                        )}
                      </p>
                      {/* the influence of **{sajuData.myShinsal?.map((s) => s.name).join(', ')}**
                      enhances your unique potential. */}
                      {/* 4. 주의사항 (충/관계) */}
                      {sajuData.relations && sajuData.relations.length > 0 && (
                        <p className="text-rose-500 font-bold">
                          •{' '}
                          {language === 'ko' ? (
                            <>
                              주의: {sajuData.relations[0].ko.name}의 영향으로{' '}
                              {sajuData.relations[0].ko.desc.split('니')[0]}니 세심한 관리가
                              필요합니다.
                            </>
                          ) : (
                            <>
                              Caution: Due to **{sajuData.relations[0].en.name}**,{' '}
                              {sajuData.relations[0].en.desc.toLowerCase()}
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <p className="mt-4 text-[13px] text-slate-400 font-bold italic tracking-tight">
              {language === 'ko' ? (
                <>
                  *방금 보신 내용은 사자가 읽어준 짧은 요약이에요. 🦁
                  <br />
                  <span className="text-indigo-500 underline decoration-indigo-200 underline-offset-4 hover:text-indigo-600 transition-colors">
                    로그인하고 들어오시면
                  </span>{' '}
                  복잡한 운세 이야기를 훨씬 쉽고 재미있게 풀어서 들려줄게요!
                </>
              ) : (
                <>
                  *This is just a quick peek from Saza. 🦁
                  <br />
                  If you{' '}
                  <span className="text-indigo-500 underline decoration-indigo-200 underline-offset-4  hover:text-indigo-600 transition-colors">
                    log in,
                  </span>{' '}
                  Saza will explain your destiny in a much simpler and friendlier way!
                </>
              )}
            </p>

            <button
              onClick={() => setStep(4)}
              className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {language === 'ko' ? '전체 운세 리포트 보러가기' : 'Check Full Fortune Report'}
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 text-center">
            <ShieldCheckIcon className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-black dark:text-white">결과 저장하기</h2>
            <button
              onClick={() => login()}
              className="w-full flex items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-slate-700 dark:text-white hover:bg-slate-50 transition-all shadow-xl"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-6 h-6"
                alt="google"
              />
              {t.google}
            </button>
          </div>
        )}

        {/* 하단 로그인 안내 (Step 1, 2에서만 표시) */}
        {(step === 1 || step === 2) && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center animate-in fade-in duration-700">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {t.already_member}{' '}
              <button
                onClick={() => hasId()}
                className="text-indigo-600 dark:text-indigo-400 font-black hover:underline underline-offset-4 transition-all"
              >
                {t.login_now}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
