const express = require('express');
const router = express.Router();
const MaterialCategory = require('../models/MaterialCategory');
const auth = require('../middleware/auth');

// Kategorileri Getir
router.get('/', auth, async (req, res) => {
    try {
        const categories = await MaterialCategory.findAll({
            order: [['name', 'ASC']]
        });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Yeni Kategori Ekle
router.post('/', auth, async (req, res) => {
    try {
        const newCategory = await MaterialCategory.create({
            ...req.body,
            userId: req.user.id
        });
        res.json(newCategory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Kategori Sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const category = await MaterialCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Kategori bulunamadı' });

        await category.destroy();
        res.json({ message: 'Kategori silindi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
