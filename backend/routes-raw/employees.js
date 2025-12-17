const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');

// GET /api/employees - Tüm çalışanları listele (JOIN ile proje ve rol bilgisi)
router.get('/', auth, async (req, res) => {
    try {
        const selectQuery = `
            SELECT 
                e.*,
                p.id as "project_id",
                p.name as "project_name",
                p.city as "project_city",
                p.district as "project_district",
                r.id as "role_id",
                r.name as "role_name"
            FROM "Employees" e
            LEFT JOIN "Projects" p ON e."ProjectId" = p.id
            LEFT JOIN "Roles" r ON e."RoleId" = r.id
            ORDER BY e."createdAt" DESC
        `;
        
        const result = await query(selectQuery);
        
        // Veriyi frontend'in beklediği formata dönüştür
        const employees = result.rows.map(row => ({
            id: row.id,
            first_name: row.first_name,
            last_name: row.last_name,
            phone: row.phone,
            email: row.email,
            daily_rate: row.daily_rate,
            hire_date: row.hire_date,
            ProjectId: row.ProjectId,
            RoleId: row.RoleId,
            userId: row.userId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            Project: row.project_id ? {
                id: row.project_id,
                name: row.project_name,
                city: row.project_city,
                district: row.project_district
            } : null,
            Role: row.role_id ? {
                id: row.role_id,
                name: row.role_name
            } : null
        }));
        
        res.json(employees);
    } catch (err) {
        console.error('Çalışan listeleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/employees - Yeni çalışan ekle
router.post('/', auth, async (req, res) => {
    try {
        const { first_name, last_name, phone, email, daily_rate, hire_date, ProjectId, RoleId } = req.body;
        
        const insertQuery = `
            INSERT INTO "Employees" 
            ("first_name", "last_name", "phone", "email", "daily_rate", "hire_date", "ProjectId", "RoleId", "userId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(insertQuery, [
            first_name,
            last_name || null,
            phone || null,
            email || null,
            daily_rate || 0,
            hire_date || null,
            ProjectId || null,
            RoleId || null,
            req.user.id
        ]);

        const newEmployee = result.rows[0];

        // Audit Log
        const auditQuery = `
            INSERT INTO "AuditLogs" 
            ("action", "tableName", "recordId", "userId", "userName", "changes", "ipAddress", "userAgent", "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `;
        
        await query(auditQuery, [
            'CREATE',
            'Employees',
            newEmployee.id,
            req.user.id,
            req.user.name || 'Admin',
            JSON.stringify({ message: 'Yeni çalışan eklendi', data: newEmployee }),
            req.ip,
            req.get('user-agent')
        ]);

        res.json(newEmployee);
    } catch (err) {
        console.error('Çalışan ekleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/employees/:id - Çalışan güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, phone, email, daily_rate, hire_date, ProjectId, RoleId } = req.body;

        // Önce mevcut çalışanı kontrol et
        const checkResult = await query(
            'SELECT * FROM "Employees" WHERE "id" = $1 AND "userId" = $2',
            [id, req.user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Çalışan bulunamadı' });
        }

        const oldEmployee = checkResult.rows[0];

        // Değişiklikleri tespit et
        let changes = [];
        if (first_name && first_name !== oldEmployee.first_name) {
            changes.push(`İsim: ${oldEmployee.first_name} -> ${first_name}`);
        }
        if (daily_rate && parseFloat(daily_rate) !== oldEmployee.daily_rate) {
            changes.push(`Ücret: ₺${oldEmployee.daily_rate} -> ₺${daily_rate}`);
        }
        if (RoleId && parseInt(RoleId) !== oldEmployee.RoleId) {
            changes.push(`Görev (Rol) değiştirildi`);
        }
        if (ProjectId !== undefined && ProjectId !== oldEmployee.ProjectId) {
            changes.push(`Proje ataması değiştirildi`);
        }

        // Çalışanı güncelle
        const updateQuery = `
            UPDATE "Employees" 
            SET "first_name" = $1, "last_name" = $2, "phone" = $3, "email" = $4,
                "daily_rate" = $5, "hire_date" = $6, "ProjectId" = $7, "RoleId" = $8, "updatedAt" = NOW()
            WHERE "id" = $9 AND "userId" = $10
            RETURNING *
        `;

        const result = await query(updateQuery, [
            first_name || oldEmployee.first_name,
            last_name !== undefined ? last_name : oldEmployee.last_name,
            phone !== undefined ? phone : oldEmployee.phone,
            email !== undefined ? email : oldEmployee.email,
            daily_rate !== undefined ? daily_rate : oldEmployee.daily_rate,
            hire_date !== undefined ? hire_date : oldEmployee.hire_date,
            ProjectId !== undefined ? ProjectId : oldEmployee.ProjectId,
            RoleId !== undefined ? RoleId : oldEmployee.RoleId,
            id,
            req.user.id
        ]);

        // Audit Log (değişiklik varsa)
        if (changes.length > 0) {
            const auditQuery = `
                INSERT INTO "AuditLogs" 
                ("action", "tableName", "recordId", "userId", "userName", "changes", "ipAddress", "userAgent", "createdAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            `;
            
            await query(auditQuery, [
                'UPDATE',
                'Employees',
                id,
                req.user.id,
                req.user.name || 'Admin',
                JSON.stringify({ message: 'Çalışan güncellendi', changes: changes }),
                req.ip,
                req.get('user-agent')
            ]);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Çalışan güncelleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/employees/:id - Çalışan sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const checkResult = await query(
            'SELECT * FROM "Employees" WHERE "id" = $1 AND "userId" = $2',
            [id, req.user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Çalışan bulunamadı' });
        }

        const employee = checkResult.rows[0];

        await query('DELETE FROM "Employees" WHERE "id" = $1', [id]);

        // Audit Log
        const auditQuery = `
            INSERT INTO "AuditLogs" 
            ("action", "tableName", "recordId", "userId", "userName", "changes", "ipAddress", "userAgent", "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `;
        
        await query(auditQuery, [
            'DELETE',
            'Employees',
            id,
            req.user.id,
            req.user.name || 'Admin',
            JSON.stringify({ message: 'Çalışan silindi', data: employee }),
            req.ip,
            req.get('user-agent')
        ]);

        res.json({ message: 'Çalışan silindi' });
    } catch (err) {
        console.error('Çalışan silme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
