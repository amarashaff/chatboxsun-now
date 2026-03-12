import { useState } from 'react'
import { Plus, MessageSquare, Trash2, ChevronLeft, Settings, Search, X } from 'lucide-react'

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onSettings,
  isOpen,
  onClose,
}) {
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = groupByDate(filtered)

  function handleDelete(e, id) {
    e.stopPropagation()
    if (deleteConfirm === id) {
      onDelete(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 2000)
    }
  }

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:relative z-30 md:z-auto
          h-full flex flex-col
          w-72 min-w-[72px] max-w-[288px]
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background: 'rgba(5, 8, 18, 0.85)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-safe" style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)', paddingBottom: 16 }}>
          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)' }}
            >
              S
            </div>
            <span className="font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>
              SumoPod Chat
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 mb-3">
          <button
            onClick={() => { onNew(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(167,139,250,0.15))',
              border: '1px solid rgba(96,165,250,0.2)',
              color: '#93c5fd',
            }}
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 mb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Search size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm w-full"
              style={{ color: 'rgba(255,255,255,0.7)', outline: 'none' }}
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
              </button>
            )}
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto px-3 space-y-4 pb-4">
          {conversations.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
              <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">No conversations yet</p>
            </div>
          ) : (
            Object.entries(grouped).map(([label, convs]) => (
              <div key={label}>
                <p className="text-xs px-2 mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {label}
                </p>
                <div className="space-y-0.5">
                  {convs.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => { onSelect(conv.id); onClose(); }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left group transition-all"
                      style={{
                        background: activeId === conv.id
                          ? 'rgba(96,165,250,0.12)'
                          : 'transparent',
                        border: activeId === conv.id
                          ? '1px solid rgba(96,165,250,0.2)'
                          : '1px solid transparent',
                      }}
                    >
                      <MessageSquare
                        size={13}
                        style={{
                          color: activeId === conv.id ? '#60a5fa' : 'rgba(255,255,255,0.3)',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        className="text-xs truncate flex-1"
                        style={{ color: activeId === conv.id ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)' }}
                      >
                        {conv.title}
                      </span>
                      <button
                        onClick={e => handleDelete(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
                        style={{
                          color: deleteConfirm === conv.id ? '#f87171' : 'rgba(255,255,255,0.3)',
                          background: deleteConfirm === conv.id ? 'rgba(239,68,68,0.15)' : 'transparent',
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Settings */}
        <div className="px-3 pb-safe" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
          <button
            onClick={onSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            <Settings size={15} />
            Settings & API Key
          </button>
        </div>
      </aside>
    </>
  )
}

function groupByDate(convs) {
  const now = Date.now()
  const DAY = 86400000
  const groups = {}

  for (const c of [...convs].sort((a, b) => b.updatedAt - a.updatedAt)) {
    const diff = now - c.updatedAt
    let label
    if (diff < DAY) label = 'Today'
    else if (diff < 2 * DAY) label = 'Yesterday'
    else if (diff < 7 * DAY) label = 'This Week'
    else if (diff < 30 * DAY) label = 'This Month'
    else label = 'Older'

    if (!groups[label]) groups[label] = []
    groups[label].push(c)
  }

  return groups
}
