const db = require('../database/database');

class LogModel {
    static create({ user_id, discord_id, action, details, ip_address }) {
        const stmt = db.prepare(`
            INSERT INTO logs (user_id, discord_id, action, details, ip_address)
            VALUES (?, ?, ?, ?, ?)
        `);
        return stmt.run(user_id || null, discord_id || null, action, details || null, ip_address || null);
    }

    static getAll(limit = 100) {
        const stmt = db.prepare(`
            SELECT l.*, u.discord_username
            FROM logs l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
            LIMIT ?
        `);
        return stmt.all(limit);
    }

    static getByUserId(user_id, limit = 50) {
        const stmt = db.prepare(`
            SELECT * FROM logs
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        `);
        return stmt.all(user_id, limit);
    }

    static getByDiscordId(discord_id, limit = 50) {
        const stmt = db.prepare(`
            SELECT * FROM logs
            WHERE discord_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        `);
        return stmt.all(discord_id, limit);
    }

    static recordLoginAttempt(discord_id, success, ip_address) {
        const stmt = db.prepare(`
            INSERT INTO login_attempts (discord_id, success, ip_address)
            VALUES (?, ?, ?)
        `);
        return stmt.run(discord_id, success ? 1 : 0, ip_address);
    }

    static getRecentFailedAttempts(discord_id, minutes = 15) {
        const stmt = db.prepare(`
            SELECT COUNT(*) as count
            FROM login_attempts
            WHERE discord_id = ? 
            AND success = 0 
            AND datetime(created_at) > datetime('now', '-' || ? || ' minutes')
        `);
        return stmt.get(discord_id, minutes);
    }
}

module.exports = LogModel;
