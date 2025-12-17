const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');

// GET /api/materialCategories - Tüm malzeme kategorilerini listele
router.get('/', auth, async (req, res) => {
    try {
        const result = await query('SELECT * FROM "MaterialCategories" ORDER BY "name" ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Kategori listeleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// POST /api/materialCategories - Yeni kategori ekle
router.post('/', auth, async (req, res) => {
    try {
        const { name, description } = req.body;
        
        const insertQuery = `
            INSERT INTO "MaterialCategories" 
            ("name", "description", "userId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(insertQuery, [name, description || null, req.user.id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Kategori ekleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// PUT /api/materialCategories/:id - Kategori güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const updateQuery = `
            UPDATE "MaterialCategories" 
            SET "name" = $1, "description" = $2, "updatedAt" = NOW()
            WHERE "id" = $3
            RETURNING *
        `;

        const result = await query(updateQuery, [name, description, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Kategori güncelleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// DELETE /api/materialCategories/:id - Kategori sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const checkResult = await query('SELECT * FROM "MaterialCategories" WHERE "id" = $1', [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }

        await query('DELETE FROM "MaterialCategories" WHERE "id" = $1', [id]);
        res.json({ message: 'Kategori silindi' });
    } catch (err) {
        console.error('Kategori silme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
