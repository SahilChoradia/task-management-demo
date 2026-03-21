param(
    [int]$Port = 8000
)

Set-Location $PSScriptRoot
python -m uvicorn app.main:app --reload --port $Port
