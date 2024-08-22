@echo off

set "FOLDER=%1"
set "FILE=%2"
set "REMOTE_PATH=C:\test\"
set "REMOTE_IP=%3"

IF NOT EXIST "%REMOTE_PATH%" (
    mkdir "%REMOTE_PATH%"
)

if "%FOLDER%"=="" goto error
if "%FILE%"=="" goto error
if "%REMOTE_IP%"=="" goto error

(echo powershell.exe -Command "cd %REMOTE_PATH% ; ./CodeDemo_RTX.rtss" & echo PAUSE)>./execute_RTSS.bat

scp -r %FOLDER%\projectDiscription Administrator@"%REMOTE_IP%":"%REMOTE_PATH%"
scp %FOLDER%\x64\RtssRelease\%FILE% Administrator@"%REMOTE_IP%":"%REMOTE_PATH%"
scp %FOLDER%\CodeDemo_RTX\infra\RFM2g\RTX\rmn_dll.rtdll Administrator@"%REMOTE_IP%":"%REMOTE_PATH%"
scp ./execute_RTSS.bat Administrator@"%REMOTE_IP%":"%REMOTE_PATH%"

ssh Administrator@%REMOTE_IP% %REMOTE_PATH%execute_RTSS.bat

goto end

:error
echo Please provide two file paths as arguments.
pause
:end

PAUSE