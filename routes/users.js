const express = require('express');
const router = express.Router();
const UserModel = require('../models/User-sqljs');
const ProductModel = require('../models/Product-sqljs');
const LogModel = require('../models/Log-sqljs');
const crypto = require('crypto');
const { authMiddleware, adminRoleMiddleware } = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);
router.use(adminRoleMiddleware);

// Listar todos os usuários
router.get('/', (req, res) => {
    try {
        const users = UserModel.getAll();
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao listar usuários' 
        });
    }
});

// Buscar usuário por ID
router.get('/:id', (req, res) => {
    try {
        const user = UserModel.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar usuário' 
        });
    }
});

// Criar novo usuário
router.post('/', (req, res) => {
    try {
        const { discord_id, discord_username, product_id, duration_days } = req.body;

        if (!discord_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Discord ID é obrigatório' 
            });
        }

        // Verificar se usuário já existe
        const existingUser = UserModel.findByDiscordId(discord_id);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Usuário com este Discord ID já existe' 
            });
        }

        // Gerar license key única no formato PH-XXXX-XXXX-XXXX
        function generateLicenseKey() {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sem caracteres confusos
            const segments = 3;
            const segmentLength = 4;
            let key = 'PH';
            
            for (let i = 0; i < segments; i++) {
                key += '-';
                for (let j = 0; j < segmentLength; j++) {
                    key += chars.charAt(Math.floor(Math.random() * chars.length));
                }
            }
            return key;
        }
        
        const license_key = generateLicenseKey();

        // Calcular data de expiração
        const days = duration_days || 30;
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + days);

        const result = UserModel.create({
            discord_id,
            discord_username,
            hwid: null,
            product_id: product_id || null,
            license_key,
            expires_at: expires_at.toISOString()
        });

        // Registrar log
        LogModel.create({
            user_id: result.lastInsertRowid,
            discord_id,
            action: 'USER_CREATED',
            details: `Usuário criado por admin: ${req.admin.username}`,
            ip_address: req.ip
        });

        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            data: {
                id: result.lastInsertRowid,
                discord_id,
                discord_username,
                license_key,
                expires_at
            }
        });

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao criar usuário' 
        });
    }
});

// Atualizar usuário
router.put('/:id', (req, res) => {
    try {
        const { discord_username, hwid, product_id, expires_at, is_active } = req.body;
        const userId = req.params.id;

        const user = UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }

        UserModel.update(userId, {
            discord_username: discord_username || user.discord_username,
            hwid: hwid !== undefined ? hwid : user.hwid,
            product_id: product_id !== undefined ? product_id : user.product_id,
            expires_at: expires_at || user.expires_at,
            is_active: is_active !== undefined ? is_active : user.is_active
        });

        // Registrar log
        LogModel.create({
            user_id: userId,
            discord_id: user.discord_id,
            action: 'USER_UPDATED',
            details: `Usuário atualizado por admin: ${req.admin.username}`,
            ip_address: req.ip
        });

        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao atualizar usuário' 
        });
    }
});

// Banir usuário
router.post('/:id/ban', (req, res) => {
    try {
        const { reason } = req.body;
        const userId = req.params.id;

        const user = UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }

        UserModel.ban(userId, reason || 'Sem motivo especificado');

        // Registrar log
        LogModel.create({
            user_id: userId,
            discord_id: user.discord_id,
            action: 'USER_BANNED',
            details: `Banido por: ${req.admin.username}. Motivo: ${reason || 'Sem motivo'}`,
            ip_address: req.ip
        });

        res.json({
            success: true,
            message: 'Usuário banido com sucesso'
        });

    } catch (error) {
        console.error('Erro ao banir usuário:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao banir usuário' 
        });
    }
});

// Desbanir usuário
router.post('/:id/unban', (req, res) => {
    try {
        const userId = req.params.id;

        const user = UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }

        UserModel.unban(userId);

        // Registrar log
        LogModel.create({
            user_id: userId,
            discord_id: user.discord_id,
            action: 'USER_UNBANNED',
            details: `Desbanido por: ${req.admin.username}`,
            ip_address: req.ip
        });

        res.json({
            success: true,
            message: 'Usuário desbanido com sucesso'
        });

    } catch (error) {
        console.error('Erro ao desbanir usuário:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao desbanir usuário' 
        });
    }
});

// Resetar HWID do usuário
router.post('/:id/reset-hwid', (req, res) => {
    try {
        const userId = req.params.id;

        const user = UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }

        if (!user.hwid) {
            return res.status(400).json({ 
                success: false, 
                message: 'Este usuário ainda não possui HWID registrado.' 
            });
        }

        // Resetar HWID usando método específico
        UserModel.resetHWID(userId);

        // Registrar log
        LogModel.create({
            user_id: userId,
            discord_id: user.discord_id,
            action: 'HWID_RESET',
            details: `HWID resetado por: ${req.admin.username}. Anterior: ${user.hwid}`,
            ip_address: req.ip
        });

        res.json({
            success: true,
            message: 'HWID resetado com sucesso! Usuário pode logar em um novo PC.',
            data: {
                discord_id: user.discord_id,
                previous_hwid: user.hwid
            }
        });

    } catch (error) {
        console.error('Erro ao resetar HWID:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno ao resetar HWID: ' + error.message
        });
    }
});

// Deletar usuário
router.delete('/:id', (req, res) => {
    try {
        const userId = req.params.id;

        const user = UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }

        // Registrar log antes de deletar
        LogModel.create({
            user_id: null,
            discord_id: user.discord_id,
            action: 'USER_DELETED',
            details: `Usuário deletado por: ${req.admin.username}`,
            ip_address: req.ip
        });

        UserModel.delete(userId);

        res.json({
            success: true,
            message: 'Usuário deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao deletar usuário' 
        });
    }
});

// Estatísticas de usuários
router.get('/stats/overview', (req, res) => {
    try {
        const stats = UserModel.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar estatísticas' 
        });
    }
});

module.exports = router;
