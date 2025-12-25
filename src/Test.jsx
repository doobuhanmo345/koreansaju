export default function Test() {
  return (
    <>
   
        <>
          {isAnalysisDone ? (
            <div className="flex items-center gap-1 backdrop-blur-md bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
              <span className="text-[9px] font-bold text-white uppercase">Free</span>
              <TicketIcon className="w-3 h-3 text-white" />
            </div>
          ) : isLocked ? (
            <><div
          className="mt-1 flex items-center gap-1 backdrop-blur-sm px-2 py-0.5 rounded-full border shadow-sm relative z-10 border-gray-500/50 bg-gray-400/40" // 잠겼을 때
        >
          <span className="text-[9px] font-bold text-white tracking-wide uppercase">
            <LockClosedIcon className="w-4 h-4 text-amber-500" />
          </span>
        </div></>
          ) : (
            user && (
              <div className="relative scale-90">
                <EnergyBadge active={userData?.birthDate} consuming={loading} cost={-1} />
              </div>
            )
          )}
        </>
      
    </>
  );
}
