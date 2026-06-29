import { useState } from 'react'
import { useStore } from '../store/useStore'
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Check,
  X,
  MessageSquare,
  PanelLeftClose,
  Trash2 as ClearIcon,
  Sparkles,
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { ModelSwitch } from './ModelSwitch'
import { formatDate, showToast } from '../utils/helpers'

export const Sidebar = ({ isOpen, onToggle }) => {
  const {
    conversations,
    activeConversationId,
    searchQuery,
    setSearchQuery,
    createConversation,
    setActiveConversation,
    deleteConversation,
    renameConversation,
    clearConversations,
  } = useStore()

  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const filtered = conversations
    .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt)

  const handleNewChat = () => createConversation()

  const startRename = (id, title) => {
    setEditingId(id)
    setEditTitle(title)
  }

  const confirmRename = (id) => {
    if (editTitle.trim()) renameConversation(id, editTitle.trim())
    setEditingId(null)
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    deleteConversation(id)
    showToast.success('Conversation deleted')
  }

  const handleClear = () => {
    clearConversations()
    showToast.success('All conversations cleared')
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#faf9f7] dark:bg-[#1a1816] flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#e8e6e1] dark:border-[#2c2926]`}
      >
        <div className="px-3 pt-3 pb-2 border-b border-[#e8e6e1] dark:border-[#2c2926]">
          <div className="flex items-center justify-between mb-1 px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#d97706] flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-[#3a352c] dark:text-[#e8e0d5]">AI Chat</span>
            </div>
            <div className="flex items-center gap-0.5">
              <ThemeToggle />
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-[#e8e6e1] dark:hover:bg-[#2c2926] text-[#8a8070] dark:text-[#8a8070] transition-all"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <ModelSwitch />
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8070]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-[#23211e] border border-[#e8e6e1] dark:border-[#33302c] text-sm text-[#3a352c] dark:text-[#e8e0d5] placeholder-[#8a8070] dark:placeholder-[#6b6358] focus:outline-none focus:ring-1 focus:ring-[#d97706] dark:focus:ring-[#d97706] transition-all"
            />
          </div>
          <button
            onClick={handleNewChat}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#d97706] hover:bg-[#b85f04] text-white text-sm font-medium transition-all active:scale-[0.98]"
          >
            <Plus size={15} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-1 px-2 space-y-0.5">
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center">
              <MessageSquare size={28} className="mx-auto mb-3 text-[#c8c2b8] dark:text-[#4a4540]" />
              <p className="text-sm text-[#8a8070] dark:text-[#6b6358]">
                {searchQuery ? 'No results' : 'No chats yet'}
              </p>
            </div>
          )}
          {filtered.map((conv, index) => (
            <div
              key={conv.id}
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={() => {
                setActiveConversation(conv.id)
                onToggle()
              }}
              className={`group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150 animate-fadeIn ${
                conv.id === activeConversationId
                  ? 'bg-[#e8e6e1] dark:bg-[#2c2926]'
                  : 'hover:bg-[#f0eee8] dark:hover:bg-[#23211e]'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                conv.id === activeConversationId
                  ? 'bg-[#d97706]'
                  : 'bg-[#e8e6e1] dark:bg-[#33302c]'
              }`}>
                <MessageSquare size={12} className={conv.id === activeConversationId ? 'text-white' : 'text-[#8a8070] dark:text-[#8a8070]'} />
              </div>
              <div className="flex-1 min-w-0">
                {editingId === conv.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmRename(conv.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="flex-1 px-1.5 py-0.5 text-sm bg-white dark:bg-[#23211e] border border-[#d4cfc7] dark:border-[#4a4540] rounded text-[#3a352c] dark:text-[#e8e0d5] focus:outline-none focus:ring-1 focus:ring-[#d97706]"
                      autoFocus
                    />
                    <button onClick={(e) => { e.stopPropagation(); confirmRename(conv.id) }} className="p-0.5 rounded hover:bg-[#e8e6e1] dark:hover:bg-[#33302c] text-[#8a8070] dark:text-[#8a8070]">
                      <Check size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(null) }} className="p-0.5 rounded hover:bg-[#e8e6e1] dark:hover:bg-[#33302c] text-[#8a8070] dark:text-[#8a8070]">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`text-sm truncate ${
                      conv.id === activeConversationId ? 'text-[#3a352c] dark:text-[#e8e0d5] font-medium' : 'text-[#5a544a] dark:text-[#b8b0a5]'
                    }`}>
                      {conv.title}
                    </div>
                    <div className="text-[10px] text-[#8a8070] dark:text-[#6b6358]">{formatDate(conv.updatedAt)}</div>
                  </>
                )}
              </div>
              {editingId !== conv.id && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-150 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); startRename(conv.id, conv.title) }}
                    className="p-1 rounded hover:bg-[#e8e6e1] dark:hover:bg-[#33302c] text-[#8a8070] hover:text-[#d97706] dark:hover:text-[#d97706] transition-all"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="p-1 rounded hover:bg-[#e8e6e1] dark:hover:bg-[#33302c] text-[#8a8070] hover:text-red-500 transition-all"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {conversations.length > 0 && (
          <div className="p-2 border-t border-[#e8e6e1] dark:border-[#2c2926]">
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[#8a8070] dark:text-[#6b6358] hover:text-red-600 dark:hover:text-red-400 hover:bg-[#f0eee8] dark:hover:bg-[#23211e] transition-all duration-200"
            >
              <ClearIcon size={13} />
              Clear chats
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
