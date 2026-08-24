@echo off
echo Installing MMAction2 Suite...
call venv_mmaction\Scripts\activate.bat
mim install mmengine
mim install "mmcv>=2.0.0"
mim install mmaction2
echo Done!
pause
