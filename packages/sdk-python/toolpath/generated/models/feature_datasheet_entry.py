from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar
from uuid import UUID

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.feature_datasheet import FeatureDatasheet


T = TypeVar("T", bound="FeatureDatasheetEntry")


@_attrs_define
class FeatureDatasheetEntry:
    """
    Attributes:
        feature_id (UUID):
        feature_tag (str):
        feature_type (str):
        datasheet (FeatureDatasheet | Unset): Per-feature DFM measurement facts. Z bounds in the direction frame
            (zMin/zMax; local height is zMax − zMin), stock-to-leave, tolerance band, floor/wall flags and areas, plus a
            per-kind `facts` object (narrow on `facts.kind` for diameters, tool bounds, corner/fillet radius). Lengths are
            mm, angles degrees. The exact shape is the kernel’s FeatureDatasheet (@toolpath/tp-kernel).
    """

    feature_id: UUID
    feature_tag: str
    feature_type: str
    datasheet: FeatureDatasheet | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        feature_id = str(self.feature_id)

        feature_tag = self.feature_tag

        feature_type = self.feature_type

        datasheet: dict[str, Any] | Unset = UNSET
        if not isinstance(self.datasheet, Unset):
            datasheet = self.datasheet.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "featureId": feature_id,
                "featureTag": feature_tag,
                "featureType": feature_type,
            }
        )
        if datasheet is not UNSET:
            field_dict["datasheet"] = datasheet

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.feature_datasheet import FeatureDatasheet

        d = dict(src_dict)
        feature_id = UUID(d.pop("featureId"))

        feature_tag = d.pop("featureTag")

        feature_type = d.pop("featureType")

        _datasheet = d.pop("datasheet", UNSET)
        datasheet: FeatureDatasheet | Unset
        if isinstance(_datasheet, Unset):
            datasheet = UNSET
        else:
            datasheet = FeatureDatasheet.from_dict(_datasheet)

        feature_datasheet_entry = cls(
            feature_id=feature_id,
            feature_tag=feature_tag,
            feature_type=feature_type,
            datasheet=datasheet,
        )

        feature_datasheet_entry.additional_properties = d
        return feature_datasheet_entry

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
