const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');

// GET /api/equipment - Tüm ekipmanları listele
router.get('/', auth, async (req, res) => {
    try {
        const selectQuery = `
            SELECT 
                e.*,
                et.id as "type_id",
                et.name as "type_name"
            FROM "Equipment" e
            LEFT JOIN "EquipmentTypes" et ON e."EquipmentTypeId" = et.id
            ORDER BY e."createdAt" DESC
        `;
        
        const result = await query(selectQuery);
        
        const equipment = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            serial_number: row.serial_number,
            purchase_date: row.purchase_date,
            purchase_price: row.purchase_price,
            status: row.status,
            maintenance_date: row.maintenance_date,
            EquipmentTypeId: row.EquipmentTypeId,
            userId: row.userId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            EquipmentType: row.type_id ? {
                id: row.type_id,
                name: row.type_name
            } : null
        }));
        
        res.json(equipment);
    } catch (err) {
        console.error('Ekipman listeleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// POST /api/equipment - Yeni ekipman ekle
router.post('/', auth, async (req, res) => {
    try {
        const { name, serial_number, purchase_date, purchase_price, status, maintenance_date, EquipmentTypeId } = req.body;
        
        const insertQuery = `
            INSERT INTO "Equipment" 
            ("name", "serial_number", "purchase_date", "purchase_price", "status", "maintenance_date", "EquipmentTypeId", "userId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(insertQuery, [
            name,
            serial_number || null,
            purchase_date || null,
            purchase_price || 0,
            status || 'available',
            maintenance_date || null,
            EquipmentTypeId || null,
            req.user.id
        ]);

        const newEquipment = result.rows[0];

        // Audit Log
        const auditQuery = `
            INSERT INTO "AuditLogs" 
            ("action", "tableName", "recordId", "userId", "userName", "details", "ipAddress", "userAgent", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        `;
        
        await query(auditQuery, [
            'CREATE',
            'Equipment',
            newEquipment.id,
            req.user.id,
            req.user.name || 'Admin',
            JSON.stringify({ message: 'Yeni ekipman eklendi', data: newEquipment }),
            req.ip,
            req.get('user-agent')
        ]);

        res.json(newEquipment);
    } catch (err) {
        console.error('Ekipman ekleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// PUT /api/equipment/:id - Ekipman güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, serial_number, purchase_date, purchase_price, status, maintenance_date, EquipmentTypeId } = req.body;

        const checkResult = await query('SELECT * FROM "Equipment" WHERE "id" = $1', [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Ekipman bulunamadı' });
        }

        const oldEquipment = checkResult.rows[0];

        const updateQuery = `
            UPDATE "Equipment" 
            SET "name" = $1, "serial_number" = $2, "purchase_date" = $3, "purchase_price" = $4,
                "status" = $5, "maintenance_date" = $6, "EquipmentTypeId" = $7, "updatedAt" = NOW()
            WHERE "id" = $8
            RETURNING *
        `;

        const result = await query(updateQuery, [
            name || oldEquipment.name,
            serial_number !== undefined ? serial_number : oldEquipment.serial_number,
            purchase_date !== undefined ? purchase_date : oldEquipment.purchase_date,
            purchase_price !== undefined ? purchase_price : oldEquipment.purchase_price,
            status || oldEquipment.status,
            maintenance_date !== undefined ? maintenance_date : oldEquipment.maintenance_date,
            EquipmentTypeId !== undefined ? EquipmentTypeId : oldEquipment.EquipmentTypeId,
            id
        ]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ekipman güncelleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// DELETE /api/equipment/:id - Ekipman sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const checkResult = await query('SELECT * FROM "Equipment" WHERE "id" = $1', [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Ekipman bulunamadı' });
        }

        const equipment = checkResult.rows[0];

        await query('DELETE FROM "Equipment" WHERE "id" = $1', [id]);

        // Audit Log
        const auditQuery = `
            INSERT INTO "AuditLogs" 
            ("action", "tableName", "recordId", "userId", "userName", "details", "ipAddress", "userAgent", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        `;
        
        await query(auditQuery, [
            'DELETE',
            'Equipment',
            id,
            req.user.id,
            req.user.name || 'Admin',
            JSON.stringify({ message: 'Ekipman silindi', data: equipment }),
            req.ip,
            req.get('user-agent')
        ]);

        res.json({ message: 'Ekipman silindi' });
    } catch (err) {
        console.error('Ekipman silme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
