module.exports = async (req, res) => {
  res.status(200).json({ ok: true, slug: req.query.slug, method: req.method, url: req.url })
}
