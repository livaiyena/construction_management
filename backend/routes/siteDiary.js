const express = require('express');
const router = express.Router();
const { SiteDiary, Project } = require('../models');
const auth = require('../middleware/auth');

// Tüm günlükleri getir (Filtreleme ile)
router.get('/', auth, async (req, res) => {
    try {
        const { projectId, date } = req.query;
        const where = {};
        if (projectId) where.ProjectId = projectId;
        if (date) where.date = date;

        const diaries = await SiteDiary.findAll({
            where,
            include: [{ model: Project, attributes: ['name'] }],
            order: [['date', 'DESC']]
        });
        res.json(diaries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Yeni günlük oluştur
router.post('/', auth, async (req, res) => {
    try {
        const { ProjectId, date, weather_condition, temperature, worker_count, work_summary, notes } = req.body;

        const diary = await SiteDiary.create({
            ProjectId,
            date,
            weather_condition,
            temperature,
            worker_count,
            work_summary,
            notes,
            userId: req.user.id
        });

        res.json(diary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const diary = await SiteDiary.findByPk(req.params.id);
        if (!diary) return res.status(404).json({ message: 'Günlük bulunamadı' });

        await diary.update(req.body);
        res.json(diary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const diary = await SiteDiary.findByPk(req.params.id);
        if (!diary) return res.status(404).json({ message: 'Günlük bulunamadı' });

        await diary.destroy();
        res.json({ message: 'Silindi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
