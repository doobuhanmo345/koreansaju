import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { useAuthContext } from '../context/useAuthContext';
export default function AdminPage() {
  const { user, userData } = useAuthContext(); // user: 인증 정보, userData: Firestore 정보
  const [newCount, setNewCount] = useState(0);

  // userData가 로드되면 input의 초기값 설정
  useEffect(() => {
    if (userData?.editCount !== undefined) {
      setNewCount(userData.editCount);
    }
  }, [userData]);

  if (!user) return <div>로그인이 필요합니다.</div>;

  // Firestore 문서 참조 (컬렉션 이름이 'users'라고 가정)
  const docRef = doc(db, 'users', user.uid);

  // 1. ZCookie 항목 삭제 기능
  const handleDeleteCookie = async () => {
    if (!confirm('ZCookie를 삭제하시겠습니까?')) return;

    try {
      await updateDoc(docRef, {
        ZCookie: deleteField(), // 필드 자체를 삭제
      });
      alert('ZCookie가 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  // 2. editCount 숫자 수정 기능
  const handleUpdateCount = async () => {
    try {
      if (userData?.role === 'admin') {
        await updateDoc(docRef, {
          editCount: -Number(newCount) + 10, // 숫자로 변환하여 저장
        });
      } else {
        await updateDoc(docRef, {
          editCount: -Number(newCount) + 3, // 숫자로 변환하여 저장
        });
      }

      alert('숫자가 업데이트되었습니다.');
    } catch (error) {
      console.error('수정 실패:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        {/* 헤더 섹션 */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            관리자 페이지
          </h1>
          {/* <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-400 dark:text-gray-500">사용자 ID:</span>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-mono text-gray-600 dark:text-gray-300">
              {user.uid}
            </code>
          </div> */}
        </header>

        <div className="space-y-10">
          {/* ZCookie 삭제 영역 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
              데이터 관리
            </h3>

            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              {userData?.ZCookie ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      포춘 쿠키 데이터
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      현재 사용자의 ZCookie 데이터가 존재합니다.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteCookie}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-sm active:scale-95"
                  >
                    데이터 초기화
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2 italic">
                  삭제할 ZCookie 데이터가 없습니다.
                </p>
              )}
            </div>
          </section>

          {/* editCount 수정 영역 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              편집 횟수 수정
            </h3>

            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-grow max-w-[120px]">
                    <input
                      type="number"
                      onChange={(e) => setNewCount(e.target.value)}
                      className="block w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 shadow-sm
                                 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleUpdateCount}
                    className="px-5 py-2.5 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-black dark:hover:bg-white text-white text-sm font-medium rounded-lg transition-all shadow-sm active:scale-95"
                  >
                    변경 사항 저장
                  </button>
                </div>

                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    현재 DB 저장 값
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                    {userData?.role === 'admin' ? (
                      <>{-userData?.editCount + 10 ?? 0}회</>
                    ) : (
                      <> {-userData?.editCount + 3 ?? 0}회</>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 푸터 안내 */}
        <footer className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">
            Administrator Access Only
          </p>
        </footer>
      </div>
    </div>
  );
}
