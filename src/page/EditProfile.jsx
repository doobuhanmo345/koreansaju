import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';
import { useLanguage } from '../context/useLanguageContext';
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  ChevronLeftIcon,
  CheckIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import FourPillarVis from '../component/FourPillarVis';
import { useSajuCalculator } from '../hooks/useSajuCalculator';

export default function EditProfile() {
  const { user, userData, updateProfileData } = useAuthContext();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    displayName: '',
    birthDate: '',
    birthTime: '12:00',
    isTimeUnknown: false,
    gender: 'female',
  });

  const [isSaving, setIsSaving] = useState(false);

  // 1. 유저 데이터 로드 시 초기값 동기화
  useEffect(() => {
    if (userData) {
      const bDate = userData.birthDate ? userData.birthDate.split('T')[0] : '';
      const bTime = userData.birthDate ? userData.birthDate.split('T')[1] : '12:00';

      setFormData({
        displayName: userData.displayName || user?.displayName || '',
        birthDate: bDate,
        birthTime: bTime,
        isTimeUnknown: !!userData.isTimeUnknown,
        gender: userData.gender || 'female',
      });
    }
  }, [userData, user]);

  // 2. 실시간 계산용 날짜/시간 문자열 조합
  // formData가 바뀔 때마다 이 변수가 새로 계산되어 useSajuCalculator로 전달됩니다.
  const effectiveTime = formData.isTimeUnknown ? '12:00' : formData.birthTime || '12:00';
  const InputDateFull = `${formData.birthDate || '2000-01-01'}T${effectiveTime}`;

  // 3. 만세력 계산 훅 (InputDateFull이 변경되면 내부적으로 리랜더링을 유발함)
  const { saju: manse } = useSajuCalculator(InputDateFull, formData.isTimeUnknown);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      isTimeUnknown: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updateData = {
        displayName: formData.displayName,
        birthDate: `${formData.birthDate}T${effectiveTime}`,
        isTimeUnknown: formData.isTimeUnknown,
        gender: formData.gender,
        updatedAt: new Date(),
        saju: manse,
      };

      await updateProfileData(updateData);
      alert(language === 'ko' ? '프로필이 저장되었습니다.' : 'Profile saved successfully.');
      navigate(-1);
    } catch (error) {
      console.error('저장 실패:', error);
      alert(language === 'ko' ? '저장 중 오류가 발생했습니다.' : 'Error saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-xl m-auto px-4 py-8">
      {/* 상단 헤더 */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          {language === 'ko' ? '내 정보 수정' : 'Edit Profile'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/70 dark:bg-slate-800/60 p-6 rounded-3xl border border-indigo-50 dark:border-indigo-500/20 shadow-xl backdrop-blur-md">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 shadow-lg object-cover"
              />
            </div>
          </div>

          <div className="space-y-5">
            {/* 이메일 섹션 */}
            <div>
              <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                {language === 'ko' ? '이메일 (수정 불가)' : 'Email (Read Only)'}
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full bg-gray-100/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-gray-500 cursor-not-allowed outline-none font-medium"
                />
              </div>
            </div>

            {/* 이름 섹션 */}
            <div>
              <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                {language === 'ko' ? '이름' : 'Name'}
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full bg-white/50 dark:bg-slate-900/50 border border-indigo-50 dark:border-slate-700 rounded-2xl px-4 py-3 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                required
              />
            </div>

            {/* 성별 섹션 */}
            <div>
              <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                {language === 'ko' ? '성별' : 'Gender'}
              </label>
              <div className="flex gap-2 p-1 bg-gray-100/50 dark:bg-slate-900/50 rounded-2xl font-bold">
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${
                      formData.gender === g
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                    }`}
                  >
                    {g === 'male'
                      ? language === 'ko'
                        ? '남성'
                        : 'Male'
                      : language === 'ko'
                        ? '여성'
                        : 'Female'}
                  </button>
                ))}
              </div>
            </div>

            {/* 실시간 만세력 시각화 섹션 */}
            {manse?.sky1 && (
              <div className="flex flex-col justify-between mb-2 ml-1 animate-in fade-in duration-500">
                <label className="text-xs font-black text-indigo-500 uppercase tracking-wider mb-2">
                  {language === 'ko' ? '실시간 만세력 확인' : 'Live Saju Preview'}
                </label>
                <div className="w-full overflow-x-auto touch-pan-x pb-2 custom-scrollbar">
                  {/* 사주 명반이 최소 400~500px은 되어야 스마트폰에서 스크롤이 생깁니다 */}
                  <div className="min-w-[250px]">
                    <FourPillarVis isTimeUnknown={formData.isTimeUnknown} saju={manse} />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-bold">
              {/* 생년월일 입력 */}
              <div>
                <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                  {language === 'ko' ? '생년월일' : 'Birth Date'}
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-indigo-50 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* 태어난 시간 입력 */}
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-xs font-black text-indigo-500 uppercase tracking-wider">
                    {language === 'ko' ? '태어난 시간' : 'Birth Time'}
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.isTimeUnknown}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {language === 'ko' ? '시간 모름' : 'Unknown'}
                    </span>
                  </label>
                </div>

                <div className="relative">
                  <ClockIcon
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${formData.isTimeUnknown ? 'text-gray-300 dark:text-slate-700' : 'text-gray-400'}`}
                  />
                  <input
                    type="time"
                    name="birthTime"
                    value={formData.isTimeUnknown ? '12:00' : formData.birthTime}
                    onChange={handleChange}
                    disabled={formData.isTimeUnknown}
                    className={`w-full border rounded-2xl pl-12 pr-4 py-3 outline-none transition-all font-bold ${
                      formData.isTimeUnknown
                        ? 'bg-gray-100/50 dark:bg-slate-900/30 border-transparent text-gray-300 dark:text-slate-700 cursor-not-allowed'
                        : 'bg-white/50 dark:bg-slate-900/50 border-indigo-50 dark:border-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500'
                    }`}
                    required={!formData.isTimeUnknown}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 명리학자 신청 섹션 */}
        {userData?.role === 'user' && (
          <button
            type="button"
            onClick={() => navigate('/apply-saju-consultant')}
            className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl text-white shadow-lg hover:opacity-90 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black opacity-90 uppercase tracking-tighter">
                  {language === 'ko' ? '전문가 활동' : 'Expert Activity'}
                </p>
                <p className="text-lg font-bold">
                  {language === 'ko' ? '명리학자 신청하기' : 'Apply as Consultant'}
                </p>
              </div>
            </div>

            <ChevronRightIcon className="w-6 h-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        )}

        {/* 하단 버튼 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
          >
            {language === 'ko' ? '취소' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckIcon className="w-5 h-5" />
                {language === 'ko' ? '저장하기' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
