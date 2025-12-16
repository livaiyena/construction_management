@echo off
TITLE Insaat Yonetim Sistemi - Otomatik Baslatma
color 0A

echo ===================================================
echo      INSAAT YONETIM SISTEMI BASLATILIYOR...
echo ===================================================
echo.

:: --- 0. NPM KONTROLU ---
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo        HATA: Node.js ve NPM yuklu degil!
    echo        Lutfen Node.js yukleyin: https://nodejs.org/
    pause
    exit /b 1
)

:: --- 1. PROJE KONTROLU ---
echo [1/4] Proje yapisi kontrol ediliyor...
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

:: --- 2. BACKEND HAZIRLIK VE BASLATMA ---
echo [2/4] Backend hazirlaniyor...
cd backend

if not exist "node_modules" (
    echo        UYARI: Backend bagimliliklari eksik. Ilk kurulum yapiliyor...
    echo        Lutfen bekleyin, bu islem birkac dakika surebilir.
    call npm install
    if %errorlevel% neq 0 (
        echo        HATA: Backend paketleri yuklenemedi!
        pause
        exit /b 1
    )
    echo        Backend kurulumu tamamlandi.
)

:: Backend'i yeni pencerede baslat
start "Backend API (Port 5000)" cmd /k "npm run dev"
cd ..
timeout /t 2 >nul

:: --- 3. FRONTEND HAZIRLIK VE BASLATMA ---
echo [3/4] Frontend hazirlaniyor...

if not exist "node_modules" (
    echo        UYARI: Frontend bagimliliklari eksik. Ilk kurulum yapiliyor...
    echo        Lutfen bekleyin, bu islem birkac dakika surebilir.
    call npm install
    if %errorlevel% neq 0 (
        echo        HATA: Frontend paketleri yuklenemedi!
        pause
        exit /b 1
    )
    echo        Frontend kurulumu tamamlandi.
)

:: Frontend'i yeni pencerede baslat
start "Frontend UI (Port 5173)" cmd /k "npm run dev"

:: --- 4. TARAYICI VE SONUC ---
echo.
echo [4/4] Sistem baslatiliyor...
echo        Sunucular aciliyor (8 saniye)...
timeout /t 8 >nul

echo        Tarayici aciliyor...
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