from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define

T = TypeVar("T", bound="ThreadSpec")


@_attrs_define
class ThreadSpec:
    """The thread a hole is to receive.

    Attributes:
        basic_diameter (float): Nominal major diameter of the thread, in mm.
        thread_pitch (float): Distance between thread crests, in mm.
        min_minor_diameter (float): Smallest allowed minor diameter, in mm.
        max_minor_diameter (float): Largest allowed minor diameter, in mm.
        min_major_diameter (float): Smallest allowed major diameter, in mm.
        thread_percentage (float): How much of the theoretical thread depth is to be formed, as a percentage.
    """

    basic_diameter: float
    thread_pitch: float
    min_minor_diameter: float
    max_minor_diameter: float
    min_major_diameter: float
    thread_percentage: float

    def to_dict(self) -> dict[str, Any]:
        basic_diameter = self.basic_diameter

        thread_pitch = self.thread_pitch

        min_minor_diameter = self.min_minor_diameter

        max_minor_diameter = self.max_minor_diameter

        min_major_diameter = self.min_major_diameter

        thread_percentage = self.thread_percentage

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "basicDiameter": basic_diameter,
                "threadPitch": thread_pitch,
                "minMinorDiameter": min_minor_diameter,
                "maxMinorDiameter": max_minor_diameter,
                "minMajorDiameter": min_major_diameter,
                "threadPercentage": thread_percentage,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        basic_diameter = d.pop("basicDiameter")

        thread_pitch = d.pop("threadPitch")

        min_minor_diameter = d.pop("minMinorDiameter")

        max_minor_diameter = d.pop("maxMinorDiameter")

        min_major_diameter = d.pop("minMajorDiameter")

        thread_percentage = d.pop("threadPercentage")

        thread_spec = cls(
            basic_diameter=basic_diameter,
            thread_pitch=thread_pitch,
            min_minor_diameter=min_minor_diameter,
            max_minor_diameter=max_minor_diameter,
            min_major_diameter=min_major_diameter,
            thread_percentage=thread_percentage,
        )

        return thread_spec
