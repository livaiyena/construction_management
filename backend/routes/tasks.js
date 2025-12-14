const express = require('express');
const router = express.Router();
const { ProjectTask, Project } = require('../models');
const auth = require('../middleware/auth');

// Görevleri getir
router.get('/', auth, async (req, res) => {
    try {
        const { projectId } = req.query;
        const where = {};
        if (projectId) where.ProjectId = projectId;

        const tasks = await ProjectTask.findAll({
            where,
            include: [{ model: Project, attributes: ['name'] }],
            order: [['start_date', 'ASC']]
        });
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Görev oluştur
router.post('/', auth, async (req, res) => {
    try {
        const task = await ProjectTask.create({
            ...req.body,
            userId: req.user.id
        });
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Görev güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const task = await ProjectTask.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: 'Görev bulunamadı' });

        await task.update(req.body);
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Görev sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await ProjectTask.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: 'Görev bulunamadı' });

        await task.destroy();
        res.json({ message: 'Silindi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
