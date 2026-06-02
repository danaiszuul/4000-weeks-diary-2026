import { useState } from 'react';
import { getDateKey, setBirthDate } from '../utils/lifeWeeks';
import { useAuth } from '../auth/AuthContext';

export default function SetupModal({ onComplete, onClose }) {
  const { isAuthenticated, saveBirthday } = useAuth();
  const [birthday, setBirthday] = useState('');
  const [error, setError] = useState('');

  const todayKey = getDateKey(new Date());

  const handleSubmit = (e) => {
    e.preventDefault();
    const birthDate = new Date(`${birthday}T00:00:00`);
    const earliestDate = new Date('1900-01-01T00:00:00');
    const latestDate = new Date(`${todayKey}T00:00:00`);

    if (!birthday || birthDate < earliestDate || birthDate > latestDate) {
      setError('Please choose a valid birth date between 1900 and today.');
      return;
    }

    setError('');
    setBirthDate(birthday);
    // Keep it on the account too, when signed in, so it follows the user.
    if (isAuthenticated) {
      saveBirthday(birthday).catch(() => {});
    }
    onComplete();
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_20%,rgba(0,255,255,0.18),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(255,0,255,0.12),transparent_28%),linear-gradient(135deg,#080811_0%,#101423_52%,#07070d_100%)] px-4 py-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <div className="font-mono text-xs font-semibold tracking-[0.32em] text-cyber-cyan">
            4000 WEEKS
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-cyber-cyan/50 hover:text-cyber-cyan"
            >
              Close
            </button>
          )}
        </header>

        <main className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.04fr_0.96fr]">
          <section className="landing-copy">
            <div className="mb-6 inline-flex items-center gap-3 border-y border-cyber-cyan/30 py-2 font-mono text-xs uppercase tracking-[0.24em] text-cyber-cyan">
              <span className="h-1.5 w-1.5 bg-cyber-cyan" />
              MEMENTO MORI • MAKE THE DAYS COUNT
            </div>
            <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              You have roughly 4,000 weeks.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-magenta">
                How will you use today?
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
              We do not have a short time to live, Seneca observed, but we waste a lot of it. This isn't a tool for obsessive tracking or endless hustle. It is a quiet daily practice of finitude—a space to anchor your life, focus on what you can control each morning, and reflect honestly each night.
            </p>

            <div className="mt-8 grid max-w-2xl gap-3 text-sm text-gray-300 sm:grid-cols-3">
              <div className="border-l border-cyber-cyan/50 pl-4">
                <div className="font-mono text-cyber-cyan">01</div>
                <strong className="block text-white mb-1">Map Your Lifeline</strong>
                Visualize your past and future to anchor yourself in the present.
              </div>
              <div className="border-l border-cyber-magenta/50 pl-4">
                <div className="font-mono text-cyber-magenta">02</div>
                <strong className="block text-white mb-1">Cultivate Focus</strong>
                Set a single core focus and decide what truly matters today.
              </div>
              <div className="border-l border-cyber-violet/50 pl-4">
                <div className="font-mono text-cyber-violet">03</div>
                <strong className="block text-white mb-1">Build Your Legacy</strong>
                Gather your daily reflections into a personal philosophy of action.
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="absolute -left-6 top-10 hidden h-40 w-40 border border-cyber-cyan/20 lg:block" />
            <div className="relative border border-white/15 bg-cyber-darker/80 p-5 shadow-2xl shadow-cyber-cyan/10 backdrop-blur-xl sm:p-8">
              <div className="mb-7 flex items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyber-magenta">
                    Your Beginning
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">
                    Where does your story begin?
                  </h2>
                </div>
                <div className="hidden grid-cols-4 gap-1 sm:grid">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-3 w-3 border ${
                        i < 7
                          ? 'border-cyber-cyan bg-cyber-cyan/70'
                          : 'border-white/15 bg-white/5'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">
                    Tell us the day you entered the world. We will map your weeks to help you find focus.
                  </span>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => {
                      setBirthday(e.target.value);
                      setError('');
                    }}
                    min="1900-01-01"
                    max={todayKey}
                    className="w-full border border-white/20 bg-white/5 px-4 py-4 font-mono text-lg text-white transition-all [color-scheme:dark] focus:border-cyber-cyan focus:outline-none focus:ring-2 focus:ring-cyber-cyan/40"
                    autoFocus
                    required
                  />
                </label>

                {error && (
                  <div className="border border-cyber-magenta/40 bg-cyber-magenta/10 px-4 py-3 text-sm text-cyber-magenta">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyber-cyan to-cyber-magenta px-6 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyber-cyan/30 active:scale-[0.99]"
                >
                  Begin your practice
                </button>
              </form>

              <p className="mt-5 text-sm leading-6 text-gray-400">
                Your privacy is sacred. Your birthday and reflections stay completely secure on this device until you choose to create a free account to sync them.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
