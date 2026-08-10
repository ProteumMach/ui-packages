from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="FeatureDatasheet")


@_attrs_define
class FeatureDatasheet:
    """Per-feature DFM datasheet. Depths (min/max/extended and a depthVariation reach sweep), stock-to-leave, tolerance
    band, floor/wall flags and areas, plus a per-kind `facts` object (narrow on `facts.kind` for diameters, tool bounds,
    corner/fillet radius). Lengths are mm, angles radians. The object is extensible; clients should narrow `facts` using
    `facts.kind`.

    """

    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        feature_datasheet = cls()

        feature_datasheet.additional_properties = d
        return feature_datasheet

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
