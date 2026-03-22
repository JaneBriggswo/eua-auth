const db = require('../database/database');

class ProductModel {
    static create({ name, description, price, duration_days }) {
        const stmt = db.prepare(`
            INSERT INTO products (name, description, price, duration_days)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(name, description, price, duration_days);
    }

    static getAll() {
        const stmt = db.prepare('SELECT * FROM products ORDER BY created_at DESC');
        return stmt.all();
    }

    static getActive() {
        const stmt = db.prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC');
        return stmt.all();
    }

    static findById(id) {
        const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
        return stmt.get(id);
    }

    static update(id, { name, description, price, duration_days, is_active }) {
        const stmt = db.prepare(`
            UPDATE products 
            SET name = ?, description = ?, price = ?, duration_days = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(name, description, price, duration_days, is_active, id);
    }

    static delete(id) {
        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        return stmt.run(id);
    }

    static toggleActive(id) {
        const stmt = db.prepare(`
            UPDATE products 
            SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(id);
    }
}

module.exports = ProductModel;
