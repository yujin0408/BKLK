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
  const [signUpHref, setSignUpHref] = useState("/signup");

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

  const getRedirectPath = () => {
    const redirect = new URLSearchParams(window.location.search).get(
      "redirect",
    );

    return redirect?.startsWith("/") && !redirect.startsWith("//")
      ? redirect
      : "/";
  };

  useEffect(() => {
    const redirectPath = getRedirectPath();

    if (redirectPath !== "/") {
      setSignUpHref(`/signup?redirect=${encodeURIComponent(redirectPath)}`);
    }

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace(redirectPath);
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (formData: SignInForm) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("로그인 성공");
    router.push(getRedirectPath());
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)}>
      <Controller
        name="email"
        control={control}
        rules={{
          required: "이메일을 입력해주세요.",
        }}
        render={({ field }) => (
          <Input
            label="이메일"
            type="email"
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

      <p className="pt-2 text-right text-sm">
        계정이 없으신가요? <Link href={signUpHref}>회원가입</Link>
      </p>

      <div className="mt-5 text-right">
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
