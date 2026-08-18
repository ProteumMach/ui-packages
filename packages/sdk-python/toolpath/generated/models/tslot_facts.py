from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, Literal, TypeVar, cast

from attrs import define as _attrs_define

if TYPE_CHECKING:
    from ..models.cd_data import CdData


T = TypeVar("T", bound="TslotFacts")


@_attrs_define
class TslotFacts:
    """A t-slot: a groove cut sideways into a wall or around a post, under a ceiling the
    machining direction cannot see past.

        Attributes:
            kind (Literal['Tslot']): Discriminator for this facts variant.
            is_external (bool): The slot runs around material standing in it rather than into the material
                around a void.
            is_closed (bool): The slot's walls close on themselves in plan view.
            undercut_depth (float): How far the groove runs back from its opening, radially; infinite when the slot
                could not be measured.
            max_entry_cd (float): The widest tool that can come down through the opening above the slot to reach
                it; infinite when nothing above constrains one, zero when nothing fits at all.
            cd (CdData): Clearance-diameter bounds per tolerance regime, plus the flags derived with them.
            fillet_radius (float): Radius of the blend where the slot's walls meet its floor and ceiling; 0.0 when
                sharp.
    """

    kind: Literal["Tslot"]
    is_external: bool
    is_closed: bool
    undercut_depth: float
    max_entry_cd: float
    cd: CdData
    fillet_radius: float

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        is_external = self.is_external

        is_closed = self.is_closed

        undercut_depth = self.undercut_depth

        max_entry_cd = self.max_entry_cd

        cd = self.cd.to_dict()

        fillet_radius = self.fillet_radius

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "kind": kind,
                "isExternal": is_external,
                "isClosed": is_closed,
                "undercutDepth": undercut_depth,
                "maxEntryCd": max_entry_cd,
                "cd": cd,
                "filletRadius": fillet_radius,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.cd_data import CdData

        d = dict(src_dict)
        kind = cast(Literal["Tslot"], d.pop("kind"))
        if kind != "Tslot":
            raise ValueError(f"kind must match const 'Tslot', got '{kind}'")

        is_external = d.pop("isExternal")

        is_closed = d.pop("isClosed")

        undercut_depth = d.pop("undercutDepth")

        max_entry_cd = d.pop("maxEntryCd")

        cd = CdData.from_dict(d.pop("cd"))

        fillet_radius = d.pop("filletRadius")

        tslot_facts = cls(
            kind=kind,
            is_external=is_external,
            is_closed=is_closed,
            undercut_depth=undercut_depth,
            max_entry_cd=max_entry_cd,
            cd=cd,
            fillet_radius=fillet_radius,
        )

        return tslot_facts
