from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar
from uuid import UUID

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="UpdatePartFeaturesRequest")


@_attrs_define
class UpdatePartFeaturesRequest:
    """
    Attributes:
        feature_ids (list[UUID]): Identifiers of features from one part whose detailed machining data should be
            generated.
    """

    feature_ids: list[UUID]
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        feature_ids = []
        for feature_ids_item_data in self.feature_ids:
            feature_ids_item = str(feature_ids_item_data)
            feature_ids.append(feature_ids_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "featureIds": feature_ids,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        feature_ids = []
        _feature_ids = d.pop("featureIds")
        for feature_ids_item_data in _feature_ids:
            feature_ids_item = UUID(feature_ids_item_data)

            feature_ids.append(feature_ids_item)

        update_part_features_request = cls(
            feature_ids=feature_ids,
        )

        update_part_features_request.additional_properties = d
        return update_part_features_request

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
