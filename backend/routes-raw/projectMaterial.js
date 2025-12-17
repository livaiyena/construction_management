const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');

// GET /api/project-material - Proje malzeme ilişkilerini listele
router.get('/', auth, async (req, res) => {
    try {
        const { projectId } = req.query;
        
        let selectQuery = `
            SELECT 
                pm.*,
                p.name as project_name,
                m.name as material_name,
                m.unit as material_unit,
                m.stock_quantity as current_stock,
                mc.name as category_name
            FROM "ProjectMaterial" pm
            LEFT JOIN "Projects" p ON pm."ProjectId" = p.id
            LEFT JOIN "Materials" m ON pm."MaterialId" = m.id
            LEFT JOIN "MaterialCategories" mc ON m."MaterialCategoryId" = mc.id
        `;
        
        const params = [];
        if (projectId) {
            selectQuery += ' WHERE pm."ProjectId" = $1';
            params.push(projectId);
        }
        
        selectQuery += ' ORDER BY pm."date_used" DESC';
        
        const result = await query(selectQuery, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Proje malzeme listeleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/project-material/:id - Tek kayıt getir
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'SELECT * FROM "ProjectMaterial" WHERE "id" = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Kayıt bulunamadı' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Proje malzeme getirme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/project-material - Yeni proje malzeme kullanımı ekle
router.post('/', auth, async (req, res) => {
    try {
        const { ProjectId, MaterialId, quantity_used, unit_price_at_time, date_used, notes } = req.body;
        
        const insertQuery = `
            INSERT INTO "ProjectMaterial" 
            ("ProjectId", "MaterialId", "quantity_used", "unit_price_at_time", "date_used", "notes", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(insertQuery, [
            ProjectId,
            MaterialId,
            parseFloat(quantity_used) || 0,
            parseFloat(unit_price_at_time) || 0,
            date_used || new Date().toISOString().split('T')[0],
            notes || null
        ]);
        
        // Malzeme stoğunu düş
        if (quantity_used > 0) {
            await query(
                'UPDATE "Materials" SET "stock_quantity" = "stock_quantity" - $1, "updatedAt" = NOW() WHERE "id" = $2',
                [parseFloat(quantity_used), MaterialId]
            );
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Proje malzeme ekleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/project-material/:id - Proje malzeme kullanımını güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { ProjectId, MaterialId, quantity_used, unit_price_at_time, date_used, notes } = req.body;
        
        // Önce eski kaydı al (stok güncellemesi için)
        const oldRecord = await query('SELECT * FROM "ProjectMaterial" WHERE "id" = $1', [id]);
        if (oldRecord.rows.length === 0) {
            return res.status(404).json({ message: 'Kayıt bulunamadı' });
        }
        
        const old = oldRecord.rows[0];
        
        const updateQuery = `
            UPDATE "ProjectMaterial" 
            SET "ProjectId" = $1, "MaterialId" = $2, "quantity_used" = $3, 
                "unit_price_at_time" = $4, "date_used" = $5, "notes" = $6, "updatedAt" = NOW()
            WHERE "id" = $7
            RETURNING *
        `;
        
        const result = await query(updateQuery, [
            ProjectId,
            MaterialId,
            parseFloat(quantity_used) || 0,
            parseFloat(unit_price_at_time) || 0,
            date_used,
            notes || null,
            id
        ]);
        
        // Stok farkını güncelle
        const quantityDiff = parseFloat(quantity_used) - parseFloat(old.quantity_used);
        if (quantityDiff !== 0) {
            await query(
                'UPDATE "Materials" SET "stock_quantity" = "stock_quantity" - $1, "updatedAt" = NOW() WHERE "id" = $2',
                [quantityDiff, MaterialId]
            );
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Proje malzeme güncelleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/project-material/:id - Proje malzeme kullanımını sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const checkResult = await query('SELECT * FROM "ProjectMaterial" WHERE "id" = $1', [id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Kayıt bulunamadı' });
        }
        
        const record = checkResult.rows[0];
        
        // Stoğu geri ekle
        await query(
            'UPDATE "Materials" SET "stock_quantity" = "stock_quantity" + $1, "updatedAt" = NOW() WHERE "id" = $2',
            [parseFloat(record.quantity_used), record.MaterialId]
        );
        
        await query('DELETE FROM "ProjectMaterial" WHERE "id" = $1', [id]);
        res.json({ message: 'Proje malzeme kullanımı silindi' });
    } catch (err) {
        console.error('Proje malzeme silme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
