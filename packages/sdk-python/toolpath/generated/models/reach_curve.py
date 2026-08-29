from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define

T = TypeVar("T", bound="ReachCurve")


@_attrs_define
class ReachCurve:
    """How deep a tool must reach, by how far outboard of the cut the material stands: material
    within `horizontalOffset[i]` of the feature rises to `verticalOffset[i]` above it, so
    anything on the tool standing that far past its own cutting edge must clear that much.
    Both arrays are the same length, ascending, non-negative, in mm; the curve is a
    non-decreasing step function, and offsets beyond its last knot clamp to it.

    Offsets are measured from the feature, never from the tool's axis: offset zero is the
    wall of the cut, so material at offset `d` meets the tool at radius `d` plus the cutting
    radius. Each reading is the worst case over the feature's whole surface — the tallest
    material within that distance of any point of it, measured above that point.

    ![A tool cutting a pocket whose wall stands at the cut, with a boss further out: the
    horizontal offsets run outward from the feature's edge, the vertical offsets up from
    its floor](./media/reach-curve.svg)

    The tool checks sweep a tool's shank and holder over this curve; it is here so a
    caller can draw it, or sweep an envelope of its own.

        Attributes:
            horizontal_offset (list[float]): Horizontal distance outward from the feature, in mm, ascending.
            vertical_offset (list[float]): How far above the feature the material within that distance rises, in mm,
                ascending.
    """

    horizontal_offset: list[float]
    vertical_offset: list[float]

    def to_dict(self) -> dict[str, Any]:
        horizontal_offset = self.horizontal_offset

        vertical_offset = self.vertical_offset

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "horizontalOffset": horizontal_offset,
                "verticalOffset": vertical_offset,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        horizontal_offset = cast(list[float], d.pop("horizontalOffset"))

        vertical_offset = cast(list[float], d.pop("verticalOffset"))

        reach_curve = cls(
            horizontal_offset=horizontal_offset,
            vertical_offset=vertical_offset,
        )

        return reach_curve
