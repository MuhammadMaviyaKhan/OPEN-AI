const API_CONFIGS = {
  openrouter: {
    baseURL: '/api/openrouter',
    model: 'openai/gpt-4o-mini',
    keyEnv: 'VITE_OPENROUTER_API_KEY',
  },
}

const getConfig = (provider) => API_CONFIGS[provider] || API_CONFIGS.openrouter

const getApiKey = (provider) => {
  const config = getConfig(provider)
  return import.meta.env[config.keyEnv] || ''
}

export const checkApiKey = (provider) => {
  return !!getApiKey(provider)
}

export const sendMessage = async (messages, provider, onChunk, onDone, onError) => {
  const config = getConfig(provider)
  const apiKey = getApiKey(provider)

  if (!apiKey) {
    onError(new Error(`API key not configured for ${provider}. Add ${config.keyEnv} to your .env file.`))
    return null
  }

  const abortController = new AbortController()

  const apiMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))

  let accumulatedContent = ''

  try {
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: apiMessages,
        stream: true,
      }),
      signal: abortController.signal,
    })

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`
      try {
        const errData = await response.json()
        errorMsg = errData.error?.message || errorMsg
      } catch {}
      if (response.status === 429) {
        errorMsg = 'Rate limit exceeded. Please wait and try again.'
      } else if (response.status === 401) {
        errorMsg = `Invalid API key for ${provider}. Please check your credentials.`
      }
      onError(new Error(errorMsg))
      return abortController
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

      for (const line of lines) {
        const data = line.slice(6)
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content || ''
          if (delta) {
            accumulatedContent += delta
            onChunk(accumulatedContent)
          }
        } catch {}
      }
    }

    onDone(accumulatedContent)
  } catch (err) {
    if (err.name === 'AbortError') {
      onDone(accumulatedContent)
      return abortController
    }
    if (err.message === 'Network Error' || err.name === 'TypeError') {
      onError(new Error('Network error. Please check your internet connection.'))
    } else {
      onError(err)
    }
  }

  return abortController
}
