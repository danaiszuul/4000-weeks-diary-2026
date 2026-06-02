import { useState } from 'react';
import { getDateKey, setBirthDate } from '../utils/lifeWeeks';
import { useAuth } from '../auth/AuthContext';

export default function SetupModal({ onComplete, onClose }) {
  const { isAuthenticated, saveBirthday } = useAuth();
  const [birthday, setBirthday] = useState('');

  const todayKey = getDateKey(new Date());

  const handleSubmit = (e) => {
    e.preventDefault();
    const birthDate = new Date(`${birthday}T00:00:00`);
    const earliestDate = new Date('1900-01-01T00:00:00');
    const latestDate = new Date(`${todayKey}T00:00:00`);

    if (birthday && birthDate >= earliestDate && birthDate <= latestDate) {
      setBirthDate(birthday);
      // Keep it on the account too, when signed in, so it follows the user.
      if (isAuthenticated) {
        saveBirthday(birthday).catch(() => {});
      }
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-cyber-dark to-cyber-darker border border-cyber-cyan/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-cyber-cyan">
            See your life in weeks
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-500 hover:text-gray-300 text-xl leading-none"
            >
              ×
            </button>
          )}
        </div>
        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
          Enter your birthday to chart how many of life's weeks are behind you —
          a reminder to focus on what truly matters.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="block mb-4">
            <span className="text-sm text-gray-400 block mb-2">Birthday</span>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              min="1900-01-01"
              max={todayKey}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-cyber-cyan focus:ring-2 focus:ring-cyber-cyan/50 transition-all"
              autoFocus
              required
            />
          </label>

          <div className="text-xs text-gray-500 mb-6">
            Stored on this device. Create an account to keep it synced everywhere.
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyber-cyan to-cyber-magenta text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-cyber-cyan/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Show my lifeline
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-xs italic text-gray-400 text-center">
            "The whole future lies in uncertainty: live immediately."
          </div>
          <div className="text-xs text-cyber-cyan text-center mt-1">
            — Seneca
          </div>
        </div>
      </div>
    </div>
  );
}
