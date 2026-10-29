param([string]$OutputPath = '')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$repositoryRoot = Split-Path $projectRoot -Parent
$submissionRoot = Join-Path $projectRoot 'submission'
New-Item -ItemType Directory -Force $submissionRoot | Out-Null
if (-not $OutputPath) { $OutputPath = Join-Path $submissionRoot '栖语_第二次作业_完整源码.zip' }
$OutputPath = [IO.Path]::GetFullPath($OutputPath)
if (Test-Path -LiteralPath $OutputPath) { throw '输出文件已存在；请通过 -OutputPath 指定新文件名，避免覆盖已有附件。' }

$stageParent = Join-Path $projectRoot ('.runtime/submission-' + [Guid]::NewGuid().ToString('N'))
$stageRoot = Join-Path $stageParent 'qiyu-homework2-source'
New-Item -ItemType Directory -Force $stageRoot | Out-Null
$allowedExtensions = @('.ts', '.tsx', '.json', '.html', '.css', '.scala', '.sbt', '.properties', '.conf', '.ps1', '.md')
$allowedNames = @('.gitignore', '.env.example', 'repositories', 'rules.txt')

function Copy-SourceItem([string]$Source, [string]$RelativeDestination) {
  $item = Get-Item -LiteralPath $Source
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "源码目录不能包含路径映射：$RelativeDestination" }
  if ($item.PSIsContainer) {
    Get-ChildItem -LiteralPath $Source | ForEach-Object {
      if ($_.Name -notin @('node_modules', 'target', 'dist', '.runtime', '.tools', '.git', 'submission')) {
        Copy-SourceItem $_.FullName (Join-Path $RelativeDestination $_.Name)
      }
    }
  } else {
    if (($item.Extension -notin $allowedExtensions) -and ($item.Name -notin $allowedNames)) { throw "未经允许的源码附件类型：$RelativeDestination" }
    if (($item.Name -like '.env*') -and ($item.Name -ne '.env.example')) { throw '禁止打包实际环境凭据。' }
    $destination = Join-Path $stageRoot $RelativeDestination
    New-Item -ItemType Directory -Force (Split-Path $destination -Parent) | Out-Null
    Copy-Item -LiteralPath $item.FullName -Destination $destination
  }
}

$sourceItems = @(
  'frontend/src', 'frontend/package.json', 'frontend/package-lock.json',
  'frontend/index.html', 'frontend/vite.config.ts', 'frontend/tsconfig.json', 'frontend/.prettierrc.json',
  'backend/src', 'backend/project/build.properties', 'backend/project/plugins.sbt',
  'backend/project/repositories', 'backend/build.sbt', 'backend/.scalafmt.conf',
  'backend/.env.example', 'backend/run.ps1', 'backend/README.md',
  'scripts', 'docs', 'README.md', '.gitignore'
)
$sourceItems | ForEach-Object { Copy-SourceItem (Join-Path $projectRoot $_) (Join-Path 'comfort-space' $_) }
@('AGENTS.md', '本项目编码规章制度.md') | ForEach-Object { Copy-SourceItem (Join-Path $repositoryRoot $_) $_ }
Copy-SourceItem (Join-Path $submissionRoot '作业说明.md') '作业说明.md'
Copy-SourceItem (Join-Path $submissionRoot '三分钟内录屏脚本.md') '三分钟内录屏脚本.md'
@('作业说明.md', '三分钟内录屏脚本.md') | ForEach-Object {
  Copy-SourceItem (Join-Path $submissionRoot $_) (Join-Path 'comfort-space/submission' $_)
}
Copy-SourceItem (Join-Path $repositoryRoot 'course-source/samples/rules.txt') 'course-source/samples/rules.txt'
Get-ChildItem -LiteralPath (Join-Path $repositoryRoot 'docs') -Filter '*.md' | ForEach-Object {
  Copy-SourceItem $_.FullName (Join-Path 'docs' $_.Name)
}

@'
# 栖语——第二次作业源码附件

本附件包含完整应用源码、测试、配置、数据库初始化、启动脚本及项目说明。

进入 comfort-space，按 README.md 和 backend/README.md 启动。首次运行需要网络下载依赖。

应用约十个功能页面，前端为 TypeScript + React，后端为 Scala 3 + PostgreSQL。
回复使用服务端演示模板，不是已接入的真实大模型。

未包含 node_modules、编译产物、便携运行工具、数据库、凭据和个人对话。
课程课件与参考案例原始大附件不是本应用的运行依赖，未打包。

实际使用流程视频需作为独立附件提供；本源码 ZIP 中的录屏脚本不等于视频。
'@ | Set-Content -LiteralPath (Join-Path $stageRoot 'README.md')

$sourceCommit = & git -c "safe.directory=$($repositoryRoot.Replace('\', '/'))" -C $repositoryRoot rev-parse HEAD
if ($LASTEXITCODE -ne 0) { throw '无法记录源码基线提交。' }
$manifestFiles = Get-ChildItem -LiteralPath $stageRoot -Recurse -File | Sort-Object FullName | ForEach-Object {
  @{ path = [IO.Path]::GetRelativePath($stageRoot, $_.FullName).Replace('\', '/'); bytes = $_.Length; sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }
}
@{ applicationBaseCommit = $sourceCommit; generatedAt = [DateTimeOffset]::Now.ToString('o'); files = @($manifestFiles) } |
  ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $stageRoot 'SOURCE-MANIFEST.json')

Compress-Archive -LiteralPath $stageRoot -DestinationPath $OutputPath -CompressionLevel Optimal
$archive = Get-Item -LiteralPath $OutputPath
if ($archive.Length -ge 100000000) { throw '源码附件超过 100 MB，不能按当前作业要求提交。' }
[PSCustomObject]@{ path = $archive.FullName; bytes = $archive.Length; sha256 = (Get-FileHash -LiteralPath $OutputPath -Algorithm SHA256).Hash.ToLowerInvariant(); videoIncluded = $false } | ConvertTo-Json
