import { useState, useEffect } from 'react';
import TodayScreen from './components/TodayScreen';
import ThisWeekScreen from './components/ThisWeekScreen';
import LifeBarScreen from './components/LifeBarScreen';
import SetupModal from './components/SetupModal';
import AuthModal from './components/AuthModal';
import { getBirthYear, setBirthYear } from './utils/lifeWeeks';
import { useAuth } from './auth/AuthContext';

function App() {
  const { user, isAuthenticated, ready, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  // The lifeline only makes sense once we know the birth year, so make it the
  // very first step: gate the diary behind a mandatory birthday prompt whenever
  // no birth year is known yet.
  const [showSetup, setShowSetup] = useState(() => !getBirthYear());
  const [setupRequired, setSetupRequired] = useState(() => !getBirthYear());
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // If the signed-in account carries a birth year, adopt it locally so the
  // life-week math follows the user across devices.
  useEffect(() => {
    if (!isAuthenticated) return;
    const accountYear = user?.user_metadata?.birthYear;
    if (accountYear && !getBirthYear()) {
      setBirthYear(accountYear);
      setShowSetup(false);
      setSetupRequired(false);
    }
  }, [isAuthenticated, user]);

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const tabs = [
    { id: 'today', label: 'Today', icon: '◆' },
    { id: 'week', label: 'This Week', icon: '◇' },
    { id: 'life', label: 'Life Bar', icon: '◈' },
  ];

  return (
    <div className="min-h-screen">
      {showSetup && (
        <SetupModal
          onComplete={() => {
            setShowSetup(false);
            setSetupRequired(false);
          }}
          onClose={
            setupRequired ? undefined : () => setShowSetup(false)
          }
        />
      )}
      {showAuth && (
        <AuthModal initialMode={authMode} onClose={() => setShowAuth(false)} />
      )}

      {/* Top bar with account control */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-cyber-darker/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <span className="font-mono text-xs tracking-widest text-cyber-cyan">4000 WEEKS</span>
          {ready && (
            isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 hidden sm:inline max-w-[12rem] truncate">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="text-xs text-gray-400 hover:text-cyber-magenta transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuth('login')}
                className="text-xs font-medium text-cyber-cyan hover:text-white transition-colors"
              >
                Sign in / Sign up
              </button>
            )
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="pt-12 pb-20">
        {activeTab === 'today' && (
          <TodayScreen onRequestSignup={() => openAuth('signup')} />
        )}
        {activeTab === 'week' && (
          <ThisWeekScreen onRequestSignup={() => openAuth('signup')} />
        )}
        {activeTab === 'life' && (
          <LifeBarScreen
            onSetBirthYear={() => {
              setSetupRequired(false);
              setShowSetup(true);
            }}
            onRequestSignup={() => openAuth('signup')}
          />
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-cyber-darker/95 backdrop-blur-lg border-t border-white/10 safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                  activeTab === tab.id
                    ? 'text-cyber-cyan'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="text-xl mb-1">{tab.icon}</span>
                <span className="text-xs font-medium tracking-wide">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;
