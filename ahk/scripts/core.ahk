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
global MiddlePosX := A_ScreenWidth // 2
global MiddlePosY := A_ScreenHeight // 2

; Mouse
global MouseBackupX := 0
global MouseBackupY := 0

; ATTENTION: First argument is WindowId (FOREVER AND EVER)
global WindowId := A_Args[1]
A_Args.RemoveAt(1)

Notify(Message, Width = 0) {
  SplashTextOff

  If (!Width) {
    Width := StrLen(Message) * 8
  }

  SplashTextOn, %Width%, , %Message%
  Sleep, 300
  SplashTextOff
}

HotkeyClear(Key) {
  Key := StrReplace(Key, "{", "")
  Key := StrReplace(Key, "}", "")
  Return Key
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

GetText(FromX, FromY, ToX, ToY) {
    dir = %A_WorkingDir%\resources\ahk\Capture2Text

    If (!FileExist(dir)) {
      dir = %A_WorkingDir%\ahk\Capture2Text
    }

    command = Capture2Text_CLI.exe --screen-rect "%FromX% %FromY% %ToX% %ToY%" --clipboard
    RunWait, %command%, %dir%, Hide

    Return clipboard
}

GetFile(File, Url := False) {
    File := StrReplace(File, "/", "\")
    Destination := "C:\AwyBotFiles\" File

    If (!Url) {
        Url := "https://github.com/caioedut/awy-bot-scripts/raw/main/" StrReplace(File, "\", "/")
    }

    FoundPos := InStr(Destination, "\", , -1)
    Directory := SubStr(Destination, 1 , FoundPos)
    FileCreateDir, %Directory%

    UrlDownloadToFile, %Url%, %Destination%
}
