const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Setting = require('../models/Setting');
const SecurityLog = require('../models/SecurityLog');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
        }

        // Kayıt olma ayarını kontrol et
        const setting = await Setting.findOne({ where: { key: 'registration_enabled' } });
        // Eğer ayar varsa ve 'false' ise, kayıt işlemini engelle
        // Not: String olarak saklandığı için 'false' kontrolü yapıyoruz.
        if (setting && setting.value === 'false') {
            return res.status(403).json({ message: 'Yeni üye kaydı yönetici tarafından kapatılmıştır.' });
        }

        // E-posta kontrolü
        let user = await User.findOne({ where: { email: email } });
        if (user) {
            return res.status(400).json({ message: 'Bu e-posta zaten kullanımda.' });
        }

        // Şifreleme
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Kullanıcıyı direkt oluştur (Doğrulanmış olarak)
        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            isVerified: true // Direkt onaylı
        });

        res.json({ success: true, message: 'Kayıt başarılı! Giriş yapabilirsiniz.' });

    } catch (err) {
        console.error("Register Hatası:", err);
        res.status(500).json({ message: 'Sunucu Hatası', error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ where: { email: email } });

        if (!user) {
            return res.status(400).json({ message: 'Geçersiz e-posta veya şifre.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Geçersiz e-posta veya şifre.' });
        }


        const payload = { user: { id: user.id, role: user.role } };

        // Güvenlik Logu Kaydet
        try {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            await SecurityLog.create({
                userId: user.id,
                userName: user.name,
                action: 'Giriş Başarılı',
                ipAddress: ip,
                details: `${user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'} girişi yapıldı.`
            });
        } catch (logError) {
            console.error("Güvenlik logu oluşturulamadı:", logError);
            // Log hatası login işlemini durdurmamalı
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({
                success: true,
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        });

    } catch (err) {
        console.error("Login Hatası:", err.message);
        res.status(500).send('Sunucu hatası');
    }
});

router.post('/reset-password-direct', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        // Yeni şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Güncelle
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'İşlem başarısız.' });
    }
});

module.exports = router;