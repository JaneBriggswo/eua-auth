const { exec, query, queryOne } = require('../database/database-sqljs');

class LogModel {
    static create({ user_id, discord_id, action, details, ip_address }) {
        return exec(
            'INSERT INTO logs (user_id, discord_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
            [user_id || null, discord_id || null, action, details || null, ip_address || null]
        );
    }

    static getAll(limit = 100) {
        return query(`
            SELECT l.*, u.discord_username
            FROM logs l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
            LIMIT ?
        `, [limit]);
    }

    static getByUserId(user_id, limit = 50) {
        return query(`
            SELECT * FROM logs
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        `, [user_id, limit]);
    }

    static getByDiscordId(discord_id, limit = 50) {
        return query(`
            SELECT * FROM logs
            WHERE discord_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        `, [discord_id, limit]);
    }

    static recordLoginAttempt(discord_id, success, ip_address) {
        return exec(
            'INSERT INTO login_attempts (discord_id, success, ip_address) VALUES (?, ?, ?)',
            [discord_id, success ? 1 : 0, ip_address]
        );
    }

    static getRecentFailedAttempts(discord_id, minutes = 15) {
        return queryOne(`
            SELECT COUNT(*) as count
            FROM login_attempts
            WHERE discord_id = ? 
            AND success = 0 
            AND datetime(created_at) > datetime('now', '-' || ? || ' minutes')
        `, [discord_id, minutes]);
    }
}

module.exports = LogModel;
