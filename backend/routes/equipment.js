const express = require('express');
const router = express.Router();
const { Equipment, Project, ProjectEquipment } = require('../models');
const auth = require('../middleware/auth');
const AuditLogger = require('../utils/auditLogger');

// Tüm ekipmanları getir
router.get('/', auth, async (req, res) => {
    try {
        const equipment = await Equipment.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(equipment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Yeni ekipman ekle
router.post('/', auth, async (req, res) => {
    try {
        const equipment = await Equipment.create({
            ...req.body,
            userId: req.user.id
        });

        // Audit Log
        await AuditLogger.logEquipment('CREATE', req.user.id, req.user.name || 'Admin', equipment, req);

        res.json(equipment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Ekipman güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const equipment = await Equipment.findByPk(req.params.id);
        if (!equipment) {
            return res.status(404).json({ message: 'Ekipman bulunamadı' });
        }
        await equipment.update(req.body);
        res.json(equipment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Ekipman sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const equipment = await Equipment.findByPk(req.params.id);
        if (!equipment) {
            return res.status(404).json({ message: 'Ekipman bulunamadı' });
        }
        await equipment.destroy();
        res.json({ message: 'Ekipman silindi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Belirli bir ekipmanın atandığı projeleri getir
router.get('/:id/projects', auth, async (req, res) => {
    try {
        const equipment = await Equipment.findByPk(req.params.id, {
            include: [{
                model: Project,
                through: { attributes: ['assigned_date', 'quantity', 'notes'] }
            }]
        });
        if (!equipment) {
            return res.status(404).json({ message: 'Ekipman bulunamadı' });
        }
        res.json(equipment.Projects || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Ekipmanı projeye ata
router.post('/:id/assign', auth, async (req, res) => {
    try {
        const { projectId, quantity, notes } = req.body;
        const equipment = await Equipment.findByPk(req.params.id);

        if (!equipment) {
            return res.status(404).json({ message: 'Ekipman bulunamadı' });
        }

        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Proje bulunamadı' });
        }

        // Ekipmanı projeye ata
        await ProjectEquipment.create({
            ProjectId: projectId,
            EquipmentId: equipment.id,
            quantity: quantity || 1,
            notes: notes || '',
            assigned_date: new Date()
        });

        // Ekipmanı kullanımda olarak işaretle
        await equipment.update({ isAvailable: false, location: `Proje: ${project.name}` });

        // Audit Log
        await AuditLogger.logEquipment('ASSIGN', req.user.id, req.user.name || 'Admin', equipment, req, { projectId, projectName: project.name, quantity, notes });

        res.json({ message: 'Ekipman projeye atandı', equipment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
