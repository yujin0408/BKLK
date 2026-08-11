import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  MAX_CAPACITY,
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_CAPACITY,
  MIN_DESCRIPTION_LENGTH,
  MIN_TITLE_LENGTH,
} from "@/constants/meetings";

const THUMBNAIL_BUCKET = "meeting-thumbnails";
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;

const ALLOWED_THUMBNAIL_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface MeetingUpdatePayload {
  book_id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  meeting_at: string;
  capacity: number;
  address: string;
  detail_address: string | null;
  region_1depth_name: string;
  region_2depth_name: string;
  longitude: number;
  latitude: number;
  updated_at: string;
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getThumbnailExtension(file: File): string {
  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      throw new Error("지원하지 않는 이미지 형식입니다.");
  }
}

function getStoragePath(publicUrl: string | null): string | null {
  if (!publicUrl) return null;

  const marker = `/storage/v1/object/public/${THUMBNAIL_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(
    publicUrl.slice(markerIndex + marker.length).split("?")[0],
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id: meetingId } = await context.params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  let uploadedThumbnailPath: string | null = null;

  try {
    const { data: existingMeeting, error: meetingError } = await supabase
      .from("meetings")
      .select(
        `
          id,
          host_user_id,
          thumbnail_url,
          meeting_at,
          current_participants
        `,
      )
      .eq("id", meetingId)
      .is("deleted_at", null)
      .maybeSingle();

    if (meetingError) {
      console.error("수정할 모임 조회 실패", meetingError);

      return NextResponse.json(
        { message: "모임 정보를 확인하지 못했습니다." },
        { status: 500 },
      );
    }

    if (!existingMeeting) {
      return NextResponse.json(
        { message: "모임을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (existingMeeting.host_user_id !== user.id) {
      return NextResponse.json(
        { message: "모임을 수정할 권한이 없습니다." },
        { status: 403 },
      );
    }

    const formData = await request.formData();

    const bookId = getString(formData, "bookId");
    const title = getString(formData, "title");
    const description = getString(formData, "description");
    const meetingAt = getString(formData, "meetingAt");
    const capacityValue = getString(formData, "capacity");
    const address = getString(formData, "address");
    const detailAddress = getString(formData, "detailAddress");
    const region1DepthName = getString(formData, "region1DepthName");
    const region2DepthName = getString(formData, "region2DepthName");
    const longitudeValue = getString(formData, "longitude");
    const latitudeValue = getString(formData, "latitude");
    const removeThumbnail = getString(formData, "removeThumbnail") === "true";

    const thumbnailValue = formData.get("thumbnail");
    const thumbnail =
      thumbnailValue instanceof File && thumbnailValue.size > 0
        ? thumbnailValue
        : null;

    if (!bookId) {
      return NextResponse.json(
        { message: "함께 읽을 책을 선택해주세요." },
        { status: 400 },
      );
    }

    if (title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        {
          message: `모임 제목은 ${MIN_TITLE_LENGTH}자 이상 ${MAX_TITLE_LENGTH}자 이하로 입력해주세요.`,
        },
        { status: 400 },
      );
    }

    if (
      description.length < MIN_DESCRIPTION_LENGTH ||
      description.length > MAX_DESCRIPTION_LENGTH
    ) {
      return NextResponse.json(
        {
          message: `모임 소개는 ${MIN_DESCRIPTION_LENGTH}자 이상 ${MAX_DESCRIPTION_LENGTH}자 이하로 입력해주세요.`,
        },
        { status: 400 },
      );
    }

    const meetingDate = new Date(meetingAt);
    const meetingAtTimestamp = meetingDate.getTime();
    const existingMeetingAtTimestamp = new Date(
      existingMeeting.meeting_at,
    ).getTime();
    const isUnchangedMeetingAt =
      !Number.isNaN(existingMeetingAtTimestamp) &&
      meetingAtTimestamp === existingMeetingAtTimestamp;

    if (
      !meetingAt ||
      Number.isNaN(meetingAtTimestamp) ||
      (!isUnchangedMeetingAt && meetingAtTimestamp <= Date.now())
    ) {
      return NextResponse.json(
        { message: "모임 날짜와 시간을 확인해주세요." },
        { status: 400 },
      );
    }

    const capacity = Number(capacityValue);

    if (
      !Number.isInteger(capacity) ||
      capacity < MIN_CAPACITY ||
      capacity > MAX_CAPACITY
    ) {
      return NextResponse.json(
        {
          message: `모집 인원은 ${MIN_CAPACITY}명 이상 ${MAX_CAPACITY}명 이하로 입력해주세요.`,
        },
        { status: 400 },
      );
    }

    if (capacity < existingMeeting.current_participants) {
      return NextResponse.json(
        {
          message: `모집 인원은 현재 참여 인원인 ${existingMeeting.current_participants}명보다 적게 설정할 수 없습니다.`,
        },
        { status: 400 },
      );
    }

    if (!address || !region1DepthName || !region2DepthName) {
      return NextResponse.json(
        { message: "모임 장소를 다시 선택해주세요." },
        { status: 400 },
      );
    }

    if (!longitudeValue || !latitudeValue) {
      return NextResponse.json(
        { message: "장소 좌표가 필요합니다." },
        { status: 400 },
      );
    }

    const longitude = Number(longitudeValue);
    const latitude = Number(latitudeValue);

    if (
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      return NextResponse.json(
        { message: "장소 좌표가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    if (detailAddress.length > 100) {
      return NextResponse.json(
        { message: "상세 주소는 100자 이하로 입력해주세요." },
        { status: 400 },
      );
    }

    if (thumbnail) {
      if (!ALLOWED_THUMBNAIL_TYPES.has(thumbnail.type)) {
        return NextResponse.json(
          {
            message: "대표 이미지는 JPG, PNG, WEBP만 등록할 수 있습니다.",
          },
          { status: 400 },
        );
      }

      if (thumbnail.size > MAX_THUMBNAIL_SIZE) {
        return NextResponse.json(
          {
            message: "대표 이미지는 5MB 이하만 등록할 수 있습니다.",
          },
          { status: 400 },
        );
      }
    }

    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("id")
      .eq("id", bookId)
      .maybeSingle();

    if (bookError) {
      console.error("도서 조회 실패", bookError);

      return NextResponse.json(
        { message: "선택한 도서 정보를 확인하지 못했습니다." },
        { status: 500 },
      );
    }

    if (!book) {
      return NextResponse.json(
        { message: "선택한 도서가 존재하지 않습니다." },
        { status: 400 },
      );
    }

    let nextThumbnailUrl = existingMeeting.thumbnail_url;

    if (thumbnail) {
      const extension = getThumbnailExtension(thumbnail);
      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(THUMBNAIL_BUCKET)
        .upload(filePath, thumbnail, {
          contentType: thumbnail.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("수정 이미지 업로드 실패", uploadError);

        return NextResponse.json(
          { message: "대표 이미지 업로드에 실패했습니다." },
          { status: 500 },
        );
      }

      uploadedThumbnailPath = filePath;

      const {
        data: { publicUrl },
      } = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(filePath);

      nextThumbnailUrl = publicUrl;
    } else if (removeThumbnail) {
      nextThumbnailUrl = null;
    }

    const updatePayload: MeetingUpdatePayload = {
      book_id: bookId,
      title,
      description,
      thumbnail_url: nextThumbnailUrl,
      meeting_at: meetingDate.toISOString(),
      capacity,
      address,
      detail_address: detailAddress || null,
      region_1depth_name: region1DepthName,
      region_2depth_name: region2DepthName,
      longitude,
      latitude,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedMeeting, error: updateError } = await supabase
      .from("meetings")
      .update(updatePayload)
      .eq("id", meetingId)
      .eq("host_user_id", user.id)
      .is("deleted_at", null)
      .lte("current_participants", capacity)
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("모임 수정 실패", updateError);

      if (uploadedThumbnailPath) {
        const { error: removeError } = await supabase.storage
          .from(THUMBNAIL_BUCKET)
          .remove([uploadedThumbnailPath]);

        if (removeError) {
          console.error("수정 실패 후 새 이미지 정리 실패", removeError);
        }
      }

      return NextResponse.json(
        { message: "모임 수정에 실패했습니다." },
        { status: 500 },
      );
    }

    if (!updatedMeeting) {
      if (uploadedThumbnailPath) {
        const { error: removeError } = await supabase.storage
          .from(THUMBNAIL_BUCKET)
          .remove([uploadedThumbnailPath]);

        if (removeError) {
          console.error("수정 충돌 후 새 이미지 정리 실패", removeError);
        }
      }

      return NextResponse.json(
        {
          message: "모임 정보가 변경되었습니다. 새로고침 후 다시 시도해주세요.",
        },
        { status: 409 },
      );
    }

    const oldThumbnailPath = getStoragePath(existingMeeting.thumbnail_url);

    const shouldRemoveOldThumbnail =
      oldThumbnailPath !== null && (thumbnail !== null || removeThumbnail);

    if (shouldRemoveOldThumbnail) {
      const { error: removeError } = await supabase.storage
        .from(THUMBNAIL_BUCKET)
        .remove([oldThumbnailPath]);

      // DB 수정은 이미 완료됐으므로 사용자 요청 자체를 실패시키지는 않습니다.
      if (removeError) {
        console.error("기존 대표 이미지 정리 실패", removeError);
      }
    }

    return NextResponse.json({
      id: updatedMeeting.id,
    });
  } catch (error) {
    console.error("모임 수정 처리 중 오류가 발생했습니다.", error);

    if (uploadedThumbnailPath) {
      const { error: removeError } = await supabase.storage
        .from(THUMBNAIL_BUCKET)
        .remove([uploadedThumbnailPath]);

      if (removeError) {
        console.error("오류 발생 후 새 이미지 정리 실패", removeError);
      }
    }

    return NextResponse.json(
      { message: "모임 수정 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
