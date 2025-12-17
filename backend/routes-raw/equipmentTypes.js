const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');

// GET /api/equipmentTypes - Tüm ekipman türlerini listele
router.get('/', auth, async (req, res) => {
    try {
        const result = await query('SELECT * FROM "EquipmentTypes" ORDER BY "name" ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Ekipman türü listeleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/equipmentTypes - Yeni tür ekle
router.post('/', auth, async (req, res) => {
    try {
        const { name, description } = req.body;
        
        const insertQuery = `
            INSERT INTO "EquipmentTypes" 
            ("name", "description", "userId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(insertQuery, [name, description || null, req.user.id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ekipman türü ekleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/equipmentTypes/:id - Tür güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const updateQuery = `
            UPDATE "EquipmentTypes" 
            SET "name" = $1, "description" = $2, "updatedAt" = NOW()
            WHERE "id" = $3
            RETURNING *
        `;

        const result = await query(updateQuery, [name, description, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tür bulunamadı' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ekipman türü güncelleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/equipmentTypes/:id - Tür sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const checkResult = await query('SELECT * FROM "EquipmentTypes" WHERE "id" = $1', [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Tür bulunamadı' });
        }

        await query('DELETE FROM "EquipmentTypes" WHERE "id" = $1', [id]);
        res.json({ message: 'Tür silindi' });
    } catch (err) {
        console.error('Ekipman türü silme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
