from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.feature_datasheet import FeatureDatasheet
    from ..models.part_feature_axis import PartFeatureAxis
    from ..models.vec_3 import Vec3


T = TypeVar("T", bound="PartFeature")


@_attrs_define
class PartFeature:
    """
    Attributes:
        feature_tag (str):
        region_idxs (list[int]):
        feature_type (str):
        machining_direction (Vec3):
        axis (PartFeatureAxis):
        datasheet (FeatureDatasheet | Unset): Per-feature DFM datasheet. Depths (min/max/extended and a depthVariation
            reach sweep), stock-to-leave, tolerance band, floor/wall flags and areas, plus a per-kind `facts` object (narrow
            on `facts.kind` for diameters, tool bounds, corner/fillet radius). Lengths are mm, angles radians. The object is
            extensible; clients should narrow `facts` using `facts.kind`.
    """

    feature_tag: str
    region_idxs: list[int]
    feature_type: str
    machining_direction: Vec3
    axis: PartFeatureAxis
    datasheet: FeatureDatasheet | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        feature_tag = self.feature_tag

        region_idxs = self.region_idxs

        feature_type = self.feature_type

        machining_direction = self.machining_direction.to_dict()

        axis = self.axis.to_dict()

        datasheet: dict[str, Any] | Unset = UNSET
        if not isinstance(self.datasheet, Unset):
            datasheet = self.datasheet.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "featureTag": feature_tag,
                "regionIdxs": region_idxs,
                "featureType": feature_type,
                "machiningDirection": machining_direction,
                "axis": axis,
            }
        )
        if datasheet is not UNSET:
            field_dict["datasheet"] = datasheet

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.feature_datasheet import FeatureDatasheet
        from ..models.part_feature_axis import PartFeatureAxis
        from ..models.vec_3 import Vec3

        d = dict(src_dict)
        feature_tag = d.pop("featureTag")

        region_idxs = cast(list[int], d.pop("regionIdxs"))

        feature_type = d.pop("featureType")

        machining_direction = Vec3.from_dict(d.pop("machiningDirection"))

        axis = PartFeatureAxis.from_dict(d.pop("axis"))

        _datasheet = d.pop("datasheet", UNSET)
        datasheet: FeatureDatasheet | Unset
        if isinstance(_datasheet, Unset):
            datasheet = UNSET
        else:
            datasheet = FeatureDatasheet.from_dict(_datasheet)

        part_feature = cls(
            feature_tag=feature_tag,
            region_idxs=region_idxs,
            feature_type=feature_type,
            machining_direction=machining_direction,
            axis=axis,
            datasheet=datasheet,
        )

        part_feature.additional_properties = d
        return part_feature

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
