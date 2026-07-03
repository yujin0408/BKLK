"use client";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type SignInForm = {
  email: string;
  password: string;
};

function Login() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    defaultValues: {
      email: "",
      password: "",
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

  const handleLogin = async (formData: SignInForm) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    console.log(data);
    alert("로그인 성공");
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)}>
      <Controller
        name="email"
        control={control}
        rules={{ required: "이메일을 입력해주세요." }}
        render={({ field }) => (
          <Input
            label="이메일"
            value={field.value}
            onChange={field.onChange}
            errorMessage={errors.email?.message}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        rules={{
          required: "비밀번호를 입력해주세요.",
        }}
        render={({ field }) => (
          <Input
            label="비밀번호"
            type="password"
            value={field.value}
            onChange={field.onChange}
            className="mt-4"
            errorMessage={errors.password?.message}
          />
        )}
      />
      <p className="text-right pt-2 text-sm">
        계정이 없으신가요? <Link href="/sign-up">회원가입</Link>
      </p>
      <div className="text-right mt-5">
        <Button
          fullWidth
          type="submit"
          className="min-w-40"
          disabled={isSubmitting}
        >
          로그인
        </Button>
      </div>
    </form>
  );
}

export default Login;
