#NoEnv
;#NoTrayIcon
#SingleInstance Force
#KeyHistory 0
#MaxHotkeysPerInterval 1000

SetBatchLines -1
ListLines Off
SendMode, Input

; ATTENTION: First argument is WindowId (FOREVER AND EVER)
global WindowId := A_Args[1]
A_Args.RemoveAt(1)

IsActive()
If (WindowId) {
  SetTimer, IsActive, 500
}

IsActive() {
  If (WinActive("ahk_id" WindowId)) {
    Suspend, Off
  } Else {
    Suspend, On
  }
}

IsRunning() {
  Return !A_IsSuspended && !A_IsPaused
}

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
