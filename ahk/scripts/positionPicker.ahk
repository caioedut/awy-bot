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
  MouseGetPos, posX, posY
  ResetSystemCursor()

  Clipboard := posX ", " posY
  Notify("Picked Positions: " Clipboard, 2000)

  ExitApp
  Return
}

Tooltiper:
{
  MouseGetPos, posX, posY
  Tooltip, [%posX%`, %posY%] Click to Copy
  Return
}
