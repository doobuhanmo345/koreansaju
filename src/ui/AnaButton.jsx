import { useLanguage } from "../context/useLanguageContext";
import { classNames } from "../utils/helpers";
import { TicketIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import EnergyBadge from "./EnergyBadge";
import { useAuthContext } from "../context/useAuthContext";
import { useUsageLimit } from "../context/useUsageLimit";


export default function AnaButton({handleStartClick,onStart,isDisabled,isDisabled2,loading,isDone}) {
    const { language } = useLanguage();
    const{user, userData} =useAuthContext()
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
    const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
    return (
         <button
          onClick={() => handleStartClick(onStart)} // 일일 운세용 함수 호출
          disabled={isDisabled || isDisabled2}
          className={classNames(
            'w-full  px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
            isDisabled
              ? DISABLED_STYLE
              : 'bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white shadow-amber-200 hover:-translate-y-1',
          )}
        >
          {language === 'ko' ? '오늘의 운세 확인하기' : 'Check my Luck of the day'}

          {isDone ? (
            <div className="flex items-center gabackdrop-blur-md bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
              <span className="text-[9px] font-bold text-white uppercase">Free</span>
              <TicketIcon className="w-3 h-3 text-white" />
            </div>
          ) : isLocked ? (
            <>
              <div
                className="mt-1 flex items-center gap-1 backdrop-blur-sm px-2 py-0.5 rounded-full border shadow-sm relative z-10 border-gray-500/50 bg-gray-400/40" // 잠겼을 때
              >
                <span className="text-[9px] font-bold text-white tracking-wide uppercase">
                  <LockClosedIcon className="w-4 h-4 text-amber-500" />
                </span>
              </div>
            </>
          ) : (
            user && (
              <div className="relative scale-90">
                <EnergyBadge active={userData?.birthDate} consuming={loading} cost={-1} />
              </div>
            )
          )}
        </button>
    );
}