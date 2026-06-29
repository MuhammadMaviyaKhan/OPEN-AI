import { useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { ChatWindow } from '../components/ChatWindow'

export const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-white dark:bg-[#141210]">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <ChatWindow onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
    </div>
  )
}
