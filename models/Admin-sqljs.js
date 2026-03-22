const { exec, query, queryOne } = require('../database/database-sqljs');

class AdminModel {
    static create({ username, email, password, role = 'admin' }) {
        return exec(
            'INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, password, role]
        );
    }

    static findByUsername(username) {
        return queryOne('SELECT * FROM admins WHERE username = ?', [username]);
    }

    static findByEmail(email) {
        return queryOne('SELECT * FROM admins WHERE email = ?', [email]);
    }

    static findById(id) {
        return queryOne('SELECT * FROM admins WHERE id = ?', [id]);
    }

    static getAll() {
        return query('SELECT id, username, email, role, created_at, last_login FROM admins');
    }

    static updateLastLogin(id) {
        return exec('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    }

    static delete(id) {
        return exec('DELETE FROM admins WHERE id = ?', [id]);
    }
}

module.exports = AdminModel;
