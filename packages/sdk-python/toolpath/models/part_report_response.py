from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.part_feature import PartFeature
    from ..models.region import Region
    from ..models.report_units import ReportUnits
    from ..models.vec_3 import Vec3


T = TypeVar("T", bound="PartReportResponse")


@_attrs_define
class PartReportResponse:
    """
    Attributes:
        part_id (str):
        report_id (str):
        job_id (str):
        kernel_version (str):
        units (ReportUnits):
        regions (list[Region]):
        features (list[PartFeature]):
        candidate_directions (list[Vec3]):
        mesh_point_count (int):
        mesh_triangle_count (int):
        thumbnail_url (None | str):
        mesh_stl_url (None | str):
        mesh_glb_url (None | str):
        download_ms (int):
        analysis_ms (int):
        total_ms (int):
    """

    part_id: str
    report_id: str
    job_id: str
    kernel_version: str
    units: ReportUnits
    regions: list[Region]
    features: list[PartFeature]
    candidate_directions: list[Vec3]
    mesh_point_count: int
    mesh_triangle_count: int
    thumbnail_url: None | str
    mesh_stl_url: None | str
    mesh_glb_url: None | str
    download_ms: int
    analysis_ms: int
    total_ms: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        part_id = self.part_id

        report_id = self.report_id

        job_id = self.job_id

        kernel_version = self.kernel_version

        units = self.units.to_dict()

        regions = []
        for regions_item_data in self.regions:
            regions_item = regions_item_data.to_dict()
            regions.append(regions_item)

        features = []
        for features_item_data in self.features:
            features_item = features_item_data.to_dict()
            features.append(features_item)

        candidate_directions = []
        for candidate_directions_item_data in self.candidate_directions:
            candidate_directions_item = candidate_directions_item_data.to_dict()
            candidate_directions.append(candidate_directions_item)

        mesh_point_count = self.mesh_point_count

        mesh_triangle_count = self.mesh_triangle_count

        thumbnail_url: None | str
        thumbnail_url = self.thumbnail_url

        mesh_stl_url: None | str
        mesh_stl_url = self.mesh_stl_url

        mesh_glb_url: None | str
        mesh_glb_url = self.mesh_glb_url

        download_ms = self.download_ms

        analysis_ms = self.analysis_ms

        total_ms = self.total_ms

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "partId": part_id,
                "reportId": report_id,
                "jobId": job_id,
                "kernelVersion": kernel_version,
                "units": units,
                "regions": regions,
                "features": features,
                "candidateDirections": candidate_directions,
                "meshPointCount": mesh_point_count,
                "meshTriangleCount": mesh_triangle_count,
                "thumbnailUrl": thumbnail_url,
                "meshStlUrl": mesh_stl_url,
                "meshGlbUrl": mesh_glb_url,
                "downloadMs": download_ms,
                "analysisMs": analysis_ms,
                "totalMs": total_ms,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.part_feature import PartFeature
        from ..models.region import Region
        from ..models.report_units import ReportUnits
        from ..models.vec_3 import Vec3

        d = dict(src_dict)
        part_id = d.pop("partId")

        report_id = d.pop("reportId")

        job_id = d.pop("jobId")

        kernel_version = d.pop("kernelVersion")

        units = ReportUnits.from_dict(d.pop("units"))

        regions = []
        _regions = d.pop("regions")
        for regions_item_data in _regions:
            regions_item = Region.from_dict(regions_item_data)

            regions.append(regions_item)

        features = []
        _features = d.pop("features")
        for features_item_data in _features:
            features_item = PartFeature.from_dict(features_item_data)

            features.append(features_item)

        candidate_directions = []
        _candidate_directions = d.pop("candidateDirections")
        for candidate_directions_item_data in _candidate_directions:
            candidate_directions_item = Vec3.from_dict(candidate_directions_item_data)

            candidate_directions.append(candidate_directions_item)

        mesh_point_count = d.pop("meshPointCount")

        mesh_triangle_count = d.pop("meshTriangleCount")

        def _parse_thumbnail_url(data: object) -> None | str:
            if data is None:
                return data
            return cast(None | str, data)

        thumbnail_url = _parse_thumbnail_url(d.pop("thumbnailUrl"))

        def _parse_mesh_stl_url(data: object) -> None | str:
            if data is None:
                return data
            return cast(None | str, data)

        mesh_stl_url = _parse_mesh_stl_url(d.pop("meshStlUrl"))

        def _parse_mesh_glb_url(data: object) -> None | str:
            if data is None:
                return data
            return cast(None | str, data)

        mesh_glb_url = _parse_mesh_glb_url(d.pop("meshGlbUrl"))

        download_ms = d.pop("downloadMs")

        analysis_ms = d.pop("analysisMs")

        total_ms = d.pop("totalMs")

        part_report_response = cls(
            part_id=part_id,
            report_id=report_id,
            job_id=job_id,
            kernel_version=kernel_version,
            units=units,
            regions=regions,
            features=features,
            candidate_directions=candidate_directions,
            mesh_point_count=mesh_point_count,
            mesh_triangle_count=mesh_triangle_count,
            thumbnail_url=thumbnail_url,
            mesh_stl_url=mesh_stl_url,
            mesh_glb_url=mesh_glb_url,
            download_ms=download_ms,
            analysis_ms=analysis_ms,
            total_ms=total_ms,
        )

        part_report_response.additional_properties = d
        return part_report_response

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
