'use client'

// 'use client' tells Next.js this page runs in the browser
// (not on the server) because it needs to react to user clicks

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { checkCompatibility, SelectedBuild } from '@/lib/compatibility'

// These types match exactly what we stored in Supabase
type CPU = { id: string; name: string; brand: string; socket: string; tdp: number; price_inr: number }
type Motherboard = { id: string; name: string; brand: string; socket: string; chipset: string; ram_type: string; max_ram_gb: number; price_inr: number }
type RAM = { id: string; name: string; brand: string; ram_type: string; capacity_gb: number; speed_mhz: number; price_inr: number }
type GPU = { id: string; name: string; brand: string; tdp: number; price_inr: number }
type PSU = { id: string; name: string; brand: string; wattage: number; rating: string; price_inr: number }

export default function BuilderPage() {
  // All available parts fetched from Supabase
  const [cpus, setCpus] = useState<CPU[]>([])
  const [motherboards, setMotherboards] = useState<Motherboard[]>([])
  const [rams, setRams] = useState<RAM[]>([])
  const [gpus, setGpus] = useState<GPU[]>([])
  const [psus, setPsus] = useState<PSU[]>([])

  // What the user has selected so far
  const [selectedCpu, setSelectedCpu] = useState<CPU | null>(null)
  const [selectedMotherboard, setSelectedMotherboard] = useState<Motherboard | null>(null)
  const [selectedRam, setSelectedRam] = useState<RAM | null>(null)
  const [selectedGpu, setSelectedGpu] = useState<GPU | null>(null)
  const [selectedPsu, setSelectedPsu] = useState<PSU | null>(null)

  // Fetch all parts from Supabase when the page loads
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

  // Build the object our compatibility checker understands
  const currentBuild: SelectedBuild = {
    cpu: selectedCpu ?? undefined,
    motherboard: selectedMotherboard ?? undefined,
    ram: selectedRam ?? undefined,
    gpu: selectedGpu ?? undefined,
    psu: selectedPsu ?? undefined,
  }

  // Run compatibility check every time selection changes
  const issues = checkCompatibility(currentBuild)
  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  // Total price of selected parts
  const totalPrice = [
    selectedCpu?.price_inr,
    selectedMotherboard?.price_inr,
    selectedRam?.price_inr,
    selectedGpu?.price_inr,
    selectedPsu?.price_inr,
  ].reduce((sum, p) => (sum ?? 0) + (p ?? 0), 0)

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-blue-400">Build-IT</a>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Sign in
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">PC Builder</h1>
        <p className="text-gray-400 mb-8">Select your parts — compatibility is checked automatically.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column — part selectors */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* CPU */}
            <PartSelector
              title="CPU"
              emoji="🖥️"
              options={cpus}
              selected={selectedCpu}
              onSelect={setSelectedCpu}
              getLabel={c => `${c.name} — ₹${c.price_inr.toLocaleString('en-IN')}`}
              getDetail={c => `${c.brand} · ${c.socket} · ${c.tdp}W TDP`}
            />

            {/* Motherboard */}
            <PartSelector
              title="Motherboard"
              emoji="🔌"
              options={motherboards}
              selected={selectedMotherboard}
              onSelect={setSelectedMotherboard}
              getLabel={m => `${m.name} — ₹${m.price_inr.toLocaleString('en-IN')}`}
              getDetail={m => `${m.brand} · ${m.socket} · ${m.chipset} · ${m.ram_type}`}
            />

            {/* RAM */}
            <PartSelector
              title="RAM"
              emoji="💾"
              options={rams}
              selected={selectedRam}
              onSelect={setSelectedRam}
              getLabel={r => `${r.name} — ₹${r.price_inr.toLocaleString('en-IN')}`}
              getDetail={r => `${r.brand} · ${r.ram_type} · ${r.capacity_gb}GB · ${r.speed_mhz}MHz`}
            />

            {/* GPU */}
            <PartSelector
              title="GPU"
              emoji="🎮"
              options={gpus}
              selected={selectedGpu}
              onSelect={setSelectedGpu}
              getLabel={g => `${g.name} — ₹${g.price_inr.toLocaleString('en-IN')}`}
              getDetail={g => `${g.brand} · ${g.tdp}W TDP`}
            />

            {/* PSU */}
            <PartSelector
              title="PSU"
              emoji="⚡"
              options={psus}
              selected={selectedPsu}
              onSelect={setSelectedPsu}
              getLabel={p => `${p.name} — ₹${p.price_inr.toLocaleString('en-IN')}`}
              getDetail={p => `${p.brand} · ${p.wattage}W · ${p.rating}`}
            />

          </div>

          {/* Right column — summary panel */}
          <div className="flex flex-col gap-4">

            {/* Compatibility status */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="font-semibold mb-3">Compatibility</h2>
              {issues.length === 0 ? (
                <p className="text-green-400 text-sm">
                  ✅ {Object.values(currentBuild).some(v => v) ? 'All selected parts are compatible.' : 'Select parts to check compatibility.'}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {errors.map((issue, i) => (
                    <p key={i} className="text-red-400 text-sm">{issue.message}</p>
                  ))}
                  {warnings.map((issue, i) => (
                    <p key={i} className="text-yellow-400 text-sm">{issue.message}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Price summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="font-semibold mb-3">Estimated Cost</h2>
              <div className="flex flex-col gap-1 text-sm text-gray-400">
                {selectedCpu && <div className="flex justify-between"><span>CPU</span><span>₹{selectedCpu.price_inr.toLocaleString('en-IN')}</span></div>}
                {selectedMotherboard && <div className="flex justify-between"><span>Motherboard</span><span>₹{selectedMotherboard.price_inr.toLocaleString('en-IN')}</span></div>}
                {selectedRam && <div className="flex justify-between"><span>RAM</span><span>₹{selectedRam.price_inr.toLocaleString('en-IN')}</span></div>}
                {selectedGpu && <div className="flex justify-between"><span>GPU</span><span>₹{selectedGpu.price_inr.toLocaleString('en-IN')}</span></div>}
                {selectedPsu && <div className="flex justify-between"><span>PSU</span><span>₹{selectedPsu.price_inr.toLocaleString('en-IN')}</span></div>}
                {totalPrice ? (
                  <div className="flex justify-between font-semibold text-white border-t border-gray-700 mt-2 pt-2">
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                ) : (
                  <p className="text-gray-600">No parts selected yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}

// Reusable component for selecting a part
// Instead of writing the same card UI 5 times, we write it once and reuse it
function PartSelector<T extends { id: string }>({
  title, emoji, options, selected, onSelect, getLabel, getDetail
}: {
  title: string
  emoji: string
  options: T[]
  selected: T | null
  onSelect: (item: T | null) => void
  getLabel: (item: T) => string
  getDetail: (item: T) => string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="font-semibold mb-3">{emoji} {title}</h2>
      {selected ? (
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">{getLabel(selected)}</p>
            <p className="text-xs text-gray-400 mt-1">{getDetail(selected)}</p>
          </div>
          <button
            onClick={() => onSelect(null)}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors whitespace-nowrap"
          >
            Remove
          </button>
        </div>
      ) : (
        <select
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
          onChange={e => {
            const found = options.find(o => o.id === e.target.value)
            if (found) onSelect(found)
          }}
          defaultValue=""
        >
          <option value="" disabled>Select a {title}...</option>
          {options.map(o => (
            <option key={o.id} value={o.id}>{getLabel(o)}</option>
          ))}
        </select>
      )}
    </div>
  )
}