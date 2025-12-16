const express = require('express');
const router = express.Router();
const EquipmentType = require('../models/EquipmentType');
const auth = require('../middleware/auth');

// Türleri Getir
router.get('/', auth, async (req, res) => {
    try {
        const types = await EquipmentType.findAll({
            order: [['name', 'ASC']]
        });
        res.json(types);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Yeni Tür Ekle
router.post('/', auth, async (req, res) => {
    try {
        const newType = await EquipmentType.create({
            ...req.body,
            userId: req.user.id
        });
        res.json(newType);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Tür Sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const type = await EquipmentType.findByPk(req.params.id);
        if (!type) return res.status(404).json({ message: 'Tür bulunamadı' });

        await type.destroy();
        res.json({ message: 'Tür silindi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
