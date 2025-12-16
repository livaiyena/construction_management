const express = require('express');
const router = express.Router();
const { Material, MaterialTransaction, Supplier } = require('../models');
const auth = require('../middleware/auth');
const AuditLogger = require('../utils/auditLogger');

// Malzemeleri getir
router.get('/', auth, async (req, res) => {
    try {
        const materials = await Material.findAll({
            include: [{ model: Supplier, attributes: ['name'] }]
        });
        res.json(materials);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Yeni malzeme
router.post('/', auth, async (req, res) => {
    try {
        const material = await Material.create({
            ...req.body,
            userId: req.user.id
        });
        res.json(material);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Malzeme güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const material = await Material.findByPk(req.params.id);
        if (!material) {
            return res.status(404).json({ message: 'Malzeme bulunamadı' });
        }
        await material.update(req.body);
        res.json(material);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Malzeme sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const material = await Material.findByPk(req.params.id);
        if (!material) {
            return res.status(404).json({ message: 'Malzeme bulunamadı' });
        }
        await material.destroy();
        res.json({ message: 'Malzeme silindi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Malzeme hareketlerini getir
router.get('/:id/transactions', auth, async (req, res) => {
    try {
        const transactions = await MaterialTransaction.findAll({
            where: { MaterialId: req.params.id },
            order: [['date', 'DESC']]
        });
        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// İŞLEM EKLE (Giriş/Çıkış)
router.post('/:id/transactions', auth, async (req, res) => {
    try {
        const material = await Material.findByPk(req.params.id);
        if (!material) return res.status(404).json({ message: 'Malzeme bulunamadı' });

        const { quantity, type, description } = req.body;
        const qty = parseFloat(quantity);

        // Stok güncelleme
        if (type === 'GİRİŞ') {
            material.stock_quantity += qty;
        } else if (type === 'ÇIKIŞ') {
            if (material.stock_quantity < qty) {
                return res.status(400).json({ message: 'Yetersiz stok!' });
            }
            material.stock_quantity -= qty;
        }

        await material.save();

        // Transaction kaydı
        const transaction = await MaterialTransaction.create({
            MaterialId: material.id,
            quantity: qty,
            type,
            description,
            userId: req.user.id
        });

        // Audit Log
        await AuditLogger.logMaterial('TRANSACTION', req.user.id, req.user.name || 'Admin', material, req, { type, quantity: qty });

        res.json(transaction);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
