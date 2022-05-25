#Include %A_ScriptDir%\core.ahk

WinGet windows, List
Loop %windows%
{
	id := windows%A_Index%

	WinGetClass class, ahk_id %id%
	WinGetTitle title, ahk_id %id%

  If (title == "") {
    Continue
  }

  WinGet, exe, ProcessName, ahk_id %id%
  StringLower, exeLower, exe

  If (exeLower == "explorer.exe") {
    Continue
  }

  If (class = "ApplicationFrameWindow") {
    WinGetText, text, ahk_id %id%

    If (text == "") {
      Continue
    }
  }

  WinGet, style, style, ahk_id %id%

  If (!style || !0xC00000) {
    Continue
  }

  Response .= id "|[" exe "]: " title "`n"
}

FileAppend, %Response%, *

ExitApp
