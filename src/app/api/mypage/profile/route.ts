import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { MyPageProfile } from "@/features/mypage/types";

const PROFILE_IMAGE_BUCKET = "profile-images";
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface UserRow {
  id: string;
  nickname: string;
  profile_image_url: string | null;
  description: string | null;
}

function getImageExtension(file: File): string {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  throw new Error("지원하지 않는 이미지 형식입니다.");
}

function getOwnedStoragePath(url: string | null, userId: string): string | null {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${PROFILE_IMAGE_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex < 0) return null;

  const path = decodeURIComponent(url.slice(markerIndex + marker.length));
  return path.startsWith(`${userId}/profile/`) ? path : null;
}

function mapProfile(row: UserRow): MyPageProfile {
  return {
    id: row.id,
    nickname: row.nickname,
    profileImageUrl: row.profile_image_url,
    description: row.description,
  };
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  let uploadedPath: string | null = null;

  try {
    const formData = await request.formData();
    const nicknameValue = formData.get("nickname");
    const descriptionValue = formData.get("description");
    const imageValue = formData.get("image");
    const image = imageValue instanceof File && imageValue.size > 0 ? imageValue : null;

    const updates: {
      nickname?: string;
      description?: string | null;
      profile_image_url?: string;
      updated_at: string;
    } = { updated_at: new Date().toISOString() };

    if (typeof nicknameValue === "string") {
      const nickname = nicknameValue.trim();
      if (!nickname) {
        return NextResponse.json({ message: "닉네임을 입력해주세요." }, { status: 400 });
      }
      updates.nickname = nickname;
    }

    if (typeof descriptionValue === "string") {
      updates.description = descriptionValue.trim() || null;
    }

    if (image) {
      if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
        return NextResponse.json(
          { message: "프로필 이미지는 JPG, PNG, WEBP만 등록할 수 있습니다." },
          { status: 400 },
        );
      }
      if (image.size > MAX_PROFILE_IMAGE_SIZE) {
        return NextResponse.json(
          { message: "프로필 이미지는 5MB 이하만 등록할 수 있습니다." },
          { status: 400 },
        );
      }

      uploadedPath = `${user.id}/profile/${crypto.randomUUID()}.${getImageExtension(image)}`;
      const { error: uploadError } = await supabase.storage
        .from(PROFILE_IMAGE_BUCKET)
        .upload(uploadedPath, image, {
          contentType: image.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("프로필 이미지 업로드 실패", uploadError);
        return NextResponse.json(
          { message: "프로필 이미지 업로드에 실패했습니다." },
          { status: 500 },
        );
      }

      const { data } = supabase.storage
        .from(PROFILE_IMAGE_BUCKET)
        .getPublicUrl(uploadedPath);
      updates.profile_image_url = data.publicUrl;
    }

    if (
      updates.nickname === undefined &&
      updates.description === undefined &&
      updates.profile_image_url === undefined
    ) {
      return NextResponse.json({ message: "수정할 정보가 없습니다." }, { status: 400 });
    }

    const { data: previousUser } = await supabase
      .from("users")
      .select("profile_image_url")
      .eq("id", user.id)
      .maybeSingle();

    const { data, error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select("id, nickname, profile_image_url, description")
      .returns<UserRow[]>()
      .single();

    if (updateError) {
      console.error("프로필 수정 실패", updateError);
      if (uploadedPath) await supabase.storage.from(PROFILE_IMAGE_BUCKET).remove([uploadedPath]);
      return NextResponse.json({ message: "프로필을 수정하지 못했습니다." }, { status: 500 });
    }

    const previousPath = getOwnedStoragePath(previousUser?.profile_image_url ?? null, user.id);
    if (uploadedPath && previousPath && previousPath !== uploadedPath) {
      const { error: removeError } = await supabase.storage
        .from(PROFILE_IMAGE_BUCKET)
        .remove([previousPath]);
      if (removeError) console.error("이전 프로필 이미지 정리 실패", removeError);
    }

    return NextResponse.json({ profile: mapProfile(data) });
  } catch (error) {
    console.error("프로필 수정 처리 실패", error);
    if (uploadedPath) await supabase.storage.from(PROFILE_IMAGE_BUCKET).remove([uploadedPath]);
    return NextResponse.json({ message: "프로필 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}
