#Include %A_ScriptDir%\main.ahk

#Persistent

global WindowId := A_Args[1]
SetTimer, IsActive, 500

global toggleStatus := []

For index, value in A_Args
{
  If (index == 1) {
    Continue
  }

  Array := StrSplit(value, "|")

  Key := StrReplace(Array[1], "{", "")
  Key := StrReplace(Key, "}", "")
  Key := "$" Key

  Loop := Array[2]
  Remap := Array[3]

  If (Key && Remap) {
    Keymap%Key% := Remap

    If (Loop) {
      fn := Func("OnToggle").bind(Key, Remap)
      Hotkey, %Key%, %fn%, On
    } Else {
      fn := Func("OnPress").bind(Key, Remap)
      Hotkey, %Key%, %fn%, On
    }
  }
}

IsActive() {
  If WinActive("ahk_id" WindowId) {
    Suspend, Off
    Return 1
  } Else {
    Suspend, On
    Return 0
  }
}

OnToggle(Key, Remap) {
  If (!IsActive()) {
    Return
  }

  toggleStatus[Key] := !toggleStatus[Key]
  status := "Off"

  If (toggleStatus[Key]) {
    status := "On"
    fn := Func("OnPress").bind(Key, Remap, 1)
    SetTimer, %fn%, 100
  }

  StringUpper, message, % StrReplace(Key, "$", "")
  Notify("[" message "] Loop: " status)
}

OnPress(Key, Remap, Loop := 0) {
  If (!IsActive()) {
    Return
  }

  Sequence := StrSplit(Remap, ":;")

  For index, value in Sequence
  {
    If (!IsActive()) {
       Return
    }

    Send, %value%
  }

  If (Loop && !toggleStatus[Key]) {
    SetTimer,, Off
  }
}

~$Pause::
{
  If (A_IsPaused) {
    Notify("Resumed", 60)
    Pause, Off, 1
  } Else {
    Notify("Paused")
    Pause, On, 1
  }

  Return
}
