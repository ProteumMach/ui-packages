from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.key_validation_response_status import KeyValidationResponseStatus

T = TypeVar("T", bound="KeyValidationResponse")


@_attrs_define
class KeyValidationResponse:
    """
    Attributes:
        valid (bool): Whether the key is usable right now. Example: True.
        status (KeyValidationResponseStatus): The derived key status: active (usable), revoked (disabled), expired (past
            expiry), or invalid (unknown key). Example: active.
    """

    valid: bool
    status: KeyValidationResponseStatus
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        valid = self.valid

        status = self.status.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "valid": valid,
                "status": status,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        valid = d.pop("valid")

        status = KeyValidationResponseStatus(d.pop("status"))

        key_validation_response = cls(
            valid=valid,
            status=status,
        )

        key_validation_response.additional_properties = d
        return key_validation_response

    @property
    def additional_keys(self) -> list[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
