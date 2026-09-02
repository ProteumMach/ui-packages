from enum import Enum


class TurningAxisKind(str, Enum):
    TURNINGAXIS = "TurningAxis"

    def __str__(self) -> str:
        return str(self.value)
