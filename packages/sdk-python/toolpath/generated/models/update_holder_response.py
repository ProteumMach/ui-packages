from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar
from uuid import UUID

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.update_holder_response_status import UpdateHolderResponseStatus

T = TypeVar("T", bound="UpdateHolderResponse")


@_attrs_define
class UpdateHolderResponse:
    """
    Attributes:
        job_id (UUID): Identifier of the queued import job.
        holder_id (UUID): Identifier of the holder submitted for import.
        status (UpdateHolderResponseStatus): Initial state of the accepted import job.
    """

    job_id: UUID
    holder_id: UUID
    status: UpdateHolderResponseStatus
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        job_id = str(self.job_id)

        holder_id = str(self.holder_id)

        status = self.status.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "jobId": job_id,
                "holderId": holder_id,
                "status": status,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        job_id = UUID(d.pop("jobId"))

        holder_id = UUID(d.pop("holderId"))

        status = UpdateHolderResponseStatus(d.pop("status"))

        update_holder_response = cls(
            job_id=job_id,
            holder_id=holder_id,
            status=status,
        )

        update_holder_response.additional_properties = d
        return update_holder_response

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
