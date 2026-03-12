import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Eye, Zap, Star } from 'lucide-react'
import { MODELS, PROVIDER_COLORS } from '../utils/models'

export default function ModelPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('All')
  const ref = useRef(null)
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

  const pc = PROVIDER_COLORS[current.provider]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.8)',
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: `linear-gradient(135deg, ${pc?.from}, ${pc?.to})` }}
        />
        <span className="max-w-[120px] truncate">{current.name}</span>
        <ChevronDown size={13} style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 left-0 w-80 rounded-2xl overflow-hidden z-50"
          style={{
            background: 'rgba(8, 12, 24, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Provider tabs */}
          <div className="flex gap-1 p-2 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {providers.map(p => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className="px-2.5 py-1 rounded-lg text-xs whitespace-nowrap font-medium transition-all"
                style={{
                  background: filter === p ? 'rgba(96,165,250,0.15)' : 'transparent',
                  color: filter === p ? '#93c5fd' : 'rgba(255,255,255,0.35)',
                  border: filter === p ? '1px solid rgba(96,165,250,0.2)' : '1px solid transparent',
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Model list */}
          <div className="max-h-72 overflow-y-auto p-2 space-y-0.5">
            {filtered.map(model => {
              const colors = PROVIDER_COLORS[model.provider]
              const isActive = model.id === value

              return (
                <button
                  key={model.id}
                  onClick={() => { onChange(model.id); setOpen(false) }}
                  className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{
                    background: isActive ? 'rgba(96,165,250,0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(96,165,250,0.15)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: `linear-gradient(135deg, ${colors?.from}33, ${colors?.to}33)`, color: colors?.from }}
                  >
                    {model.provider[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium" style={{ color: isActive ? '#93c5fd' : 'rgba(255,255,255,0.85)' }}>
                        {model.name}
                      </span>
                      {model.badge && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                          style={{
                            background: `${colors?.from}22`,
                            color: colors?.from,
                            border: `1px solid ${colors?.from}33`,
                          }}
                        >
                          {model.badge}
                        </span>
                      )}
                      {model.supports_vision && (
                        <Eye size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />
                      )}
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {model.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
