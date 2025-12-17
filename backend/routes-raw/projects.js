const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');

// GET /api/projects - Tüm projeleri listele
router.get('/', auth, async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM "Projects" ORDER BY "createdAt" DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Proje listeleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/projects - Yeni proje oluştur
router.post('/', auth, async (req, res) => {
    try {
        const { name, city, district, address, budget, start_date, end_date, status } = req.body;
        
        const insertQuery = `
            INSERT INTO "Projects" 
            ("name", "city", "district", "address", "budget", "start_date", "end_date", "status", "userId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(insertQuery, [
            name,
            city || '',
            district || '',
            address || null,
            budget || 0,
            start_date || null,
            end_date || null,
            status || 'Planlama',
            req.user.id
        ]);

        const newProject = result.rows[0];

        // Audit Log kaydet
        const auditQuery = `
            INSERT INTO "AuditLogs" 
            ("action", "tableName", "recordId", "userId", "userName", "changes", "ipAddress", "userAgent", "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `;
        
        await query(auditQuery, [
            'CREATE',
            'Projects',
            newProject.id,
            req.user.id,
            req.user.name || 'Admin',
            JSON.stringify({ 
                message: 'Yeni proje oluşturuldu',
                data: newProject 
            }),
            req.ip,
            req.get('user-agent')
        ]);

        res.json(newProject);
    } catch (err) {
        console.error('Proje oluşturma hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/projects/:id - Projeyi güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, city, district, address, budget, start_date, end_date, status } = req.body;

        // Önce mevcut projeyi kontrol et
        const checkResult = await query(
            'SELECT * FROM "Projects" WHERE "id" = $1 AND "userId" = $2',
            [id, req.user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Proje bulunamadı' });
        }

        const oldProject = checkResult.rows[0];

        // Değişiklikleri tespit et
        let changes = [];
        if (name && name !== oldProject.name) {
            changes.push(`İsim: "${oldProject.name}" -> "${name}"`);
        }
        if (status && status !== oldProject.status) {
            changes.push(`Durum: ${oldProject.status} -> ${status}`);
        }
        if (budget && parseFloat(budget) !== oldProject.budget) {
            changes.push(`Bütçe: ₺${oldProject.budget} -> ₺${budget}`);
        }
        if (city && city !== oldProject.city) {
            changes.push(`Şehir: ${oldProject.city} -> ${city}`);
        }

        // Projeyi güncelle
        const updateQuery = `
            UPDATE "Projects" 
            SET "name" = $1, "city" = $2, "district" = $3, "address" = $4, "budget" = $5, 
                "start_date" = $6, "end_date" = $7, "status" = $8, "updatedAt" = NOW()
            WHERE "id" = $9 AND "userId" = $10
            RETURNING *
        `;

        const result = await query(updateQuery, [
            name || oldProject.name,
            city !== undefined ? city : oldProject.city,
            district !== undefined ? district : oldProject.district,
            address !== undefined ? address : oldProject.address,
            budget !== undefined ? budget : oldProject.budget,
            start_date !== undefined ? start_date : oldProject.start_date,
            end_date !== undefined ? end_date : oldProject.end_date,
            status || oldProject.status,
            id,
            req.user.id
        ]);

        // Audit Log kaydet (değişiklik varsa)
        if (changes.length > 0) {
            const auditQuery = `
                INSERT INTO "AuditLogs" 
                ("action", "tableName", "recordId", "userId", "userName", "changes", "ipAddress", "userAgent", "createdAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            `;
            
            await query(auditQuery, [
                'UPDATE',
                'Projects',
                id,
                req.user.id,
                req.user.name || 'Admin',
                JSON.stringify({ 
                    message: 'Proje güncellendi',
                    changes: changes 
                }),
                req.ip,
                req.get('user-agent')
            ]);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Proje güncelleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/projects/:id - Projeyi sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Önce projeyi kontrol et
        const checkResult = await query(
            'SELECT * FROM "Projects" WHERE "id" = $1 AND "userId" = $2',
            [id, req.user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Proje bulunamadı' });
        }

        const project = checkResult.rows[0];

        // Projeyi sil
        await query('DELETE FROM "Projects" WHERE "id" = $1', [id]);

        // Audit Log kaydet
        const auditQuery = `
            INSERT INTO "AuditLogs" 
            ("action", "tableName", "recordId", "userId", "userName", "changes", "ipAddress", "userAgent", "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `;
        
        await query(auditQuery, [
            'DELETE',
            'Projects',
            id,
            req.user.id,
            req.user.name || 'Admin',
            JSON.stringify({ 
                message: 'Proje silindi',
                data: project 
            }),
            req.ip,
            req.get('user-agent')
        ]);

        res.json({ message: 'Proje silindi' });
    } catch (err) {
        console.error('Proje silme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
