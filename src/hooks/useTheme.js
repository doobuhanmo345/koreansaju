// src/hooks/useTheme.js

import { useLocalStorage } from './useLocalStorage';
import { useEffect } from 'react';

/**
 * 테마 상태를 로컬 스토리지에 저장하고, DOM 클래스를 조작하는 Custom Hook
 * @returns {array} [theme, setTheme]
 */
export function useTheme() {
  // 'userTheme' 키를 사용하며, 초기값은 'light'입니다.
  const [theme, setTheme] = useLocalStorage('userTheme', 'light');

  // DOM 조작 로직을 이 Hook 내부에 통합
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // localStorage.theme = theme; // 이 로직은 useLocalStorage 내부에서 처리됨
  }, [theme]); // theme 상태가 바뀔 때만 실행

  return [theme, setTheme];
}
