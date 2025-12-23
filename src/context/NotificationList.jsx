import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  limit,
} from 'firebase/firestore';
import { useAuthContext } from '../context/useAuthContext';
import { BellIcon, CheckIcon, XMarkIcon, InboxIcon } from '@heroicons/react/24/outline';

export default function NotificationList() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!user) return;

    // 1. 복합 색인이 필요 없는 단순 쿼리로 변경 (orderBy 제거)
    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        // 2. 데이터를 가져온 후
        const notes = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // 3. 자바스크립트 메모리에서 직접 정렬 (성능 차이 없음, 인덱스 에러 완전 해결)
        const sortedNotes = notes.sort((a, b) => {
          // Firebase Timestamp 객체 또는 Date 객체를 숫자로 변환하여 비교
          const timeA = a.createdAt?.seconds || a.createdAt?.getTime?.() || 0;
          const timeB = b.createdAt?.seconds || b.createdAt?.getTime?.() || 0;
          return timeB - timeA; // 내림차순 (최신순)
        });

        setNotifications(sortedNotes.slice(0, 10)); // 상위 10개만 표시
        setLoading(false);
      },
      (err) => {
        console.error('알림 로드 에러:', err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (err) {
      console.error(err);
    }
  };

  
  if (loading && !user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* 알림 창 */}
      {isOpen && (
        <div className="w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-5 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-sm font-black text-gray-800 dark:text-white flex items-center gap-2">
              <BellIcon className="w-4 h-4 text-purple-500" />
              알림 센터
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-[1.5rem] border transition-all ${
                    note.isRead
                      ? 'bg-gray-50/50 dark:bg-slate-800/20 border-transparent opacity-60'
                      : 'bg-white dark:bg-slate-800 border-purple-100 dark:border-purple-900/30 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p
                      className={`text-[12px] font-bold leading-relaxed ${note.isRead ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}
                    >
                      {note.message}
                    </p>
                    {!note.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(note.id)}
                        className="shrink-0 p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 hover:bg-purple-100 transition-colors"
                      >
                        <CheckIcon className="w-3.5 h-3.5 stroke-[3px]" />
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">
                    {note.createdAt?.toDate().toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              // 알림이 하나도 없을 때 보여줄 화면
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                  <InboxIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400">새로운 알림이 없습니다.</p>
                <p className="text-[11px] text-gray-300">중요한 소식이 생기면 알려드릴게요!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-4 rounded-full shadow-2xl transition-all active:scale-95 group ${
          isOpen
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
            : 'bg-white dark:bg-slate-900 text-purple-600 border border-purple-50 dark:border-slate-800'
        }`}
      >
        <BellIcon
          className={`w-7 h-7 transition-transform ${isOpen ? '' : 'group-hover:rotate-12'}`}
        />

        {/* 읽지 않은 알림이 있을 때만 빨간 배지 표시 */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 text-[11px] text-white items-center justify-center font-black">
              {unreadCount}
            </span>
          </span>
        )}
      </button>
    </div>
  );
}
