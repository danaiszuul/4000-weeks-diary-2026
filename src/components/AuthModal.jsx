import { useState } from 'react';
import { AuthError, MissingIdentityError } from '@netlify/identity';
import { useAuth } from '../auth/AuthContext';
import { getBirthDate, getDateKey, setBirthDate } from '../utils/lifeWeeks';

const TODAY_KEY = getDateKey(new Date());

export default function AuthModal({ onClose, initialMode = 'login' }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Prefill the birthday if one was already entered to preview the lifeline.
  const [birthday, setBirthday] = useState(() => {
    const existing = getBirthDate();
    return existing || '';
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else {
        const birthDate = new Date(`${birthday}T00:00:00`);
        const earliestDate = new Date('1900-01-01T00:00:00');
        const latestDate = new Date(`${TODAY_KEY}T00:00:00`);

        if (!birthday || birthDate < earliestDate || birthDate > latestDate) {
          setError('Please enter a valid birthday.');
          setBusy(false);
          return;
        }
        // Persist locally so the lifeline works immediately, and pass it to the
        // account so it follows the user across devices.
        setBirthDate(birthday);
        const u = await signup(email, password, name, birthday);
        if (u?.emailVerified) {
          // Autoconfirm is on — the user is logged in immediately.
          await login(email, password);
          onClose();
        } else {
          setNotice('Check your email to confirm your account, then sign in.');
          setMode('login');
        }
      }
    } catch (err) {
      if (err instanceof MissingIdentityError) {
        setError('Accounts are not available yet. Your entries are still saved on this device.');
      } else if (err instanceof AuthError) {
        if (err.status === 401) setError('Invalid email or password.');
        else if (err.status === 403) setError('Sign-ups are currently disabled.');
        else if (err.status === 422) setError('Please enter a valid email and a stronger password.');
        else setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-cyber-dark to-cyber-darker border border-cyber-cyan/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-2xl font-bold text-cyber-cyan">
            {mode === 'login' ? 'Return to your path' : 'Preserve your practice'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-300 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
          {mode === 'login'
            ? 'Sign in to access your legacy of daily practices and continue your reflections.'
            : 'By preserving your reflections, you create an enduring record of your daily focus. Your history is stored securely, keeping your path in sync on any device.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <label className="block">
              <span className="text-sm text-gray-400 block mb-2">Name (optional)</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyber-cyan focus:ring-2 focus:ring-cyber-cyan/50 transition-all"
              />
            </label>
          )}

          {mode === 'signup' && (
            <label className="block">
              <span className="text-sm text-gray-400 block mb-2">Birthday</span>
              <input
                type="date"
                required
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                min="1900-01-01"
                max={TODAY_KEY}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-cyber-cyan focus:ring-2 focus:ring-cyber-cyan/50 transition-all"
              />
              <span className="text-xs text-gray-500 block mt-2">
                Used to chart your life in weeks.
              </span>
            </label>
          )}

          <label className="block">
            <span className="text-sm text-gray-400 block mb-2">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyber-cyan focus:ring-2 focus:ring-cyber-cyan/50 transition-all"
              autoFocus
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-400 block mb-2">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyber-cyan focus:ring-2 focus:ring-cyber-cyan/50 transition-all"
            />
          </label>

          {error && <div className="text-sm text-cyber-magenta">{error}</div>}
          {notice && <div className="text-sm text-cyber-cyan">{notice}</div>}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-gradient-to-r from-cyber-cyan to-cyber-magenta text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-cyber-cyan/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Resume practice' : 'Begin legacy'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {mode === 'login' ? (
            <>
              New to the practice?{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); setNotice(''); }}
                className="text-cyber-cyan hover:underline"
              >
                Begin your legacy
              </button>
            </>
          ) : (
            <>
              Already on this path?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); setNotice(''); }}
                className="text-cyber-cyan hover:underline"
              >
                Resume practice
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
