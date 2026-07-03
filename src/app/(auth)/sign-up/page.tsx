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

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/");
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

    // 이메일 인증 OFF면 session이 있음 → 바로 로그인 상태
    if (data.session) {
      alert("회원가입이 완료되었습니다.");
      router.push("/");
      return;
    }

    // 이메일 인증 ON이면 session이 없음
    alert("인증 메일을 확인해주세요.");
    router.push("/login");
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

      <div className="text-right mt-4">
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
