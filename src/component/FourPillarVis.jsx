import { pillarStyle, iconsViewStyle, pillarLabelStyle, jiStyle } from '../data/style';
import { UI_TEXT, jijiText } from '../data/constants';
import { getIcon, classNames, getHanja, bgToBorder, getEng } from '../utils/helpers';
import processSajuData from '../sajuDataProcessor';
import useLocalStorage from '../hooks/useLocalStorage';

export default function FourPillarVis({ containerWidth, isTimeUnknown, saju, theme }) {
  const t = (char) => (language === 'en' ? getEng(char) : char);
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
  const [language, setLanguage] = useLocalStorage('userLanguage', 'en');
  return (
    <div
      id="saju-capture"
      style={{ width: `${containerWidth}px`, maxWidth: '100%' }}
      className=" relative rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden m-auto transition-[width] duration-100 ease-linear py-2 bg-white dark:bg-slate-800 animate-[fadeIn_0.5s_ease-out]"
    >
      {true && (
        <div className="absolute inset-0 z-0 flex flex-col pointer-events-none transition-all duration-500">
          <div
            className={`h-1/2 w-full relative bg-gradient-to-b overflow-hidden transition-colors duration-700 ease-in-out ${theme === 'dark' ? 'from-indigo-950/80 via-slate-900/70 to-blue-900/60' : 'from-sky-400/40 via-sky-200/40 to-white/5'}`}
          >
            {/* 배경 아이콘 유지 */}
          </div>
          <div
            className={`h-1/2 w-full relative bg-gradient-to-b transition-colors duration-700 ease-in-out border-t ${theme === 'dark' ? 'from-slate-800/50 to-gray-900/70 border-slate-700/30' : 'from-stone-300/40 to-amber-100/60 border-stone-400/20'}`}
          ></div>
        </div>
      )}

      <div className="relative z-10 flex justify-center bg-white/10 backdrop-blur-sm">
        {true && (
          <div className="flex flex-col max-xs:hidden items-end  pt-[10px] animate-[fadeIn_0.5s_ease-out]">
            <div className="h-4" />
            <div className="h-[90px] flex items-center pr-2 border-r border-sky-700/30">
              <div className="text-right">
                <span className="block text-[10px] font-bold text-sky-700 uppercase tracking-widest opacity-80 dark:text-cyan-600">
                  Heavenly
                </span>
                <span className="block text-[10px] font-serif font-bold text-gray-700 drop-shadow-sm dark:text-gray-400">
                  Stem
                </span>
              </div>
            </div>
            <div className="h-[110px] flex items-center pr-2 border-r border-stone-400/20">
              <div className="text-right">
                <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest opacity-70 dark:text-yellow-600">
                  Earthly
                </span>
                <span className="block text-[10px] font-serif font-bold text-stone-700 drop-shadow-sm dark:text-gray-400">
                  Branch
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
