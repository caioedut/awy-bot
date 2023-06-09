#Include %A_ScriptDir%\core.ahk
#Persistent

ClearOverlay("Loop")

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
  toggleStatus[Key] := !toggleStatus[Key]
  status := "Off"

  If (toggleStatus[Key]) {
    status := "On"
    fn := Func("OnPress").bind(Key, Sequence, Delays, 1)
    SetTimer, %fn%, 100
  }

  StringUpper, keyLabel, % HotkeyClear(Key)
  Notify("(" keyLabel ") Loop: " status)
  SetOverlay(keyLabel, toggleStatus[Key] ? 1 : 0, "Loop")
}

OnPress(Key, Sequence, Delays, Loop := 0) {
  If (Loop && !toggleStatus[Key]) {
    SetTimer, , Off
    Return
  }

  Sequence := StrSplit(Sequence, ":;")
  Delays := StrSplit(Delays, ":;")

  For index, value in Sequence
  {
    delay := Delays[index]
    xSend(value, Key)

    If (Delay) {
      Sleep, %delay%
    }
  }
}
