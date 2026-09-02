from enum import Enum


class NoAxisKind(str, Enum):
    NOAXIS = "NoAxis"

    def __str__(self) -> str:
        return str(self.value)
