"use client";

import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";
import { Camera, Pencil } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import {
  updateDescription,
  updateNickname,
  updateProfileImage,
} from "@/features/mypage/api/profile";
import type { MyPageProfile } from "@/features/mypage/types";

interface Props {
  initialProfile: MyPageProfile;
}

export default function ProfileEditor({ initialProfile }: Props) {
  const [profile, setProfile] = useState(initialProfile);
  const [nickname, setNickname] = useState(initialProfile.nickname);
  const [description, setDescription] = useState(initialProfile.description ?? "");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [pendingField, setPendingField] = useState<"nickname" | "description" | "image" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveNickname = async () => {
    if (!nickname.trim()) {
      setErrorMessage("닉네임을 입력해주세요.");
      return;
    }

    setPendingField("nickname");
    setErrorMessage(null);
    try {
      const updated = await updateNickname(nickname);
      setProfile(updated);
      setNickname(updated.nickname);
      setIsEditingNickname(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "닉네임을 수정하지 못했습니다.");
    } finally {
      setPendingField(null);
    }
  };

  const saveDescription = async () => {
    setPendingField("description");
    setErrorMessage(null);
    try {
      const updated = await updateDescription(description);
      setProfile(updated);
      setDescription(updated.description ?? "");
      setIsEditingDescription(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "소개를 수정하지 못했습니다.");
    } finally {
      setPendingField(null);
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    event.target.value = "";
    if (!image) return;

    setPendingField("image");
    setErrorMessage(null);
    try {
      const updated = await updateProfileImage(image);
      setProfile(updated);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "프로필 이미지를 수정하지 못했습니다.");
    } finally {
      setPendingField(null);
    }
  };

  return (
    <section aria-labelledby="profile-heading" className="rounded-2xl border border-line-200 bg-white p-6 sm:p-8">
      <h1 id="profile-heading" className="text-2xl font-bold text-black-800">프로필</h1>

      <div className="mt-7 flex flex-col gap-7 sm:flex-row sm:items-start">
        <div className="mx-auto shrink-0 sm:mx-0">
          <button
            type="button"
            aria-label="프로필 이미지 변경"
            disabled={pendingField !== null}
            onClick={() => fileInputRef.current?.click()}
            className="group relative block size-30 overflow-hidden rounded-full bg-blue-200 disabled:cursor-wait sm:size-34"
          >
            <Image
              src={profile.profileImageUrl || "/profile.jpg"}
              alt="프로필 이미지"
              fill
              sizes="136px"
              className="object-cover transition-opacity group-hover:opacity-75"
            />
            <span className="absolute bottom-1 right-1 flex size-9 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">
              <Camera className="size-4 text-black-600" aria-hidden="true" />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleImageChange}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          <div>
            <p className="mb-2 text-sm font-semibold text-black-500">닉네임</p>
            <div className="flex items-center gap-2">
              {isEditingNickname ? (
                <Input
                  value={nickname}
                  onChange={setNickname}
                  maxLength={30}
                  disabled={pendingField !== null}
                  aria-label="닉네임"
                  className="flex-1"
                  inputClassName="h-10"
                />
              ) : (
                <p className="min-w-0 flex-1 truncate text-xl font-semibold text-black-800">{profile.nickname}</p>
              )}
              <Button
                type="button"
                size="sm"
                variant={isEditingNickname ? "solid" : "outline"}
                disabled={pendingField !== null}
                onClick={() => (isEditingNickname ? void saveNickname() : setIsEditingNickname(true))}
                leftIcon={!isEditingNickname ? <Pencil className="size-3.5" aria-hidden="true" /> : undefined}
              >
                {isEditingNickname ? (pendingField === "nickname" ? "저장 중" : "저장") : "편집"}
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-black-500">소개</p>
              <Button
                type="button"
                size="sm"
                variant={isEditingDescription ? "solid" : "outline"}
                disabled={pendingField !== null}
                onClick={() => (isEditingDescription ? void saveDescription() : setIsEditingDescription(true))}
              >
                {isEditingDescription ? (pendingField === "description" ? "저장 중" : "저장") : "수정"}
              </Button>
            </div>
            {isEditingDescription ? (
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={pendingField !== null}
                maxLength={500}
                aria-label="소개"
                className="min-h-28 w-full resize-y rounded-md border border-gray-100 px-4 py-3 text-md outline-none transition-colors focus:border-active disabled:bg-gray-100"
              />
            ) : (
              <p className="min-h-20 whitespace-pre-wrap rounded-lg bg-bg-blue px-4 py-3 text-md leading-6 text-black-500">
                {profile.description || "작성된 소개가 없습니다."}
              </p>
            )}
          </div>

          {errorMessage && <p role="alert" className="text-sm font-medium text-error">{errorMessage}</p>}
        </div>
      </div>
    </section>
  );
}
