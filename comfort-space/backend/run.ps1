param([string[]]$Tasks = @('run'))
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$toolsRoot = Join-Path $projectRoot '.tools'
$jdkRoot = Get-ChildItem -LiteralPath $toolsRoot -Directory -Filter 'jdk-*' | Select-Object -First 1
$javaCommand = if ($jdkRoot) { Join-Path $jdkRoot.FullName 'bin/java.exe' } else { 'java' }
$configPath = Join-Path $projectRoot '.runtime/dev-db.json'
if ((Test-Path $configPath) -and -not $env:QIYU_DB_PASSWORD) {
  $devDatabase = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
  $env:QIYU_DB_PASSWORD = $devDatabase.password
  $env:QIYU_DB_USER = $devDatabase.user
  $env:QIYU_DB_URL = "jdbc:postgresql://127.0.0.1:$($devDatabase.port)/qiyu"
}
$env:COURSIER_CACHE = Join-Path $toolsRoot 'coursier'
Push-Location $PSScriptRoot
try {
  & $javaCommand '-Dsbt.override.build.repos=true' '-Dsbt.repository.config=project/repositories' `
    "-Dsbt.boot.directory=$toolsRoot/sbt-boot" "-Dsbt.global.base=$toolsRoot/sbt-global" "-Dsbt.ivy.home=$toolsRoot/ivy" `
    -jar (Join-Path $toolsRoot 'sbt-launch.jar') @Tasks
  if ($LASTEXITCODE -ne 0) { throw "后端命令失败，退出码 $LASTEXITCODE。" }
} finally { Pop-Location }
