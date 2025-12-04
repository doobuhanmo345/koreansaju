// src/hooks/useLanguage.js

import { useLocalStorage } from './useLocalStorage';
import { useEffect } from 'react';

/**
 * 언어 상태(ko/en)를 로컬 스토리지에 저장하고, HTML lang 속성을 설정합니다.
 * @returns {array} [language, setLanguage]
 */
export function useLanguage() {
  // 1. useLocalStorage를 사용하여 상태 관리 (로컬 스토리지 읽기/쓰기)
  const [language, setLanguage] = useLocalStorage('userLanguage', 'en');

  // 2. 🚀 useEffect 로직 통합: 언어 상태가 변경될 때마다 HTML lang 속성 업데이트
  useEffect(() => {
    // 현재 언어 상태에 따라 HTML 문서의 'lang' 속성을 설정합니다.
    // 이는 접근성 및 검색 엔진에 중요한 역할을 합니다.
    document.documentElement.lang = language;

    // 참고: localStorage 저장은 useLocalStorage 훅 내부에 이미 구현되어 있습니다.
  }, [language]); // language 상태가 바뀔 때만 실행

  return [language, setLanguage];
}
