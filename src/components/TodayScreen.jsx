import { useState, useEffect } from 'react';
import { formatDate, getDateKey, getCurrentLifeWeek, getBirthYear, TOTAL_WEEKS } from '../utils/lifeWeeks';
import { getQuoteForDate } from '../data/quotes';
import { getDailyEntry, saveDailyEntry } from '../utils/storage';

export default function TodayScreen() {
  const today = new Date();
  const dateKey = getDateKey(today);
  const birthYear = getBirthYear();
  const currentWeek = getCurrentLifeWeek(birthYear);
  const quote = getQuoteForDate(today);
  
  const [entry, setEntry] = useState(() => getDailyEntry(dateKey));

  useEffect(() => {
    saveDailyEntry(dateKey, entry);
  }, [entry, dateKey]);

  const updateMatters = (index, value) => {
    const newMatters = [...entry.matters];
    newMatters[index] = value;
    setEntry({ ...entry, matters: newMatters });
  };

  const lifeProgress = currentWeek ? (currentWeek / TOTAL_WEEKS) * 100 : 0;

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header with date and life week */}
        <div className="text-center mb-8">
          <div className="font-mono text-lg text-cyber-cyan mb-2">
            {formatDate(today)}
          </div>
          {currentWeek && (
            <div className="font-mono text-sm text-gray-400">
              Life week {currentWeek.toLocaleString()} of {TOTAL_WEEKS.toLocaleString()}
            </div>
          )}
          {/* Life progress bar */}
          <div className="mt-3 h-0.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-magenta animate-glow-pulse"
              style={{ width: `${lifeProgress}%` }}
            />
          </div>
        </div>

        {/* Glass card container */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-2xl">
          
          {/* Stoic quote section */}
          <div className="mb-8 pb-8 border-b border-white/10">
            <div className="text-sm italic text-gray-300 mb-3 leading-relaxed">
              "{quote.quote}"
            </div>
            <div className="text-xs text-cyber-cyan mb-4">
              — {quote.author}
            </div>
            <div className="text-xs text-gray-400">
              Prompt: {quote.prompt}
            </div>
          </div>

          {/* Today truly matters if... */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-cyber-magenta mb-4 tracking-wide">
              TODAY TRULY MATTERS IF...
            </h2>
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-cyber-cyan font-mono text-sm mt-3">{i + 1}.</span>
                  <input
                    type="text"
                    value={entry.matters[i]}
                    onChange={(e) => updateMatters(i, e.target.value)}
                    placeholder="What outcome truly matters..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Evening reflection */}
          <div className="pt-8 border-t border-white/10">
            <h2 className="text-sm font-semibold text-cyber-violet mb-4 tracking-wide">
              EVENING REFLECTION
            </h2>
            
            {/* Did I live today as I meant to? */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 block mb-2">
                Did I live today as I meant to?
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

            {/* One aligned action */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 block mb-2">
                One aligned action:
              </label>
              <input
                type="text"
                value={entry.aligned}
                onChange={(e) => setEntry({ ...entry, aligned: e.target.value })}
                placeholder="What did you do that aligned with your values..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-violet/50 focus:ring-1 focus:ring-cyber-violet/50 transition-all"
              />
            </div>

            {/* One thing to let go */}
            <div>
              <label className="text-xs text-gray-400 block mb-2">
                One thing to let go:
              </label>
              <input
                type="text"
                value={entry.letGo}
                onChange={(e) => setEntry({ ...entry, letGo: e.target.value })}
                placeholder="What will you release control of..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-violet/50 focus:ring-1 focus:ring-cyber-violet/50 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
