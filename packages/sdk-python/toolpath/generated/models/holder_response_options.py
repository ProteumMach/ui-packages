from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="HolderResponseOptions")


@_attrs_define
class HolderResponseOptions:
    """The import options this result was produced with.

    Attributes:
        tolerance (float):
        fill_bays (bool):
        flipped (bool):
    """

    tolerance: float
    fill_bays: bool
    flipped: bool
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        tolerance = self.tolerance

        fill_bays = self.fill_bays

        flipped = self.flipped

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "tolerance": tolerance,
                "fillBays": fill_bays,
                "flipped": flipped,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        tolerance = d.pop("tolerance")

        fill_bays = d.pop("fillBays")

        flipped = d.pop("flipped")

        holder_response_options = cls(
            tolerance=tolerance,
            fill_bays=fill_bays,
            flipped=flipped,
        )

        holder_response_options.additional_properties = d
        return holder_response_options

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
