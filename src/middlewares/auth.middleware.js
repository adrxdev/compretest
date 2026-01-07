const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied: insufficient permissions' });
        }
        next();
    };
};

const verifySuperAdmin = (req, res, next) => {
    // Hardcoded Super Admin for v1
    const SUPER_ADMIN_EMAIL = 'pranavvgawai@gmail.com';

    if (!req.user || req.user.email !== SUPER_ADMIN_EMAIL) {
        return res.status(403).json({ error: 'Access denied: Super Admin only' });
    }
    next();
};

module.exports = {
    authenticateToken,
    authorizeRole,
    verifySuperAdmin
};
