import { useEffect, useCallback, useRef, useState } from 'react'
import { Message } from './Message'
import { MessageInput } from './MessageInput'
import { useStore } from '../store/useStore'
import { sendMessage, checkApiKey } from '../services/api'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { showToast } from '../utils/helpers'
import {
  PanelLeft,
  Sparkles,
  AlertCircle,
} from 'lucide-react'

export const ChatWindow = ({ onToggleSidebar }) => {
  const {
    conversations,
    activeConversationId,
    model,
    isStreaming,
    setIsStreaming,
    addMessage,
    updateMessage,
    createConversation,
    getActiveConversation,
  } = useStore()

  const bottomRef = useAutoScroll([conversations, isStreaming])
  const abortRef = useRef(null)
  const [error, setError] = useState(null)
  const activeConv = getActiveConversation()
  const messages = activeConv?.messages || []

  useEffect(() => {
    if (!activeConversationId && conversations.length === 0) {
      createConversation()
    }
  }, [activeConversationId, conversations.length, createConversation])

  const handleSend = useCallback(
    async (content) => {
      let convId = activeConversationId
      if (!convId) convId = createConversation()

      const userMsg = { id: crypto.randomUUID(), role: 'user', content, createdAt: Date.now() }
      addMessage(convId, userMsg)
      setError(null)

      const conv = getActiveConversation()
      if (!conv) return
      const msgs = [...conv.messages, userMsg]

      const assistantMsg = { id: crypto.randomUUID(), role: 'assistant', content: '', createdAt: Date.now(), isStreaming: true }
      addMessage(convId, assistantMsg)
      setIsStreaming(true)

      const onChunk = (text) => updateMessage(convId, assistantMsg.id, { content: text, isStreaming: true })
      const onDone = (text) => { updateMessage(convId, assistantMsg.id, { content: text, isStreaming: false }); setIsStreaming(false) }
      const onError = (err) => {
        setIsStreaming(false); setError(err.message); showToast.error(err.message)
        updateMessage(convId, assistantMsg.id, { content: `Error: ${err.message}`, isStreaming: false })
      }

      const controller = await sendMessage(msgs, model, onChunk, onDone, onError)
      abortRef.current = controller
    },
    [activeConversationId, model, addMessage, updateMessage, createConversation, getActiveConversation, setIsStreaming]
  )

  const handleStop = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
  }

  const handleRegenerate = async () => {
    const conv = getActiveConversation()
    if (!conv || conv.messages.length === 0) return

    let lastUserIdx = -1
    for (let i = conv.messages.length - 1; i >= 0; i--) {
      if (conv.messages[i].role === 'user') { lastUserIdx = i; break }
    }
    if (lastUserIdx === -1) return

    const msgs = conv.messages.slice(0, lastUserIdx + 1)
    const hasTrailingAssistant = conv.messages.length > lastUserIdx + 1 && conv.messages[conv.messages.length - 1].role === 'assistant'
    const assistantMsgId = hasTrailingAssistant ? conv.messages[conv.messages.length - 1].id : crypto.randomUUID()

    if (hasTrailingAssistant) {
      updateMessage(conv.id, assistantMsgId, { content: '', isStreaming: true })
    } else {
      addMessage(conv.id, { id: assistantMsgId, role: 'assistant', content: '', createdAt: Date.now(), isStreaming: true })
    }

    setIsStreaming(true)
    setError(null)

    const onChunk = (text) => updateMessage(conv.id, assistantMsgId, { content: text, isStreaming: true })
    const onDone = (text) => { updateMessage(conv.id, assistantMsgId, { content: text, isStreaming: false }); setIsStreaming(false) }
    const onError = (err) => {
      setIsStreaming(false); setError(err.message); showToast.error(err.message)
      updateMessage(conv.id, assistantMsgId, { content: `Error: ${err.message}`, isStreaming: false })
    }

    const controller = await sendMessage(msgs, model, onChunk, onDone, onError)
    abortRef.current = controller
  }

  const hasApiKey = checkApiKey(model)

  if (!hasApiKey) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#141210]">
        <div className="text-center max-w-sm px-6 animate-fadeIn">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#fef3c7] dark:bg-[#d97706]/20 flex items-center justify-center">
            <AlertCircle size={26} className="text-[#d97706] dark:text-[#f59e0b]" />
          </div>
          <h2 className="text-lg font-semibold text-[#3a352c] dark:text-[#e8e0d5] mb-2">API Key Required</h2>
          <p className="text-sm text-[#8a8070] dark:text-[#6b6358] mb-5 leading-relaxed">
            Set your <code className="px-1.5 py-0.5 rounded bg-[#f0eee8] dark:bg-[#23211e] text-[#3a352c] dark:text-[#e8e0d5] text-xs font-mono">
              {model === 'openai' ? 'VITE_OPENAI_API_KEY' : 'VITE_DEEPSEEK_API_KEY'}
            </code> in the <code className="px-1.5 py-0.5 rounded bg-[#f0eee8] dark:bg-[#23211e] text-[#3a352c] dark:text-[#e8e0d5] text-xs font-mono">.env</code> file.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#141210]">
      <header className="flex items-center gap-3 px-4 py-2 shrink-0 bg-white dark:bg-[#141210] border-b border-[#e8e6e1] dark:border-[#2c2926]">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-[#f0eee8] dark:hover:bg-[#23211e] text-[#8a8070] hover:text-[#d97706] dark:hover:text-[#d97706] transition-all"
        >
          <PanelLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#d97706] flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <h1 className="text-sm font-semibold text-[#3a352c] dark:text-[#e8e0d5]">AI Chat</h1>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f0eee8] dark:bg-[#23211e]">
          <span className="w-4 h-4 rounded-full bg-[#d97706] flex items-center justify-center">
            <span className="text-[7px] font-bold text-white">
              {model === 'openai' ? 'O' : 'D'}
            </span>
          </span>
          <span className="text-xs font-medium text-[#5a544a] dark:text-[#b8b0a5] capitalize">{model}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isStreaming ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-6 animate-slideUp">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#fef3c7] to-[#fde68a] dark:from-[#d97706]/20 dark:to-[#f59e0b]/10 flex items-center justify-center">
                <Sparkles size={30} className="text-[#d97706]" />
              </div>
              <h2 className="text-xl font-semibold text-[#3a352c] dark:text-[#e8e0d5] mb-2">What can I help you with?</h2>
              <p className="text-sm text-[#8a8070] dark:text-[#6b6358] leading-relaxed mb-8">
                Start a conversation by typing a message below.
              </p>
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                <div className="px-3 py-2 rounded-lg bg-[#f0eee8] dark:bg-[#23211e] text-[#5a544a] dark:text-[#b8b0a5] text-xs font-medium cursor-pointer hover:bg-[#e8e6e1] dark:hover:bg-[#2c2926] transition-all border border-[#e8e6e1] dark:border-[#33302c]">
                  💡 Ask
                </div>
                <div className="px-3 py-2 rounded-lg bg-[#f0eee8] dark:bg-[#23211e] text-[#5a544a] dark:text-[#b8b0a5] text-xs font-medium cursor-pointer hover:bg-[#e8e6e1] dark:hover:bg-[#2c2926] transition-all border border-[#e8e6e1] dark:border-[#33302c]">
                  🚀 Create
                </div>
                <div className="px-3 py-2 rounded-lg bg-[#f0eee8] dark:bg-[#23211e] text-[#5a544a] dark:text-[#b8b0a5] text-xs font-medium cursor-pointer hover:bg-[#e8e6e1] dark:hover:bg-[#2c2926] transition-all border border-[#e8e6e1] dark:border-[#33302c]">
                  ✨ Design
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-4 px-4 space-y-1">
            {messages.map((msg, i) => (
              <div key={msg.id} className="animate-fadeIn" style={{ animationDelay: `${i * 30}ms` }}>
                <Message message={msg} onRegenerate={handleRegenerate} />
              </div>
            ))}
            {error && !isStreaming && (
              <div className="flex items-center gap-2 px-3 py-2 mx-2 my-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 animate-slideIn">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <span className="text-xs text-red-700 dark:text-red-300 flex-1">{error}</span>
                <button onClick={() => setError(null)} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 font-medium">Dismiss</button>
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} onStop={handleStop} />
    </div>
  )
}
