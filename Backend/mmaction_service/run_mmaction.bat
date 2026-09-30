@echo off
echo Starting MMAction2 Service...
call venv_mmaction\Scripts\activate.bat
python app.py
pause
