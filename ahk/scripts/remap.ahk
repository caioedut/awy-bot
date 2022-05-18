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

  Key := "$" Array[1]
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
  toggleStatus[Key] := !toggleStatus[Key]

  If (toggleStatus[Key]) {
    Notify(Remap " On")
    fn := Func("OnPress").bind(Key, Remap, 1)
    SetTimer, %fn%, 200
  } Else {
    Notify(Remap " Off")
  }
}

OnPress(Key, Remap, Loop := 0) {
  If (!IsActive()) {
    Return
  }

  Sequence := StrSplit(Remap, ":;")

  For index, value in Sequence
    If (IsActive()) {
      Send, %value%
    }

  If (Loop && !toggleStatus[Key]) {
    SetTimer,, Off
  }
}

~$Pause::Pause
