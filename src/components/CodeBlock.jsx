import { useState } from 'react'
import { Copy, Check, ChevronDown, ChevronRight, Terminal } from 'lucide-react'
import { showToast } from '../utils/helpers'

export const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      showToast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch { showToast.error('Failed to copy') }
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[#e8e6e1] dark:border-[#33302c] shadow-sm group/code">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#f0eee8] dark:bg-[#1a1816] border-b border-[#e8e6e1] dark:border-[#2c2926]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-white/50 dark:hover:bg-[#2c2926] rounded-lg p-0.5 transition-colors"
          >
            {collapsed ? <ChevronRight size={14} className="text-[#8a8070]" /> : <ChevronDown size={14} className="text-[#8a8070]" />}
          </button>
          <Terminal size={14} className="text-[#8a8070]" />
          <span className="text-xs font-medium text-[#5a544a] dark:text-[#8a8070] uppercase tracking-wider">{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 dark:bg-[#23211e]/60 hover:bg-white dark:hover:bg-[#23211e] text-xs text-[#5a544a] dark:text-[#8a8070] hover:text-[#d97706] dark:hover:text-[#d97706] transition-all border border-[#e8e6e1] dark:border-[#33302c]"
        >
          {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy code'}</span>
        </button>
      </div>
      {!collapsed && (
        <div className="relative">
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed bg-[#faf9f7] dark:bg-[#0f0d0b]">
            <code className={`language-${language || ''} font-mono`}>{code}</code>
          </pre>
          <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-[#faf9f7]/80 to-transparent dark:from-[#0f0d0b]/80 pointer-events-none" />
        </div>
      )}
    </div>
  )
}
