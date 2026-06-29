import toast from 'react-hot-toast'

export const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (days === 1) return 'Yesterday'
  if (days < 7) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export const showToast = {
  success: (msg) => toast.success(msg, { duration: 3000 }),
  error: (msg) => toast.error(msg, { duration: 5000 }),
  info: (msg) => toast(msg, { duration: 3000 }),
}

export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    if (file.type === 'application/pdf') {
      reader.readAsDataURL(file)
    } else {
      reader.readAsText(file)
    }
  })
}

export const truncate = (str, len = 50) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}
