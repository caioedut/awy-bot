#Include %A_ScriptDir%\core.ahk
#Include %A_ScriptDir%\systemCursor.ahk

SetSystemCursor("IDC_HAND")
SetTimer, Tooltiper, 100
Return

Esc::
{
  ResetSystemCursor()
  ExitApp
  Return
}

LButton::
{
  ResetSystemCursor()

  Clipboard := GetColor()
  Notify("Picked Color: " Clipboard, 2000)

  ExitApp
  Return
}

Tooltiper:
{
  color := GetColor()
  Tooltip, [%color%] Click to Copy
  Return
}

GetColor() {
  MouseGetPos, posX, posY
  PixelGetColor, color, posX, posY
  Return color
}
