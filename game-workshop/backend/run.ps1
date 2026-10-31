param([string[]]$Tasks = @('run'))
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$jdk = Get-ChildItem (Join-Path $taskRoot '.tools') -Directory -Filter 'jdk-*' | Select-Object -First 1
if (-not $jdk) { throw '请先运行 scripts/setup-tools.ps1' }
$env:JAVA_HOME = $jdk.FullName
$env:COURSIER_CACHE = Join-Path $taskRoot '.tools/coursier'
$env:DATABASE_URL = 'jdbc:postgresql://127.0.0.1:55433/workshop'
$env:DATABASE_USER = 'workshop'
$config = Join-Path $taskRoot '.runtime/db.json'
if (Test-Path $config) { $env:DATABASE_PASSWORD = (Get-Content $config -Raw | ConvertFrom-Json).password }
Push-Location $PSScriptRoot
try {
 & (Join-Path $jdk.FullName 'bin/java.exe') '-Dfile.encoding=UTF-8' "-Dsbt.boot.directory=$taskRoot/.tools/sbt-boot" "-Dsbt.global.base=$taskRoot/.tools/sbt-global" '-Dsbt.override.build.repos=true' "-Dsbt.repository.config=$PSScriptRoot/project/repositories" -jar (Join-Path $taskRoot '.tools/sbt-launch.jar') @Tasks
 if ($LASTEXITCODE -ne 0) { throw '后端命令失败' }
} finally { Pop-Location }
