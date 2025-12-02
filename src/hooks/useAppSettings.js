import { useState, useEffect } from 'react';

/**
 * localStorage와 동기화되는 React 상태를 관리하는 커스텀 훅.
 *
 * @param {string} key - localStorage에 저장할 항목의 키 (Key).
 * @param {any} initialValue - 키에 해당하는 값이 없을 경우 사용할 초기 값.
 * @returns {[any, (value: any) => void]} - [현재 상태 값, 상태 업데이트 함수]
 */
function useLocalStorage(key, initialValue) {
  // 1. 초기 상태 설정
  // useState에 함수를 전달하여, 컴포넌트가 처음 마운트될 때만 localStorage를 확인하도록 합니다.
  const [value, setValue] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      // 저장된 값이 있으면 JSON.parse를 통해 객체 형태로 반환합니다.
      // 문자열만 저장할 경우 이 줄은 생략 가능하나, 일반적인 useLocalStorage 패턴입니다.
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      // 오류 발생 시 (예: localStorage 접근 불가) 초기 값을 사용합니다.
      console.error('Error retrieving data from localStorage:', error);
      return initialValue;
    }
  });

  // 2. 상태 변경 시 localStorage에 저장 (Side Effect 관리)
  useEffect(() => {
    try {
      // value 상태가 변경될 때마다 localStorage에 저장합니다.
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [key, value]); // key 또는 value가 변경될 때마다 실행됩니다.

  // [현재 값, 값을 업데이트하는 함수]를 반환합니다.
  return [value, setValue];
}

export default useLocalStorage;
