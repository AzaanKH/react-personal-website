@echo off
echo Starting development server on port 3000...
cd /d "%~dp0"
npm run dev -- --port 3000 --host