const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminModel = require('../models/Admin-sqljs');

// Login de Admin
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username e password são obrigatórios' 
            });
        }

        const admin = AdminModel.findByUsername(username);

        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciais inválidas' 
            });
        }

        const validPassword = await bcrypt.compare(password, admin.password);

        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciais inválidas' 
            });
        }

        // Atualizar último login
        AdminModel.updateLastLogin(admin.id);

        // Gerar token JWT
        const token = jwt.sign(
            { 
                id: admin.id, 
                username: admin.username, 
                role: admin.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role
                }
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro no servidor' 
        });
    }
});

// Verificar token
router.post('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token não fornecido' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = AdminModel.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin não encontrado' 
            });
        }

        res.json({
            success: true,
            data: {
                admin: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role
                }
            }
        });

    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Token inválido' 
        });
    }
});

module.exports = router;
