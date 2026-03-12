import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, User, Bot, Image as ImageIcon, FileText } from 'lucide-react'

export default function ChatMessage({ message, isStreaming }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse msg-user' : 'flex-row msg-assistant'}`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #60a5fa, #a78bfa)'
            : 'rgba(255,255,255,0.08)',
          border: isUser ? 'none' : '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {isUser ? <User size={14} /> : <Bot size={14} style={{ color: '#60a5fa' }} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] md:max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {message.attachments.map((att, i) => (
              <AttachmentPreview key={i} attachment={att} />
            ))}
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <div
            className="px-4 py-3 rounded-2xl text-sm"
            style={
              isUser
                ? {
                    background: 'linear-gradient(135deg, rgba(96,165,250,0.18), rgba(167,139,250,0.18))',
                    border: '1px solid rgba(96,165,250,0.2)',
                    color: 'rgba(255,255,255,0.92)',
                    borderBottomRightRadius: 4,
                  }
                : {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.88)',
                    borderBottomLeftRadius: 4,
                  }
            }
          >
            {isUser ? (
              <p className="whitespace-pre-wrap" style={{ lineHeight: 1.7 }}>{message.content}</p>
            ) : (
              <>
                <div className="prose-chat">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        if (!inline && match) {
                          return (
                            <CodeBlock
                              language={match[1]}
                              value={String(children).replace(/\n$/, '')}
                            />
                          )
                        }
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                {isStreaming && <StreamingCursor />}
              </>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] px-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}

function AttachmentPreview({ attachment }) {
  if (attachment.type === 'image') {
    return (
      <div className="rounded-xl overflow-hidden" style={{ maxWidth: 200, border: '1px solid rgba(255,255,255,0.1)' }}>
        <img src={attachment.url} alt={attachment.name} className="w-full h-auto object-cover" style={{ maxHeight: 150 }} />
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.6)',
      }}
    >
      <FileText size={13} style={{ color: '#60a5fa' }} />
      <span className="max-w-[120px] truncate">{attachment.name}</span>
    </div>
  )
}

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-2" style={{ borderRadius: 10, overflow: 'hidden' }}>
      <div
        className="flex items-center justify-between px-4 py-2 text-xs"
        style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.4)' }}
      >
        <span>{language}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 px-2 py-1 rounded transition-all"
          style={{
            background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
            color: copied ? '#86efac' : 'rgba(255,255,255,0.5)',
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: 13,
          background: 'rgba(0,0,0,0.5)',
          padding: '16px',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

function StreamingCursor() {
  return (
    <span
      className="inline-block w-0.5 h-4 ml-0.5 align-middle"
      style={{
        background: '#60a5fa',
        animation: 'typing 0.8s infinite',
        borderRadius: 2,
      }}
    />
  )
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
