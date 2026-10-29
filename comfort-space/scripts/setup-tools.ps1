$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$toolsRoot = Join-Path $projectRoot '.tools'
New-Item -ItemType Directory -Force $toolsRoot | Out-Null

function Get-VerifiedArtifact([string]$Url, [string]$Path, [string]$Checksum, [string]$Algorithm = 'SHA256') {
  if (Test-Path -LiteralPath $Path) {
    if ((Get-FileHash -LiteralPath $Path -Algorithm $Algorithm).Hash -ieq $Checksum) { return }
  }
  Invoke-WebRequest -Uri $Url -OutFile $Path
  if ((Get-FileHash -LiteralPath $Path -Algorithm $Algorithm).Hash -ine $Checksum) {
    throw "依赖校验失败：$([IO.Path]::GetFileName($Path))"
  }
}

if (-not (Get-ChildItem -LiteralPath $toolsRoot -Directory -Filter 'jdk-*')) {
  $assets = Invoke-RestMethod 'https://api.adoptium.net/v3/assets/latest/21/hotspot?architecture=x64&image_type=jdk&os=windows'
  $package = $assets[0].binary.package
  Get-VerifiedArtifact $package.link (Join-Path $toolsRoot 'jdk.zip') $package.checksum
  Expand-Archive -LiteralPath (Join-Path $toolsRoot 'jdk.zip') -DestinationPath $toolsRoot -Force
}
$sbtUrl = 'https://repo.maven.apache.org/maven2/org/scala-sbt/sbt-launch/1.10.7/sbt-launch-1.10.7.jar'
$sbtChecksum = (Invoke-RestMethod "$sbtUrl.sha1").Trim().Split(' ')[0]
Get-VerifiedArtifact $sbtUrl (Join-Path $toolsRoot 'sbt-launch.jar') $sbtChecksum 'SHA1'
$postgresUrl = 'https://repo.maven.apache.org/maven2/io/zonky/test/postgres/embedded-postgres-binaries-windows-amd64/16.4.0/embedded-postgres-binaries-windows-amd64-16.4.0.jar'
$postgresChecksum = (Invoke-RestMethod "$postgresUrl.sha1").Trim().Split(' ')[0]
$postgresJar = Join-Path $toolsRoot 'postgres.jar'
Get-VerifiedArtifact $postgresUrl $postgresJar $postgresChecksum 'SHA1'
if (-not (Test-Path (Join-Path $toolsRoot 'postgres/bin/postgres.exe'))) {
  $archive = [IO.Compression.ZipFile]::OpenRead($postgresJar)
  try {
    $entry = $archive.GetEntry('postgres-windows-x86_64.txz')
    if (-not $entry) { throw 'PostgreSQL 包内容不符合预期。' }
    $inputStream = $entry.Open()
    $tarPath = Join-Path $toolsRoot 'postgres.txz'
    $outputStream = [IO.File]::Create($tarPath)
    try { $inputStream.CopyTo($outputStream) } finally { $inputStream.Dispose(); $outputStream.Dispose() }
  } finally { $archive.Dispose() }
  $postgresRoot = Join-Path $toolsRoot 'postgres'
  New-Item -ItemType Directory -Force $postgresRoot | Out-Null
  & tar.exe -xf $tarPath -C $postgresRoot
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL 解包失败。' }
}
Write-Host '项目内 JDK 21、sbt、PostgreSQL 工具已准备好；它们不会提交到 Git。'
