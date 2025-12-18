import { useState, useEffect } from 'react';
import TodayScreen from './components/TodayScreen';
import ThisWeekScreen from './components/ThisWeekScreen';
import LifeBarScreen from './components/LifeBarScreen';
import SetupModal from './components/SetupModal';
import { getBirthYear } from './utils/lifeWeeks';

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const birthYear = getBirthYear();
    if (!birthYear) {
      setShowSetup(true);
    }
  }, []);

  const tabs = [
    { id: 'today', label: 'Today', icon: '◆' },
    { id: 'week', label: 'This Week', icon: '◇' },
    { id: 'life', label: 'Life Bar', icon: '◈' },
  ];

  return (
    <div className="min-h-screen">
      {showSetup && <SetupModal onComplete={() => setShowSetup(false)} />}
      
      {/* Main content */}
      <main className="pb-20">
        {activeTab === 'today' && <TodayScreen />}
        {activeTab === 'week' && <ThisWeekScreen />}
        {activeTab === 'life' && <LifeBarScreen />}
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
