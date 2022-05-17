#NoEnv
#NoTrayIcon
#Persistent
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

; Remap
For index, value in A_Args
{
  Array := StrSplit(value, "|")

  Key := "$" + Array[1]
  Loop := Array[2]
  Remap := Array[3]

  If (Key && Remap) {
    Keymap%Key% := Remap

    If (Loop) {
      Hotkey, %Key%, OnToggle, On
    } Else {
      Hotkey, %Key%, OnPress, On
    }

  }
}

Return

OnPress:
{
  Remap := Keymap%A_ThisHotkey%
  Sequence := StrSplit(Remap, ":;")

  For index, value in Sequence
    Send, %value%

  Return
}

OnToggle:
{
  Remap := Keymap%A_ThisHotkey%
  Toggle%A_ThisHotkey% := !Toggle%A_ThisHotkey%

  If (Toggle%A_ThisHotkey%) {
    Notify(Remap " On")
    SetTimer, OnLoop, 200
  } Else {
    Notify(Remap " Off")
    SetTimer, OnLoop, Off
  }

  Return
}

OnLoop:
{
  Remap := Keymap%A_ThisHotkey%
  Sequence := StrSplit(Remap, ":;")

  For index, value in Sequence
    Send, %value%

  Return
}
