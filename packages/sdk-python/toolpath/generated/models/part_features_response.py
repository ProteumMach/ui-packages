from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.part_feature_entry import PartFeatureEntry


T = TypeVar("T", bound="PartFeaturesResponse")


@_attrs_define
class PartFeaturesResponse:
    """
    Attributes:
        datasheets (list[PartFeatureEntry]): Detailed machining data for requested features.
        not_found (list[str]): Requested feature identifiers that were unknown.
    """

    datasheets: list[PartFeatureEntry]
    not_found: list[str]
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        datasheets = []
        for datasheets_item_data in self.datasheets:
            datasheets_item = datasheets_item_data.to_dict()
            datasheets.append(datasheets_item)

        not_found = self.not_found

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "datasheets": datasheets,
                "notFound": not_found,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.part_feature_entry import PartFeatureEntry

        d = dict(src_dict)
        datasheets = []
        _datasheets = d.pop("datasheets")
        for datasheets_item_data in _datasheets:
            datasheets_item = PartFeatureEntry.from_dict(datasheets_item_data)

            datasheets.append(datasheets_item)

        not_found = cast(list[str], d.pop("notFound"))

        part_features_response = cls(
            datasheets=datasheets,
            not_found=not_found,
        )

        part_features_response.additional_properties = d
        return part_features_response

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
