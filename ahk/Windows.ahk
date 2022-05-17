#NoEnv
#NoTrayIcon

ListDir := A_ScriptDir "\windows.txt"

FileDelete, %ListDir%

WinGet windows, List
Loop %windows%
{
	Id := windows%A_Index%
	WinGetTitle Title, ahk_id %Id%

	If (Title) {
	  Response .= Id . "|" Title . "`n"
  }
}

FileAppend, %Response%, %ListDir%
