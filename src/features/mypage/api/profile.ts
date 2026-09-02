import type { MyPageProfile } from "@/features/mypage/types";

interface ProfileResponse {
  profile?: MyPageProfile;
  message?: string;
}

async function updateProfile(formData: FormData): Promise<MyPageProfile> {
  const response = await fetch("/api/mypage/profile", {
    method: "PATCH",
    body: formData,
  });
  const data = (await response.json()) as ProfileResponse;

  if (!response.ok || !data.profile) {
    throw new Error(data.message ?? "프로필을 수정하지 못했습니다.");
  }

  return data.profile;
}

export function updateNickname(nickname: string): Promise<MyPageProfile> {
  const formData = new FormData();
  formData.set("nickname", nickname);
  return updateProfile(formData);
}

export function updateDescription(description: string): Promise<MyPageProfile> {
  const formData = new FormData();
  formData.set("description", description);
  return updateProfile(formData);
}

export function updateProfileImage(image: File): Promise<MyPageProfile> {
  const formData = new FormData();
  formData.set("image", image);
  return updateProfile(formData);
}
