#Include %A_ScriptDir%\core.ahk
#Persistent

global pausedByUser := False

; Reset Overlay
IniDelete, overlay.ini, Default

SetTimer, CheckFocus, 200
Return

~$Pause::
{
  pausedByUser := !pausedByUser

  If (pausedByUser) {
    Notify("Paused")
  } Else {
    Notify("Resumed", 60)
  }

  SetOverlay("Paused", pausedByUser)

  Return
}

CheckFocus:
{
  isWinActive := WinActive("ahk_id" WindowId)

  If (isWinActive && !pausedByUser) {
    PauseSuspendAll(False)
  } Else {
    PauseSuspendAll(True)
  }

  SetOverlay("Suspended", !isWinActive)
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
    If (script_id := WinExist(element " ahk_class AutoHotkey")) {
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

	return script_id
}
