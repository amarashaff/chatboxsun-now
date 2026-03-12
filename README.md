# SumoPod Chat

A beautiful, elegant AI chatbot powered by [SumoPod](https://sumopod.com) — supporting multiple AI models, file uploads, and conversation history.

## ✨ Features

- 🤖 **16+ AI Models** — GPT-4o, Claude 3.5, Gemini 2.0, DeepSeek, Llama 3.3, Mistral & more
- 📎 **File Uploads** — Images, PDFs, code files, documents (max 5 files, 20MB each)
- 💬 **Conversation History** — Stored locally in your browser
- 🌊 **Streaming Responses** — Real-time token streaming
- 📱 **Mobile Ready** — Responsive for iOS/Android, PWA installable
- 🎨 **Elegant Glass UI** — Translucent white design with smooth animations
- 🔒 **Private** — API key stored locally, never sent to any server

## 🚀 Deploy on Vercel

### 1. Clone & Push to GitHub

```bash
git clone <this-repo>
cd sumopod-chat
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sumopod-chat.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your GitHub repository
4. Vercel auto-detects Vite — just click **Deploy**

That's it! Your app will be live at `https://your-project.vercel.app`

## 🛠️ Local Development

```bash
npm install
npm run dev
```

## ⚙️ Configuration

No environment variables needed. Users enter their SumoPod API key directly in the app's Settings panel (stored in localStorage).

Get your API key at [sumopod.com](https://sumopod.com)

## 📱 Install as PWA

- **iOS**: Safari → Share → Add to Home Screen
- **Android**: Chrome → Menu → Add to Home Screen / Install App

## 🏗️ Tech Stack

- React 18 + Vite
- Tailwind CSS
- react-markdown + react-syntax-highlighter
- Framer Motion
- SumoPod OpenAI-compatible API
