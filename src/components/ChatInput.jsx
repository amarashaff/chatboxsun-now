import { useState, useRef, useCallback } from 'react'
import { Send, Paperclip, X, Image as ImageIcon, FileText, StopCircle } from 'lucide-react'
import { formatFileSize, isImageFile } from '../utils/api'

export default function ChatInput({ onSend, isLoading, onStop, disabled }) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)
  const textRef = useRef(null)

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSend() {
    if (isLoading) return
    if (!text.trim() && files.length === 0) return
    onSend(text.trim(), files)
    setText('')
    setFiles([])
    setTimeout(() => textRef.current?.focus(), 50)
  }

  function handleFileChange(e) {
    addFiles(Array.from(e.target.files || []))
    fileRef.current.value = ''
  }

  function addFiles(newFiles) {
    const valid = newFiles.filter(f => f.size < 20 * 1024 * 1024) // 20MB limit
    setFiles(prev => [...prev, ...valid].slice(0, 5)) // max 5 files
  }

  function removeFile(index) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  const canSend = (text.trim() || files.length > 0) && !disabled

  return (
    <div
      className="relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Drag overlay */}
      {dragging && (
        <div
          className="absolute inset-0 z-10 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(96,165,250,0.08)',
            border: '2px dashed rgba(96,165,250,0.4)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: '#60a5fa' }}>
            Drop files here
          </p>
        </div>
      )}

      <div
        className="rounded-2xl transition-all"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: dragging
            ? '1px solid rgba(96,165,250,0.4)'
            : '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* File previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
            {files.map((file, i) => (
              <FilePreview key={i} file={file} onRemove={() => removeFile(i)} />
            ))}
          </div>
        )}

        {/* Text area */}
        <div className="flex items-end gap-2 p-2">
          {/* Attach */}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-shrink-0 p-2.5 rounded-xl transition-all"
            style={{
              color: 'rgba(255,255,255,0.35)',
              background: 'transparent',
            }}
            title="Attach file or image"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Paperclip size={18} />
          </button>

          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.md,.csv,.json,.js,.py,.html,.css,.ts,.tsx,.jsx"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Textarea */}
          <textarea
            ref={textRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message SumoPod..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-sm resize-none max-h-40 overflow-y-auto py-2"
            style={{
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.6,
              outline: 'none',
              scrollbarWidth: 'thin',
            }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
            }}
          />

          {/* Send / Stop */}
          {isLoading ? (
            <button
              onClick={onStop}
              className="flex-shrink-0 p-2.5 rounded-xl transition-all"
              style={{
                background: 'rgba(239,68,68,0.15)',
                color: '#f87171',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
              title="Stop generating"
            >
              <StopCircle size={18} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="flex-shrink-0 p-2.5 rounded-xl transition-all"
              style={{
                background: canSend
                  ? 'linear-gradient(135deg, #60a5fa, #a78bfa)'
                  : 'rgba(255,255,255,0.06)',
                color: canSend ? 'white' : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: canSend ? 'pointer' : 'default',
                transform: canSend ? 'scale(1)' : 'scale(0.95)',
              }}
              title="Send (Enter)"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.15)' }}>
        Enter to send · Shift+Enter for new line · Max 5 files, 20MB each
      </p>
    </div>
  )
}

function FilePreview({ file, onRemove }) {
  const isImg = isImageFile(file)
  const [url] = useState(() => isImg ? URL.createObjectURL(file) : null)

  return (
    <div
      className="relative flex items-center gap-2 rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {isImg ? (
        <img
          src={url}
          alt={file.name}
          className="w-16 h-16 object-cover"
        />
      ) : (
        <div
          className="w-16 h-16 flex flex-col items-center justify-center gap-1"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <FileText size={20} style={{ color: '#60a5fa' }} />
          <span className="text-[9px] px-1 text-center truncate w-full" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {file.name.split('.').pop()?.toUpperCase()}
          </span>
        </div>
      )}

      {/* Remove */}
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}
      >
        <X size={9} />
      </button>
    </div>
  )
}
