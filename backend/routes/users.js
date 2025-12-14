const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const auth = require('../middleware/auth');

// Middleware: Sadece Admin erişebilir
const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Yetkisiz işlem.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Tüm kullanıcıları getir
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }, // Şifreleri gönderme
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// Yeni kullanıcı oluştur (Admin tarafından)
router.post('/', auth, adminOnly, async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'user', // Varsayılan user, admin seçebilir
            isVerified: true
        });

        res.json({ success: true, message: 'Kullanıcı başarıyla oluşturuldu.', user: { id: user.id, name: user.name, email: user.email } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// Kullanıcı sil
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        // Kendini silmeyi engelle
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Kendi hesabınızı silemezsiniz.' });
        }

        await user.destroy();
        res.json({ message: 'Kullanıcı silindi.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

module.exports = router;
