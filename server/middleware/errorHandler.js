function handleRoute(fn) {
  return (req, res, next) => {
    try {
      fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

function isUniqueConstraintError(err) {
  return err && (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === 'SQLITE_CONSTRAINT');
}

function errorHandler(err, req, res, next) {
  if (isUniqueConstraintError(err)) {
    res.status(409).json({ message: 'A record with that value already exists' });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}

module.exports = { handleRoute, errorHandler, isUniqueConstraintError };
