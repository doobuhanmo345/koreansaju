import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuthContext } from '../context/useAuthContext';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function MessageModal({ isOpen, onClose, receiverId = 'admin', receiverName = 'Admin', originalMessageId = null }) {
  const { user, userData } = useAuthContext();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!text.trim() || isSending) return;
    if (!user) {
      alert('You must be logged in to send messages.');
      return;
    }
    setIsSending(true);

    try {
      const msgRef = await addDoc(collection(db, 'direct_messages'), {
        senderId: user.uid,
        senderName: userData?.displayName || user.email || 'Anonymous',
        receiverId: receiverId,
        receiverName: receiverName,
        text: text.trim(),
        isRead: false,
        createdAt: serverTimestamp(),
      });
      const messageId = msgRef.id;

      // 알림 발송 로직
      try {
        if (receiverId === 'admin') {
          // [유저 -> 관리자] 통합 관리자 역할('admin')로 알림 발송
          await addDoc(collection(db, 'notifications'), {
            targetRole: 'admin',
            title: '새 문의 도착',
            message: `[${userData?.displayName || '유저'}] ${text.trim().substring(0, 30)}${text.length > 30 ? '...' : ''}`,
            type: 'message',
            senderId: user.uid,
            senderName: userData?.displayName || 'User',
            sourceMessageId: messageId, // 원본 메시지 링크
            isRead: false,
            createdAt: serverTimestamp(),
          });
        } else {
          // [관리자 -> 유저] 해당 유저에게 알림 발송
          await addDoc(collection(db, 'notifications'), {
            userId: receiverId,
            title: '새 메시지 도착',
            message: '관리자로부터 새로운 메시지가 도착했습니다.',
            type: 'message',
            sourceMessageId: messageId, // 원본 메시지 링크
            isRead: false,
            createdAt: serverTimestamp(),
          });
        }
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
      }

      // 만약 원본 메시지 ID가 있다면 해당 메시지를 '처리됨'으로 마킹
      if (originalMessageId) {
        try {
          await updateDoc(doc(db, 'direct_messages', originalMessageId), {
            isProcessed: true
          });
        } catch (updateError) {
          console.error('Error marking as processed:', updateError);
        }
      }

      setText('');
      onClose();
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden transform animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Send Message
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              To: <span className="text-blue-600">{receiverName}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your inquiry or message here..."
            className="w-full h-40 p-4 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-3xl border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none text-sm leading-relaxed"
          />

          <button
            onClick={handleSend}
            disabled={!text.trim() || isSending}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isSending || !text.trim()
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700'
            }`}
          >
            {isSending ? (
              <span className="animate-pulse">Sending...</span>
            ) : (
              <>
                Confirm & Send
                <PaperAirplaneIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
