export default function AuthErrorPage() {
  return (
    <main className="rgb-bg min-h-screen text-white relative flex items-center justify-center">
      <div className="grid-overlay" />
      <div className="relative z-10 text-center px-6">
        <div className="text-6xl mb-6">😕</div>
        <h1 className="text-3xl font-black mb-3">Sign in cancelled</h1>
        <p className="text-gray-400 mb-8">No worries — you can browse without signing in.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/builder" className="btn-primary px-8 py-3 rounded-xl font-semibold inline-block">
            <span>Go to Builder</span>
          </a>
          <a href="/" className="px-8 py-3 rounded-xl font-semibold border border-white/10 hover:border-white/20 transition-colors text-gray-300 inline-block">
            Back to Home
          </a>
        </div>
      </div>
    </main>
  )
}