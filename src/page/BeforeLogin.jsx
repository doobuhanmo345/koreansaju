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

  // [데이터 무결성: 요구하신 Z 필드명 정확히 반영]
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
              updatedAt: new Date(),
              status: 'active',
              role: userData?.role || 'user',
              editCount: userData?.editCount || 0,
              lastLoginDate: new Date().toISOString().split('T')[0],
              displayedName: userData?.displayedName || user.displayName || '',
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
  console.log(sajuData);
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
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                  onChange={(e) => setBirthData({ ...birthData, year: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="MM"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                  onChange={(e) => setBirthData({ ...birthData, month: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="DD"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                  onChange={(e) => setBirthData({ ...birthData, day: e.target.value })}
                />
              </div>

              {!timeUnknown && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="시"
                    className="flex-1 min-w-0 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center"
                    onChange={(e) => setBirthData({ ...birthData, hour: e.target.value })}
                  />
                  <span className="font-bold dark:text-white">:</span>
                  <input
                    type="number"
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
              onClick={() => setStep(3)}
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
              <div className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-2xl p-4 text-left border border-indigo-50 shadow-inner">
                <h3 className="text-lg font-black text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1">
                  {language === 'ko' ? '타고난 기운' : 'Innate Energy'}
                </h3>
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
                            As a {getEng(saju.sky1)}
                            {getEng(saju.grd1)} person, you possess a mix of
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

              <p className="mt-4 text-[13px] text-slate-400 font-bold italic tracking-tight">
                {language === 'ko'
                  ? '*위 분석은 일주를 기반으로 한 맛보기 요약입니다.'
                  : '*The analysis above is a preview summary based on your Day Pillar.'}
              </p>
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {language === 'ko' ? '전체 운세 리포트 저장하기' : 'Save Full Fortune Report'}
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
      </div>
    </div>
  );
}
