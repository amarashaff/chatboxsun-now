import { useState } from 'react'
import { X, Key, Eye, EyeOff, ExternalLink, Trash2, AlertCircle } from 'lucide-react'

export default function SettingsModal({ apiKey, onSave, onClose, onClearHistory }) {
  const [key, setKey] = useState(apiKey)
  const [show, setShow] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  function handleSave() {
    onSave(key.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleClear() {
    if (confirmClear) {
      onClearHistory()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10, 14, 28, 0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="font-semibold text-base" style={{ color: 'rgba(255,255,255,0.9)' }}>Settings</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Configure your SumoPod API access</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all"
            style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* API Key */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              SumoPod API Key
            </label>
            <div className="flex gap-2">
              <div
                className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Key size={14} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                <input
                  type={show ? 'text' : 'password'}
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1 bg-transparent text-sm"
                  style={{ color: 'rgba(255,255,255,0.8)', outline: 'none' }}
                />
                <button
                  onClick={() => setShow(!show)}
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                onClick={handleSave}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: saved
                    ? 'rgba(34,197,94,0.15)'
                    : 'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(167,139,250,0.2))',
                  color: saved ? '#86efac' : '#93c5fd',
                  border: saved ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(96,165,250,0.2)',
                }}
              >
                {saved ? '✓ Saved' : 'Save'}
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>

          {/* SumoPod link */}
          <a
            href="https://sumopod.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
            }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Get API Key</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Visit sumopod.com to get your API key</p>
            </div>
            <ExternalLink size={14} />
          </a>

          {/* Warning if no key */}
          {!apiKey && (
            <div
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <AlertCircle size={14} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 2 }} />
              <p className="text-xs" style={{ color: 'rgba(245,158,11,0.8)' }}>
                Please enter your API key to start chatting. Your key is saved locally in your browser.
              </p>
            </div>
          )}

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          {/* Danger zone */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Danger Zone</p>
            <button
              onClick={handleClear}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all"
              style={{
                background: confirmClear ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                border: confirmClear ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)',
                color: confirmClear ? '#f87171' : 'rgba(255,255,255,0.4)',
              }}
            >
              <Trash2 size={14} />
              {confirmClear ? '⚠️ Click again to confirm deletion' : 'Clear all conversation history'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
