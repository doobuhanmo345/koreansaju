import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { useAuthContext } from '../context/useAuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  MapPinIcon, // 대면 상담용 아이콘
} from '@heroicons/react/24/outline';

export default function ApplySaju() {
  const { user, userData } = useAuthContext(); // user(인증정보) 추가 추출
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bio: '',
    experience: '',
    methods: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  // 이미 신청했는지 확인 로직 강화 (user.uid 직접 참조)
  useEffect(() => {
    const checkApplied = async () => {
      if (!user?.uid) return;
      try {
        const q = query(
          collection(db, 'consultant_applications'),
          where('uid', '==', user.uid),
          where('status', '==', 'pending'),
        );
        const snap = await getDocs(q);
        if (!snap.empty) setApplied(true);
      } catch (e) {
        console.error('신청 여부 확인 중 오류:', e);
      }
    };
    checkApplied();
  }, [user]);

  const toggleMethod = (method) => {
    setFormData((prev) => ({
      ...prev,
      methods: prev.methods.includes(method)
        ? prev.methods.filter((m) => m !== method)
        : [...prev.methods, method],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 에러 방지: 데이터 유효성 검사
    if (!user?.uid) return alert('로그인 정보가 유효하지 않습니다.');
    if (formData.methods.length === 0)
      return alert('최소 한 가지 이상의 상담 방식을 선택해주세요.');

    setIsSubmitting(true);
    try {
      // 에러 발생 지점 수정: undefined가 들어가지 않도록 기본값 설정 및 user 객체 활용
      await addDoc(collection(db, 'consultant_applications'), {
        uid: user.uid, // userData 대신 확실한 user.uid 사용
        displayName: userData?.displayName || user?.displayName || '익명',
        email: user.email || '',
        bio: formData.bio || '',
        experience: formData.experience || '',
        consultationMethods: formData.methods,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      alert('전문가 신청이 완료되었습니다!');
      setApplied(true);
    } catch (error) {
      console.error('Firebase Error:', error);
      alert(`신청 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950">
        <div className="max-w-sm w-full text-center p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-indigo-50 dark:border-slate-800">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckBadgeIcon className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 text-center">
            심사 진행 중
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-center">
            명리학자 승인 신청이 접수되었습니다.
            <br />
            관리자 확인 후 결과가 반영됩니다.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition-all"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 dark:bg-slate-950 py-12 px-4 transition-colors duration-300">
      <Helmet>
        <title>전문가 신청 - 사자사주 / SAZA SAJU</title>
        <meta 
          name="description" 
          content="사자사주와 함께할 유능한 명리학 전문가를 모십니다. 당신의 전문 지식으로 더 많은 사람들에게 도움을 주세요." 
        />
        <link rel="canonical" href="https://sazasaju.com/apply-saju-consultant" />
      </Helmet>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 hover:scale-105 transition-transform"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              명리학자 신청
            </h1>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              Apply for Consultant
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[2rem] shadow-xl border border-white dark:border-slate-800 space-y-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase ml-1">
                  신청자명
                </label>
                <div className="p-4 bg-gray-100/50 dark:bg-slate-800/50 rounded-2xl text-gray-700 dark:text-gray-200 font-bold border border-transparent">
                  {userData?.displayName || user?.displayName}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase ml-1">
                  이메일
                </label>
                <div className="p-4 bg-gray-100/50 dark:bg-slate-800/50 rounded-2xl text-gray-700 dark:text-gray-200 font-bold border border-transparent truncate">
                  {user?.email}
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-slate-800" />

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-black text-gray-700 dark:text-gray-200 ml-1 text-left">
                  <DocumentTextIcon className="w-5 h-5 text-indigo-500" />
                  전문가 소개글
                </label>
                <textarea
                  className="w-full p-5 bg-white dark:bg-slate-800 border-2 border-gray-50 dark:border-slate-700 rounded-2xl text-gray-800 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all min-h-[120px] shadow-inner font-bold"
                  placeholder="사용자들에게 보여줄 소개글을 적어주세요."
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-black text-gray-700 dark:text-gray-200 ml-1 text-left">
                  <AcademicCapIcon className="w-5 h-5 text-indigo-500" />
                  주요 경력사항
                </label>
                <input
                  type="text"
                  className="w-full p-5 bg-white dark:bg-slate-800 border-2 border-gray-50 dark:border-slate-700 rounded-2xl text-gray-800 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-all shadow-inner font-bold"
                  placeholder="예: 경력 10년, 사주 상담사 1급 자격 등"
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-black text-gray-700 dark:text-gray-200 ml-1 text-left">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-indigo-500" />
                  제공 가능한 상담 방식 (중복 선택)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'text', label: '채팅 상담', icon: ChatBubbleLeftRightIcon },
                    { id: 'video', label: '화상 상담', icon: VideoCameraIcon },
                    { id: 'offline', label: '대면 상담', icon: MapPinIcon }, // 대면 상담 추가
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => toggleMethod(method.id)}
                      className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all gap-2 ${
                        formData.methods.includes(method.id)
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-gray-50 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      <method.icon className="w-8 h-8" />
                      <span className="font-bold text-xs whitespace-nowrap">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            className="group relative w-full overflow-hidden py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                신청서 제출하기
                <CheckBadgeIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
