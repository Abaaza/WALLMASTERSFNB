module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}; 