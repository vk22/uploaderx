const crypto = require('crypto');

function safeEqual(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function requireBasicAuth(req, res, next) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return res.status(500).json({ success: false, message: 'Admin auth is not configured' });
  }

  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');

  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const separatorIndex = decoded.indexOf(':');
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);

    if (safeEqual(user, expectedUser) && safeEqual(pass, expectedPass)) {
      return next();
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="Admin area"');
  return res.status(401).json({ success: false, message: 'Authentication required' });
}

module.exports = { requireBasicAuth };
