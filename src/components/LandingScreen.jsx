export default function LandingScreen({ onOpenAuth }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_20%,rgba(0,255,255,0.18),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(255,0,255,0.12),transparent_28%),linear-gradient(135deg,#080811_0%,#101423_52%,#07070d_100%)] px-4 py-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-between">
        <header className="flex items-center justify-between">
          <div className="font-mono text-xs font-semibold tracking-[0.32em] text-cyber-cyan">
            4000 WEEKS
          </div>
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
                Where will you spend them?
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300 font-sans">
              4000 Weeks is a Stoic-inspired daily focus and lifelogging journal. In a world of endless distraction and infinite demands, it helps you recognize your finitude, anchor your mind on what is in your control, and spend your limited weeks on what truly matters.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onOpenAuth('signup')}
                className="inline-flex justify-center items-center rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-magenta p-[1px] text-white hover:opacity-90 transition-opacity"
              >
                <span className="flex w-full items-center justify-center bg-cyber-darker rounded-xl px-8 py-4 font-mono text-sm uppercase tracking-wider hover:bg-transparent transition-colors">
                  Start Your Journey
                </span>
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="inline-flex justify-center items-center rounded-xl border border-white/15 bg-white/5 px-8 py-4 font-mono text-sm uppercase tracking-wider text-gray-300 transition-colors hover:border-cyber-cyan/50 hover:text-cyber-cyan"
              >
                Sign In
              </button>
            </div>
          </section>

          <section className="relative">
            <div className="absolute -left-6 top-10 hidden h-40 w-40 border border-cyber-cyan/20 lg:block" />
            <div className="relative border border-white/15 bg-cyber-darker/80 p-6 shadow-2xl shadow-cyber-cyan/10 backdrop-blur-xl sm:p-8 rounded-2xl">
              <div className="mb-7">
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyber-magenta mb-2">
                  System Architecture
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  Why 4000 Weeks?
                </h2>
              </div>

              <div className="space-y-6 text-sm text-gray-300">
                <div className="border-l-2 border-cyber-cyan pl-4">
                  <strong className="block text-white mb-1 font-mono text-xs tracking-wider uppercase text-cyber-cyan">
                    Secure Cloud Sync
                  </strong>
                  Your journal entries are encrypted and safely stored in Netlify Database, ensuring seamless synchronization across all your secure terminals.
                </div>
                <div className="border-l-2 border-cyber-magenta pl-4">
                  <strong className="block text-white mb-1 font-mono text-xs tracking-wider uppercase text-cyber-magenta">
                    Privacy-First Cache Clearing
                  </strong>
                  To protect your thoughts, our local storage cache is automatically cleared when you sign out or aren't logged in, preventing any physical snooping.
                </div>
                <div className="border-l-2 border-cyber-violet pl-4">
                  <strong className="block text-white mb-1 font-mono text-xs tracking-wider uppercase text-cyber-violet">
                    Finitude Tracking
                  </strong>
                  A visual Stoic life progress bar reminds you of how many weeks you've lived, motivating conscious priority selection and reducing anxiety.
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6 text-center">
                <blockquote className="italic text-gray-400 font-serif text-sm">
                  "It is not that we have a short time to live, but that we waste a lot of it."
                </blockquote>
                <cite className="block mt-2 font-mono text-xs text-cyber-cyan not-italic">
                  — Seneca, On the Shortness of Life
                </cite>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-10 border-t border-white/10 pt-4 text-center font-mono text-[10px] tracking-widest text-gray-500">
          SECURE PROTOCOL // VERSION 1.1.0 // MEMENTO MORI
        </footer>
      </div>
    </div>
  );
}
