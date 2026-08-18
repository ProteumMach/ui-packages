from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast
from uuid import UUID

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.direction_z_bounds import DirectionZBounds
    from ..models.part_feature import PartFeature
    from ..models.part_report_response_units import PartReportResponseUnits
    from ..models.region import Region
    from ..models.vec_3 import Vec3


T = TypeVar("T", bound="PartReportResponse")


@_attrs_define
class PartReportResponse:
    """
    Attributes:
        part_id (UUID): Identifier of the part this report describes.
        report_id (UUID): Identifier of this immutable analysis report.
        job_id (UUID): Identifier of the analysis job that produced this report.
        kernel_version (str): Version of the Toolpath kernel that produced this report.
        units (PartReportResponseUnits): Units used by all dimensional values in this report.
        regions (list[Region]): Recognized B-rep regions, ordered by region index.
        features (list[PartFeature]): Features recognized in this analysis run.
        candidate_directions (list[Vec3]): Directions from which the part can be analyzed or machined.
        direction_z_bounds (list[DirectionZBounds] | None): Part z extents for each candidate direction, or null when
            detail enrichment did not run.
        mesh_point_count (int): Number of points in the generated mesh.
        mesh_triangle_count (int): Number of triangles in the generated mesh.
        thumbnail_url (None | str): 15-minute URL for the rendered PNG thumbnail, or null when absent.
        mesh_stl_url (None | str): 15-minute URL for the generated STL mesh, or null when absent.
        mesh_glb_url (None | str): 15-minute URL for the generated GLB mesh, or null when absent.
        download_ms (int): Worker time spent downloading the source CAD file, in milliseconds.
        recognition_ms (int): Kernel time spent on initial part analysis, in milliseconds.
        enrichment_ms (int): Kernel time spent building per-feature details, in milliseconds.
        total_ms (int): Total worker processing time for this report, in milliseconds.
    """

    part_id: UUID
    report_id: UUID
    job_id: UUID
    kernel_version: str
    units: PartReportResponseUnits
    regions: list[Region]
    features: list[PartFeature]
    candidate_directions: list[Vec3]
    direction_z_bounds: list[DirectionZBounds] | None
    mesh_point_count: int
    mesh_triangle_count: int
    thumbnail_url: None | str
    mesh_stl_url: None | str
    mesh_glb_url: None | str
    download_ms: int
    recognition_ms: int
    enrichment_ms: int
    total_ms: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        part_id = str(self.part_id)

        report_id = str(self.report_id)

        job_id = str(self.job_id)

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

        direction_z_bounds: list[dict[str, Any]] | None
        if isinstance(self.direction_z_bounds, list):
            direction_z_bounds = []
            for direction_z_bounds_type_0_item_data in self.direction_z_bounds:
                direction_z_bounds_type_0_item = direction_z_bounds_type_0_item_data.to_dict()
                direction_z_bounds.append(direction_z_bounds_type_0_item)

        else:
            direction_z_bounds = self.direction_z_bounds

        mesh_point_count = self.mesh_point_count

        mesh_triangle_count = self.mesh_triangle_count

        thumbnail_url: None | str
        thumbnail_url = self.thumbnail_url

        mesh_stl_url: None | str
        mesh_stl_url = self.mesh_stl_url

        mesh_glb_url: None | str
        mesh_glb_url = self.mesh_glb_url

        download_ms = self.download_ms

        recognition_ms = self.recognition_ms

        enrichment_ms = self.enrichment_ms

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
                "directionZBounds": direction_z_bounds,
                "meshPointCount": mesh_point_count,
                "meshTriangleCount": mesh_triangle_count,
                "thumbnailUrl": thumbnail_url,
                "meshStlUrl": mesh_stl_url,
                "meshGlbUrl": mesh_glb_url,
                "downloadMs": download_ms,
                "recognitionMs": recognition_ms,
                "enrichmentMs": enrichment_ms,
                "totalMs": total_ms,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.direction_z_bounds import DirectionZBounds
        from ..models.part_feature import PartFeature
        from ..models.part_report_response_units import PartReportResponseUnits
        from ..models.region import Region
        from ..models.vec_3 import Vec3

        d = dict(src_dict)
        part_id = UUID(d.pop("partId"))

        report_id = UUID(d.pop("reportId"))

        job_id = UUID(d.pop("jobId"))

        kernel_version = d.pop("kernelVersion")

        units = PartReportResponseUnits.from_dict(d.pop("units"))

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

        def _parse_direction_z_bounds(data: object) -> list[DirectionZBounds] | None:
            if data is None:
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                direction_z_bounds_type_0 = []
                _direction_z_bounds_type_0 = data
                for direction_z_bounds_type_0_item_data in _direction_z_bounds_type_0:
                    direction_z_bounds_type_0_item = DirectionZBounds.from_dict(direction_z_bounds_type_0_item_data)

                    direction_z_bounds_type_0.append(direction_z_bounds_type_0_item)

                return direction_z_bounds_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[DirectionZBounds] | None, data)

        direction_z_bounds = _parse_direction_z_bounds(d.pop("directionZBounds"))

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

        recognition_ms = d.pop("recognitionMs")

        enrichment_ms = d.pop("enrichmentMs")

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
            direction_z_bounds=direction_z_bounds,
            mesh_point_count=mesh_point_count,
            mesh_triangle_count=mesh_triangle_count,
            thumbnail_url=thumbnail_url,
            mesh_stl_url=mesh_stl_url,
            mesh_glb_url=mesh_glb_url,
            download_ms=download_ms,
            recognition_ms=recognition_ms,
            enrichment_ms=enrichment_ms,
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
