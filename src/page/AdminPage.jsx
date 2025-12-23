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
} from 'firebase/firestore';
import { useAuthContext } from '../context/useAuthContext';

export default function AdminPage() {
  const { user, userData } = useAuthContext();
  const [newCount, setNewCount] = useState(0);

  // 추가된 상태: 명리학자 신청 목록
  const [applications, setApplications] = useState([]);

  // 1. 기존 editCount 초기값 설정
  useEffect(() => {
    if (userData?.editCount !== undefined) {
      setNewCount(userData.editCount);
    }
  }, [userData]);

  // 2. 추가된 Effect: 명리학자 신청 대기 목록 실시간 로드
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

  // --- 기존 기능 로직 ---
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

  // --- 추가된 기능: 명리학자 승인 로직 ---
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 헤더 섹션 */}
        <header className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            System Administration
          </h1>
          <p className="text-sm text-gray-500 mt-1">관리자 권한으로 시스템을 제어합니다.</p>
        </header>

        {/* 1. 명리학자 신청 관리 (추가된 섹션) */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
            명리학자 승인 대기 목록
          </h3>

          <div className="overflow-hidden">
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 gap-4"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {app.displayName}
                        </span>
                        <span className="text-xs text-gray-500">{app.email}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                        {app.bio}
                      </p>
                    </div>
                    <button
                      onClick={() => handleApprove(app)}
                      className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all active:scale-95"
                    >
                      승인하기
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                <p className="text-sm text-gray-400 italic">현재 승인 대기 중인 신청이 없습니다.</p>
              </div>
            )}
          </div>
        </section>

        {/* 2. 기존 데이터 관리 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ZCookie 삭제 */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
              데이터 관리
            </h3>
            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              {userData?.ZCookie ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    내 계정의 ZCookie 데이터가 존재합니다.
                  </p>
                  <button
                    onClick={handleDeleteCookie}
                    className="w-full py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-500 hover:bg-red-600 transition-all shadow-sm"
                  >
                    데이터 초기화
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-2 italic">
                  삭제할 데이터가 없습니다.
                </p>
              )}
            </div>
          </section>

          {/* editCount 수정 */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              편집 횟수 수정
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newCount}
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
                  {userData?.role === 'admin'
                    ? -userData?.editCount + 10
                    : -userData?.editCount + 3}
                  회
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* 푸터 안내 */}
        <footer className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">
            Administrator Access Only
          </p>
        </footer>
      </div>
    </div>
  );
}
