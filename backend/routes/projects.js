const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.findAll({
            // userId filtresi kaldırıldı: Herkes tüm projeleri görebilir
            order: [['createdAt', 'DESC']]
        });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const newProject = await Project.create({
            ...req.body,
            userId: req.user.id
        });

        // LOG: Proje oluşturuldu
        await Activity.create({
            content: `Yeni proje başlatıldı: "${newProject.name}" (Bütçe: ₺${newProject.budget})`,
            type: 'success',
            userId: req.user.id
        });

        res.json(newProject);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        // Önce eski halini buluyoruz
        const project = await Project.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!project) {
            return res.status(404).json({ message: 'Proje bulunamadı' });
        }

        // Değişiklikleri tespit etme
        let changes = [];
        const newData = req.body;

        if (newData.name && newData.name !== project.name) {
            changes.push(`İsim: "${project.name}" -> "${newData.name}"`);
        }
        if (newData.status && newData.status !== project.status) {
            changes.push(`Durum: ${project.status} -> ${newData.status}`);
        }
        if (newData.budget && parseFloat(newData.budget) !== project.budget) {
            changes.push(`Bütçe: ₺${project.budget} -> ₺${newData.budget}`);
        }
        if (newData.location && newData.location !== project.location) {
            changes.push(`Konum değişti`);
        }

        // Güncellemeyi yap
        await project.update(newData);

        // Eğer bir değişiklik varsa LOG at
        if (changes.length > 0) {
            await Activity.create({
                content: `Proje güncellendi (${project.name}): ${changes.join(', ')}`,
                type: 'warning', // Turuncu renk
                userId: req.user.id
            });
        }

        res.json(project);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (project) {
            const tempName = project.name; // Silmeden ismini al
            await project.destroy();

            // LOG
            await Activity.create({
                content: `Proje ve verileri silindi: ${tempName}`,
                type: 'danger',
                userId: req.user.id
            });

            res.json({ message: 'Proje silindi' });
        } else {
            res.status(404).json({ message: 'Proje bulunamadı' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;