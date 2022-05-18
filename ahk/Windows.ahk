#NoEnv
#NoTrayIcon

ListDir := A_ScriptDir "\windows.txt"

FileDelete, %ListDir%

WinGet windows, List
Loop %windows%
{
	id := windows%A_Index%

	WinGetClass class, ahk_id %id%
	WinGetTitle title, ahk_id %id%

  If (title = "")
    Continue

  If (class = "ApplicationFrameWindow") {
    WinGetText, text, ahk_id %id%

    If (text = "")
      Continue
  }

  WinGet, style, style, ahk_id %id%

  If !(style & 0xC00000) {
      continue
  }

  Response .= Id . "|" Title . "`n"
}

FileAppend, %Response%, %ListDir%
