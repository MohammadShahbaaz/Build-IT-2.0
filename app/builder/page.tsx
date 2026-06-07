'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { checkCompatibility, SelectedBuild } from '@/lib/compatibility'

type CPU = { id: string; name: string; brand: string; socket: string; tdp: number; price_inr: number }
type Motherboard = { id: string; name: string; brand: string; socket: string; chipset: string; ram_type: string; max_ram_gb: number; price_inr: number }
type RAM = { id: string; name: string; brand: string; ram_type: string; capacity_gb: number; speed_mhz: number; price_inr: number }
type GPU = { id: string; name: string; brand: string; tdp: number; price_inr: number }
type PSU = { id: string; name: string; brand: string; wattage: number; rating: string; price_inr: number }

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

  const PARTS = [
    {
      title: 'CPU', emoji: '🖥️', color: 'cyan',
      options: cpus, selected: selectedCpu, onSelect: setSelectedCpu,
      getLabel: (c: CPU) => `${c.name} — ₹${c.price_inr.toLocaleString('en-IN')}`,
      getDetail: (c: CPU) => `${c.brand} · ${c.socket} · ${c.tdp}W TDP`,
    },
    {
      title: 'Motherboard', emoji: '🔌', color: 'purple',
      options: motherboards, selected: selectedMotherboard, onSelect: setSelectedMotherboard,
      getLabel: (m: Motherboard) => `${m.name} — ₹${m.price_inr.toLocaleString('en-IN')}`,
      getDetail: (m: Motherboard) => `${m.brand} · ${m.socket} · ${m.chipset} · ${m.ram_type}`,
    },
    {
      title: 'RAM', emoji: '💾', color: 'pink',
      options: rams, selected: selectedRam, onSelect: setSelectedRam,
      getLabel: (r: RAM) => `${r.name} — ₹${r.price_inr.toLocaleString('en-IN')}`,
      getDetail: (r: RAM) => `${r.brand} · ${r.ram_type} · ${r.capacity_gb}GB · ${r.speed_mhz}MHz`,
    },
    {
      title: 'GPU', emoji: '🎮', color: 'cyan',
      options: gpus, selected: selectedGpu, onSelect: setSelectedGpu,
      getLabel: (g: GPU) => `${g.name} — ₹${g.price_inr.toLocaleString('en-IN')}`,
      getDetail: (g: GPU) => `${g.brand} · ${g.tdp}W TDP`,
    },
    {
      title: 'PSU', emoji: '⚡', color: 'purple',
      options: psus, selected: selectedPsu, onSelect: setSelectedPsu,
      getLabel: (p: PSU) => `${p.name} — ₹${p.price_inr.toLocaleString('en-IN')}`,
      getDetail: (p: PSU) => `${p.brand} · ${p.wattage}W · ${p.rating}`,
    },
  ]

  const colorMap: Record<string, string> = {
    cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
    pink: 'border-pink-500/30 bg-pink-500/5 text-pink-400',
  }

  return (
    <main className="rgb-bg min-h-screen text-white relative">
      <div className="grid-overlay" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/5 px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-black/20">
        <a href="/" className="text-2xl font-black tracking-tight text-gradient-rgb">BUILD-IT</a>
        {session ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:block">{session.user?.email}</span>
            <button
              onClick={() => signOut()}
              className="border border-white/10 hover:border-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold"
          >
            <span>Sign in with Google</span>
          </button>
        )}
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">
            PC <span className="text-gradient-rgb">Builder</span>
          </h1>
          <p className="text-gray-400">Select your parts — compatibility is checked automatically.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — part selectors */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {PARTS.map((part) => (
              <div key={part.title} className="gaming-card rgb-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{part.emoji}</span>
                  <h2 className="font-bold text-lg">{part.title}</h2>
                  {part.selected && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${colorMap[part.color]}`}>
                      Selected
                    </span>
                  )}
                </div>

                {part.selected ? (
                  <div className="flex items-start justify-between gap-4 bg-white/3 rounded-xl p-4 border border-white/5">
                    <div>
                      <p className="font-semibold text-white">{part.getLabel(part.selected as never)}</p>
                      <p className="text-xs text-gray-400 mt-1">{part.getDetail(part.selected as never)}</p>
                    </div>
                    <button
                      onClick={() => part.onSelect(null as never)}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors whitespace-nowrap border border-white/10 hover:border-red-400/30 px-3 py-1 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <select
                    className="gaming-select w-full rounded-xl px-4 py-3 text-sm"
                    onChange={e => {
                      const found = part.options.find((o: {id: string}) => o.id === e.target.value)
                      if (found) part.onSelect(found as never)
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a {part.title}...</option>
                    {part.options.map((o: {id: string}) => (
                      <option key={o.id} value={o.id}>{part.getLabel(o as never)}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          {/* Right — summary */}
          <div className="flex flex-col gap-4">

            {/* Compatibility */}
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

            {/* Price */}
            <div className="gaming-card rgb-border rounded-2xl p-5">
              <h2 className="font-bold text-lg mb-4">Estimated Cost</h2>
              {!totalPrice ? (
                <p className="text-gray-500 text-sm">No parts selected yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedCpu && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">CPU</span>
                      <span>₹{selectedCpu.price_inr.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {selectedMotherboard && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Motherboard</span>
                      <span>₹{selectedMotherboard.price_inr.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {selectedRam && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">RAM</span>
                      <span>₹{selectedRam.price_inr.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {selectedGpu && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">GPU</span>
                      <span>₹{selectedGpu.price_inr.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {selectedPsu && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">PSU</span>
                      <span>₹{selectedPsu.price_inr.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 mt-2 pt-2 flex justify-between font-black text-lg">
                    <span>Total</span>
                    <span className="text-gradient-cyan">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Save */}
            <div className="gaming-card rgb-border rounded-2xl p-5">
              <h2 className="font-bold text-lg mb-4">Save Build</h2>
              {session ? (
                <div>
                  <button
                    onClick={handleSaveBuild}
                    className="btn-primary w-full py-3 rounded-xl font-semibold"
                  >
                    <span>Save this build</span>
                  </button>
                  {saveMsg && (
                    <p className={`text-xs mt-2 text-center ${saveMsg.includes('saved') ? 'text-green-400' : 'text-red-400'}`}>
                      {saveMsg}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  <button onClick={() => signIn('google')} className="text-cyan-400 hover:underline font-medium">
                    Sign in
                  </button>{' '}
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
