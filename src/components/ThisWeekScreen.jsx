import { useState, useEffect } from 'react';
import { getWeekOfYear, getWeekKey, getCurrentLifeWeek, getBirthDate, TOTAL_WEEKS } from '../utils/lifeWeeks';
import { localSetEntry } from '../utils/storage';
import { useDiary } from '../data/DiaryContext';

export default function ThisWeekScreen({ onRequestSignup }) {
  const { getEntry, saveEntry, loaded, isAuthenticated } = useDiary();

  const today = new Date();
  const weekOfYear = getWeekOfYear(today);
  const weekKey = getWeekKey(today);
  const birthday = getBirthDate();
  const currentWeek = getCurrentLifeWeek(birthday);

  const [entry, setEntry] = useState(() => getEntry('weekly', weekKey));
  const [saveState, setSaveState] = useState('idle');

  useEffect(() => {
    queueMicrotask(() => {
      setEntry(getEntry('weekly', weekKey));
      setSaveState('idle');
    });
  }, [weekKey, loaded, getEntry]);

  const update = (patch) => {
    const next = { ...entry, ...patch };
    setEntry(next);
    localSetEntry('weekly', weekKey, next);
    setSaveState('dirty');
  };

  const updateNotToDo = (index, value) => {
    const notToDo = [...entry.notToDo];
    notToDo[index] = value;
    update({ notToDo });
  };

  const handleSave = async () => {
    setSaveState('saving');
    try {
      await saveEntry('weekly', weekKey, entry);
      setSaveState('saved');
      setTimeout(() => setSaveState((s) => (s === 'saved' ? 'idle' : s)), 2500);
    } catch {
      setSaveState('error');
    }
  };

  const saveLabel = {
    idle: 'Save week',
    dirty: 'Save week',
    saving: 'Saving…',
    saved: 'Saved ✓',
    error: 'Retry save',
  }[saveState];

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
                onChange={(e) => update({ coreFocus: e.target.value })}
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
                onChange={(e) => update({ supportMove: e.target.value })}
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

            <div className="mb-4">
              <label className="text-xs text-gray-400 block mb-2">
                Did this week reflect my real priorities?
              </label>
              <div className="flex gap-2">
                {['Yes', 'No', 'Mixed'].map((option) => (
                  <button
                    key={option}
                    onClick={() => update({ reflection: option })}
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

            <div className="mb-4">
              <label className="text-xs text-gray-400 block mb-2">
                One win:
              </label>
              <input
                type="text"
                value={entry.win}
                onChange={(e) => update({ win: e.target.value })}
                placeholder="What's worth remembering from this week..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-2">
                One habit/obligation to shrink or cut:
              </label>
              <input
                type="text"
                value={entry.shrink}
                onChange={(e) => update({ shrink: e.target.value })}
                placeholder="What will you reduce next week..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-all"
              />
            </div>
          </div>

          {/* Save */}
          <div className="mt-8 pt-6 border-t border-white/10">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saveState === 'saving'}
                  className={`w-full font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-60 ${
                    saveState === 'saved'
                      ? 'bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan'
                      : 'bg-gradient-to-r from-cyber-cyan to-cyber-magenta text-white hover:shadow-lg hover:shadow-cyber-cyan/30'
                  }`}
                >
                  {saveLabel}
                </button>
                <p className="text-center text-xs text-gray-500 mt-3">
                  Saved to your account — reachable from any device.
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={() => onRequestSignup?.()}
                  className="w-full font-semibold py-3 px-6 rounded-lg transition-all bg-gradient-to-r from-cyber-cyan to-cyber-magenta text-white hover:shadow-lg hover:shadow-cyber-cyan/30"
                >
                  Sign up to save your week
                </button>
                <p className="text-center text-xs text-gray-500 mt-3">
                  Create a free account to keep your weekly intentions, synced across every device.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
