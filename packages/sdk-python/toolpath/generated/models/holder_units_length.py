from enum import Enum


class HolderUnitsLength(str, Enum):
    MM = "mm"

    def __str__(self) -> str:
        return str(self.value)
