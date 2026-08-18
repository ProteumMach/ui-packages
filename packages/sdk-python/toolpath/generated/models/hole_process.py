from enum import Enum


class HoleProcess(str, Enum):
    AUTOMATIC = "Automatic"
    DRILL = "Drill"
    MILL = "Mill"

    def __str__(self) -> str:
        return str(self.value)
