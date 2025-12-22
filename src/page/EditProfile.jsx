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
} from '@heroicons/react/24/outline';

export default function EditProfile() {
  const { user, userData, updateProfileData } = useAuthContext();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // 1. 데이터 파싱: "1990-12-05T10:30" -> ["1990-12-05", "10:30"]
  const initialBirthDate = userData?.birthDate ? userData.birthDate.split('T')[0] : '';
  const initialBirthTime = userData?.birthDate ? userData.birthDate.split('T')[1] : '';

  const [formData, setFormData] = useState({
    displayName: userData?.displayName || user?.displayName || '',
    birthDate: initialBirthDate,
    birthTime: initialBirthTime,
    gender: userData?.gender || 'female',
  });

  const [isSaving, setIsSaving] = useState(false);

  // 2. 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. 저장 로직
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 날짜와 시간을 다시 "YYYY-MM-DDTHH:mm" 형식으로 결합
      const combinedBirthDate = `${formData.birthDate}T${formData.birthTime}`;

      const updateData = {
        displayName: formData.displayName,
        birthDate: combinedBirthDate,
        gender: formData.gender,
        updatedAt: new Date(),
      };

      await updateProfileData(updateData);
      alert(
        language === 'ko' ? '정보가 성공적으로 수정되었습니다.' : 'Profile updated successfully.',
      );
      navigate(-1);
    } catch (error) {
      console.error(error);
      alert(language === 'ko' ? '저장 중 오류가 발생했습니다.' : 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-xl m-auto px-4 py-8">
      {/* 헤더 */}
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
          {/* 프로필 이미지 (고정) */}
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
            {/* 이메일 (수정 불가, 보기 전용) */}
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

            {/* 이름 수정 */}
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

            {/* 성별 선택 */}
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

            {/* 생년월일 & 시간 분리 입력 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-bold">
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
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-indigo-50 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                  {language === 'ko' ? '태어난 시간' : 'Birth Time'}
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    name="birthTime"
                    value={formData.birthTime}
                    onChange={handleChange}
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-indigo-50 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 */}
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
