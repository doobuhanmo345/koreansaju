import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useAuthContext } from '../context/useAuthContext';
import { BellIcon, CheckIcon, XMarkIcon, InboxIcon } from '@heroicons/react/24/outline';
import { useLanguage } from './useLanguageContext';

export default function NotificationList() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const language = useLanguage();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 알림창 바깥 클릭 시 닫기 로직
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const notes = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedNotes = notes.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setNotifications(sortedNotes.slice(0, 10));
    });
    return unsubscribe;
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 상단 벨 아이콘 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
      >
        <BellIcon
          className={`w-6 h-6 ${unreadCount > 0 ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'}`}
        />

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white items-center justify-center font-black">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* 드롭다운 알림창 (아이콘 바로 아래 배치) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-4 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-black text-gray-800 dark:text-white flex items-center gap-2">
              <BellIcon className="w-3.5 h-3.5 text-purple-500" />
              {language === 'ko' ? '알림' : 'Notification'}
            </span>
            <button onClick={() => setIsOpen(false)}>
              <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-3 space-y-2">
            {notifications.length > 0 ? (
              notifications.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    note.isRead
                      ? 'bg-transparent border-transparent opacity-50'
                      : 'bg-white dark:bg-slate-800 border-purple-50 dark:border-purple-900/20 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p
                      className={`text-[11px] font-bold leading-snug ${note.isRead ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}
                    >
                      {note.message}
                    </p>
                    {!note.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(note.id)}
                        className="shrink-0 p-1 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600"
                      >
                        <CheckIcon className="w-3 h-3 stroke-[3px]" />
                      </button>
                    )}
                  </div>
                  <p className="text-[8px] text-gray-400 mt-1.5 font-bold">
                    {note.createdAt?.toDate().toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <InboxIcon className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-[11px] font-bold text-gray-400">
                  {language === 'ko' ? '알림이 없습니다.' : 'No notifications.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
