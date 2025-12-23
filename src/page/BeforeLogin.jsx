import React, { useState } from 'react';
import { useAuthContext } from '../context/useAuthContext';
import {
  CheckIcon,
  SparklesIcon,
  DocumentMagnifyingGlassIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid';
import {
  LanguageIcon,
  UserCircleIcon,
  CakeIcon,
  ChevronRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../context/useLanguageContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function BeforeLogin() {
  const { user, userData, login } = useAuthContext();
  const [step, setStep] = useState(1);
  const { language, setLanguage } = useLanguage();

  const t = {
    ko: {
      step1: '반가워요! 언어를 선택해주세요',
      intro_title: '당신만의 운명 가이드, SAZA SAJU',
      intro_desc: '단순한 운세를 넘어, 당신의 삶을 기록하고 분석합니다.',
      features: [
        {
          title: '정밀한 사주 분석',
          desc: '전통 명리학 기반의 깊이 있는 풀이',
          icon: <DocumentMagnifyingGlassIcon className="w-5 h-5" />,
        },
        {
          title: '운세 기록 보관함',
          desc: '과거와 현재의 운의 흐름을 한눈에 기록',
          icon: <SparklesIcon className="w-5 h-5" />,
        },
        {
          title: '안전한 개인 데이터',
          desc: '나만 볼 수 있는 프라이빗 분석 결과',
          icon: <ShieldCheckIcon className="w-5 h-5" />,
        },
      ],
      why_login: '로그인이 필요한 이유',
      login_reason:
        '분석 결과를 안전하게 보관하고, 언제 어디서든 당신의 운명 리포트를 다시 확인할 수 있기 때문입니다.',
      step2: '당신을 위한 맞춤 분석',
      step2_desc: '개인화된 사주 분석과 기록 저장을 위해\n로그인이 필요합니다.',
      step3: '정확한 사주 풀이를 위해',
      step3_desc: '성별과 생년월일을 입력해주시면\n당신만의 운명 지도를 그려드릴게요.',
      gender_m: '남성',
      gender_f: '여성',
      google: '구글로 계속하기',
      next: '다음으로',
      complete: '운세 보러가기',
      start: '서비스 시작하기',
    },
    en: {
      step1: 'Welcome! Select Language',
      intro_title: 'Your Destiny Guide, SAZA SAJU',
      intro_desc: 'Beyond simple fortune telling, we record and analyze your life.',
      features: [
        {
          title: 'Precise Saju Analysis',
          desc: 'In-depth reading based on tradition',
          icon: <DocumentMagnifyingGlassIcon className="w-5 h-5" />,
        },
        {
          title: 'Fortune Archive',
          desc: 'Track your luck flow from past to present',
          icon: <SparklesIcon className="w-5 h-5" />,
        },
        {
          title: 'Secure Personal Data',
          desc: 'Private analysis results only for you',
          icon: <ShieldCheckIcon className="w-5 h-5" />,
        },
      ],
      why_login: 'Why Login?',
      login_reason:
        'So you can safely store results and access your destiny report anytime, anywhere.',
      step2: 'Personalized Analysis',
      step2_desc: 'Please log in for personalized Saju analysis\nand to save your fortune records.',
      step3: 'For Accurate Reading',
      step3_desc: 'Enter your gender and birth details and we will\nchart your unique destiny map.',
      gender_m: 'Male',
      gender_f: 'Female',
      google: 'Continue with Google',
      next: 'Next',
      complete: 'See my Fortune',
      start: 'Get Started',
    },
  }[language];

  const handleLogin = async () => {
    try {
      await login();
      setStep(3);
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const [gender, setGender] = useState('male'); // 기본값 남성
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
    const pad = (n) => n.toString().padStart(2, '0');
    const formattedBirthdate = `${birthData.year}-${pad(birthData.month)}-${pad(birthData.day)}T${timeUnknown ? '12' : pad(birthData.hour)}:${timeUnknown ? '00' : pad(birthData.minute)}`;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        gender: gender, // 성별 저장 추가
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
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-white dark:border-slate-800">
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>

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
                className={`p-4 rounded-2xl border-2 font-bold transition-all ${language === 'en' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'border-slate-100 dark:border-slate-800 dark:text-white'}`}
              >
                English
              </button>
            </div>
          </div>
        )}

        {step === 1.5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.intro_title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {t.intro_desc}
              </p>
            </div>
            <div className="space-y-3">
              {t.features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="text-indigo-500 bg-white dark:bg-slate-700 p-2 rounded-xl shadow-sm">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                      {f.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-tight">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
              <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1">
                <StarIcon className="w-3 h-3" /> {t.why_login}
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 font-bold">
                {t.login_reason}
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 group transition-all active:scale-95"
            >
              {t.start}{' '}
              <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserCircleIcon className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.step2}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium whitespace-pre-wrap leading-relaxed">
              {t.step2_desc}
            </p>
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm group"
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
            <div className="text-center space-y-2">
              <div className="bg-amber-50 dark:bg-amber-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CakeIcon className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.step3}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">{t.step3_desc}</p>
            </div>

            <div className="space-y-4">
              {/* 성별 선택 섹션 추가 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 p-3 rounded-xl border-2 font-bold transition-all ${gender === 'male' ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 dark:border-slate-800 dark:text-white'}`}
                >
                  {t.gender_m}
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 p-3 rounded-xl border-2 font-bold transition-all ${gender === 'female' ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 dark:border-slate-800 dark:text-white'}`}
                >
                  {t.gender_f}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="YYYY"
                  className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 dark:text-white font-bold"
                  onChange={(e) => setBirthData({ ...birthData, year: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="MM"
                  className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 dark:text-white font-bold"
                  onChange={(e) => setBirthData({ ...birthData, month: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="DD"
                  className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 dark:text-white font-bold"
                  onChange={(e) => setBirthData({ ...birthData, day: e.target.value })}
                />
              </div>

              {!timeUnknown && (
                <div className="flex items-center gap-2 animate-in zoom-in-95 duration-300">
                  <input
                    type="number"
                    placeholder="시 (0-23)"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 dark:text-white font-bold"
                    onChange={(e) => setBirthData({ ...birthData, hour: e.target.value })}
                  />
                  <span className="font-bold dark:text-white">:</span>
                  <input
                    type="number"
                    placeholder="분 (0-59)"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 dark:text-white font-bold"
                    onChange={(e) => setBirthData({ ...birthData, minute: e.target.value })}
                  />
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer group p-1">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={timeUnknown}
                  onChange={(e) => setTimeUnknown(e.target.checked)}
                />
                <div
                  className={`w-6 h-6 border-2 rounded-md transition-all flex items-center justify-center ${timeUnknown ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}
                >
                  {timeUnknown && <CheckIcon className="w-5 h-5 text-white" />}
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">
                  {language === 'ko' ? '태어난 시간을 잘 몰라요' : "I don't know my birth time"}
                </span>
              </label>
            </div>

            <button
              className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all mt-4"
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
