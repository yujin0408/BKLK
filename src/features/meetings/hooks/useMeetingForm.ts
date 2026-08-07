import { useState } from "react";
import {
  INITIAL_MEETING_FORM_VALUES,
  MeetingFormValues,
  SelectedLocation,
} from "../types";
import { SelectedBook } from "@/features/books/types";

export default function useMeetingForm() {
  const [values, setValues] = useState<MeetingFormValues>(
    INITIAL_MEETING_FORM_VALUES,
  );
  const [selectedBook, setSelectedBook] = useState<SelectedBook | null>(null);
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
