const express = require('express');
const router = express.Router();
const ProductModel = require('../models/Product-sqljs');
const LogModel = require('../models/Log-sqljs');
const { authMiddleware, adminRoleMiddleware } = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);
router.use(adminRoleMiddleware);

// Listar todos os produtos
router.get('/', (req, res) => {
    try {
        const products = ProductModel.getAll();
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao listar produtos' 
        });
    }
});

// Buscar produto por ID
router.get('/:id', (req, res) => {
    try {
        const product = ProductModel.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Produto não encontrado' 
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar produto' 
        });
    }
});

// Criar novo produto
router.post('/', (req, res) => {
    try {
        const { name, description, price, duration_days } = req.body;

        if (!name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nome do produto é obrigatório' 
            });
        }

        const result = ProductModel.create({
            name,
            description: description || '',
            price: price || 0,
            duration_days: duration_days || 30
        });

        // Registrar log
        LogModel.create({
            user_id: null,
            discord_id: null,
            action: 'PRODUCT_CREATED',
            details: `Produto criado: ${name} por admin: ${req.admin.username}`,
            ip_address: req.ip
        });

        res.status(201).json({
            success: true,
            message: 'Produto criado com sucesso',
            data: {
                id: result.lastInsertRowid,
                name,
                description,
                price,
                duration_days
            }
        });

    } catch (error) {
        console.error('Erro ao criar produto:', error);
        if (error.message.includes('UNIQUE')) {
            return res.status(400).json({ 
                success: false, 
                message: 'Já existe um produto com este nome' 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao criar produto' 
        });
    }
});

// Atualizar produto
router.put('/:id', (req, res) => {
    try {
        const { name, description, price, duration_days, is_active } = req.body;
        const productId = req.params.id;

        const product = ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Produto não encontrado' 
            });
        }

        ProductModel.update(productId, {
            name: name || product.name,
            description: description !== undefined ? description : product.description,
            price: price !== undefined ? price : product.price,
            duration_days: duration_days !== undefined ? duration_days : product.duration_days,
            is_active: is_active !== undefined ? is_active : product.is_active
        });

        // Registrar log
        LogModel.create({
            user_id: null,
            discord_id: null,
            action: 'PRODUCT_UPDATED',
            details: `Produto atualizado: ${name || product.name} por admin: ${req.admin.username}`,
            ip_address: req.ip
        });

        res.json({
            success: true,
            message: 'Produto atualizado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao atualizar produto' 
        });
    }
});

// Ativar/Desativar produto
router.post('/:id/toggle', (req, res) => {
    try {
        const productId = req.params.id;

        const product = ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Produto não encontrado' 
            });
        }

        ProductModel.toggleActive(productId);

        // Registrar log
        LogModel.create({
            user_id: null,
            discord_id: null,
            action: 'PRODUCT_TOGGLED',
            details: `Produto ${product.is_active ? 'desativado' : 'ativado'}: ${product.name} por admin: ${req.admin.username}`,
            ip_address: req.ip
        });

        res.json({
            success: true,
            message: `Produto ${product.is_active ? 'desativado' : 'ativado'} com sucesso`
        });

    } catch (error) {
        console.error('Erro ao alternar produto:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao alternar produto' 
        });
    }
});

// Deletar produto
router.delete('/:id', (req, res) => {
    try {
        const productId = req.params.id;

        const product = ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Produto não encontrado' 
            });
        }

        // Registrar log antes de deletar
        LogModel.create({
            user_id: null,
            discord_id: null,
            action: 'PRODUCT_DELETED',
            details: `Produto deletado: ${product.name} por admin: ${req.admin.username}`,
            ip_address: req.ip
        });

        ProductModel.delete(productId);

        res.json({
            success: true,
            message: 'Produto deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao deletar produto' 
        });
    }
});

// Rota especial para atualizar produtos PhantomBypass → EUA Bypass
router.post('/update-to-eua-bypass', (req, res) => {
    try {
        const products = ProductModel.getAll();
        let updated = 0;
        const updatedProducts = [];

        products.forEach(product => {
            if (
                product.name.includes('PhantomBypass') ||
                product.name.includes('Phantom') ||
                product.name.includes('Pink Bypass') ||
                product.description.includes('Pink Bypass')
            ) {
                const newName = product.name
                    .replace(/PhantomBypass/g, 'EUA Bypass')
                    .replace(/Pink Bypass/g, 'EUA Bypass')
                    .replace(/Phantom/g, 'EUA');
                const newDescription = product.description
                    .replace(/PhantomBypass/g, 'EUA Bypass')
                    .replace(/Pink Bypass/g, 'EUA Bypass')
                    .replace(/Phantom/g, 'EUA');
                
                ProductModel.update(product.id, {
                    name: newName,
                    description: newDescription,
                    price: product.price,
                    duration_days: product.duration_days,
                    is_active: product.is_active
                });

                updatedProducts.push({
                    old: product.name,
                    new: newName
                });
                
                updated++;

                // Registrar log
                LogModel.create({
                    user_id: null,
                    discord_id: null,
                    action: 'PRODUCT_UPDATED',
                    details: `Produto renomeado: "${product.name}" → "${newName}" por admin: ${req.admin.username}`,
                    ip_address: req.ip
                });
            }
        });

        res.json({
            success: true,
            message: `${updated} produto(s) atualizado(s) com sucesso!`,
            data: {
                updated_count: updated,
                products: updatedProducts
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar produtos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao atualizar produtos: ' + error.message
        });
    }
});

module.exports = router;
