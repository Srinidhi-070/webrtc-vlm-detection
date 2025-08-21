@echo off
REM Benchmark script for WebRTC VLM Detection (Windows)
REM Usage: bench\run_bench.bat --duration 30 --mode server

setlocal enabledelayedexpansion

REM Default values
set DURATION=30
set MODE=server
set PORT=8000

REM Parse arguments
:parse_args
if "%~1"=="" goto start_bench
if "%~1"=="--duration" (
    set DURATION=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--mode" (
    set MODE=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--port" (
    set PORT=%~2
    shift
    shift
    goto parse_args
)
shift
goto parse_args

:start_bench
echo 🚀 Starting WebRTC VLM Detection Benchmark
echo Duration: %DURATION%s ^| Mode: %MODE% ^| Port: %PORT%

REM Check if server is running
curl -s http://localhost:%PORT%/api/metrics >nul 2>&1
if errorlevel 1 (
    echo ❌ Server not running on port %PORT%
    echo Please start the application first:
    echo   docker-compose up --build
    echo   OR start.bat
    exit /b 1
)

REM Reset metrics
echo 📊 Resetting metrics...
curl -s -X POST http://localhost:%PORT%/api/metrics/reset >nul

echo ⏱️  Running benchmark for %DURATION% seconds...
echo 📱 Please use your phone to connect and stream video during this time
echo 🎯 Move colored objects in front of the camera for detection

REM Wait for benchmark duration
timeout /t %DURATION% /nobreak >nul

REM Collect metrics
echo 📈 Collecting metrics...
curl -s http://localhost:%PORT%/api/metrics > metrics.json

REM Display results
echo ✅ Benchmark complete! Results saved to metrics.json
echo.
echo 📊 Results Summary:
echo ==================

REM Basic results display (Windows doesn't have jq by default)
for /f "tokens=2 delims=:" %%a in ('findstr "count_frames" metrics.json') do (
    set frames=%%a
    set frames=!frames:,=!
    echo Frames processed: !frames!
)

for /f "tokens=2 delims=:" %%a in ('findstr "median_e2e_ms" metrics.json') do (
    set latency=%%a
    set latency=!latency:,=!
    echo Median E2E latency: !latency!ms
)

for /f "tokens=2 delims=:" %%a in ('findstr "processed_fps" metrics.json') do (
    set fps=%%a
    set fps=!fps:,=!
    echo Processed FPS: !fps!
)

echo.
echo 📄 Full results available in metrics.json
pause