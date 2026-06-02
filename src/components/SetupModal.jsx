import { useState } from 'react';
import { setBirthYear } from '../utils/lifeWeeks';
import { useAuth } from '../auth/AuthContext';

export default function SetupModal({ onComplete }) {
  const { isAuthenticated, saveBirthYear } = useAuth();
  const [year, setYear] = useState('1980');

  const handleSubmit = (e) => {
    e.preventDefault();
    const yearNum = parseInt(year, 10);
    if (yearNum >= 1900 && yearNum <= new Date().getFullYear()) {
      setBirthYear(yearNum);
      // Keep it on the account too, when signed in, so it follows the user.
      if (isAuthenticated) {
        saveBirthYear(yearNum).catch(() => {});
      }
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-cyber-dark to-cyber-darker border border-cyber-cyan/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-cyber-cyan mb-4">
          Welcome to 4000 Weeks
        </h2>
        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
          This diary helps you focus on what truly matters by reminding you of life's finitude.
          To calculate your life weeks, we need your birth year.
        </p>
        
        <form onSubmit={handleSubmit}>
          <label className="block mb-4">
            <span className="text-sm text-gray-400 block mb-2">Birth Year</span>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="1900"
              max={new Date().getFullYear()}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-cyber-cyan focus:ring-2 focus:ring-cyber-cyan/50 transition-all"
              autoFocus
            />
          </label>

          <div className="text-xs text-gray-500 mb-6">
            This is stored locally in your browser and never sent anywhere.
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyber-cyan to-cyber-magenta text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-cyber-cyan/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Begin
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
