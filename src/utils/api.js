import { SUMOPOD_BASE_URL } from './models'

export async function sendMessage({
  apiKey,
  model,
  messages,
  onChunk,
  onDone,
  onError,
}) {
  try {
    const response = await fetch(`${SUMOPOD_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err?.error?.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (!trimmed.startsWith('data: ')) continue

        try {
          const json = JSON.parse(trimmed.slice(6))
          const delta = json.choices?.[0]?.delta?.content
          if (delta) {
            fullText += delta
            onChunk?.(delta, fullText)
          }
        } catch {
          // skip malformed
        }
      }
    }

    onDone?.(fullText)
  } catch (err) {
    onError?.(err.message || 'Unknown error occurred')
  }
}

export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function isImageFile(file) {
  return file.type.startsWith('image/')
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export async function buildMessageContent(text, files, supportsVision) {
  if (!files || files.length === 0) {
    return text
  }

  if (!supportsVision) {
    const fileNames = files.map(f => f.name).join(', ')
    return `[Attached files: ${fileNames}]\n\n${text}`
  }

  const content = []

  for (const file of files) {
    if (isImageFile(file)) {
      const data = await fileToBase64(file)
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:${file.type};base64,${data}`,
          detail: 'auto',
        },
      })
    } else {
      // For non-image files, read as text if possible
      try {
        const text_content = await file.text()
        content.push({
          type: 'text',
          text: `File: ${file.name}\n\`\`\`\n${text_content}\n\`\`\``,
        })
      } catch {
        content.push({
          type: 'text',
          text: `[Attached file: ${file.name} (${formatFileSize(file.size)})]`,
        })
      }
    }
  }

  if (text.trim()) {
    content.push({ type: 'text', text })
  }

  return content
}
