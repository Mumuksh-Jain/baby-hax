# Reproducible local narration; Windows Zira synthetic voice, no remote service.
$ErrorActionPreference = 'Stop'
$pipAudioFolder = Join-Path $PSScriptRoot '../public/assets/audio/narration'
New-Item -ItemType Directory -Force -Path $pipAudioFolder | Out-Null
$pipSpeaker = New-Object -ComObject SAPI.SpVoice
$pipVoices = $pipSpeaker.GetVoices()
for ($i = 0; $i -lt $pipVoices.Count; $i++) { if ($pipVoices.Item($i).GetDescription() -match 'Zira') { $pipSpeaker.Voice = $pipVoices.Item($i) } }
$pipSpeaker.Rate = 1
$pipLines = [ordered]@{
  'arrival' = 'Tonight, three stars found Pip.'
  'wish' = 'They had a tiny wish.'
  'dance' = 'Teach the whole sky to sing.'
  'listen' = 'And then, a lullaby.'
  'goodnight' = 'And one small room became a sky full of friends.'
}
foreach ($pipLine in $pipLines.GetEnumerator()) {
  $pipStream = New-Object -ComObject SAPI.SpFileStream
  $pipStream.Format.Type = 22 # 22.05 kHz, 16-bit mono PCM
  $pipStream.Open([IO.Path]::GetFullPath((Join-Path $pipAudioFolder ($pipLine.Key + '.wav'))), 3, $false)
  $pipSpeaker.AudioOutputStream = $pipStream
  [void]$pipSpeaker.Speak($pipLine.Value)
  $pipStream.Close()
}
