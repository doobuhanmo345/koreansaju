import { useAuthContext } from '../context/useAuthContext';
import { useLanguage } from '../context/useLanguageContext';
export default function SajuBlur({ MAX_EDIT_COUNT }) {
  const { login } = useAuthContext();
  const { language } = useLanguage();
  return (
    <div className="absolute -top-10 inset-x-0 h-[550px] z-10 backdrop-blur-sm flex justify-center items-center">
      <div className="relative w-[260px]">
        <div className="absolute -top-[150px] w-full p-4 bg-gray-300/15 dark:bg-white/15 backdrop-blur-lg rounded-xl shadow-2xl dark:shadow-black/20 shadow-black/40 flex flex-col items-center justify-center space-y-4 mx-auto border border-gray-300/30 dark:border-gray-700/40">
          {language === 'en' ? (
            <p className="text-md font-extrabold text-gray-900 dark:text-white drop-shadow-md">
              Login to get <span className="text-amber-500">{MAX_EDIT_COUNT} daily ⚡️</span>
            </p>
          ) : (
            <p className="text-sm font-extrabold text-gray-900 dark:text-white drop-shadow-lg">
              <span className="text-amber-500">매일 ⚡️{MAX_EDIT_COUNT}개 혜택</span>을 <br /> 지금
              바로 받으세요!
            </p>
          )}

          <button
            className="w-full py-3 bg-amber-400 text-gray-900 font-extrabold text-md rounded-xl hover:bg-amber-500 active:bg-yellow-500 transition-all duration-150 transform hover:scale-[1.03] shadow-xl shadow-amber-500/60 flex items-center justify-center space-x-2"
            onClick={login}
          >
            {true && (
              <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
              </svg>
            )}
            <span className="text-white">
              {language === 'en' ? (
                <span className="text-sm">
                  FREE ACCESSN
                  <br /> UPON LOGIN
                </span>
              ) : (
                <>
                  <span className="text-md font-black">1초 로그인</span>으로 사주 보기
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
