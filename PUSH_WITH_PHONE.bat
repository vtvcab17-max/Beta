@echo off
title Xac thuc GitHub bang dien thoai
cd /d "C:\Users\Admin\Documents\Bravinall\repos\Beta"
cls
echo ===============================================================
echo     XAC THUC GITHUB TREN DIEN THOAI (DEVICE CODE)
echo ===============================================================
echo.
echo Hay nhap ma 8 ky tu ben duoi vao dien thoai tai:
echo https://github.com/login/device
echo.
echo ===============================================================
"C:\Program Files\Git\mingw64\bin\git-credential-manager.exe" github login --username vtvcab17-max --device
echo.
echo ===============================================================
echo     DANG DAY TOAN BO MA NGUON LEN GITHUB (vtvcab17-max/Beta)...
echo ===============================================================
git push -u origin main
echo.
echo ===============================================================
echo HOAN TAT! Ma nguon da duoc day len GitHub thanh cong.
pause
