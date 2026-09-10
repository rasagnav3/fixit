@echo off
echo ===================================================
echo   FixIt Campus - Pushing code to GitHub
echo   Target: https://github.com/rasagnav3/fixit
echo ===================================================
echo.

cd /d "c:\Users\rasag\OneDrive\Documents\FixIt-Campus"

:: Find Git executable
set "GIT_CMD=git"
if exist "C:\Program Files\Git\cmd\git.exe" (
    set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"
) else if exist "C:\Program Files\Git\bin\git.exe" (
    set "GIT_CMD=C:\Program Files\Git\bin\git.exe"
)

echo Using Git: "%GIT_CMD%"

:: Set default user name / email if not configured so commit succeeds
"%GIT_CMD%" config user.name >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    "%GIT_CMD%" config --global user.name "rasagnav3"
    "%GIT_CMD%" config --global user.email "rasagnav3@users.noreply.github.com"
)

:: Initialize git repository if not present
if not exist ".git" (
    echo Initializing local Git repository...
    "%GIT_CMD%" init
)

:: Ensure on main branch
"%GIT_CMD%" checkout -B main

:: Add files
echo Staging all files...
"%GIT_CMD%" add .

:: Commit
echo Committing files...
"%GIT_CMD%" commit -m "feat: complete FixIt Campus SDG 6 platform with Vite, React, Supabase and standalone app"

:: Set remote origin
"%GIT_CMD%" remote remove origin 2>nul
"%GIT_CMD%" remote add origin https://github.com/rasagnav3/fixit.git

echo.
echo Pushing to GitHub (https://github.com/rasagnav3/fixit)...
echo (If a browser window or GitHub Credential Manager pop-up appears, please click to authorize)
"%GIT_CMD%" push -u origin main --force

echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo [SUCCESS] Your repository is now updated with all files!
    echo Visit: https://github.com/rasagnav3/fixit
    echo ===================================================
) else (
    echo ===================================================
    echo [NOTE] If push requires login, complete the GitHub sign-in prompt.
    echo ===================================================
)

echo.
pause
