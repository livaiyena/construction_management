const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');

// GET /api/roles - Tüm rolleri listele
router.get('/', auth, async (req, res) => {
    try {
        const result = await query('SELECT * FROM "Roles" ORDER BY "name" ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Rol listeleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/roles - Yeni rol ekle
router.post('/', auth, async (req, res) => {
    try {
        const { name, default_daily_rate } = req.body;
        
        const insertQuery = `
            INSERT INTO "Roles" 
            ("name", "default_daily_rate", "userId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(insertQuery, [
            name,
            parseFloat(default_daily_rate) || 0,
            req.user.id
        ]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Rol ekleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/roles/:id - Rol güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, default_daily_rate } = req.body;

        const updateQuery = `
            UPDATE "Roles" 
            SET "name" = $1, "default_daily_rate" = $2, "updatedAt" = NOW()
            WHERE "id" = $3 AND "userId" = $4
            RETURNING *
        `;

        const result = await query(updateQuery, [name, parseFloat(default_daily_rate) || 0, id, req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rol bulunamadı' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Rol güncelleme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/roles/:id - Rol sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const checkResult = await query(
            'SELECT * FROM "Roles" WHERE "id" = $1 AND "userId" = $2',
            [id, req.user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Rol bulunamadı' });
        }

        await query('DELETE FROM "Roles" WHERE "id" = $1', [id]);
        res.json({ message: 'Rol silindi' });
    } catch (err) {
        console.error('Rol silme hatası:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
