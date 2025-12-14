const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const Role = require('../models/Role');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const employees = await Employee.findAll({
            // userId filtresi kaldırıldı
            include: [
                { model: Project, attributes: ['id', 'name', 'city', 'district'] },
                { model: Role, attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(employees);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const newEmployee = await Employee.create({
            ...req.body,
            userId: req.user.id
        });

        await Activity.create({
            content: `Yeni personel eklendi: ${newEmployee.name}`,
            type: 'success',
            userId: req.user.id
        });

        res.json(newEmployee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const employee = await Employee.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!employee) {
            return res.status(404).json({ message: 'Çalışan bulunamadı' });
        }

        // Değişiklikleri yakala
        let changes = [];
        const newData = req.body;

        if (newData.name && newData.name !== employee.name) {
            changes.push(`İsim: ${employee.name} -> ${newData.name}`);
        }
        if (newData.daily_rate && parseFloat(newData.daily_rate) !== employee.daily_rate) {
            changes.push(`Ücret: ₺${employee.daily_rate} -> ₺${newData.daily_rate}`);
        }

        if (newData.RoleId && parseInt(newData.RoleId) !== employee.RoleId) {
            changes.push(`Görev (Rol) değiştirildi`);
        }
        if (newData.ProjectId !== undefined && newData.ProjectId !== employee.ProjectId) {
            // Null kontrolü de yapalım
            const oldPid = employee.ProjectId;
            const newPid = newData.ProjectId;
            if (oldPid != newPid) changes.push(`Proje ataması değiştirildi`);
        }

        await employee.update(newData);

        // Değişiklik varsa kaydet
        if (changes.length > 0) {
            await Activity.create({
                content: `Personel güncellendi (${employee.name}): ${changes.join(', ')}`,
                type: 'warning',
                userId: req.user.id
            });
        }

        res.json(employee);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const employee = await Employee.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (employee) {
            const tempName = employee.name;
            await employee.destroy();

            await Activity.create({
                content: `Personel kaydı silindi: ${tempName}`,
                type: 'danger',
                userId: req.user.id
            });

            res.json({ message: 'Çalışan silindi' });
        } else {
            res.status(404).json({ message: 'Çalışan bulunamadı' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;