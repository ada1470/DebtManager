@echo off
cd /d %~dp0
start node server.js
start http://localhost:3000
