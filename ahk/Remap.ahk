#NoEnv
#Persistent
#SingleInstance Force
#KeyHistory 0
SetBatchLines -1
ListLines Off
SendMode, Input

; Remap
For index, value in A_Args
{
  Array := StrSplit(value, "=")

  Key := "$" + Array[1]
  Remap := Array[2]

  If (Key && Remap) {
    Keymap%Key% := Remap
    Hotkey, %Key%, OnPress, On
  }
}

Return

; Action
OnPress:
{
  Remap := Keymap%A_ThisHotkey%
  Send, %Remap%
  Return
}
