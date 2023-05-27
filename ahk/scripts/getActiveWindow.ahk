#Include %A_ScriptDir%\core.ahk

WinGet, currentWindow, ProcessName, A

FileAppend, %currentWindow%, *

ExitApp
