#Include %A_ScriptDir%\core.ahk
#Persistent

global pausedByUser := False

; Reset Overlay
IniDelete, overlay.ini, Default

SetTimer, CheckFocus, 100
SetTimer, CheckOverlay, 1000
Gosub, CheckOverlay
Return

~$Pause::
{
  pausedByUser := !pausedByUser

  If (pausedByUser) {
    Notify("Paused", , "0xEF4444")
  } Else {
    Notify("Resumed", , "0x22C55E")
  }

  SetOverlay(pausedByUser, "Paused")

  Return
}

CheckFocus:
{
  If (WindowExe) {
    If (WinActive("ahk_exe" WindowExe) && !pausedByUser) {
      PauseSuspendAll(False)
    } Else {
      PauseSuspendAll(True)
    }
  } Else {
     If (!pausedByUser) {
         PauseSuspendAll(False)
     }
  }

  Return
}

CheckOverlay:
{
  If (WindowExe) {
    isWinActive := WinActive("ahk_exe" WindowExe)

    SetOverlay(WindowExe ? 0 : 1, "No Window")
    SetOverlay(!WindowExe || isWinActive ? 0 : 1, "Suspended")
  }

  Return
}

PauseSuspendAll(status := True)
{
	prevDetectWindows := A_DetectHiddenWindows
	prevMatchMode := A_TitleMatchMode

	DetectHiddenWindows, On
	SetTitleMatchMode, 2

	For index, element in Scripts
  {
    WinGet, matchWindows, List, % element " ahk_class AutoHotkey"

    Loop, %matchWindows%
    {
      script_id := matchWindows%A_Index%

      ; Force the script to update its Pause/Suspend checkmarks.
      SendMessage, 0x211,,,, ahk_id %script_id%  ; WM_ENTERMENULOOP
      SendMessage, 0x212,,,, ahk_id %script_id%  ; WM_EXITMENULOOP

      ; Get script status from its main menu.
      mainMenu := DllCall("GetMenu", "uint", script_id)
      fileMenu := DllCall("GetSubMenu", "uint", mainMenu, "int", 0)
      isPaused := DllCall("GetMenuState", "uint", fileMenu, "uint", 4, "uint", 0x400) >> 3 & 1
      isSuspended := DllCall("GetMenuState", "uint", fileMenu, "uint", 5, "uint", 0x400) >> 3 & 1

      DllCall("CloseHandle", "uint", fileMenu)
      DllCall("CloseHandle", "uint", mainMenu)

      if (status && !isSuspended) || (!status && isSuspended) {
        PostMessage, 0x111, 65305, 1,,  ahk_id %script_id%
      }

      if (status && !isPaused) || (!status && isPaused) {
        PostMessage, 0x111, 65403,,,  ahk_id %script_id%
      }
    }
  }

	DetectHiddenWindows, %prevDetectWindows%
	SetTitleMatchMode, %prevMatchMode%

	BlockInput, Off

	return script_id
}
