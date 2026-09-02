from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define

T = TypeVar("T", bound="SurfaceAreas")


@_attrs_define
class SurfaceAreas:
    """What a feature's surface is made of: every region of it in exactly one bucket, so the five
    add up to its surface area and nothing is counted twice.

    A description of the feature, not of a pass — see `projectedFloorArea` for the pair that
    says what a pass sweeps, and the picture there for how the two families differ. A bucket is
    zero where the feature has no such surface. Areas are of the meshed regions, so a curved
    surface reads a shade under its exact area.

        Attributes:
            floor_area (float): Surface square to the tool axis, in mm².
            wall_area (float): Surface running along it, in mm².
            fillet_area (float): The concave rounds between the two, in mm² — as surface, so a quarter round of radius
                `r` over a length `L` reads `(π/2)·r·L`, not the `r·L` either projection sees.
            chamfer_area (float): The bevels, in mm².
            contour_area (float): Everything else, in mm²: surfaces with no flat to stand on.
    """

    floor_area: float
    wall_area: float
    fillet_area: float
    chamfer_area: float
    contour_area: float

    def to_dict(self) -> dict[str, Any]:
        floor_area = self.floor_area

        wall_area = self.wall_area

        fillet_area = self.fillet_area

        chamfer_area = self.chamfer_area

        contour_area = self.contour_area

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "floorArea": floor_area,
                "wallArea": wall_area,
                "filletArea": fillet_area,
                "chamferArea": chamfer_area,
                "contourArea": contour_area,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        floor_area = d.pop("floorArea")

        wall_area = d.pop("wallArea")

        fillet_area = d.pop("filletArea")

        chamfer_area = d.pop("chamferArea")

        contour_area = d.pop("contourArea")

        surface_areas = cls(
            floor_area=floor_area,
            wall_area=wall_area,
            fillet_area=fillet_area,
            chamfer_area=chamfer_area,
            contour_area=contour_area,
        )

        return surface_areas
