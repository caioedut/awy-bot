#Include %A_ScriptDir%\main.ahk

#Persistent

global toggleStatus := []

For index, value in A_Args
{
  Array := StrSplit(value, "|")

  Key := Array[1]
  Loop := Array[2]
  Sequence := Array[3]
  Delays := Array[4]

  If (Key && Sequence) {
    Trigger := HotkeyClear("$" Key)

    If (Loop) {
      fn := Func("OnToggle").bind(Key, Sequence, Delays)
      Hotkey, %Trigger%, %fn%, On
    } Else {
      fn := Func("OnPress").bind(Key, Sequence, Delays)
      Hotkey, %Trigger%, %fn%, On
    }
  }
}

OnToggle(Key, Sequence, Delays) {
  If (!IsActive()) {
    Send, %Key%
    Return
  }

  toggleStatus[Key] := !toggleStatus[Key]
  status := "Off"

  If (toggleStatus[Key]) {
    status := "On"
    fn := Func("OnPress").bind(Key, Sequence, Delays, 1)
    SetTimer, %fn%, 250
  }

  StringUpper, message, % Key
  Notify("[" HotkeyClear(message) "] Loop: " status)
}

OnPress(Key, Sequence, Delays, Loop := 0) {
  If (!IsActive()) {
    If (!Loop) {
      Send, %Key%
    }

    Return
  }

  Sequence := StrSplit(Sequence, ":;")
  Delays := StrSplit(Delays, ":;")

  For index, value in Sequence
  {
    If (!IsActive()) {
      Return
    }

    Send, %value%

    delay := Delays[index]

    If (Delay) {
      Sleep, %delay%
    }
  }

  If (Loop && !toggleStatus[Key]) {
    SetTimer, , Off
  }
}

~$Pause::
{
  If (IsActive()) {
    Notify("Paused")
    Pause, On, 1
  } Else {
    Notify("Resumed", 60)
    Pause, Off, 1
  }

  Return
}
