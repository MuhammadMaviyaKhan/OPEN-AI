const API_BASE = 'https://openrouter.ai/api/v1'

export default async (req, res) => {
  const slug = req.query.slug || []
  const path = '/' + slug.join('/')
  const targetURL = API_BASE + path

  let rawBody
  if (req.method === 'POST') {
    rawBody = await new Promise((resolve) => {
      let data = ''
      req.on('data', (c) => data += c)
      req.on('end', () => resolve(data || undefined))
    })
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
      const errText = await response.text()
      return res.status(response.status).json({ error: errText })
    }

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
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
