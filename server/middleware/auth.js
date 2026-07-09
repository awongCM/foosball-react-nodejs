function requireApiKey(req, res, next) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    next();
    return;
  }

  const authorization = req.get('authorization') || '';
  const bearerKey = authorization.replace(/^Bearer\s+/i, '').trim();
  const providedKey = (req.get('x-api-key') || bearerKey).trim();

  if (providedKey && providedKey === apiKey) {
    next();
    return;
  }

  res.status(401).json({ message: 'Unauthorized' });
}

module.exports = { requireApiKey };
