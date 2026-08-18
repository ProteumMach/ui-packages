from enum import Enum


class ThreadProcess(str, Enum):
    CUTTAP = "CutTap"
    FORMTAP = "FormTap"
    THREADMILL = "ThreadMill"

    def __str__(self) -> str:
        return str(self.value)
