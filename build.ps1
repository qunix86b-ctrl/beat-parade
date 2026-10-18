$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$javaRoot = if ($env:JAVA_HOME) { $env:JAVA_HOME } else { 'C:\Program Files\JetBrains\PyCharm Community Edition 2024.3\jbr' }
$env:JAVA_HOME = $javaRoot
$sdkRoot = Join-Path $PSScriptRoot 'tools/android-sdk'
$bt = Join-Path $sdkRoot 'build-tools/35.0.0'
$platform = 'tools/android-sdk/platforms/android-35/android.jar'
function CheckExit { if ($LASTEXITCODE -ne 0) { throw "Build command failed ($LASTEXITCODE)" } }
New-Item -ItemType Directory -Force build/classes,build/dex,dist | Out-Null
& "$bt/aapt2.exe" compile --dir android/res -o build/resources.zip
CheckExit
& "$bt/aapt2.exe" link -o build/base.apk -I $platform --manifest android/AndroidManifest.xml -A web build/resources.zip --min-sdk-version 26 --target-sdk-version 35
CheckExit
& "$javaRoot/bin/javac.exe" -encoding UTF-8 -source 8 -target 8 -classpath $platform -d build/classes android/src/kr/beatparade/game/MainActivity.java
CheckExit
python scripts/package.py classes
CheckExit
& "$bt/d8.bat" --lib $platform --min-api 26 --output build/dex build/classes.jar
CheckExit
Copy-Item build/base.apk build/unsigned.apk -Force
python scripts/package.py dex
CheckExit
& "$bt/zipalign.exe" -f -p 4 build/unsigned.apk build/aligned.apk
CheckExit
if (!(Test-Path tools/local-test-key.jks)) {
 & "$javaRoot/bin/keytool.exe" -genkeypair -keystore tools/local-test-key.jks -storepass android -keypass android -alias beatparade -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=Beat Parade Local Build,O=Local Development,C=KR'
 CheckExit
}
& "$bt/apksigner.bat" sign --ks tools/local-test-key.jks --ks-key-alias beatparade --ks-pass pass:android --key-pass pass:android --out dist/BeatParade-1.2.apk build/aligned.apk
CheckExit
& "$bt/apksigner.bat" verify --verbose dist/BeatParade-1.2.apk
CheckExit
Get-FileHash dist/BeatParade-1.2.apk -Algorithm SHA256
