import { getCurrentLifeWeek, getBirthYear, getWeeksRemaining, getLifeProgress, TOTAL_WEEKS } from '../utils/lifeWeeks';

export default function LifeBarScreen() {
  const birthYear = getBirthYear();
  const currentWeek = getCurrentLifeWeek(birthYear);
  const weeksRemaining = getWeeksRemaining(currentWeek);
  const lifeProgress = getLifeProgress(currentWeek);

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-cyber-cyan mb-4 tracking-tight">
            4000 WEEKS
          </h1>
          {currentWeek ? (
            <>
              <div className="font-mono text-lg text-gray-300 mb-2">
                You are around week {currentWeek.toLocaleString()} of {TOTAL_WEEKS.toLocaleString()} total weeks.
              </div>
              <div className="font-mono text-sm text-gray-400 mb-6">
                About {lifeProgress.toFixed(1)}% of your weeks are behind you.
              </div>
            </>
          ) : (
            <div className="text-gray-400 mb-6">
              Set your birth year to see your life progress
            </div>
          )}
          <div className="max-w-2xl mx-auto text-sm text-gray-300 leading-relaxed">
            You can't do everything. You can still do a few things that matter deeply.
          </div>
        </div>

        {/* Glass card container */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl">
          
          {currentWeek ? (
            <>
              {/* Life bar visualization */}
              <div className="mb-8">
                <div className="h-12 bg-gray-900/50 rounded-full overflow-hidden relative border border-white/10">
                  {/* Weeks lived */}
                  <div 
                    className="h-full bg-gradient-to-r from-cyber-cyan via-cyber-magenta to-cyber-violet relative"
                    style={{ width: `${lifeProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-glow-pulse" />
                  </div>
                  
                  {/* Current week marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg shadow-white/50"
                    style={{ left: `${lifeProgress}%` }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-white/50 animate-pulse" />
                  </div>
                </div>

                {/* Labels */}
                <div className="flex justify-between mt-3 font-mono text-xs text-gray-400">
                  <span>Birth</span>
                  <span className="text-cyber-cyan">Week {currentWeek.toLocaleString()}</span>
                  <span>Week {TOTAL_WEEKS.toLocaleString()}</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Weeks Lived</div>
                  <div className="text-2xl font-bold text-cyber-cyan font-mono">
                    {currentWeek.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Weeks Remaining</div>
                  <div className="text-2xl font-bold text-cyber-magenta font-mono">
                    {weeksRemaining.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Perspective text */}
              <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                <p className="border-l-2 border-cyber-violet pl-4">
                  If you live to 90, you have approximately <span className="text-cyber-magenta font-semibold">{weeksRemaining.toLocaleString()} weeks</span> remaining.
                </p>
                <p className="border-l-2 border-cyber-cyan pl-4">
                  That's roughly <span className="text-cyber-cyan font-semibold">{Math.floor(weeksRemaining / 52)} years</span> to do what truly matters.
                </p>
                <p className="border-l-2 border-cyber-magenta pl-4">
                  Every week you spend on things that don't matter is a week you can't get back.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">
                To see your life progress, you need to set your birth year.
              </p>
              <p className="text-sm text-gray-500">
                This will be saved in your browser's local storage.
              </p>
            </div>
          )}
        </div>

        {/* Stoic reminder */}
        <div className="mt-8 text-center">
          <div className="text-sm italic text-gray-400 max-w-2xl mx-auto">
            "You could leave life right now. Let that determine what you do and say and think."
          </div>
          <div className="text-xs text-cyber-cyan mt-2">
            — Marcus Aurelius
          </div>
        </div>
      </div>
    </div>
  );
}
