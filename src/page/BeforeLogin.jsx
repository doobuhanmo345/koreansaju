import React, { useState } from 'react';
import { useAuthContext } from '../context/useAuthContext';
import { CheckIcon } from '@heroicons/react/16/solid';
import {
  LanguageIcon,
  UserCircleIcon,
  CakeIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../context/useLanguageContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
export default function BeforeLogin() {
  const { user, userData, login } = useAuthContext();
  const [step, setStep] = useState(1); // 1: 언어, 2: 로그인, 3: 생일
  const { language, setLanguage } = useLanguage();

  const t = {
    ko: {
      step1: '반가워요! 언어를 선택해주세요',
      step1_desc: '편하신 언어로 서비스를 이용하실 수 있습니다.',
      step2: '당신을 위한 맞춤 분석',
      step2_desc: '개인화된 사주 분석과 기록 저장을 위해\n로그인이 필요합니다.',
      step3: '정확한 사주 풀이를 위해',
      step3_desc: '생년월일 정보를 입력해주시면\n당신만의 운명 지도를 그려드릴게요.',
      google: '구글로 계속하기',
      next: '다음으로',
      complete: '운세 보러가기',
    },
    en: {
      step1: 'Welcome! Select Language',
      step1_desc: 'You can enjoy our services in your preferred language.',
      step2: 'Personalized Analysis',
      step2_desc: 'Please log in for personalized Saju analysis\nand to save your fortune records.',
      step3: 'For Accurate Reading',
      step3_desc: 'Enter your birth details and we will\nchart your unique destiny map.',
      google: 'Continue with Google',
      next: 'Next',
      complete: 'See my Fortune',
    },
  }[language];

  // 구글 로그인 후 자동으로 다음 단계로 이동하는 로직이 필요합니다.
  const handleLogin = async () => {
    try {
      await login();
      setStep(3); // 로그인 성공 시 생일 입력 단계로
    } catch (err) {
      console.error('Login failed', err);
    }
  };
  const [birthData, setBirthData] = useState({
    year: '',
    month: '',
    day: '',
    hour: '12',
    minute: '00',
  });
  const [timeUnknown, setTimeUnknown] = useState(false);

  const handleComplete = async () => {
    if (!user?.uid) return;

    // 1. 데이터 포맷팅 (MM, DD, HH 등을 2자리로 맞춤)
    const pad = (n) => n.toString().padStart(2, '0');

    const y = birthData.year;
    const m = pad(birthData.month);
    const d = pad(birthData.day);

    // 2. 시간 결정 (미정일 경우 12:00, 아닐 경우 입력값)
    const hh = timeUnknown ? '12' : pad(birthData.hour);
    const mm = timeUnknown ? '00' : pad(birthData.minute);

    // 최종 형식: "YYYY-MM-DDTHH:mm"
    const formattedBirthdate = `${y}-${m}-${d}T${hh}:${mm}`;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        birthDate: formattedBirthdate,
        timeUnknown: timeUnknown,
        updatedAt: new Date(),
      });

      window.location.href = '/dashboard';
    } catch (error) {
      console.error('데이터 저장 실패:', error);
      alert('정보 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-all">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 space-y-8 border border-white dark:border-slate-800">
        {/* 프로그레스 바 */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>

        {/* Step 1: 언어 선택 */}
        {step === 1 && (
          <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LanguageIcon className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.step1}</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setLanguage('ko');
                  setStep(2);
                }}
                className={`p-4 rounded-2xl border-2 font-bold transition-all ${language === 'ko' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'border-slate-100 dark:border-slate-800'}`}
              >
                한국어
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  setStep(2);
                }}
                className={`p-4 rounded-2xl border-2 font-bold transition-all ${language === 'en' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'border-slate-100 dark:border-slate-800'}`}
              >
                English
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 로그인 */}
        {step === 2 && (
          <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserCircleIcon className="w-8 h-8 text-emerald-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.step2}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium whitespace-pre-wrap leading-relaxed">
                {t.step2_desc}
              </p>
            </div>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm group"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                alt="google"
              />
              {t.google}
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6 text-left animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <div className="bg-amber-50 dark:bg-amber-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CakeIcon className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.step3}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{t.step3_desc}</p>
            </div>

            <div className="space-y-4">
              {/* 년/월/일 입력 */}
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="YYYY"
                  className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white font-bold"
                  onChange={(e) => setBirthData({ ...birthData, year: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="MM"
                  className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white font-bold"
                  onChange={(e) => setBirthData({ ...birthData, month: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="DD"
                  className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white font-bold"
                  onChange={(e) => setBirthData({ ...birthData, day: e.target.value })}
                />
              </div>

              {/* 시간 입력 (timeUnknown이 false일 때만 표시) */}
              {!timeUnknown && (
                <div className="flex items-center gap-2 animate-in zoom-in-95 duration-300">
                  <input
                    type="number"
                    placeholder="시 (0-23)"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white font-bold"
                    onChange={(e) => setBirthData({ ...birthData, hour: e.target.value })}
                  />
                  <span className="font-bold dark:text-white">:</span>
                  <input
                    type="number"
                    placeholder="분 (0-59)"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white font-bold"
                    onChange={(e) => setBirthData({ ...birthData, minute: e.target.value })}
                  />
                </div>
              )}

              {/* 시간 미정 체크박스 */}
              <label className="flex items-center gap-3 cursor-pointer group p-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={timeUnknown}
                    onChange={(e) => setTimeUnknown(e.target.checked)}
                  />
                  <div
                    className={`w-6 h-6 border-2 rounded-md transition-all ${timeUnknown ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}
                  >
                    {timeUnknown && <CheckIcon className="w-5 h-5 text-white" />}
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">
                  {language === 'ko' ? '태어난 시간을 잘 몰라요' : "I don't know my birth time"}
                </span>
              </label>
            </div>

            <button
              className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all mt-4"
              onClick={handleComplete}
            >
              {t.complete}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
