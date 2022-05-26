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
global Scripts := ["raw.ahk", "lock.ahk", "remap.ahk"]
global MiddlePosX := A_ScreenWidth // 2
global MiddlePosY := A_ScreenHeight // 2

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

SetOverlay(Key, Value := 1) {
  If (Value) {
    IniWrite, 1, overlay.ini, Default, %Key%
  } Else {
    IniDelete, overlay.ini, Default, %Key%
  }
}
