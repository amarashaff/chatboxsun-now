import { useState, useEffect, useRef, useCallback } from 'react'
import { Menu, Plus, Bot, Sparkles, ChevronRight } from 'lucide-react'
import Sidebar from './components/Sidebar'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import ModelPicker from './components/ModelPicker'
import SettingsModal from './components/SettingsModal'
import { storage, createConversation, generateTitle } from './utils/storage'
import { sendMessage, buildMessageContent, isImageFile } from './utils/api'
import { MODELS } from './utils/models'

const STARTERS = [
  { icon: '✨', text: 'What can you help me with today?' },
  { icon: '💡', text: 'Explain a complex concept simply' },
  { icon: '🔧', text: 'Help me write or debug some code' },
  { icon: '📝', text: 'Draft an email or document for me' },
]

export default function App() {
  const [conversations, setConversations] = useState(() => storage.getConversations())
  const [activeId, setActiveId] = useState(null)
  const [model, setModel] = useState(() => storage.getModel())
  const [apiKey, setApiKey] = useState(() => storage.getApiKey())
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMsg, setStreamingMsg] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef(null)
  const abortRef = useRef(null)

  const activeConv = conversations.find(c => c.id === activeId)
  const currentModel = MODELS.find(m => m.id === model)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages, streamingMsg])

  function saveConversations(updated) {
    setConversations(updated)
    storage.saveConversations(updated)
  }

  function handleNewChat() {
    setActiveId(null)
    setStreamingMsg(null)
  }

  function handleSelectConv(id) {
    setActiveId(id)
    setStreamingMsg(null)
  }

  function handleDeleteConv(id) {
    const updated = conversations.filter(c => c.id !== id)
    saveConversations(updated)
    if (activeId === id) setActiveId(null)
  }

  function handleModelChange(newModel) {
    setModel(newModel)
    storage.saveModel(newModel)
  }

  function handleSaveApiKey(key) {
    setApiKey(key)
    storage.saveApiKey(key)
    if (!key) return
    if (!showSettings) return
  }

  function handleClearHistory() {
    saveConversations([])
    setActiveId(null)
    setShowSettings(false)
  }

  async function handleSend(text, files) {
    if (!apiKey) {
      setShowSettings(true)
      return
    }

    // Build attachments for display
    const attachments = await Promise.all(
      files.map(async file => ({
        name: file.name,
        type: isImageFile(file) ? 'image' : 'file',
        url: isImageFile(file) ? URL.createObjectURL(file) : null,
      }))
    )

    const userMessage = {
      role: 'user',
      content: text,
      attachments: attachments.length > 0 ? attachments : undefined,
      timestamp: Date.now(),
    }

    // Get or create conversation
    let conv
    let isNew = false
    if (activeId) {
      conv = conversations.find(c => c.id === activeId)
    }
    if (!conv) {
      conv = createConversation(generateTitle(text || files.map(f => f.name).join(', ')))
      conv.model = model
      isNew = true
    }

    const updatedConv = {
      ...conv,
      messages: [...conv.messages, userMessage],
      updatedAt: Date.now(),
      model: conv.model || model,
    }

    let newConvs
    if (isNew) {
      newConvs = [updatedConv, ...conversations]
    } else {
      newConvs = conversations.map(c => c.id === updatedConv.id ? updatedConv : c)
    }

    saveConversations(newConvs)
    setActiveId(updatedConv.id)
    setIsLoading(true)
    setStreamingMsg({ role: 'assistant', content: '', timestamp: Date.now() })

    // Build API messages
    const apiContent = await buildMessageContent(text, files, currentModel?.supports_vision)
    const apiMessages = [
      ...updatedConv.messages.map(m => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : m.content,
      })),
    ]
    // Replace last user message content with rich content
    apiMessages[apiMessages.length - 1] = {
      role: 'user',
      content: apiContent,
    }

    let controller = new AbortController()
    abortRef.current = controller
    let fullText = ''

    await sendMessage({
      apiKey,
      model,
      messages: apiMessages,
      onChunk: (delta, full) => {
        fullText = full
        setStreamingMsg(prev => ({ ...prev, content: full }))
      },
      onDone: (final) => {
        const assistantMsg = {
          role: 'assistant',
          content: final || fullText,
          timestamp: Date.now(),
        }

        const finalConv = {
          ...updatedConv,
          messages: [...updatedConv.messages, assistantMsg],
          updatedAt: Date.now(),
        }

        const finalConvs = isNew
          ? [finalConv, ...conversations]
          : conversations.map(c => c.id === finalConv.id ? finalConv : c)

        // Need to recalculate since state may have changed
        setConversations(prev => {
          const updated = isNew
            ? [finalConv, ...prev.filter(c => c.id !== finalConv.id)]
            : prev.map(c => c.id === finalConv.id ? finalConv : c)
          storage.saveConversations(updated)
          return updated
        })

        setStreamingMsg(null)
        setIsLoading(false)
      },
      onError: (err) => {
        const errMsg = {
          role: 'assistant',
          content: `❌ Error: ${err}\n\nPlease check your API key and try again.`,
          timestamp: Date.now(),
          isError: true,
        }

        setConversations(prev => {
          const updated = prev.map(c => {
            if (c.id !== updatedConv.id) return c
            return { ...c, messages: [...c.messages, errMsg] }
          })
          storage.saveConversations(updated)
          return updated
        })

        setStreamingMsg(null)
        setIsLoading(false)
      },
    })
  }

  function handleStop() {
    abortRef.current?.abort()
    if (streamingMsg?.content) {
      const stopMsg = {
        role: 'assistant',
        content: streamingMsg.content + '\n\n*[Generation stopped]*',
        timestamp: Date.now(),
      }

      setConversations(prev => {
        const updated = prev.map(c => {
          if (c.id !== activeId) return c
          return { ...c, messages: [...c.messages, stopMsg] }
        })
        storage.saveConversations(updated)
        return updated
      })
    }

    setStreamingMsg(null)
    setIsLoading(false)
  }

  const messages = activeConv?.messages || []
  const displayMessages = streamingMsg
    ? [...messages, streamingMsg]
    : messages

  return (
    <div className="flex h-full relative overflow-hidden" style={{ background: '#060b14' }}>
      {/* Background orbs */}
      <div className="orb w-96 h-96 opacity-20" style={{ top: '-10%', left: '-5%', background: 'radial-gradient(circle, #1d4ed8, transparent)' }} />
      <div className="orb w-80 h-80 opacity-15" style={{ bottom: '10%', right: '-5%', background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      <div className="orb w-64 h-64 opacity-10" style={{ top: '40%', left: '40%', background: 'radial-gradient(circle, #0e7490, transparent)' }} />

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConv}
        onNew={handleNewChat}
        onDelete={handleDeleteConv}
        onSettings={() => setShowSettings(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <main className="flex flex-col flex-1 min-w-0 relative z-10">
        {/* Top bar */}
        <header
          className="flex items-center gap-3 px-4 flex-shrink-0"
          style={{
            paddingTop: 'max(env(safe-area-inset-top), 14px)',
            paddingBottom: 14,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(6,11,20,0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl flex-shrink-0 transition-all"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}
          >
            <Menu size={18} />
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            {activeConv ? (
              <p className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {activeConv.title}
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', color: 'white' }}
                >
                  S
                </div>
                <span className="text-sm font-semibold gradient-text hidden sm:inline">SumoPod Chat</span>
              </div>
            )}
          </div>

          {/* Model picker — flex-shrink-0 so it doesn't get squished, relative so dropdown positions correctly */}
          <div className="flex-shrink-0">
            <ModelPicker value={model} onChange={handleModelChange} />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {displayMessages.length === 0 ? (
            <WelcomeScreen onStart={handleSend} isLoading={isLoading} apiKey={apiKey} onOpenSettings={() => setShowSettings(true)} />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
              {displayMessages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  message={msg}
                  isStreaming={streamingMsg && i === displayMessages.length - 1}
                />
              ))}
              {isLoading && !streamingMsg?.content && (
                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Bot size={14} style={{ color: '#60a5fa' }} />
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full typing-dot"
                        style={{ background: '#60a5fa' }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div
          className="flex-shrink-0 px-4"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
            paddingTop: 12,
            background: 'rgba(6,11,20,0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSend={handleSend}
              isLoading={isLoading}
              onStop={handleStop}
              disabled={false}
            />
          </div>
        </div>
      </main>

      {/* Settings */}
      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => setShowSettings(false)}
          onClearHistory={handleClearHistory}
        />
      )}
    </div>
  )
}

function WelcomeScreen({ onStart, apiKey, onOpenSettings }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12 text-center">
      {/* Logo */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold"
        style={{
          background: 'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(167,139,250,0.2))',
          border: '1px solid rgba(96,165,250,0.25)',
          animation: 'float 4s ease-in-out infinite',
          boxShadow: '0 0 40px rgba(96,165,250,0.1)',
        }}
      >
        <Sparkles size={28} style={{ color: '#93c5fd' }} />
      </div>

      <h1 className="text-2xl font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
        Welcome to{' '}
        <span className="gradient-text">SumoPod Chat</span>
      </h1>
      <p className="text-sm mb-2 max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Powered by the world's best AI models
      </p>

      {!apiKey && (
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm mb-8 transition-all"
          style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            color: '#fbbf24',
          }}
        >
          ⚠️ Set your API key to get started
          <ChevronRight size={14} />
        </button>
      )}

      {/* Starters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md w-full mt-4">
        {STARTERS.map((s, i) => (
          <button
            key={i}
            onClick={() => onStart(s.text, [])}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all group"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.6)',
              animationDelay: `${i * 0.1}s`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(96,165,250,0.08)'
              e.currentTarget.style.borderColor = 'rgba(96,165,250,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
            }}
          >
            <span className="text-lg">{s.icon}</span>
            <span className="text-xs flex-1">{s.text}</span>
            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#60a5fa' }} />
          </button>
        ))}
      </div>
    </div>
  )
}
