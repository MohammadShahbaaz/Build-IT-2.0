export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-blue-400">Build-IT</span>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Build your perfect PC.{" "}
          <span className="text-blue-400">No compatibility surprises.</span>
        </h1>
        <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
          Pick your parts, check compatibility in real time, and buy from Indian
          retailers — all in one place.
        </p>
        <a href="/builder" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors inline-block">
          Start Building →
        </a>
      </section>

      {/* Feature cards */}
      <section className="max-w-4xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="font-semibold text-lg mb-2">Compatibility Check</h3>
          <p className="text-gray-400 text-sm">
            We check CPU socket, RAM type, PSU wattage and more — instantly.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-3xl mb-3">💰</div>
          <h3 className="font-semibold text-lg mb-2">Indian Pricing</h3>
          <p className="text-gray-400 text-sm">
            Real INR prices from Flipkart, Amazon.in, and more. No conversion
            guesswork.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-3xl mb-3">💾</div>
          <h3 className="font-semibold text-lg mb-2">Save Your Build</h3>
          <p className="text-gray-400 text-sm">
            Sign in to save builds, share them with friends, or come back later.
          </p>
        </div>
      </section>

    </main>
  );
}