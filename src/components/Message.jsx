import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { User, Bot, Copy, Check, Pencil, Trash2, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react'
import { CodeBlock } from './CodeBlock'
import { useStore } from '../store/useStore'
import { showToast } from '../utils/helpers'

export const Message = ({ message, onRegenerate }) => {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [copied, setCopied] = useState(false)
  const { deleteMessage, addMessage, activeConversationId, getActiveConversation } = useStore()

  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      showToast.success('Copied')
      setTimeout(() => setCopied(false), 2000)
    } catch { showToast.error('Failed to copy') }
  }

  const handleEdit = async () => {
    if (!editContent.trim()) return
    deleteMessage(activeConversationId, message.id)
    const conv = getActiveConversation()
    if (conv) {
      addMessage(activeConversationId, { id: crypto.randomUUID(), role: 'user', content: editContent.trim(), createdAt: Date.now() })
    }
    setEditing(false)
  }

  const handleDelete = () => {
    deleteMessage(activeConversationId, message.id)
    showToast.success('Message deleted')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit() }
    if (e.key === 'Escape') { setEditing(false); setEditContent(message.content) }
  }

  if (editing) {
    return (
      <div className="flex gap-3 px-4 py-3 animate-fadeIn">
        <div className="w-8 h-8 rounded-lg bg-[#d97706] flex items-center justify-center shrink-0 mt-0.5">
          <User size={14} className="text-white" />
        </div>
        <div className="flex-1 max-w-2xl">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 rounded-lg border border-[#e8e6e1] dark:border-[#33302c] bg-white dark:bg-[#1a1816] resize-none focus:outline-none focus:ring-1 focus:ring-[#d97706] text-sm text-[#3a352c] dark:text-[#e8e0d5]"
            rows={4}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleEdit} className="px-3 py-1 rounded-lg bg-[#d97706] hover:bg-[#b85f04] text-white text-xs font-medium transition-all active:scale-[0.97]">
              Save & Send
            </button>
            <button onClick={() => { setEditing(false); setEditContent(message.content) }} className="px-3 py-1 rounded-lg bg-[#f0eee8] dark:bg-[#23211e] hover:bg-[#e8e6e1] dark:hover:bg-[#33302c] text-xs text-[#5a544a] dark:text-[#b8b0a5] transition-all">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`group relative flex gap-3 px-4 py-3 transition-colors ${isUser ? '' : 'bg-[#faf9f7] dark:bg-[#0d0c0b] rounded-xl'}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-[#d97706]">
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-[#5a544a] dark:text-[#b8b0a5]">{isUser ? 'You' : 'Assistant'}</span>
          {message.createdAt && (
            <span className="text-[10px] text-[#8a8070] dark:text-[#6b6358]">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
          {isStreaming ? (
            <div className="text-[#3a352c] dark:text-[#e8e0d5] whitespace-pre-wrap text-sm">{message.content}
              <span className="inline-flex gap-0.5 ml-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse-dot" style={{ animationDelay: '0s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
              </span>
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeString = String(children).replace(/\n$/, '')
                  if (!inline) return <CodeBlock language={match?.[1]} code={codeString} />
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-[#f0eee8] dark:bg-[#23211e] text-[#5a544a] dark:text-[#b8b0a5] text-sm font-mono border border-[#e8e6e1] dark:border-[#33302c]" {...props}>
                      {children}
                    </code>
                  )
                },
                pre({ children }) { return <>{children}</> },
                p({ children }) { return <p className="my-1.5 text-sm text-[#3a352c] dark:text-[#d4ccc0] leading-relaxed">{children}</p> },
                ul({ children }) { return <ul className="my-1.5 pl-5 space-y-1 list-disc marker:text-[#d97706]">{children}</ul> },
                ol({ children }) { return <ol className="my-1.5 pl-5 space-y-1 list-decimal marker:text-[#d97706]">{children}</ol> },
                li({ children }) { return <li className="text-sm text-[#3a352c] dark:text-[#d4ccc0]">{children}</li> },
                h1({ children }) { return <h1 className="text-lg font-bold mt-4 mb-2 text-[#3a352c] dark:text-[#e8e0d5]">{children}</h1> },
                h2({ children }) { return <h2 className="text-base font-bold mt-3 mb-2 text-[#3a352c] dark:text-[#e8e0d5]">{children}</h2> },
                h3({ children }) { return <h3 className="text-sm font-semibold mt-3 mb-1 text-[#3a352c] dark:text-[#e8e0d5]">{children}</h3> },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-2 border-[#d97706] pl-3 my-2 py-1 text-[#8a8070] dark:text-[#8a8070] italic text-sm">
                      {children}
                    </blockquote>
                  )
                },
                a({ children, href }) {
                  return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#d97706] hover:text-[#b85f04] underline decoration-[#d97706]/30 underline-offset-2">{children}</a>
                },
                table({ children }) {
                  return <div className="overflow-x-auto my-3 rounded-lg border border-[#e8e6e1] dark:border-[#33302c]"><table className="min-w-full divide-y divide-[#e8e6e1] dark:divide-[#33302c] text-sm">{children}</table></div>
                },
                th({ children }) { return <th className="px-4 py-2 bg-[#f0eee8] dark:bg-[#1a1816] text-left text-xs font-semibold text-[#5a544a] dark:text-[#8a8070] uppercase tracking-wider">{children}</th> },
                td({ children }) { return <td className="px-4 py-2 text-sm text-[#3a352c] dark:text-[#d4ccc0] border-t border-[#f0eee8] dark:border-[#23211e]">{children}</td> },
                hr() { return <hr className="my-4 border-[#e8e6e1] dark:border-[#2c2926]" /> },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        {!isStreaming && (
          <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
            {isUser ? (
              <button onClick={() => setEditing(true)} className="p-1 rounded hover:bg-[#f0eee8] dark:hover:bg-[#23211e] text-[#8a8070] hover:text-[#d97706] dark:hover:text-[#d97706] transition-all" title="Edit">
                <Pencil size={12} />
              </button>
            ) : (
              <>
                <button onClick={onRegenerate} className="p-1 rounded hover:bg-[#f0eee8] dark:hover:bg-[#23211e] text-[#8a8070] hover:text-[#d97706] dark:hover:text-[#d97706] transition-all" title="Regenerate">
                  <RefreshCw size={12} />
                </button>
                <button className="p-1 rounded hover:bg-[#f0eee8] dark:hover:bg-[#23211e] text-[#8a8070] hover:text-[#d97706] dark:hover:text-[#d97706] transition-all" title="Good response">
                  <ThumbsUp size={12} />
                </button>
                <button className="p-1 rounded hover:bg-[#f0eee8] dark:hover:bg-[#23211e] text-[#8a8070] hover:text-[#d97706] dark:hover:text-[#d97706] transition-all" title="Bad response">
                  <ThumbsDown size={12} />
                </button>
              </>
            )}
            <button onClick={handleCopy} className="p-1 rounded hover:bg-[#f0eee8] dark:hover:bg-[#23211e] text-[#8a8070] hover:text-[#d97706] dark:hover:text-[#d97706] transition-all" title="Copy">
              {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
            </button>
            <div className="w-px h-3 mx-1 bg-[#e8e6e1] dark:bg-[#2c2926]" />
            <button onClick={handleDelete} className="p-1 rounded hover:bg-[#f0eee8] dark:hover:bg-[#23211e] text-[#8a8070] hover:text-red-500 transition-all" title="Delete">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
