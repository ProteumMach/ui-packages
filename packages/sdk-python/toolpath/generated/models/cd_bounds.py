from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define

T = TypeVar("T", bound="CdBounds")


@_attrs_define
class CdBounds:
    """How wide a tool a feature admits — two upper bounds, differing in how much of the
    feature the tool has to reach. `min` is the largest tool that reaches every part of
    the feature, `max` the largest that fits somewhere; `min <= max`. Infinities are
    meaningful — see `CdBounds` in the `api` crate for the three sentinel states.

        Attributes:
            min_ (float): Largest tool diameter that reaches every point of the feature, in mm.
            max_ (float): Largest tool diameter that fits somewhere in the feature, in mm.
    """

    min_: float
    max_: float

    def to_dict(self) -> dict[str, Any]:
        min_ = self.min_

        max_ = self.max_

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "min": min_,
                "max": max_,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        min_ = d.pop("min")

        max_ = d.pop("max")

        cd_bounds = cls(
            min_=min_,
            max_=max_,
        )

        return cd_bounds
