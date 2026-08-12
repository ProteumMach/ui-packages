from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.compute_feature_datasheets_response_status import ComputeFeatureDatasheetsResponseStatus

T = TypeVar("T", bound="ComputeFeatureDatasheetsResponse")


@_attrs_define
class ComputeFeatureDatasheetsResponse:
    """
    Attributes:
        job_id (str):
        part_id (str):
        status (ComputeFeatureDatasheetsResponseStatus):
    """

    job_id: str
    part_id: str
    status: ComputeFeatureDatasheetsResponseStatus
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        job_id = self.job_id

        part_id = self.part_id

        status = self.status.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "jobId": job_id,
                "partId": part_id,
                "status": status,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        job_id = d.pop("jobId")

        part_id = d.pop("partId")

        status = ComputeFeatureDatasheetsResponseStatus(d.pop("status"))

        compute_feature_datasheets_response = cls(
            job_id=job_id,
            part_id=part_id,
            status=status,
        )

        compute_feature_datasheets_response.additional_properties = d
        return compute_feature_datasheets_response

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
