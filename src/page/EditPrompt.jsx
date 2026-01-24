import React, { useState, useEffect, useRef } from 'react';
import { ref, get, set, remove, child } from 'firebase/database';
import { database } from '../lib/firebase';
import {
  match_var,
  saza_var,
  new_year_var,
  basic_var,
  wealth_var,
  daily_var,
  daily_s_var,
  seldate_var,
  selbirth_var
} from '../data/promptVar';

const EditPrompt = () => {
  const [targetPath, setTargetPath] = useState('basic');
  const [promptList, setPromptList] = useState(['basic', 'default', 'premium', 'test']);
  const [newPathName, setNewPathName] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const promptArea = useRef(null);

  // 1. 전체 프롬프트 목록 가져오기 (prompt 노드 전체 탐색)
  const fetchPromptList = async () => {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, 'prompt'));
      if (snapshot.exists()) {
        const keys = Object.keys(snapshot.val()).sort();
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

  // 변수 삽입
  const insertVariable = (variable) => {
    const textarea = promptArea.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newContent = promptContent.substring(0, start) + variable + promptContent.substring(end);
    setPromptContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const variableMapper = {
    basic: basic_var,
    match_basic: match_var,
    daily_basic: daily_var,
    new_year_basic: new_year_var,
    saza_basic: saza_var,
    wealth_basic: wealth_var,
    daily_s_basic: daily_s_var,
    seldate_basic: seldate_var,
    selbirth_basic: selbirth_var
  };

  // 필터링 및 그룹화 로직
  const filteredPrompts = promptList.filter(path => 
    path.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort();

  // 그룹화 (예: seldate_basic, seldate_format -> group 'seldate')
  const promptGroups = filteredPrompts.reduce((acc, path) => {
    const parts = path.split('_');
    let prefix = 'core';
    
    if (path.includes('_')) {
      if (parts[0] === 'daily' && parts[1] === 's') {
        prefix = 'daily_s';
      } else if (parts[0] === 'new' && parts[1] === 'year') {
        prefix = 'new_year';
      } else {
        prefix = parts[0];
      }
    }
    
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(path);
    return acc;
  }, {});

  const [expandedGroups, setExpandedGroups] = useState({ core: true });

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  useEffect(() => {
    // 검색어가 있으면 모든 그룹 자동 펼치기
    if (searchTerm) {
      const allExpanded = Object.keys(promptGroups).reduce((acc, key) => ({ ...acc, [key]: true }), {});
      setExpandedGroups(allExpanded);
    }
  }, [searchTerm]);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
            PROMPT <span className="text-blue-600">COMMANDER</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Hierarchy Online
          </p>
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search commands..."
            className="px-4 py-2 bg-transparent outline-none text-sm w-48 md:w-64"
          />
          <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-400 flex items-center">
            {filteredPrompts.length} ITEMS
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR: NAVIGATION */}
        <aside className="lg:col-span-1 space-y-6">
          
          <div className="space-y-4">
            {Object.entries(promptGroups).map(([groupName, items]) => (
              <div key={groupName} className="bg-white/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden transition-all">
                {/* Group Header */}
                <button 
                  onClick={() => toggleGroup(groupName)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className={`w-1 h-3 rounded-full ${groupName === 'core' ? 'bg-blue-600' : 'bg-slate-400'}`}></span>
                    {groupName}
                  </span>
                  <svg className={`w-3 h-3 text-slate-300 transition-transform ${expandedGroups[groupName] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Group Items */}
                {expandedGroups[groupName] && (
                  <div className="px-2 pb-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                    {items.map(path => {
                      const isBasic = path.endsWith('_basic') || path === 'basic';
                      return (
                        <button
                          key={path}
                          onClick={() => setTargetPath(path)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative overflow-hidden group/item ${
                            targetPath === path
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between relative z-10">
                            <span className={isBasic ? 'text-blue-600 dark:text-blue-400 group-hover/item:text-blue-500' : ''}>
                               {targetPath === path ? path : path}
                            </span>
                            {isBasic && (
                              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-tighter shadow-sm ${
                                targetPath === path ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                              }`}>
                                CORE
                              </span>
                            )}
                          </div>
                          {isBasic && targetPath !== path && (
                            <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10 pointer-events-none"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Create Section */}
          <div className="pt-6">
             <div className="p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                <label className="block text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-3">
                  Quick Create
                </label>
                <input
                  type="text"
                  value={newPathName}
                  onChange={(e) => setNewPathName(e.target.value)}
                  placeholder="New path name..."
                  className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20 text-xs mb-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
                />
                <button
                  onClick={handleAddPath}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  Confirm Addition
                </button>
             </div>
          </div>
        </aside>

        {/* MAIN EDITOR AREA */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* EDITOR HEADER */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Editing: <span className="text-blue-600">{targetPath}</span>
              </h2>
              <button 
                onClick={handleDeletePath}
                className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest transition-colors"
              >
                Delete File
              </button>
            </div>
            {message.text && (
              <div className={`text-[11px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-2 ${message.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {message.text}
              </div>
            )}
          </div>

          {/* VARIABLE INSERTION TRAY */}
          {variableMapper[targetPath] && (
            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4 ml-1">
                <span className="w-1 h-3 bg-blue-600 rounded-full"></span>
                <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Insert Variables
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {variableMapper[targetPath].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => insertVariable(item.key)}
                    className="text-left p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-slate-100 dark:border-slate-700 rounded-xl transition-all group active:scale-95"
                  >
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-black mb-0.5 truncate group-hover:text-blue-700">
                      {item.key}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium truncate">
                      {item.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MAIN TEXTAREA */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition-all duration-1000"></div>
            <textarea
              value={promptContent}
              ref={promptArea}
              onChange={(e) => setPromptContent(e.target.value)}
              className="relative w-full h-[650px] p-8 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono text-sm leading-relaxed rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800" spellCheck="false"
            />
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`w-full py-6 rounded-3xl font-black text-sm uppercase tracking-[0.4em] text-white shadow-2xl transition-all transform active:scale-[0.98] ${
              isLoading 
              ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 shadow-slate-300/50 dark:shadow-none'
            }`}
          >
            {isLoading ? 'Processing Signal...' : `Publish ${targetPath} Changes`}
          </button>
        </main>
      </div>
    </div>
  );
};

export default EditPrompt;
