import { useState, useEffect } from 'react';
import { pillarStyle, iconsViewStyle, pillarLabelStyle, jiStyle } from '../data/style';
import { UI_TEXT } from '../data/constants';
import { getIcon, classNames, getHanja, bgToBorder, getEng } from '../utils/helpers';
import processSajuData from '../sajuDataProcessor';
import { useLanguage } from '../context/useLanguageContext';
import { useTheme } from '../context/useThemeContext';

export default function LoadingFourPillar({ isTimeUnknown, saju }) {
  const { language } = useLanguage();
  const t = (char) => (language === 'en' ? getEng(char) : char);
  const { theme } = useTheme();

  // 분석 상태 관리 (1:년, 2:월, 3:일, 4:시, 5:최종합산)
  const [analysisStep, setAnalysisStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [subLog, setSubLog] = useState('');

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

  // 1분(60초) 타이머 및 로그 시뮬레이션
  useEffect(() => {
    const totalDuration = 75000; // 60초
    const intervalTime = 100; // 0.1초마다 갱신
    let elapsed = 0;

    const mainTimer = setInterval(() => {
      elapsed += intervalTime;
      const currentProgress = (elapsed / totalDuration) * 100;
      setProgress(currentProgress);

      // 단계별 전환 로직 (12초마다 기둥 변경)
      if (elapsed < 15000) setAnalysisStep(1);
      else if (elapsed < 30000) setAnalysisStep(2);
      else if (elapsed < 45000) setAnalysisStep(3);
      else if (elapsed < 60000) setAnalysisStep(4);
      else if (elapsed < 75000) setAnalysisStep(5);
      else {
        clearInterval(mainTimer);
      }
    }, intervalTime);

    // 실시간 분석 로그 생성 (데이터 처리 중인 느낌)
    const logInterval = setInterval(() => {
      const logs = [
        '오행의 균형도 측정 중...',
        '용신과 희신 교차 검증 중...',
        '지장간 내 숨겨진 기운 추출...',
        '12운성 에너지 레벨 연산...',
        '27인 명리학자 가중치 적용...',
        '대운의 흐름과 세운 대조 중...',
        '신살 및 공망 유무 확인...',
        '격국과 조후 합산 결과 산출...',
      ];
      setSubLog(logs[Math.floor(Math.random() * logs.length)]);
    }, 2500);

    return () => {
      clearInterval(mainTimer);
      clearInterval(logInterval);
    };
  }, []);

  const statusMessages = {
    1: '년주 분석: 타고난 가문의 기운과 근본적 에너지 스캔 중 (1/4)',
    2: '월주 분석: 사회적 성취도와 직업적 환경 빅데이터 분석 중 (2/4)',
    3: '일주 분석: 당신의 본질과 배우자 운의 조화 식별 중 (3/4)',
    4: '시주 분석: 미래의 잠재력과 인생의 결실 포인트 도출 중 (4/4)',
    5: '최종 합산: 전체적인 사주를 보고 결과를 도출하는 중...',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 select-none">
      {/* 1. 상단 정밀 분석 상태창 */}
      <div className="mb-8 w-[470px] bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-sky-100 dark:border-sky-900/30">
        <div className="flex justify-between mb-2">
          <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-bold">
            SYSTEM_ANALYSIS_MODE
          </span>
          <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-bold">
            {Math.floor(progress)}%
          </span>
        </div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
          {statusMessages[analysisStep]}
        </p>
        <p className="text-[10px] text-sky-500 font-mono animate-pulse">▶ {subLog}</p>
      </div>

      <div
        id="saju-capture"
        style={{ width: `470px`, maxWidth: '100%' }}
        className="relative rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden m-auto py-2 bg-white dark:bg-slate-800 shadow-2xl"
      >
        {/* 배경 레이어 (기존 디자인 유지) */}
        <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
          <div
            className={`h-1/2 w-full relative bg-gradient-to-b ${theme === 'dark' ? 'from-indigo-950/80 to-blue-900/60' : 'from-sky-400/40 to-white/5'}`}
          />
          <div
            className={`h-1/2 w-full relative bg-gradient-to-b border-t ${theme === 'dark' ? 'from-slate-800/50 to-gray-900/70 border-slate-700/30' : 'from-stone-300/40 to-amber-100/60 border-stone-400/20'}`}
          />
        </div>

        <div className="relative z-10 flex justify-center bg-white/10 backdrop-blur-[2px]">
          {/* 라벨 영역 */}
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

      {/* 하단 진행 바 */}
      <div className="mt-8 w-[470px] flex flex-col items-center">
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 transition-all duration-300 shadow-[0_0_10px_#0ea5e9]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="mt-2 text-[10px] font-mono text-gray-400">
          ENCRYPTED_DATA_SCAN_PROCESS_ACTIVE
        </span>
      </div>

      <style>{`
        @keyframes scanMove {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: #0ea5e9;
          box-shadow: 0 0 10px #0ea5e9;
          animation: scanMove 2.5s linear infinite;
        }
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
