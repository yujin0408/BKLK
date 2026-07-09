"use client";

import { REGIONS } from "@/constants/regions";
import type { RegionFilterValue } from "@/types/region";
import Dropdown from "../common/Dropdown";

type Props = {
  value: RegionFilterValue;
  onChange: (value: RegionFilterValue) => void;
};

export default function RegionFilter({ value, onChange }: Props) {
  const region1Options = [
    { label: "전체", value: "전체" },
    ...REGIONS.map((region) => ({
      label: region.region_1depth_name,
      value: region.region_1depth_name,
    })),
  ];

  const isAllRegion =
    !value.region_1depth_name || value.region_1depth_name === "전체";

  const selectedRegion = REGIONS.find(
    (region) => region.region_1depth_name === value.region_1depth_name,
  );

  const region2Options = isAllRegion
    ? [{ label: "전체", value: "전체" }]
    : (selectedRegion?.region_2depth_names.map((region2) => ({
        label: region2,
        value: region2,
      })) ?? []);

  return (
    <div className="flex gap-2">
      <Dropdown
        value={value.region_1depth_name}
        options={region1Options}
        placeholder="지역 선택"
        onChange={(region1) => {
          onChange({
            region_1depth_name: region1,
            region_2depth_name: "전체",
          });
        }}
      />

      <Dropdown
        value={value.region_2depth_name}
        options={region2Options}
        placeholder="구 선택"
        disabled={isAllRegion}
        onChange={(region2) => {
          onChange({
            ...value,
            region_2depth_name: region2,
          });
        }}
      />
    </div>
  );
}
