const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token não fornecido' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token inválido ou expirado' 
        });
    }
};

const adminRoleMiddleware = (req, res, next) => {
    if (req.admin.role !== 'admin' && req.admin.role !== 'superadmin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Acesso negado. Permissão de admin necessária.' 
        });
    }
    next();
};

module.exports = { authMiddleware, adminRoleMiddleware };
