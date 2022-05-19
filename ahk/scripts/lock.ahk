#Include %A_ScriptDir%\main.ahk

#Persistent

For index, Key in A_Args
{
  Trigger := HotkeyClear("$" Key)
  fn := Func("OnPress").bind(Key)
  Hotkey, %Trigger%, %fn%, On
}

OnPress(Key) {
  If (!IsRunning()) {
    Send, %Key%
  }

  Return
}
