'use client'
export default function Home() {
  return (
    <main className="rgb-bg min-h-screen text-white relative">
      <div className="grid-overlay" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/5 px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-gradient-rgb">
            BUILD-IT
          </span>
          <span className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded-full font-medium">
            BETA
          </span>
        </div>
        <a href="/builder" className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold">
          <span>Launch Builder</span>
        </a>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          India&apos;s first real-time PC compatibility checker
        </div>

        <h1 className="text-6xl sm:text-7xl font-black mb-6 leading-none tracking-tight">
          Build your{" "}
          <span className="text-gradient-rgb">dream PC.</span>
          <br />
          <span className="text-white/90">Zero guesswork.</span>
        </h1>

        <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Pick your parts, get instant compatibility checks, and buy from Indian
          retailers — all with real INR pricing.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="/builder" className="btn-primary px-8 py-4 rounded-xl text-lg font-bold w-full sm:w-auto">
            <span>Start Building Free</span>
          </a>
          <button
            onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 rounded-xl text-lg font-semibold border border-white/10 hover:border-white/20 transition-colors w-full sm:w-auto text-gray-300"
          >
            How it works
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 text-center">
          <div>
            <div className="text-3xl font-black text-gradient-cyan">100+</div>
            <div className="text-sm text-gray-500 mt-1">Components</div>
          </div>
          <div>
            <div className="text-3xl font-black text-gradient-cyan">3</div>
            <div className="text-sm text-gray-500 mt-1">Compatibility checks</div>
          </div>
          <div>
            <div className="text-3xl font-black text-gradient-cyan">Free</div>
            <div className="text-sm text-gray-500 mt-1">Cost to use</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-black text-center mb-12">
          How it <span className="text-gradient-rgb">works</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="gaming-card rounded-2xl p-6 rgb-border">
            <div className="text-xs font-black text-cyan-500/50 mb-3 tracking-widest">01</div>
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold text-lg mb-2">Pick your parts</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Browse CPUs, GPUs, motherboards, RAM, and PSUs with real Indian pricing.
            </p>
          </div>
          <div className="gaming-card rounded-2xl p-6 rgb-border">
            <div className="text-xs font-black text-cyan-500/50 mb-3 tracking-widest">02</div>
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-lg mb-2">Instant compatibility</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We check socket types, RAM compatibility, and PSU wattage in real time as you build.
            </p>
          </div>
          <div className="gaming-card rounded-2xl p-6 rgb-border">
            <div className="text-xs font-black text-cyan-500/50 mb-3 tracking-widest">03</div>
            <div className="text-3xl mb-3">🛒</div>
            <h3 className="font-bold text-lg mb-2">Buy with confidence</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every part links directly to Flipkart and Amazon.in. No compatibility surprises.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-32 text-center">
        <div className="gaming-card rounded-3xl p-12 rgb-border">
          <h2 className="text-4xl font-black mb-4">
            Ready to <span className="text-gradient-rgb">build?</span>
          </h2>
          <p className="text-gray-400 mb-8">No signup required. Start picking parts in seconds.</p>
          <a href="/builder" className="btn-primary px-8 py-4 rounded-xl text-lg font-bold inline-block">
            <span>Open the Builder</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center text-gray-600 text-sm">
        Build-IT 2026 · Made in India
      </footer>
    </main>
  )
}
