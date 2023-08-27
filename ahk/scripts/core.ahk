#NoEnv
#NoTrayIcon
#InstallKeybdHook
#InstallMouseHook
#UseHook
#SingleInstance Force
#KeyHistory 0
#MaxHotkeysPerInterval 1000

SetBatchLines -1
ListLines Off
SendMode, Input
FileEncoding, UTF-8

; Global Variables
global Scripts := ["lock.ahk", "remap.ahk", "action.ahk"]
global MouseBackupX := 0
global MouseBackupY := 0

; ATTENTION: First argument is Window EXE (FOREVER AND EVER)
global WindowExe := A_Args[1]
A_Args.RemoveAt(1)

Notify(Message, Duration = 500) {
    SplashTextOff

    If (!Width) {
      Width := StrLen(Message) * 8
    }

    Title := StrReplace(SubStr(A_ScriptName, 9), "_action.ahk", "")
    SplashTextOn, %Width%, 22, %Title%, %Message%

    If (Duration < 100) {
      Duration := 100
    }

    If (Duration > 3000) {
      Duration := 3000
    }

    Sleep, %Duration%
    SplashTextOff
}

HotkeyClear(Key) {
  Key := StrReplace(Key, "{", "")
  Key := StrReplace(Key, "}", "")
  Return Key
}

xSend(Key, ReleaseKey := False) {
  If (!ReleaseKey) {
      ReleaseKey := Key
  }

  Key := HotkeyClear(Key)
  Key := StrReplace(Key, "*", "")
  Key := StrReplace(Key, "~", "")
  Key := StrReplace(Key, "$", "")

  ReleaseKey := HotkeyClear(ReleaseKey)
  ReleaseKey := StrReplace(ReleaseKey, "*", "")
  ReleaseKey := StrReplace(ReleaseKey, "~", "")
  ReleaseKey := StrReplace(ReleaseKey, "$", "")

  Send, {%Key% down}
  KeyWait, %ReleaseKey%
  Send, {%Key% up}
}

SetOverlay(Key, Value := 1, Session := "Default") {
  If (Value) {
    IniWrite, 1, overlay.ini, %Session%, %Key%
  } Else {
    IniDelete, overlay.ini, %Session%, %Key%
  }
}

ClearOverlay(Session) {
  IniDelete, overlay.ini, %Session%
}

MouseLock() {
  BlockInput, MouseMove
}

MouseRelease() {
  BlockInput, MouseMoveOff
}

MouseBackup() {
  MouseGetPos, MouseBackupX, MouseBackupY
}

MouseRestore() {
  MouseMove, MouseBackupX, MouseBackupY
}

GetText(FromX, FromY, ToX, ToY, WhiteList = false) {
  dir = %A_WorkingDir%\resources\ahk\Capture2Text

  If (!FileExist(dir)) {
    dir = %A_WorkingDir%\ahk\Capture2Text
  }

  command = Capture2Text_CLI.exe --screen-rect "%FromX% %FromY% %ToX% %ToY%" --output-file "C:\AwyBotFiles\temp"

  If (WhiteList) {
    command := command . " --whitelist " . WhiteList
  }

  RunWait, %command%, %dir%, Hide
  FileRead, Response, C:\AwyBotFiles\temp

  Return Response
}

GetFile(File, Url := False) {
  File := StrReplace(File, "/", "\")
  Destination := "C:\AwyBotFiles\" File

  If (!Url) {
      Url := "https://github.com/maketgoy/awy-bot-scripts/raw/main/" StrReplace(File, "\", "/")
  }

  FoundPos := InStr(Destination, "\", , -1)
  Directory := SubStr(Destination, 1 , FoundPos)
  FileCreateDir, %Directory%

  UrlDownloadToFile, %Url%, %Destination%

  Return Destination
}
