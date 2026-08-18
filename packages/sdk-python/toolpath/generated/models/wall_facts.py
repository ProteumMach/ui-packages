from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, Literal, TypeVar, cast

from attrs import define as _attrs_define

if TYPE_CHECKING:
    from ..models.cd_data import CdData


T = TypeVar("T", bound="WallFacts")


@_attrs_define
class WallFacts:
    """A wall: a run of surface square to the tool axis, with no floor of its own.

    Attributes:
        kind (Literal['Wall']): Discriminator for this facts variant.
        cd (CdData): Clearance-diameter bounds per tolerance regime, plus the flags derived with them.
    """

    kind: Literal["Wall"]
    cd: CdData

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        cd = self.cd.to_dict()

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "kind": kind,
                "cd": cd,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.cd_data import CdData

        d = dict(src_dict)
        kind = cast(Literal["Wall"], d.pop("kind"))
        if kind != "Wall":
            raise ValueError(f"kind must match const 'Wall', got '{kind}'")

        cd = CdData.from_dict(d.pop("cd"))

        wall_facts = cls(
            kind=kind,
            cd=cd,
        )

        return wall_facts
