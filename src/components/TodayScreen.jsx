import { useState, useEffect } from 'react';
import {
  formatDate, getDateKey, parseDateKey, isSameDay,
  getCurrentLifeWeek, getBirthYear, TOTAL_WEEKS,
} from '../utils/lifeWeeks';
import { getQuoteForDate } from '../data/quotes';
import { localSetEntry } from '../utils/storage';
import { useDiary } from '../data/DiaryContext';
import Calendar from './Calendar';

export default function TodayScreen() {
  const { getEntry, saveEntry, entryKeys, loaded, isAuthenticated } = useDiary();

  const today = new Date();
  const [selectedKey, setSelectedKey] = useState(getDateKey(today));
  const selectedDate = parseDateKey(selectedKey);
  const isToday = isSameDay(selectedDate, today);

  const birthYear = getBirthYear();
  const currentWeek = getCurrentLifeWeek(birthYear);
  const quote = getQuoteForDate(selectedDate);

  const [entry, setEntry] = useState(() => getEntry('daily', selectedKey));
  const [showCalendar, setShowCalendar] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle | dirty | saving | saved | error

  // Reload the entry whenever the selected day changes or server data arrives.
  useEffect(() => {
    setEntry(getEntry('daily', selectedKey));
    setSaveState('idle');
  }, [selectedKey, loaded, getEntry]);

  const update = (patch) => {
    const next = { ...entry, ...patch };
    setEntry(next);
    localSetEntry('daily', selectedKey, next); // never lose work in-progress
    setSaveState('dirty');
  };

  const updateMatters = (index, value) => {
    const matters = [...entry.matters];
    matters[index] = value;
    update({ matters });
  };

  const handleSave = async () => {
    setSaveState('saving');
    try {
      await saveEntry('daily', selectedKey, entry);
      setSaveState('saved');
      setTimeout(() => setSaveState((s) => (s === 'saved' ? 'idle' : s)), 2500);
    } catch {
      setSaveState('error');
    }
  };

  const lifeProgress = currentWeek ? (currentWeek / TOTAL_WEEKS) * 100 : 0;

  const saveLabel = {
    idle: 'Save entry',
    dirty: 'Save entry',
    saving: 'Saving…',
    saved: 'Saved ✓',
    error: 'Retry save',
  }[saveState];

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header with date and life week */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowCalendar((s) => !s)}
            className="font-mono text-lg text-cyber-cyan mb-2 inline-flex items-center gap-2 hover:text-white transition-colors"
          >
            <span>{formatDate(selectedDate)}</span>
            <span className="text-xs opacity-70">▾</span>
          </button>
          {currentWeek && (
            <div className="font-mono text-sm text-gray-400">
              Life week {currentWeek.toLocaleString()} of {TOTAL_WEEKS.toLocaleString()}
            </div>
          )}
          <div className="mt-3 h-0.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-magenta animate-glow-pulse"
              style={{ width: `${lifeProgress}%` }}
            />
          </div>
          {!isToday && (
            <button
              onClick={() => setSelectedKey(getDateKey(today))}
              className="mt-3 text-xs text-cyber-violet hover:text-cyber-magenta transition-colors"
            >
              ← Back to today
            </button>
          )}
        </div>

        {/* Calendar (collapsible) */}
        {showCalendar && (
          <div className="mb-6">
            <Calendar
              selectedKey={selectedKey}
              markedKeys={entryKeys('daily')}
              onSelect={(key) => {
                setSelectedKey(key);
                setShowCalendar(false);
              }}
            />
          </div>
        )}

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
              {isToday ? 'TODAY TRULY MATTERS IF...' : 'THIS DAY TRULY MATTERS IF...'}
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

            <div className="mb-4">
              <label className="text-xs text-gray-400 block mb-2">
                Did I live this day as I meant to?
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
                One aligned action:
              </label>
              <input
                type="text"
                value={entry.aligned}
                onChange={(e) => update({ aligned: e.target.value })}
                placeholder="What did you do that aligned with your values..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-violet/50 focus:ring-1 focus:ring-cyber-violet/50 transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-2">
                One thing to let go:
              </label>
              <input
                type="text"
                value={entry.letGo}
                onChange={(e) => update({ letGo: e.target.value })}
                placeholder="What will you release control of..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-violet/50 focus:ring-1 focus:ring-cyber-violet/50 transition-all"
              />
            </div>
          </div>

          {/* Save */}
          <div className="mt-8 pt-6 border-t border-white/10">
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
              {isAuthenticated
                ? 'Saved to your account — reachable from any device.'
                : 'Saved on this device. Sign in to keep it synced everywhere.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
