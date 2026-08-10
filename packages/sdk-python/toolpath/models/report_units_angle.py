from enum import Enum


class ReportUnitsAngle(str, Enum):
    RAD = "rad"

    def __str__(self) -> str:
        return str(self.value)
