const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token yok, yetkisiz erişim.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Token direkt { id, email, name } içeriyor, user objesi içinde değil
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token geçersiz.' });
    }
};