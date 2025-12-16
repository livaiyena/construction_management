@echo off
TITLE Insaat Yonetim Sistemi - Otomatik Baslatma
color 0A

echo ===================================================
echo      INSAAT YONETIM SISTEMI BASLATILIYOR...
echo ===================================================
echo.

:: --- 1. PROJE KONTROLU ---
echo [1/3] Proje yapisi kontrol ediliyor...
if not exist "backend" (
    echo        HATA: Backend klasoru bulunamadi!
    echo        Lutfen dogru dizinde oldugunuzdan emin olun.
    pause
    exit /b 1
)
if not exist "src" (
    echo        HATA: Frontend klasoru bulunamadi!
    pause
    exit /b 1
)
echo        Proje yapisi tamam.
echo.

:: --- 2. BACKEND BASLATMA ---
echo [2/3] Backend sunucusu baslatiliyor...
start "Backend API (Port 5000)" cmd /k "cd backend && npm run dev"
timeout /t 2 >nul

:: --- 3. FRONTEND BASLATMA ---
echo [3/3] Frontend arayuzu baslatiliyor...
start "Frontend UI (Port 5173)" cmd /k "npm run dev"

:: --- TARAYICI ---
echo.
echo Sunucularin baslamasi bekleniyor (8 saniye)...
timeout /t 8 >nul

echo Tarayici aciliyor...
start http://localhost:5173

echo.
echo ===================================================
echo         SISTEM BASARIYLA BASLATILDI!
echo.
echo   Backend API: http://localhost:5000
echo   Frontend UI: http://localhost:5173
echo.
echo   Pencereleri kapatmayin!
echo ===================================================
echo.
pause