const db = require('../database/database');

class UserModel {
    static create({ discord_id, discord_username, hwid, product_id, license_key, expires_at }) {
        const stmt = db.prepare(`
            INSERT INTO users (discord_id, discord_username, hwid, product_id, license_key, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(discord_id, discord_username, hwid, product_id, license_key, expires_at);
    }

    static getAll() {
        const stmt = db.prepare(`
            SELECT u.*, p.name as product_name 
            FROM users u
            LEFT JOIN products p ON u.product_id = p.id
            ORDER BY u.created_at DESC
        `);
        return stmt.all();
    }

    static findByDiscordId(discord_id) {
        const stmt = db.prepare(`
            SELECT u.*, p.name as product_name, p.duration_days
            FROM users u
            LEFT JOIN products p ON u.product_id = p.id
            WHERE u.discord_id = ?
        `);
        return stmt.get(discord_id);
    }

    static findByLicenseKey(license_key) {
        const stmt = db.prepare(`
            SELECT u.*, p.name as product_name, p.duration_days
            FROM users u
            LEFT JOIN products p ON u.product_id = p.id
            WHERE u.license_key = ?
        `);
        return stmt.get(license_key);
    }

    static findById(id) {
        const stmt = db.prepare(`
            SELECT u.*, p.name as product_name 
            FROM users u
            LEFT JOIN products p ON u.product_id = p.id
            WHERE u.id = ?
        `);
        return stmt.get(id);
    }

    static update(id, { discord_username, hwid, product_id, expires_at, is_active }) {
        const stmt = db.prepare(`
            UPDATE users 
            SET discord_username = ?, hwid = ?, product_id = ?, expires_at = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(discord_username, hwid, product_id, expires_at, is_active, id);
    }

    static updateHWID(discord_id, hwid) {
        const stmt = db.prepare(`
            UPDATE users 
            SET hwid = ?, updated_at = CURRENT_TIMESTAMP
            WHERE discord_id = ?
        `);
        return stmt.run(hwid, discord_id);
    }

    static updateLastLogin(discord_id, ip_address) {
        const stmt = db.prepare(`
            UPDATE users 
            SET last_login = CURRENT_TIMESTAMP, ip_address = ?
            WHERE discord_id = ?
        `);
        return stmt.run(ip_address, discord_id);
    }

    static ban(id, reason) {
        const stmt = db.prepare(`
            UPDATE users 
            SET is_banned = 1, ban_reason = ?, is_active = 0, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(reason, id);
    }

    static unban(id) {
        const stmt = db.prepare(`
            UPDATE users 
            SET is_banned = 0, ban_reason = NULL, is_active = 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(id);
    }

    static delete(id) {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        return stmt.run(id);
    }

    static getStats() {
        const stmt = db.prepare(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN is_active = 1 AND is_banned = 0 THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN is_banned = 1 THEN 1 ELSE 0 END) as banned_users,
                SUM(CASE WHEN datetime(expires_at) < datetime('now') THEN 1 ELSE 0 END) as expired_users
            FROM users
        `);
        return stmt.get();
    }
}

module.exports = UserModel;
