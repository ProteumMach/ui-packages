from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define

T = TypeVar("T", bound="ToolFitResult")


@_attrs_define
class ToolFitResult:
    """The tool geometry a surface's own shape admits, before the layers are consulted.

    Attributes:
        corner_radius (float): Corner radius the surface shape admits, in mm.
        tool_diameter (float): Largest full-diameter tool the surface shape admits, in mm.
        tool_bottom_diameter (float): Largest bottom diameter the surface shape admits, in mm.
    """

    corner_radius: float
    tool_diameter: float
    tool_bottom_diameter: float

    def to_dict(self) -> dict[str, Any]:
        corner_radius = self.corner_radius

        tool_diameter = self.tool_diameter

        tool_bottom_diameter = self.tool_bottom_diameter

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "cornerRadius": corner_radius,
                "toolDiameter": tool_diameter,
                "toolBottomDiameter": tool_bottom_diameter,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        corner_radius = d.pop("cornerRadius")

        tool_diameter = d.pop("toolDiameter")

        tool_bottom_diameter = d.pop("toolBottomDiameter")

        tool_fit_result = cls(
            corner_radius=corner_radius,
            tool_diameter=tool_diameter,
            tool_bottom_diameter=tool_bottom_diameter,
        )

        return tool_fit_result
