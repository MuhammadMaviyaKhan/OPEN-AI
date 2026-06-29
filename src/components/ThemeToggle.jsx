import { Sun, Moon } from 'lucide-react'
import { useStore } from '../store/useStore'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useStore()

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-lg hover:bg-[#e8e6e1] dark:hover:bg-[#2c2926] text-[#8a8070] hover:text-[#d97706] dark:hover:text-[#d97706] transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={14} />
      ) : (
        <Moon size={14} />
      )}
    </button>
  )
}
