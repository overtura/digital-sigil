#Requires -Version 5.1
[CmdletBinding()]
param(
  [ValidateSet("auto", "normal", "major")]
  [string]$Scale = "auto",
  [switch]$AutoMerge,
  [switch]$AllowLocalPublisherAuth,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ProjectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$Repository = "overtura/digital-sigil"
$BranchPrefix = "codex/digital-sigil-improve"
$Marker = "digital-sigil-self-improvement"

function Invoke-GhJson {
  param([string[]]$Arguments)
  $json = gh @Arguments
  if ($LASTEXITCODE -ne 0) { throw "GitHub CLI command failed: gh $($Arguments -join ' ')" }
  return @($json | ConvertFrom-Json)
}

function Test-SelfImprovementPr {
  param([object]$PullRequest)
  $head = [string]$PullRequest.headRefName
  $body = [string]$PullRequest.body
  return $head.StartsWith($BranchPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or $body.Contains($Marker)
}

if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot ".git"))) {
  throw "Run self-improvement from an initialized git repository."
}
$workingTree = @(git -C $ProjectRoot status --porcelain)
if ($LASTEXITCODE -ne 0) { throw "Unable to inspect the git working tree." }
if ($workingTree.Count -gt 0) { throw "The working tree must be clean before self-improvement." }
$branch = (git -C $ProjectRoot branch --show-current).Trim()

$installScript = Join-Path $PSScriptRoot "install-maintainer-profiles.ps1"
$installOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $installScript -ProjectRoot $ProjectRoot)
if ($LASTEXITCODE -ne 0 -or $installOutput.Count -eq 0) { throw "Unable to install maintainer profiles." }
$botHome = [string]$installOutput[-1]

$mergedPrs = Invoke-GhJson @(
  "pr", "list", "--repo", $Repository, "--state", "merged", "--limit", "100",
  "--json", "number,title,url,body,headRefName,mergedAt"
) | Where-Object { Test-SelfImprovementPr $_ }
$mergedCount = @($mergedPrs).Count
$cadenceScale = if (($mergedCount % 5) -eq 4) { "major" } else { "normal" }
$selectedScale = if ($Scale -eq "auto") { $cadenceScale } else { $Scale }
$profileName = "digital-sigil-$selectedScale"
$profilePath = Join-Path $ProjectRoot "maintainer-bot\profiles\$selectedScale.json"
$profile = Get-Content -LiteralPath $profilePath -Raw -Encoding utf8 | ConvertFrom-Json

Write-Host "Selected slot: $selectedScale"
Write-Host "Merged self-improvement PRs: $mergedCount"
Write-Host "Profile: $profileName"
Write-Host "Budget: maxFiles=$($profile.maxFiles) maxLines=$($profile.maxLines)"
Write-Host "Branch: $branch"

$runner = Join-Path $botHome "scripts\auto-improve-target-once.ps1"
$runnerArguments = @(
  "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $runner,
  "-Profile", $profileName, "-BranchPrefix", $BranchPrefix
)
if ($DryRun) { $runnerArguments += "-DryRun" }
if ($AutoMerge -and -not $DryRun) { $runnerArguments += "-AutoMerge" }
if ($AllowLocalPublisherAuth -and -not $DryRun) { $runnerArguments += "-AllowLocalPublisherAuth" }
& powershell.exe @runnerArguments
if ($LASTEXITCODE -ne 0) { throw "Central maintainer loop failed with exit code $LASTEXITCODE." }

$statePath = Join-Path $ProjectRoot "maintainer-bot\local-state.json"
$state = [ordered]@{
  note = "Cache only. GitHub merged pull requests are the source of truth."
  mergedSelfImprovementCount = $mergedCount
  selectedSlot = $selectedScale
  checkedAt = [DateTime]::UtcNow.ToString("o")
}
[System.IO.File]::WriteAllText($statePath, ($state | ConvertTo-Json), [System.Text.UTF8Encoding]::new($false))

$allPrs = Invoke-GhJson @(
  "pr", "list", "--repo", $Repository, "--state", "all", "--limit", "30",
  "--json", "number,title,url,state,isDraft,body,headRefName,createdAt"
) | Where-Object { Test-SelfImprovementPr $_ } | Sort-Object createdAt -Descending
$latest = @($allPrs)[0]
$latestText = if ($latest) { "#$($latest.number) $($latest.url) state=$($latest.state) draft=$($latest.isDraft)" } else { "none (dry-run or no candidate)" }

Write-Host "Result summary"
Write-Host "- slot: $selectedScale"
Write-Host "- goal: $($profile.goalDirectives[0])"
Write-Host "- pull request: $latestText"
Write-Host "- risk: enforced by central R0-R3 classifier; R1 only may auto-merge"
Write-Host "- verification: central profile requires pnpm check and Codex red-team PASS"
Write-Host "- publish: $(if ($DryRun) { 'disabled (dry-run)' } elseif ($AutoMerge) { 'safe auto-merge requested' } else { 'PR only' })"
Write-Host "- remaining risk: inspect the central scheduler log and PR checks before manual intervention"
