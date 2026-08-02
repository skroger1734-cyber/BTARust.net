$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Split-Path -Parent $workspaceRoot
$privateEnvPath = Join-Path $workspaceRoot "BTA PRIVATE KEY SHEET.updated.env"
$webhookPath = Join-Path $workspaceRoot "giveaways-bot\data\log-webhooks.json"

function Read-PrivateEnv {
    param([string]$Path)

    $values = @{}
    foreach ($line in Get-Content -LiteralPath $Path) {
        if ($line -match '^\s*#' -or $line -notmatch '=') {
            continue
        }
        $parts = $line -split '=', 2
        $name = $parts[0].Trim()
        $value = $parts[1].Trim()
        if (
            ($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))
        ) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        $values[$name] = $value
    }
    return $values
}

function Set-VercelSecret {
    param(
        [string]$Name,
        [string]$Value
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        throw "Required production setting $Name is missing."
    }
    $Value | & npx --yes vercel env add $Name production --force --sensitive --yes | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Vercel rejected production setting $Name."
    }
    Write-Output "Configured $Name"
}

$privateValues = Read-PrivateEnv -Path $privateEnvPath
$requiredNames = @(
    "BTA_GIVEAWAYS_APPLICATION_ID",
    "BTA_GIVEAWAYS_CLIENT_SECRET",
    "BTA_GIVEAWAYS_BOT_TOKEN",
    "BTA_RCON_US_HOST",
    "BTA_RCON_US_PORT",
    "BTA_RCON_US_PASSWORD",
    "BTA_RCON_EU_HOST",
    "BTA_RCON_EU_PORT",
    "BTA_RCON_EU_PASSWORD",
    "BTA_RCON_TEST_HOST",
    "BTA_RCON_TEST_PORT",
    "BTA_RCON_TEST_PASSWORD",
    "BTA_TEBEX_PRIVATE_KEY"
)

foreach ($name in $requiredNames) {
    Set-VercelSecret -Name $name -Value $privateValues[$name]
}

$webhookJson = Get-Content -LiteralPath $webhookPath -Raw |
    ConvertFrom-Json |
    ConvertTo-Json -Depth 10 -Compress
Set-VercelSecret -Name "BTA_GIVEAWAYS_LOG_WEBHOOKS_JSON" -Value $webhookJson

$randomBytes = New-Object byte[] 48
$randomGenerator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$randomGenerator.GetBytes($randomBytes)
$randomGenerator.Dispose()
$cronSecret = [Convert]::ToBase64String($randomBytes)
Set-VercelSecret -Name "CRON_SECRET" -Value $cronSecret

Write-Output "BTA Giveaways production environment is ready."
