import { useState, useEffect, useMemo, useRef } from 'react';
import {
  formatDate, getDateKey, parseDateKey, isSameDay,
  getCurrentLifeWeek, getBirthDate, TOTAL_WEEKS, getWeeksRemaining,
} from '../utils/lifeWeeks';
import { getQuoteForDate } from '../data/quotes';
import { localSetEntry, isEmptyEntry } from '../utils/storage';
import { useDiary } from '../data/DiaryContext';
import Calendar from './Calendar';

export default function TodayScreen({ onRequestSignup }) {
  const { getEntry, saveEntry, entryKeys, loaded, isAuthenticated } = useDiary();

  const today = new Date();
  const [selectedKey, setSelectedKey] = useState(getDateKey(today));
  const selectedDate = parseDateKey(selectedKey);
  const isToday = isSameDay(selectedDate, today);

  const birthday = getBirthDate();
  const currentWeek = getCurrentLifeWeek(birthday);
  const quote = getQuoteForDate(selectedDate);

  const [entry, setEntry] = useState(() => getEntry('daily', selectedKey));
  const [showCalendar, setShowCalendar] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle | dirty | saving | saved | error
  const [isSmoking, setIsSmoking] = useState(false);
  const [showWisdomView, setShowWisdomView] = useState(false);
  const hasCheckedAutoWisdom = useRef(false);

  // Auto-show wisdom view if today's entry already exists on login/load
  useEffect(() => {
    if (isAuthenticated && loaded && !hasCheckedAutoWisdom.current) {
      const todayKey = getDateKey(new Date());
      const todayEntry = getEntry('daily', todayKey);
      if (todayEntry && !isEmptyEntry('daily', todayEntry)) {
        setShowWisdomView(true);
      }
      hasCheckedAutoWisdom.current = true;
    }
  }, [isAuthenticated, loaded, getEntry]);

  // Reset check when logged out
  useEffect(() => {
    if (!isAuthenticated) {
      hasCheckedAutoWisdom.current = false;
    }
  }, [isAuthenticated]);

  // Reload the entry whenever the selected day changes or server data arrives.
  useEffect(() => {
    queueMicrotask(() => {
      setEntry(getEntry('daily', selectedKey));
      setSaveState('idle');
    });
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
    setIsSmoking(true);
    try {
      await saveEntry('daily', selectedKey, entry);
      setSaveState('saved');
      
      // Wait for smoke effect to rise before showing wisdom view
      setTimeout(() => {
        setIsSmoking(false);
        setShowWisdomView(true);
      }, 1500);

      setTimeout(() => setSaveState((s) => (s === 'saved' ? 'idle' : s)), 2500);
    } catch {
      setSaveState('error');
      setIsSmoking(false);
    }
  };

  const lifeProgress = currentWeek ? (currentWeek / TOTAL_WEEKS) * 100 : 0;
  const weeksRemaining = currentWeek ? getWeeksRemaining(currentWeek) : 0;

  // Compute stats on entries
  const stats = useMemo(() => {
    const keys = Array.from(entryKeys('daily'));
    let totalEntries = 0;
    let yesCount = 0;
    let noCount = 0;
    let mixedCount = 0;
    let alignedCount = 0;
    let letGoCount = 0;

    keys.forEach((key) => {
      const ent = getEntry('daily', key);
      if (!ent) return;

      const hasMatters = ent.matters && ent.matters.some(m => m && m.trim().length > 0);
      const hasReflection = ent.reflection && ent.reflection.trim().length > 0;
      const hasAligned = ent.aligned && ent.aligned.trim().length > 0;
      const hasLetGo = ent.letGo && ent.letGo.trim().length > 0;

      if (hasMatters || hasReflection || hasAligned || hasLetGo) {
        totalEntries++;
        if (ent.reflection === 'Yes') yesCount++;
        if (ent.reflection === 'No') noCount++;
        if (ent.reflection === 'Mixed') mixedCount++;
        if (hasAligned) alignedCount++;
        if (hasLetGo) letGoCount++;
      }
    });

    // Calculate streak backwards from today
    let streak = 0;
    const checkDate = new Date(); // Start from today
    for (let i = 0; i < 1000; i++) {
      const key = getDateKey(checkDate);
      if (keys.includes(key)) {
        const ent = getEntry('daily', key);
        const hasContent = ent && (
          (ent.matters && ent.matters.some(m => m && m.trim().length > 0)) ||
          (ent.reflection && ent.reflection.trim().length > 0) ||
          (ent.aligned && ent.aligned.trim().length > 0) ||
          (ent.letGo && ent.letGo.trim().length > 0)
        );
        if (hasContent) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }

    return { totalEntries, yesCount, noCount, mixedCount, alignedCount, letGoCount, streak };
  }, [entryKeys, getEntry]);

  const saveLabel = {
    idle: 'Save entry',
    dirty: 'Save entry',
    saving: 'Saving…',
    saved: 'Saved ✓',
    error: 'Retry save',
  }[saveState];

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      {/* Smoke effect */}
      {isSmoking && (
        <div className="smoke-container">
          <div className="smoke-particle" style={{ '--delay': '0s', '--left': '10%' }} />
          <div className="smoke-particle" style={{ '--delay': '0.3s', '--left': '25%' }} />
          <div className="smoke-particle" style={{ '--delay': '0.1s', '--left': '40%' }} />
          <div className="smoke-particle" style={{ '--delay': '0.5s', '--left': '55%' }} />
          <div className="smoke-particle" style={{ '--delay': '0.2s', '--left': '70%' }} />
          <div className="smoke-particle" style={{ '--delay': '0.6s', '--left': '85%' }} />
          <div className="smoke-particle" style={{ '--delay': '0.4s', '--left': '15%' }} />
          <div className="smoke-particle" style={{ '--delay': '0.7s', '--left': '48%' }} />
          <div className="smoke-particle" style={{ '--delay': '0.2s', '--left': '80%' }} />
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Header with date and life week */}
        <div className="text-center mb-6">
          <div className="font-mono text-lg text-cyber-cyan mb-2">
            {formatDate(selectedDate)}
          </div>
          {currentWeek && (
            <div className="font-mono text-sm text-gray-400">
              Life week {currentWeek.toLocaleString()} of {TOTAL_WEEKS.toLocaleString()} • {weeksRemaining.toLocaleString()} weeks left
            </div>
          )}
          <div className="mt-3 h-0.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-magenta animate-glow-pulse"
              style={{ width: `${lifeProgress}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setShowCalendar((s) => !s);
                setShowWisdomView(false); // Close wisdom view if picking a date
              }}
              aria-expanded={showCalendar}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                showCalendar
                  ? 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan'
                  : 'border-white/15 bg-white/5 text-gray-300 hover:border-cyber-cyan/50 hover:text-cyber-cyan'
              }`}
            >
              <span aria-hidden="true">🗓</span>
              <span>{showCalendar ? 'Hide calendar' : 'Pick another day'}</span>
              <span className="text-xs opacity-70">{showCalendar ? '▴' : '▾'}</span>
            </button>
            {!isToday && (
              <button
                onClick={() => {
                  setSelectedKey(getDateKey(today));
                  setShowWisdomView(false);
                }}
                className="text-xs text-cyber-violet hover:text-cyber-magenta transition-colors"
              >
                ← Back to today
              </button>
            )}
          </div>
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
                setShowWisdomView(false);
              }}
            />
          </div>
        )}

        {showWisdomView ? (
          /* Stoic Wisdom & Resources View */
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-2xl space-y-8">
            <div className="text-center pb-6 border-b border-white/10">
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-cyber-cyan">INTEGRATION COMPLETED</span>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-magenta mt-1">
                STOIC WISDOM & RESOURCES
              </h2>
            </div>

            {/* Quote of the Day Box */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 text-xs font-mono text-gray-600">MEMENTO MORI</div>
              <p className="text-base italic text-gray-200 leading-relaxed mb-4">
                "{quote.quote}"
              </p>
              <p className="text-sm font-semibold text-cyber-magenta">
                — {quote.author}
              </p>
              <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-400">
                <span className="text-cyber-cyan font-semibold">Reflection:</span> {quote.prompt}
              </div>
            </div>

            {/* Core Stoic Practices Section */}
            <div>
              <h3 className="text-xs font-semibold text-cyber-violet uppercase tracking-wider mb-3">
                Core Stoic Practices
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-cyber-cyan mb-1">Dichotomy of Control</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Some things are up to us, some are not. Real freedom comes from focusing entirely on your own thoughts and actions while surrendering the rest.
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-cyber-cyan mb-1">Premeditatio Malorum</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Rehearse potential difficulties or setbacks in your mind. By visualizing them, you strip away their power to surprise or disrupt you.
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-cyber-magenta mb-1">Memento Mori</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Remember that you must die. Keeping mortality in mind helps you prioritize what is truly important and bypass trivial distractions.
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-cyber-magenta mb-1">Amor Fati</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Do not merely tolerate fate; love it. Treat everything that occurs as fuel for your growth, character, and virtue.
                  </p>
                </div>
              </div>
            </div>

            {/* Resources Section */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-xs font-semibold text-cyber-cyan uppercase tracking-wider mb-4">
                Recommended Resources
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">Essential Readings</h4>
                  <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                    <li><span className="text-gray-300 font-semibold">Meditations</span> by Marcus Aurelius (Private diary of a Roman Emperor)</li>
                    <li><span className="text-gray-300 font-semibold">Letters from a Stoic</span> by Seneca (Warm, direct letters of life advice)</li>
                    <li><span className="text-gray-300 font-semibold">Discourses and Selected Writings</span> by Epictetus (Practical lessons on mental liberty)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">Digital Communities & Hubs</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <a
                      href="https://dailystoic.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors"
                    >
                      Daily Stoic
                    </a>
                    <a
                      href="https://reddit.com/r/stoicism"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors"
                    >
                      Reddit Stoicism
                    </a>
                    <a
                      href="https://plato.stanford.edu/entries/stoicism/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors"
                    >
                      SEP Stoicism
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-4 text-center">
              <button
                onClick={() => setShowWisdomView(false)}
                className="w-full bg-gradient-to-r from-cyber-cyan to-cyber-magenta font-semibold py-3 px-6 rounded-lg text-white hover:shadow-lg hover:shadow-cyber-cyan/30 transition-all"
              >
                ← Back to Today's Entry
              </button>
            </div>
          </div>
        ) : (
          /* Glass card container */
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
                    Sign up to save your entry
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-3">
                    Create a free account to keep your reflections, synced across every device.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Statistics & Lifeline Summary Card */}
        {currentWeek && (
          <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h2 className="text-sm font-semibold text-cyber-cyan mb-4 tracking-wide flex items-center justify-between">
              <span>📊 LIFELINE SUMMARY & ENTRY STATS</span>
              <span className="text-[10px] text-gray-500 font-normal font-mono">UPDATED DAILY</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Lifeline Summary Sub-panel */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">Lifeline Status</h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Allotted:</span>
                    <span className="text-white font-semibold">{TOTAL_WEEKS.toLocaleString()} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Weeks Lived:</span>
                    <span className="text-cyber-cyan font-semibold">{currentWeek.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Weeks Left:</span>
                    <span className="text-cyber-magenta font-semibold">{weeksRemaining.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lived Progress:</span>
                    <span className="text-cyber-violet font-semibold">{lifeProgress.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* Entry Stats Sub-panel */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">Diary Stats</h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Days Logged:</span>
                    <span className="text-cyber-cyan font-semibold">{stats.totalEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Logging Streak:</span>
                    <span className="text-cyber-magenta font-semibold">{stats.streak} day{stats.streak === 1 ? '' : 's'} 🔥</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reflections (Y/N/M):</span>
                    <span className="text-cyber-violet font-semibold">{stats.yesCount}/{stats.noCount}/{stats.mixedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Aligned / Let Go:</span>
                    <span className="text-white font-semibold">{stats.alignedCount} / {stats.letGoCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 text-center leading-relaxed">
              Every day logged is a step toward conscious living. You have approximately <span className="text-cyber-cyan font-semibold">{weeksRemaining.toLocaleString()} weeks</span> left. Make them count.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
