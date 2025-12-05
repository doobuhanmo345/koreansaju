import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeContextProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.theme);
  const [sysTheme, setSysTheme] = useState(localStorage.theme);
  const themeChainging = () => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  useEffect(() => {
    themeChainging();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      setSysTheme(e.matches ? 'dark' : 'light');
    });
  });
  return (
    <ThemeContext.Provider value={{ themeChainging, theme, setTheme, sysTheme, setSysTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
