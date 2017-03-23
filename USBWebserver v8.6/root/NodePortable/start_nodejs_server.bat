cls
@echo off
call config.bat
start node.exe %SERVER_PATH%
start "" %CLIENT_PATH%
start "" %CLIENT_PATH%