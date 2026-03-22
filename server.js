require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 8080;

// Configurar trust proxy para Railway/Heroku/proxies reversos
app.set('trust proxy', 1);

// Importar database (versão sql.js - sem necessidade de Python)
const { initDatabase } = require('./database/database-sqljs');

// Importar rotas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');
const clientRoutes = require('./routes/client');
const logsRoutes = require('./routes/logs');

// Middlewares de segurança - Helmet com CSP configurado
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://unpkg.com",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdnjs.cloudflare.com"
            ],
            fontSrc: [
                "'self'",
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Log para debug
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/logs', logsRoutes);

// API root
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Phantom Auth API',
        version: '1.0.0',
        status: 'online'
    });
});

// Rota de status
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online',
        message: 'PhantomAuth API funcionando',
        timestamp: new Date().toISOString()
    });
});

// Rota 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Inicializar banco de dados e depois iniciar servidor
initDatabase().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log('═══════════════════════════════════════════════');
        console.log('   EUA Bypass Auth System');
        console.log('═══════════════════════════════════════════════');
        console.log(`   ✓ Servidor rodando na porta: ${PORT}`);
        console.log(`   ✓ Ambiente: ${process.env.NODE_ENV || 'production'}`);
        console.log(`   ✓ API: https://pinkauth-production.up.railway.app`);
        console.log('═══════════════════════════════════════════════');
    });
}).catch(err => {
    console.error('❌ Erro ao inicializar banco de dados:', err);
    console.log('⚠️ Tentando iniciar servidor mesmo assim...');
    
    // Tentar iniciar mesmo com erro no DB
    app.listen(PORT, '0.0.0.0', () => {
        console.log('⚠️ Servidor iniciado SEM banco de dados');
        console.log(`Porta: ${PORT}`);
    });
});

module.exports = app;
