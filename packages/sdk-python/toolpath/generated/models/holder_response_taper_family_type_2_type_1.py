from enum import Enum


class HolderResponseTaperFamilyType2Type1(str, Enum):
    HSK = "hsk"
    ISO7X24 = "iso7x24"

    def __str__(self) -> str:
        return str(self.value)
