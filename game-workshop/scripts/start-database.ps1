$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$taskHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($taskRoot))).Substring(0,12)
$taskAscii = Join-Path ([IO.Path]::GetTempPath()) "gameworkshop-$taskHash"
if (-not (Test-Path -LiteralPath $taskAscii)) { New-Item -ItemType Junction -Path $taskAscii -Target $taskRoot | Out-Null }
if ((Get-Item -LiteralPath $taskAscii).ResolveLinkTarget($true).FullName -ne $taskRoot) { throw '临时路径映射不属于本项目' }
$taskBin = Join-Path $taskAscii '.tools/postgres/bin'
$taskRuntime = Join-Path $taskAscii '.runtime'
New-Item -ItemType Directory -Force $taskRuntime | Out-Null
$taskConfig = Join-Path $taskRuntime 'db.json'
$taskData = Join-Path $taskRuntime 'postgres-data'
if (-not (Test-Path $taskConfig)) {
 if (Test-Path "$taskData/PG_VERSION") { throw '已有数据库但凭据缺失' }
 @{password=[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))} | ConvertTo-Json | Set-Content $taskConfig
}
$taskPassword = (Get-Content $taskConfig -Raw | ConvertFrom-Json).password
if (-not (Test-Path "$taskData/PG_VERSION")) {
 $taskPasswordFile=Join-Path $taskRuntime 'init-password'
 Set-Content $taskPasswordFile -Value $taskPassword -NoNewline
 & "$taskBin/initdb.exe" -D $taskData -U workshop --encoding=UTF8 --locale=C --auth=scram-sha-256 --pwfile=$taskPasswordFile
 if ($LASTEXITCODE -ne 0) {throw '数据库初始化失败'}
 Remove-Item -LiteralPath $taskPasswordFile
}
& "$taskBin/pg_ctl.exe" -D $taskData status *> $null
if ($LASTEXITCODE -ne 0) {
 & "$taskBin/pg_ctl.exe" -D $taskData -l "$taskRuntime/postgres.log" -o '-h 127.0.0.1 -p 55433' -w start
 if ($LASTEXITCODE -ne 0) { throw '数据库启动失败' }
}
& (Join-Path $taskRoot 'backend/run.ps1') -Tasks @('runMain services.system.CreateDevelopmentDatabase')
Write-Host '本机开发数据库已就绪，端口55433。'
