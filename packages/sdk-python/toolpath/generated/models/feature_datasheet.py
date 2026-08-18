from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define

from ..models.feature_type import FeatureType

if TYPE_CHECKING:
    from ..models.boss_facts import BossFacts
    from ..models.chamfer_facts import ChamferFacts
    from ..models.dovetail_facts import DovetailFacts
    from ..models.face_facts import FaceFacts
    from ..models.hole_facts import HoleFacts
    from ..models.pocket_facts import PocketFacts
    from ..models.profile_facts import ProfileFacts
    from ..models.surface_facts import SurfaceFacts
    from ..models.tolerance_band import ToleranceBand
    from ..models.tslot_facts import TslotFacts
    from ..models.wall_facts import WallFacts


T = TypeVar("T", bound="FeatureDatasheet")


@_attrs_define
class FeatureDatasheet:
    """One feature as machining sees it: static, self-contained, and enough to choose a
    tool against without having the part in hand. All lengths mm and angles degrees;
    z runs up the tool axis, so `zMin` is the bottom of the feature and `zMax` its top.

        Attributes:
            feature_type (FeatureType): What kind of thing a feature is, and so how it gets machined. The names are the
                contract at this boundary (the shared numeric wire format stays inside the binary
                API).
            z_min (float): Bottom of the feature along the tool axis, in mm.
            z_max (float): Top of the feature along the tool axis, in mm.
            extended_z_min (float): The z range extended by adjacent geometry the tool passes over reaching the
                feature.
            extended_z_max (float): Highest z the tool passes over while reaching the feature, in mm.
            radial_stock_to_leave (float): Material intentionally left radially for a later operation, in mm.
            axial_stock_to_leave (float): Material intentionally left along the tool axis for a later operation, in mm.
            tolerance_band (ToleranceBand): How far a machined surface may deviate from the model, in three escalating bands
                (`0 <= ignore <= deviate <= max`).
            has_floor (bool): Whether the feature has a floor machined perpendicular to the tool axis.
            has_wall (bool): Whether the feature has a wall machined parallel to the tool axis.
            floorish_area (float): Projected area machined floor-wise (perpendicular to the tool axis).
            wallish_area (float): Area machined wall-wise (parallel to the tool axis).
            facts (BossFacts | ChamferFacts | DovetailFacts | FaceFacts | HoleFacts | PocketFacts | ProfileFacts |
                SurfaceFacts | TslotFacts | WallFacts): The per-kind facts; narrow on `facts.kind`.
    """

    feature_type: FeatureType
    z_min: float
    z_max: float
    extended_z_min: float
    extended_z_max: float
    radial_stock_to_leave: float
    axial_stock_to_leave: float
    tolerance_band: ToleranceBand
    has_floor: bool
    has_wall: bool
    floorish_area: float
    wallish_area: float
    facts: (
        BossFacts
        | ChamferFacts
        | DovetailFacts
        | FaceFacts
        | HoleFacts
        | PocketFacts
        | ProfileFacts
        | SurfaceFacts
        | TslotFacts
        | WallFacts
    )

    def to_dict(self) -> dict[str, Any]:
        from ..models.boss_facts import BossFacts
        from ..models.chamfer_facts import ChamferFacts
        from ..models.dovetail_facts import DovetailFacts
        from ..models.face_facts import FaceFacts
        from ..models.hole_facts import HoleFacts
        from ..models.pocket_facts import PocketFacts
        from ..models.profile_facts import ProfileFacts
        from ..models.surface_facts import SurfaceFacts
        from ..models.wall_facts import WallFacts

        feature_type = self.feature_type.value

        z_min = self.z_min

        z_max = self.z_max

        extended_z_min = self.extended_z_min

        extended_z_max = self.extended_z_max

        radial_stock_to_leave = self.radial_stock_to_leave

        axial_stock_to_leave = self.axial_stock_to_leave

        tolerance_band = self.tolerance_band.to_dict()

        has_floor = self.has_floor

        has_wall = self.has_wall

        floorish_area = self.floorish_area

        wallish_area = self.wallish_area

        facts: dict[str, Any]
        if isinstance(self.facts, HoleFacts):
            facts = self.facts.to_dict()
        elif isinstance(self.facts, PocketFacts):
            facts = self.facts.to_dict()
        elif isinstance(self.facts, BossFacts):
            facts = self.facts.to_dict()
        elif isinstance(self.facts, WallFacts):
            facts = self.facts.to_dict()
        elif isinstance(self.facts, FaceFacts):
            facts = self.facts.to_dict()
        elif isinstance(self.facts, SurfaceFacts):
            facts = self.facts.to_dict()
        elif isinstance(self.facts, ChamferFacts):
            facts = self.facts.to_dict()
        elif isinstance(self.facts, ProfileFacts):
            facts = self.facts.to_dict()
        elif isinstance(self.facts, DovetailFacts):
            facts = self.facts.to_dict()
        else:
            facts = self.facts.to_dict()

        field_dict: dict[str, Any] = {}

        field_dict.update(
            {
                "featureType": feature_type,
                "zMin": z_min,
                "zMax": z_max,
                "extendedZMin": extended_z_min,
                "extendedZMax": extended_z_max,
                "radialStockToLeave": radial_stock_to_leave,
                "axialStockToLeave": axial_stock_to_leave,
                "toleranceBand": tolerance_band,
                "hasFloor": has_floor,
                "hasWall": has_wall,
                "floorishArea": floorish_area,
                "wallishArea": wallish_area,
                "facts": facts,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.boss_facts import BossFacts
        from ..models.chamfer_facts import ChamferFacts
        from ..models.dovetail_facts import DovetailFacts
        from ..models.face_facts import FaceFacts
        from ..models.hole_facts import HoleFacts
        from ..models.pocket_facts import PocketFacts
        from ..models.profile_facts import ProfileFacts
        from ..models.surface_facts import SurfaceFacts
        from ..models.tolerance_band import ToleranceBand
        from ..models.tslot_facts import TslotFacts
        from ..models.wall_facts import WallFacts

        d = dict(src_dict)
        feature_type = FeatureType(d.pop("featureType"))

        z_min = d.pop("zMin")

        z_max = d.pop("zMax")

        extended_z_min = d.pop("extendedZMin")

        extended_z_max = d.pop("extendedZMax")

        radial_stock_to_leave = d.pop("radialStockToLeave")

        axial_stock_to_leave = d.pop("axialStockToLeave")

        tolerance_band = ToleranceBand.from_dict(d.pop("toleranceBand"))

        has_floor = d.pop("hasFloor")

        has_wall = d.pop("hasWall")

        floorish_area = d.pop("floorishArea")

        wallish_area = d.pop("wallishArea")

        def _parse_facts(
            data: object,
        ) -> (
            BossFacts
            | ChamferFacts
            | DovetailFacts
            | FaceFacts
            | HoleFacts
            | PocketFacts
            | ProfileFacts
            | SurfaceFacts
            | TslotFacts
            | WallFacts
        ):
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                facts_type_0 = HoleFacts.from_dict(data)

                return facts_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                facts_type_1 = PocketFacts.from_dict(data)

                return facts_type_1
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                facts_type_2 = BossFacts.from_dict(data)

                return facts_type_2
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                facts_type_3 = WallFacts.from_dict(data)

                return facts_type_3
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                facts_type_4 = FaceFacts.from_dict(data)

                return facts_type_4
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                facts_type_5 = SurfaceFacts.from_dict(data)

                return facts_type_5
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                facts_type_6 = ChamferFacts.from_dict(data)

                return facts_type_6
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                facts_type_7 = ProfileFacts.from_dict(data)

                return facts_type_7
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                facts_type_8 = DovetailFacts.from_dict(data)

                return facts_type_8
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            if not isinstance(data, dict):
                raise TypeError()
            facts_type_9 = TslotFacts.from_dict(data)

            return facts_type_9

        facts = _parse_facts(d.pop("facts"))

        feature_datasheet = cls(
            feature_type=feature_type,
            z_min=z_min,
            z_max=z_max,
            extended_z_min=extended_z_min,
            extended_z_max=extended_z_max,
            radial_stock_to_leave=radial_stock_to_leave,
            axial_stock_to_leave=axial_stock_to_leave,
            tolerance_band=tolerance_band,
            has_floor=has_floor,
            has_wall=has_wall,
            floorish_area=floorish_area,
            wallish_area=wallish_area,
            facts=facts,
        )

        return feature_datasheet
