const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');

// Middleware: Sadece Admin erişebilir
const adminOnly = async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM "Users" WHERE "id" = $1', [req.user.id]);
        
        if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
            return res.status(403).json({ message: 'Yetkisiz işlem.' });
        }
        next();
    } catch (err) {
        console.error('Admin kontrolü hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// GET /api/users - Tüm kullanıcıları getir (Admin only)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const result = await query(
            'SELECT id, name, email, role, "isVerified", "createdAt", "updatedAt" FROM "Users" ORDER BY "createdAt" DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Kullanıcı listeleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// POST /api/users - Yeni kullanıcı oluştur (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Email kontrolü
        const checkResult = await query('SELECT * FROM "Users" WHERE "email" = $1', [email]);
        
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı.' });
        }

        // Şifre hashleme
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Yeni kullanıcı oluştur
        const insertQuery = `
            INSERT INTO "Users" 
            ("name", "email", "password", "role", "isVerified", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING id, name, email, role, "isVerified"
        `;
        
        const result = await query(insertQuery, [
            name,
            email,
            hashedPassword,
            role || 'user',
            true
        ]);

        res.json({ 
            success: true, 
            message: 'Kullanıcı başarıyla oluşturuldu.', 
            user: result.rows[0]
        });

    } catch (err) {
        console.error('Kullanıcı oluşturma hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// PUT /api/users/:id - Kullanıcı güncelle (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
    const { id } = req.params;
    const { name, email, role, isVerified } = req.body;

    try {
        // Kullanıcı var mı kontrol et
        const checkResult = await query('SELECT * FROM "Users" WHERE "id" = $1', [id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        // Email başkası tarafından kullanılıyor mu?
        if (email) {
            const emailCheck = await query(
                'SELECT * FROM "Users" WHERE "email" = $1 AND "id" != $2',
                [email, id]
            );
            
            if (emailCheck.rows.length > 0) {
                return res.status(400).json({ message: 'Bu e-posta başka bir kullanıcı tarafından kullanılıyor.' });
            }
        }

        const oldUser = checkResult.rows[0];

        // Kullanıcıyı güncelle
        const updateQuery = `
            UPDATE "Users" 
            SET "name" = $1, "email" = $2, "role" = $3, "isVerified" = $4, "updatedAt" = NOW()
            WHERE "id" = $5
            RETURNING id, name, email, role, "isVerified", "createdAt", "updatedAt"
        `;

        const result = await query(updateQuery, [
            name || oldUser.name,
            email || oldUser.email,
            role || oldUser.role,
            isVerified !== undefined ? isVerified : oldUser.isVerified,
            id
        ]);

        res.json({ 
            success: true, 
            message: 'Kullanıcı güncellendi.', 
            user: result.rows[0]
        });

    } catch (err) {
        console.error('Kullanıcı güncelleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// DELETE /api/users/:id - Kullanıcı sil (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    const { id } = req.params;

    try {
        // Kullanıcı var mı kontrol et
        const checkResult = await query('SELECT * FROM "Users" WHERE "id" = $1', [id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        // Kendi hesabını silemez
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'Kendi hesabınızı silemezsiniz.' });
        }

        // Kullanıcıyı sil
        await query('DELETE FROM "Users" WHERE "id" = $1', [id]);

        res.json({ success: true, message: 'Kullanıcı silindi.' });

    } catch (err) {
        console.error('Kullanıcı silme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

module.exports = router;
