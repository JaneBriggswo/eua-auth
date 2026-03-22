require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initDatabase } = require('../database/database-sqljs');
const AdminModel = require('../models/Admin-sqljs');
const ProductModel = require('../models/Product-sqljs');
const UserModel = require('../models/User-sqljs');
const crypto = require('crypto');

console.log('🔄 Inicializando banco de dados...\n');

// Criar admin padrão
const createDefaultAdmin = async () => {
    try {
        const username = process.env.ADMIN_USERNAME || 'euastore';
        const existingAdmin = AdminModel.findByUsername(username);

        if (existingAdmin) {
            console.log('✓ Admin padrão já existe');
            return;
        }

        const password = process.env.ADMIN_PASSWORD || 'eua123';
        const email = process.env.ADMIN_EMAIL || 'admin@phantom.com';
        const hashedPassword = await bcrypt.hash(password, 10);

        AdminModel.create({
            username,
            email,
            password: hashedPassword,
            role: 'superadmin'
        });

        console.log('✓ Admin padrão criado:');
        console.log(`  - Username: ${username}`);
        console.log(`  - Password: ${password}`);
        console.log(`  - Email: ${email}`);
        console.log('  ⚠️  ALTERE A SENHA APÓS O PRIMEIRO LOGIN!\n');
    } catch (error) {
        console.error('✗ Erro ao criar admin:', error.message);
    }
};

// Criar produtos de exemplo
const createSampleProducts = () => {
    try {
        const products = [
            {
                name: 'EUA Bypass - 1 Mês',
                description: 'Acesso completo ao EUA Bypass por 1 mês',
                price: 29.99,
                duration_days: 30
            },
            {
                name: 'EUA Bypass - 3 Meses',
                description: 'Acesso completo ao EUA Bypass por 3 meses',
                price: 69.99,
                duration_days: 90
            },
            {
                name: 'EUA Bypass - Lifetime',
                description: 'Acesso vitalício ao EUA Bypass',
                price: 199.99,
                duration_days: 36500 // ~100 anos
            }
        ];

        let created = 0;
        products.forEach(product => {
            try {
                ProductModel.create(product);
                created++;
            } catch (err) {
                // Produto já existe
            }
        });

        if (created > 0) {
            console.log(`✓ ${created} produtos de exemplo criados\n`);
        } else {
            console.log('✓ Produtos já existem\n');
        }
    } catch (error) {
        console.error('✗ Erro ao criar produtos:', error.message);
    }
};

// Criar usuário de teste
const createTestUser = () => {
    try {
        const testDiscordId = '123456789012345678';
        const existing = UserModel.findByDiscordId(testDiscordId);

        if (existing) {
            console.log('✓ Usuário de teste já existe\n');
            return;
        }

        const license_key = crypto.randomBytes(16).toString('hex').toUpperCase();
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + 30);

        UserModel.create({
            discord_id: testDiscordId,
            discord_username: 'TestUser#0001',
            hwid: null,
            product_id: 1,
            license_key,
            expires_at: expires_at.toISOString()
        });

        console.log('✓ Usuário de teste criado:');
        console.log(`  - Discord ID: ${testDiscordId}`);
        console.log(`  - License Key: ${license_key}`);
        console.log(`  - Expira em: ${expires_at.toLocaleDateString()}\n`);
    } catch (error) {
        console.error('✗ Erro ao criar usuário de teste:', error.message);
    }
};

// Executar inicialização
const init = async () => {
    // Inicializar banco de dados primeiro
    await initDatabase();
    
    await createDefaultAdmin();
    createSampleProducts();
    createTestUser();

    console.log('════════════════════════════════════════════');
    console.log('  ✅ Banco de dados inicializado com sucesso!');
    console.log('════════════════════════════════════════════\n');
    console.log('Você pode iniciar o servidor com: npm start\n');
};

init();
