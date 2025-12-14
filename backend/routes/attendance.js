const express = require('express');
const router = express.Router();
const { Attendance, Employee, Project } = require('../models');
const auth = require('../middleware/auth');

// Tüm yoklama kayıtlarını getir
router.get('/', auth, async (req, res) => {
    try {
        const attendances = await Attendance.findAll({
            // userId filtresi kaldırıldı
            include: [
                { model: Employee, attributes: ['id', 'name'] },
                { model: Project, attributes: ['id', 'name'] }
            ],
            order: [['date', 'DESC']]
        });
        res.json(attendances);
    } catch (error) {
        console.error('Attendance fetch error:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Belirli bir proje için yoklama kayıtlarını getir
router.get('/project/:projectId', auth, async (req, res) => {
    try {
        const attendances = await Attendance.findAll({
            where: {
                ProjectId: req.params.projectId,
                userId: req.user.id
            },
            include: [
                { model: Employee, attributes: ['id', 'name'] }
            ],
            order: [['date', 'DESC']]
        });
        res.json(attendances);
    } catch (error) {
        console.error('Project attendance fetch error:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Yeni yoklama kaydı oluştur
router.post('/', auth, async (req, res) => {
    try {
        const { EmployeeId, ProjectId, date, status, worked_hours, overtime_hours, notes } = req.body;

        if (!EmployeeId || !ProjectId || !date) {
            return res.status(400).json({ message: 'Çalışan, Proje ve Tarih zorunludur.' });
        }

        const attendance = await Attendance.create({
            EmployeeId,
            ProjectId,
            date,
            status: status || 'Geldi',
            worked_hours: worked_hours || 8.0,
            overtime_hours: overtime_hours || 0,
            notes,
            userId: req.user.id
        });

        const attendanceWithDetails = await Attendance.findByPk(attendance.id, {
            include: [
                { model: Employee, attributes: ['id', 'name'] },
                { model: Project, attributes: ['id', 'name'] }
            ]
        });

        res.status(201).json(attendanceWithDetails);
    } catch (error) {
        console.error('Attendance create error:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Yoklama kaydını güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { status, worked_hours, overtime_hours, notes } = req.body;

        const attendance = await Attendance.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!attendance) {
            return res.status(404).json({ message: 'Yoklama kaydı bulunamadı.' });
        }

        await attendance.update({
            status: status || attendance.status,
            worked_hours: worked_hours !== undefined ? worked_hours : attendance.worked_hours,
            overtime_hours: overtime_hours !== undefined ? overtime_hours : attendance.overtime_hours,
            notes: notes !== undefined ? notes : attendance.notes
        });

        const updatedAttendance = await Attendance.findByPk(attendance.id, {
            include: [
                { model: Employee, attributes: ['id', 'name'] },
                { model: Project, attributes: ['id', 'name'] }
            ]
        });

        res.json(updatedAttendance);
    } catch (error) {
        console.error('Attendance update error:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Yoklama kaydını sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const attendance = await Attendance.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!attendance) {
            return res.status(404).json({ message: 'Yoklama kaydı bulunamadı.' });
        }

        await attendance.destroy();
        res.json({ message: 'Yoklama kaydı silindi.' });
    } catch (error) {
        console.error('Attendance delete error:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

module.exports = router;
