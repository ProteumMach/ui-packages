from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="Cone")


@_attrs_define
class Cone:
    """
    Attributes:
        thickness (float): Layer height in mm.
        bottom_diameter (float): Diameter at the lower end in mm.
        top_diameter (float): Diameter at the upper end in mm.
    """

    thickness: float
    bottom_diameter: float
    top_diameter: float
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        thickness = self.thickness

        bottom_diameter = self.bottom_diameter

        top_diameter = self.top_diameter

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "thickness": thickness,
                "bottomDiameter": bottom_diameter,
                "topDiameter": top_diameter,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        thickness = d.pop("thickness")

        bottom_diameter = d.pop("bottomDiameter")

        top_diameter = d.pop("topDiameter")

        cone = cls(
            thickness=thickness,
            bottom_diameter=bottom_diameter,
            top_diameter=top_diameter,
        )

        cone.additional_properties = d
        return cone

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
