import React, { createContext, useContext, useState, useEffect } from 'react';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  // 1. 전역에서 관리할 상태들 (병신같이 각 페이지마다 만들지 않아도 됨)
  const [aiResult, setAiResult] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);
  const [isCachedLoading, setIsCachedLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 2. 로딩이 시작되면 자동으로 progress를 올리는 핵심 로직
  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(
        () => {
          setProgress((prev) => {
            if (prev >= 99) return 99; // API 응답 전까지는 99%에서 대기
            return prev + (isCachedLoading ? 25 : 1);
          });
        },
        isCachedLoading ? 50 : 232,
      );
    } else {
      setProgress(100); // 로딩 꺼지면 즉시 100%
    }
    return () => clearInterval(interval);
  }, [loading, isCachedLoading]);

  // 3. 밖에서 "전부 빼올 수 있게" 하나로 묶음
  const value = {
    loading,
    setLoading,
    loadingType,
    setLoadingType,
    isCachedLoading,
    setIsCachedLoading,
    progress,
    setProgress,
    aiResult,
    setAiResult,
  };

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

// 4. 이 한 줄이 바로 "useLoading" (상태창고 열쇠)
export const useLoading = () => useContext(LoadingContext);
