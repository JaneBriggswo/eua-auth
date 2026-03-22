@echo off
chcp 65001 >nul
echo ========================================
echo   PREPARAR PARA DISCLOUD
echo ========================================
echo.

echo [1/3] Verificando arquivos necessários...
echo.

if not exist "discloud.config" (
    echo ❌ discloud.config não encontrado!
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ❌ package.json não encontrado!
    pause
    exit /b 1
)

if not exist "server.js" (
    echo ❌ server.js não encontrado!
    pause
    exit /b 1
)

echo ✅ discloud.config
echo ✅ package.json
echo ✅ server.js
echo ✅ Arquivos principais OK!
echo.

echo [2/3] Verificando .env...
if not exist ".env" (
    echo ⚠️  Arquivo .env não encontrado!
    if exist ".env.discloud" (
        echo Copiando .env.discloud para .env...
        copy .env.discloud .env
        echo ✅ .env criado a partir de .env.discloud!
    ) else (
        echo Criando .env padrão...
        (
            echo PORT=80
            echo NODE_ENV=production
            echo JWT_SECRET=TROQUE_ESTA_SENHA_POR_ALGO_ALEATORIO_123456789
            echo ADMIN_USERNAME=admin
            echo ADMIN_PASSWORD=admin123
            echo DB_PATH=./database/phantom.db
        ) > .env
        echo ✅ .env criado!
    )
    echo.
    echo ⚠️  IMPORTANTE: Edite o arquivo .env e troque as senhas!
    echo.
    pause
) else (
    echo ✅ .env encontrado!
    echo.
    echo ⚠️  Lembre-se de trocar as senhas no .env antes do upload!
    echo    - JWT_SECRET
    echo    - ADMIN_PASSWORD
    echo.
)

echo.
echo [3/3] Criando PhantomAuth.zip...
echo.

powershell -Command "Compress-Archive -Path * -DestinationPath ..\PhantomAuth.zip -Force"

if %errorlevel% equ 0 (
    echo ✅ PhantomAuth.zip criado com sucesso!
    echo.
    echo ========================================
    echo   PRÓXIMOS PASSOS:
    echo ========================================
    echo.
    echo 1. O arquivo PhantomAuth.zip está na pasta anterior
    echo 2. Acesse https://discloud.app
    echo 3. Faça login
    echo 4. Clique em "Nova Aplicação"
    echo 5. Arraste o PhantomAuth.zip
    echo 6. Aguarde o upload
    echo 7. Copie a URL gerada
    echo.
    echo 8. Edite: LoaderBaseDX11\includes\login\login_ui.hpp
    echo    Linha 11: PHANTOM_API_URL = "https://sua-url.discloud.app/api"
    echo.
    echo 9. Recompile o loader (Ctrl + Shift + B)
    echo.
    echo 10. Distribua o .exe compilado!
    echo.
    echo ========================================
    echo.
    echo 📖 Leia o guia completo: DISCLOUD_TUTORIAL.md
    echo.
) else (
    echo ❌ Erro ao criar ZIP!
    echo.
    echo Tente manualmente:
    echo 1. Selecione todos os arquivos nesta pasta
    echo 2. Clique direito → Enviar para → Pasta compactada
    echo 3. Renomeie para PhantomAuth.zip
    echo.
)

pause
