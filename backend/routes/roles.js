const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const auth = require('../middleware/auth');

// Rolleri Getir
router.get('/', auth, async (req, res) => {
    try {
        const roles = await Role.findAll({});
        res.json(roles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Yeni Rol Ekle
router.post('/', auth, async (req, res) => {
    try {
        const newRole = await Role.create({
            ...req.body,
            userId: req.user.id
        });
        res.json(newRole);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;