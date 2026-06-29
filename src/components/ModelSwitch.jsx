import { useStore } from '../store/useStore'

export const ModelSwitch = () => {
  const { model, setModel } = useStore()

  return (
    <select
      value={model}
      onChange={(e) => setModel(e.target.value)}
      className="w-full px-2 py-1 rounded-lg bg-white dark:bg-[#23211e] border border-[#e8e6e1] dark:border-[#33302c] text-xs text-[#5a544a] dark:text-[#b8b0a5] focus:outline-none focus:ring-1 focus:ring-[#d97706] cursor-pointer"
    >
      <option value="openai">OpenAI</option>
      <option value="deepseek">DeepSeek</option>
    </select>
  )
}
