const express = require('express');
const router = express.Router();
const { Expense, Project } = require('../models');
const auth = require('../middleware/auth');

// Tüm harcamaları getir
router.get('/', auth, async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            // userId filtresi kaldırıldı
            include: [
                { model: Project, attributes: ['id', 'name'] }
            ],
            order: [['expense_date', 'DESC']]
        });
        res.json(expenses);
    } catch (error) {
        console.error('Expenses fetch error:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Belirli bir projeye ait harcamaları getir
router.get('/project/:projectId', auth, async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            where: {
                ProjectId: req.params.projectId,
                userId: req.user.id
            },
            order: [['expense_date', 'DESC']]
        });
        res.json(expenses);
    } catch (error) {
        console.error('Project expenses fetch error:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Yeni harcama oluştur
router.post('/', auth, async (req, res) => {
    try {
        const {
            ProjectId,
            category,
            description,
            amount,
            expense_date,
            payment_method,
            receipt_number,
            paid_to,
            approved_by,
            status
        } = req.body;

        if (!ProjectId || !category || !description || !amount) {
            return res.status(400).json({ message: 'Proje, Kategori, Açıklama ve Tutar zorunludur.' });
        }

        const expense = await Expense.create({
            ProjectId,
            category,
            description,
            amount,
            expense_date: expense_date || new Date(),
            payment_method,
            receipt_number,
            paid_to,
            approved_by,
            status: status || 'Beklemede',
            userId: req.user.id
        });

        const expenseWithProject = await Expense.findByPk(expense.id, {
            include: [{ model: Project, attributes: ['id', 'name'] }]
        });

        res.status(201).json(expenseWithProject);
    } catch (error) {
        console.error('Expense create error:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Harcamayı güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!expense) {
            return res.status(404).json({ message: 'Harcama bulunamadı.' });
        }

        await expense.update(req.body);

        const updatedExpense = await Expense.findByPk(expense.id, {
            include: [{ model: Project, attributes: ['id', 'name'] }]
        });

        res.json(updatedExpense);
    } catch (error) {
        console.error('Expense update error:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Harcamayı sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!expense) {
            return res.status(404).json({ message: 'Harcama bulunamadı.' });
        }

        await expense.destroy();
        res.json({ message: 'Harcama silindi.' });
    } catch (error) {
        console.error('Expense delete error:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// Kategoriye göre toplam harcama
router.get('/summary/by-category', auth, async (req, res) => {
    try {
        const { sequelize } = require('../config/db');

        const summary = await Expense.findAll({
            where: { userId: req.user.id },
            attributes: [
                'category',
                [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['category'],
            raw: true
        });

        res.json(summary);
    } catch (error) {
        console.error('Expense summary error:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

module.exports = router;
