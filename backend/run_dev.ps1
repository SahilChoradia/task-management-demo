# Start API on 127.0.0.1 (avoids some Windows bind issues).
# If port 8000 fails with WinError 10013, use: .\run_dev.ps1 -Port 8080
# Then set frontend: NEXT_PUBLIC_API_URL=http://127.0.0.1:8080 in frontend/.env.local

param(
    [int]$Port = 8000
)

Set-Location $PSScriptRoot
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port $Port
