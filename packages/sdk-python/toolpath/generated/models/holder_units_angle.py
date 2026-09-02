from enum import Enum


class HolderUnitsAngle(str, Enum):
    DEG = "deg"

    def __str__(self) -> str:
        return str(self.value)
