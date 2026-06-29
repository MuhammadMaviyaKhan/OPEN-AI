const API_BASE = 'https://openrouter.ai/api/v1'

module.exports = async (req, res) => {
  const slug = req.query.slug || []
  const path = '/' + slug.join('/')
  const targetURL = API_BASE + path

  let body
  if (req.method === 'POST') {
    try {
      body = req.body || await new Promise((resolve, reject) => {
        let data = ''
        req.on('data', (c) => { data += c })
        req.on('end', () => { try { resolve(data ? JSON.parse(data) : undefined) } catch (e) { reject(e) } })
      })
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' })
    }
  }

  try {
    const response = await fetch(targetURL, {
      method: req.method,
      headers: {
        Authorization: req.headers.authorization || '',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok && !response.headers.get('content-type')?.includes('text/event-stream')) {
      const err = await response.text()
      return res.status(response.status).json({ error: err })
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
