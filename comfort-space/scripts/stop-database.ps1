$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$projectHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($projectRoot))).Substring(0, 12)
$asciiRoot = Join-Path ([IO.Path]::GetTempPath()) "qiyu-$projectHash"
if (-not (Test-Path -LiteralPath $asciiRoot)) { throw '本项目的临时路径映射不存在，请先使用启动脚本。' }
if ((Get-Item -LiteralPath $asciiRoot).ResolveLinkTarget($true).FullName -ne $projectRoot) { throw '拒绝使用其他项目的路径映射。' }
$dataPath = Join-Path $asciiRoot '.runtime/postgres-data'
$pgControl = Join-Path $asciiRoot '.tools/postgres/bin/pg_ctl.exe'
& $pgControl -D $dataPath -m fast -w stop
if ($LASTEXITCODE -ne 0) { throw '数据库正常关闭失败，请检查项目数据库状态。' }
