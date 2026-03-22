const db = require('../database/database');

class AdminModel {
    static create({ username, email, password, role = 'admin' }) {
        const stmt = db.prepare(`
            INSERT INTO admins (username, email, password, role)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(username, email, password, role);
    }

    static findByUsername(username) {
        const stmt = db.prepare('SELECT * FROM admins WHERE username = ?');
        return stmt.get(username);
    }

    static findByEmail(email) {
        const stmt = db.prepare('SELECT * FROM admins WHERE email = ?');
        return stmt.get(email);
    }

    static findById(id) {
        const stmt = db.prepare('SELECT * FROM admins WHERE id = ?');
        return stmt.get(id);
    }

    static getAll() {
        const stmt = db.prepare('SELECT id, username, email, role, created_at, last_login FROM admins');
        return stmt.all();
    }

    static updateLastLogin(id) {
        const stmt = db.prepare('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
        return stmt.run(id);
    }

    static delete(id) {
        const stmt = db.prepare('DELETE FROM admins WHERE id = ?');
        return stmt.run(id);
    }
}

module.exports = AdminModel;
