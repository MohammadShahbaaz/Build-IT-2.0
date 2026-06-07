'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

type Option = {
  id: string
  label: string
  detail: string
}

type Props = {
  placeholder: string
  options: Option[]
  onSelect: (id: string) => void
}

export default function PartSelect({ placeholder, options, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleOpen() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
    setOpen(!open)
  }

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-sm text-gray-300 transition-colors text-left"
      >
        <span>{placeholder}</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && typeof window !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'absolute', top: position.top, left: position.left, width: position.width, zIndex: 9999 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
        >
          <div className="p-2 border-b border-white/5">
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-gray-500 text-sm px-4 py-3">No results found</p>
            ) : (
              filtered.map(o => (
                <button
                  key={o.id}
                  onClick={() => { onSelect(o.id); setOpen(false); setSearch('') }}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  <p className="text-sm font-medium text-white">{o.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{o.detail}</p>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}