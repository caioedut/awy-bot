#NoEnv
#NoTrayIcon
#SingleInstance Force
#KeyHistory 0

SetBatchLines -1
ListLines Off
SendMode, Input

Notify(Message, Width = 0) {
  SplashTextOff

  If (!Width) {
    Width := StrLen(Message) * 8
  }

  SplashTextOn, %Width%, , %Message%
  Sleep, 300
  SplashTextOff
}
