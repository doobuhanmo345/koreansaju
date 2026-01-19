// pages/TestAnalysisPage.jsx

import { useState } from 'react';
import { SajuAnalysisService, AnalysisPresets } from '../service/SajuAnalysisService';
import { useAuthContext } from '../context/useAuthContext';
import { useLanguage } from '../context/useLanguageContext';
import { UI_TEXT, langPrompt, hanja } from '../data/constants';
import { calculateSaju } from '../utils/sajuCalculator';
import { calculateSajuData } from '../utils/sajuLogic';
import { DateService } from '../utils/dateService';
export default function TestAnalysisPage() {
  // Context
  const { user, userData } = useAuthContext();
  const { language } = useLanguage();

  // States
  const [editCount, setEditCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [step, setStep] = useState(0);

  // 사용자가 입력하는 데이터
  const [relationTypes, setRelationTypes] = useState([
    { id: 'lover', label: '연인' },
    { id: 'friend', label: '친구' },
    { id: 'business', label: '비즈니스' },
  ]);

  const [qTypes, setQTypes] = useState([
    { id: 'investment', label: '투자' },
    { id: 'business', label: '사업' },
    { id: 'income', label: '수입' },
  ]);

  const [subQTypes, setSubQTypes] = useState({
    investment: [
      { id: 'stock', prompt: '주식 투자는 어떤가요?' },
      { id: 'realestate', prompt: '부동산 투자는 어떤가요?' },
      { id: 'crypto', prompt: '가상화폐 투자는 어떤가요?' },
    ],
    business: [
      { id: 'startup', prompt: '창업은 어떤가요?' },
      { id: 'expansion', prompt: '사업 확장은 어떤가요?' },
    ],
    income: [
      { id: 'salary', prompt: '월급은 어떤가요?' },
      { id: 'side', prompt: '부업은 어떤가요?' },
    ],
  });

  // Service 생성 (동적으로 업데이트)
  const service = new SajuAnalysisService({
    user,
    userData,
    language,
    maxEditCount: 10,
    uiText: UI_TEXT,
    langPrompt,
    hanja,
    relationTypes,
    qTypes,
    subQTypes,
    setEditCount,
    setLoading,
    setLoadingType,
    setAiResult,
    setAiAnalysis,
    setStep,
  });

  // 테스트 데이터
  const testData = {
    saju: {
      sky0: '갑',
      grd0: '자',
      sky1: '을',
      grd1: '축',
      sky2: '병',
      grd2: '인',
      sky3: '정',
      grd3: '묘',
    },
    saju2: {
      sky0: '무',
      grd0: '진',
      sky1: '기',
      grd1: '사',
      sky2: '경',
      grd2: '오',
      sky3: '신',
      grd3: '미',
    },
    gender: 'male',
    gender2: 'female',
    inputDate: '1990-12-05T12:00',
    inputDate2: '1992-03-15T14:30',
    question: '제 직업운은 어떤가요?',
    birthData: { year: 1990, month: 12, day: 5 },
  };

  const [guestId] = useState('test_guest_' + Date.now());
  const [testLog, setTestLog] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [activeTab, setActiveTab] = useState('log');
  const [showConfigModal, setShowConfigModal] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog((prev) => [...prev, { timestamp, message, type }]);
  };

  // 테스트 함수들
  const tests = {
    basic: async () => {
      addLog('🚀 평생운세 테스트 시작', 'start');
      try {
        addLog('📊 실제 사주 데이터 생성 중...', 'info');

        // ✅ 파라미터 순서: inputDate, inputGender, isTimeUnknown, language
        const sajuData = calculateSajuData(
          testData.inputDate, // inputDate
          testData.gender, // inputGender
          false, // isTimeUnknown
          language, // language
        );

        if (!sajuData) {
          addLog('❌ 사주 데이터 생성 실패', 'error');
          return;
        }

        addLog('✅ 사주 데이터 생성 완료', 'success');
        addLog(`📋 일주: ${sajuData.pillars?.day || 'N/A'}`, 'info');
        console.log(sajuData);
        await service.analyze(
          AnalysisPresets.basic(
            { saju: testData.saju, gender: testData.gender, language },
            sajuData,
          ),
          (result) => {
            addLog('✅ 평생운세 완료!', 'success');
            addLog(`결과 길이: ${result?.length || 0}자`, 'info');
          },
        );
      } catch (error) {
        addLog('❌ 평생운세 실패: ' + error.message, 'error');
        console.error('평생운세 에러 상세:', error);
      }
    },

    saza: async () => {
      addLog('🚀 사자톡 테스트 시작', 'start');
      try {
        await service.analyze(
          AnalysisPresets.saza({
            saju: testData.saju,
            gender: testData.gender,
            inputDate: testData.inputDate,
            question: testData.question,
          }),
          () => addLog('✅ 사자톡 완료!', 'success'),
        );
      } catch (error) {
        addLog('❌ 사자톡 실패: ' + error.message, 'error');
      }
    },

    sazaGuest: async () => {
      addLog('🚀 사자톡(게스트) 테스트 시작', 'start');
      try {
        const isDuplicate = await service.checkGuestDuplicate(guestId, testData.saju);
        if (isDuplicate) {
          addLog('⚠️ 중복 감지됨 (정상 동작)', 'warning');
          return;
        }

        await service.analyze(
          AnalysisPresets.sazaGuest(
            {
              saju: testData.saju,
              gender: testData.gender,
              birthData: testData.birthData,
              question: testData.question,
            },
            guestId,
          ),
          () => addLog('✅ 사자톡(게스트) 완료!', 'success'),
        );
      } catch (error) {
        addLog('❌ 사자톡(게스트) 실패: ' + error.message, 'error');
      }
    },

    match: async () => {
      addLog('🚀 궁합 테스트 시작', 'start');
      try {
        await service.analyze(
          AnalysisPresets.match({
            saju: testData.saju,
            saju2: testData.saju2,
            gender: testData.gender,
            gender2: testData.gender2,
            inputDate: testData.inputDate,
            inputDate2: testData.inputDate2,
            relationship: 'lover',
            language,
          }),
          () => addLog('✅ 궁합 완료!', 'success'),
        );
      } catch (error) {
        addLog('❌ 궁합 실패: ' + error.message, 'error');
      }
    },

    newYear: async () => {
      addLog('🚀 신년 운세 테스트 시작', 'start');
      try {
        await service.analyze(
          AnalysisPresets.newYear({ saju: testData.saju, gender: testData.gender, language }),
          () => addLog('✅ 신년 운세 완료!', 'success'),
        );
      } catch (error) {
        addLog('❌ 신년 운세 실패: ' + error.message, 'error');
      }
    },

    newYearGuest: async () => {
      addLog('🚀 신년 운세(게스트) 테스트 시작', 'start');
      try {
        await service.analyze(
          AnalysisPresets.newYearGuest(
            { saju: testData.saju, gender: testData.gender, language },
            guestId,
          ),
          () => addLog('✅ 신년 운세(게스트) 완료!', 'success'),
        );
      } catch (error) {
        addLog('❌ 신년 운세(게스트) 실패: ' + error.message, 'error');
      }
    },

    daily: async () => {
      addLog('🚀 일일 운세 테스트 시작', 'start');
      try {
        await service.analyze(
          AnalysisPresets.daily({ saju: testData.saju, gender: testData.gender, language }),
          () => addLog('✅ 일일 운세 완료!', 'success'),
        );
      } catch (error) {
        addLog('❌ 일일 운세 실패: ' + error.message, 'error');
      }
    },

    wealth: async () => {
      addLog('🚀 재물 분석 테스트 시작', 'start');
      try {
        await service.analyze(
          AnalysisPresets.wealth({
            saju: testData.saju,
            gender: testData.gender,
            selectedQ: 'investment',
            selectedSubQ: 'stock',
            language,
          }),
          () => addLog('✅ 재물 분석 완료!', 'success'),
        );
      } catch (error) {
        addLog('❌ 재물 분석 실패: ' + error.message, 'error');
      }
    },
  };

  const runTest = async (testName) => {
    setSelectedTest(testName);
    setTestLog([]);
    setAiResult('');
    addLog(`=== ${testName.toUpperCase()} 테스트 시작 ===`, 'title');

    try {
      await tests[testName]();
    } catch (error) {
      console.error(error);
    }
  };

  const runAllTests = async () => {
    setTestLog([]);
    setAiResult('');
    addLog('🔥 전체 테스트 시작', 'title');

    for (const [name, testFn] of Object.entries(tests)) {
      addLog(`\n--- ${name} 테스트 ---`, 'title');
      try {
        await testFn();
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        addLog(`${name} 테스트 실패`, 'error');
      }
    }

    addLog('\n✨ 전체 테스트 완료', 'title');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🧪</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  SajuAnalysisService Test Lab
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  모든 분석 타입을 테스트하여 정상 동작 확인
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <span>⚙️</span>
              <span>설정</span>
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border-l-4 border-indigo-500">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Status
            </div>
            <div className="text-2xl font-bold">
              {loading ? (
                <span className="text-orange-500 animate-pulse">⏳ Loading...</span>
              ) : (
                <span className="text-green-500">✅ Ready</span>
              )}
            </div>
            {loadingType && (
              <div className="text-xs text-gray-500 mt-1 font-mono">{loadingType}</div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border-l-4 border-blue-500">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Usage Count
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {editCount} / 10
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {editCount >= 10 ? '한도 도달' : `${10 - editCount}회 남음`}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border-l-4 border-purple-500">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Result Length
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {aiResult ? `${aiResult.length}` : '-'}
            </div>
            <div className="text-xs text-gray-500 mt-1">{aiResult ? '문자' : '결과 대기 중'}</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border-l-4 border-green-500">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Active Test
            </div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400 truncate">
              {selectedTest || 'None'}
            </div>
            <div className="text-xs text-gray-500 mt-1">{testLog.length} logs</div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">테스트 선택</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
            {[
              {
                name: 'basic',
                label: '평생운세',
                color:
                  'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
              },
              {
                name: 'saza',
                label: '사자톡',
                color:
                  'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
              },
              {
                name: 'sazaGuest',
                label: '사자톡(게스트)',
                color:
                  'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
              },
              {
                name: 'match',
                label: '궁합',
                color:
                  'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
              },
              {
                name: 'newYear',
                label: '신년운세',
                color:
                  'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
              },
              {
                name: 'newYearGuest',
                label: '신년(게스트)',
                color:
                  'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700',
              },
              {
                name: 'daily',
                label: '일일운세',
                color:
                  'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
              },
              {
                name: 'wealth',
                label: '재물분석',
                color:
                  'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
              },
            ].map((test) => (
              <button
                key={test.name}
                onClick={() => runTest(test.name)}
                disabled={loading}
                className={`${test.color} text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 
                  transform hover:scale-105 active:scale-95`}
              >
                {test.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-white px-6 py-4 rounded-xl font-black text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              🔥 전체 테스트 실행
            </button>

            <button
              onClick={() => {
                setTestLog([]);
                setAiResult('');
                setSelectedTest('');
              }}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200"
            >
              🗑️ 초기화
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('log')}
              className={`flex-1 px-6 py-4 font-bold text-sm transition-colors ${
                activeTab === 'log'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
            >
              📋 실행 로그 ({testLog.length})
            </button>
            <button
              onClick={() => setActiveTab('result')}
              className={`flex-1 px-6 py-4 font-bold text-sm transition-colors ${
                activeTab === 'result'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
            >
              📄 AI 결과 {aiResult && `(${aiResult.length}자)`}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'log' ? (
              <div className="bg-gray-900 rounded-xl p-4 h-[600px] overflow-y-auto font-mono text-sm">
                {testLog.length === 0 ? (
                  <div className="text-gray-500 text-center py-20">
                    테스트를 시작하려면 버튼을 클릭하세요...
                  </div>
                ) : (
                  testLog.map((log, index) => (
                    <div
                      key={index}
                      className={`mb-1 ${
                        log.type === 'error'
                          ? 'text-red-400'
                          : log.type === 'success'
                            ? 'text-green-400'
                            : log.type === 'warning'
                              ? 'text-yellow-400'
                              : log.type === 'title'
                                ? 'text-cyan-400 font-bold text-base'
                                : log.type === 'start'
                                  ? 'text-blue-400 font-semibold'
                                  : 'text-gray-300'
                      }`}
                    >
                      <span className="text-gray-600">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-6 h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">🔮</span>
                      </div>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mt-6 font-semibold">
                      AI 분석 중...
                    </div>
                    {loadingType && (
                      <div className="text-sm text-gray-500 dark:text-gray-500 mt-2 font-mono">
                        Type: {loadingType}
                      </div>
                    )}
                  </div>
                ) : aiResult ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 mb-4">
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        TEST: {selectedTest}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Length: {aiResult.length} characters
                      </div>
                    </div>
                    <div
                      className="whitespace-pre-wrap leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: aiResult }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📝</div>
                      <div className="text-lg font-medium">결과가 여기에 표시됩니다</div>
                      <div className="text-sm mt-2">테스트를 실행해주세요</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Test Data Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mt-6">
          <details className="cursor-pointer group">
            <summary className="font-bold text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2">
              <span className="text-lg">🔧 테스트 데이터</span>
              <span className="text-xs text-gray-500 group-open:hidden">(클릭하여 보기)</span>
            </summary>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl mt-4 overflow-x-auto text-xs font-mono border border-gray-700">
              {JSON.stringify(
                {
                  ...testData,
                  guestId,
                  language,
                  user: user ? { uid: user.uid, email: user.email } : null,
                },
                null,
                2,
              )}
            </pre>
          </details>
        </div>
      </div>

      {/* 설정 모달 */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">⚙️ 설정</h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* RELATION_TYPES */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  RELATION_TYPES (궁합 관계 타입)
                </label>
                <textarea
                  value={JSON.stringify(relationTypes, null, 2)}
                  onChange={(e) => {
                    try {
                      setRelationTypes(JSON.parse(e.target.value));
                    } catch (err) {
                      console.error('Invalid JSON');
                    }
                  }}
                  className="w-full h-40 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm"
                  placeholder='[{"id": "lover", "label": "연인"}]'
                />
                <p className="text-xs text-gray-500 mt-1">JSON 형식으로 입력하세요</p>
              </div>

              {/* Q_TYPES */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Q_TYPES (재물 질문 타입)
                </label>
                <textarea
                  value={JSON.stringify(qTypes, null, 2)}
                  onChange={(e) => {
                    try {
                      setQTypes(JSON.parse(e.target.value));
                    } catch (err) {
                      console.error('Invalid JSON');
                    }
                  }}
                  className="w-full h-40 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm"
                  placeholder='[{"id": "investment", "label": "투자"}]'
                />
                <p className="text-xs text-gray-500 mt-1">JSON 형식으로 입력하세요</p>
              </div>

              {/* SUB_Q_TYPES */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  SUB_Q_TYPES (재물 하위 질문 타입)
                </label>
                <textarea
                  value={JSON.stringify(subQTypes, null, 2)}
                  onChange={(e) => {
                    try {
                      setSubQTypes(JSON.parse(e.target.value));
                    } catch (err) {
                      console.error('Invalid JSON');
                    }
                  }}
                  className="w-full h-60 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm"
                  placeholder='{"investment": [{"id": "stock", "prompt": "주식은?"}]}'
                />
                <p className="text-xs text-gray-500 mt-1">JSON 객체 형식으로 입력하세요</p>
              </div>

              {/* 저장 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors"
                >
                  ✅ 저장하고 닫기
                </button>
                <button
                  onClick={() => {
                    setRelationTypes([
                      { id: 'lover', label: '연인' },
                      { id: 'friend', label: '친구' },
                      { id: 'business', label: '비즈니스' },
                    ]);
                    setQTypes([
                      { id: 'investment', label: '투자' },
                      { id: 'business', label: '사업' },
                      { id: 'income', label: '수입' },
                    ]);
                    setSubQTypes({
                      investment: [
                        { id: 'stock', prompt: '주식 투자는 어떤가요?' },
                        { id: 'realestate', prompt: '부동산 투자는 어떤가요?' },
                        { id: 'crypto', prompt: '가상화폐 투자는 어떤가요?' },
                      ],
                      business: [
                        { id: 'startup', prompt: '창업은 어떤가요?' },
                        { id: 'expansion', prompt: '사업 확장은 어떤가요?' },
                      ],
                      income: [
                        { id: 'salary', prompt: '월급은 어떤가요?' },
                        { id: 'side', prompt: '부업은 어떤가요?' },
                      ],
                    });
                  }}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
                >
                  🔄 초기화
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
