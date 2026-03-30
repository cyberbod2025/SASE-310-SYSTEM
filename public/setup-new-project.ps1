# Setup New Project - Antigravity Smart Development Ecosystem (SDE)
# Use: .\setup-new-project.ps1 -TargetDir "C:\Path\To\NewProject"

param (
    [Parameter(Mandatory=$true)]
    [string]$TargetDir
)

$SourceDir = $PSScriptRoot | Split-Path -Parent
$TargetDir = [System.IO.Path]::GetFullPath($TargetDir)

if (-not (Test-Path $TargetDir)) {
    Write-Host "Creating folder: $TargetDir" -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
}

# 1. Create structure
$AgentDir = Join-Path $TargetDir ".agent"
$SkillsDir = Join-Path $AgentDir "skills"
$WorkflowsDir = Join-Path $AgentDir "workflows"
$BrainDir = Join-Path $TargetDir "brain"

Write-Host "Initializing SDE structure..." -ForegroundColor Green
New-Item -ItemType Directory -Path $SkillsDir -Force | Out-Null
New-Item -ItemType Directory -Path $WorkflowsDir -Force | Out-Null
New-Item -ItemType Directory -Path $BrainDir -Force | Out-Null

# 2. Copy Intelligence (Skills and Workflows)
if (Test-Path (Join-Path $SourceDir ".agent")) {
    Write-Host "Copying Skills and Workflows from source..." -ForegroundColor Cyan
    Copy-Item -Path (Join-Path $SourceDir ".agent\skills\*") -Destination $SkillsDir -Recurse -Force
    Copy-Item -Path (Join-Path $SourceDir ".agent\workflows\*") -Destination $WorkflowsDir -Recurse -Force
}

# 3. Create Stability Config (empty.npmrc)
Write-Host "Creating Stability configurations..." -ForegroundColor Cyan
New-Item -ItemType File -Path (Join-Path $TargetDir "empty.npmrc") -Force | Out-Null

# 4. Create Context Template
$ContextPath = Join-Path $TargetDir "CONTEXT.md"
if (-not (Test-Path $ContextPath)) {
    $ContextContent = @"
# Project Context: [PROJECT NAME]

## Identity
You are Antigravity, acting as a Senior Developer for this project.

## Core Rules
1. Follow existing design patterns in the codebase.
2. Use the 'empty.npmrc' for all NPM operations to ensure stability.
3. Always check `.agent/skills` before proposing new solutions.
4. Keep the 'brain/' folder updated with task logs.

## Technical Stack
- [Framework]
- [Database]
- [Styling]
"@
    $ContextContent | Out-File $ContextPath -Encoding utf8
}

Write-Host "`n[SUCCESS] Smart Development Ecosystem initialized in: $TargetDir" -ForegroundColor Green
Write-Host "You can now open this folder in Antigravity and I will have all your skills ready!" -ForegroundColor Yellow
