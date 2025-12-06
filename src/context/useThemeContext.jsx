import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeContextProvider({ children }) {
  // 1. 초기 시스템 테마를 즉시 확인합니다.
  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  // theme: 사용자가 선택한 테마 (저장소에서 로드, 기본값은 'light')
  const [theme, setTheme] = useState(localStorage.theme || 'light');

  // sysTheme: 현재 시스템 설정 테마 (localStorage에서 로드하지 않음)
  const [sysTheme, setSysTheme] = useState(getSystemTheme());

  // 함수 이름의 오타 수정 (Chainging -> Changing) 및 로직 통합
  const themeChanging = (currentTheme) => {
    const isDark =
      currentTheme === 'dark' || (currentTheme === 'system' && getSystemTheme() === 'dark');

    if (isDark) {
      document.documentElement.classList.add('dark');
      // localStorage.theme에 'dark' 또는 'light'를 저장하는 로직은
      // setTheme이 호출되는 곳(컴포넌트)에서 처리하는 것이 일반적입니다.
      // 여기서는 DOM 클래스만 관리합니다.
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // ⚠️ [수정 1] theme 상태가 변경될 때마다 DOM 클래스 업데이트
  useEffect(() => {
    themeChanging(theme);

    // 사용자가 테마를 변경했을 때 localStorage를 업데이트합니다.
    if (theme === 'dark' || theme === 'light') {
      localStorage.theme = theme;
    } else {
      localStorage.removeItem('theme'); // 'system'이면 저장소에서 제거
    }
  }, [theme]); // theme이 변경될 때마다 실행

  // ⚠️ [수정 2] 시스템 테마 변경 감지 및 메모리 정리 (Cleanup)
  useEffect(() => {
    // 초기 시스템 테마를 한 번 설정합니다.
    setSysTheme(getSystemTheme());

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // 리스너 함수 분리
    const handleSystemThemeChange = (e) => {
      setSysTheme(e.matches ? 'dark' : 'light');
    };

    // 이벤트 리스너 추가
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // 컴포넌트 언마운트 시 리스너 제거 (메모리 누수 방지)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  return (
    // themeChanging 함수는 이제 useEffect가 대신 처리하므로 제거했습니다.
    <ThemeContext.Provider value={{ theme, setTheme, sysTheme, setSysTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
