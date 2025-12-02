import { useState, useEffect, useCallback } from 'react';

/**
 * 모달의 열림/닫힘 상태를 관리하고, 모달 상태에 따라 배경 스크롤을 제어하는 커스텀 훅입니다.
 * @returns {{isModalOpen: boolean, openModal: function, closeModal: function, toggleModal: function}}
 */
export function useModal() {
  // 1. 상태 관리 (원래 컴포넌트에 있던 useState)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 모달을 여는 함수
  const openModal = useCallback(() => setIsModalOpen(true), []);

  // 모달을 닫는 함수
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // 모달 상태를 토글하는 함수 (선택적)
  const toggleModal = useCallback(() => setIsModalOpen((prev) => !prev), []);

  // 2. 부수 효과 관리 (원래 컴포넌트에 있던 useEffect)
  useEffect(() => {
    // isModalOpen 상태에 따라 body 스크롤을 제어
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // 클린업 함수: 컴포넌트 언마운트 시 또는 상태 변경 직전에 overflow를 복구
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]); // isModalOpen 상태가 바뀔 때만 실행

  return { isModalOpen, openModal, closeModal, toggleModal };
}
