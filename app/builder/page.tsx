'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { checkCompatibility, SelectedBuild } from '@/lib/compatibility'
import PartSelect from '@/components/PartSelect'

type CPU = { id: string; name: string; brand: string; socket: string; tdp: number; price_inr: number; amazon_url?: string; flipkart_url?: string }
type Motherboard = { id: string; name: string; brand: string; socket: string; chipset: string; ram_type: string; max_ram_gb: number; price_inr: number; amazon_url?: string; flipkart_url?: string }
type RAM = { id: string; name: string; brand: string; ram_type: string; capacity_gb: number; speed_mhz: number; price_inr: number; amazon_url?: string; flipkart_url?: string }
type GPU = { id: string; name: string; brand: string; tdp: number; price_inr: number; amazon_url?: string; flipkart_url?: string }
type PSU = { id: string; name: string; brand: string; wattage: number; rating: string; price_inr: number; amazon_url?: string; flipkart_url?: string }
type AnyPart = { id: string; name: string; price_inr: number; amazon_url?: string; flipkart_url?: string }

function BuyButtons({ part }: { part: AnyPart }) {
  if (!part.amazon_url && !part.flipkart_url) return null
  return (
    <div className="flex gap-2 mt-3">
      {part.amazon_url && (
        <a href={part.amazon_url} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center text-xs font-semibold py-2 px-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-colors">
          Buy on Amazon
        </a>
      )}
      {part.flipkart_url && (
        <a href={part.flipkart_url} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center text-xs font-semibold py-2 px-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors">
          Buy on Flipkart
        </a>
      )}
    </div>
  )
}

export default function BuilderPage() {
  const [cpus, setCpus] = useState<CPU[]>([])
  const [motherboards, setMotherboards] = useState<Motherboard[]>([])
  const [rams, setRams] = useState<RAM[]>([])
  const [gpus, setGpus] = useState<GPU[]>([])
  const [psus, setPsus] = useState<PSU[]>([])

  const [selectedCpu, setSelectedCpu] = useState<CPU | null>(null)
  const [selectedMotherboard, setSelectedMotherboard] = useState<Motherboard | null>(null)
  const [selectedRam, setSelectedRam] = useState<RAM | null>(null)
  const [selectedGpu, setSelectedGpu] = useState<GPU | null>(null)
  const [selectedPsu, setSelectedPsu] = useState<PSU | null>(null)
  const [saveMsg, setSaveMsg] = useState('')

  const { data: session } = useSession()

  useEffect(() => {
    async function loadParts() {
      const [cpuRes, mbRes, ramRes, gpuRes, psuRes] = await Promise.all([
        supabase.from('cpus').select('*').order('price_inr'),
        supabase.from('motherboards').select('*').order('price_inr'),
        supabase.from('rams').select('*').order('price_inr'),
        supabase.from('gpus').select('*').order('price_inr'),
        supabase.from('psus').select('*').order('price_inr'),
      ])
      if (cpuRes.data) setCpus(cpuRes.data)
      if (mbRes.data) setMotherboards(mbRes.data)
      if (ramRes.data) setRams(ramRes.data)
      if (gpuRes.data) setGpus(gpuRes.data)
      if (psuRes.data) setPsus(psuRes.data)
    }
    loadParts()
  }, [])

  const currentBuild: SelectedBuild = {
    cpu: selectedCpu ?? undefined,
    motherboard: selectedMotherboard ?? undefined,
    ram: selectedRam ?? undefined,
    gpu: selectedGpu ?? undefined,
    psu: selectedPsu ?? undefined,
  }

  const issues = checkCompatibility(currentBuild)
  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')
  const hasAnyPart = Object.values(currentBuild).some(v => v)

  const totalPrice = [
    selectedCpu?.price_inr,
    selectedMotherboard?.price_inr,
    selectedRam?.price_inr,
    selectedGpu?.price_inr,
    selectedPsu?.price_inr,
  ].reduce((sum, p) => (sum ?? 0) + (p ?? 0), 0)

  async function handleSaveBuild() {
    if (!session?.user) return
    if (!selectedCpu) { setSaveMsg('Select at least a CPU first.'); return }
    const { error } = await supabase.from('saved_builds').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      name: `${selectedCpu.name} Build`,
      cpu_id: selectedCpu?.id ?? null,
      motherboard_id: selectedMotherboard?.id ?? null,
      ram_id: selectedRam?.id ?? null,
      gpu_id: selectedGpu?.id ?? null,
      psu_id: selectedPsu?.id ?? null,
      total_price_inr: totalPrice ?? 0,
    })
    if (error) { setSaveMsg('Failed to save. Try again.') }
    else { setSaveMsg('Build saved!') }
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const colorMap: Record<string, string> = {
    cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
    pink: 'border-pink-500/30 bg-pink-500/5 text-pink-400',
  }

  return (
    <main className="rgb-bg min-h-screen text-white relative">
      <div className="grid-overlay" />

      <nav className="relative z-10 border-b border-white/5 px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-black/20">
        <a href="/" className="text-2xl font-black tracking-tight text-gradient-rgb">BUILD-IT</a>
        {session ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:block">{session.user?.email}</span>
            <a href="/builds" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">My Builds</a>
            <button onClick={() => signOut()} className="border border-white/10 hover:border-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Sign out
            </button>
          </div>
        ) : (
          <button onClick={() => signIn('google')} className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold">
            <span>Sign in with Google</span>
          </button>
        )}
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">PC <span className="text-gradient-rgb">Builder</span></h1>
          <p className="text-gray-400">Select your parts — compatibility is checked automatically.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* CPU */}
            <div className="gaming-card rgb-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🖥️</span>
                <h2 className="font-bold text-lg">CPU</h2>
                {selectedCpu && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${colorMap.cyan}`}>Selected</span>}
              </div>
              {selectedCpu ? (
                <div>
                  <div className="flex items-start justify-between gap-4 bg-white/3 rounded-xl p-4 border border-white/5">
                    <div>
                      <p className="font-semibold text-white">{selectedCpu.name} — ₹{selectedCpu.price_inr.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400 mt-1">{selectedCpu.brand} · {selectedCpu.socket} · {selectedCpu.tdp}W TDP</p>
                    </div>
                    <button onClick={() => setSelectedCpu(null)} className="text-xs text-gray-500 hover:text-red-400 transition-colors whitespace-nowrap border border-white/10 hover:border-red-400/30 px-3 py-1 rounded-lg">Remove</button>
                  </div>
                  <BuyButtons part={selectedCpu} />
                </div>
              ) : (
                <PartSelect
                  placeholder="Select a CPU..."
                  options={cpus.map(c => ({ id: c.id, label: `${c.name} — ₹${c.price_inr.toLocaleString('en-IN')}`, detail: `${c.brand} · ${c.socket} · ${c.tdp}W TDP` }))}
                  onSelect={id => { const f = cpus.find(c => c.id === id); if (f) setSelectedCpu(f) }}
                />
              )}
            </div>

            {/* Motherboard */}
            <div className="gaming-card rgb-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔌</span>
                <h2 className="font-bold text-lg">Motherboard</h2>
                {selectedMotherboard && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${colorMap.purple}`}>Selected</span>}
              </div>
              {selectedMotherboard ? (
                <div>
                  <div className="flex items-start justify-between gap-4 bg-white/3 rounded-xl p-4 border border-white/5">
                    <div>
                      <p className="font-semibold text-white">{selectedMotherboard.name} — ₹{selectedMotherboard.price_inr.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400 mt-1">{selectedMotherboard.brand} · {selectedMotherboard.socket} · {selectedMotherboard.chipset} · {selectedMotherboard.ram_type}</p>
                    </div>
                    <button onClick={() => setSelectedMotherboard(null)} className="text-xs text-gray-500 hover:text-red-400 transition-colors whitespace-nowrap border border-white/10 hover:border-red-400/30 px-3 py-1 rounded-lg">Remove</button>
                  </div>
                  <BuyButtons part={selectedMotherboard} />
                </div>
              ) : (
                <PartSelect
                  placeholder="Select a Motherboard..."
                  options={motherboards.map(m => ({ id: m.id, label: `${m.name} — ₹${m.price_inr.toLocaleString('en-IN')}`, detail: `${m.brand} · ${m.socket} · ${m.chipset} · ${m.ram_type}` }))}
                  onSelect={id => { const f = motherboards.find(m => m.id === id); if (f) setSelectedMotherboard(f) }}
                />
              )}
            </div>

            {/* RAM */}
            <div className="gaming-card rgb-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💾</span>
                <h2 className="font-bold text-lg">RAM</h2>
                {selectedRam && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${colorMap.pink}`}>Selected</span>}
              </div>
              {selectedRam ? (
                <div>
                  <div className="flex items-start justify-between gap-4 bg-white/3 rounded-xl p-4 border border-white/5">
                    <div>
                      <p className="font-semibold text-white">{selectedRam.name} — ₹{selectedRam.price_inr.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400 mt-1">{selectedRam.brand} · {selectedRam.ram_type} · {selectedRam.capacity_gb}GB · {selectedRam.speed_mhz}MHz</p>
                    </div>
                    <button onClick={() => setSelectedRam(null)} className="text-xs text-gray-500 hover:text-red-400 transition-colors whitespace-nowrap border border-white/10 hover:border-red-400/30 px-3 py-1 rounded-lg">Remove</button>
                  </div>
                  <BuyButtons part={selectedRam} />
                </div>
              ) : (
                <PartSelect
                  placeholder="Select a RAM..."
                  options={rams.map(r => ({ id: r.id, label: `${r.name} — ₹${r.price_inr.toLocaleString('en-IN')}`, detail: `${r.brand} · ${r.ram_type} · ${r.capacity_gb}GB · ${r.speed_mhz}MHz` }))}
                  onSelect={id => { const f = rams.find(r => r.id === id); if (f) setSelectedRam(f) }}
                />
              )}
            </div>

            {/* GPU */}
            <div className="gaming-card rgb-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎮</span>
                <h2 className="font-bold text-lg">GPU</h2>
                {selectedGpu && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${colorMap.cyan}`}>Selected</span>}
              </div>
              {selectedGpu ? (
                <div>
                  <div className="flex items-start justify-between gap-4 bg-white/3 rounded-xl p-4 border border-white/5">
                    <div>
                      <p className="font-semibold text-white">{selectedGpu.name} — ₹{selectedGpu.price_inr.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400 mt-1">{selectedGpu.brand} · {selectedGpu.tdp}W TDP</p>
                    </div>
                    <button onClick={() => setSelectedGpu(null)} className="text-xs text-gray-500 hover:text-red-400 transition-colors whitespace-nowrap border border-white/10 hover:border-red-400/30 px-3 py-1 rounded-lg">Remove</button>
                  </div>
                  <BuyButtons part={selectedGpu} />
                </div>
              ) : (
                <PartSelect
                  placeholder="Select a GPU..."
                  options={gpus.map(g => ({ id: g.id, label: `${g.name} — ₹${g.price_inr.toLocaleString('en-IN')}`, detail: `${g.brand} · ${g.tdp}W TDP` }))}
                  onSelect={id => { const f = gpus.find(g => g.id === id); if (f) setSelectedGpu(f) }}
                />
              )}
            </div>

            {/* PSU */}
            <div className="gaming-card rgb-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚡</span>
                <h2 className="font-bold text-lg">PSU</h2>
                {selectedPsu && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${colorMap.purple}`}>Selected</span>}
              </div>
              {selectedPsu ? (
                <div>
                  <div className="flex items-start justify-between gap-4 bg-white/3 rounded-xl p-4 border border-white/5">
                    <div>
                      <p className="font-semibold text-white">{selectedPsu.name} — ₹{selectedPsu.price_inr.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400 mt-1">{selectedPsu.brand} · {selectedPsu.wattage}W · {selectedPsu.rating}</p>
                    </div>
                    <button onClick={() => setSelectedPsu(null)} className="text-xs text-gray-500 hover:text-red-400 transition-colors whitespace-nowrap border border-white/10 hover:border-red-400/30 px-3 py-1 rounded-lg">Remove</button>
                  </div>
                  <BuyButtons part={selectedPsu} />
                </div>
              ) : (
                <PartSelect
                  placeholder="Select a PSU..."
                  options={psus.map(p => ({ id: p.id, label: `${p.name} — ₹${p.price_inr.toLocaleString('en-IN')}`, detail: `${p.brand} · ${p.wattage}W · ${p.rating}` }))}
                  onSelect={id => { const f = psus.find(p => p.id === id); if (f) setSelectedPsu(f) }}
                />
              )}
            </div>

          </div>

          {/* Right — summary */}
          <div className="flex flex-col gap-4">

            <div className="gaming-card rgb-border rounded-2xl p-5">
              <h2 className="font-bold text-lg mb-4">Compatibility</h2>
              {!hasAnyPart ? (
                <p className="text-gray-500 text-sm">Select parts to check compatibility.</p>
              ) : issues.length === 0 ? (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3 compat-ok">
                  <span className="text-green-400 text-lg">✅</span>
                  <p className="text-green-400 text-sm font-medium">All parts compatible!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {errors.map((issue, i) => (
                    <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <p className="text-red-400 text-xs leading-relaxed">{issue.message}</p>
                    </div>
                  ))}
                  {warnings.map((issue, i) => (
                    <div key={i} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                      <p className="text-yellow-400 text-xs leading-relaxed">{issue.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="gaming-card rgb-border rounded-2xl p-5">
              <h2 className="font-bold text-lg mb-4">Estimated Cost</h2>
              {!totalPrice ? (
                <p className="text-gray-500 text-sm">No parts selected yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedCpu && <div className="flex justify-between text-sm"><span className="text-gray-400">CPU</span><span>₹{selectedCpu.price_inr.toLocaleString('en-IN')}</span></div>}
                  {selectedMotherboard && <div className="flex justify-between text-sm"><span className="text-gray-400">Motherboard</span><span>₹{selectedMotherboard.price_inr.toLocaleString('en-IN')}</span></div>}
                  {selectedRam && <div className="flex justify-between text-sm"><span className="text-gray-400">RAM</span><span>₹{selectedRam.price_inr.toLocaleString('en-IN')}</span></div>}
                  {selectedGpu && <div className="flex justify-between text-sm"><span className="text-gray-400">GPU</span><span>₹{selectedGpu.price_inr.toLocaleString('en-IN')}</span></div>}
                  {selectedPsu && <div className="flex justify-between text-sm"><span className="text-gray-400">PSU</span><span>₹{selectedPsu.price_inr.toLocaleString('en-IN')}</span></div>}
                  <div className="border-t border-white/10 mt-2 pt-2 flex justify-between font-black text-lg">
                    <span>Total</span>
                    <span className="text-gradient-cyan">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="gaming-card rgb-border rounded-2xl p-5">
              <h2 className="font-bold text-lg mb-4">Save Build</h2>
              {session ? (
                <div>
                  <button onClick={handleSaveBuild} className="btn-primary w-full py-3 rounded-xl font-semibold">
                    <span>Save this build</span>
                  </button>
                  {saveMsg && (
                    <p className={`text-xs mt-2 text-center ${saveMsg.includes('saved') ? 'text-green-400' : 'text-red-400'}`}>{saveMsg}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  <button onClick={() => signIn('google')} className="text-cyan-400 hover:underline font-medium">Sign in</button>{' '}
                  to save your build and access it later.
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
