@echo off
REM Build script for IslamicAI frontend
REM This script ensures we use npm for building to avoid lockfile conflicts

echo Building IslamicAI frontend with npm...
npm ci
npm run build
echo Build completed successfully!