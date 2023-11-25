#NoEnv
#NoTrayIcon
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

global AHK_PATH := A_WorkingDir "\resources\ahk"
If (!FileExist(AHK_PATH)) {
  AHK_PATH := A_WorkingDir "\ahk"
}

GetScriptName() {
  scriptName := StrReplace(A_ScriptName, "_action.ahk", "")
  scriptName := StrReplace(scriptName, "lock.ahk", "")
  scriptName := StrReplace(scriptName, "remap.ahk", "")
  scriptName := StrReplace(scriptName, "action.ahk", "")
  scriptName := StrReplace(scriptName, "main.ahk", "")
  Return % StrReplace(scriptName, "awy_bot_", "")
}

AdminRequired() {
  If (!A_IsAdmin) {
      Title := GetScriptName()
      MsgBox, %Title%: Run Awy Bot as Administrator
      ExitApp
  }
}

Notify(Message, Duration := 1000, Color := "0xFFFFFF") {
    If (Duration < 200) {
      Duration := 200
    }

    If (Duration > 3000) {
      Duration := 3000
    }

    Title := GetScriptName()
    Title := Title ? Title : "Awy Bot"
    ToasterScriptPath = %AHK_PATH%\scripts\toaster.ahk
    Run %ToasterScriptPath% "[%Title%] %Message%" "%Duration%" "%Color%"

    Return
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

SetOverlay(Value := 1, Key := false, Session := false) {
  If (!Key) {
    Key := GetScriptName()

    If (!Session) {
      Session := "Actions"
    }
  }

  If (!Session) {
    Session := "Default"
  }

  If (Value) {
    IniWrite, %Value%, overlay.ini, %Session%, %Key%
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

MouseRestore(speed := 0) {
  MouseMove, MouseBackupX, MouseBackupY, speed
}

GetText(FromX, FromY, ToX, ToY, WhiteList = false) {
  dir = %AHK_PATH%\Capture2Text

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
