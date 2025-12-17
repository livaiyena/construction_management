-- İlk Admin Kullanıcısı Oluşturma
-- Kullanıcı Adı: admin@admin.com
-- Şifre: admin123
-- Şifre bcrypt hash (10 salt rounds): $2a$10$rHqHZ8VqZ8VqZ8VqZ8VqZe

-- Admin kullanıcısı ekle
INSERT INTO "Users" ("name", "email", "password", "role", "createdAt", "updatedAt")
VALUES (
    'Admin User',
    'admin@insaat.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Şifre: admin123
    'admin',
    NOW(),
    NOW()
);

-- Test kullanıcısı ekle (opsiyonel)
INSERT INTO "Users" ("name", "email", "password", "role", "createdAt", "updatedAt")
VALUES (
    'Test User',
    'test@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Şifre: admin123
    'admin',
    NOW(),
    NOW()
);

-- Kullanıcıları kontrol et
SELECT "id", "name", "email", "role", "createdAt" FROM "Users";
