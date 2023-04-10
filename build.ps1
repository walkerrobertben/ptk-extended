if (Test-Path .\extension\_metadata) {
	Remove-Item .\extension\_metadata -Recurse -Force -Confirm:$false
}

Compress-Archive .\extension\* .\build.zip -Confirm:$false