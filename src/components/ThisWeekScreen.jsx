import { useState, useEffect } from 'react';
import { getWeekOfYear, getWeekKey, getCurrentLifeWeek, getBirthYear, TOTAL_WEEKS } from '../utils/lifeWeeks';
import { getWeeklyEntry, saveWeeklyEntry } from '../utils/storage';

export default function ThisWeekScreen() {
  const today = new Date();
  const weekOfYear = getWeekOfYear(today);
  const weekKey = getWeekKey(today);
  const birthYear = getBirthYear();
  const currentWeek = getCurrentLifeWeek(birthYear);
  
  const [entry, setEntry] = useState(() => getWeeklyEntry(weekKey));

  useEffect(() => {
    saveWeeklyEntry(weekKey, entry);
  }, [entry, weekKey]);

  const updateNotToDo = (index, value) => {
    const newNotToDo = [...entry.notToDo];
    newNotToDo[index] = value;
    setEntry({ ...entry, notToDo: newNotToDo });
  };

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-mono text-lg text-cyber-cyan mb-2">
            Week {weekOfYear} of 52 · 2026
          </div>
          {currentWeek && (
            <div className="font-mono text-sm text-gray-400">
              Life week {currentWeek.toLocaleString()} of {TOTAL_WEEKS.toLocaleString()}
            </div>
          )}
        </div>

        {/* Glass card container */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-2xl">
          
          {/* What actually matters this week */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-cyber-magenta mb-4 tracking-wide">
              WHAT ACTUALLY MATTERS THIS WEEK
            </h2>
            
            <div className="mb-4">
              <label className="text-xs text-gray-400 block mb-2">
                Core focus (1 thing):
              </label>
              <input
                type="text"
                value={entry.coreFocus}
                onChange={(e) => setEntry({ ...entry, coreFocus: e.target.value })}
                placeholder="The one thing that must move forward..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-2">
                Support move (optional):
              </label>
              <input
                type="text"
                value={entry.supportMove}
                onChange={(e) => setEntry({ ...entry, supportMove: e.target.value })}
                placeholder="One supporting action..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-all"
              />
            </div>
          </div>

          {/* Not-to-do list */}
          <div className="mb-8 pb-8 border-b border-white/10">
            <h2 className="text-sm font-semibold text-cyber-violet mb-4 tracking-wide">
              I WILL NOT CHASE
            </h2>
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-cyber-violet font-mono text-sm mt-3">{i + 1}.</span>
                  <input
                    type="text"
                    value={entry.notToDo[i]}
                    onChange={(e) => updateNotToDo(i, e.target.value)}
                    placeholder="What you'll intentionally ignore..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-violet/50 focus:ring-1 focus:ring-cyber-violet/50 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* End-of-week check */}
          <div className="pt-8 border-t border-white/10">
            <h2 className="text-sm font-semibold text-cyber-cyan mb-4 tracking-wide">
              END-OF-WEEK REFLECTION
            </h2>
            
            {/* Did this week reflect priorities? */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 block mb-2">
                Did this week reflect my real priorities?
              </label>
              <div className="flex gap-2">
                {['Yes', 'No', 'Mixed'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setEntry({ ...entry, reflection: option })}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      entry.reflection === option
                        ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    } border`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* One win */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 block mb-2">
                One win:
              </label>
              <input
                type="text"
                value={entry.win}
                onChange={(e) => setEntry({ ...entry, win: e.target.value })}
                placeholder="What's worth remembering from this week..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-all"
              />
            </div>

            {/* One thing to shrink or cut */}
            <div>
              <label className="text-xs text-gray-400 block mb-2">
                One habit/obligation to shrink or cut:
              </label>
              <input
                type="text"
                value={entry.shrink}
                onChange={(e) => setEntry({ ...entry, shrink: e.target.value })}
                placeholder="What will you reduce next week..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
