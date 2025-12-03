// src/hooks/useContactModal.js

import { useState } from 'react';

/**
 * 문의 모달의 상태와 제어 함수를 관리하는 Custom Hook
 * @returns {object} { isContactModalOpen, handleShowContact, handleCloseContact }
 */
export default function useContactModal() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // 팝업을 띄우는 함수를 정의합니다.
  const handleShowContact = () => {
    setIsContactModalOpen(true);
  };

  // 팝업을 닫는 함수
  const handleCloseContact = () => {
    setIsContactModalOpen(false);
  };

  return {
    isContactModalOpen,
    handleShowContact,
    handleCloseContact,
  };
}
