#NoEnv
#NoTrayIcon
#SingleInstance Force
#KeyHistory 0

SetBatchLines -1
ListLines Off
SendMode, Input

Notify(Message) {
  SplashTextOff
  Width := StrLen(Message) * 8
  SplashTextOn, %Width%, , %Message%
  Sleep, 500
  SplashTextOff
}
