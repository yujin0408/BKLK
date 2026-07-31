import CharacterCount from "@/components/common/CharacterCount";
import Input from "@/components/common/Input";
import FormSection from "@/components/layout/FormSection";
import { MeetingFormValues } from "@/features/meetings/types";

interface Props {
  title: string;
  description: string;
  updateField: <K extends keyof MeetingFormValues>(
    key: K,
    value: MeetingFormValues[K],
  ) => void;
}

export default function MeetingInfoFields({
  title,
  description,
  updateField,
}: Props) {
  return (
    <>
      <FormSection label="모임 제목" required>
        <Input
          value={title}
          onChange={(value) => updateField("title", value)}
          placeholder="모임 제목을 입력해주세요"
          maxLength={50}
        />

        <CharacterCount current={title.length} max={50} />
      </FormSection>

      <FormSection label="모임 설명" required>
        <textarea
          value={description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="어떤 모임인지 자세히 소개해주세요"
          maxLength={1000}
          className="
            min-h-48 w-full resize-none rounded-xl border
            border-line-100 px-4 py-3 text-base text-black-900
            outline-none transition-colors placeholder:text-gray-300
            focus:border-active
          "
        />

        <CharacterCount current={description.length} max={1000} />
      </FormSection>
    </>
  );
}
