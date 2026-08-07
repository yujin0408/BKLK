"use client";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

type SignUpForm = {
  email: string;
  password: string;
  passwordConfirm: string;
  nickName: string;
};

function SignUp() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      nickName: "",
    },
  });

  const getRedirectPath = () => {
    const redirect = new URLSearchParams(window.location.search).get(
      "redirect",
    );

    return redirect?.startsWith("/") && !redirect.startsWith("//")
      ? redirect
      : "/";
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace(getRedirectPath());
      }
    };

    checkSession();
  }, [router]);

  const onSubmit = async (formData: SignUpForm) => {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          nickName: formData.nickName,
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    const redirectPath = getRedirectPath();

    // 이메일 인증 OFF
    // 회원가입과 동시에 로그인 상태가 되므로 바로 원래 목적지로 이동
    if (data.session) {
      alert("회원가입이 완료되었습니다.");
      router.push(redirectPath);
      return;
    }

    // 이메일 인증 ON
    // 로그인 페이지로 이동하되 기존 redirect 값을 유지
    alert("인증 메일을 확인해주세요.");

    router.push(
      redirectPath !== "/"
        ? `/login?redirect=${encodeURIComponent(redirectPath)}`
        : "/login",
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        rules={{
          required: "이메일을 입력해주세요.",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "이메일 형식이 올바르지 않습니다.",
          },
        }}
        render={({ field }) => (
          <Input
            label="이메일"
            type="email"
            value={field.value}
            onChange={field.onChange}
            required
            errorMessage={errors.email?.message}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        rules={{
          required: "비밀번호를 입력해주세요.",
          minLength: {
            value: 8,
            message: "비밀번호는 8자 이상 입력해주세요.",
          },
        }}
        render={({ field }) => (
          <Input
            label="비밀번호"
            type="password"
            value={field.value}
            onChange={field.onChange}
            required
            className="mt-4"
            errorMessage={errors.password?.message}
          />
        )}
      />

      <Controller
        name="passwordConfirm"
        control={control}
        rules={{
          required: "비밀번호 확인을 입력해주세요.",
          validate: (value) =>
            value === watch("password") || "비밀번호가 일치하지 않습니다.",
        }}
        render={({ field }) => (
          <Input
            label="비밀번호 확인"
            type="password"
            value={field.value}
            onChange={field.onChange}
            required
            className="mt-4"
            errorMessage={errors.passwordConfirm?.message}
          />
        )}
      />

      <Controller
        name="nickName"
        control={control}
        rules={{
          required: "닉네임을 입력해주세요.",
        }}
        render={({ field }) => (
          <Input
            label="닉네임"
            value={field.value}
            onChange={field.onChange}
            required
            className="mt-4"
            errorMessage={errors.nickName?.message}
          />
        )}
      />

      <div className="mt-4 text-right">
        <Button
          fullWidth
          className="min-w-40"
          type="submit"
          disabled={isSubmitting}
        >
          회원가입
        </Button>
      </div>
    </form>
  );
}

export default SignUp;
