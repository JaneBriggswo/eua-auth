const express = require('express');
const router = express.Router();
const LogModel = require('../models/Log-sqljs');
const { authMiddleware, adminRoleMiddleware } = require('../middleware/auth');

// Aplicar middleware de autenticação
router.use(authMiddleware);
router.use(adminRoleMiddleware);

// Listar logs
router.get('/', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const logs = LogModel.getAll(limit);
        
        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Erro ao listar logs:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao listar logs' 
        });
    }
});

// Logs de um usuário específico
router.get('/user/:userId', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = LogModel.getByUserId(req.params.userId, limit);
        
        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Erro ao listar logs do usuário:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao listar logs do usuário' 
        });
    }
});

// Logs por Discord ID
router.get('/discord/:discordId', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = LogModel.getByDiscordId(req.params.discordId, limit);
        
        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Erro ao listar logs do Discord:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao listar logs do Discord' 
        });
    }
});

module.exports = router;
