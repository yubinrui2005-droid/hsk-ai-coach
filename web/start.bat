@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   HSK AI 中文陪练 - 本地启动
echo ============================================
echo.
echo 正在启动本地服务器，浏览器会自动打开：
echo   http://localhost:8123
echo.
echo 关闭此窗口即可停止服务。
echo.

start "" http://localhost:8123

where python >nul 2>nul
if %ERRORLEVEL%==0 (
  python -m http.server 8123
  goto :eof
)

where py >nul 2>nul
if %ERRORLEVEL%==0 (
  py -m http.server 8123
  goto :eof
)

where node >nul 2>nul
if %ERRORLEVEL%==0 (
  npx --yes http-server -p 8123 -c-1
  goto :eof
)

echo 未找到 python 或 node，请手动安装其中一个。
pause
