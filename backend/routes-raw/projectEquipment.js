const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');

// GET /api/project-equipment - Proje ekipman ilişkilerini listele
router.get('/', auth, async (req, res) => {
    try {
        const { projectId, equipmentId } = req.query;
        
        let selectQuery = `
            SELECT 
                pe.*,
                p.name as project_name,
                p.status as project_status,
                e.name as equipment_name,
                et.name as equipment_type
            FROM "ProjectEquipment" pe
            LEFT JOIN "Projects" p ON pe."ProjectId" = p.id
            LEFT JOIN "Equipment" e ON pe."EquipmentId" = e.id
            LEFT JOIN "EquipmentTypes" et ON e."EquipmentTypeId" = et.id
        `;
        
        const params = [];
        const conditions = [];
        
        if (projectId) {
            conditions.push(`pe."ProjectId" = $${params.length + 1}`);
            params.push(projectId);
        }
        
        if (equipmentId) {
            conditions.push(`pe."EquipmentId" = $${params.length + 1}`);
            params.push(equipmentId);
        }
        
        if (conditions.length > 0) {
            selectQuery += ' WHERE ' + conditions.join(' AND ');
        }
        
        selectQuery += ' ORDER BY pe."start_date" DESC';
        
        const result = await query(selectQuery, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Proje ekipman listeleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/project-equipment/:id - Tek kayıt getir
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'SELECT * FROM "ProjectEquipment" WHERE "id" = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Kayıt bulunamadı' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Proje ekipman getirme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/project-equipment - Yeni proje ekipman ilişkisi ekle
router.post('/', auth, async (req, res) => {
    try {
        const { ProjectId, EquipmentId, start_date, end_date, daily_cost, notes } = req.body;
        
        // Toplam gün hesaplama
        let total_days = 0;
        if (start_date && end_date) {
            const start = new Date(start_date);
            const end = new Date(end_date);
            total_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }
        
        const insertQuery = `
            INSERT INTO "ProjectEquipment" 
            ("ProjectId", "EquipmentId", "start_date", "end_date", "daily_cost", "total_days", "notes", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(insertQuery, [
            ProjectId,
            EquipmentId,
            start_date,
            end_date || null,
            parseFloat(daily_cost) || 0,
            total_days,
            notes || null
        ]);
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Proje ekipman ekleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/project-equipment/:id - Proje ekipman ilişkisini güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { ProjectId, EquipmentId, start_date, end_date, daily_cost, notes } = req.body;
        
        // Toplam gün hesaplama
        let total_days = 0;
        if (start_date && end_date) {
            const start = new Date(start_date);
            const end = new Date(end_date);
            total_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }
        
        const updateQuery = `
            UPDATE "ProjectEquipment" 
            SET "ProjectId" = $1, "EquipmentId" = $2, "start_date" = $3, "end_date" = $4, 
                "daily_cost" = $5, "total_days" = $6, "notes" = $7, "updatedAt" = NOW()
            WHERE "id" = $8
            RETURNING *
        `;
        
        const result = await query(updateQuery, [
            ProjectId,
            EquipmentId,
            start_date,
            end_date || null,
            parseFloat(daily_cost) || 0,
            total_days,
            notes || null,
            id
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Kayıt bulunamadı' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Proje ekipman güncelleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/project-equipment/:id - Proje ekipman ilişkisini sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const checkResult = await query(
            'SELECT * FROM "ProjectEquipment" WHERE "id" = $1',
            [id]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Kayıt bulunamadı' });
        }
        
        await query('DELETE FROM "ProjectEquipment" WHERE "id" = $1', [id]);
        res.json({ message: 'Proje ekipman ilişkisi silindi' });
    } catch (err) {
        console.error('Proje ekipman silme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
