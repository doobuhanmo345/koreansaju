export default function Test() {
  return <> {daewoonList.length > 0 && (
            <div className="mt-8">
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-3 px-2 flex items-center justify-between">
                <span>{language === 'en' ? '🌊 Flow of Daewoon' : '🌊 대운의 흐름'}</span>
                <span className="text-xs font-normal bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                  {language === 'en' ? `Age ${currentAge}` : `현재 ${currentAge}세`}
                </span>
              </h3>
  
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto transition-colors">
                <div className="flex gap-2 min-w-max pb-2">
                  {daewoonList
                    .map((dae, idx) => {
                      const isSelected = selectedDae
                        ? selectedDae.startAge === dae.startAge
                        : dae.isCurrent;
  
                      return (
                        <div
                          key={idx}
                          onClick={() => handleDaeClick(dae)}
                          className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg border cursor-pointer transition-all
              ${
                isSelected
                  ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white shadow-md transform scale-105'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-indigo-300'
              }`}
                        >
                          {/* 나이 표시 */}
                          <span className="text-xs mb-1 opacity-80">
                            {language === 'en' ? `Age ${dae.startAge}` : `${dae.startAge}세`}
                          </span>
  
                          {/* 이름 표시 (안전한 렌더링) */}
                          <span className="font-bold text-lg">
                            {language === 'en'
                              ? ENG_MAP[dae.name[0]] && ENG_MAP[dae.name[1]]
                                ? `${ENG_MAP[dae.name[0]]} ${ENG_MAP[dae.name[1]]}`
                                : dae.name // 영어 맵에 없으면 한글이라도 표시
                              : dae.name}
                          </span>
  
                          {dae.isCurrent && (
                            <span
                              className={`text-[10px] mt-1 px-1 rounded ${isSelected ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'}`}
                            >
                              {language === 'en' ? 'NOW' : '현재'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
  
              {/* 상세 분석 카드 (선택된 selectedDae 기준으로 렌더링) */}
              {selectedDae && (
                <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-100 dark:border-indigo-900/50 transition-colors animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                      {selectedDae.name[0]}
                    </div>
                    <div>
                      <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">
                        {selectedDae.isCurrent
                          ? language === 'en'
                            ? 'Current Season'
                            : '현재 대운'
                          : language === 'en'
                            ? 'Selected Season'
                            : '선택된 대운'}
                      </p>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        {language === 'en' ? (
                          <>
                            {ENG_MAP[selectedDae.name[0]]} {ENG_MAP[selectedDae.name[1]]}
                          </>
                        ) : (
                          <>{selectedDae.name}</>
                        )}{' '}
                        {language === 'en' ? 'Period' : '대운'} ({selectedDae.startAge} ~{' '}
                        {selectedDae.endAge || '...'} {language === 'en' ? 'Age' : '세'})
                      </h4>
                    </div>
                  </div>
                  <div
                    className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm text-justify"
                    dangerouslySetInnerHTML={{
                      __html: getDaewoonStory(selectedDae, currentAge, language),
                    }} // 함수 호출 시 선택된 대운 전달
                  />
                </div>
              )}
            </div>
          )}</>;
}
