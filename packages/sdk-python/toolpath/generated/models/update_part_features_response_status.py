from enum import Enum


class UpdatePartFeaturesResponseStatus(str, Enum):
    QUEUED = "queued"

    def __str__(self) -> str:
        return str(self.value)
