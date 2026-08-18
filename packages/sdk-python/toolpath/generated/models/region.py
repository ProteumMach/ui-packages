from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="Region")


@_attrs_define
class Region:
    """
    Attributes:
        idx (int):
        split_origin (int):
        shape_kind (str):
        area (float):
        triangle_start (int):
        triangle_end (int):
    """

    idx: int
    split_origin: int
    shape_kind: str
    area: float
    triangle_start: int
    triangle_end: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        idx = self.idx

        split_origin = self.split_origin

        shape_kind = self.shape_kind

        area = self.area

        triangle_start = self.triangle_start

        triangle_end = self.triangle_end

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "idx": idx,
                "splitOrigin": split_origin,
                "shapeKind": shape_kind,
                "area": area,
                "triangleStart": triangle_start,
                "triangleEnd": triangle_end,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        idx = d.pop("idx")

        split_origin = d.pop("splitOrigin")

        shape_kind = d.pop("shapeKind")

        area = d.pop("area")

        triangle_start = d.pop("triangleStart")

        triangle_end = d.pop("triangleEnd")

        region = cls(
            idx=idx,
            split_origin=split_origin,
            shape_kind=shape_kind,
            area=area,
            triangle_start=triangle_start,
            triangle_end=triangle_end,
        )

        region.additional_properties = d
        return region

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
