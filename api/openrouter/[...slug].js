const API_BASE = 'https://openrouter.ai/api/v1'

export default async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const path = url.pathname.replace(/^\/api\/openrouter/, '') || '/'
  const targetURL = API_BASE + path

  let rawBody
  if (req.method === 'POST') {
    try {
      rawBody = await new Promise((resolve) => {
        let data = ''
        req.on('data', (c) => { data += c })
        req.on('end', () => { resolve(data || undefined) })
        setTimeout(() => resolve(undefined), 3000)
      })
    } catch (e) {
      return res.status(400).json({ error: 'body_error: ' + e.message })
    }
  }

  try {
    const response = await fetch(targetURL, {
      method: req.method,
      headers: {
        Authorization: req.headers.authorization || '',
        'Content-Type': 'application/json',
      },
      body: rawBody,
    })

    if (!response.ok) {
      return res.status(response.status).json({
        error: await response.text().catch(() => 'unknown'),
        targetURL,
        status: response.status,
        path,
      })
    }

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/event-stream')) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(decoder.decode(value))
      }
      res.end()
    } else {
      const data = await response.json()
      res.status(response.status).json(data)
    }
  } catch (err) {
    res.status(500).json({ error: err.message, targetURL })
  }
}
