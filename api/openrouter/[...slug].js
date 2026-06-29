const API_BASE = 'https://openrouter.ai/api/v1'

module.exports = async (req, res) => {
  const slug = req.query.slug || []
  const path = '/' + slug.join('/')
  const targetURL = API_BASE + path

  try {
    const response = await fetch(targetURL, {
      method: req.method,
      headers: {
        Authorization: req.headers.authorization || '',
        'Content-Type': 'application/json',
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    })

    if (response.headers.get('content-type')?.includes('text/event-stream')) {
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
    res.status(500).json({ error: err.message })
  }
}
