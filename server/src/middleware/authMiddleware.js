const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Existing user protect (keep for user routes)
exports.protect = async (req, res, next) => {
  try {
    let token;
    const hdr = req.headers.authorization || '';
    // TEMP LOGS
    console.log('Auth Header:', hdr);

    if (hdr && hdr.startsWith('Bearer')) {
      token = hdr.split(' ')[1];
    }

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      // TEMP LOGS
      console.log('Decoded token ID:', decoded?.id);
    } catch (e) {
      console.log('JWT verify failed:', e.message);
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.admin = await Admin.findById(decoded.id);
    if (!req.admin) {
      console.log('Admin not found for decoded id');
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }
    if (!req.admin.isActive) {
      console.log('Admin inactive');
      return res.status(401).json({ success: false, message: 'Admin inactive' });
    }
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

// NEW: Admin-only protect for /api/admin routes
exports.protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select('-password');
    if (!req.admin || req.admin.isActive === false) {
      return res.status(401).json({ success: false, message: 'Admin not found or inactive' });
    }
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Authorize specific roles (works for req.user or req.admin)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const role = req?.admin?.role || req?.user?.role;
    if (!roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${role}' is not authorized to access this route`,
      });
    }
    next();
  };
};
