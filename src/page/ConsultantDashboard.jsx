import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/useAuthContext';
import { db } from '../lib/firebase';
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  limit,
} from 'firebase/firestore';
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
import { DateService } from '../utils/dateService';

export default function ConsultantDashboard() {
  const { user, userData } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 컨설턴트 전용 데이터 상태
  const [consultantProfile, setConsultantProfile] = useState({
    bio: '',
    experience: '',
    consultationMethods: [],
  });

  useEffect(() => {
    const fetchConsultantData = async () => {
      if (!user?.uid) return;

      try {
        // 1. 전용 프로필 컬렉션(consultant_profiles)에서 조회
        const profileRef = doc(db, 'consultant_profiles', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setConsultantProfile(profileSnap.data());
        } else {
          // 2. 프로필 문서가 없다면 신청서에서 데이터를 가져와 초기 생성
          const q = query(
            collection(db, 'consultant_applications'),
            where('uid', '==', user.uid),
            limit(1),
          );
          const appSnapshot = await getDocs(q);
const todayDate = await DateService.getTodayDate();
          if (!appSnapshot.empty) {
            const appData = appSnapshot.docs[0].data();
            const initialData = {
              bio: appData.bio || '',
              experience: appData.experience || '',
              consultationMethods: appData.consultationMethods || [],
              uid: user.uid,
              createdAt: todayDate,
            };

            // 새 컬렉션에 프로필 문서 생성
            await setDoc(profileRef, initialData);
            setConsultantProfile(initialData);
          }
        }
      } catch (error) {
        console.error('컨설턴트 프로필 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultantData();
  }, [user]);

  const toggleMethod = (methodId) => {
    setConsultantProfile((prev) => ({
      ...prev,
      consultationMethods: prev.consultationMethods.includes(methodId)
        ? prev.consultationMethods.filter((m) => m !== methodId)
        : [...prev.consultationMethods, methodId],
    }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    try {
      const profileRef = doc(db, 'consultant_profiles', user.uid);
      await updateDoc(profileRef, {
        ...consultantProfile,
        updatedAt: todayDate,
      });
      alert('전문가 프로필이 저장되었습니다.');
      setIsEditing(false);
    } catch (error) {
      console.error('저장 실패:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  if (loading)
    return (
      <div className=" flex items-center justify-center dark:bg-slate-950 dark:text-white font-bold">
        전문가 정보를 불러오는 중...
      </div>
    );

  return (
    <div className="  py-10 px-4 sm:px-10 transition-colors duration-300 max-w-2xl m-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* 헤더 섹션 (userData는 일반 정보용으로 사용) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-left">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">명리학자 대시보드</h1>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold">
              마스터 {userData?.displayName}님의 상담소
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
            <img
              src={user?.photoURL}
              className="w-10 h-10 rounded-full border-2 border-indigo-500"
              alt="profile"
            />
            <div className="pr-4 text-left">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">
                Verified Expert
              </p>
              <p className="text-sm font-black text-gray-800 dark:text-gray-200">
                {userData?.displayName}님
              </p>
            </div>
          </div>
        </header>

        {/* 스탯 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
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
        </div>

        {/* 전문가 프로필 관리 (전용 컬렉션 데이터 사용) */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-white dark:border-slate-800 text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-3">
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
                  isEditing ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
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
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-indigo-500 ml-1">상담소 소개</label>
                {isEditing ? (
                  <textarea
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 rounded-2xl outline-none font-bold min-h-[150px] dark:text-white"
                    value={consultantProfile.bio}
                    onChange={(e) =>
                      setConsultantProfile({ ...consultantProfile, bio: e.target.value })
                    }
                  />
                ) : (
                  <p className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap min-h-[150px]">
                    {consultantProfile.bio || '소개글을 작성해주세요.'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-indigo-500 ml-1">주요 전문 경력</label>
                {isEditing ? (
                  <input
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 rounded-2xl outline-none font-bold dark:text-white"
                    value={consultantProfile.experience}
                    onChange={(e) =>
                      setConsultantProfile({ ...consultantProfile, experience: e.target.value })
                    }
                  />
                ) : (
                  <p className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl text-gray-700 dark:text-gray-300 font-bold">
                    {consultantProfile.experience || '경력을 입력해주세요.'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-indigo-500 ml-1">활성화된 상담 방식</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'text', label: '채팅 상담', icon: ChatBubbleLeftRightIcon },
                  { id: 'video', label: '화상 상담', icon: VideoCameraIcon },
                  { id: 'offline', label: '대면 상담', icon: MapPinIcon },
                ].map((method) => {
                  const isActive = consultantProfile.consultationMethods.includes(method.id);
                  return (
                    <button
                      key={method.id}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => toggleMethod(method.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300'
                          : 'border-transparent bg-gray-50 dark:bg-slate-800 text-gray-400'
                      }`}
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
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-white dark:border-slate-800 flex items-center gap-5">
      <div className={`p-4 rounded-2xl ${colorMap[color]}`}>{icon}</div>
      <div className="text-left">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
