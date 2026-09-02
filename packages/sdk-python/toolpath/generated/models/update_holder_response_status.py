from enum import Enum


class UpdateHolderResponseStatus(str, Enum):
    QUEUED = "queued"

    def __str__(self) -> str:
        return str(self.value)
