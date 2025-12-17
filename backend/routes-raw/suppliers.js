const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');

// GET /api/suppliers - Tüm tedarikçileri listele
router.get('/', auth, async (req, res) => {
    try {
        const selectQuery = `
            SELECT 
                s.*,
                COUNT(m.id) as material_count
            FROM "Suppliers" s
            LEFT JOIN "Materials" m ON m."SupplierId" = s.id
            GROUP BY s.id
            ORDER BY s."createdAt" DESC
        `;
        
        const result = await query(selectQuery);
        res.json(result.rows);
    } catch (err) {
        console.error('Tedarikçi listeleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// POST /api/suppliers - Yeni tedarikçi ekle
router.post('/', auth, async (req, res) => {
    try {
        const { name, contact_person, phone, email, address } = req.body;
        
        const insertQuery = `
            INSERT INTO "Suppliers" 
            ("name", "contact_person", "phone", "email", "address", "userId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(insertQuery, [
            name,
            contact_person || null,
            phone || null,
            email || null,
            address || null,
            req.user.id
        ]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Tedarikçi ekleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// PUT /api/suppliers/:id - Tedarikçi güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact_person, phone, email, address } = req.body;

        const checkResult = await query('SELECT * FROM "Suppliers" WHERE "id" = $1', [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Tedarikçi bulunamadı' });
        }

        const oldSupplier = checkResult.rows[0];

        const updateQuery = `
            UPDATE "Suppliers" 
            SET "name" = $1, "contact_person" = $2, "phone" = $3, "email" = $4, "address" = $5, "updatedAt" = NOW()
            WHERE "id" = $6
            RETURNING *
        `;

        const result = await query(updateQuery, [
            name || oldSupplier.name,
            contact_person !== undefined ? contact_person : oldSupplier.contact_person,
            phone !== undefined ? phone : oldSupplier.phone,
            email !== undefined ? email : oldSupplier.email,
            address !== undefined ? address : oldSupplier.address,
            id
        ]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Tedarikçi güncelleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// DELETE /api/suppliers/:id - Tedarikçi sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const checkResult = await query('SELECT * FROM "Suppliers" WHERE "id" = $1', [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Tedarikçi bulunamadı' });
        }

        await query('DELETE FROM "Suppliers" WHERE "id" = $1', [id]);
        res.json({ message: 'Tedarikçi silindi' });
    } catch (err) {
        console.error('Tedarikçi silme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
