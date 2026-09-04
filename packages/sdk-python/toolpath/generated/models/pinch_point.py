from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define

if TYPE_CHECKING:
    from ..models.vec_2 import Vec2


T = TypeVar("T", bound="PinchPoint")


@_attrs_define
class PinchPoint:
    """Where a feature is at its tightest: one place its clearance reaches the minimum, as the
    disc that measures it.

    The disc fits in the space the clearance was measured in and touches the feature
    boundary, so a cylinder of `diameter` standing at `center` and spanning the datasheet's
    `zMin`..`zMax` is exactly the widest tool that reaches the boundary there — which is what
    makes these drawable. Same tool frame as the rest of the datasheet; mm.

        Attributes:
            center (Vec2): A 2D vector (a plain `{ x, y }` object).
            diameter (float): The disc's diameter, which is the clearance there — the datasheet's minimum
                clearance diameter, up to the tolerance it was measured at.
    """

    center: Vec2
    diameter: float

    def to_dict(self) -> dict[str, Any]:
        center = self.center.to_dict()

        diameter = self.diameter

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "center": center,
                "diameter": diameter,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.vec_2 import Vec2

        d = dict(src_dict)
        center = Vec2.from_dict(d.pop("center"))

        diameter = d.pop("diameter")

        pinch_point = cls(
            center=center,
            diameter=diameter,
        )

        return pinch_point
