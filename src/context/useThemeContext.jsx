import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeContextProvider({ children }) {
  // 1. 상태를 'light'로 고정합니다.
  const [theme, setTheme] = useState('light');
  const [sysTheme, setSysTheme] = useState('light');

  useEffect(() => {
    // 2. 실행 시점에 무조건 dark 클래스를 제거합니다.
    document.documentElement.classList.remove('dark');
    
    // 3. 만약 기존에 저장된 dark 테마 값이 있다면 초기화합니다.
    localStorage.theme = 'light';
  }, []);

  // 테마를 변경하려는 시도가 있어도 무시하거나 light로 유지하도록 합니다.
  const forceLightSetTheme = () => {
    setTheme('light');
    localStorage.theme = 'light';
  };

  return (
    // setTheme을 호출해도 light가 유지되도록 forceLightSetTheme을 전달하거나, 
    // 그냥 setTheme 자체를 'light' 고정용으로 넘깁니다.
    <ThemeContext.Provider value={{ theme: 'light', setTheme: forceLightSetTheme, sysTheme: 'light', setSysTheme: forceLightSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}