from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast
from uuid import UUID

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.job_detail_status import JobDetailStatus

T = TypeVar("T", bound="JobDetail")


@_attrs_define
class JobDetail:
    """
    Attributes:
        part_uuid (UUID): Identifier of the part this job processes.
        job_uuid (UUID): Identifier of this job.
        product_type (str): Product operation performed by the job, such as analyze-part or enrich-features.
        status (JobDetailStatus): Current durable state of the job.
        progress (int | None): Worker-reported completion percentage, or null before progress is available.
        error (None | str): Failure reason when the job status is failed; otherwise null.
        report_id (None | UUID): Identifier of the report produced by a successful analysis, or null until available.
        created_at (datetime.datetime): Time at which the job was created, in ISO 8601 format.
    """

    part_uuid: UUID
    job_uuid: UUID
    product_type: str
    status: JobDetailStatus
    progress: int | None
    error: None | str
    report_id: None | UUID
    created_at: datetime.datetime
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        part_uuid = str(self.part_uuid)

        job_uuid = str(self.job_uuid)

        product_type = self.product_type

        status = self.status.value

        progress: int | None
        progress = self.progress

        error: None | str
        error = self.error

        report_id: None | str
        if isinstance(self.report_id, UUID):
            report_id = str(self.report_id)
        else:
            report_id = self.report_id

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
                "error": error,
                "reportId": report_id,
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

        status = JobDetailStatus(d.pop("status"))

        def _parse_progress(data: object) -> int | None:
            if data is None:
                return data
            return cast(int | None, data)

        progress = _parse_progress(d.pop("progress"))

        def _parse_error(data: object) -> None | str:
            if data is None:
                return data
            return cast(None | str, data)

        error = _parse_error(d.pop("error"))

        def _parse_report_id(data: object) -> None | UUID:
            if data is None:
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                report_id_type_0 = UUID(data)

                return report_id_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | UUID, data)

        report_id = _parse_report_id(d.pop("reportId"))

        created_at = datetime.datetime.fromisoformat(d.pop("createdAt"))

        job_detail = cls(
            part_uuid=part_uuid,
            job_uuid=job_uuid,
            product_type=product_type,
            status=status,
            progress=progress,
            error=error,
            report_id=report_id,
            created_at=created_at,
        )

        job_detail.additional_properties = d
        return job_detail

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
