const { query } = require('../config/db-raw');

/**
 * Audit Log Helper - Raw SQL Version
 * Sistem genelinde tutarlı loglama için kullanılır
 */
class AuditLogger {
    /**
     * Log kaydı oluştur
     * @param {Object} data - Log verisi
     * @param {number} data.userId - Kullanıcı ID
     * @param {string} data.userName - Kullanıcı adı
     * @param {string} data.action - İşlem tipi (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
     * @param {string} data.tableName - Tablo adı (Projects, Employees, vb.)
     * @param {number} data.recordId - İşlem yapılan kayıt ID
     * @param {Object} data.changes - Değişiklik detayları
     * @param {Object} data.req - Express request objesi (IP ve User-Agent için)
     * @param {string} data.description - İnsan okunabilir açıklama
     * @param {string} data.status - success, error, warning
     */
    static async log(data) {
        try {
            const ipAddress = data.req 
                ? (data.req.headers['x-forwarded-for'] || data.req.socket.remoteAddress || data.req.ip)
                : null;
            const userAgent = data.req ? data.req.headers['user-agent'] : null;

            const insertQuery = `
                INSERT INTO "AuditLogs" 
                ("userId", "userName", "action", "tableName", "recordId", "changes", "ipAddress", "userAgent", "timestamp", "createdAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
                RETURNING *
            `;

            const changesJson = data.changes ? JSON.stringify(data.changes) : null;

            await query(insertQuery, [
                data.userId || null,
                data.userName || 'Sistem',
                data.action,
                data.tableName,
                data.recordId || null,
                changesJson,
                ipAddress,
                userAgent
            ]);
        } catch (error) {
            // Loglama hatası ana işlemi durdurmamalı
            console.error('❌ Audit Log Error:', error.message);
        }
    }

    /**
     * Proje işlemleri için kısayol
     */
    static async logProject(action, userId, userName, projectData, req, changes = null) {
        await this.log({
            userId,
            userName,
            action,
            tableName: 'Projects',
            recordId: projectData.id,
            changes: changes || { name: projectData.name },
            req
        });
    }

    /**
     * Çalışan işlemleri için kısayol
     */
    static async logEmployee(action, userId, userName, employeeData, req, changes = null) {
        await this.log({
            userId,
            userName,
            action,
            tableName: 'Employees',
            recordId: employeeData.id,
            changes: changes || { name: employeeData.name },
            req
        });
    }

    /**
     * Malzeme işlemleri için kısayol
     */
    static async logMaterial(action, userId, userName, materialData, req, changes = null) {
        await this.log({
            userId,
            userName,
            action,
            tableName: 'Materials',
            recordId: materialData.id,
            changes: changes || { name: materialData.name },
            req
        });
    }

    /**
     * Ekipman işlemleri için kısayol
     */
    static async logEquipment(action, userId, userName, equipmentData, req, changes = null) {
        await this.log({
            userId,
            userName,
            action,
            tableName: 'Equipment',
            recordId: equipmentData.id,
            changes: changes || { name: equipmentData.name },
            req
        });
    }

    /**
     * Giriş/Çıkış logları
     */
    static async logAuth(action, userId, userName, req, status = 'success') {
        await this.log({
            userId,
            userName,
            action,
            tableName: 'Users',
            recordId: userId,
            changes: { status },
            req
        });
    }

    /**
     * Genel işlem logu
     */
    static async logGeneric(action, tableName, userId, userName, changes, req) {
        await this.log({
            userId,
            userName,
            action,
            tableName,
            changes,
            req
        });
    }
}

module.exports = AuditLogger;
