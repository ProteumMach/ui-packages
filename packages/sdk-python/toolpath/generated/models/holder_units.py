from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.holder_units_angle import HolderUnitsAngle
from ..models.holder_units_length import HolderUnitsLength

T = TypeVar("T", bound="HolderUnits")


@_attrs_define
class HolderUnits:
    """
    Attributes:
        length (HolderUnitsLength): Unit used by every length and diameter measurement.
        angle (HolderUnitsAngle): Unit used by every angular measurement.
    """

    length: HolderUnitsLength
    angle: HolderUnitsAngle
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        length = self.length.value

        angle = self.angle.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "length": length,
                "angle": angle,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        length = HolderUnitsLength(d.pop("length"))

        angle = HolderUnitsAngle(d.pop("angle"))

        holder_units = cls(
            length=length,
            angle=angle,
        )

        holder_units.additional_properties = d
        return holder_units

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
