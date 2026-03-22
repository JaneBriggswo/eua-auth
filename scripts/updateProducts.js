require('dotenv').config();
const { initDatabase } = require('../database/database-sqljs');
const ProductModel = require('../models/Product-sqljs');

console.log('🔄 Atualizando produtos PhantomBypass para EUA Bypass...\n');

const updateProducts = async () => {
    try {
        await initDatabase();
        
        const products = ProductModel.getAll();
        
        if (!products || products.length === 0) {
            console.log('⚠️  Nenhum produto encontrado no banco de dados.');
            return;
        }

        let updated = 0;
        
        products.forEach(product => {
            if (
                product.name.includes('PhantomBypass') ||
                product.description.includes('PhantomBypass') ||
                product.name.includes('Pink Bypass') ||
                product.description.includes('Pink Bypass')
            ) {
                const newName = product.name
                    .replace(/PhantomBypass/g, 'EUA Bypass')
                    .replace(/Pink Bypass/g, 'EUA Bypass');
                const newDescription = product.description
                    .replace(/PhantomBypass/g, 'EUA Bypass')
                    .replace(/Pink Bypass/g, 'EUA Bypass');
                
                ProductModel.update(product.id, {
                    name: newName,
                    description: newDescription,
                    price: product.price,
                    duration_days: product.duration_days,
                    is_active: product.is_active
                });
                
                console.log(`✓ Produto atualizado: ${product.name} → ${newName}`);
                updated++;
            }
        });

        if (updated === 0) {
            console.log('✓ Todos os produtos já estão atualizados!\n');
        } else {
            console.log(`\n✅ ${updated} produto(s) atualizado(s) com sucesso!\n`);
        }

        console.log('📋 Produtos atuais no banco:');
        const currentProducts = ProductModel.getAll();
        currentProducts.forEach(p => {
            console.log(`  - ${p.name} (${p.duration_days} dias) - R$ ${p.price}`);
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar produtos:', error.message);
        console.error(error.stack);
    }
};

updateProducts().then(() => {
    console.log('\n✅ Atualização concluída!');
}).catch(err => {
    console.error('❌ Erro fatal:', err);
});
