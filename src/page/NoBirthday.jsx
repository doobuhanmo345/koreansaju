import React, { useState,useEffect } from 'react';
import { useAuthContext } from '../context/useAuthContext';
import { useLanguage } from '../context/useLanguageContext';
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import { DateService } from '../utils/dateService';
import CityInput from '../ui/CityInput';
import FourPillarVis from '../component/FourPillarVis';

export default function NoBirthday() {
  const { user, userData, updateProfileData, logout } = useAuthContext();
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    displayName: userData?.displayName || user?.displayName || '',
    birthDate: '',
    birthTime: '12:00',
    isTimeUnknown: false,
    gender: '',
    birthCity: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  // 실시간 사주 계산
  const effectiveTime = formData.isTimeUnknown ? '12:00' : formData.birthTime || '12:00';
  const inputDateFull = `${formData.birthDate || '2000-01-01'}T${effectiveTime}`;
  const { saju } = useSajuCalculator(inputDateFull, formData.isTimeUnknown);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [step, setStep] = useState(1);
  const [isIntro, setIsIntro] = useState(true);
  const [introStep, setIntroStep] = useState(0); // Tracks which sentence to show
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [isWelcome, setIsWelcome] = useState(false);

  // Intro transition timers
  useEffect(() => {
    if (isIntro) {
      // Very granular line-by-line reveal
      const timers = [
        setTimeout(() => setIntroStep(1), 300),
        setTimeout(() => setIntroStep(2), 800),
        setTimeout(() => setIntroStep(3), 1300),
        setTimeout(() => setIntroStep(4), 1800),
        setTimeout(() => setIntroStep(5), 2300),
        setTimeout(() => setIntroStep(6), 2800),
        setTimeout(() => setIntroStep(7), 3300),
        setTimeout(() => setIntroStep(8), 3800),
      ];
      
      const finishTimer = setTimeout(() => {
        setIsIntro(false);
      }, 5000); // 5 seconds total for the full granular sequence
      
      return () => {
        timers.forEach(clearTimeout);
        clearTimeout(finishTimer);
      };
    }
  }, [isIntro]);

  // Auto-advance steps based on data completeness
  useEffect(() => {
    if (isIntro || isWelcome) return; // Don't advance steps during intro or welcome
    
    let nextStep = 1;
    if (formData.displayName.trim().length > 0 && nameConfirmed) nextStep = 2;
    if (nextStep === 2 && formData.gender) nextStep = 3;
    if (nextStep === 3 && formData.birthDate) nextStep = 4;
    
    // Time now comes before City
    const isTimeDone = formData.isTimeUnknown || formData.birthTime;
    if (nextStep === 4 && isTimeDone) nextStep = 5;
    
    // City is the final step before result
    if (nextStep === 5 && formData.birthCity) nextStep = 6;
    
    setStep(nextStep);
  }, [formData, nameConfirmed, isIntro, isWelcome]);

  const isFormValid = 
    formData.displayName.trim().length > 0 &&
    formData.birthDate &&
    (formData.isTimeUnknown || formData.birthTime) &&
    formData.birthCity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.birthDate || !formData.gender) {
      alert(language === 'ko' ? '모든 정보를 입력해 주세요.' : 'Please fill in all information.');
      return;
    }
    setIsSaving(true);

    try {
      const todayDate = await DateService.getTodayDate();
      const updateData = {
        displayName: formData.displayName,
        birthDate: `${formData.birthDate}T${effectiveTime}`,
        birthCity: formData.birthCity,
        isTimeUnknown: formData.isTimeUnknown,
        gender: formData.gender,
        updatedAt: todayDate,
        saju: saju,
      };

      // Show Welcome Phase FIRST to ensure it's visible
      setIsWelcome(true);
      
      // Wait for 3.5 seconds to show the message
      await new Promise(resolve => setTimeout(resolve, 3500));

      // ONLY THEN perform the final update that might cause unmount
      await updateProfileData(updateData);
      
    } catch (error) {
      console.error('Save failed:', error);
      setIsWelcome(false); // Revert if failed
      alert(language === 'ko' ? '저장 중 오류가 발생했습니다.' : 'Error saving details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Progress calculation: Steps are 1 (Name) to 6 (Result)
  const progress = Math.min(((step - 1) / 5) * 100, 100);

  const getStepDirection = () => {
    switch(step) {
      case 1: return language === 'ko' ? '이름을 알려주세요' : 'Tell me your name';
      case 2: return language === 'ko' ? '성별을 선택해 주세요' : 'Select your gender';
      case 3: return language === 'ko' ? '태어난 날짜를 입력해 주세요' : 'Enter your birth date';
      case 4: return language === 'ko' ? '태어난 시간을 선택해 주세요' : 'Tell me your birth time';
      case 5: return language === 'ko' ? '태어난 장소를 입력해 주세요' : 'Enter your birth city';
      case 6: return language === 'ko' ? '거의 다 됐습니다!' : 'Almost there!';
      default: return '';
    }
  };

  // Final animation pattern matching BeforeLogin.jsx
  const containerClass = "w-full max-w-xl relative z-10";

  if (isIntro) {
    const lineClass = "transition-all duration-1000 ease-out-quint transform";
    const getVisible = (n) => introStep >= n ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8";

    return (
      <div className="min-h-screen relative overflow-hidden bg-white dark:bg-slate-950 py-12 px-4 flex flex-col items-center justify-center">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-50/20 dark:bg-rose-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/20 dark:bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className={containerClass}>
          <header className="text-right sm:pr-8 space-y-12">
            <div className={`${lineClass} ${getVisible(1)}`}>
              <div className="inline-block px-4 py-1.5 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-100 dark:border-white/5 rounded-full text-[10px] font-black tracking-[0.4em] text-indigo-500 dark:text-indigo-400 uppercase">
                Initial Registration
              </div>
            </div>

            <h2 className="text-6xl sm:text-8xl font-light text-slate-900 dark:text-white leading-[1.05] tracking-tighter flex flex-col items-end">
              <span className={`${lineClass} ${getVisible(2)}`}>
                {language === 'ko' ? '당신만의' : 'Your Personal'}
              </span>
              <span className={`font-serif italic font-medium text-indigo-600/80 dark:text-indigo-400/80 block mt-2 ${lineClass} ${getVisible(3)}`}>
                {language === 'ko' ? '기운을 찾아서' : 'Energy Path'}
              </span>
            </h2>

            <div className="text-xl sm:text-2xl text-slate-400 dark:text-slate-500 leading-relaxed font-medium flex flex-col items-end space-y-2">
              <div className={`${lineClass} ${getVisible(4)}`}>
                {language === 'ko' ? '처음 오셨군요!' : 'Welcome to your first step.'}
              </div>
              <div className={`${lineClass} ${getVisible(5)} text-indigo-500/80 dark:text-indigo-400/80 font-bold`}>
                {language === 'ko' ? '반갑습니다.' : 'It is nice to meet you.'}
              </div>
              
              <div className="pt-4 flex flex-col items-end space-y-1">
                <div className={`${lineClass} ${getVisible(6)}`}>
                  {language === 'ko' ? '당신의' : 'Please enter the'}
                </div>
                <div className={`${lineClass} ${getVisible(7)} text-slate-900 dark:text-white underline decoration-indigo-500/30 underline-offset-8`}>
                  {language === 'ko' ? '타고난 시간과 공간을' : 'exact time and space'}
                </div>
                <div className={`${lineClass} ${getVisible(8)}`}>
                  {language === 'ko' ? '입력해 주세요.' : 'of your birth.'}
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>
    );
  }

  if (isWelcome) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-white dark:bg-slate-950 py-12 px-4 flex flex-col items-center justify-center">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-50/20 dark:bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/20 dark:bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700" />

        <div className={`${containerClass} text-center space-y-10`}>
          <div className="animate-in fade-in zoom-in-95 duration-1000 ease-out">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-indigo-100 dark:border-indigo-500/10">
              <CheckIcon className="w-10 h-10 text-indigo-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl sm:text-6xl font-light text-slate-900 dark:text-white leading-tight tracking-tighter">
              {language === 'ko' ? '환영합니다!' : 'Welcome!'}
            </h2>
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-[500ms] fill-mode-both ease-out">
            <p className="text-xl sm:text-2xl text-slate-500 dark:text-slate-400 font-medium">
              {language === 'ko' ? (
                <>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold italic font-serif">하루에 세 개씩</span><br />
                  무료 운세를 볼 수 있어요.
                </>
              ) : (
                <>
                  You can check your fortune<br />
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold italic font-serif">three times a day</span> for free.
                </>
              )}
            </p>
          </div>

          <div className="animate-in fade-in duration-1000 delay-[1500ms] fill-mode-both">
             <div className="flex justify-center gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full bg-indigo-500/30 animate-bounce`} style={{ animationDelay: `${i * 150}ms` }} />
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-slate-950 py-12 px-4 flex flex-col items-center justify-center pt-32">
      
      {/* Progress Header (Always at top) */}
      <div className="fixed top-0 left-0 w-full z-50">
        <div className="w-full h-1 bg-slate-50 dark:bg-slate-900">
          <div 
            className="h-full bg-indigo-500 transition-all duration-1000 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-b border-slate-100 dark:border-white/5">
           <div key={step} className="animate-in fade-in slide-in-from-left-4 duration-500">
             <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-indigo-500" />
               {getStepDirection()}
             </span>
           </div>
           <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase">
            {progress}% COMPLETE — {step} / 6
           </span>
        </div>
      </div>

      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-50/20 dark:bg-rose-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/20 dark:bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className={`${containerClass} animate-in fade-in slide-in-from-bottom-12 duration-1000`}>
        {/* Form Sections (Visible after Intro) */}
        <form onSubmit={handleSubmit} className="">
          
          {/* Step 01: Name (Always Visible) */}
          <div className="space-y-4 pb-12">
            <header className="px-1 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                  <span className="font-bold">01.</span>
                  <span className="ml-3 italic font-serif text-indigo-600/80 dark:text-indigo-400/80">
                    {language === 'ko' ? '이름' : 'Name'}
                  </span>
                </h2>
              </div>
            </header>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">NAME</label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder={language === 'ko' ? '이름 또는 닉네임' : 'Name or Nickname'}
                  className="flex-1 bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none px-1 py-3 text-slate-800 dark:text-white focus:border-indigo-500/50 outline-none transition-all font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700 text-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setNameConfirmed(true)}
                  disabled={formData.displayName.trim().length === 0 || nameConfirmed}
                  className={`px-6 py-3 rounded-full text-xs font-black tracking-widest transition-all ${
                    nameConfirmed 
                      ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30' 
                      : formData.displayName.trim().length > 0 
                        ? 'bg-indigo-600 text-white shadow-lg active:scale-95' 
                        : 'bg-slate-100 text-slate-300 dark:bg-slate-900 cursor-not-allowed'
                  }`}
                >
                  {nameConfirmed ? (
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4" />
                      {language === 'ko' ? '확인됨' : 'CONFIRMED'}
                    </div>
                  ) : (
                    language === 'ko' ? '확인' : 'CONFIRM'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step 02: Gender */}
          <div className={`grid transition-all duration-500 ease-in-out ${step >= 2 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden min-h-0">
              <div className="pb-12">
                <header className="px-1 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                      <span className="font-bold">02.</span>
                      <span className="ml-3 italic font-serif text-indigo-600/80 dark:text-indigo-400/80">
                        {language === 'ko' ? '성별' : 'Gender'}
                      </span>
                    </h2>
                  </div>
                </header>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">GENDER</label>
                  <div className="flex gap-4 pt-1">
                    {['male', 'female'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                        className={`relative flex items-center gap-2 group transition-all`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          formData.gender === g ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                            {formData.gender === g && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className={`text-sm font-bold transition-colors ${
                          formData.gender === g ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600'
                        }`}>
                          {g === 'male' ? (language === 'ko' ? '남성' : 'Male') : (language === 'ko' ? '여성' : 'Female')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 03: Birth Date */}
          <div className={`grid transition-all duration-500 ease-in-out ${step >= 3 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden min-h-0">
              <div className="pb-12">
                <header className="px-1 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                      <span className="font-bold">03.</span>
                      <span className="ml-3 italic font-serif text-indigo-600/80 dark:text-indigo-400/80">
                        {language === 'ko' ? '생년월일' : 'Birth Date'}
                      </span>
                    </h2>
                  </div>
                </header>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">BIRTH DATE</label>
                  <div className="relative group">
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none px-1 py-3 text-slate-800 dark:text-white focus:border-indigo-500/50 outline-none transition-all font-bold text-lg"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 04: Birth Time (ORDER RESTORED) */}
          <div className={`grid transition-all duration-500 ease-in-out ${step >= 4 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden min-h-0">
              <div className="pb-12">
                <header className="px-1 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                      <span className="font-bold">04.</span>
                      <span className="ml-3 italic font-serif text-indigo-600/80 dark:text-indigo-400/80">
                        {language === 'ko' ? '태어난 시간' : 'Birth Time'}
                      </span>
                    </h2>
                  </div>
                </header>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">BIRTH TIME</label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.isTimeUnknown}
                        onChange={(e) => setFormData(p => ({ ...p, isTimeUnknown: e.target.checked }))}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
                        {language === 'ko' ? '모름' : 'Unknown'}
                      </span>
                    </label>
                  </div>
                  <div className="relative group">
                    <input
                      type="time"
                      name="birthTime"
                      value={formData.birthTime}
                      onChange={handleChange}
                      disabled={formData.isTimeUnknown}
                      className={`w-full bg-transparent border-b rounded-none px-1 py-3 outline-none transition-all font-bold text-lg ${
                        formData.isTimeUnknown
                          ? 'border-transparent text-slate-200 dark:text-slate-800 cursor-not-allowed'
                          : 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white focus:border-indigo-500/50'
                      }`}
                      required={!formData.isTimeUnknown}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 05: Birth City */}
          <div className={`grid transition-all duration-500 ease-in-out ${step >= 5 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden min-h-0">
              <div className="pb-12">
                <header className="px-1 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                      <span className="font-bold">05.</span>
                      <span className="ml-3 italic font-serif text-indigo-600/80 dark:text-indigo-400/80">
                        {language === 'ko' ? '태어난 곳' : 'Birth Place'}
                      </span>
                    </h2>
                  </div>
                </header>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">BIRTH CITY</label>
                  <div className="relative group">
                    <CityInput
                      name="birthCity"
                      value={formData.birthCity}
                      onChange={handleChange}
                      language={language}
                      className="!bg-transparent !border-b !border-slate-200 dark:!border-slate-800 !rounded-none !px-1 !py-3 !font-bold text-lg !shadow-none focus-within:!border-indigo-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 06: Preview & Actions */}
          <div className={`grid transition-all duration-500 ease-in-out ${step >= 6 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden min-h-0">
              <div className="pb-12">
                <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-10 rounded-[2.5rem] border border-slate-100 dark:border-white/5 text-center space-y-8 backdrop-blur-sm shadow-sm">
                    <p className="text-[10px] font-black text-indigo-500/60 dark:text-indigo-400/60 uppercase tracking-[0.4em]">
                      {language === 'ko' ? '생 년 월 일 시' : 'Energy Pattern'}
                    </p>
                    <div className="flex justify-center scale-100 sm:scale-110">
                      <FourPillarVis saju={saju} isTimeUnknown={formData.isTimeUnknown} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <footer className="pt-8 space-y-8">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSaving}
                    className={`w-full py-5 rounded-xl font-black text-sm uppercase tracking-[0.3em] transition-all active:scale-[0.98] shadow-2xl ${
                      !isFormValid || isSaving
                        ? 'bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-700 cursor-not-allowed shadow-none'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100'
                    }`}
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        {language === 'ko' ? '분석 시작하기' : 'Start My Journey'}
                        <CheckIcon className="w-5 h-5" strokeWidth={3} />
                      </div>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={logout}
                      className="text-[10px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all uppercase tracking-[0.2em] border-b border-slate-200 dark:border-slate-800 pb-1"
                    >
                      {language === 'ko' ? '처음으로 돌아가기' : 'Return home'}
                    </button>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
