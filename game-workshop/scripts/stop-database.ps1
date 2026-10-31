$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$taskHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($taskRoot))).Substring(0,12)
$taskAscii = Join-Path ([IO.Path]::GetTempPath()) "gameworkshop-$taskHash"
if (-not (Test-Path $taskAscii)) { Write-Host '没有本项目数据库的临时路径映射。'; exit 0 }
if ((Get-Item -LiteralPath $taskAscii).ResolveLinkTarget($true).FullName -ne $taskRoot) { throw '路径映射不属于本项目' }
& (Join-Path $taskAscii '.tools/postgres/bin/pg_ctl.exe') -D (Join-Path $taskAscii '.runtime/postgres-data') -m fast -w stop
if ($LASTEXITCODE -ne 0) { throw '数据库停止失败，请检查状态' }
