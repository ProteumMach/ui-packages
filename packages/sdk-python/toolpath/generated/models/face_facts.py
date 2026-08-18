from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, Literal, TypeVar, cast

from attrs import define as _attrs_define

if TYPE_CHECKING:
    from ..models.cd_data import CdData


T = TypeVar("T", bound="FaceFacts")


@_attrs_define
class FaceFacts:
    """A face: a plane square to the tool axis, cleared by sweeping across it.

    Attributes:
        kind (Literal['Face']): Discriminator for this facts variant.
        is_top_face (bool): The face is the highest surface of the part along the tool axis.
        is_facing (bool): The face is to be faced off: a top face the fixture does not rule out.
        needs_sidemill (bool): Sweeping the floor does not clear the face on its own — a wall pass must follow.
        cd (CdData): Clearance-diameter bounds per tolerance regime, plus the flags derived with them.
        max_bottom_diameter (float): Largest bottom diameter a terminal tool may have, in mm.
    """

    kind: Literal["Face"]
    is_top_face: bool
    is_facing: bool
    needs_sidemill: bool
    cd: CdData
    max_bottom_diameter: float

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        is_top_face = self.is_top_face

        is_facing = self.is_facing

        needs_sidemill = self.needs_sidemill

        cd = self.cd.to_dict()

        max_bottom_diameter = self.max_bottom_diameter

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "kind": kind,
                "isTopFace": is_top_face,
                "isFacing": is_facing,
                "needsSidemill": needs_sidemill,
                "cd": cd,
                "maxBottomDiameter": max_bottom_diameter,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.cd_data import CdData

        d = dict(src_dict)
        kind = cast(Literal["Face"], d.pop("kind"))
        if kind != "Face":
            raise ValueError(f"kind must match const 'Face', got '{kind}'")

        is_top_face = d.pop("isTopFace")

        is_facing = d.pop("isFacing")

        needs_sidemill = d.pop("needsSidemill")

        cd = CdData.from_dict(d.pop("cd"))

        max_bottom_diameter = d.pop("maxBottomDiameter")

        face_facts = cls(
            kind=kind,
            is_top_face=is_top_face,
            is_facing=is_facing,
            needs_sidemill=needs_sidemill,
            cd=cd,
            max_bottom_diameter=max_bottom_diameter,
        )

        return face_facts
