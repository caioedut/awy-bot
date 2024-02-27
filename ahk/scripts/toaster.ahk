#NoEnv
#NoTrayIcon
#SingleInstance Force
#KeyHistory 0

SetBatchLines -1
ListLines Off

Message = %1%
Duration = %2%
Color = %3%

Gui, Destroy
Gui  +Owner +AlwaysOnTop +Disabled -Caption +Border
Gui, Color, 0x262626
Gui, Font, s8 q5 c%Color%, Verdana
Gui, Add, Text, , %Message%
Gui, Show, NA AutoSize NoActivate xCenter y200

SetTimer, HideToast, %Duration%
Return

HideToast:
Gui, Destroy
ExitApp
Return
