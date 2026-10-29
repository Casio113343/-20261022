$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$projectHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($projectRoot))).Substring(0, 12)
$asciiRoot = Join-Path ([IO.Path]::GetTempPath()) "qiyu-$projectHash"
if (-not (Test-Path -LiteralPath $asciiRoot)) {
  New-Item -ItemType Junction -Path $asciiRoot -Target $projectRoot | Out-Null
}
$linkedRoot = (Get-Item -LiteralPath $asciiRoot).ResolveLinkTarget($true).FullName
if ($linkedRoot -ne $projectRoot) { throw '临时路径映射不属于本项目，拒绝使用。' }
# PostgreSQL Windows 原生工具在中文安装路径下可能错误转换路径。
$projectRoot = $asciiRoot
$runtimeRoot = Join-Path $projectRoot '.runtime'
$postgresBin = Join-Path $projectRoot '.tools/postgres/bin'
if (-not (Test-Path (Join-Path $postgresBin 'pg_ctl.exe'))) {
  throw '请先按 backend/README.md 准备 PostgreSQL，或使用已有数据库。'
}
New-Item -ItemType Directory -Force $runtimeRoot | Out-Null
$configPath = Join-Path $runtimeRoot 'dev-db.json'
if (-not (Test-Path $configPath)) {
  if (Test-Path (Join-Path $runtimeRoot 'postgres-data/PG_VERSION')) { throw '数据库已存在但本机凭据文件缺失，请恢复 dev-db.json，不能重新生成密码覆盖。' }
  $randomBytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
  @{ user = 'qiyu'; password = [Convert]::ToBase64String($randomBytes); port = 55432 } |
    ConvertTo-Json | Set-Content -LiteralPath $configPath
}
$dbConfig = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
$dataPath = Join-Path $runtimeRoot 'postgres-data'
$passwordPath = Join-Path $runtimeRoot 'init-password'
$initializedNow = $false
if (-not (Test-Path (Join-Path $dataPath 'PG_VERSION'))) {
  Set-Content -LiteralPath $passwordPath -Value $dbConfig.password -NoNewline
  & (Join-Path $postgresBin 'initdb.exe') -D $dataPath -U $dbConfig.user --encoding=UTF8 --locale=C --auth=scram-sha-256 --pwfile=$passwordPath
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL 初始化失败。' }
  Remove-Item -LiteralPath $passwordPath
  $initializedNow = $true
}
& (Join-Path $postgresBin 'pg_ctl.exe') -D $dataPath status *> $null
if ($LASTEXITCODE -ne 0) {
  & (Join-Path $postgresBin 'pg_ctl.exe') -D $dataPath -l (Join-Path $runtimeRoot 'postgres.log') -o "-h 127.0.0.1 -p $($dbConfig.port)" -w start
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL 启动失败。' }
}
$readyPath = Join-Path $runtimeRoot 'database-ready'
if ($initializedNow -or -not (Test-Path $readyPath)) {
  & (Join-Path $PSScriptRoot '../backend/run.ps1') -Tasks @('runMain services.system.CreateDevelopmentDatabase')
  Set-Content -LiteralPath $readyPath -Value 'qiyu'
}
Write-Host "本机 PostgreSQL 已就绪，端口 $($dbConfig.port)。凭据仅保存在忽略的 .runtime 目录。"
