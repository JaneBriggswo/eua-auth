const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dbDir, 'phantom.db');

let db = null;

// Inicializar banco de dados
async function initDatabase() {
    try {
        const SQL = await initSqlJs();
        
        // Tentar carregar banco existente
        if (fs.existsSync(dbPath)) {
            try {
                const buffer = fs.readFileSync(dbPath);
                db = new SQL.Database(buffer);
                console.log('✅ Banco de dados carregado do arquivo');
            } catch (err) {
                console.log('⚠️ Erro ao carregar DB, criando novo:', err.message);
                db = new SQL.Database();
            }
        } else {
            // Criar novo banco
            db = new SQL.Database();
            console.log('✅ Novo banco de dados criado em memória');
        }
    } catch (err) {
        // Se falhar, criar novo
        console.log('⚠️ Erro na inicialização, criando DB em memória:', err.message);
        const SQL = await initSqlJs();
        db = new SQL.Database();
    }

    // Criar tabelas
    createTables();
    
    // Salvar banco (tentar, mas não falhar se não conseguir)
    try {
        saveDatabase();
    } catch (err) {
        console.log('⚠️ Não foi possível salvar DB no disco (rodando em memória)');
    }

    return db;
}

// Salvar banco de dados no disco
function saveDatabase() {
    if (db) {
        try {
            const data = db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(dbPath, buffer);
        } catch (err) {
            // Falha silenciosa - DB continua em memória
            console.log('⚠️ Erro ao salvar DB:', err.message);
        }
    }
}

// Criar tabelas
function createTables() {
    // Tabela de Admins
    db.run(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )
    `);

    // Tabela de Produtos
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            price REAL DEFAULT 0,
            duration_days INTEGER DEFAULT 30,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabela de Usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discord_id TEXT UNIQUE NOT NULL,
            discord_username TEXT,
            hwid TEXT,
            product_id INTEGER,
            license_key TEXT UNIQUE NOT NULL,
            is_active INTEGER DEFAULT 1,
            is_banned INTEGER DEFAULT 0,
            ban_reason TEXT,
            expires_at DATETIME,
            last_login DATETIME,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        )
    `);

    // Tabela de Logs
    db.run(`
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            discord_id TEXT,
            action TEXT NOT NULL,
            details TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    // Tabela de Login Attempts
    db.run(`
        CREATE TABLE IF NOT EXISTS login_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discord_id TEXT NOT NULL,
            success INTEGER DEFAULT 0,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    saveDatabase();
}

// Wrapper para executar queries
function exec(sql, params = []) {
    try {
        db.run(sql, params);
        saveDatabase();
        return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] };
    } catch (err) {
        console.error('Database error:', err);
        throw err;
    }
}

// Wrapper para queries que retornam dados
function query(sql, params = []) {
    try {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        
        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push(row);
        }
        stmt.free();
        
        return results;
    } catch (err) {
        console.error('Database query error:', err);
        throw err;
    }
}

// Wrapper para query única
function queryOne(sql, params = []) {
    const results = query(sql, params);
    return results[0] || null;
}

module.exports = {
    initDatabase,
    saveDatabase,
    exec,
    query,
    queryOne,
    getDb: () => db
};
