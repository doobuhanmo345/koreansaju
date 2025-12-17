import { UI_TEXT, BD_EDIT_UI } from '../data/constants';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../context/useLanguageContext';
import { useAuthContext } from '../context/useAuthContext';
import { getEng } from '../utils/helpers';
export default function ModifyBd({
  gender,
  inputDate,
  isTimeUnknown,
  setIsTimeUnknown,
  saju,
  handleSaveMyInfo,
  setInputDate,
  isSaved,
  setGender,
}) {
  const { user } = useAuthContext();
  const { language } = useLanguage();
  const t = (char) => (language === 'en' ? getEng(char) : char);
  return (
    <div className="flex flex-col gap-1 pt-1">
      {/* 2. 양력 생일 정보 (입력값) */}

      <div className="gap-1.5 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        <CalendarDaysIcon className="w-4 h-4 text-indigo-400" />
        <span className="font-mono tracking-wide">{inputDate.replace('T', ' ')}</span>

        {gender === 'male' ? '👨' : '👩'}
        {isTimeUnknown && (
          <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 rounded text-gray-400">
            {UI_TEXT.unknownTime[language]}
          </span>
        )}
      </div>
      {/* 수정시 */}
      <div
        className={` transition-all duration-300 overflow-hidden ${isSaved ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}
      >
        <div className={`${!user ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
              {UI_TEXT.genderLabel[language]}
            </label>
            <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
              <button
                onClick={() => setGender('male')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === 'male' ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-600' : 'text-gray-400'}`}
              >
                {UI_TEXT.male[language]}
              </button>
              <button
                onClick={() => setGender('female')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === 'female' ? 'bg-white text-pink-500 shadow-sm dark:bg-slate-600' : 'text-gray-400'}`}
              >
                {UI_TEXT.female[language]}
              </button>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {UI_TEXT.birthLabel[language]}
              </label>
              <label className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                <input
                  type="checkbox"
                  checked={isTimeUnknown}
                  onChange={(e) => setIsTimeUnknown(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 dark:bg-slate-700"
                />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {UI_TEXT.unknownTime[language]}
                </span>
              </label>
            </div>
            <div className="relative w-full p-1">
              <input
                type={isTimeUnknown ? 'date' : 'datetime-local'}
                value={isTimeUnknown ? inputDate.split('T')[0] : inputDate}
                onChange={(e) => {
                  let val = e.target.value;
                  if (isTimeUnknown) val += 'T00:00';
                  setInputDate(val);
                }}
                className="w-full p-2 bg-gray-50 dark:bg-slate-900/50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white dark:[color-scheme:dark]"
              />
            </div>
          </div>
          <button
            onClick={handleSaveMyInfo}
            className="w-full  py-3 mt-3 mb-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            {BD_EDIT_UI.complete[language]}
          </button>
        </div>
      </div>
      {/* 구분선 */}
      <div className="border-t border-dashed border-indigo-100 dark:border-indigo-800 w-full"></div>
      {/* 3. 사주 명식 (변환값) - 가장 중요하게 강조 */}
      {saju?.sky1 && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {/* 년주 */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
              {UI_TEXT.year[language]}
            </span>
            <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
              {t(saju.sky3)}
              {t(saju.grd3)}
            </span>
          </div>

          {/* 월주 */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
              {UI_TEXT.month[language]}
            </span>
            <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
              {t(saju.sky2)}
              {t(saju.grd2)}
            </span>
          </div>

          {/* 일주 (강조) */}
          <div className="flex flex-col items-center relative">
            {/* 일주 강조용 배경 점 */}
            <div className="absolute inset-0 bg-indigo-100/50 dark:bg-indigo-500/20 blur-md rounded-full transform scale-150"></div>
            <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase mb-0.5 relative z-10">
              {UI_TEXT.day[language]}
            </span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-200 tracking-widest leading-none relative z-10 drop-shadow-sm">
              {t(saju.sky1)}
              {t(saju.grd1)}
            </span>
          </div>

          {/* 시주 */}
          {!isTimeUnknown && (
            <div className="flex flex-col items-center">
              <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
                {UI_TEXT.hour[language]}
              </span>
              <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
                {t(saju.sky0)}
                {t(saju.grd0)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
