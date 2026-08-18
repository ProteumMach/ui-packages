from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define

if TYPE_CHECKING:
    from ..models.cd_bounds import CdBounds


T = TypeVar("T", bound="CdData")


@_attrs_define
class CdData:
    """Clearance-diameter bounds per tolerance regime, plus the flags derived with them.

    Attributes:
        ignore (CdBounds): How wide a tool a feature admits — two upper bounds, differing in how much of the
            feature the tool has to reach. `min` is the largest tool that reaches every part of
            the feature, `max` the largest that fits somewhere; `min <= max`. Infinities are
            meaningful — see `CdBounds` in the `api` crate for the three sentinel states.
        deviate (CdBounds): How wide a tool a feature admits — two upper bounds, differing in how much of the
            feature the tool has to reach. `min` is the largest tool that reaches every part of
            the feature, `max` the largest that fits somewhere; `min <= max`. Infinities are
            meaningful — see `CdBounds` in the `api` crate for the three sentinel states.
        effective_adaptive (CdBounds): How wide a tool a feature admits — two upper bounds, differing in how much of the
            feature the tool has to reach. `min` is the largest tool that reaches every part of
            the feature, `max` the largest that fits somewhere; `min <= max`. Infinities are
            meaningful — see `CdBounds` in the `api` crate for the three sentinel states.
        terminal_corner_radius (float): The corner radius a terminal tool must not exceed; negative infinity when
            unconstrained.
    """

    ignore: CdBounds
    deviate: CdBounds
    effective_adaptive: CdBounds
    terminal_corner_radius: float

    def to_dict(self) -> dict[str, Any]:
        ignore = self.ignore.to_dict()

        deviate = self.deviate.to_dict()

        effective_adaptive = self.effective_adaptive.to_dict()

        terminal_corner_radius = self.terminal_corner_radius

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "ignore": ignore,
                "deviate": deviate,
                "effectiveAdaptive": effective_adaptive,
                "terminalCornerRadius": terminal_corner_radius,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.cd_bounds import CdBounds

        d = dict(src_dict)
        ignore = CdBounds.from_dict(d.pop("ignore"))

        deviate = CdBounds.from_dict(d.pop("deviate"))

        effective_adaptive = CdBounds.from_dict(d.pop("effectiveAdaptive"))

        terminal_corner_radius = d.pop("terminalCornerRadius")

        cd_data = cls(
            ignore=ignore,
            deviate=deviate,
            effective_adaptive=effective_adaptive,
            terminal_corner_radius=terminal_corner_radius,
        )

        return cd_data
