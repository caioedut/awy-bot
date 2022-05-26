#NoEnv
;#NoTrayIcon
#SingleInstance Force
#KeyHistory 0
#MaxHotkeysPerInterval 1000

SetBatchLines -1
ListLines Off
SendMode, Input
FileEncoding, UTF-8

; Global Variables
global Scripts := ["raw.ahk", "action.ahk", "lock.ahk", "remap.ahk"]
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
