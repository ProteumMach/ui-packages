from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.report_units_angle import ReportUnitsAngle
from ..models.report_units_length import ReportUnitsLength

T = TypeVar("T", bound="PartReportResponseUnits")


@_attrs_define
class PartReportResponseUnits:
    """Units used by all dimensional values in this report.

    Attributes:
        length (ReportUnitsLength): Unit used by every length and area measurement.
        angle (ReportUnitsAngle): Unit used by every angular measurement.
    """

    length: ReportUnitsLength
    angle: ReportUnitsAngle
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        length = self.length.value

        angle = self.angle.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "length": length,
                "angle": angle,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        length = ReportUnitsLength(d.pop("length"))

        angle = ReportUnitsAngle(d.pop("angle"))

        part_report_response_units = cls(
            length=length,
            angle=angle,
        )

        part_report_response_units.additional_properties = d
        return part_report_response_units

    @property
    def additional_keys(self) -> list[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
