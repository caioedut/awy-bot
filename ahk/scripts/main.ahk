#NoEnv
#NoTrayIcon
#SingleInstance Force
#KeyHistory 0
#MaxHotkeysPerInterval 1000

SetBatchLines -1
ListLines Off
SendMode, Input

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
