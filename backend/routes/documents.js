const express = require('express');
const router = express.Router();
const { Document, Project, User } = require('../models');
const auth = require('../middleware/auth');

// Dökümanları getir
router.get('/', auth, async (req, res) => {
    try {
        const { projectId } = req.query;
        const where = {};
        if (projectId) where.ProjectId = projectId;

        const docs = await Document.findAll({
            where,
            include: [
                { model: Project, attributes: ['name'] },
                { model: User, as: 'uploader', attributes: ['name'] }
            ],
            order: [['upload_date', 'DESC']]
        });
        res.json(docs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Döküman "yükle" (Sadece veritabanı kaydı oluşturur, dosya upload simülasyonu)
router.post('/', auth, async (req, res) => {
    try {
        const doc = await Document.create({
            ...req.body,
            uploaded_by: req.user.id
        });
        res.json(doc);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findByPk(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Döküman bulunamadı' });

        await doc.destroy();
        res.json({ message: 'Silindi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
