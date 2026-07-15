#Requires -Version 5.1
[CmdletBinding()]
param(
  [string]$ProjectRoot = "",
  [string]$BotHome = "",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
if (-not $ProjectRoot) {
  $ProjectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
}

function Find-BotHome {
  $candidates = @()
  if ($BotHome) { $candidates += $BotHome }
  if ($env:SELF_IMPROVING_BOT_HOME) { $candidates += $env:SELF_IMPROVING_BOT_HOME }
  $candidates += (Join-Path $ProjectRoot "..\self-improving-maintainer-bot")
  $candidates += (Join-Path $ProjectRoot "..\..\self-improving-maintainer-bot")

  foreach ($candidate in $candidates) {
    $fullPath = [System.IO.Path]::GetFullPath($candidate)
    if (Test-Path -LiteralPath (Join-Path $fullPath "scripts\auto-improve-target-once.ps1") -PathType Leaf) {
      return $fullPath
    }
  }

  $cloneTarget = [System.IO.Path]::GetFullPath((Join-Path $ProjectRoot "..\self-improving-maintainer-bot"))
  if ($cloneTarget.StartsWith($ProjectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Central bot clone target must stay outside the project repository."
  }
  if ($DryRun) {
    throw "Central bot is not installed. Run without -DryRun once to clone it to $cloneTarget."
  }
  git clone --depth 1 https://github.com/okorion/self-improving-maintainer-bot.git $cloneTarget
  if ($LASTEXITCODE -ne 0) { throw "Failed to clone the central maintainer bot." }
  return $cloneTarget
}

$resolvedBotHome = Find-BotHome
if (-not $DryRun) {
  $destination = Join-Path $resolvedBotHome "profiles\overtura"
  New-Item -ItemType Directory -Force -Path $destination | Out-Null
  Copy-Item -LiteralPath (Join-Path $ProjectRoot "maintainer-bot\profiles\normal.json") -Destination (Join-Path $destination "digital-sigil-normal.json") -Force
  Copy-Item -LiteralPath (Join-Path $ProjectRoot "maintainer-bot\profiles\major.json") -Destination (Join-Path $destination "digital-sigil-major.json") -Force
}
Write-Output $resolvedBotHome
