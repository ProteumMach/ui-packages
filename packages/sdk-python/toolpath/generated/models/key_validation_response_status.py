from enum import Enum


class KeyValidationResponseStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    INVALID = "invalid"
    REVOKED = "revoked"

    def __str__(self) -> str:
        return str(self.value)
