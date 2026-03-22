const express = require('express');
const router = express.Router();
const UserModel = require('../models/User-sqljs');
const LogModel = require('../models/Log-sqljs');
const crypto = require('crypto');

// Verificar licença por Discord ID
router.post('/verify', async (req, res) => {
    try {
        const { discord_id, hwid } = req.body;
        const ip_address = req.ip;

        if (!discord_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Discord ID é obrigatório' 
            });
        }

        const user = UserModel.findByDiscordId(discord_id);

        if (!user) {
            LogModel.recordLoginAttempt(discord_id, false, ip_address);
            LogModel.create({
                discord_id,
                action: 'LOGIN_FAILED',
                details: 'Usuário não encontrado',
                ip_address
            });
            
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }

        // Verificar se está banido
        if (user.is_banned) {
            LogModel.create({
                user_id: user.id,
                discord_id,
                action: 'LOGIN_BLOCKED',
                details: `Tentativa de login bloqueada. Motivo do ban: ${user.ban_reason}`,
                ip_address
            });

            return res.status(403).json({ 
                success: false, 
                message: 'Usuário banido',
                ban_reason: user.ban_reason
            });
        }

        // Verificar se está ativo
        if (!user.is_active) {
            return res.status(403).json({ 
                success: false, 
                message: 'Licença inativa' 
            });
        }

        // Verificar expiração
        const now = new Date();
        const expiresAt = new Date(user.expires_at);
        
        if (expiresAt < now) {
            return res.status(403).json({ 
                success: false, 
                message: 'Licença expirada',
                expired_at: user.expires_at
            });
        }

        // Verificar e atualizar HWID
        if (hwid) {
            if (!user.hwid) {
                // Primeira vez - vincular HWID
                UserModel.updateHWID(discord_id, hwid);
            } else if (user.hwid !== hwid) {
                // HWID diferente - bloquear
                LogModel.create({
                    user_id: user.id,
                    discord_id,
                    action: 'HWID_MISMATCH',
                    details: `HWID inválido. Esperado: ${user.hwid}, Recebido: ${hwid}`,
                    ip_address
                });

                return res.status(403).json({ 
                    success: false, 
                    message: 'Resetar HWID para este usuário' 
                });
            }
        }

        // Atualizar último login
        UserModel.updateLastLogin(discord_id, ip_address);

        // Registrar login bem-sucedido
        LogModel.recordLoginAttempt(discord_id, true, ip_address);
        LogModel.create({
            user_id: user.id,
            discord_id,
            action: 'LOGIN_SUCCESS',
            details: 'Login realizado com sucesso',
            ip_address
        });

        // Calcular dias restantes
        const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

        res.json({
            success: true,
            message: 'Licença válida',
            data: {
                discord_username: user.discord_username,
                product_name: user.product_name,
                expires_at: user.expires_at,
                days_remaining: daysRemaining,
                hwid_set: !!user.hwid
            }
        });

    } catch (error) {
        console.error('Erro na verificação:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro no servidor' 
        });
    }
});

// Verificar licença por License Key
router.post('/verify-key', async (req, res) => {
    try {
        const { license_key, hwid } = req.body;
        const ip_address = req.ip;

        if (!license_key) {
            return res.status(400).json({ 
                success: false, 
                message: 'License key é obrigatória' 
            });
        }

        const user = UserModel.findByLicenseKey(license_key);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Licença não encontrada' 
            });
        }

        // Mesma lógica de verificação do endpoint verify
        if (user.is_banned) {
            return res.status(403).json({ 
                success: false, 
                message: 'Usuário banido',
                ban_reason: user.ban_reason
            });
        }

        if (!user.is_active) {
            return res.status(403).json({ 
                success: false, 
                message: 'Licença inativa' 
            });
        }

        const now = new Date();
        const expiresAt = new Date(user.expires_at);
        
        if (expiresAt < now) {
            return res.status(403).json({ 
                success: false, 
                message: 'Licença expirada',
                expired_at: user.expires_at
            });
        }

        if (hwid) {
            if (!user.hwid) {
                UserModel.updateHWID(user.discord_id, hwid);
            } else if (user.hwid !== hwid) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'HWID não corresponde' 
                });
            }
        }

        UserModel.updateLastLogin(user.discord_id, ip_address);

        const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

        res.json({
            success: true,
            message: 'Licença válida',
            data: {
                discord_id: user.discord_id,
                discord_username: user.discord_username,
                product_name: user.product_name,
                expires_at: user.expires_at,
                days_remaining: daysRemaining
            }
        });

    } catch (error) {
        console.error('Erro na verificação por key:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro no servidor' 
        });
    }
});

// Status do sistema (público)
router.get('/status', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
