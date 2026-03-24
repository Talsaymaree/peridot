@echo off
setlocal EnableDelayedExpansion

for /f %%i in ('C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set TS=%%i

if not exist backups mkdir backups

set DEST=backups\pre-expo-!TS!
mkdir "!DEST!" >nul

C:\Windows\System32\robocopy.exe . "!DEST!" /E /XD backups /NFL /NDL /NJH /NJS /NP /R:1 /W:1 >nul
set RC=!ERRORLEVEL!

if !RC! GEQ 8 exit /b !RC!

echo !DEST!
