const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decodedData = jwt.verify(token, JWT_SECRET);
    req.userId = decodedData?.id;
    req.userRole = decodedData?.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];
  return [
    auth,
    (req, res, next) => {
      if (!roles.includes(req.userRole)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    }
  ];
};

module.exports = { auth, authorize };
