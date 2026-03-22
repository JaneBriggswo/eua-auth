require('dotenv').config();
const { initDatabase, saveDatabase } = require('./database/database-sqljs');
const bcrypt = require('bcryptjs');
const AdminModel = require('./models/Admin-sqljs');

console.log('🔧 Executando setup do banco de dados...\n');

async function setup() {
    try {
        // Inicializar banco
        await initDatabase();
        console.log('✓ Banco de dados inicializado');

        // Criar/atualizar admin
        const username = process.env.ADMIN_USERNAME || 'euastore';
        const password = process.env.ADMIN_PASSWORD || 'eua123';
        const email = process.env.ADMIN_EMAIL || 'admin@phantom.com';

        const existingAdmin = AdminModel.findByUsername(username);
        
        if (existingAdmin) {
            console.log(`✓ Admin '${username}' já existe`);
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            AdminModel.create({
                username,
                email,
                password: hashedPassword,
                role: 'superadmin'
            });
            console.log(`✓ Admin '${username}' criado com sucesso`);
        }

        // Salvar banco
        saveDatabase();
        console.log('✓ Banco salvado\n');
        console.log('✅ Setup concluído!\n');
        
    } catch (error) {
        console.error('❌ Erro no setup:', error.message);
        console.error(error);
        process.exit(1);
    }
}

setup();
