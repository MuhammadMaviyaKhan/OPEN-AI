import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ChatPage } from './pages/ChatPage'
import { useStore } from './store/useStore'

function App() {
  const { theme } = useStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          className: '!bg-white/90 dark:!bg-gray-800/90 !text-gray-900 dark:!text-gray-100 !shadow-xl !border !border-gray-200/50 dark:!border-gray-700/30 !backdrop-blur-xl !rounded-2xl',
          duration: 3000,
        }}
      />
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
