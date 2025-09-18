param(
  [int]$Port = 5173
)

$ErrorActionPreference = 'Stop'
if ($PSScriptRoot) {
  $here = $PSScriptRoot
}
else {
  $here = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
}
Set-Location -LiteralPath $here

Write-Host "Servis başlatılıyor: http://localhost:$Port/" -ForegroundColor Cyan

function Start-Server {
  if (Get-Command py -ErrorAction SilentlyContinue) {
    Start-Process -WindowStyle Hidden -FilePath "py" -ArgumentList "-m","http.server",$Port -WorkingDirectory $here
    return
  }
  elseif (Get-Command python -ErrorAction SilentlyContinue) {
    Start-Process -WindowStyle Hidden -FilePath "python" -ArgumentList "-m","http.server",$Port -WorkingDirectory $here
    return
  }
  else {
    Write-Warning "Python bulunamadı. Dosyayı doğrudan açıyorum."
    Start-Process -FilePath (Join-Path -Path $here -ChildPath 'index.html')
  }
}

Start-Server
Start-Sleep -Milliseconds 600
Start-Process "http://localhost:$Port/"


