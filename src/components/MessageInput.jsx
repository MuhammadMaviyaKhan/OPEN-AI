import { useState, useRef } from 'react'
import { Send, Square, Paperclip, X, FileText, FileImage } from 'lucide-react'
import { useStore } from '../store/useStore'
import { readFileAsText, showToast } from '../utils/helpers'

export const MessageInput = ({ onSend, onStop }) => {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)
  const { isStreaming } = useStore()

  const handleSubmit = async () => {
    const hasContent = input.trim() || files.length > 0
    if (!hasContent || isStreaming) return

    let fullMessage = input.trim()
    for (const file of files) {
      try {
        const content = await readFileAsText(file)
        if (file.type.startsWith('image/')) fullMessage += `\n\n[Image: ${file.name}](${content})`
        else if (file.type === 'application/pdf') fullMessage += `\n\n[PDF: ${file.name}](${content})`
        else fullMessage += `\n\n--- Content from ${file.name} ---\n${content}\n--- End ---`
      } catch { showToast.error(`Failed to read ${file.name}`) }
    }

    onSend(fullMessage)
    setInput('')
    setFiles([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || [])
    const validFiles = selected.filter((f) => f.type.startsWith('image/') || f.type === 'application/pdf' || f.type.startsWith('text/'))
    if (validFiles.length !== selected.length) showToast.error('Only images, PDFs, and text files are supported')
    setFiles((prev) => [...prev, ...validFiles])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index))

  return (
    <div className="bg-white dark:bg-[#141210] border-t border-[#e8e6e1] dark:border-[#2c2926]">
      <div className="max-w-4xl mx-auto px-4 pb-4 pt-3">
        {files.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f0eee8] dark:bg-[#23211e] rounded-lg text-xs shrink-0 border border-[#e8e6e1] dark:border-[#33302c]">
                {file.type.startsWith('image/') ? <FileImage size={13} className="text-[#d97706]" /> : <FileText size={13} className="text-[#d97706]" />}
                <span className="max-w-20 truncate text-[#5a544a] dark:text-[#b8b0a5]">{file.name}</span>
                <button onClick={() => removeFile(i)} className="text-[#8a8070] hover:text-[#3a352c] dark:hover:text-[#e8e0d5] ml-0.5"><X size={11} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2 bg-[#f0eee8] dark:bg-[#23211e] rounded-xl px-3 py-2 focus-within:ring-1 focus-within:ring-[#d97706] transition-all">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded-lg hover:bg-[#e8e6e1] dark:hover:bg-[#33302c] text-[#8a8070] hover:text-[#d97706] dark:hover:text-[#d97706] transition-all shrink-0"
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.js,.ts,.jsx,.tsx,.py,.html,.css,.json,.md"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              className="w-full resize-none bg-transparent px-1 py-1 text-sm text-[#3a352c] dark:text-[#e8e0d5] placeholder-[#8a8070] dark:placeholder-[#6b6358] focus:outline-none max-h-[200px] leading-relaxed"
            />
          </div>
          {isStreaming ? (
            <button
              onClick={onStop}
              className="p-1.5 rounded-lg bg-[#d97706] hover:bg-[#b85f04] text-white transition-all active:scale-95 shrink-0"
              title="Stop generating"
            >
              <Square size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input.trim() && files.length === 0}
              className="p-1.5 rounded-lg bg-[#d97706] hover:bg-[#b85f04] text-white transition-all active:scale-95 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send size={16} />
            </button>
          )}
        </div>
        <p className="text-[11px] text-center text-[#8a8070] dark:text-[#6b6358] mt-2">
          AI can make mistakes. Always verify important information.
        </p>
      </div>
    </div>
  )
}
