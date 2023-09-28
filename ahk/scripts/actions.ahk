#Include %A_ScriptDir%\core.ahk

DetectHiddenWindows, On
SetTitleMatchMode, 2

ClearOverlay("Actions")
ScriptsToDontStop := A_Args

WinGet, matchWindows, List, % "_action.ahk ahk_class AutoHotkey"

Loop, %matchWindows%
{
  script_id := matchWindows%A_Index%
  WinGetTitle, script_title, ahk_id %script_id%

  stopScript := true

  If (script_id) {
    For index, name in ScriptsToDontStop
    {
      If (InStr(script_title, name)) {
        stopScript := false

        actionLabel := StrReplace(name, "awy_bot_", "")
        actionLabel := StrReplace(actionLabel, "_action.ahk", "")
        SetOverlay(1, actionLabel, "Actions")
      }
    }
  }

  If (stopScript) {
    WinClose, ahk_id %script_id%
  }
}
