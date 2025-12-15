import { pillarStyle, iconsViewStyle, pillarLabelStyle, jiStyle } from '../data/style';
import { UI_TEXT } from '../data/constants';
import { getIcon, classNames, getHanja, bgToBorder, getEng } from '../utils/helpers';
import processSajuData from '../sajuDataProcessor';
import { useLanguage } from '../context/useLanguageContext';
import { useTheme } from '../context/useThemeContext';

export default function FourPillarVis({ isTimeUnknown, saju }) {
  const { language } = useLanguage();
  const t = (char) => (language === 'en' ? getEng(char) : char);
  const { theme } = useTheme();
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
  return (
    <div
      id="saju-capture"
      style={{ width: `470px`, maxWidth: '100%' }}
      className=" relative rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden m-auto transition-[width] duration-100 ease-linear py-2 bg-white dark:bg-slate-800 animate-[fadeIn_0.5s_ease-out]"
    >
      {true && (
        <div className="absolute inset-0 z-0 flex flex-col pointer-events-none transition-all duration-500">
          {/* 1. 하늘 (Sky) 영역 */}
          <div
            className={`h-1/2 w-full relative bg-gradient-to-b overflow-hidden transition-colors duration-700 ease-in-out
                ${
                  theme === 'dark'
                    ? 'from-indigo-950/80 via-slate-900/70 to-blue-900/60' // 🌙 밤 배경
                    : 'from-sky-400/40 via-sky-200/40 to-white/5' // ☀️ 낮 배경
                }`}
          >
            {theme === 'dark' ? (
              // ================= [ 🌙 밤 디자인 ] =================
              <>
                <div className="absolute top-4 right-[3%] w-20 h-20 bg-blue-100 rounded-full blur-3xl opacity-20" />
                <svg
                  className="absolute top-6 right-[3%] w-12 h-12 text-blue-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] rotate-[-15deg]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>

                {/* 별 (Stars) */}
                <div className="opacity-90">
                  <svg
                    className="absolute top-10 left-10 w-4 h-4 text-white animate-pulse"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12,2L14.5,9.5L22,12L14.5,14.5L12,22L9.5,14.5L2,12L9.5,9.5L12,2Z"
                    />
                  </svg>
                  <svg
                    className="absolute top-6 right-1/3 w-2 h-2 text-blue-200 animate-pulse delay-75"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12,2L14.5,9.5L22,12L14.5,14.5L12,22L9.5,14.5L2,12L9.5,9.5L12,2Z"
                    />
                  </svg>
                  <svg
                    className="absolute top-20 right-10 w-3 h-3 text-white animate-pulse delay-150"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12,2L14.5,9.5L22,12L14.5,14.5L12,22L9.5,14.5L2,12L9.5,9.5L12,2Z"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse delay-300"></div>
                  <div className="absolute top-8 left-1/2 w-1 h-1 bg-white rounded-full opacity-80 animate-pulse delay-500"></div>
                </div>
              </>
            ) : (
              // ================= [ ☀️ 낮 디자인 ] =================
              <>
                {/* 태양 (Sun) */}
                <div className="absolute top-2 right-[20%] w-24 h-24 bg-yellow-200 rounded-full blur-2xl opacity-60" />
                <svg
                  className="absolute top-2 right-[12%] w-14 h-14 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)] animate-[spin_12s_linear_infinite]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path
                    d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                {/* 구름들 (Clouds) */}
                <svg
                  className="absolute top-3 left-4 w-20 h-20 text-white opacity-100 drop-shadow-md"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.5,19c4.1,0,7.5-3.4,7.5-7.5c0-4.1-3.4-7.5-7.5-7.5c-0.4,0-0.7,0-1.1,0.1c-1-3-3.9-5.1-7.2-5.1C5.6,0,2.6,3.1,2,7.4C0.8,8,0,9.2,0,10.5C0,12.4,1.6,14,3.5,14h0.9c0.7,2.9,3.3,5,6.4,5h6.7" />
                </svg>
                <svg
                  className="absolute top-6 right-8 w-16 h-16 text-white opacity-95 drop-shadow-md"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.5,19c4.1,0,7.5-3.4,7.5-7.5c0-4.1-3.4-7.5-7.5-7.5c-0.4,0-0.7,0-1.1,0.1c-1-3-3.9-5.1-7.2-5.1C5.6,0,2.6,3.1,2,7.4C0.8,8,0,9.2,0,10.5C0,12.4,1.6,14,3.5,14h0.9c0.7,2.9,3.3,5,6.4,5h6.7" />
                </svg>
                <svg
                  className="absolute top-2 left-1/2 w-10 h-10 text-white opacity-90 drop-shadow-sm transform -translate-x-1/2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.5,19c4.1,0,7.5-3.4,7.5-7.5c0-4.1-3.4-7.5-7.5-7.5c-0.4,0-0.7,0-1.1,0.1c-1-3-3.9-5.1-7.2-5.1C5.6,0,2.6,3.1,2,7.4C0.8,8,0,9.2,0,10.5C0,12.4,1.6,14,3.5,14h0.9c0.7,2.9,3.3,5,6.4,5h6.7" />
                </svg>
                <svg
                  className="absolute -top-2 -right-7 w-24 h-24 text-white opacity-80 drop-shadow-sm"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.5,19c4.1,0,7.5-3.4,7.5-7.5c0-4.1-3.4-7.5-7.5-7.5c-0.4,0-0.7,0-1.1,0.1c-1-3-3.9-5.1-7.2-5.1C5.6,0,2.6,3.1,2,7.4C0.8,8,0,9.2,0,10.5C0,12.4,1.6,14,3.5,14h0.9c0.7,2.9,3.3,5,6.4,5h6.7" />
                </svg>
              </>
            )}
          </div>

          {/* 2. 땅 (Earth) 영역 */}
          <div
            className={`h-1/2 w-full relative bg-gradient-to-b transition-colors duration-700 ease-in-out border-t
                ${
                  theme === 'dark'
                    ? 'from-slate-800/50 to-gray-900/70 border-slate-700/30' // 🌙 밤 땅
                    : 'from-stone-300/40 to-amber-100/60 border-stone-400/20' // ☀️ 낮 땅
                }`}
          >
            {/* 지평선 그림자 */}
            <div
              className={`absolute top-0 left-0 w-full h-8 bg-gradient-to-b transition-colors duration-700
                  ${
                    theme === 'dark'
                      ? 'from-slate-900/20 to-transparent'
                      : 'from-stone-500/5 to-transparent'
                  }`}
            />
            {/* 바닥 질감 패턴 */}
            <div className="w-full h-full opacity-10 bg-[radial-gradient(#a8a29e_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex justify-center bg-white/10 backdrop-blur-sm">
        {true && (
          <div className="flex flex-col max-xs:hidden items-end  pt-[10px] animate-[fadeIn_0.5s_ease-out]">
            <div className="h-4" />
            <div className="h-[90px] flex items-center pr-2 border-r border-sky-700/30">
              <div className="text-right">
                <span className="block text-[10px] font-bold text-sky-700 uppercase tracking-widest opacity-80 dark:text-cyan-600">
                  {language === 'en' ? 'Heavenly' : '천간'}
                </span>
                <span className="block text-[10px] font-serif font-bold text-gray-700 drop-shadow-sm dark:text-gray-400">
                  {language === 'en' ? 'Stem' : ''}
                </span>
              </div>
            </div>
            <div className="h-[110px] flex items-center pr-2 border-r border-stone-400/20">
              <div className="text-right">
                <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest opacity-70 dark:text-yellow-600">
                  {language === 'en' ? 'Earthly' : '지지'}
                </span>
                <span className="block text-[10px] font-serif font-bold text-stone-700 drop-shadow-sm dark:text-gray-400">
                  {language === 'en' ? 'Branch' : ''}
                </span>
              </div>
            </div>
          </div>
        )}
        {!isTimeUnknown && !!saju.grd0 && (
          <div className={pillarStyle}>
            <div className={pillarLabelStyle}>{UI_TEXT.hour[language]}</div>
            <div
              className={classNames(
                iconsViewStyle,
                saju.sky0 ? bgToBorder(sigan.color) : 'border-gray-200',
                'rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm',
              )}
            >
              <div className="text-3xl mb-1">{getIcon(saju.sky0, 'sky')}</div>
              {!!saju.sky0 && (
                <>
                  <div className="text-[10px] font-bold">{getHanja(saju.sky0, 'sky')}</div>
                  {language === 'en' ? (
                    <div className="text-[8px] uppercase tracking-tighter">{t(saju.sky0)}</div>
                  ) : (
                    <div className="text-[8px] uppercase tracking-tighter">{saju.sky0}</div>
                  )}
                </>
              )}
            </div>
            <div
              className={classNames(
                iconsViewStyle,
                saju.grd0 ? bgToBorder(sijidata.color) : 'border-gray-200',
                'rounded-md w-16 flex flex-col items-center justify-center shadow-sm',
              )}
            >
              <div className="text-3xl mb-1">{getIcon(saju.grd0, 'grd')}</div>
              {!!saju.grd0 && (
                <>
                  <div className="text-[10px] font-bold">{getHanja(saju.grd0, 'grd')}</div>
                  <div className="text-[8px] uppercase tracking-tighter">{t(saju.grd0)}</div>
                </>
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
        )}
        <div
          className={classNames(
            pillarStyle,
            true
              ? 'bg-white/90 dark:bg-white/40 border-gray-600 border-[0.5px] border-dashed'
              : 'bg-yellow-100/50 border-yellow-500',
          )}
        >
          <span className={classNames(pillarLabelStyle, 'dark:!text-gray-700')}>
            {UI_TEXT.day[language]}
          </span>
          <div
            className={classNames(
              iconsViewStyle,
              saju.sky1 ? bgToBorder(ilgan.color) : 'border-gray-200',
              'rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm',
            )}
          >
            <div className="text-3xl mb-1">{getIcon(saju.sky1, 'sky')}</div>
            {!!saju.sky1 && (
              <>
                <div className="text-[10px] font-bold">{getHanja(saju.sky1, 'sky')}</div>
                <div className="text-[8px] uppercase tracking-tighter">{t(saju.sky1)}</div>
              </>
            )}
          </div>
          <div
            className={classNames(
              iconsViewStyle,
              saju.grd1 ? bgToBorder(iljidata.color) : 'border-gray-200',
              'rounded-md w-16 flex flex-col items-center justify-center shadow-sm',
            )}
          >
            <div className="text-3xl mb-1">{getIcon(saju.grd1, 'grd')}</div>
            {!!saju.grd1 && (
              <>
                <div className="text-[10px] font-bold">{getHanja(saju.grd1, 'grd')}</div>
                <div className="text-[8px] uppercase tracking-tighter">{t(saju.grd1)}</div>
              </>
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
        <div className={pillarStyle}>
          <span className={pillarLabelStyle}>{UI_TEXT.month[language]}</span>
          <div
            className={classNames(
              iconsViewStyle,
              saju.sky2 ? bgToBorder(wolgan.color) : 'border-gray-200',
              'rounded-md w-16 px-2 flex flex-col items-center justify-center py-2 shadow-sm',
            )}
          >
            <div className="text-3xl mb-1">{getIcon(saju.sky2, 'sky')}</div>
            {!!saju.sky2 && (
              <>
                <div className="text-[10px] font-bold">{getHanja(saju.sky2, 'sky')}</div>
                <div className="text-[8px] uppercase tracking-tighter">{t(saju.sky2)}</div>
              </>
            )}
          </div>
          <div
            className={classNames(
              iconsViewStyle,
              saju.grd2 ? bgToBorder(woljidata.color) : 'border-gray-200',
              'rounded-md w-16 flex flex-col items-center justify-center shadow-sm',
            )}
          >
            <div className="text-3xl mb-1">{getIcon(saju.grd2, 'grd')}</div>
            {!!saju.grd2 && (
              <>
                <div className="text-[10px] font-bold">{getHanja(saju.grd2, 'grd')}</div>
                <div className="text-[8px] uppercase tracking-tighter">{t(saju.grd2)}</div>
              </>
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
        <div className={pillarStyle}>
          <span className={pillarLabelStyle}>{UI_TEXT.year[language]}</span>
          <div
            className={classNames(
              iconsViewStyle,
              saju.sky3 ? bgToBorder(yeongan.color) : 'border-gray-200',
              'rounded-md w-16 flex flex-col items-center justify-center py-2 shadow-sm',
            )}
          >
            <div className="text-3xl mb-1">{getIcon(saju.sky3, 'sky')}</div>
            {!!saju.sky3 && (
              <>
                <div className="text-[10px] font-bold">{getHanja(saju.sky3, 'sky')}</div>
                <div className="text-[8px] uppercase tracking-tighter">{t(saju.sky3)}</div>
              </>
            )}
          </div>
          <div
            className={classNames(
              iconsViewStyle,
              saju.grd3 ? bgToBorder(yeonjidata.color) : 'border-gray-200',
              'rounded-md w-16 flex flex-col items-center justify-center shadow-sm',
            )}
          >
            <div className="text-3xl mb-1">{getIcon(saju.grd3, 'grd')}</div>
            {!!saju.grd3 && (
              <>
                <div className="text-[10px] font-bold">{getHanja(saju.grd3, 'grd')}</div>
                <div className="text-[8px] uppercase tracking-tighter">{t(saju.grd3)}</div>
              </>
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
      </div>
    </div>
  );
}
