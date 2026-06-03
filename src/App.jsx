import { useState } from 'react';
import TodayScreen from './components/TodayScreen';
import ThisWeekScreen from './components/ThisWeekScreen';
import LifeBarScreen from './components/LifeBarScreen';
import AuthModal from './components/AuthModal';
import LandingScreen from './components/LandingScreen';
import { useAuth } from './auth/AuthContext';

function App() {
  const { user, isAuthenticated, ready, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const tabs = [
    { id: 'today', label: 'Today', icon: '◆' },
    { id: 'week', label: 'This Week', icon: '◇' },
    { id: 'life', label: 'Life Bar', icon: '◈' },
  ];

  if (!ready) {
    return (
      <div className="min-h-screen bg-cyber-darker flex flex-col items-center justify-center font-mono text-xs tracking-widest text-cyber-cyan">
        <div className="mb-4 text-sm animate-pulse">4000 WEEKS</div>
        <div className="h-1 w-24 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-magenta animate-glow-pulse w-full" />
        </div>
        <span className="mt-4 text-[10px] text-gray-500">INITIALIZING PROTOCOL...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LandingScreen onOpenAuth={openAuth} />
        {showAuth && (
          <AuthModal initialMode={authMode} onClose={() => setShowAuth(false)} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen">
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
