#NoEnv
#Persistent
;#SingleInstance Ignore
#SingleInstance Force

; Disable history/logs
#KeyHistory 0
SetBatchLines -1
ListLines Off

SendMode, Input

DebugArray(Arr) {
  Str := ""

  for index, element in Arr
    Str = %Str%[%index%] %element%`n

  MsgBox, % Str
}

ParamsStr = %1%
Params := StrSplit(ParamsStr, ";")

DebugArray(Params)

*MButton::
{
  MsgBox, %Params%
}
