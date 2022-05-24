$w::
$a::
$s::
$d::
Gosub, CheckMovement
Return

$w up::
$a up::
$s up::
$d up::
Gosub, CheckMovement
Return

CheckMovement:
{
	If (!IsActive()) {
		Send, %A_ThisHotkey%
		Return
	}

	wPressed := GetKeyState("w", "P")
	aPressed := GetKeyState("a", "P")
	sPressed := GetKeyState("s", "P")
	dPressed := GetKeyState("d", "P")

	base := 150
	targetX := MiddlePosX
	targetY := MiddlePosY

	If (wPressed) {
		targetY -= base
	}

	If (sPressed) {
		targetY += base
	}

	If (aPressed) {
		targetX -= base
	}

	If (dPressed) {
		targetX += base
	}

	If (targetX != MiddlePosX || targetY != MiddlePosY) {
		MouseClick, left, targetX, targetY
		Sleep 150
	}

	Return
}
