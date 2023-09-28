#Include %A_ScriptDir%\core.ahk
#Persistent

ClearOverlay("Lock")

For index, Key in A_Args
{
  Trigger := HotkeyClear("$" Key)

  fn := Func("OnPress").bind(Key)
  Hotkey, %Trigger%, %fn%, On

  StringUpper, keyLabel, % Key
  SetOverlay(1, HotkeyClear(keyLabel), "Lock")
}

OnPress(Key) {
  Return
}
