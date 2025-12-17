const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');
const AuditLogger = require('../utils/auditLogger');

// GET /api/materials - Tüm malzemeleri listele
router.get('/', auth, async (req, res) => {
    try {
        const selectQuery = `
            SELECT 
                m.*,
                s.id as "supplier_id",
                s.name as "supplier_name"
            FROM "Materials" m
            LEFT JOIN "Suppliers" s ON m."SupplierId" = s.id
            ORDER BY m."createdAt" DESC
        `;
        
        const result = await query(selectQuery);
        
        const materials = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            unit: row.unit,
            unit_price: row.unit_price,
            stock_quantity: row.stock_quantity,
            minimum_stock: row.minimum_stock,
            MaterialCategoryId: row.MaterialCategoryId,
            SupplierId: row.SupplierId,
            description: row.description,
            userId: row.userId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            Supplier: row.supplier_id ? {
                name: row.supplier_name
            } : null
        }));
        
        res.json(materials);
    } catch (err) {
        console.error('Malzeme listeleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// POST /api/materials - Yeni malzeme ekle
router.post('/', auth, async (req, res) => {
    try {
        const { name, unit, unit_price, stock_quantity, minimum_stock, MaterialCategoryId, SupplierId, description } = req.body;
        
        const insertQuery = `
            INSERT INTO "Materials" 
            ("name", "MaterialCategoryId", "unit", "unit_price", "stock_quantity", "minimum_stock", "SupplierId", "description", "userId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(insertQuery, [
            name,
            MaterialCategoryId || null,
            unit || 'adet',
            unit_price || 0,
            stock_quantity || 0,
            minimum_stock || 0,
            SupplierId || null,
            description || null,
            req.user.id
        ]);

        const newMaterial = result.rows[0];
        await AuditLogger.logMaterial('CREATE', req.user.id, req.user.name, newMaterial, req);

        res.json(newMaterial);
    } catch (err) {
        console.error('Malzeme ekleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// PUT /api/materials/:id - Malzeme güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, unit, unit_price, stock_quantity, minimum_stock, MaterialCategoryId, SupplierId, description } = req.body;

        const checkResult = await query('SELECT * FROM "Materials" WHERE "id" = $1', [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Malzeme bulunamadı' });
        }

        const oldMaterial = checkResult.rows[0];

        const updateQuery = `
            UPDATE "Materials" 
            SET "name" = $1, "MaterialCategoryId" = $2, "unit" = $3, "unit_price" = $4,
                "stock_quantity" = $5, "minimum_stock" = $6, "SupplierId" = $7, "description" = $8, "updatedAt" = NOW()
            WHERE "id" = $9
            RETURNING *
        `;

        const result = await query(updateQuery, [
            name || oldMaterial.name,
            MaterialCategoryId !== undefined ? MaterialCategoryId : oldMaterial.MaterialCategoryId,
            unit || oldMaterial.unit,
            unit_price !== undefined ? unit_price : oldMaterial.unit_price,
            stock_quantity !== undefined ? stock_quantity : oldMaterial.stock_quantity,
            minimum_stock !== undefined ? minimum_stock : oldMaterial.minimum_stock,
            SupplierId !== undefined ? SupplierId : oldMaterial.SupplierId,
            description !== undefined ? description : oldMaterial.description,
            id
        ]);

        const updatedMaterial = result.rows[0];
        await AuditLogger.logMaterial('UPDATE', req.user.id, req.user.name, updatedMaterial, req, {
            old: oldMaterial,
            new: updatedMaterial
        });

        res.json(updatedMaterial);
    } catch (err) {
        console.error('Malzeme güncelleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// DELETE /api/materials/:id - Malzeme sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const checkResult = await query('SELECT * FROM "Materials" WHERE "id" = $1', [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Malzeme bulunamadı' });
        }

        const material = checkResult.rows[0];
        await query('DELETE FROM "Materials" WHERE "id" = $1', [id]);
        await AuditLogger.logMaterial('DELETE', req.user.id, req.user.name, material, req);

        res.json({ message: 'Malzeme silindi' });
    } catch (err) {
        console.error('Malzeme silme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
