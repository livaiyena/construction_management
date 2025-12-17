const express = require('express');
const router = express.Router();
const { query } = require('../config/db-raw');
const auth = require('../middleware/auth');

// GET /api/documents - Dökümanları listele
router.get('/', auth, async (req, res) => {
    try {
        const { projectId } = req.query;
        
        let selectQuery = `
            SELECT 
                d.*,
                p.id as "project_id",
                p.name as "project_name",
                u.id as "uploader_id",
                u.name as "uploader_name"
            FROM "Documents" d
            LEFT JOIN "Projects" p ON d."ProjectId" = p.id
            LEFT JOIN "Users" u ON d."uploaded_by" = u.id
        `;
        
        const params = [];
        if (projectId) {
            selectQuery += ' WHERE d."ProjectId" = $1';
            params.push(projectId);
        }
        
        selectQuery += ' ORDER BY d."upload_date" DESC';
        
        const result = await query(selectQuery, params);
        
        const documents = result.rows.map(row => ({
            id: row.id,
            ProjectId: row.ProjectId,
            title: row.title,
            file_path: row.file_path,
            file_type: row.file_type,
            upload_date: row.upload_date,
            uploaded_by: row.uploaded_by,
            description: row.description,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            Project: row.project_id ? {
                name: row.project_name
            } : null,
            uploader: row.uploader_id ? {
                name: row.uploader_name
            } : null
        }));
        
        res.json(documents);
    } catch (err) {
        console.error('Döküman listeleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// POST /api/documents - Yeni döküman ekle
router.post('/', auth, async (req, res) => {
    try {
        const { ProjectId, title, file_path, file_type, upload_date, description } = req.body;
        
        const insertQuery = `
            INSERT INTO "Documents" 
            ("ProjectId", "title", "file_path", "file_type", "upload_date", "uploaded_by", "description", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(insertQuery, [
            ProjectId || null,
            title,
            file_path || null,
            file_type || 'pdf',
            upload_date || new Date(),
            req.user.id,
            description || null
        ]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Döküman ekleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// PUT /api/documents/:id - Döküman güncelle
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, file_path, file_type, description, ProjectId } = req.body;

        const updateQuery = `
            UPDATE "Documents" 
            SET "title" = $1, "file_path" = $2, "file_type" = $3, "description" = $4, "ProjectId" = $5, "updatedAt" = NOW()
            WHERE "id" = $6
            RETURNING *
        `;

        const result = await query(updateQuery, [title, file_path, file_type, description, ProjectId, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Döküman bulunamadı' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Döküman güncelleme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// DELETE /api/documents/:id - Döküman sil
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const checkResult = await query('SELECT * FROM "Documents" WHERE "id" = $1', [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Döküman bulunamadı' });
        }

        await query('DELETE FROM "Documents" WHERE "id" = $1', [id]);
        res.json({ message: 'Silindi' });
    } catch (err) {
        console.error('Döküman silme hatası:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;
