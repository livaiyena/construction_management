const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');

// GET /api/audit - Tüm audit logları getir
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 50, tableName, action, userId } = req.query;
        
        let selectQuery = `
            SELECT 
                a.*,
                u.id as "user_id",
                u.name as "user_name",
                u.email as "user_email"
            FROM "AuditLogs" a
            LEFT JOIN "Users" u ON a."userId" = u.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (tableName) {
            selectQuery += ` AND a."tableName" = $${paramIndex}`;
            params.push(tableName);
            paramIndex++;
        }
        
        if (action) {
            selectQuery += ` AND a."action" = $${paramIndex}`;
            params.push(action);
            paramIndex++;
        }
        
        if (userId) {
            selectQuery += ` AND a."userId" = $${paramIndex}`;
            params.push(userId);
            paramIndex++;
        }
        
        selectQuery += ' ORDER BY a."createdAt" DESC';
        selectQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        
        const result = await query(selectQuery, params);
        
        // Total count
        let countQuery = 'SELECT COUNT(*) as total FROM "AuditLogs" WHERE 1=1';
        const countParams = [];
        let countIndex = 1;
        
        if (tableName) {
            countQuery += ` AND "tableName" = $${countIndex}`;
            countParams.push(tableName);
            countIndex++;
        }
        if (action) {
            countQuery += ` AND "action" = $${countIndex}`;
            countParams.push(action);
            countIndex++;
        }
        if (userId) {
            countQuery += ` AND "userId" = $${countIndex}`;
            countParams.push(userId);
        }
        
        const countResult = await query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);
        
        const logs = result.rows.map(row => ({
            id: row.id,
            action: row.action,
            tableName: row.tableName,
            recordId: row.recordId,
            userId: row.userId,
            userName: row.userName,
            details: row.details,
            ipAddress: row.ipAddress,
            userAgent: row.userAgent,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            User: row.user_id ? {
                id: row.user_id,
                name: row.user_name,
                email: row.user_email
            } : null
        }));
        
        res.json({
            logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Audit Log hatası:', err);
        res.status(500).json({ message: 'Loglar yüklenemedi' });
    }
});

// GET /api/audit/stats - İstatistikler
router.get('/stats', auth, async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                "tableName" as entity,
                COUNT(*) as count
            FROM "AuditLogs"
            GROUP BY "tableName"
            ORDER BY count DESC
        `;
        
        const result = await query(statsQuery);
        res.json(result.rows);
    } catch (err) {
        console.error('Stats hatası:', err);
        res.status(500).json({ message: 'İstatistikler yüklenemedi' });
    }
});

module.exports = router;
