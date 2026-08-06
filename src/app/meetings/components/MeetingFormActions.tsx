"use client";

import Button from "@/components/common/Button";

interface MeetingFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function MeetingFormActions({
  isSubmitting,
  onCancel,
}: MeetingFormActionsProps) {
  return (
    <div className="mt-12 flex justify-end gap-3 border-t border-gray-100 pt-8">
      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting}
        onClick={onCancel}
      >
        취소
      </Button>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "등록 중..." : "모임 등록하기"}
      </Button>
    </div>
  );
}
