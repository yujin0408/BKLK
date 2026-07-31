import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import FormSection from "@/components/layout/FormSection";

interface Props {
  address: string;
  detailAddress: string;
  onDetailAddressChange: (value: string) => void;
  onSearch: () => void;
}

export default function MeetingLocationFields({
  address,
  detailAddress,
  onDetailAddressChange,
  onSearch,
}: Props) {
  return (
    <FormSection label="모임 장소" required>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Input value={address} placeholder="주소를 검색해주세요" readOnly />

          <Button type="button" variant="outline" size="sm" onClick={onSearch}>
            주소 검색
          </Button>
        </div>

        <Input
          value={detailAddress}
          onChange={onDetailAddressChange}
          placeholder="상세 주소를 입력해주세요"
        />
      </div>
    </FormSection>
  );
}
