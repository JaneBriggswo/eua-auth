const { exec, query, queryOne } = require('../database/database-sqljs');

class UserModel {
    static create({ discord_id, discord_username, hwid, product_id, license_key, expires_at }) {
        return exec(
            'INSERT INTO users (discord_id, discord_username, hwid, product_id, license_key, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
            [discord_id, discord_username, hwid, product_id, license_key, expires_at]
        );
    }

    static getAll() {
        return query(`
            SELECT u.*, p.name as product_name 
            FROM users u
            LEFT JOIN products p ON u.product_id = p.id
            ORDER BY u.created_at DESC
        `);
    }

    static findByDiscordId(discord_id) {
        return queryOne(`
            SELECT u.*, p.name as product_name, p.duration_days
            FROM users u
            LEFT JOIN products p ON u.product_id = p.id
            WHERE u.discord_id = ?
        `, [discord_id]);
    }

    static findByLicenseKey(license_key) {
        return queryOne(`
            SELECT u.*, p.name as product_name, p.duration_days
            FROM users u
            LEFT JOIN products p ON u.product_id = p.id
            WHERE u.license_key = ?
        `, [license_key]);
    }

    static findById(id) {
        return queryOne(`
            SELECT u.*, p.name as product_name 
            FROM users u
            LEFT JOIN products p ON u.product_id = p.id
            WHERE u.id = ?
        `, [id]);
    }

    static update(id, { discord_username, hwid, product_id, expires_at, is_active }) {
        return exec(
            'UPDATE users SET discord_username = ?, hwid = ?, product_id = ?, expires_at = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [discord_username, hwid, product_id, expires_at, is_active, id]
        );
    }

    static updateHWID(discord_id, hwid) {
        return exec(
            'UPDATE users SET hwid = ?, updated_at = CURRENT_TIMESTAMP WHERE discord_id = ?',
            [hwid, discord_id]
        );
    }

    static resetHWID(id) {
        return exec(
            'UPDATE users SET hwid = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
    }

    static updateLastLogin(discord_id, ip_address) {
        return exec(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP, ip_address = ? WHERE discord_id = ?',
            [ip_address, discord_id]
        );
    }

    static ban(id, reason) {
        return exec(
            'UPDATE users SET is_banned = 1, ban_reason = ?, is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [reason, id]
        );
    }

    static unban(id) {
        return exec(
            'UPDATE users SET is_banned = 0, ban_reason = NULL, is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
    }

    static delete(id) {
        return exec('DELETE FROM users WHERE id = ?', [id]);
    }

    static getStats() {
        return queryOne(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN is_active = 1 AND is_banned = 0 THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN is_banned = 1 THEN 1 ELSE 0 END) as banned_users,
                SUM(CASE WHEN datetime(expires_at) < datetime('now') THEN 1 ELSE 0 END) as expired_users
            FROM users
        `);
    }
}

module.exports = UserModel;
