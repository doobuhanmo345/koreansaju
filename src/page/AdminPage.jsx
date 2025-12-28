import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  doc,
  updateDoc,
  deleteField,
  collection,
  onSnapshot,
  query,
  where,
  writeBatch,
  serverTimestamp,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';
import { useAuthContext } from '../context/useAuthContext';
import { CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AdminPage() {
  const { user, userData } = useAuthContext();
  const [newCount, setNewCount] = useState(0);

  // 추가된 상태: 명리학자 신청 목록 및 모달 제어
  const [applications, setApplications] = useState([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // 1단계: 거절 버튼 클릭 시 모달 열기
  const openRejectModal = (app) => {
    setSelectedApp(app);
    setRejectReason(''); // 사유 초기화
    setIsRejectModalOpen(true);
  };

  // 2단계: 모달에서 '거절 확정' 클릭 시 실행되는 실제 로직
  const handleRejectConfirm = async () => {
    if (!selectedApp) return;
    if (!rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }

    try {
      console.log('거절 대상 UID:', selectedApp.uid);

      await addDoc(collection(db, 'notifications'), {
        userId: selectedApp.uid,
        title: '전문가 신청 반려 안내',
        message: `명리학자 신청이 반려되었습니다. 사유: ${rejectReason}`,
        type: 'reject',
        isRead: false,
        createdAt: serverTimestamp(),
      });

      const appRef = doc(db, 'consultant_applications', selectedApp.id);
      await deleteDoc(appRef);

      setApplications((prev) => prev.filter((item) => item.id !== selectedApp.id));
      setIsRejectModalOpen(false);
      setSelectedApp(null);
      setRejectReason('');

      alert('거절 처리와 알림 전송이 완료되었습니다.');
    } catch (error) {
      console.error('거절 처리 중 상세 에러:', error.code, error.message);
      alert(`오류 발생: ${error.message}`);
    }
  };

  // 1. 기존 editCount 초기값 설정 (로직 유지)
  useEffect(() => {
    if (userData?.editCount !== undefined) {
      setNewCount(userData.editCount);
    }
  }, [userData]);

  // 2. 추가된 Effect: 명리학자 신청 대기 목록 실시간 로드 (로직 유지)
  useEffect(() => {
    if (userData?.role !== 'admin') return;

    const q = query(collection(db, 'consultant_applications'), where('status', '==', 'pending'));

    const unsubscribe = onSnapshot(q, (snap) => {
      setApplications(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [userData]);

  if (!user) return <div className="p-10 text-center">로그인이 필요합니다.</div>;
  if (userData?.role !== 'admin')
    return <div className="p-10 text-center">접근 권한이 없습니다.</div>;

  const docRef = doc(db, 'users', user.uid);

  // --- 데이터 개별 삭제 로직 (요청하신 신규 기능) ---
  const handleRemoveField = async (fieldName, label) => {
    if (!confirm(`${label} 데이터를 삭제하시겠습니까?`)) return;
    try {
      await updateDoc(docRef, { [fieldName]: deleteField() });
      alert(`${label} 데이터가 삭제되었습니다.`);
    } catch (error) {
      console.error(`${label} 삭제 실패:`, error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // --- 기존 기능 로직 (유지) ---
  const handleDeleteCookie = async () => {
    if (!confirm('ZCookie를 삭제하시겠습니까?')) return;
    try {
      await updateDoc(docRef, { ZCookie: deleteField() });
      alert('ZCookie가 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const handleUpdateCount = async () => {
    try {
      const bonus = userData?.role === 'admin' ? 10 : 3;
      await updateDoc(docRef, { editCount: -Number(newCount) + bonus });
      alert('숫자가 업데이트되었습니다.');
    } catch (error) {
      console.error('수정 실패:', error);
    }
  };

  // --- 명리학자 승인 로직 (유지) ---
  const handleApprove = async (app) => {
    if (!confirm(`${app.displayName} 님을 명리학자로 승인하시겠습니까?`)) return;

    const batch = writeBatch(db);
    const appRef = doc(db, 'consultant_applications', app.id);
    const applicantUserRef = doc(db, 'users', app.uid);

    batch.update(appRef, { status: 'approved', reviewedAt: serverTimestamp() });
    batch.update(applicantUserRef, { role: 'saju_consultant', status: 'active' });

    try {
      await batch.commit();
      alert('승인이 완료되었습니다.');
    } catch (error) {
      console.error('승인 처리 실패:', error);
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 max-w-xl m-auto">
      <div className="max-w-xl mx-auto space-y-8">
        {/* 헤더 섹션 */}
        <header className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            System Administration
          </h1>
          <p className="text-sm text-gray-500 mt-1">관리자 권한으로 시스템을 제어합니다.</p>
        </header>
        {/* 3. 편집 횟수 수정 (기존 로직 유지) */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
            편집 횟수 수정
          </h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="number"
                onChange={(e) => setNewCount(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-all"
              />
              <button
                onClick={handleUpdateCount}
                className="shrink-0 px-4 py-2 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-black dark:hover:bg-white text-white text-sm font-medium rounded-lg transition-all active:scale-95"
              >
                저장
              </button>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Current Value
              </span>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                {userData?.role === 'admin' ? -userData?.editCount + 10 : -userData?.editCount + 3}{' '}
                회
              </span>
            </div>
          </div>
        </section>
        {/* 2. 데이터 관리 섹션 (수정됨) */}
        <div className="grid grid-cols-1  gap-8">
          <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
              분석 캐시 데이터 관리
            </h3>
            <div className="grid gap-4">
              {[
                { key: 'ZApiAnalysis', label: '기본 사주 분석', color: 'text-blue-500' },
                { key: 'ZLastDaily', label: '일일 운세 결과', color: 'text-amber-500' },
                { key: 'ZLastNewYear', label: '신년 운세 결과', color: 'text-rose-500' },
                { key: 'ZCookie', label: '포춘 쿠키', color: 'text-emerald-500' },
              ].map((item) => {
                const hasData = !!userData?.usageHistory?.[item.key]; // 데이터 존재 여부 확인

                return (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                      hasData
                        ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                        : 'bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* 데이터 상태 표시 램프 */}
                      <div className={`relative flex h-3 w-3`}>
                        {hasData && (
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${item.color.replace('text', 'bg')} opacity-75`}
                          ></span>
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-3 w-3 ${hasData ? item.color.replace('text', 'bg') : 'bg-gray-300 dark:bg-gray-700'}`}
                        ></span>
                      </div>

                      <div>
                        <p
                          className={`text-sm font-bold ${hasData ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}
                        >
                          {item.label}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {hasData ? '데이터 저장됨' : '비어있음'}
                        </p>
                      </div>
                    </div>

                    {/* 삭제 버튼: 데이터가 있을 때만 활성화 */}
                    <button
                      onClick={() => handleRemoveField(item.key, item.label)}
                      disabled={!hasData}
                      className={`p-3 rounded-xl transition-all ${
                        hasData
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 shadow-sm'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <TrashIcon className={`w-5 h-5 ${hasData ? 'animate-pulse-slow' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 1. 명리학자 신청 관리 섹션 */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
              명리학자 승인 대기 목록
            </h3>

            <div className="space-y-6">
              {applications.length === 0 ? (
                <p className="text-center py-10 text-gray-400 italic text-sm border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                  대기 중인 신청 건이 없습니다.
                </p>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-col lg:flex-row items-stretch justify-between p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-gray-100/50 dark:shadow-none gap-6 transition-all hover:border-purple-200 dark:hover:border-purple-900/30"
                  >
                    {/* 정보 영역 */}
                    <div className="flex-grow space-y-5 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-black text-xl">
                          {app.displayName?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                            {app.displayName}
                          </h4>
                          <p className="text-sm text-gray-500 font-medium">{app.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-slate-800/50 p-5 rounded-[1.5rem]">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">
                              소개 및 포부
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic line-clamp-2">
                              "{app.bio || '등록된 소개가 없습니다.'}"
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">
                              전문 경력
                            </p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                              {app.experience || '경력 정보 없음'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-3">
                            상담 방식
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(app.consultationMethods || []).map((method) => (
                              <span
                                key={method}
                                className="px-3 py-1 bg-white dark:bg-slate-900 rounded-full text-[11px] font-bold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-slate-700 shadow-sm"
                              >
                                {method === 'text' && '💬 채팅'}
                                {method === 'video' && '📹 화상'}
                                {method === 'offline' && '📍 대면'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-row lg:flex-col items-center justify-center lg:w-40 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-6 gap-3">
                      <button
                        onClick={() => handleApprove(app)}
                        className="flex-1 lg:flex-none w-full py-4 lg:py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1 group shadow-lg shadow-purple-200 dark:shadow-none"
                      >
                        <CheckIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span>최종 승인</span>
                      </button>
                      <button
                        onClick={() => openRejectModal(app)}
                        className="flex-1 lg:flex-none w-full py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-xs font-bold transition-all"
                      >
                        신청 거절
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 거절 사유 입력 모달 */}
          {isRejectModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    반려 사유 입력
                  </h3>
                  <button
                    onClick={() => setIsRejectModalOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4 font-medium">
                  <span className="text-purple-600 font-bold">{selectedApp?.displayName}</span>님께
                  전달될 메시지를 입력해주세요.
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="예: 실무 경력 증빙이 부족하여 반려되었습니다."
                  className="w-full h-32 p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium mb-6 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsRejectModalOpen(false)}
                    className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleRejectConfirm}
                    className="flex-[2] py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100 dark:shadow-none transition-all"
                  >
                    거절 확정
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">
            Administrator Access Only
          </p>
        </footer>
      </div>
    </div>
  );
}
