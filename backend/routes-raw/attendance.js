const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');
const AuditLogger = require('../utils/auditLogger');

// GET /api/attendance - Tüm yoklama kayıtlarını listele (JOIN ile çalışan ve proje bilgisi)
router.get('/', auth, async (req, res) => {
    try {
        const selectQuery = `
            SELECT 
                a.*,
                e.id as employee_id,
                e.first_name as employee_first_name,
                e.last_name as employee_last_name,
                p.id as project_id,
                p.name as project_name
            FROM "Attendances" a
            LEFT JOIN "Employees" e ON a."EmployeeId" = e.id
            LEFT JOIN "Projects" p ON a."ProjectId" = p.id
            ORDER BY a."date" DESC
        `;
        
        const result = await query(selectQuery);
        
        // Veriyi frontend'in beklediği formata dönüştür
        const attendances = result.rows.map(row => ({
            id: row.id,
            EmployeeId: row.EmployeeId,
            ProjectId: row.ProjectId,
            date: row.date,
            status: row.status,
            worked_hours: row.worked_hours,
            overtime_hours: row.overtime_hours,
            notes: row.notes,
            userId: row.userId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            Employee: row.employee_id ? {
                id: row.employee_id,
                first_name: row.employee_first_name,
                last_name: row.employee_last_name
            } : null,
            Project: row.project_id ? {
                id: row.project_id,
                name: row.project_name
            } : null
        }));
        
        res.json(attendances);
    } catch (error) {
        console.error('Yoklama kayıtları listeleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// GET /api/attendance/project/:projectId - Belirli bir proje için yoklama kayıtları
router.get('/project/:projectId', auth, async (req, res) => {
    try {
        const selectQuery = `
            SELECT 
                a.*,
                e.id as employee_id,
                e.first_name as employee_first_name,
                e.last_name as employee_last_name
            FROM "Attendances" a
            LEFT JOIN "Employees" e ON a."EmployeeId" = e.id
            WHERE a."ProjectId" = $1 AND a."userId" = $2
            ORDER BY a."date" DESC
        `;
        
        const result = await query(selectQuery, [req.params.projectId, req.user.id]);
        
        const attendances = result.rows.map(row => ({
            id: row.id,
            EmployeeId: row.EmployeeId,
            ProjectId: row.ProjectId,
            date: row.date,
            status: row.status,
            worked_hours: row.worked_hours,
            overtime_hours: row.overtime_hours,
            notes: row.notes,
            userId: row.userId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            Employee: row.employee_id ? {
                id: row.employee_id,
                first_name: row.employee_first_name,
                last_name: row.employee_last_name
            } : null
        }));
        
        res.json(attendances);
    } catch (error) {
        console.error('Proje yoklama kayıtları listeleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// POST /api/attendance - Yeni yoklama kaydı oluştur
router.post('/', auth, async (req, res) => {
    try {
        const { EmployeeId, ProjectId, date, status, worked_hours, overtime_hours, notes } = req.body;

        if (!EmployeeId || !ProjectId || !date) {
            return res.status(400).json({ message: 'Çalışan, Proje ve Tarih zorunludur.' });
        }

        const insertQuery = `
            INSERT INTO "Attendances" 
            ("EmployeeId", "ProjectId", "date", "status", "worked_hours", "overtime_hours", "notes", "userId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(insertQuery, [
            EmployeeId,
            ProjectId,
            date,
            status || 'Geldi',
            worked_hours || 8.0,
            overtime_hours || 0,
            notes || null,
            req.user.id
        ]);

        // Yoklama kaydı oluşturma işlemini logla
        await AuditLogger.logGeneric(
            'CREATE',
            'Attendances',
            req.user.id,
            req.user.name,
            { EmployeeId, ProjectId, date, status: status || 'Geldi' },
            req
        );

        // JOIN ile tam veriyi getir
        const fullRecord = await query(`
            SELECT 
                a.*,
                e.id as employee_id,
                e.first_name as employee_first_name,
                e.last_name as employee_last_name,
                p.id as project_id,
                p.name as project_name
            FROM "Attendances" a
            LEFT JOIN "Employees" e ON a."EmployeeId" = e.id
            LEFT JOIN "Projects" p ON a."ProjectId" = p.id
            WHERE a.id = $1
        `, [result.rows[0].id]);

        const attendance = fullRecord.rows[0];
        const formattedResponse = {
            id: attendance.id,
            EmployeeId: attendance.EmployeeId,
            ProjectId: attendance.ProjectId,
            date: attendance.date,
            status: attendance.status,
            worked_hours: attendance.worked_hours,
            overtime_hours: attendance.overtime_hours,
            notes: attendance.notes,
            userId: attendance.userId,
            createdAt: attendance.createdAt,
            updatedAt: attendance.updatedAt,
            Employee: attendance.employee_id ? {
                id: attendance.employee_id,
                first_name: attendance.employee_first_name,
                last_name: attendance.employee_last_name
            } : null,
            Project: attendance.project_id ? {
                id: attendance.project_id,
                name: attendance.project_name
            } : null
        };

        res.status(201).json(formattedResponse);
    } catch (error) {
        console.error('Yoklama kaydı oluşturma hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// PUT /api/attendance/:id - Yoklama kaydını güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { EmployeeId, ProjectId, date, status, worked_hours, overtime_hours, notes } = req.body;

        // Güncelleme öncesi mevcut kaydı al
        const oldRecord = await query(
            'SELECT * FROM "Attendances" WHERE "id" = $1 AND "userId" = $2',
            [id, req.user.id]
        );

        if (oldRecord.rows.length === 0) {
            return res.status(404).json({ message: 'Yoklama kaydı bulunamadı' });
        }

        const updateQuery = `
            UPDATE "Attendances" 
            SET "EmployeeId" = $1, "ProjectId" = $2, "date" = $3, "status" = $4,
                "worked_hours" = $5, "overtime_hours" = $6, "notes" = $7, "updatedAt" = NOW()
            WHERE "id" = $8 AND "userId" = $9
            RETURNING *
        `;

        const result = await query(updateQuery, [
            EmployeeId,
            ProjectId,
            date,
            status,
            worked_hours,
            overtime_hours,
            notes,
            id,
            req.user.id
        ]);

        // Değişiklikleri logla
        const changes = {
            old: { EmployeeId: oldRecord.rows[0].EmployeeId, status: oldRecord.rows[0].status },
            new: { EmployeeId, status }
        };

        await AuditLogger.logGeneric(
            'UPDATE',
            'Attendances',
            req.user.id,
            req.user.name,
            changes,
            req
        );

        // JOIN ile tam veriyi getir
        const fullRecord = await query(`
            SELECT 
                a.*,
                e.id as employee_id,
                e.first_name as employee_first_name,
                e.last_name as employee_last_name,
                p.id as project_id,
                p.name as project_name
            FROM "Attendances" a
            LEFT JOIN "Employees" e ON a."EmployeeId" = e.id
            LEFT JOIN "Projects" p ON a."ProjectId" = p.id
            WHERE a.id = $1
        `, [id]);

        const attendance = fullRecord.rows[0];
        const formattedResponse = {
            id: attendance.id,
            EmployeeId: attendance.EmployeeId,
            ProjectId: attendance.ProjectId,
            date: attendance.date,
            status: attendance.status,
            worked_hours: attendance.worked_hours,
            overtime_hours: attendance.overtime_hours,
            notes: attendance.notes,
            userId: attendance.userId,
            createdAt: attendance.createdAt,
            updatedAt: attendance.updatedAt,
            Employee: attendance.employee_id ? {
                id: attendance.employee_id,
                first_name: attendance.employee_first_name,
                last_name: attendance.employee_last_name
            } : null,
            Project: attendance.project_id ? {
                id: attendance.project_id,
                name: attendance.project_name
            } : null
        };

        res.json(formattedResponse);
    } catch (error) {
        console.error('Yoklama kaydı güncelleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// DELETE /api/attendance/:id - Yoklama kaydını sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const checkResult = await query(
            'SELECT * FROM "Attendances" WHERE "id" = $1 AND "userId" = $2',
            [id, req.user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Yoklama kaydı bulunamadı' });
        }

        await query('DELETE FROM "Attendances" WHERE "id" = $1', [id]);

        // Silme işlemini logla
        await AuditLogger.logGeneric(
            'DELETE',
            'Attendances',
            req.user.id,
            req.user.name,
            { deletedId: id, EmployeeId: checkResult.rows[0].EmployeeId },
            req
        );

        res.json({ message: 'Yoklama kaydı silindi' });
    } catch (error) {
        console.error('Yoklama kaydı silme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

module.exports = router;
