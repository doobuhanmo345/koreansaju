import { useState, useEffect, useRef } from 'react';
import { pillarStyle, iconsViewStyle, pillarLabelStyle, jiStyle } from '../data/style';
import { UI_TEXT } from '../data/constants';
import { getIcon, classNames, getHanja, bgToBorder, getEng } from '../utils/helpers';
import processSajuData from '../sajuDataProcessor';
import { useLanguage } from '../context/useLanguageContext';
import { useTheme } from '../context/useThemeContext';

export default function LoadingFourPillar({ isTimeUnknown, saju }) {
  const { language } = useLanguage();
  const { theme } = useTheme();

  // 분석 상태 관리
  const [analysisStep, setAnalysisStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [subLog, setSubLog] = useState('');
  const [isDeepAnalyzing, setIsDeepAnalyzing] = useState(false);

  // ★ 게이지 리셋 방지용 메모리
  const elapsedRef = useRef(0);

  const processedData = processSajuData(saju);
  const {
    sigan,
    ilgan,
    wolgan,
    yeongan,
    sijidata,
    sijiji,
    iljidata,
    iljiji,
    woljidata,
    woljiji,
    yeonjidata,
    yeonjiji,
  } = processedData;

  useEffect(() => {
    const totalDuration = 75000; // 75초
    const intervalTime = 100;

    // 1. 메인 프로그레스 타이머
    const mainTimer = setInterval(() => {
      if (elapsedRef.current < totalDuration) {
        elapsedRef.current += intervalTime;
      }
      const currentProgress = (elapsedRef.current / totalDuration) * 100;

      if (currentProgress >= 100) {
        setProgress(100);
        setIsDeepAnalyzing(true);
      } else {
        setProgress(currentProgress);
      }

      const cur = elapsedRef.current;
      if (cur < 15000) setAnalysisStep(1);
      else if (cur < 30000) setAnalysisStep(2);
      else if (cur < 45000) setAnalysisStep(3);
      else if (cur < 60000) setAnalysisStep(4);
      else setAnalysisStep(5);
    }, intervalTime);

    // 2. 다국어 서브 로그 데이터 정의
    const logData = {
      ko: {
        deep: [
          'Quantum Destiny Mapping...',
          '운명의 실타래 최종 조율 중',
          '27인 마스터 데이터 매칭 완료',
          '결과 보고서 패키징 중...',
        ],
        standard: [
          '오행의 균형도 측정 중...',
          '지장간 내 숨겨진 기운 추출...',
          '용신과 희신 교차 검증 중...',
          '27인 명리학자 가중치 적용...',
        ],
      },
      en: {
        deep: [
          'Quantum Destiny Mapping...',
          'Fine-tuning the threads of fate...',
          'Master dataset matching complete...',
          'Packaging success report...',
        ],
        standard: [
          'Measuring Five Elements balance...',
          'Extracting hidden stem energies...',
          'Cross-validating auspicious elements...',
          'Applying 27 Saju master weights...',
        ],
      },
    };

    // 3. 서브 로그 업데이트 타이머
    const logInterval = setInterval(
      () => {
        const currentLang = language === 'en' ? 'en' : 'ko';
        const currentMode = isDeepAnalyzing ? 'deep' : 'standard';
        const selectedLogs = logData[currentLang][currentMode];

        setSubLog(selectedLogs[Math.floor(Math.random() * selectedLogs.length)]);
      },
      isDeepAnalyzing ? 1200 : 2500,
    );

    return () => {
      clearInterval(mainTimer);
      clearInterval(logInterval);
    };
  }, [isDeepAnalyzing, language]); // language 추가: 언어 변경 시 즉시 반영
  const statusMessages = {
    1: '년주 분석: 타고난 가문의 기운과 근본적 에너지 스캔 중 (1/5)',
    2: '월주 분석: 사회적 성취도와 직업적 환경 빅데이터 분석 중 (2/5)',
    3: '일주 분석: 당신의 본질과 배우자 운의 조화 식별 중 (3/5)',
    4: '시주 분석: 미래의 잠재력과 인생의 결실 포인트 도출 중 (4/5)',
    5: isDeepAnalyzing
      ? '당신만을 위한 고유한 리포트를 정갈하게 정리 중입니다'
      : '최종 합산: 전체적인 기운을 조율하는 중...(5/5)',
  };
  const statusMessagesEn = {
    1: 'Year Pillar: Scanning ancestral energy and fundamental roots (1/5)',
    2: 'Month Pillar: Analyzing social success and career environment (2/5)',
    3: 'Day Pillar: Identifying your core essence and relationship harmony (3/5)',
    4: 'Hour Pillar: Mapping out future potential and life milestones (4/5)',
    5: isDeepAnalyzing
      ? 'Crafting your unique, personalized report with precision...'
      : 'Final Synthesis: Harmonizing the overall energy flow (5/5)',
  };

  return (
    <div className="flex flex-col items-center justify-center py-5 select-none px-2 relative">
      {/* 100% 시 은은한 배경 광원 */}
      {isDeepAnalyzing && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.08)_0%,transparent_70%)] animate-pulse pointer-events-none" />
      )}

      <div className="mb-10 w-full max-w-md text-center">
        <div className="relative inline-block">
          <div className="flex flex-col items-center">
            <span
              className={`text-[10px] tracking-[0.4em] mb-2 uppercase transition-all ${isDeepAnalyzing ? 'text-sky-500 font-bold' : 'text-slate-400 font-light'}`}
            >
              {isDeepAnalyzing ? 'Final Synthesis' : 'Scanning Destiny'}
            </span>
            <div className="relative flex items-center justify-center">
              <h2
                className={`text-7xl font-light font-serif italic tracking-tighter transition-all duration-1000 ${isDeepAnalyzing ? 'animate-prism text-sky-500' : 'text-slate-800 dark:text-slate-100'}`}
              >
                {Math.floor(progress)}
              </h2>
              <span
                className={`absolute -right-6 top-2 text-sm font-medium ${isDeepAnalyzing ? 'text-sky-400' : 'text-sky-400/80'}`}
              >
                %
              </span>
            </div>
          </div>
          <div className="w-12 h-[1px] bg-slate-200 dark:bg-slate-700 mx-auto mt-6 mb-6"></div>
          <div className="space-y-2">
            <h3 className="text-md font-serif font-light italic text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
              <span className="not-italic font-normal">“</span>
              {language === 'en' ? statusMessagesEn[analysisStep] : statusMessages[analysisStep]}

              <span className="not-italic font-normal">”</span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 transition-opacity duration-1000">
              {language === 'en' ? (
                <>{subLog || 'Discovering your unique inner radiance'}</>
              ) : (
                <>{subLog || '당신만의 고유한 빛을 찾아내고 있습니다'}</>
              )}
            </p>
            {/* 페이지 이탈 방지 경고 추가 */}
            <div className="mt-4 animate-pulse flex items-center justify-center gap-1.5">
              <span className="text-amber-500 dark:text-amber-400 text-xs">⚠️</span>
              <p className="text-[12px] font-bold text-rose-500/90 dark:text-rose-400/90 tracking-tight">
                {language === 'en' 
                  ? 'Analysis in progress. Please do not leave this page.' 
                  : '분석 중입니다. 페이지를 나가지 마세요.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        id="saju-capture"
        style={{ width: `470px`, maxWidth: '100%' }}
        className={`relative rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden m-auto py-2 bg-white dark:bg-slate-800 shadow-2xl transition-all duration-1000 ${isDeepAnalyzing ? 'ring-1 ring-sky-400/30' : ''}`}
      >
        {/* 100%일 때 카드 전체 쉬머 효과 */}
        {isDeepAnalyzing && (
          <div className="absolute inset-0 z-50 animate-card-shimmer pointer-events-none" />
        )}

        <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
          <div
            className={`h-1/2 w-full relative bg-gradient-to-b ${theme === 'dark' ? 'from-indigo-950/80 to-blue-900/60' : 'from-sky-400/40 to-white/5'}`}
          />
          <div
            className={`h-1/2 w-full relative bg-gradient-to-b border-t ${theme === 'dark' ? 'from-slate-800/50 to-gray-900/70 border-slate-700/30' : 'from-stone-300/40 to-amber-100/60 border-stone-400/20'}`}
          />
        </div>

        <div className="relative z-10 flex justify-center bg-white/10 backdrop-blur-[2px]">
          <div className="flex flex-col max-xs:hidden items-end pt-[10px] opacity-40">
            <div className="h-4" />
            <div className="h-[90px] flex items-center pr-2 border-r border-sky-700/30">
              <span className="text-[10px] font-bold text-sky-700 dark:text-cyan-600 uppercase">
                {language === 'en' ? 'Stem' : '천간'}
              </span>
            </div>
            <div className="h-[110px] flex items-center pr-2 border-r border-stone-400/20">
              <span className="text-[10px] font-bold text-stone-500 dark:text-yellow-600 uppercase">
                {language === 'en' ? 'Branch' : '지지'}
              </span>
            </div>
          </div>

          <div className="flex">
            {/* 시주 (Hour) */}
            {!isTimeUnknown && !!saju.grd0 && (
              <PillarBox isActive={analysisStep === 4} isDone={analysisStep > 4}>
                <div className={pillarStyle}>
                  <div className={pillarLabelStyle}>{UI_TEXT.hour[language]}</div>
                  <div
                    className={classNames(
                      iconsViewStyle,
                      saju.sky0 ? bgToBorder(sigan.color) : 'border-gray-200',
                      'rounded-md w-16 px-2 flex flex-col items-center justify-center py-2',
                    )}
                  >
                    <div className="text-3xl mb-1">{getIcon(saju.sky0, 'sky')}</div>
                    {!!saju.sky0 && (
                      <div className="text-[10px] font-bold">{getHanja(saju.sky0, 'sky')}</div>
                    )}
                  </div>
                  <div
                    className={classNames(
                      iconsViewStyle,
                      saju.grd0 ? bgToBorder(sijidata.color) : 'border-gray-200',
                      'rounded-md w-16 flex flex-col items-center justify-center',
                    )}
                  >
                    <div className="text-3xl mb-1">{getIcon(saju.grd0, 'grd')}</div>
                    {!!saju.grd0 && (
                      <div className="text-[10px] font-bold">{getHanja(saju.grd0, 'grd')}</div>
                    )}
                    <div className="flex w-full opacity-50">
                      {sijiji.map((i, idx) => (
                        <div key={idx} className={[jiStyle, i.color, ''].join(' ')}>
                          <div className="text-[7px]">{i.sub.sky[1]}</div>
                          <div>{i.sub.sky[2]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PillarBox>
            )}

            {/* 일주 (Day) */}
            <PillarBox isActive={analysisStep === 3} isDone={analysisStep > 3}>
              <div
                className={classNames(
                  pillarStyle,
                  'bg-white/90 dark:bg-white/10 border-gray-400 border-[0.5px] border-dashed',
                )}
              >
                <span className={pillarLabelStyle}>{UI_TEXT.day[language]}</span>
                <div
                  className={classNames(
                    iconsViewStyle,
                    saju.sky1 ? bgToBorder(ilgan.color) : 'border-gray-200',
                    'rounded-md w-16 px-2 flex flex-col items-center justify-center py-2',
                  )}
                >
                  <div className="text-3xl mb-1">{getIcon(saju.sky1, 'sky')}</div>
                  {!!saju.sky1 && (
                    <div className="text-[10px] font-bold">{getHanja(saju.sky1, 'sky')}</div>
                  )}
                </div>
                <div
                  className={classNames(
                    iconsViewStyle,
                    saju.grd1 ? bgToBorder(iljidata.color) : 'border-gray-200',
                    'rounded-md w-16 flex flex-col items-center justify-center',
                  )}
                >
                  <div className="text-3xl mb-1">{getIcon(saju.grd1, 'grd')}</div>
                  {!!saju.grd1 && (
                    <div className="text-[10px] font-bold">{getHanja(saju.grd1, 'grd')}</div>
                  )}
                  <div className="flex w-full opacity-50">
                    {iljiji.map((i, idx) => (
                      <div key={idx} className={[jiStyle, i.color, ''].join(' ')}>
                        <div className="text-[7px]">{i.sub.sky[1]}</div>
                        <div>{i.sub.sky[2]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PillarBox>

            {/* 월주 (Month) */}
            <PillarBox isActive={analysisStep === 2} isDone={analysisStep > 2}>
              <div className={pillarStyle}>
                <span className={pillarLabelStyle}>{UI_TEXT.month[language]}</span>
                <div
                  className={classNames(
                    iconsViewStyle,
                    saju.sky2 ? bgToBorder(wolgan.color) : 'border-gray-200',
                    'rounded-md w-16 px-2 flex flex-col items-center justify-center py-2',
                  )}
                >
                  <div className="text-3xl mb-1">{getIcon(saju.sky2, 'sky')}</div>
                  {!!saju.sky2 && (
                    <div className="text-[10px] font-bold">{getHanja(saju.sky2, 'sky')}</div>
                  )}
                </div>
                <div
                  className={classNames(
                    iconsViewStyle,
                    saju.grd2 ? bgToBorder(woljidata.color) : 'border-gray-200',
                    'rounded-md w-16 flex flex-col items-center justify-center',
                  )}
                >
                  <div className="text-3xl mb-1">{getIcon(saju.grd2, 'grd')}</div>
                  {!!saju.grd2 && (
                    <div className="text-[10px] font-bold">{getHanja(saju.grd2, 'grd')}</div>
                  )}
                  <div className="flex w-full opacity-50">
                    {woljiji.map((i, idx) => (
                      <div key={idx} className={[jiStyle, i.color, ''].join(' ')}>
                        <div className="text-[7px]">{i.sub.sky[1]}</div>
                        <div>{i.sub.sky[2]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PillarBox>

            {/* 년주 (Year) */}
            <PillarBox isActive={analysisStep === 1} isDone={analysisStep > 1}>
              <div className={pillarStyle}>
                <span className={pillarLabelStyle}>{UI_TEXT.year[language]}</span>
                <div
                  className={classNames(
                    iconsViewStyle,
                    saju.sky3 ? bgToBorder(yeongan.color) : 'border-gray-200',
                    'rounded-md w-16 flex flex-col items-center justify-center py-2',
                  )}
                >
                  <div className="text-3xl mb-1">{getIcon(saju.sky3, 'sky')}</div>
                  {!!saju.sky3 && (
                    <div className="text-[10px] font-bold">{getHanja(saju.sky3, 'sky')}</div>
                  )}
                </div>
                <div
                  className={classNames(
                    iconsViewStyle,
                    saju.grd3 ? bgToBorder(yeonjidata.color) : 'border-gray-200',
                    'rounded-md w-16 flex flex-col items-center justify-center',
                  )}
                >
                  <div className="text-3xl mb-1">{getIcon(saju.grd3, 'grd')}</div>
                  {!!saju.grd3 && (
                    <div className="text-[10px] font-bold">{getHanja(saju.grd3, 'grd')}</div>
                  )}
                  <div className="flex w-full opacity-50">
                    {yeonjiji.map((i, idx) => (
                      <div key={idx} className={[jiStyle, i.color, ''].join(' ')}>
                        <div className="text-[7px]">{i.sub.sky[1]}</div>
                        <div>{i.sub.sky[2]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PillarBox>
          </div>
        </div>
      </div>

      <div className="mt-8 w-full flex flex-col items-center px-4">
        <div
          className={`w-full max-w-lg h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative ${isDeepAnalyzing ? 'animate-pulse' : ''}`}
        >
          <div
            className={classNames(
              'h-full bg-sky-500 transition-all duration-300 shadow-[0_0_15px_#0ea5e9]',
              isDeepAnalyzing
                ? 'w-full animate-infinite-loading bg-gradient-to-r from-sky-400 via-white to-sky-400'
                : '',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="mt-3 text-[9px] font-mono text-gray-400 tracking-[0.2em] uppercase">
          {isDeepAnalyzing
            ? 'SYSTEM_STABILIZATION_IN_PROGRESS'
            : 'ENCRYPTED_DATA_SCAN_PROCESS_ACTIVE'}
        </span>
      </div>

      <style>{`
        @keyframes scanMove { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .scan-line { position: absolute; left: 0; right: 0; height: 2px; background: #0ea5e9; box-shadow: 0 0 10px #0ea5e9; animation: scanMove 2.5s linear infinite; }
        
        @keyframes prism { 0% { filter: hue-rotate(0deg) brightness(1); } 50% { filter: hue-rotate(45deg) brightness(1.2); } 100% { filter: hue-rotate(0deg) brightness(1); } }
        .animate-prism { animation: prism 3s ease-in-out infinite; }

        @keyframes card-shimmer {
          0% { transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); }
          100% { transform: translateX(100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); }
        }
        .animate-card-shimmer { animation: card-shimmer 2s infinite; }

        @keyframes infiniteLoading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-infinite-loading { position: relative; overflow: hidden; animation: infiniteLoading 1.5s infinite; }
      `}</style>
    </div>
  );
}

function PillarBox({ isActive, isDone, children }) {
  return (
    <div
      className={`relative px-1 transition-all duration-700 ${isActive ? 'scale-105 z-20' : 'z-10'} ${!isActive && !isDone ? 'opacity-20 grayscale blur-[1px]' : 'opacity-100 grayscale-0'}`}
    >
      {isActive && (
        <div className="absolute inset-0 z-30 pointer-events-none rounded-xl overflow-hidden border-2 border-sky-400/50">
          <div className="scan-line" />
        </div>
      )}
      {children}
    </div>
  );
}
