from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, Literal, TypeVar, cast

from attrs import define as _attrs_define

if TYPE_CHECKING:
    from ..models.cd_data import CdData


T = TypeVar("T", bound="ProfileFacts")


@_attrs_define
class ProfileFacts:
    """A profile: one pass around the part's outline.

    Attributes:
        kind (Literal['Profile']): Discriminator for this facts variant.
        cd (CdData): Clearance-diameter bounds per tolerance regime, plus the flags derived with them.
        length (float): How far the pass travels, mm — the outline's own length.
        is_modified (bool): Whether the outline is the part's silhouette or the bridged reading of it.
    """

    kind: Literal["Profile"]
    cd: CdData
    length: float
    is_modified: bool

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        cd = self.cd.to_dict()

        length = self.length

        is_modified = self.is_modified

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "kind": kind,
                "cd": cd,
                "length": length,
                "isModified": is_modified,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.cd_data import CdData

        d = dict(src_dict)
        kind = cast(Literal["Profile"], d.pop("kind"))
        if kind != "Profile":
            raise ValueError(f"kind must match const 'Profile', got '{kind}'")

        cd = CdData.from_dict(d.pop("cd"))

        length = d.pop("length")

        is_modified = d.pop("isModified")

        profile_facts = cls(
            kind=kind,
            cd=cd,
            length=length,
            is_modified=is_modified,
        )

        return profile_facts
