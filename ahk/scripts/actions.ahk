#Include %A_ScriptDir%\core.ahk

DetectHiddenWindows, On
SetTitleMatchMode, 2

ClearOverlay("Actions")

WinGet, matchWindows, List, % "_action.ahk ahk_class AutoHotkey"

Loop, %matchWindows%
{
  script_id := matchWindows%A_Index%
  WinClose, ahk_id %script_id%
}
