const { exec, query, queryOne } = require('../database/database-sqljs');

class ProductModel {
    static create({ name, description, price, duration_days }) {
        return exec(
            'INSERT INTO products (name, description, price, duration_days) VALUES (?, ?, ?, ?)',
            [name, description, price, duration_days]
        );
    }

    static getAll() {
        return query('SELECT * FROM products ORDER BY created_at DESC');
    }

    static getActive() {
        return query('SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC');
    }

    static findById(id) {
        return queryOne('SELECT * FROM products WHERE id = ?', [id]);
    }

    static update(id, { name, description, price, duration_days, is_active }) {
        return exec(
            'UPDATE products SET name = ?, description = ?, price = ?, duration_days = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [name, description, price, duration_days, is_active, id]
        );
    }

    static delete(id) {
        return exec('DELETE FROM products WHERE id = ?', [id]);
    }

    static toggleActive(id) {
        return exec(
            'UPDATE products SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
    }
}

module.exports = ProductModel;
