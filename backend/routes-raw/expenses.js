const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');

// GET /api/expenses - Tüm harcamaları listele
router.get('/', auth, async (req, res) => {
    try {
        const selectQuery = `
            SELECT 
                e.*,
                p.id as "project_id",
                p.name as "project_name"
            FROM "Expenses" e
            LEFT JOIN "Projects" p ON e."ProjectId" = p.id
            ORDER BY e."expense_date" DESC
        `;
        
        const result = await query(selectQuery);
        
        const expenses = result.rows.map(row => ({
            id: row.id,
            ProjectId: row.ProjectId,
            category: row.category,
            description: row.description,
            amount: row.amount,
            expense_date: row.expense_date,
            payment_method: row.payment_method,
            receipt_number: row.receipt_number,
            paid_to: row.paid_to,
            approved_by: row.approved_by,
            status: row.status,
            userId: row.userId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            Project: row.project_id ? {
                id: row.project_id,
                name: row.project_name
            } : null
        }));
        
        res.json(expenses);
    } catch (error) {
        console.error('Harcama listeleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// GET /api/expenses/project/:projectId - Projeye ait harcamalar
router.get('/project/:projectId', auth, async (req, res) => {
    try {
        const selectQuery = `
            SELECT * FROM "Expenses"
            WHERE "ProjectId" = $1 AND "userId" = $2
            ORDER BY "expense_date" DESC
        `;
        
        const result = await query(selectQuery, [req.params.projectId, req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Proje harcamaları listeleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// POST /api/expenses - Yeni harcama ekle
router.post('/', auth, async (req, res) => {
    try {
        const { ProjectId, category, description, amount, expense_date, payment_method, receipt_number, paid_to, approved_by, status } = req.body;

        if (!ProjectId || !amount || !expense_date) {
            return res.status(400).json({ message: 'Proje, Tutar ve Tarih zorunludur.' });
        }

        const insertQuery = `
            INSERT INTO "Expenses" 
            ("ProjectId", "category", "description", "amount", "expense_date", "payment_method", "receipt_number", "paid_to", "approved_by", "status", "userId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(insertQuery, [
            ProjectId,
            category || 'Diğer',
            description || '',
            amount,
            expense_date,
            payment_method || 'Nakit',
            receipt_number || null,
            paid_to || null,
            approved_by || null,
            status || 'Beklemede',
            req.user.id
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Harcama ekleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// PUT /api/expenses/:id - Harcama güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { ProjectId, category, description, amount, expense_date, payment_method, receipt_number, paid_to, approved_by, status } = req.body;

        const updateQuery = `
            UPDATE "Expenses" 
            SET "ProjectId" = $1, "category" = $2, "description" = $3, "amount" = $4,
                "expense_date" = $5, "payment_method" = $6, "receipt_number" = $7, "paid_to" = $8, "approved_by" = $9, "status" = $10, "updatedAt" = NOW()
            WHERE "id" = $11 AND "userId" = $12
            RETURNING *
        `;

        const result = await query(updateQuery, [
            ProjectId,
            category,
            description,
            amount,
            expense_date,
            payment_method,
            receipt_number,
            paid_to,
            approved_by,
            status,
            id,
            req.user.id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Harcama bulunamadı' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Harcama güncelleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

// DELETE /api/expenses/:id - Harcama sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const checkResult = await query(
            'SELECT * FROM "Expenses" WHERE "id" = $1 AND "userId" = $2',
            [id, req.user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Harcama bulunamadı' });
        }

        await query('DELETE FROM "Expenses" WHERE "id" = $1', [id]);
        res.json({ message: 'Harcama silindi' });
    } catch (error) {
        console.error('Harcama silme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
});

module.exports = router;
