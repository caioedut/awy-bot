#Include %A_ScriptDir%\main.ahk

#Persistent

WindowId := A_Args[1]
SetTimer, IsActive, 500

For index, value in A_Args
{
  If (index == 1) {
    Continue
  }

  Array := StrSplit(value, "|")

  Key := "$" Array[1]
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

IsActive:
{
  If WinActive("ahk_id" WindowId) {
    Suspend, Off
  } Else {
    Suspend, On
  }

  Return
}

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
