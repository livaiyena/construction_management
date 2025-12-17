// routes-raw/auth.js - Authentication with Raw SQL
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db-raw');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Tüm alanlar gereklidir' });
        }

        // Check if user exists
        const checkQuery = 'SELECT * FROM "Users" WHERE "email" = $1';
        const existingUser = await query(checkQuery, [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Bu email zaten kayıtlı' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const insertQuery = `
            INSERT INTO "Users" ("name", "email", "password", "role", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING "id", "name", "email", "role", "createdAt"
        `;
        
        const result = await query(insertQuery, [name, email, hashedPassword, 'admin']);
        const newUser = result.rows[0];

        // Create token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, name: newUser.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Kayıt başarılı',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Kayıt sırasında hata oluştu', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email ve şifre gereklidir' });
        }

        // Find user
        const findQuery = 'SELECT * FROM "Users" WHERE "email" = $1';
        const result = await query(findQuery, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Email veya şifre hatalı' });
        }

        const user = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email veya şifre hatalı' });
        }

        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Log login
        const logQuery = `
            INSERT INTO "AuditLogs" ("userId", "userName", "action", "tableName", "timestamp", "createdAt")
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        await query(logQuery, [user.id, user.name, 'LOGIN', 'Users']);

        res.json({
            message: 'Giriş başarılı',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Giriş sırasında hata oluştu', error: error.message });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token bulunamadı' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const findQuery = 'SELECT "id", "name", "email", "role", "createdAt" FROM "Users" WHERE "id" = $1';
        const result = await query(findQuery, [decoded.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ message: 'Geçersiz token' });
    }
});

// Reset Password (Direct)
router.post('/reset-password-direct', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email ve yeni şifre gereklidir' });
        }

        // Find user
        const findQuery = 'SELECT * FROM "Users" WHERE "email" = $1';
        const result = await query(findQuery, [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        const user = result.rows[0];

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        const updateQuery = 'UPDATE "Users" SET "password" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2';
        await query(updateQuery, [hashedPassword, user.id]);

        res.json({ message: 'Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Şifre sıfırlama başarısız', error: error.message });
    }
});

module.exports = router;
