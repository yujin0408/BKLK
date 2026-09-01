import { useState } from "react";
import {
  INITIAL_MEETING_FORM_VALUES,
  MeetingFormInitialData,
  MeetingFormValues,
  SelectedLocation,
} from "../types";
import { SelectedBook } from "@/features/books/types";

export default function useMeetingForm(
  initialData?: MeetingFormInitialData,
  initialBook?: SelectedBook | null,
) {
  const [values, setValues] = useState<MeetingFormValues>(() => {
    if (!initialData) {
      return INITIAL_MEETING_FORM_VALUES;
    }

    const { year, month, day } = initialData.meetingDateParts;

    return {
      ...initialData.values,
      meetingDate: new Date(year, month - 1, day),
    };
  });

  const [selectedBook, setSelectedBook] = useState<SelectedBook | null>(
    () => initialData?.selectedBook ?? initialBook ?? null,
  );

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const updateField = <K extends keyof MeetingFormValues>(
    key: K,
    value: MeetingFormValues[K],
  ) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const selectLocation = (location: SelectedLocation) => {
    setValues((previous) => ({
      ...previous,
      address: location.address,
      region1DepthName: location.region1DepthName,
      region2DepthName: location.region2DepthName,
      longitude: location.longitude,
      latitude: location.latitude,
      detailAddress: "",
    }));
  };

  return {
    values,
    selectedBook,
    thumbnailFile,
    updateField,
    setSelectedBook,
    setThumbnailFile,
    selectLocation,
  };
}
