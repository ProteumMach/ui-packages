from enum import Enum


class ComputeFeatureDatasheetsResponseStatus(str, Enum):
    QUEUED = "queued"

    def __str__(self) -> str:
        return str(self.value)
