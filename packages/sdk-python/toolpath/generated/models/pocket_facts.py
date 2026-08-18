from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, Literal, TypeVar, cast

from attrs import define as _attrs_define

if TYPE_CHECKING:
    from ..models.cd_data import CdData


T = TypeVar("T", bound="PocketFacts")


@_attrs_define
class PocketFacts:
    """A pocket: a walled space with a floor, and the blend where the two meet.

    Attributes:
        kind (Literal['Pocket']): Discriminator for this facts variant.
        cd (CdData): Clearance-diameter bounds per tolerance regime, plus the flags derived with them.
        max_bottom_diameter (float): The bottom diameter a terminal tool must not exceed; negative infinity when
            unconstrained.
        fillet_radius (float): Radius of the floor fillet; 0.0 when unfilleted.
        fillet_height (float): Height of the floor fillet; 0.0 when unfilleted.
    """

    kind: Literal["Pocket"]
    cd: CdData
    max_bottom_diameter: float
    fillet_radius: float
    fillet_height: float

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        cd = self.cd.to_dict()

        max_bottom_diameter = self.max_bottom_diameter

        fillet_radius = self.fillet_radius

        fillet_height = self.fillet_height

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "kind": kind,
                "cd": cd,
                "maxBottomDiameter": max_bottom_diameter,
                "filletRadius": fillet_radius,
                "filletHeight": fillet_height,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.cd_data import CdData

        d = dict(src_dict)
        kind = cast(Literal["Pocket"], d.pop("kind"))
        if kind != "Pocket":
            raise ValueError(f"kind must match const 'Pocket', got '{kind}'")

        cd = CdData.from_dict(d.pop("cd"))

        max_bottom_diameter = d.pop("maxBottomDiameter")

        fillet_radius = d.pop("filletRadius")

        fillet_height = d.pop("filletHeight")

        pocket_facts = cls(
            kind=kind,
            cd=cd,
            max_bottom_diameter=max_bottom_diameter,
            fillet_radius=fillet_radius,
            fillet_height=fillet_height,
        )

        return pocket_facts
