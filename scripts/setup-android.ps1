# Optional setup for a new machine. Downloads official Google SDK packages.
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if (!$env:JAVA_HOME) { throw 'Set JAVA_HOME to a JDK 17 or newer installation first.' }
New-Item -ItemType Directory -Force tools | Out-Null
Invoke-WebRequest 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip' -OutFile tools/android-tools.zip
Expand-Archive tools/android-tools.zip -DestinationPath tools/android-cli -Force
# sdkmanager displays Google's license and asks for acceptance.
& tools/android-cli/cmdline-tools/bin/sdkmanager.bat --sdk_root=tools/android-sdk 'platforms;android-35' 'build-tools;35.0.0' 'platform-tools'
if ($LASTEXITCODE -ne 0) { throw 'Android SDK installation failed.' }
