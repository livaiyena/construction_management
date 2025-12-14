const express = require('express');
const router = express.Router();
const { Setting, User, SecurityLog } = require('../models');
const auth = require('../middleware/auth');

// Tüm ayarları getir (Sadece Admin)
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' });
        }

        const settings = await Setting.findAll();
        res.json(settings);
    } catch (err) {
        console.error("Settings Get Error:", err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// Ayar güncelle (Sadece Admin)
router.put('/:key', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' });
        }

        const { key } = req.params;
        const { value } = req.body;

        let setting = await Setting.findOne({ where: { key } });

        if (!setting) {
            // Ayar yoksa oluşturabiliriz de, ama şimdilik hata dönelim
            // İhtiyaca göre findOrCreate da yapılabilir
            return res.status(404).json({ message: 'Ayar bulunamadı.' });
        }

        setting.value = String(value); // String olarak saklıyoruz
        await setting.save();

        res.json({ success: true, setting });
    } catch (err) {
        console.error("Settings Update Error:", err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// Güvenlik loglarını getir
router.get('/logs', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' });
        }

        const logs = await SecurityLog.findAll({
            limit: 50,
            order: [['createdAt', 'DESC']]
        });

        res.json(logs);
    } catch (err) {
        console.error("Security Logs Error:", err);
        res.status(500).json({ message: 'Loglar alınamadı.' });
    }
});

module.exports = router;
