import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/useAuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, getDocs, collection, query, where, limit } from 'firebase/firestore';
import {
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  MapPinIcon,
  PencilSquareIcon,
  CheckIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

export default function ConsultantDashboard() {
  const { user, userData } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editForm, setEditForm] = useState({
    bio: '',
    experience: '',
    consultationMethods: [],
  });

  // 1. 기존 신청서 데이터 또는 유저 데이터 로드
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.uid) return;

      try {
        // 우선 userData(users 컬렉션)에 데이터가 있는지 확인
        if (userData?.bio || userData?.experience) {
          setEditForm({
            bio: userData.bio || '',
            experience: userData.experience || '',
            consultationMethods: userData.consultationMethods || [],
          });
        } else {
          // 데이터가 없다면 최초 신청서(consultant_applications)에서 가져옴
          const q = query(
            collection(db, 'consultant_applications'),
            where('uid', '==', user.uid),
            limit(1),
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const appData = querySnapshot.docs[0].data();
            setEditForm({
              bio: appData.bio || '',
              experience: appData.experience || '',
              consultationMethods: appData.consultationMethods || [],
            });

            // 최초 1회, 신청서 데이터를 users 문서로 마이그레이션 (선택 사항이지만 권장)
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              bio: appData.bio,
              experience: appData.experience,
              consultationMethods: appData.consultationMethods,
            });
          }
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user, userData]);

  const toggleMethod = (method) => {
    setEditForm((prev) => ({
      ...prev,
      consultationMethods: prev.consultationMethods.includes(method)
        ? prev.consultationMethods.filter((m) => m !== method)
        : [...prev.methods, method], // 오타 수정: prev.methods -> prev.consultationMethods
    }));
  };

  // 2. 저장 로직 수정 (users 컬렉션 직접 업데이트)
  const handleSave = async () => {
    if (!user?.uid) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        bio: editForm.bio,
        experience: editForm.experience,
        consultationMethods: editForm.consultationMethods,
        updatedAt: new Date(),
      });
      alert('프로필이 성공적으로 수정되었습니다.');
      setIsEditing(false);
    } catch (error) {
      console.error('수정 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 dark:text-white">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-10 px-4 sm:px-10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* 헤더 섹션 */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-left">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white text-left">
              명리학자 대시보드
            </h1>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold">
              전문가 전용 관리 시스템
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
            <img
              src={user?.photoURL}
              className="w-10 h-10 rounded-full border-2 border-indigo-500"
              alt="profile"
            />
            <div className="pr-4 text-left">
              <p className="text-xs text-gray-400 font-bold uppercase">Master</p>
              <p className="text-sm font-black text-gray-800 dark:text-gray-200">
                {userData?.displayName}님
              </p>
            </div>
          </div>
        </header>

        {/* 대시보드 스탯 (동일) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <StatCard
            icon={<CalendarDaysIcon className="w-6 h-6 text-blue-500" />}
            label="오늘의 상담"
            value="0건"
            color="blue"
          />
          <StatCard
            icon={<CurrencyDollarIcon className="w-6 h-6 text-emerald-500" />}
            label="누적 수익"
            value="0원"
            color="emerald"
          />
          <div className="p-6 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none flex flex-col justify-center">
            <p className="text-indigo-100 text-sm font-bold">현재 상태</p>
            <p className="text-2xl font-black italic">Active Consultant</p>
          </div>
        </div>

        {/* 프로필 관리 섹션 */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-white dark:border-slate-800 transition-all text-left">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <AcademicCapIcon className="w-6 h-6 text-indigo-500" />
              전문가 프로필 관리
            </h3>
            <div className="flex gap-2">
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300"
                >
                  취소
                </button>
              )}
              <button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                  isEditing
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-indigo-600 text-white hover:scale-105'
                }`}
              >
                {isEditing ? (
                  <>
                    <CheckIcon className="w-5 h-5" /> 저장하기
                  </>
                ) : (
                  <>
                    <PencilSquareIcon className="w-5 h-5" /> 수정하기
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 왼쪽: 자기소개 & 경력 */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-indigo-500 uppercase ml-1">
                  자기소개
                </label>
                {isEditing ? (
                  <textarea
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 focus:border-indigo-500 rounded-2xl outline-none text-gray-800 dark:text-white font-bold transition-all min-h-[150px]"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  />
                ) : (
                  <p className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl text-gray-700 dark:text-gray-300 font-medium leading-relaxed min-h-[150px] whitespace-pre-wrap">
                    {userData?.bio || editForm.bio || '등록된 소개글이 없습니다.'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-indigo-500 uppercase ml-1">
                  주요 경력
                </label>
                {isEditing ? (
                  <input
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 focus:border-indigo-500 rounded-2xl outline-none text-gray-800 dark:text-white font-bold transition-all"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                  />
                ) : (
                  <p className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl text-gray-700 dark:text-gray-300 font-bold">
                    {userData?.experience || editForm.experience || '경력 사항을 입력해주세요.'}
                  </p>
                )}
              </div>
            </div>

            {/* 오른쪽: 상담 방식 */}
            <div className="space-y-4">
              <label className="text-xs font-black text-indigo-500 uppercase ml-1">
                제공 중인 상담 방식
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'text', label: '채팅 상담', icon: ChatBubbleLeftRightIcon },
                  { id: 'video', label: '화상 상담', icon: VideoCameraIcon },
                  { id: 'offline', label: '대면 상담', icon: MapPinIcon },
                ].map((method) => {
                  const isActive = editForm.consultationMethods.includes(method.id);

                  return (
                    <button
                      key={method.id}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => toggleMethod(method.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300'
                          : 'border-transparent bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-600'
                      } ${isEditing ? 'cursor-pointer hover:border-indigo-300' : 'cursor-default'}`}
                    >
                      <div className="flex items-center gap-3">
                        <method.icon className="w-6 h-6" />
                        <span className="font-bold">{method.label}</span>
                      </div>
                      {isActive && <CheckIcon className="w-5 h-5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-white dark:border-slate-800 flex items-center gap-5">
      <div className={`p-4 rounded-2xl bg-${color}-50 dark:bg-${color}-900/20`}>{icon}</div>
      <div className="text-left">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
