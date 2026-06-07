'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { supabase } from '@/lib/supabase'

type SavedBuild = {
  id: string
  name: string
  total_price_inr: number
  created_at: string
  cpu_id: string | null
  motherboard_id: string | null
  ram_id: string | null
  gpu_id: string | null
  psu_id: string | null
}

type PartName = { id: string; name: string }

export default function BuildsPage() {
  const { data: session, status } = useSession()
  const [builds, setBuilds] = useState<SavedBuild[]>([])
  const [partNames, setPartNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.email) return
    loadBuilds()
  }, [session])

  async function loadBuilds() {
    setLoading(true)
    const { data: buildsData } = await supabase
      .from('saved_builds')
      .select('*')
      .eq('user_email', session?.user?.email)
      .order('created_at', { ascending: false })

    if (!buildsData) { setLoading(false); return }
    setBuilds(buildsData)

    const cpuIds = buildsData.map(b => b.cpu_id).filter(Boolean) as string[]
    const mbIds = buildsData.map(b => b.motherboard_id).filter(Boolean) as string[]
    const ramIds = buildsData.map(b => b.ram_id).filter(Boolean) as string[]
    const gpuIds = buildsData.map(b => b.gpu_id).filter(Boolean) as string[]
    const psuIds = buildsData.map(b => b.psu_id).filter(Boolean) as string[]

    const [cpuRes, mbRes, ramRes, gpuRes, psuRes] = await Promise.all([
      cpuIds.length ? supabase.from('cpus').select('id, name').in('id', cpuIds) : { data: [] },
      mbIds.length ? supabase.from('motherboards').select('id, name').in('id', mbIds) : { data: [] },
      ramIds.length ? supabase.from('rams').select('id, name').in('id', ramIds) : { data: [] },
      gpuIds.length ? supabase.from('gpus').select('id, name').in('id', gpuIds) : { data: [] },
      psuIds.length ? supabase.from('psus').select('id, name').in('id', psuIds) : { data: [] },
    ])

    const nameMap: Record<string, string> = {}
    ;[cpuRes, mbRes, ramRes, gpuRes, psuRes].forEach(res => {
      res.data?.forEach((p: PartName) => { nameMap[p.id] = p.name })
    })

    setPartNames(nameMap)
    setLoading(false)
  }

  async function deleteBuild(id: string) {
    setDeleting(id)
    await supabase.from('saved_builds').delete().eq('id', id)
    setBuilds(prev => prev.filter(b => b.id !== id))
    setDeleting(null)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const PART_LABELS = [
    { key: 'cpu_id', label: 'CPU', emoji: '🖥️' },
    { key: 'motherboard_id', label: 'Motherboard', emoji: '🔌' },
    { key: 'ram_id', label: 'RAM', emoji: '💾' },
    { key: 'gpu_id', label: 'GPU', emoji: '🎮' },
    { key: 'psu_id', label: 'PSU', emoji: '⚡' },
  ]

  return (
    <main className="rgb-bg min-h-screen text-white relative">
      <div className="grid-overlay" />

      <nav className="relative z-10 border-b border-white/5 px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-black/20">
        <a href="/" className="text-2xl font-black tracking-tight text-gradient-rgb">BUILD-IT</a>
        <a href="/builder" className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold">
          <span>Back to Builder</span>
        </a>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">
            My <span className="text-gradient-rgb">Builds</span>
          </h1>
          <p className="text-gray-400">All your saved PC builds in one place.</p>
        </div>

        {status !== 'loading' && !session && (
          <div className="gaming-card rgb-border rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold mb-2">Sign in to see your builds</h2>
            <p className="text-gray-400 mb-6">Your saved builds are tied to your account.</p>
            <button onClick={() => signIn('google')} className="btn-primary px-8 py-3 rounded-xl font-semibold">
              <span>Sign in with Google</span>
            </button>
          </div>
        )}

        {(status === 'loading' || (session && loading)) && (
          <div className="flex flex-col gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="gaming-card rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {session && !loading && builds.length === 0 && (
          <div className="gaming-card rgb-border rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🛠️</div>
            <h2 className="text-xl font-bold mb-2">No builds saved yet</h2>
            <p className="text-gray-400 mb-6">Go build your first PC and save it here.</p>
            <a href="/builder" className="btn-primary px-8 py-3 rounded-xl font-semibold inline-block">
              <span>Start Building</span>
            </a>
          </div>
        )}

        {session && !loading && builds.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-500 text-sm">{builds.length} build{builds.length > 1 ? 's' : ''} saved</p>
            {builds.map(build => (
              <div key={build.id} className="gaming-card rgb-border rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-bold text-lg">{build.name}</h2>
                    <p className="text-gray-500 text-xs mt-1">Saved on {formatDate(build.created_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-black text-gradient-cyan">
                      Rs.{build.total_price_inr.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">estimated</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {PART_LABELS.map(part => {
                    const partId = build[part.key as keyof SavedBuild] as string | null
                    const name = partId ? partNames[partId] : null
                    if (!name) return null
                    return (
                      <div key={part.key} className="flex items-center gap-2 bg-white/3 rounded-lg px-3 py-2">
                        <span className="text-sm">{part.emoji}</span>
                        <div>
                          <p className="text-xs text-gray-500">{part.label}</p>
                          <p className="text-xs font-medium text-white">{name}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-2">
                  <a
                    href="/builder"
                    className="flex-1 text-center text-xs font-semibold py-2 px-3 rounded-lg border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-colors"
                  >
                    Load in Builder
                  </a>
                  <button
                    onClick={() => deleteBuild(build.id)}
                    disabled={deleting === build.id}
                    className="text-xs font-semibold py-2 px-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {deleting === build.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
