from enum import Enum


class ReportUnitsLength(str, Enum):
    MM = "mm"

    def __str__(self) -> str:
        return str(self.value)
