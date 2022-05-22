#Include %A_ScriptDir%\main.ahk

#Persistent

global toggleStatus := []

For index, value in A_Args
{
  Array := StrSplit(value, "|")

  Key := Array[1]
  Loop := Array[2]
  Remap := Array[3]

  If (Key && Remap) {
    Trigger := HotkeyClear("$" Key)

    If (Loop) {
      fn := Func("OnToggle").bind(Key, Remap)
      Hotkey, %Trigger%, %fn%, On
    } Else {
      fn := Func("OnPress").bind(Key, Remap)
      Hotkey, %Trigger%, %fn%, On
    }
  }
}

OnToggle(Key, Remap) {
  If (!IsRunning()) {
    Send, %Key%
    Return
  }

  toggleStatus[Key] := !toggleStatus[Key]
  status := "Off"

  If (toggleStatus[Key]) {
    status := "On"
    fn := Func("OnPress").bind(Key, Remap, 1)
    SetTimer, %fn%, 250
  }

  StringUpper, message, % Key
  Notify("[" HotkeyClear(message) "] Loop: " status)
}

OnPress(Key, Remap, Loop := 0) {
  If (!IsRunning()) {
    Send, %Key%
    Return
  }

  Sequence := StrSplit(Remap, ":;")

  For index, value in Sequence
  {
    If (!IsRunning()) {
      Return
    }

    Send, %value%
  }

  If (Loop && !toggleStatus[Key]) {
    SetTimer, , Off
  }
}

~$Pause::
{
  If (IsRunning()) {
    Notify("Paused")
    Pause, On, 1
  } Else {
    Notify("Resumed", 60)
    Pause, Off, 1
  }

  Return
}
