@echo off
echo ========================================================
echo   Launching E-Commerce Microservices & Micro-Frontends  
echo ========================================================

echo Starting all services with Docker Compose...
docker compose up -d

echo.
echo Waiting for services to be ready...
timeout /t 3 /nobreak > nul

echo.
echo Launching Application in your default browser...
start http://localhost:4000/

echo.
echo All microservices, micro-frontends, and databases are running!
echo Access the app at: http://localhost:4000/
echo To view container logs: docker compose logs -f
echo To stop the app:        docker compose down
echo.
pause
