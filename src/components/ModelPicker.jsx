import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Eye, Check } from 'lucide-react'
import { MODELS, PROVIDER_COLORS } from '../utils/models'

export default function ModelPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('All')
  const ref = useRef(null)
  const dropdownRef = useRef(null)
  const current = MODELS.find(m => m.id === value) || MODELS[0]

  const providers = ['All', ...new Set(MODELS.map(m => m.provider))]
  const filtered = filter === 'All' ? MODELS : MODELS.filter(m => m.provider === filter)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!open || !dropdownRef.current || !ref.current) return
    const btnRect = ref.current.getBoundingClientRect()
    const dropW = 320
    const viewW = window.innerWidth
    const el = dropdownRef.current
    const spaceRight = viewW - btnRect.left
    if (spaceRight < dropW + 8) {
      el.style.right = '0'
      el.style.left = 'auto'
    } else {
      el.style.left = '0'
      el.style.right = 'auto'
    }
  }, [open])

  const pc = PROVIDER_COLORS[current.provider]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
        style={{
          background: open ? 'rgba(96,165,250,0.12)' : 'rgba(255,255,255,0.06)',
          border: open ? '1px solid rgba(96,165,250,0.25)' : '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${pc?.from}, ${pc?.to})` }}
        />
        <span className="hidden sm:inline max-w-[140px] truncate">{current.name}</span>
        <span className="sm:hidden max-w-[80px] truncate text-xs">{current.name.split(' ')[0]}</span>
        <ChevronDown size={13} style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 z-50"
          style={{
            width: 320,
            maxWidth: 'calc(100vw - 16px)',
            background: 'rgba(8, 12, 24, 0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
            overflow: 'hidden',
          }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Select Model
            </p>
          </div>

          <div className="flex gap-1 px-3 py-2 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', scrollbarWidth: 'none' }}>
            {providers.map(p => {
              const pColor = PROVIDER_COLORS[p]
              const isActive = filter === p
              return (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className="px-2.5 py-1 rounded-lg text-xs whitespace-nowrap font-medium transition-all flex-shrink-0"
                  style={{
                    background: isActive ? (pColor ? `${pColor.from}22` : 'rgba(96,165,250,0.15)') : 'transparent',
                    color: isActive ? (pColor ? pColor.from : '#93c5fd') : 'rgba(255,255,255,0.35)',
                    border: isActive ? `1px solid ${pColor ? pColor.from + '44' : 'rgba(96,165,250,0.3)'}` : '1px solid transparent',
                  }}
                >
                  {p}
                </button>
              )
            })}
          </div>

          <div className="overflow-y-auto p-2 space-y-0.5" style={{ maxHeight: 280 }}>
            {filtered.map(model => {
              const colors = PROVIDER_COLORS[model.provider]
              const isActive = model.id === value
              return (
                <button
                  key={model.id}
                  onClick={() => { onChange(model.id); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{
                    background: isActive ? `${colors?.from}18` : 'transparent',
                    border: isActive ? `1px solid ${colors?.from}30` : '1px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${colors?.from}28, ${colors?.to}28)`, color: colors?.from, border: `1px solid ${colors?.from}30` }}
                  >
                    {model.provider[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium" style={{ color: isActive ? colors?.from : 'rgba(255,255,255,0.88)' }}>
                        {model.name}
                      </span>
                      {model.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold leading-none" style={{ background: `${colors?.from}20`, color: colors?.from, border: `1px solid ${colors?.from}35` }}>
                          {model.badge}
                        </span>
                      )}
                      {model.supports_vision && (
                        <Eye size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />
                      )}
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>
                      {model.description}
                    </p>
                  </div>
                  {isActive && <Check size={14} style={{ color: colors?.from, flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>

          <div className="px-4 py-2.5 flex items-center gap-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Eye size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Eye icon = supports image upload</p>
          </div>
        </div>
      )}
    </div>
  )
}
