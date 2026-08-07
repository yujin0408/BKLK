import DatePicker from "@/components/common/Datepicker";
import Input from "@/components/common/Input";
import FormSection from "@/components/layout/FormSection";
import { MAX_CAPACITY, MIN_CAPACITY } from "@/constants/meetings";
import { MeetingFormValues } from "@/features/meetings/types";

interface MeetingScheduleErrors {
  meetingDate?: string;
  meetingTime?: string;
  capacity?: string;
}
interface Props {
  values: Pick<MeetingFormValues, "meetingDate" | "meetingTime" | "capacity">;
  errors?: MeetingScheduleErrors;
  updateField: <K extends keyof MeetingFormValues>(
    key: K,
    value: MeetingFormValues[K],
  ) => void;
}

export default function MeetingScheduleFields({
  values,
  updateField,
  errors,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <FormSection label="모임 날짜" required>
        <DatePicker
          value={values.meetingDate}
          onChange={(date) => updateField("meetingDate", date)}
          inputClassName="w-full"
          className="w-full"
        />
        {errors?.meetingDate && (
          <p role="alert" className="mt-1 text-sm text-error">
            {errors.meetingDate}
          </p>
        )}
      </FormSection>

      <FormSection label="모임 시간" required>
        <Input
          type="time"
          value={values.meetingTime}
          onChange={(value) => updateField("meetingTime", value)}
          onClick={(event) => event.currentTarget.showPicker()}
        />
        {errors?.meetingTime && (
          <p role="alert" className="mt-1 text-sm text-error">
            {errors.meetingTime}
          </p>
        )}
      </FormSection>

      <FormSection label="모집 인원" required>
        <div className="relative">
          <Input
            type="number"
            min={MIN_CAPACITY}
            max={MAX_CAPACITY}
            value={values.capacity}
            onChange={(value) => updateField("capacity", value)}
            placeholder="2"
          />

          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-gray-500">
            명
          </span>
        </div>
        {errors?.capacity && (
          <p role="alert" className="mt-1 text-sm text-error">
            {errors.capacity}
          </p>
        )}
      </FormSection>
    </div>
  );
}
