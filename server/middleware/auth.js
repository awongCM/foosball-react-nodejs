function requireApiKey(req, res, next) {
  const apiKey = process.env.API_KEY;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && !apiKey) {
    res.status(503).json({ message: 'Write access is disabled until API_KEY is configured' });
    return;
  }

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
