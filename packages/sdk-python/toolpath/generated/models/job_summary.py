from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast
from uuid import UUID

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.job_summary_status import JobSummaryStatus

T = TypeVar("T", bound="JobSummary")


@_attrs_define
class JobSummary:
    """
    Attributes:
        part_uuid (UUID): Identifier of the part this job processes.
        job_uuid (UUID): Identifier of this job.
        product_type (str): Product operation performed by the job, such as analyze-part or enrich-features.
        status (JobSummaryStatus): Current durable state of the job.
        progress (int | None): Worker-reported completion percentage, or null before progress is available.
        created_at (datetime.datetime): Time at which the job was created, in ISO 8601 format.
    """

    part_uuid: UUID
    job_uuid: UUID
    product_type: str
    status: JobSummaryStatus
    progress: int | None
    created_at: datetime.datetime
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        part_uuid = str(self.part_uuid)

        job_uuid = str(self.job_uuid)

        product_type = self.product_type

        status = self.status.value

        progress: int | None
        progress = self.progress

        created_at = self.created_at.isoformat()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "partUuid": part_uuid,
                "jobUuid": job_uuid,
                "productType": product_type,
                "status": status,
                "progress": progress,
                "createdAt": created_at,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        part_uuid = UUID(d.pop("partUuid"))

        job_uuid = UUID(d.pop("jobUuid"))

        product_type = d.pop("productType")

        status = JobSummaryStatus(d.pop("status"))

        def _parse_progress(data: object) -> int | None:
            if data is None:
                return data
            return cast(int | None, data)

        progress = _parse_progress(d.pop("progress"))

        created_at = datetime.datetime.fromisoformat(d.pop("createdAt"))

        job_summary = cls(
            part_uuid=part_uuid,
            job_uuid=job_uuid,
            product_type=product_type,
            status=status,
            progress=progress,
            created_at=created_at,
        )

        job_summary.additional_properties = d
        return job_summary

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
