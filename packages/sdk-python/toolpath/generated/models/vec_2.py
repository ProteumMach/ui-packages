from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define

T = TypeVar("T", bound="Vec2")


@_attrs_define
class Vec2:
    """A 2D vector (a plain `{ x, y }` object).

    Attributes:
        x (float): Horizontal x coordinate in the current frame.
        y (float): Horizontal y coordinate in the current frame.
    """

    x: float
    y: float

    def to_dict(self) -> dict[str, Any]:
        x = self.x

        y = self.y

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "x": x,
                "y": y,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        x = d.pop("x")

        y = d.pop("y")

        vec_2 = cls(
            x=x,
            y=y,
        )

        return vec_2
