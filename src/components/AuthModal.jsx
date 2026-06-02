import { useState } from 'react';
import { AuthError, MissingIdentityError } from '@netlify/identity';
import { useAuth } from '../auth/AuthContext';
import { getBirthYear, setBirthYear } from '../utils/lifeWeeks';

const THIS_YEAR = new Date().getFullYear();

export default function AuthModal({ onClose, initialMode = 'login' }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Prefill the birth year if one was already entered to preview the lifeline.
  const [birthYear, setBirthYearField] = useState(() => {
    const existing = getBirthYear();
    return existing ? String(existing) : '';
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
        const yearNum = parseInt(birthYear, 10);
        if (!yearNum || yearNum < 1900 || yearNum > THIS_YEAR) {
          setError('Please enter a valid birth year.');
          setBusy(false);
          return;
        }
        // Persist locally so the lifeline works immediately, and pass it to the
        // account so it follows the user across devices.
        setBirthYear(yearNum);
        const u = await signup(email, password, name, yearNum);
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
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
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
            ? 'Sign in to save your reflections and pick up where you left off on any device.'
            : 'An account keeps your diary in sync so you can return to it anywhere.'}
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
              <span className="text-sm text-gray-400 block mb-2">Birth year</span>
              <input
                type="number"
                required
                value={birthYear}
                onChange={(e) => setBirthYearField(e.target.value)}
                min="1900"
                max={THIS_YEAR}
                placeholder="e.g. 1990"
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
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {mode === 'login' ? (
            <>
              No account yet?{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); setNotice(''); }}
                className="text-cyber-cyan hover:underline"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); setNotice(''); }}
                className="text-cyber-cyan hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
