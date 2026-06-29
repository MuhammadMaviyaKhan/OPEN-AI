import { useEffect, useRef } from 'react'

export const useAutoScroll = (deps = []) => {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, deps)

  return bottomRef
}
