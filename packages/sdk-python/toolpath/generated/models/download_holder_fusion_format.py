from enum import Enum


class DownloadHolderFusionFormat(str, Enum):
    DOCUMENT = "document"
    LIBRARY = "library"

    def __str__(self) -> str:
        return str(self.value)
