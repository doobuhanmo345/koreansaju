import React, { useState, useEffect } from 'react';
import { ref, get, set, remove, child } from 'firebase/database';
import { database } from '../lib/firebase';

const EditPrompt = () => {
  const [targetPath, setTargetPath] = useState('basic');
  const [promptList, setPromptList] = useState(['basic', 'default', 'premium', 'test']);
  const [newPathName, setNewPathName] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. 전체 프롬프트 목록 가져오기 (prompt 노드 전체 탐색)
  const fetchPromptList = async () => {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, 'prompt'));
      if (snapshot.exists()) {
        const keys = Object.keys(snapshot.val());
        setPromptList(keys);
      }
    } catch (error) {
      console.error('목록 불러오기 실패:', error);
    }
  };

  // 2. 특정 프롬프트 내용 불러오기
  const fetchPromptContent = async () => {
    setIsLoading(true);
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `prompt/${targetPath}`));
      if (snapshot.exists()) {
        setPromptContent(snapshot.val());
        setMessage({ type: 'success', text: '프롬프트를 불러왔습니다.' });
      } else {
        setPromptContent('');
        setMessage({ type: 'error', text: '데이터가 없습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '불러오기 실패' });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 새 템플릿 추가
  const handleAddPath = async () => {
    const trimmedName = newPathName.trim().toLowerCase();
    if (!trimmedName) return alert('이름을 입력하세요.');
    if (promptList.includes(trimmedName)) return alert('이미 존재하는 이름입니다.');

    try {
      await set(ref(database, `prompt/${trimmedName}`), '새로운 프롬프트 내용을 입력하세요.');
      setNewPathName('');
      await fetchPromptList(); // 목록 갱신
      setTargetPath(trimmedName); // 추가한 곳으로 이동
      alert(`'${trimmedName}' 템플릿이 추가되었습니다.`);
    } catch (error) {
      alert('추가 실패');
    }
  };

  // 4. 템플릿 삭제
  const handleDeletePath = async () => {
    if (promptList.length <= 1) return alert('최소 한 개의 템플릿은 유지해야 합니다.');
    if (
      !window.confirm(`정말로 '${targetPath}' 템플릿을 삭제하시겠습니까? 데이터가 영구 삭제됩니다.`)
    )
      return;

    try {
      await remove(ref(database, `prompt/${targetPath}`));
      const remainingPaths = promptList.filter((p) => p !== targetPath);
      await fetchPromptList();
      setTargetPath(remainingPaths[0]); // 남은 첫 번째 템플릿으로 이동
      alert('삭제되었습니다.');
    } catch (error) {
      alert('삭제 실패');
    }
  };

  // 5. 저장
  const handleSave = async () => {
    if (!window.confirm(`${targetPath} 경로에 저장하시겠습니까?`)) return;
    setIsLoading(true);
    try {
      await set(ref(database, `prompt/${targetPath}`), promptContent);
      setMessage({ type: 'success', text: '성공적으로 저장되었습니다!' });
    } catch (error) {
      setMessage({ type: 'error', text: '저장 실패' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromptList();
  }, []);

  useEffect(() => {
    fetchPromptContent();
  }, [targetPath]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      <h1 className="text-2xl font-bold mb-6">AI 프롬프트 관리자</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 선택 및 삭제 섹션 */}
        <div className="p-4 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
          <label className="block text-sm font-semibold mb-2 text-blue-600 dark:text-blue-400">
            템플릿 선택 및 관리
          </label>
          <div className="flex gap-2">
            <select
              value={targetPath}
              onChange={(e) => setTargetPath(e.target.value)}
              className="flex-1 p-2 border rounded bg-white dark:bg-slate-700 dark:border-slate-600"
            >
              {promptList.map((path) => (
                <option key={path} value={path}>
                  {path.toUpperCase()}
                </option>
              ))}
            </select>
            <button
              onClick={handleDeletePath}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
            >
              삭제
            </button>
          </div>
        </div>

        {/* 새 경로 추가 섹션 */}
        <div className="p-4 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
          <label className="block text-sm font-semibold mb-2 text-green-600 dark:text-green-400">
            새 템플릿 추가
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPathName}
              onChange={(e) => setNewPathName(e.target.value)}
              placeholder="예: special_event"
              className="flex-1 p-2 border rounded bg-white dark:bg-slate-700 dark:border-slate-600"
            />
            <button
              onClick={handleAddPath}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
            >
              추가
            </button>
          </div>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div className="mb-4">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-mono text-blue-500">Path: prompt/{targetPath}</span>
          <span className="text-[11px] text-orange-500 font-medium">
            사용 가능한 변수: {'{{dayPillar}}, {{maxOhaeng}}, {{shinsal}}'} 등
          </span>
        </div>
        <textarea
          value={promptContent}
          onChange={(e) => setPromptContent(e.target.value)}
          className="w-full h-[500px] p-4 font-mono text-sm border rounded shadow-inner focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 outline-none"
          placeholder="프롬프트 내용을 작성하세요..."
        />
      </div>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isLoading}
        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20'}`}
      >
        {isLoading ? '통신 중...' : `${targetPath.toUpperCase()} 프롬프트 업데이트`}
      </button>
    </div>
  );
};

export default EditPrompt;
